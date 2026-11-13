import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, CheckCircle2, ClipboardCheck, Code2, Compass, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetaRow, PageHeader, StatusLabel } from '../../components/shared/UiPrimitives';

export const AssociateDashboardPage: React.FC = () => {
  const { currentUser, modules, tasks, assessments, results, progress, theme } = useApp();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const currentModule =
    modules.find((m) => m.id === progress.currentModuleId) || modules[0];
  const currentTask =
    tasks.find((t) => t.id === progress.currentTaskId) || tasks[0];

  const overallCompletion = Math.round(
    (progress.completedTaskIds.length / Math.max(1, tasks.length)) * 100
  );
  const pendingTasks = Math.max(0, tasks.length - progress.completedTaskIds.length);
  const userResults = results.filter((r) => r.learnerId === (currentUser?.id || 'user-assoc-1'));
  const latestScore = userResults[0]?.scorePercent ?? results[0]?.scorePercent ?? 80;

  const upcomingAssessments = assessments.filter((a) => a.status === 'Published').slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${currentUser?.name.split(' ')[0] || 'Engineer'}`}
        description="Track your adaptive robotics curriculum, resume live 3D simulation labs, and verify skill milestones."
        actions={
          <button
            type="button"
            onClick={() => navigate(`/associate/workspace/${currentTask.id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Resume 3D Studio</span>
          </button>
        }
      />

      {/* 4-Column KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Progress', value: `${overallCompletion}%`, sub: `${progress.completedTaskIds.length}/${tasks.length} labs done` },
          { label: 'Completed Modules', value: `${progress.completedModuleIds.length}`, sub: `of ${modules.length} total modules` },
          { label: 'Pending Tasks', value: `${pendingTasks}`, sub: `${progress.streakDays}-day active streak` },
          { label: 'Latest Assessment', value: `${latestScore}%`, sub: userResults[0]?.assessmentTitle || 'Pre-Assessment' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">{kpi.label}</div>
            <div className="mt-1.5 text-2xl font-bold text-[#111827] dark:text-slate-100 font-display tabular-nums">
              {kpi.value}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Primary Focal Card: Continue Learning + Weekly Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#37852d] dark:text-[#84E179]">Continue Learning</span>
              <StatusLabel status="Current" />
            </div>
            <h2 className="mt-2 text-xl font-bold text-[#111827] dark:text-slate-100 text-balance">
              {currentTask.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{currentTask.problemStatement}</p>
            <MetaRow
              className="mt-4"
              items={[
                `Module ${currentModule.order}: ${currentModule.title}`,
                currentTask.difficulty,
                `${currentTask.estimatedMinutes} min`,
                `${currentTask.testCases.length} automated tests`,
              ]}
            />
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <Link
              to={`/associate/modules/${currentModule.id}`}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#111827] dark:hover:text-slate-100"
            >
              View Module Curriculum
            </Link>
            <button
              type="button"
              onClick={() => navigate(`/associate/workspace/${currentTask.id}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold"
            >
              <Code2 className="w-4 h-4" />
              <span>Open Coding & 3D Workspace</span>
            </button>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Weekly Activity (Minutes)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              {progress.hoursSpent}h logged · Goal {progress.weeklyGoalHours}h/week
            </p>
          </div>
          <div className="h-44 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progress.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} width={28} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    color: isDark ? '#F1F5F9' : '#111827',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="minutes" fill="#53b947" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Learning Path Preview & Upcoming Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#37852d] dark:text-[#84E179]" />
              <span>Adaptive Learning Path Preview</span>
            </h2>
            <Link to="/associate/learning-path" className="text-xs font-semibold text-[#37852d] dark:text-[#84E179] hover:underline">
              Full Path →
            </Link>
          </div>

          <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
            {modules.slice(0, 5).map((mod) => {
              const isCompleted = progress.completedModuleIds.includes(mod.id);
              const isCurrent = progress.currentModuleId === mod.id;
              const isUnlocked = progress.unlockedModuleIds.includes(mod.id);
              const status = isCompleted
                ? 'Completed'
                : isCurrent
                ? 'Current'
                : isUnlocked
                ? 'Available'
                : 'Locked';

              return (
                <div key={mod.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <Link
                      to={isUnlocked ? `/associate/modules/${mod.id}` : '/associate/learning-path'}
                      className="font-semibold text-[#111827] dark:text-slate-100 hover:text-[#37852d] dark:hover:text-[#84E179] truncate block"
                    >
                      {mod.order}. {mod.title}
                    </Link>
                    <span className="text-slate-500 dark:text-slate-400">{mod.difficulty} · {mod.estimatedHours}h</span>
                  </div>
                  <StatusLabel status={status} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-[#37852d] dark:text-[#84E179]" />
            <span>Upcoming Assessments</span>
          </h2>
          <div className="space-y-3">
            {upcomingAssessments.map((a) => (
              <div key={a.id} className="p-3.5 rounded-lg border border-[#E2E8F0] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 text-xs">
                <div className="font-semibold text-[#111827] dark:text-slate-100">{a.title}</div>
                <MetaRow items={[a.type, `${a.durationMinutes} min`, `${a.questions.length} Qs`]} />
                <button
                  type="button"
                  onClick={() => navigate(`/associate/assessment/${a.id}`)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#37852d] dark:text-[#84E179] hover:underline"
                >
                  <span>Start Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Recommended next step: complete <span className="font-semibold text-[#111827] dark:text-slate-100">{currentTask.title}</span> to unlock the Kinematics Practical.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
