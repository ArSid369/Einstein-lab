import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, ClipboardCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader, StatusLabel } from '../../components/shared/UiPrimitives';

export const AssessmentHistoryPage: React.FC = () => {
  const { currentUser, results, assessments, domains, theme } = useApp();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const userResults = results.filter((r) => r.learnerId === (currentUser?.id || 'user-assoc-1'));
  const displayResults = userResults.length > 0 ? userResults : results.slice(0, 2);

  const avgScore = Math.round(
    displayResults.reduce((acc, r) => acc + r.scorePercent, 0) / Math.max(1, displayResults.length)
  );
  const bestScore = Math.max(...displayResults.map((r) => r.scorePercent));

  const trendData = displayResults
    .slice()
    .reverse()
    .map((r, i) => ({
      attempt: `#${i + 1} ${r.assessmentType.split(' ')[0]}`,
      score: r.scorePercent,
    }));

  const nextAssessment =
    assessments.find(
      (a) => a.status === 'Published' && !displayResults.some((r) => r.assessmentId === a.id && r.passed)
    ) || assessments[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment History"
        description="Review past pre-assessments, module evaluations, score progression, and recommended next checks."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Assessments Completed', value: displayResults.length },
          { label: 'Average Score', value: `${avgScore}%` },
          { label: 'Best Score', value: `${bestScore}%` },
          { label: 'Skills Verified', value: `${displayResults.filter((r) => r.passed).length * 2}` },
        ].map((k) => (
          <div key={k.label} className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">{k.label}</div>
            <div className="mt-1.5 text-2xl font-bold text-[#111827] dark:text-slate-100 font-display tabular-nums">
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Score Trend + Recommended Next Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5">
          <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100 mb-4">Assessment Score Trend</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} />
                <XAxis dataKey="attempt" tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    color: isDark ? '#F1F5F9' : '#111827',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#53b947" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#37852d] dark:text-[#84E179]">
              <ClipboardCheck className="w-4 h-4" />
              <span>Recommended Next Assessment</span>
            </div>
            <h3 className="text-base font-bold text-[#111827] dark:text-slate-100">{nextAssessment.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">{nextAssessment.description}</p>
            <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {nextAssessment.questions.length} questions · {nextAssessment.durationMinutes} minutes
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/associate/assessment/${nextAssessment.id}`)}
            className="w-full py-2.5 px-4 rounded-lg bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <span>Launch Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <th className="py-3 px-4">Assessment</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Domain</th>
              <th className="py-3 px-4">Completed</th>
              <th className="py-3 px-4 text-right">Time</th>
              <th className="py-3 px-4 text-right">Score</th>
              <th className="py-3 px-4">Result</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800 text-xs">
            {displayResults.map((r) => {
              const domName = domains.find((d) => d.id === r.domainId)?.name || 'General';
              return (
                <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50">
                  <td className="py-3.5 px-4 font-semibold text-[#111827] dark:text-slate-100">{r.assessmentTitle}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{r.assessmentType}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{domName}</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono tabular-nums">{r.submittedAt}</td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">{r.timeTakenMinutes}m</td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums text-[#111827] dark:text-slate-100">
                    {r.scorePercent}%
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusLabel status={r.passed ? 'Passed' : 'Failed'} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/associate/results/${r.id}`}
                      className="font-semibold text-[#37852d] dark:text-[#84E179] hover:underline whitespace-nowrap"
                    >
                      Review Results
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
