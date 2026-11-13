import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Code2,
  Copy,
  ListChecks,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Assessment, AssessmentType, DifficultyLevel, Question } from '../../types/newtonlab';
import { CodeEditor } from '../../components/shared/CodeEditor';
import { DifficultyText, PageHeader } from '../../components/shared/UiPrimitives';

export const SmeAssessmentBuilderPage: React.FC = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { assessments, domains, modules, saveAssessment } = useApp();

  const existing = assessmentId ? assessments.find((a) => a.id === assessmentId) : undefined;

  const [assessment, setAssessment] = useState<Assessment>(() => {
    if (existing) return existing;
    return {
      id: `assess-${Date.now()}`,
      title: 'New Robotics Module Assessment',
      type: 'Module Assessment',
      domainId: domains[0]?.id || 'dom-python',
      moduleId: modules[0]?.id,
      description: 'Evaluate learner mastery before unlocking the next module.',
      durationMinutes: 25,
      passingScore: 75,
      attemptLimit: 3,
      randomizeQuestions: false,
      randomizeOptions: false,
      status: 'Draft',
      avgScore: 0,
      completionRate: 0,
      attemptsCount: 0,
      updatedAt: '2026-11-12',
      questions: [
        {
          id: `q-${Date.now()}`,
          type: 'multiple-choice',
          prompt: 'Which Python built-in ensures motor velocity never exceeds a positive or negative bound?',
          points: 50,
          difficulty: 'Beginner',
          skillCategory: 'Python Fundamentals',
          options: ['max(-limit, min(limit, v))', 'abs(v)', 'round(v)', 'len(v)'],
          correctOptionIndex: 0,
          explanation: 'Combining min and max clamps v symmetrically to [-limit, limit].',
        },
      ],
      skillMappingRules: [
        {
          level: 'Beginner',
          minScore: 0,
          maxScore: 59,
          recommendedModuleId: modules[0]?.id || 'mod-py-1',
          rationale: 'Review core fundamentals before advancing.',
        },
        {
          level: 'Intermediate',
          minScore: 60,
          maxScore: 84,
          recommendedModuleId: modules[2]?.id || 'mod-np-1',
          rationale: 'Advance to NumPy Vector Geometry.',
        },
        {
          level: 'Advanced',
          minScore: 85,
          maxScore: 100,
          recommendedModuleId: modules[6]?.id || 'mod-rob-1',
          rationale: 'Place directly into Robotics Kinematics.',
        },
      ],
    };
  });

  const [activeQIndex, setActiveQIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const activeQuestion = assessment.questions[activeQIndex] || assessment.questions[0];

  const updateQuestion = (patch: Partial<Question>) => {
    setAssessment((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) => (idx === activeQIndex ? { ...q, ...patch } : q)),
    }));
  };

  const addQuestion = (type: 'multiple-choice' | 'coding') => {
    const q: Question =
      type === 'multiple-choice'
        ? {
            id: `q-${Date.now()}`,
            type: 'multiple-choice',
            prompt: 'New multiple-choice robotics question',
            points: 25,
            difficulty: 'Intermediate',
            skillCategory: 'Robotics Fundamentals',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctOptionIndex: 0,
            explanation: 'Explain the engineering reasoning behind the correct choice.',
          }
        : {
            id: `q-${Date.now()}`,
            type: 'coding',
            prompt: 'Write a Python function to compute Euclidean distance between two 2D poses.',
            points: 50,
            difficulty: 'Intermediate',
            skillCategory: 'Python Fundamentals',
            starterCode: `import math\ndef dist(x1, z1, x2, z2):\n    return round(math.hypot(x2 - x1, z2 - z1), 2)\n\nprint(dist(0, 0, 3, 4))`,
            expectedOutput: '5.0',
            testCases: [
              { id: `tc-${Date.now()}`, name: '3-4-5 Triangle', input: 'print(dist(0, 0, 3, 4))', expectedOutput: '5.0\n5.0', isHidden: false },
            ],
          };
    setAssessment((prev) => ({
      ...prev,
      questions: [...prev.questions, q],
    }));
    setActiveQIndex(assessment.questions.length);
    setActiveTab('questions');
  };

  const duplicateQuestion = (idx: number) => {
    const src = assessment.questions[idx];
    if (!src) return;
    const copy: Question = { ...src, id: `q-${Date.now()}`, prompt: `${src.prompt} (Copy)` };
    const next = [...assessment.questions];
    next.splice(idx + 1, 0, copy);
    setAssessment({ ...assessment, questions: next });
    setActiveQIndex(idx + 1);
  };

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= assessment.questions.length) return;
    const next = [...assessment.questions];
    [next[idx], next[target]] = [next[target], next[idx]];
    setAssessment({ ...assessment, questions: next });
    setActiveQIndex(target);
  };

  const deleteQuestion = (idx: number) => {
    if (assessment.questions.length <= 1) return;
    const next = assessment.questions.filter((_, i) => i !== idx);
    setAssessment({ ...assessment, questions: next });
    setActiveQIndex(Math.max(0, idx - 1));
  };

  const handleSave = (status: 'Draft' | 'Published') => {
    const next: Assessment = { ...assessment, status, updatedAt: '2026-11-12' };
    setAssessment(next);
    saveAssessment(next);
    setSavedNote(status === 'Published' ? 'Assessment published' : 'Draft saved');
    setTimeout(() => setSavedNote(null), 2200);
  };

  return (
    <div className="space-y-5">
      <Link
        to="/sme/assessments"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#111827] dark:hover:text-slate-100"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Assessments</span>
      </Link>

      <PageHeader
        title={assessment.title}
        description="Configure questions, coding test cases, and adaptive skill-mapping score thresholds."
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {savedNote && <span className="text-xs font-medium text-[#16A34A] dark:text-emerald-400">{savedNote}</span>}
            <button
              type="button"
              onClick={() => {
                saveAssessment(assessment);
                navigate(`/associate/assessment/${assessment.id}`);
              }}
              className="px-3.5 py-2 rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#111827] dark:text-slate-100 whitespace-nowrap"
            >
              Preview Runner
            </button>
            <button
              type="button"
              onClick={() => handleSave('Draft')}
              className="px-3.5 py-2 rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#111827] dark:text-slate-100 whitespace-nowrap"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('Published')}
              className="px-4 py-2 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold whitespace-nowrap"
            >
              Publish Assessment
            </button>
          </div>
        }
      />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md ${
            activeTab === 'questions'
              ? 'bg-white dark:bg-slate-700 text-[#111827] dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Question Editor ({assessment.questions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-slate-700 text-[#111827] dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Settings & Skill Mapping
        </button>
      </div>

      {activeTab === 'questions' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Question Navigator */}
          <div className="lg:col-span-4 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] overflow-hidden">
            <div className="p-3.5 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#111827] dark:text-slate-100">Question Navigator</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => addQuestion('multiple-choice')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold text-[#111827] dark:text-slate-100"
                >
                  <Plus className="w-3 h-3" />
                  <span>MC</span>
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('coding')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#EBF7E9] dark:bg-[#53b947]/20 hover:bg-[#d9f0d6] dark:hover:bg-[#53b947]/30 text-[11px] font-semibold text-[#2D7525] dark:text-[#84E179]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Code</span>
                </button>
              </div>
            </div>

            <ul className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
              {assessment.questions.map((q, idx) => {
                const isSelected = idx === activeQIndex;
                const isComplete =
                  q.prompt.trim().length > 5 &&
                  (q.type === 'multiple-choice'
                    ? (q.options?.length || 0) >= 2
                    : Boolean(q.starterCode?.trim()));

                return (
                  <li
                    key={q.id}
                    className={
                      isSelected
                        ? 'bg-[#EBF7E9]/80 dark:bg-[#53b947]/15'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }
                  >
                    <div className="p-3 flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveQIndex(idx)}
                        className="text-left flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          {q.type === 'coding' ? (
                            <Code2 className="w-3.5 h-3.5 text-[#37852d] dark:text-[#84E179]" />
                          ) : (
                            <ListChecks className="w-3.5 h-3.5 text-[#0284C7] dark:text-sky-400" />
                          )}
                          <span className="font-mono">Q{idx + 1}</span>
                          <span>·</span>
                          <DifficultyText level={q.difficulty} />
                          {isComplete && <CheckCircle2 className="w-3 h-3 text-[#16A34A] dark:text-emerald-400" />}
                        </div>
                        <div className="mt-1 text-xs font-medium text-[#111827] dark:text-slate-100 line-clamp-2">
                          {q.prompt}
                        </div>
                      </button>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveQuestion(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-[#111827] dark:hover:text-slate-100 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQuestion(idx, 1)}
                          disabled={idx === assessment.questions.length - 1}
                          className="p-1 text-slate-400 hover:text-[#111827] dark:hover:text-slate-100 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateQuestion(idx)}
                          className="p-1 text-slate-400 hover:text-[#111827] dark:hover:text-slate-100"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteQuestion(idx)}
                          className="p-1 text-slate-400 hover:text-[#DC2626] dark:hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Question Editor */}
          {activeQuestion && (
            <div className="lg:col-span-8 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Question Type</label>
                  <select
                    value={activeQuestion.type}
                    onChange={(e) =>
                      updateQuestion({ type: e.target.value as 'multiple-choice' | 'coding' })
                    }
                    className="w-full px-2.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="coding">Python Coding</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Points</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={activeQuestion.points}
                    onChange={(e) => updateQuestion({ points: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Difficulty</label>
                  <select
                    value={activeQuestion.difficulty}
                    onChange={(e) =>
                      updateQuestion({ difficulty: e.target.value as DifficultyLevel })
                    }
                    className="w-full px-2.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Skill Category</label>
                  <input
                    type="text"
                    value={activeQuestion.skillCategory}
                    onChange={(e) => updateQuestion({ skillCategory: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Question Statement
                </label>
                <textarea
                  rows={3}
                  value={activeQuestion.prompt}
                  onChange={(e) => updateQuestion({ prompt: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                />
              </div>

              {activeQuestion.type === 'multiple-choice' ? (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Answer Options (select correct radio)
                  </label>
                  {(activeQuestion.options || []).map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name={`correct-${activeQuestion.id}`}
                        checked={activeQuestion.correctOptionIndex === oIdx}
                        onChange={() => updateQuestion({ correctOptionIndex: oIdx })}
                        className="text-[#53b947]"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const nextOpts = [...(activeQuestion.options || [])];
                          nextOpts[oIdx] = e.target.value;
                          updateQuestion({ options: nextOpts });
                        }}
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      Answer Explanation
                    </label>
                    <textarea
                      rows={2}
                      value={activeQuestion.explanation || ''}
                      onChange={(e) => updateQuestion({ explanation: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <CodeEditor
                    label="question_starter.py"
                    value={activeQuestion.starterCode || ''}
                    onChange={(code) => updateQuestion({ starterCode: code })}
                    heightClass="h-44"
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      Expected Console Output
                    </label>
                    <input
                      type="text"
                      value={activeQuestion.expectedOutput || ''}
                      onChange={(e) => updateQuestion({ expectedOutput: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Assessment Settings */}
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4 text-xs">
            <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Assessment Configuration</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Assessment Title</label>
                <input
                  type="text"
                  value={assessment.title}
                  onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Type</label>
                <select
                  value={assessment.type}
                  onChange={(e) =>
                    setAssessment({ ...assessment, type: e.target.value as AssessmentType })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                >
                  <option value="Pre-Assessment">Pre-Assessment</option>
                  <option value="Module Assessment">Module Assessment</option>
                  <option value="Practical Coding Assessment">Practical Coding Assessment</option>
                  <option value="Final Assessment">Final Assessment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Primary Domain</label>
                <select
                  value={assessment.domainId}
                  onChange={(e) => setAssessment({ ...assessment, domainId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                >
                  {domains.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={assessment.durationMinutes}
                  onChange={(e) =>
                    setAssessment({ ...assessment, durationMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Passing Score (%)</label>
                <input
                  type="number"
                  value={assessment.passingScore}
                  onChange={(e) =>
                    setAssessment({ ...assessment, passingScore: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Attempt Limit</label>
                <input
                  type="number"
                  value={assessment.attemptLimit}
                  onChange={(e) =>
                    setAssessment({ ...assessment, attemptLimit: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assessment.randomizeQuestions}
                  onChange={(e) =>
                    setAssessment({ ...assessment, randomizeQuestions: e.target.checked })
                  }
                />
                <span>Randomize question order per learner</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assessment.randomizeOptions}
                  onChange={(e) =>
                    setAssessment({ ...assessment, randomizeOptions: e.target.checked })
                  }
                />
                <span>Randomize multiple-choice option order</span>
              </label>
            </div>
          </div>

          {/* Skill-Mapping Threshold Rules */}
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4 text-xs">
            <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100">
              Adaptive Skill-Mapping Thresholds
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Map assessment score bands automatically to Beginner, Intermediate, or Advanced starting modules.
            </p>

            <div className="space-y-3">
              {assessment.skillMappingRules.map((rule, rIdx) => (
                <div key={rule.level} className="p-3.5 rounded-lg border border-[#E2E8F0] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#111827] dark:text-slate-100">{rule.level} Band</span>
                    <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-700 dark:text-slate-200">
                      <input
                        type="number"
                        value={rule.minScore}
                        onChange={(e) => {
                          const next = [...assessment.skillMappingRules];
                          next[rIdx] = { ...rule, minScore: Number(e.target.value) };
                          setAssessment({ ...assessment, skillMappingRules: next });
                        }}
                        className="w-14 px-2 py-1 border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-950 text-[#111827] dark:text-slate-100 rounded text-center"
                      />
                      <span>% –</span>
                      <input
                        type="number"
                        value={rule.maxScore}
                        onChange={(e) => {
                          const next = [...assessment.skillMappingRules];
                          next[rIdx] = { ...rule, maxScore: Number(e.target.value) };
                          setAssessment({ ...assessment, skillMappingRules: next });
                        }}
                        className="w-14 px-2 py-1 border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-950 text-[#111827] dark:text-slate-100 rounded text-center"
                      />
                      <span>%</span>
                    </div>
                  </div>

                  <select
                    value={rule.recommendedModuleId}
                    onChange={(e) => {
                      const next = [...assessment.skillMappingRules];
                      next[rIdx] = { ...rule, recommendedModuleId: e.target.value };
                      setAssessment({ ...assessment, skillMappingRules: next });
                    }}
                    className="w-full px-2.5 py-1.5 rounded border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-950 text-[#111827] dark:text-slate-100"
                  >
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        Map to: {m.order}. {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
