import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit3, Plus, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssessmentType } from '../../types/newtonlab';
import { PageHeader, StatusLabel } from '../../components/shared/UiPrimitives';

const ASSESSMENT_TYPES: AssessmentType[] = [
  'Pre-Assessment',
  'Module Assessment',
  'Practical Coding Assessment',
  'Final Assessment',
];

export const SmeAssessmentsPage: React.FC = () => {
  const { assessments, domains } = useApp();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');

  const publishedCount = assessments.filter((a) => a.status === 'Published').length;
  const draftCount = assessments.filter((a) => a.status === 'Draft').length;
  const activeWithAttempts = assessments.filter((a) => a.attemptsCount > 0);
  const avgScore = activeWithAttempts.length
    ? Math.round(activeWithAttempts.reduce((acc, a) => acc + a.avgScore, 0) / activeWithAttempts.length)
    : 0;
  const avgCompletion = activeWithAttempts.length
    ? Math.round(
        activeWithAttempts.reduce((acc, a) => acc + a.completionRate, 0) / activeWithAttempts.length
      )
    : 0;

  const filtered = assessments.filter((a) => {
    const matchQ =
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.description.toLowerCase().includes(query.toLowerCase());
    const matchType = typeFilter === 'ALL' || a.type === typeFilter;
    const matchDom = domainFilter === 'ALL' || a.domainId === domainFilter;
    return matchQ && matchType && matchDom;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Management"
        description="Configure pre-assessments, module gates, practical coding evaluations, and skill-mapping thresholds."
        actions={
          <button
            type="button"
            onClick={() => navigate('/sme/assessments/new')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assessment</span>
          </button>
        }
      />

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Assessments', value: assessments.length },
          { label: 'Published', value: publishedCount },
          { label: 'Drafts', value: draftCount },
          { label: 'Average Score', value: `${avgScore}%` },
          { label: 'Completion Rate', value: `${avgCompletion}%` },
        ].map((k) => (
          <div key={k.label} className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">{k.label}</div>
            <div className="mt-1.5 text-2xl font-bold text-[#111827] dark:text-slate-100 tabular-nums font-display">
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assessments..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <select
          aria-label="Filter by assessment type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
        >
          <option value="ALL">All Types</option>
          {ASSESSMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by domain"
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
        >
          <option value="ALL">All Domains</option>
          {domains.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Assessment Table */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <th className="py-3 px-4">Assessment</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Domain</th>
              <th className="py-3 px-4 text-right">Questions</th>
              <th className="py-3 px-4 text-right">Duration</th>
              <th className="py-3 px-4 text-right">Avg Score</th>
              <th className="py-3 px-4 text-right">Completion</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800 text-xs">
            {filtered.map((a) => {
              const domName = domains.find((d) => d.id === a.domainId)?.name || 'General';
              return (
                <tr key={a.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50">
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/sme/assessments/${a.id}/edit`}
                      className="font-semibold text-[#111827] dark:text-slate-100 hover:text-[#37852d] dark:hover:text-[#84E179]"
                    >
                      {a.title}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{a.type}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{domName}</td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">{a.questions.length}</td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">{a.durationMinutes}m</td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">
                    {a.attemptsCount > 0 ? `${a.avgScore}%` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">
                    {a.attemptsCount > 0 ? `${a.completionRate}% (${a.attemptsCount})` : '0'}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusLabel status={a.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/sme/assessments/${a.id}/edit`}
                      className="inline-flex items-center gap-1 text-[#37852d] dark:text-[#84E179] font-semibold hover:underline whitespace-nowrap"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Configure</span>
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
