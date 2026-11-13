import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Play,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DifficultyText, MetaRow, PageHeader, StatusLabel } from '../../components/shared/UiPrimitives';

export const ModuleDetailsPage: React.FC = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { domains, modules, tasks, contents, assessments, progress, markLessonCompleted } = useApp();

  const mod = modules.find((m) => m.id === moduleId) || modules[0];
  const domain = domains.find((d) => d.id === mod.domainId);
  const modTasks = tasks.filter((t) => t.moduleId === mod.id);
  const modLessons = contents.filter((c) => c.moduleId === mod.id);
  const modAssessment = assessments.find((a) => a.id === mod.assessmentId || a.moduleId === mod.id);

  const [activeLessonId, setActiveLessonId] = useState<string | null>(modLessons[0]?.id || null);

  const completedTasksCount = modTasks.filter((t) =>
    progress.completedTaskIds.includes(t.id)
  ).length;
  const modPct =
    modTasks.length > 0 ? Math.round((completedTasksCount / modTasks.length) * 100) : 0;

  const recommendedTask =
    modTasks.find((t) => !progress.completedTaskIds.includes(t.id)) || modTasks[0];

  const activeLesson = modLessons.find((l) => l.id === activeLessonId);

  return (
    <div className="space-y-6">
      <Link
        to="/associate/learning-path"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#111827] dark:hover:text-slate-100"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Learning Path</span>
      </Link>

      <PageHeader
        title={`Module ${mod.order}: ${mod.title}`}
        description={mod.description}
        actions={
          recommendedTask && (
            <button
              type="button"
              onClick={() => navigate(`/associate/workspace/${recommendedTask.id}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold whitespace-nowrap shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{completedTasksCount > 0 ? 'Continue Task' : 'Start First Task'}</span>
            </button>
          )
        }
      />

      {/* Module Overview & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
            <MetaRow
              items={[
                domain?.name || 'Robotics',
                <DifficultyText key="diff" level={mod.difficulty} />,
                `${mod.estimatedHours} hours estimated`,
              ]}
            />
            <span className="text-xs font-mono font-semibold text-[#111827] dark:text-slate-100 tabular-nums">
              {completedTasksCount}/{modTasks.length} tasks completed ({modPct}%)
            </span>
          </div>

          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-[#53b947]" style={{ width: `${modPct}%` }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div>
              <h3 className="font-semibold text-[#111827] dark:text-slate-100 mb-1.5">Learning Objectives</h3>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc pl-4">
                {mod.learningObjectives.map((o, idx) => (
                  <li key={idx}>{o}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#111827] dark:text-slate-100 mb-1.5">Prerequisites</h3>
              {mod.prerequisites.length > 0 ? (
                <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc pl-4">
                  {mod.prerequisites.map((pid) => (
                    <li key={pid}>{modules.find((m) => m.id === pid)?.title || pid}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">Open to all learners.</p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Module Assessment Card */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#37852d] dark:text-[#84E179]">
              <ClipboardCheck className="w-4 h-4" />
              <span>Module Gate Assessment</span>
            </div>
            {modAssessment ? (
              <>
                <h3 className="text-base font-semibold text-[#111827] dark:text-slate-100">{modAssessment.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">{modAssessment.description}</p>
                <MetaRow
                  items={[
                    `${modAssessment.questions.length} questions`,
                    `${modAssessment.durationMinutes} min`,
                    `Pass ${modAssessment.passingScore}%`,
                  ]}
                />
              </>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">Complete all coding labs to advance to the next module.</p>
            )}
          </div>

          {modAssessment && (
            <button
              type="button"
              onClick={() => navigate(`/associate/assessment/${modAssessment.id}`)}
              className="w-full py-2.5 px-4 rounded-lg border border-[#E2E8F0] dark:border-slate-700 hover:border-[#53b947] hover:bg-[#EBF7E9]/60 dark:hover:bg-[#53b947]/15 text-xs font-semibold text-[#111827] dark:text-slate-100 transition-colors"
            >
              Take Module Assessment
            </button>
          )}
        </div>
      </div>

      {/* Curriculum: Lessons & Coding Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Coding Tasks List */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#37852d] dark:text-[#84E179]" />
              <span>Interactive Coding Tasks & 3D Labs</span>
            </h2>
          </div>

          {modTasks.length === 0 ? (
            <div className="p-6 text-xs text-slate-500 dark:text-slate-400">
              No coding tasks assigned to this module yet. Open the Coding Studio to experiment.
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
              {modTasks.map((t, idx) => {
                const isDone = progress.completedTaskIds.includes(t.id);
                const isRecommended = recommendedTask?.id === t.id;
                return (
                  <div key={t.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{idx + 1}.</span>
                        <span className="text-sm font-semibold text-[#111827] dark:text-slate-100 truncate">{t.title}</span>
                        {isRecommended && !isDone && (
                          <span className="text-[11px] font-semibold text-[#37852d] dark:text-[#84E179]">Up Next</span>
                        )}
                      </div>
                      <MetaRow
                        className="mt-1"
                        items={[
                          t.taskType,
                          t.difficulty,
                          `${t.estimatedMinutes}m`,
                          `${t.testCases.length} tests`,
                        ]}
                      />
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusLabel status={isDone ? 'Completed' : 'Available'} />
                      <button
                        type="button"
                        onClick={() => navigate(`/associate/workspace/${t.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold"
                      >
                        <span>{isDone ? 'Reopen' : 'Solve'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lessons & Reading Material */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] dark:border-slate-800">
            <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0284C7] dark:text-sky-400" />
              <span>Module Lessons & Reference Materials</span>
            </h2>
          </div>

          {modLessons.length === 0 ? (
            <div className="p-6 text-xs text-slate-500 dark:text-slate-400">
              All concepts for this module are embedded directly inside the coding task instructions.
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
              {modLessons.map((lesson) => {
                const isRead = progress.completedLessonIds.includes(lesson.id);
                const isSelected = activeLesson?.id === lesson.id;
                return (
                  <div key={lesson.id} className="p-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => setActiveLessonId(isSelected ? null : lesson.id)}
                      className="w-full text-left flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#111827] dark:text-slate-100">{lesson.title}</div>
                        <MetaRow items={[lesson.type, `${lesson.durationMinutes} min`]} />
                      </div>
                      {isRead && <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />}
                    </button>

                    {isSelected && (
                      <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                        <p className="leading-relaxed">{lesson.body}</p>
                        {lesson.codeSnippet && (
                          <pre className="p-3 rounded-lg bg-[#0F172A] text-emerald-300 font-mono overflow-x-auto border border-slate-800">
                            {lesson.codeSnippet}
                          </pre>
                        )}
                        {!isRead && (
                          <button
                            type="button"
                            onClick={() => markLessonCompleted(lesson.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#37852d] dark:text-[#84E179] hover:underline"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Lesson Complete</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
