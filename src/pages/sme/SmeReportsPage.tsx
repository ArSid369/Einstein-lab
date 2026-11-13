import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CalendarClock,
  CheckCircle2,
  Download,
  Printer,
  Save,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/shared/UiPrimitives';

const REPORT_TYPES = [
  'Combined Assignment and Assessment Report',
  'Assignment Performance',
  'Assessment Performance',
  'Learner Progress',
  'Domain Performance',
];

export const SmeReportsPage: React.FC = () => {
  const { domains, cohorts, results, savedReports, addSavedReport, addNotification, theme } = useApp();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [cohortFilter, setCohortFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const [aiInsights, setAiInsights] = useState<{
    executiveSummary: string;
    recommendations: Array<{
      id: string;
      title: string;
      description: string;
      actionType: string;
      targetLabel: string;
    }>;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [scheduleFreq, setScheduleFreq] = useState<'None' | 'Weekly' | 'Monthly'>('Weekly');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const filteredResults = results.filter((r) => {
    const matchDom = domainFilter === 'ALL' || r.domainId === domainFilter;
    const matchCoh = cohortFilter === 'ALL' || r.cohortId === cohortFilter;
    return matchDom && matchCoh;
  });

  const avgScore = filteredResults.length
    ? Math.round(filteredResults.reduce((acc, r) => acc + r.scorePercent, 0) / filteredResults.length)
    : 79;
  const passRate = filteredResults.length
    ? Math.round((filteredResults.filter((r) => r.passed).length / filteredResults.length) * 100)
    : 82;

  const scoreDistData = [
    { band: '0–49%', learners: 2 },
    { band: '50–64%', learners: filteredResults.filter((r) => r.scorePercent >= 50 && r.scorePercent < 65).length + 3 },
    { band: '65–79%', learners: 11 },
    { band: '80–89%', learners: 16 },
    { band: '90–100%', learners: filteredResults.filter((r) => r.scorePercent >= 90).length + 12 },
  ];

  const completionTrendData = [
    { week: 'Wk 1', completion: 62, avgScore: 71 },
    { week: 'Wk 2', completion: 71, avgScore: 74 },
    { week: 'Wk 3', completion: 78, avgScore: 77 },
    { week: 'Wk 4', completion: 85, avgScore: avgScore },
  ];

  const difficultItems = [
    { item: 'PID Zero-Velocity Saturation Clamp', domain: 'Robotics Fundamentals', failRate: '41%', avgAttempts: 2.8 },
    { item: 'SO(2) Determinant & Inverse Transform', domain: 'NumPy', failRate: '34%', avgAttempts: 2.3 },
    { item: 'TF2 odom → base_link Frame Ordering', domain: 'ROS 2', failRate: '29%', avgAttempts: 2.1 },
  ];

  const strugglingLearners = filteredResults.filter((r) => r.scorePercent < 70);

  const handleGenerateAiInsights = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/report-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          filters: {
            domain: domainFilter === 'ALL' ? 'All Domains' : domains.find((d) => d.id === domainFilter)?.name,
            cohort: cohortFilter,
            dateRange,
          },
          metrics: { assignedLearners: 46, completionRate: 85, avgScore, passRate },
          difficultQuestions: difficultItems,
          strugglingLearners,
        }),
      });
      const data = await res.json();
      setAiInsights(data);
    } catch {
      setFeedbackMsg('Unable to generate AI insights right now.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportCsv = () => {
    const rows = [
      ['Learner', 'Assessment', 'Type', 'Score (%)', 'Passed', 'Time (min)', 'Submitted'],
      ...filteredResults.map((r) => [
        r.learnerName,
        r.assessmentTitle,
        r.assessmentType,
        String(r.scorePercent),
        r.passed ? 'Yes' : 'No',
        String(r.timeTakenMinutes),
        r.submittedAt,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newtonlab-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedbackMsg('Exported CSV report.');
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleSaveReport = (schedule: 'None' | 'Weekly' | 'Monthly') => {
    const domLabel = domainFilter === 'ALL' ? 'All Domains' : domains.find((d) => d.id === domainFilter)?.name || 'All Domains';
    const cohLabel = cohortFilter === 'ALL' ? 'All Cohorts' : cohorts.find((c) => c.id === cohortFilter)?.name || 'All Cohorts';
    addSavedReport({
      title: `${reportType} — ${domLabel}`,
      reportType,
      schedule,
      domainFilter: domLabel,
      cohortFilter: cohLabel,
      avgScore,
      completionRate: 85,
    });
    setFeedbackMsg(schedule === 'None' ? 'Report saved to library.' : `Scheduled ${schedule} report delivery.`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignment & Assessment Report Generator"
        description="Analyze cohort outcomes, pinpoint difficult test cases, export reports, and generate AI-driven remediation plans."
        actions={
          <div className="flex items-center gap-2 flex-wrap no-print">
            {feedbackMsg && (
              <span className="text-xs font-medium text-[#16A34A] dark:text-emerald-400 mr-2 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {feedbackMsg}
              </span>
            )}
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#111827] dark:text-slate-100 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#111827] dark:text-slate-100 whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveReport('None')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Report</span>
            </button>
          </div>
        }
      />

      {/* Filter & Report Builder Bar */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs no-print">
        <div>
          <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
          >
            {REPORT_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Domain</label>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
          >
            <option value="ALL">All Domains</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Cohort</label>
          <select
            value={cohortFilter}
            onChange={(e) => setCohortFilter(e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
          >
            <option value="ALL">All Cohorts</option>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Difficulty</label>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
          >
            <option value="ALL">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Quarter to Date">Quarter to Date</option>
          </select>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Assigned Learners', value: '46' },
          { label: 'Completion Rate', value: '85%' },
          { label: 'Average Score', value: `${avgScore}%` },
          { label: 'Pass Rate', value: `${passRate}%` },
          { label: 'Avg Time', value: '24m' },
          { label: 'Avg Attempts', value: '1.6' },
        ].map((m) => (
          <div key={m.label} className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">{m.label}</div>
            <div className="mt-1.5 text-xl font-bold text-[#111827] dark:text-slate-100 font-display tabular-nums">
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5">
          <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100 mb-4">Score Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} />
                <XAxis dataKey="band" tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    color: isDark ? '#F1F5F9' : '#111827',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="learners" fill="#53b947" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5">
          <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100 mb-4">Completion & Average Score Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    color: isDark ? '#F1F5F9' : '#111827',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="completion" name="Completion %" stroke="#53b947" strokeWidth={2.5} />
                <Line type="monotone" dataKey="avgScore" name="Avg Score %" stroke="#16A34A" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Report Insights */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#37852d] dark:text-[#84E179]" />
            <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100">AI Report Insights & Remediation</h2>
          </div>
          <button
            type="button"
            onClick={handleGenerateAiInsights}
            disabled={aiLoading}
            className="px-3.5 py-2 rounded-lg bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold disabled:opacity-50"
          >
            {aiLoading ? 'Analyzing...' : 'Generate AI Insights'}
          </button>
        </div>

        {aiInsights ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 dark:text-slate-200 bg-[#EBF7E9]/70 dark:bg-[#53b947]/15 border border-[#B6E2B0] dark:border-[#53b947]/40 rounded-lg p-3.5">
              {aiInsights.executiveSummary}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiInsights.recommendations.map((rec) => (
                <div key={rec.id} className="border border-[#E2E8F0] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[#111827] dark:text-slate-100">{rec.title}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{rec.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (rec.actionType === 'open-task-editor') {
                        navigate('/sme/tasks/task-rob-1');
                      } else {
                        addNotification({
                          category: 'learning',
                          title: rec.title,
                          message: rec.description,
                          roleTarget: 'ASSOCIATE',
                          actionLabel: 'Open Workspace',
                          actionRoute: '/associate/workspace',
                        });
                        setFeedbackMsg(`Action executed: ${rec.targetLabel}`);
                        setTimeout(() => setFeedbackMsg(null), 2500);
                      }
                    }}
                    className="self-start text-xs font-semibold text-[#37852d] dark:text-[#84E179] hover:underline"
                  >
                    {rec.targetLabel} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click Generate AI Insights to synthesize difficult test cases, struggling cohorts, and recommended follow-up actions.
          </p>
        )}
      </div>

      {/* Difficult Questions & Learners Requiring Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] dark:border-slate-800">
            <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Frequently Failed Test Cases & Items</h2>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-900/60">
                <th className="py-2.5 px-4">Item</th>
                <th className="py-2.5 px-4">Domain</th>
                <th className="py-2.5 px-4 text-right">Fail Rate</th>
                <th className="py-2.5 px-4 text-right">Avg Attempts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
              {difficultItems.map((d) => (
                <tr key={d.item}>
                  <td className="py-3 px-4 font-medium text-[#111827] dark:text-slate-100">{d.item}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{d.domain}</td>
                  <td className="py-3 px-4 text-right font-mono text-[#DC2626] dark:text-red-400 tabular-nums">{d.failRate}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">{d.avgAttempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Learners Requiring Additional Support</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">{strugglingLearners.length} flagged</span>
          </div>
          <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800 text-xs">
            {strugglingLearners.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">No learners below threshold in current filter.</div>
            ) : (
              strugglingLearners.map((r) => (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[#111827] dark:text-slate-100">{r.learnerName}</div>
                    <div className="text-slate-500 dark:text-slate-400">{r.assessmentTitle}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-[#DC2626] dark:text-red-400 tabular-nums">
                      {r.scorePercent}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        addNotification({
                          category: 'learning',
                          title: 'Supplemental Robotics Review Assigned',
                          message: `Recommended follow-up practice after ${r.assessmentTitle}.`,
                          roleTarget: 'ASSOCIATE',
                          actionLabel: 'Open Practice Lab',
                          actionRoute: '/associate/workspace',
                        });
                        setFeedbackMsg(`Assigned supplemental review to ${r.learnerName}.`);
                        setTimeout(() => setFeedbackMsg(null), 2500);
                      }}
                      className="text-[#37852d] dark:text-[#84E179] font-semibold hover:underline whitespace-nowrap"
                    >
                      Assign Support
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Schedule & Saved Reports */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-[#37852d] dark:text-[#84E179]" />
            <span>Schedule Recurring Report & Share</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {savedReports.length} saved reports · Automated snapshots delivered to SME stakeholders.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            aria-label="Recurring report schedule"
            value={scheduleFreq}
            onChange={(e) => setScheduleFreq(e.target.value as 'None' | 'Weekly' | 'Monthly')}
            className="px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
          >
            <option value="Weekly">Weekly Digest</option>
            <option value="Monthly">Monthly Executive</option>
          </select>
          <button
            type="button"
            onClick={() => handleSaveReport(scheduleFreq)}
            className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#111827] dark:text-slate-100"
          >
            Schedule Recurring
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).catch(() => {});
              setFeedbackMsg('Report share link copied to clipboard.');
              setTimeout(() => setFeedbackMsg(null), 2500);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#111827] dark:text-slate-100"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
