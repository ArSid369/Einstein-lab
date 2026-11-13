import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Award, CheckCircle2, Lock, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DifficultyText, MetaRow, PageHeader, StatusLabel } from '../../components/shared/UiPrimitives';

export const LearningPathPage: React.FC = () => {
  const { domains, modules, tasks, progress } = useApp();
  const navigate = useNavigate();

  const currentModule =
    modules.find((m) => m.id === progress.currentModuleId) || modules[0];

  const currentLevel =
    progress.completedModuleIds.length >= 6
      ? 'Advanced'
      : progress.completedModuleIds.length >= 2
      ? 'Intermediate'
      : 'Beginner';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Adaptive Learning Path"
        description="Structured progression from Python Fundamentals through NumPy, Pandas, Scikit-learn, Robotics Kinematics, and ROS 2."
        actions={
          <button
            type="button"
            onClick={() => navigate(`/associate/modules/${currentModule.id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <span>Continue Current Milestone</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        }
      />

      {/* Learner Level, Next Milestone, Weekly Goal & Badges Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Current Proficiency Level</div>
          <div className="mt-1.5 text-xl font-bold text-[#37852d] dark:text-[#84E179] font-display">{currentLevel}</div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Based on assessments & completed labs</div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Next Milestone</div>
          <div className="mt-1.5 text-sm font-bold text-[#111827] dark:text-slate-100 truncate">{currentModule.title}</div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Module {currentModule.order} of {modules.length}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Weekly Goal</div>
          <div className="mt-1.5 text-xl font-bold text-[#111827] dark:text-slate-100 tabular-nums font-display">
            {progress.weeklyGoalHours} hrs
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{progress.streakDays}-day active streak</div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Earned Badges</div>
          <div className="mt-1.5 text-xl font-bold text-[#111827] dark:text-slate-100 tabular-nums font-display">
            {progress.badges.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {progress.badges[0]?.title || 'Complete first task to earn badge'}
          </div>
        </div>
      </div>

      {/* Progression Track */}
      <div className="space-y-4">
        {modules
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((mod) => {
            const domain = domains.find((d) => d.id === mod.domainId);
            const modTasks = tasks.filter((t) => t.moduleId === mod.id);
            const doneTasks = modTasks.filter((t) => progress.completedTaskIds.includes(t.id)).length;
            const modPct =
              modTasks.length > 0
                ? Math.round((doneTasks / modTasks.length) * 100)
                : progress.completedModuleIds.includes(mod.id)
                ? 100
                : 0;

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

            const prereqTitles = mod.prerequisites
              .map((pid) => modules.find((m) => m.id === pid)?.title)
              .filter(Boolean);

            return (
              <div
                key={mod.id}
                className={`bg-white dark:bg-[#111827] border rounded-[10px] p-5 transition-colors ${
                  isCurrent ? 'border-[#53b947]' : 'border-[#E2E8F0] dark:border-slate-800'
                } ${!isUnlocked ? 'opacity-75' : ''}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-mono font-semibold text-slate-400 tabular-nums">
                        {String(mod.order).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-semibold text-[#37852d] dark:text-[#84E179]">{domain?.name}</span>
                      <StatusLabel status={status} />
                      <DifficultyText level={mod.difficulty} />
                    </div>

                    <h2 className="text-base font-bold text-[#111827] dark:text-slate-100">{mod.title}</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{mod.description}</p>

                    <MetaRow
                      items={[
                        `${modTasks.length} coding tasks`,
                        `${mod.estimatedHours}h estimated`,
                        prereqTitles.length > 0
                          ? `Prerequisites: ${prereqTitles.join(', ')}`
                          : 'No prerequisites',
                      ]}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 min-w-[180px]">
                    <div className="w-full sm:w-40 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        <span>Progress</span>
                        <span className="font-mono font-semibold text-[#111827] dark:text-slate-100">{modPct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${isCompleted ? 'bg-[#16A34A]' : 'bg-[#53b947]'}`}
                          style={{ width: `${modPct}%` }}
                        />
                      </div>
                    </div>

                    {isUnlocked ? (
                      <Link
                        to={`/associate/modules/${mod.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold whitespace-nowrap"
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Review Module</span>
                          </>
                        ) : (
                          <>
                            <Target className="w-3.5 h-3.5" />
                            <span>{isCurrent ? 'Continue Module' : 'Open Module'}</span>
                          </>
                        )}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Complete Prerequisite</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Earned Badges Showcase */}
      {progress.badges.length > 0 && (
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#D97706] dark:text-amber-400" />
            <span>Earned Engineering Badges</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {progress.badges.map((b) => (
              <div key={b.id} className="p-3.5 rounded-lg border border-[#E2E8F0] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-1">
                <div className="font-semibold text-[#111827] dark:text-slate-100">{b.title}</div>
                <p className="text-slate-600 dark:text-slate-300">{b.criteria}</p>
                <div className="text-[11px] text-slate-400">Earned {b.earnedAt}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
