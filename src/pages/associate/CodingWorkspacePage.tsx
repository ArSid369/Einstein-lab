import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Send,
  Terminal,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CodeEditor } from '../../components/shared/CodeEditor';
import { LiveSimCommand, RobotSim3D } from '../../components/shared/RobotSim3D';
import { DifficultyText, MetaRow } from '../../components/shared/UiPrimitives';

interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  durationMs: number;
  simulation?: {
    mode?: 'rover' | 'arm';
    waypoints?: Array<{ x: number; z: number }>;
    joints?: number[];
  };
  testResults: Array<{
    id: string;
    name: string;
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;
    isHidden: boolean;
    error?: string;
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

const CURRICULUM_STORAGE_KEY = 'newtonlab_curriculum_collapsed';

export const CodingWorkspacePage: React.FC = () => {
  const { taskId } = useParams();
  const { currentUser, modules, tasks, progress, markTaskCompleted } = useApp();

  const initialTask =
    tasks.find((t) => t.id === taskId) ||
    tasks.find((t) => t.id === progress.currentTaskId) ||
    tasks[0];

  const [selectedTaskId, setSelectedTaskId] = useState(initialTask.id);
  const activeTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];
  const activeModule = modules.find((m) => m.id === activeTask.moduleId) || modules[0];

  const [codeByTask, setCodeByTask] = useState<Record<string, string>>({});
  const currentCode = codeByTask[activeTask.id] ?? activeTask.starterCode;

  const [curriculumCollapsed, setCurriculumCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CURRICULUM_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CURRICULUM_STORAGE_KEY, String(curriculumCollapsed));
    } catch {
      // ignore storage errors
    }
  }, [curriculumCollapsed]);

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => ({
    [activeTask.moduleId]: true,
  }));
  const [showHints, setShowHints] = useState(false);

  const [execState, setExecState] = useState<'idle' | 'running' | 'passed' | 'error'>('idle');
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [liveCommand, setLiveCommand] = useState<LiveSimCommand | null>(null);
  const [submitBanner, setSubmitBanner] = useState<string | null>(null);

  useEffect(() => {
    if (taskId && tasks.some((t) => t.id === taskId)) {
      setSelectedTaskId(taskId);
      const t = tasks.find((x) => x.id === taskId);
      if (t) setExpandedModules((prev) => ({ ...prev, [t.moduleId]: true }));
      setExecResult(null);
      setExecState('idle');
      setSubmitBanner(null);
    }
  }, [taskId, tasks]);

  const handleRunCode = async (isSubmission = false) => {
    setExecState('running');
    setSubmitBanner(null);
    try {
      const res = await fetch('/api/execute-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          testCases: activeTask.testCases,
        }),
      });
      const data: ExecutionResult = await res.json();
      setExecResult(data);

      const allPassed = data.success && data.summary.failed === 0;
      setExecState(allPassed ? 'passed' : 'error');

      if (data.simulation && (data.simulation.waypoints || data.simulation.joints)) {
        setLiveCommand({
          mode: data.simulation.mode || activeTask.simulation.mode,
          waypoints: data.simulation.waypoints,
          joints: data.simulation.joints,
          runId: Date.now(),
        });
      } else {
        setLiveCommand({
          mode: activeTask.simulation.mode,
          waypoints: activeTask.simulation.defaultWaypoints,
          joints: activeTask.simulation.defaultJoints,
          runId: Date.now(),
        });
      }

      if (isSubmission && allPassed) {
        markTaskCompleted(activeTask.id);
        setSubmitBanner('All automated tests passed. Solution recorded in your module progress.');
      } else if (isSubmission) {
        setSubmitBanner('Fix failing test cases before final submission.');
      }
    } catch {
      setExecState('error');
      setExecResult({
        success: false,
        stdout: '',
        stderr: 'Could not reach Python execution runtime.',
        durationMs: 0,
        testResults: [],
        summary: { total: 0, passed: 0, failed: 1 },
      });
    }
  };

  // Group tasks by module for left task-navigation panel
  const modulesWithTasks = modules.filter((m) => tasks.some((t) => t.moduleId === m.id));

  return (
    <div className="space-y-4">
      {/* Studio Top Bar */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setCurriculumCollapsed((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0"
            aria-label={curriculumCollapsed ? 'Expand Lab Curriculum' : 'Collapse Lab Curriculum'}
            title={curriculumCollapsed ? 'Expand Lab Curriculum' : 'Collapse Lab Curriculum'}
          >
            {curriculumCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#37852d] dark:text-[#84E179]" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {curriculumCollapsed ? 'Show Curriculum' : 'Hide Curriculum'}
            </span>
          </button>

          <div className="min-w-0">
            <MetaRow
              items={[
                `Module ${activeModule.order}: ${activeModule.title}`,
                activeTask.taskType,
                <DifficultyText key="d" level={activeTask.difficulty} />,
              ]}
            />
            <h1 className="text-lg font-bold text-[#111827] dark:text-slate-100 truncate mt-0.5">
              {activeTask.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handleRunCode(false)}
            disabled={execState === 'running'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#111827] dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>{execState === 'running' ? 'Running...' : 'Run Code'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRunCode(true)}
            disabled={execState === 'running'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Solution</span>
          </button>
        </div>
      </div>

      {submitBanner && (
        <div
          className={`px-4 py-2.5 rounded-[10px] border text-xs font-medium flex items-center gap-2 ${
            execState === 'passed'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}
        >
          {execState === 'passed' ? (
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-[#D97706] dark:text-amber-400 shrink-0" />
          )}
          <span>{submitBanner}</span>
        </div>
      )}

      {/* 3-Column Studio Workspace with Collapsible Lab Curriculum */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch">
        {/* Left: Collapsible Lab Curriculum Panel */}
        {curriculumCollapsed ? (
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] overflow-hidden flex xl:flex-col items-center justify-between xl:justify-start gap-2 p-2.5 xl:w-12 shrink-0">
            <button
              type="button"
              onClick={() => setCurriculumCollapsed(false)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#111827] dark:hover:text-white transition-colors"
              aria-label="Expand Lab Curriculum"
              title="Expand Lab Curriculum"
            >
              <PanelLeftOpen className="w-4 h-4 text-[#37852d] dark:text-[#84E179]" />
            </button>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 xl:[writing-mode:vertical-rl] xl:rotate-180 xl:py-2 select-none whitespace-nowrap">
              Lab Curriculum
            </span>
          </div>
        ) : (
          <div className="w-full xl:w-[280px] 2xl:w-[300px] shrink-0 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#111827] dark:text-slate-100">
                Lab Curriculum
              </span>
              <button
                type="button"
                onClick={() => setCurriculumCollapsed(true)}
                className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-[#111827] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Collapse Lab Curriculum"
                title="Collapse Lab Curriculum"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800 overflow-y-auto max-h-[760px]">
              {modulesWithTasks.map((mod) => {
                const modTasks = tasks.filter((t) => t.moduleId === mod.id);
                const isOpen = !!expandedModules[mod.id];
                return (
                  <div key={mod.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedModules((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))
                      }
                      className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                    >
                      <span className="text-xs font-semibold text-[#111827] dark:text-slate-100 truncate">
                        {mod.order}. {mod.title}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <ul className="bg-slate-50/50 dark:bg-slate-900/50 divide-y divide-[#E2E8F0]/60 dark:divide-slate-800/70">
                        {modTasks.map((t, idx) => {
                          const isDone = progress.completedTaskIds.includes(t.id);
                          const isActive = t.id === activeTask.id;
                          return (
                            <li key={t.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTaskId(t.id);
                                  setExecResult(null);
                                  setExecState('idle');
                                  setLiveCommand(null);
                                  setSubmitBanner(null);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-start justify-between gap-2 ${
                                  isActive
                                    ? 'bg-[#EBF7E9] dark:bg-[#53b947]/20 text-[#2D7525] dark:text-[#84E179]'
                                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="font-medium truncate">
                                    {idx + 1}. {t.title}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {t.difficulty} · {t.estimatedMinutes}m
                                  </div>
                                </div>
                                {isDone && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#84E179] shrink-0 mt-0.5" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Center + Right Workspace Area (automatically expands when curriculum collapses) */}
        <div className="flex-1 min-w-0 grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          {/* Center: Instructions, Python Editor & Automated Test Results */}
          <div className="xl:col-span-7 flex flex-col gap-4 min-w-0">
            {/* Problem Brief */}
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4 space-y-3 text-xs">
              <p className="text-sm text-[#111827] dark:text-slate-100 leading-relaxed">
                {activeTask.problemStatement}
              </p>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeTask.instructions}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="text-slate-500 dark:text-slate-400">
                  Expected stdout:{' '}
                  <code className="font-mono text-[#111827] dark:text-slate-100">
                    {activeTask.expectedOutput}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHints((v) => !v)}
                  className="inline-flex items-center gap-1 font-semibold text-[#37852d] dark:text-[#84E179] hover:underline"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHints ? 'Hide Hints' : `Hints (${activeTask.hints.length})`}</span>
                </button>
              </div>

              {showHints && (
                <ul className="p-3 rounded-lg bg-[#EBF7E9]/70 dark:bg-[#53b947]/10 border border-[#B6E2B0] dark:border-[#53b947]/30 text-slate-700 dark:text-slate-200 space-y-1 list-disc pl-5">
                  {activeTask.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Python Code Editor with Fullscreen Toggle */}
            <CodeEditor
              label="robotics_controller.py"
              value={currentCode}
              onChange={(next) => setCodeByTask((prev) => ({ ...prev, [activeTask.id]: next }))}
              onReset={() => {
                setCodeByTask((prev) => ({ ...prev, [activeTask.id]: activeTask.starterCode }));
                setExecResult(null);
                setExecState('idle');
              }}
              onRunShortcut={() => handleRunCode(false)}
              highContrast={currentUser?.preferences.highContrastCode}
              heightClass="h-64"
              allowFullscreen
            />

            {/* Dark Console & Automated Test Results Panel */}
            <div className="rounded-[10px] bg-[#0F172A] border border-slate-800 p-4 text-xs text-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="inline-flex items-center gap-2 font-semibold text-white">
                  <Terminal className="w-3.5 h-3.5 text-[#53b947]" />
                  <span>Console & Automated Test Results</span>
                </span>
                {execResult && (
                  <span className="font-mono text-slate-400 tabular-nums">
                    {execResult.summary.passed}/{execResult.summary.total} passed · {execResult.durationMs}ms
                  </span>
                )}
              </div>

              {execState === 'idle' && (
                <p className="text-slate-400">
                  Click <span className="text-white font-semibold">Run Code</span> (or Cmd/Ctrl+Enter) to execute Python and update the 3D robot simulation.
                </p>
              )}

              {execState === 'running' && (
                <p className="text-[#84E179] font-mono">Executing Python 3.10 & test harness...</p>
              )}

              {execResult && (
                <div className="space-y-3">
                  {execResult.stdout && (
                    <pre className="font-mono text-emerald-300 whitespace-pre-wrap bg-slate-950/60 p-2.5 rounded">
                      {execResult.stdout}
                    </pre>
                  )}

                  {execResult.stderr && (
                    <div className="p-2.5 rounded bg-red-950/60 border border-red-800/70 space-y-1">
                      <pre className="font-mono text-red-300 whitespace-pre-wrap">{execResult.stderr}</pre>
                      <p className="text-[11px] text-amber-300">
                        Suggested Correction: Verify syntax, indentation, and variable names before re-running.
                      </p>
                    </div>
                  )}

                  {execResult.testResults.length > 0 && (
                    <div className="space-y-1.5">
                      {execResult.testResults.map((tr) => (
                        <div
                          key={tr.id}
                          className="flex items-start justify-between gap-2 py-1.5 border-t border-slate-800/80"
                        >
                          <div className="min-w-0">
                            <div className="inline-flex items-center gap-1.5 font-medium">
                              {tr.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              )}
                              <span>{tr.name}</span>
                              {tr.isHidden && <span className="text-[10px] text-slate-500">(Hidden)</span>}
                            </div>
                            {!tr.passed && !tr.isHidden && (
                              <div className="text-[11px] font-mono text-slate-400 mt-0.5 pl-5">
                                Expected: {tr.expectedOutput} · Got: {tr.actualOutput}
                              </div>
                            )}
                          </div>
                          <span
                            className={`font-mono font-semibold shrink-0 ${
                              tr.passed ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {tr.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Interactive 3D Robotics Simulation Viewport with Fullscreen Toggle */}
          <div className="xl:col-span-5 flex flex-col min-h-[460px]">
            <RobotSim3D
              config={activeTask.simulation}
              liveCommand={liveCommand}
              executionState={execState}
              allowFullscreen
            />
          </div>
        </div>
      </div>
    </div>
  );
};
