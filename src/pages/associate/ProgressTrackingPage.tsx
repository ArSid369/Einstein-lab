import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, Award, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader, StatusLabel } from '../../components/shared/UiPrimitives';

export const ProgressTrackingPage: React.FC = () => {
  const { modules, tasks, progress, updateWeeklyGoal, theme } = useApp();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const completionPct = Math.round(
    (progress.completedTaskIds.length / Math.max(1, tasks.length)) * 100
  );

  const tooltipStyle = {
    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
    borderColor: isDark ? '#334155' : '#E2E8F0',
    color: isDark ? '#F1F5F9' : '#111827',
    borderRadius: '8px',
    fontSize: '12px',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress & Skill Matrix"
        description="Measure robotics mastery over time, inspect domain proficiency, and calibrate weekly study targets."
        actions={
          <button
            type="button"
            onClick={() => navigate(`/associate/workspace/${progress.currentTaskId}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <span>Practice Current Lab</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        }
      />

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Program Completion</div>
          <div className="mt-1.5 text-2xl font-bold text-[#111827] dark:text-slate-100 font-display tabular-nums">
            {completionPct}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {progress.completedModuleIds.length} of {modules.length} modules completed
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Current Learning Streak</div>
          <div className="mt-1.5 text-2xl font-bold text-[#111827] dark:text-slate-100 font-display tabular-nums flex items-center gap-2">
            <span>{progress.streakDays} days</span>
            <Flame className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Consistent daily practice</div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Time Spent Learning</div>
          <div className="mt-1.5 text-2xl font-bold text-[#111827] dark:text-slate-100 font-display tabular-nums">
            {progress.hoursSpent}h
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Across labs & assessments</div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Tasks Completed</div>
          <div className="mt-1.5 text-2xl font-bold text-[#111827] dark:text-slate-100 font-display tabular-nums">
            {progress.completedTaskIds.length}/{tasks.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Automated tests verified</div>
        </div>
      </div>

      {/* Charts: Weekly Activity & Domain Proficiency Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5">
          <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100 mb-4">Weekly Coding & Simulation Minutes</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progress.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="minutes" fill="#53b947" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5">
          <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100 mb-4">Domain Proficiency vs Target</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={progress.skillProficiency}>
                <PolarGrid stroke={isDark ? '#1E293B' : '#E2E8F0'} />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: isDark ? '#CBD5E1' : '#475569' }} />
                <Radar
                  name="Current"
                  dataKey="score"
                  stroke="#53b947"
                  fill="#53b947"
                  fillOpacity={0.25}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#16A34A"
                  fill="#16A34A"
                  fillOpacity={0.08}
                />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skills Matrix & Weekly Learning Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Module Completion & Skills Matrix</h2>
          <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800 text-xs">
            {modules.map((m) => {
              const isDone = progress.completedModuleIds.includes(m.id);
              const isUnlocked = progress.unlockedModuleIds.includes(m.id);
              return (
                <div key={m.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-[#111827] dark:text-slate-100">
                      {m.order}. {m.title}
                    </span>
                    <span className="ml-2 text-slate-500 dark:text-slate-400">({m.difficulty})</span>
                  </div>
                  <StatusLabel status={isDone ? 'Completed' : isUnlocked ? 'Available' : 'Locked'} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {/* Weekly Goal Calibrator */}
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Weekly Learning Goal</h3>
            <div className="text-2xl font-bold text-[#37852d] dark:text-[#84E179] font-display tabular-nums">
              {progress.weeklyGoalHours} hrs / week
            </div>
            <input
              type="range"
              min={2}
              max={20}
              value={progress.weeklyGoalHours}
              onChange={(e) => updateWeeklyGoal(Number(e.target.value))}
              aria-label="Weekly learning goal hours"
              className="w-full accent-[#53b947]"
            />
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Personalized recommendation: focus 45 minutes on <span className="font-semibold text-[#111827] dark:text-slate-100">Robotics Kinematics</span> and <span className="font-semibold text-[#111827] dark:text-slate-100">ROS 2 Twist</span> to close your target gap.
            </p>
          </div>

          {/* Badges */}
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D97706] dark:text-amber-400" />
              <span>Achievements</span>
            </h3>
            {progress.badges.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">Complete coding labs to unlock engineering badges.</p>
            ) : (
              <ul className="space-y-2.5 text-xs">
                {progress.badges.map((b) => (
                  <li key={b.id} className="pb-2 border-b last:border-b-0 border-[#E2E8F0] dark:border-slate-800">
                    <div className="font-semibold text-[#111827] dark:text-slate-100">{b.title}</div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">{b.criteria}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
