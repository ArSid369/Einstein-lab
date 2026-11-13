import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Lock,
  Unlock,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetaRow, PageHeader, StatusLabel } from '../../components/shared/UiPrimitives';

export const AssessmentResultsPage: React.FC = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { results, assessments, modules, progress } = useApp();

  const result = results.find((r) => r.id === resultId) || results[0];
  const assessment = assessments.find((a) => a.id === result.assessmentId) || assessments[0];
  const recommendedMod =
    modules.find((m) => m.id === result.recommendedModuleId) || modules[0];

  const [showReview, setShowReview] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Assessment Results & Skill Mapping"
        description={`${result.assessmentTitle} · Submitted ${result.submittedAt}`}
        actions={
          <button
            type="button"
            onClick={() => navigate(`/associate/modules/${recommendedMod.id}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <span>Continue to Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        }
      />

      {/* Top Score & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Overall Score</div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl font-bold font-display text-[#111827] dark:text-slate-100 tabular-nums">
                {result.scorePercent}%
              </span>
              <StatusLabel status={result.passed ? 'Passed' : 'Failed'} />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Completed in {result.timeTakenMinutes} minutes · Passing threshold {assessment.passingScore}%
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] dark:border-slate-800 grid grid-cols-3 gap-3 text-center tabular-nums">
            <div>
              <div className="text-lg font-bold text-[#16A34A] dark:text-emerald-400">{result.correctCount}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Correct</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[#DC2626] dark:text-red-400">{result.incorrectCount}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Incorrect</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-500 dark:text-slate-400">{result.skippedCount}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Skipped</div>
            </div>
          </div>
        </div>

        {/* Recommended Module Placement */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#37852d] dark:text-[#84E179]">
              <Compass className="w-4 h-4" />
              <span>Recommended Starting Module</span>
            </div>
            <h2 className="text-xl font-bold text-[#111827] dark:text-slate-100">
              Module {recommendedMod.order}: {recommendedMod.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{result.recommendationReason}</p>
            <MetaRow
              items={[
                recommendedMod.difficulty,
                `${recommendedMod.estimatedHours} hours estimated`,
              ]}
            />
          </div>

          <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowReview((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111827] dark:text-slate-100 hover:text-[#37852d] dark:hover:text-[#84E179]"
            >
              {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{showReview ? 'Hide Answer Review' : 'Review Answers'}</span>
            </button>

            <div className="flex items-center gap-3">
              <Link
                to="/associate/learning-path"
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#111827] dark:hover:text-slate-100"
              >
                View Full Learning Path
              </Link>
              <button
                type="button"
                onClick={() => navigate(`/associate/modules/${recommendedMod.id}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold"
              >
                <span>Open Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Topic-Level Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Topic-Level Skill Proficiency</h3>
          <div className="space-y-3">
            {result.topicBreakdown.map((t) => (
              <div key={t.topic} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-medium text-[#111827] dark:text-slate-100">{t.topic}</span>
                  <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {t.correct}/{t.total} ({t.scorePercent}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${
                      t.scorePercent >= 75
                        ? 'bg-[#16A34A]'
                        : t.scorePercent >= 50
                        ? 'bg-[#F59E0B]'
                        : 'bg-[#DC2626]'
                    }`}
                    style={{ width: `${t.scorePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Availability Preview */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Mapped Module Availability</h3>
          <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800 max-h-56 overflow-y-auto text-xs">
            {modules.map((m) => {
              const unlocked = progress.unlockedModuleIds.includes(m.id);
              const isRec = m.id === recommendedMod.id;
              return (
                <div key={m.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-medium text-[#111827] dark:text-slate-100">
                      {m.order}. {m.title}
                    </span>
                    {isRec && (
                      <span className="ml-2 text-[11px] font-semibold text-[#37852d] dark:text-[#84E179]">
                        Recommended
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 shrink-0">
                    {unlocked ? (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400" />
                        <span className="text-[#16A34A] dark:text-emerald-400 font-medium">Available</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Locked</span>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expandable Answer Review */}
      {showReview && (
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Question-by-Question Review</h3>
          <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
            {assessment.questions.map((q, idx) => {
              const ans = result.answers[q.id];
              const isCorrect = Boolean(ans?.isCorrect);
              return (
                <div key={q.id} className="py-4 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold text-[#111827] dark:text-slate-100">
                      Q{idx + 1}. {q.prompt}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold shrink-0 ${
                        isCorrect ? 'text-[#16A34A] dark:text-emerald-400' : 'text-[#DC2626] dark:text-red-400'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{isCorrect ? 'Correct' : 'Needs Review'}</span>
                    </span>
                  </div>

                  {q.type === 'multiple-choice' && q.options && (
                    <div className="text-slate-600 dark:text-slate-300 space-y-1">
                      <div>
                        Your answer:{' '}
                        <span className="font-medium text-[#111827] dark:text-slate-100">
                          {ans?.selectedOption !== undefined
                            ? q.options[ans.selectedOption]
                            : 'Skipped'}
                        </span>
                      </div>
                      <div>
                        Correct answer:{' '}
                        <span className="font-medium text-[#16A34A] dark:text-emerald-400">
                          {q.options[q.correctOptionIndex ?? 0]}
                        </span>
                      </div>
                    </div>
                  )}

                  {q.explanation && (
                    <p className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg">{q.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
