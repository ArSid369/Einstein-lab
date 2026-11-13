import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Check,
  CheckCircle2,
  Play,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CodingTask, DifficultyLevel, TestCase } from '../../types/newtonlab';
import { CodeEditor } from '../../components/shared/CodeEditor';
import { DifficultyText, PageHeader, StatusLabel } from '../../components/shared/UiPrimitives';

interface AiProposal {
  id: string;
  field: string;
  title: string;
  rationale: string;
  proposedText?: string;
  proposedHints?: string[];
  proposedTestCases?: Array<{
    name: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
}

interface TestRunOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  durationMs: number;
  testResults: Array<{
    id: string;
    name: string;
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;
    isHidden: boolean;
    error?: string;
  }>;
}

export const SmeTaskEditorPage: React.FC = () => {
  const { taskId } = useParams();
  const { domains, modules, tasks, saveTask, createTask } = useApp();

  const [selectedDomainId, setSelectedDomainId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTask, setActiveTask] = useState<CodingTask>(() => {
    return tasks.find((t) => t.id === taskId) || tasks[0];
  });

  useEffect(() => {
    if (taskId) {
      const found = tasks.find((t) => t.id === taskId);
      if (found) setActiveTask(found);
    }
  }, [taskId, tasks]);

  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [testRunning, setTestRunning] = useState(false);
  const [testRunOutput, setTestRunOutput] = useState<TestRunOutput | null>(null);

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiProposals, setAiProposals] = useState<AiProposal[]>([]);
  const [aiSource, setAiSource] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) => {
    const matchDomain = selectedDomainId === 'ALL' || t.domainId === selectedDomainId;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDomain && matchSearch;
  });

  const handleSaveTask = (status: 'Draft' | 'Published') => {
    const next = { ...activeTask, status, updatedAt: '2026-11-12' };
    setActiveTask(next);
    saveTask(next);
    setSaveFeedback(status === 'Published' ? 'Task published to learner workspace' : 'Draft saved');
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  const handleRunTests = async () => {
    setTestRunning(true);
    try {
      const res = await fetch('/api/execute-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeTask.starterCode,
          testCases: activeTask.testCases,
        }),
      });
      const data = await res.json();
      setTestRunOutput(data);
    } catch {
      setTestRunOutput({
        success: false,
        stdout: '',
        stderr: 'Could not reach execution server.',
        durationMs: 0,
        testResults: [],
      });
    } finally {
      setTestRunning(false);
    }
  };

  const triggerAiAssist = async (action: string, customPrompt?: string) => {
    setAiLoading(true);
    setAiProposals([]);
    setAiSummary(null);
    try {
      const res = await fetch('/api/ai/task-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          prompt: customPrompt ?? aiPrompt,
          task: activeTask,
        }),
      });
      const data = await res.json();
      setAiSource(data.source || 'gemini');
      setAiSummary(data.summary || 'Proposed improvements ready for review.');
      setAiProposals(Array.isArray(data.proposals) ? data.proposals : []);
    } catch {
      setAiSummary('Unable to reach AI assistant endpoint.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyProposal = (proposal: AiProposal) => {
    setActiveTask((prev) => {
      if (proposal.field === 'problemStatement' && proposal.proposedText) {
        return { ...prev, problemStatement: proposal.proposedText };
      }
      if (proposal.field === 'instructions' && proposal.proposedText) {
        return { ...prev, instructions: proposal.proposedText };
      }
      if (proposal.field === 'difficulty' && proposal.proposedText) {
        return { ...prev, difficulty: proposal.proposedText as DifficultyLevel };
      }
      if (proposal.field === 'starterCode' && proposal.proposedText) {
        return { ...prev, starterCode: proposal.proposedText };
      }
      if (proposal.field === 'expectedOutput' && proposal.proposedText) {
        return { ...prev, expectedOutput: proposal.proposedText };
      }
      if (proposal.field === 'hints' && proposal.proposedHints) {
        return { ...prev, hints: proposal.proposedHints };
      }
      if (proposal.field === 'testCases' && proposal.proposedTestCases) {
        const added: TestCase[] = proposal.proposedTestCases.map((tc, i) => ({
          id: `tc-ai-${Date.now()}-${i}`,
          name: tc.name,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: Boolean(tc.isHidden),
        }));
        return { ...prev, testCases: [...prev.testCases, ...added] };
      }
      return prev;
    });
    setAiProposals((prev) => prev.filter((p) => p.id !== proposal.id));
  };

  const addManualTestCase = () => {
    setActiveTask((prev) => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        {
          id: `tc-${Date.now()}`,
          name: `Test Case ${prev.testCases.length + 1}`,
          input: 'print("OK")',
          expectedOutput: 'OK',
          isHidden: false,
        },
      ],
    }));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Task Management & AI-Assisted Editor"
        description="Author Python robotics tasks, validate automated test suites, and collaborate with the contextual AI assistant."
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {saveFeedback && (
              <span className="text-xs font-medium text-[#16A34A] dark:text-emerald-400 mr-2">{saveFeedback}</span>
            )}
            <button
              type="button"
              onClick={handleRunTests}
              disabled={testRunning}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#111827] dark:text-slate-100 whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400" />
              <span>{testRunning ? 'Running...' : 'Run Tests'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveTask('Draft')}
              className="px-3.5 py-2 rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#111827] dark:text-slate-100 whitespace-nowrap"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSaveTask('Published')}
              className="px-4 py-2 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold whitespace-nowrap"
            >
              Publish Task
            </button>
          </div>
        }
      />

      {/* 3-Column SME Task Editor Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Panel: Task Navigator */}
        <div className="xl:col-span-3 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] overflow-hidden">
          <div className="p-3.5 border-b border-[#E2E8F0] dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#111827] dark:text-slate-100">Curriculum Tasks</span>
              <button
                type="button"
                onClick={() => {
                  const targetDomain = selectedDomainId === 'ALL' ? domains[0].id : selectedDomainId;
                  const targetModule = modules.find((m) => m.domainId === targetDomain)?.id || modules[0].id;
                  const created = createTask(targetModule, targetDomain);
                  setActiveTask(created);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#37852d] dark:text-[#84E179] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            <select
              aria-label="Filter tasks by domain"
              value={selectedDomainId}
              onChange={(e) => setSelectedDomainId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
            >
              <option value="ALL">All Domains</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter tasks..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
          </div>

          <ul className="divide-y divide-[#E2E8F0] dark:divide-slate-800 max-h-[680px] overflow-y-auto">
            {filteredTasks.map((t, idx) => {
              const selected = t.id === activeTask.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTask(t);
                      setTestRunOutput(null);
                      setAiProposals([]);
                      setAiSummary(null);
                    }}
                    className={`w-full text-left p-3.5 transition-colors ${
                      selected
                        ? 'bg-[#EBF7E9]/80 dark:bg-[#53b947]/15'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-mono tabular-nums">Task {idx + 1}</span>
                      <StatusLabel status={t.status} />
                    </div>
                    <div className="mt-1 text-xs font-semibold text-[#111827] dark:text-slate-100 leading-snug">
                      {t.title}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{t.taskType}</span>
                      <span>·</span>
                      <DifficultyText level={t.difficulty} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Center Panel: Main Task Editor */}
        <div className="xl:col-span-5 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Task Title</label>
              <input
                type="text"
                value={activeTask.title}
                onChange={(e) => setActiveTask({ ...activeTask, title: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Difficulty</label>
              <select
                value={activeTask.difficulty}
                onChange={(e) =>
                  setActiveTask({ ...activeTask, difficulty: e.target.value as DifficultyLevel })
                }
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Problem Statement</label>
            <textarea
              rows={3}
              value={activeTask.problemStatement}
              onChange={(e) => setActiveTask({ ...activeTask, problemStatement: e.target.value })}
              className="w-full px-3 py-2 text-xs leading-relaxed rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Instructions</label>
            <textarea
              rows={3}
              value={activeTask.instructions}
              onChange={(e) => setActiveTask({ ...activeTask, instructions: e.target.value })}
              className="w-full px-3 py-2 text-xs leading-relaxed rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Learning Objectives (1 per line)
              </label>
              <textarea
                rows={2}
                value={activeTask.learningObjectives.join('\n')}
                onChange={(e) =>
                  setActiveTask({
                    ...activeTask,
                    learningObjectives: e.target.value.split('\n').filter(Boolean),
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Requirements & Constraints
              </label>
              <textarea
                rows={2}
                value={activeTask.requirements.join('\n')}
                onChange={(e) =>
                  setActiveTask({
                    ...activeTask,
                    requirements: e.target.value.split('\n').filter(Boolean),
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
              />
            </div>
          </div>

          {/* Starter Code Editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Python Starter Code
            </label>
            <CodeEditor
              label="starter_code.py"
              value={activeTask.starterCode}
              onChange={(code) => setActiveTask({ ...activeTask, starterCode: code })}
              onRunShortcut={handleRunTests}
              heightClass="h-56"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Expected Output</label>
              <textarea
                rows={2}
                value={activeTask.expectedOutput}
                onChange={(e) => setActiveTask({ ...activeTask, expectedOutput: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Hints (1 per line)</label>
              <textarea
                rows={2}
                value={activeTask.hints.join('\n')}
                onChange={(e) =>
                  setActiveTask({ ...activeTask, hints: e.target.value.split('\n').filter(Boolean) })
                }
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
              />
            </div>
          </div>

          {/* Test Cases Management */}
          <div className="pt-4 border-t border-[#E2E8F0] dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#111827] dark:text-slate-100">
                Automated Test Cases ({activeTask.testCases.length})
              </h3>
              <button
                type="button"
                onClick={addManualTestCase}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#37852d] dark:text-[#84E179] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Test Case</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {activeTask.testCases.map((tc) => (
                <div key={tc.id} className="p-3 rounded-lg border border-[#E2E8F0] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={tc.name}
                      onChange={(e) =>
                        setActiveTask({
                          ...activeTask,
                          testCases: activeTask.testCases.map((item) =>
                            item.id === tc.id ? { ...item, name: e.target.value } : item
                          ),
                        })
                      }
                      className="font-semibold text-[#111827] dark:text-slate-100 bg-transparent border-b border-transparent focus:border-[#53b947] focus:outline-none flex-1"
                    />
                    <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tc.isHidden}
                        onChange={(e) =>
                          setActiveTask({
                            ...activeTask,
                            testCases: activeTask.testCases.map((item) =>
                              item.id === tc.id ? { ...item, isHidden: e.target.checked } : item
                            ),
                          })
                        }
                      />
                      <span>Hidden</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTask({
                          ...activeTask,
                          testCases: activeTask.testCases.filter((item) => item.id !== tc.id),
                        })
                      }
                      className="p-1 text-slate-400 hover:text-[#DC2626] dark:hover:text-red-400"
                      title="Remove test case"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={tc.input}
                      onChange={(e) =>
                        setActiveTask({
                          ...activeTask,
                          testCases: activeTask.testCases.map((item) =>
                            item.id === tc.id ? { ...item, input: e.target.value } : item
                          ),
                        })
                      }
                      placeholder="Harness assertion"
                      className="px-2 py-1.5 font-mono text-[11px] rounded border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-950 text-[#111827] dark:text-slate-100"
                    />
                    <input
                      type="text"
                      value={tc.expectedOutput}
                      onChange={(e) =>
                        setActiveTask({
                          ...activeTask,
                          testCases: activeTask.testCases.map((item) =>
                            item.id === tc.id ? { ...item, expectedOutput: e.target.value } : item
                          ),
                        })
                      }
                      placeholder="Expected stdout"
                      className="px-2 py-1.5 font-mono text-[11px] rounded border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-950 text-[#111827] dark:text-slate-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dark Test Execution Results Console */}
          {testRunOutput && (
            <div className="rounded-[10px] bg-[#0F172A] border border-slate-800 p-4 text-xs text-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-semibold text-white">Test Runner Console</span>
                <span className="font-mono text-slate-400 tabular-nums">{testRunOutput.durationMs}ms</span>
              </div>
              {testRunOutput.stdout && (
                <pre className="font-mono text-emerald-300 whitespace-pre-wrap">{testRunOutput.stdout}</pre>
              )}
              {testRunOutput.stderr && (
                <pre className="font-mono text-red-400 whitespace-pre-wrap">{testRunOutput.stderr}</pre>
              )}
              <div className="space-y-1.5">
                {testRunOutput.testResults.map((tr) => (
                  <div key={tr.id} className="flex items-center justify-between py-1 border-t border-slate-800/80">
                    <span className="inline-flex items-center gap-1.5">
                      {tr.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span>{tr.name}</span>
                      {tr.isHidden && <span className="text-[10px] text-slate-500">(Hidden)</span>}
                    </span>
                    <span className={tr.passed ? 'text-emerald-400 font-mono' : 'text-red-400 font-mono'}>
                      {tr.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Contextual AI Assistant */}
        <div className="xl:col-span-4 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#37852d] dark:text-[#84E179]" />
              <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Contextual AI Task Assistant</h2>
            </div>
            {aiSource && (
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {aiSource === 'gemini' ? 'Gemini AI' : 'Curriculum Engine'}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Select an engineering improvement action for <span className="font-semibold text-[#111827] dark:text-slate-100">{activeTask.title}</span> or enter a custom refinement request.
          </p>

          {/* One-Click SME AI Actions */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'rewrite-statement', label: 'Rewrite Statement' },
              { id: 'improve-instructions', label: 'Improve Instructions' },
              { id: 'generate-tests', label: 'Generate Edge Cases' },
              { id: 'optimize-starter', label: 'Optimize Starter Code' },
              { id: 'generate-hints', label: 'Generate Hints' },
              { id: 'change-difficulty', label: 'Adjust Difficulty' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                disabled={aiLoading}
                onClick={() => triggerAiAssist(btn.id)}
                className="px-2.5 py-2 text-left text-xs font-medium rounded-lg border border-[#E2E8F0] dark:border-slate-700 hover:border-[#53b947] dark:hover:border-[#53b947] hover:bg-[#EBF7E9]/60 dark:hover:bg-[#53b947]/15 text-[#111827] dark:text-slate-100 transition-colors disabled:opacity-50"
              >
                {btn.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (aiPrompt.trim()) triggerAiAssist('audit-custom', aiPrompt);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask AI to validate outputs or find ambiguities..."
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiPrompt.trim()}
              className="px-3 py-2 rounded-lg bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] disabled:opacity-50"
              aria-label="Send AI request"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {aiLoading && (
            <div className="p-4 rounded-lg border border-[#E2E8F0] dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
              Analyzing task structure, starter code, and test cases...
            </div>
          )}

          {aiSummary && !aiLoading && (
            <div className="p-3.5 rounded-lg bg-[#EBF7E9]/70 dark:bg-[#53b947]/15 border border-[#B6E2B0] dark:border-[#53b947]/40 text-xs text-[#111827] dark:text-slate-100">
              {aiSummary}
            </div>
          )}

          {/* Before & After Diff Proposals with Apply / Reject */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {aiProposals.map((prop) => {
              const currentText =
                prop.field === 'problemStatement'
                  ? activeTask.problemStatement
                  : prop.field === 'instructions'
                  ? activeTask.instructions
                  : prop.field === 'starterCode'
                  ? activeTask.starterCode
                  : prop.field === 'difficulty'
                  ? activeTask.difficulty
                  : '';

              return (
                <div
                  key={prop.id}
                  className="rounded-[10px] border border-[#E2E8F0] dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 p-3.5 space-y-2.5 text-xs"
                >
                  <div>
                    <div className="font-semibold text-[#111827] dark:text-slate-100">{prop.title}</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{prop.rationale}</p>
                  </div>

                  {prop.proposedText && (
                    <div className="space-y-1.5">
                      {currentText && (
                        <div className="p-2 rounded bg-red-50/70 dark:bg-red-950/50 border border-red-200/70 dark:border-red-900 text-[11px] font-mono text-red-900 dark:text-red-200 line-clamp-3">
                          - {currentText}
                        </div>
                      )}
                      <div className="p-2 rounded bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap max-h-36 overflow-y-auto">
                        + {prop.proposedText}
                      </div>
                    </div>
                  )}

                  {prop.proposedHints && (
                    <ul className="p-2 rounded bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1 list-disc pl-4">
                      {prop.proposedHints.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}

                  {prop.proposedTestCases && (
                    <div className="space-y-1">
                      {prop.proposedTestCases.map((tc, i) => (
                        <div
                          key={i}
                          className="p-2 rounded bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono text-emerald-900 dark:text-emerald-200"
                        >
                          + {tc.name}: {tc.input} → {tc.expectedOutput}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setAiProposals((prev) => prev.filter((p) => p.id !== prop.id))}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#E2E8F0] dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyProposal(prop)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply Change</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
