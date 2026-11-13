import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Play,
  Send,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CodeEditor } from '../../components/shared/CodeEditor';
import { DifficultyText } from '../../components/shared/UiPrimitives';

interface AnswerDraft {
  selectedOption?: number;
  code?: string;
  codingPassed?: boolean;
}

export const AssessmentRunnerPage: React.FC = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { assessments, submitAssessment } = useApp();

  const assessment = assessments.find((a) => a.id === assessmentId) || assessments[0];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>(() => {
    const init: Record<string, AnswerDraft> = {};
    assessment.questions.forEach((q) => {
      if (q.type === 'coding') {
        init[q.id] = { code: q.starterCode || '' };
      }
    });
    return init;
  });
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(assessment.durationMinutes * 60);
  const [autosaveStatus, setAutosaveStatus] = useState('Autosaved');

  // Coding run state
  const [runningCode, setRunningCode] = useState(false);
  const [consoleOut, setConsoleOut] = useState<string | null>(null);
  const [consoleErr, setConsoleErr] = useState<string | null>(null);
  const [sampleResults, setSampleResults] = useState<
    Array<{ id: string; name: string; passed: boolean }>
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentQuestion = assessment.questions[currentIndex];
  const currentDraft = answers[currentQuestion.id] || {};

  const updateDraft = (patch: Partial<AnswerDraft>) => {
    setAutosaveStatus('Saving...');
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], ...patch },
    }));
    setTimeout(() => setAutosaveStatus('Autosaved'), 300);
  };

  const handleRunCode = async () => {
    setRunningCode(true);
    setConsoleOut(null);
    setConsoleErr(null);
    setSampleResults([]);
    try {
      const res = await fetch('/api/execute-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentDraft.code || '',
          testCases: (currentQuestion.testCases || []).filter((tc) => !tc.isHidden),
        }),
      });
      const data = await res.json();
      setConsoleOut(data.stdout || '(no stdout)');
      setConsoleErr(data.stderr || null);
      const visibleTests = (data.testResults || []) as Array<{
        id: string;
        name: string;
        passed: boolean;
      }>;
      setSampleResults(visibleTests);
      const allPassed =
        data.success && (visibleTests.length === 0 || visibleTests.every((t) => t.passed));
      updateDraft({ codingPassed: allPassed });
    } catch {
      setConsoleErr('Execution service unreachable.');
    } finally {
      setRunningCode(false);
    }
  };

  const handleSubmit = () => {
    const elapsedMin = Math.max(
      1,
      Math.round((assessment.durationMinutes * 60 - secondsLeft) / 60)
    );
    const result = submitAssessment(assessment.id, answers, elapsedMin);
    navigate(`/associate/results/${result.id}`);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const answeredCount = assessment.questions.filter((q) => {
    const d = answers[q.id];
    if (!d) return false;
    return q.type === 'multiple-choice'
      ? d.selectedOption !== undefined
      : Boolean(d.code?.trim());
  }).length;

  return (
    <div className="space-y-5">
      {/* Top Runner Status Header */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">{assessment.type}</div>
          <h1 className="text-base font-bold text-[#111827] dark:text-slate-100 truncate">{assessment.title}</h1>
        </div>

        <div className="flex items-center gap-5 text-xs">
          <span className="text-slate-500 dark:text-slate-400">{autosaveStatus}</span>
          <span className="font-mono tabular-nums text-slate-700 dark:text-slate-200">
            Answered {answeredCount}/{assessment.questions.length}
          </span>
          <div className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#111827] dark:text-slate-100 tabular-nums px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Clock className="w-3.5 h-3.5 text-[#37852d] dark:text-[#84E179]" />
            <span>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] font-semibold whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Assessment</span>
          </button>
        </div>
      </div>

      {/* Progress Strip */}
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-[#53b947] transition-all"
          style={{ width: `${((currentIndex + 1) / assessment.questions.length) * 100}%` }}
        />
      </div>

      {/* Main Split: Question Navigator + Active Question State (MC or Coding) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Question Navigator */}
        <div className="lg:col-span-3 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4 space-y-3">
          <div className="text-xs font-semibold text-[#111827] dark:text-slate-100">Questions</div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-3 gap-2">
            {assessment.questions.map((q, idx) => {
              const d = answers[q.id];
              const isAnswered =
                q.type === 'multiple-choice'
                  ? d?.selectedOption !== undefined
                  : Boolean(d?.code?.trim());
              const isFlagged = flagged[q.id];
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setConsoleOut(null);
                    setConsoleErr(null);
                    setSampleResults([]);
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-mono font-semibold border transition-colors relative tabular-nums ${
                    isCurrent
                      ? 'border-[#53b947] bg-[#EBF7E9] dark:bg-[#53b947]/20 text-[#2D7525] dark:text-[#84E179]'
                      : isAnswered
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-[#16A34A] dark:text-emerald-400'
                      : 'border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <Flag className="w-2.5 h-2.5 text-[#D97706] dark:text-amber-400 absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div>Current: Question {currentIndex + 1}</div>
            <div>Flagged items remain marked for review.</div>
          </div>
        </div>

        {/* Question Body */}
        <div className="lg:col-span-9 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-mono font-semibold text-[#111827] dark:text-slate-100">
                Question {currentIndex + 1} of {assessment.questions.length}
              </span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-slate-600 dark:text-slate-300">{currentQuestion.skillCategory}</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <DifficultyText level={currentQuestion.difficulty} />
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                {currentQuestion.points} pts
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setFlagged((prev) => ({
                  ...prev,
                  [currentQuestion.id]: !prev[currentQuestion.id],
                }))
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                flagged[currentQuestion.id]
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 text-[#D97706] dark:text-amber-300'
                  : 'border-[#E2E8F0] dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{flagged[currentQuestion.id] ? 'Flagged' : 'Flag for Review'}</span>
            </button>
          </div>

          <p className="text-base font-medium text-[#111827] dark:text-slate-100 leading-relaxed">
            {currentQuestion.prompt}
          </p>

          {/* State 1: Multiple-Choice Question */}
          {currentQuestion.type === 'multiple-choice' ? (
            <div className="space-y-3">
              <div className="space-y-2.5" role="radiogroup" aria-label="Answer options">
                {(currentQuestion.options || []).map((opt, idx) => {
                  const isSelected = currentDraft.selectedOption === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => updateDraft({ selectedOption: idx })}
                      className={`w-full text-left p-4 rounded-[10px] border transition-colors flex items-center gap-3 ${
                        isSelected
                          ? 'border-[#53b947] bg-[#EBF7E9]/60 dark:bg-[#53b947]/15 text-[#111827] dark:text-slate-100'
                          : 'border-[#E2E8F0] dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono shrink-0 ${
                          isSelected
                            ? 'border-[#53b947] bg-[#53b947] text-[#0B1A09] font-semibold'
                            : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {currentDraft.selectedOption !== undefined && (
                <button
                  type="button"
                  onClick={() => updateDraft({ selectedOption: undefined })}
                  className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-[#111827] dark:hover:text-slate-100"
                >
                  Clear Answer
                </button>
              )}
            </div>
          ) : (
            /* State 2: Coding Question */
            <div className="space-y-4">
              {currentQuestion.expectedOutput && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-[#111827] dark:text-slate-100">Sample Expected Output: </span>
                  <code className="font-mono">{currentQuestion.expectedOutput}</code>
                </div>
              )}

              <CodeEditor
                label="solution.py"
                value={currentDraft.code ?? currentQuestion.starterCode ?? ''}
                onChange={(code) => updateDraft({ code, codingPassed: false })}
                onReset={() =>
                  updateDraft({ code: currentQuestion.starterCode || '', codingPassed: false })
                }
                onRunShortcut={handleRunCode}
                heightClass="h-60"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Sample tests run without revealing hidden grading cases.
                </span>
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={runningCode}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#111827] dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold border border-transparent dark:border-slate-700"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{runningCode ? 'Executing...' : 'Run Code'}</span>
                </button>
              </div>

              {(consoleOut !== null || consoleErr) && (
                <div className="rounded-[10px] bg-[#0F172A] border border-slate-800 p-4 text-xs text-slate-200 space-y-2">
                  <div className="font-semibold text-slate-400">Console Output</div>
                  {consoleOut && (
                    <pre className="font-mono text-emerald-300 whitespace-pre-wrap">{consoleOut}</pre>
                  )}
                  {consoleErr && (
                    <pre className="font-mono text-red-400 whitespace-pre-wrap">{consoleErr}</pre>
                  )}
                  {sampleResults.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      {sampleResults.map((tr) => (
                        <div key={tr.id} className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5">
                            {tr.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                            )}
                            <span>{tr.name}</span>
                          </span>
                          <span className={tr.passed ? 'text-emerald-400 font-mono' : 'text-red-400 font-mono'}>
                            {tr.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer Navigation */}
          <div className="pt-5 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex((i) => i - 1);
                setConsoleOut(null);
                setConsoleErr(null);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold text-[#111827] dark:text-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex < assessment.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex((i) => i + 1);
                  setConsoleOut(null);
                  setConsoleErr(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Assessment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
