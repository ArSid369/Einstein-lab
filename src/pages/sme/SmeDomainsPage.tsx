import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Archive,
  Copy,
  Edit3,
  LayoutGrid,
  List,
  Plus,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DomainIcon, MetaRow, PageHeader, StatusLabel } from '../../components/shared/UiPrimitives';

export const SmeDomainsPage: React.FC = () => {
  const { domains, modules, tasks, duplicateDomain, archiveDomain } = useApp();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft' | 'Archived'>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = domains.filter((d) => {
    const matchesQuery =
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.shortDescription.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesDiff =
      difficultyFilter === 'All' || d.difficultyRange.toLowerCase().includes(difficultyFilter.toLowerCase());
    return matchesQuery && matchesStatus && matchesDiff;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Domain Management"
        description="Search, configure, duplicate, and monitor publishing readiness across all robotics domains."
        actions={
          <button
            type="button"
            onClick={() => navigate('/sme/domains/new')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Domain</span>
          </button>
        }
      />

      {/* Filter & View Bar */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search domains..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#53b947]"
            />
          </div>

          <select
            aria-label="Filter by publication status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            aria-label="Filter by difficulty"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as typeof difficultyFilter)}
            className="px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
          >
            <option value="All">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-[#111827] dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-[#111827] dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-12 text-center">
          <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">No matching domains found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Adjust your filters or create a new robotics domain.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((domain) => {
            const modCount = modules.filter((m) => m.domainId === domain.id).length;
            const taskCount = tasks.filter((t) => t.domainId === domain.id).length;
            return (
              <div
                key={domain.id}
                className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          domain.accentColor.toLowerCase() === '#53b947' ? 'text-[#0B1A09]' : 'text-white'
                        }`}
                        style={{ backgroundColor: domain.accentColor }}
                      >
                        <DomainIcon iconKey={domain.iconKey} />
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/sme/domains/${domain.id}`}
                          className="text-base font-semibold text-[#111827] dark:text-slate-100 hover:text-[#37852d] dark:hover:text-[#84E179] truncate block"
                        >
                          {domain.name}
                        </Link>
                        <StatusLabel status={domain.status} />
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{domain.shortDescription}</p>

                  <MetaRow
                    className="mt-3 tabular-nums"
                    items={[domain.difficultyRange, `${modCount} modules`, `${taskCount} tasks`]}
                  />

                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Content Coverage</span>
                      <div className="font-semibold text-[#111827] dark:text-slate-100 tabular-nums">{domain.contentCoverage}%</div>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Assessment Readiness</span>
                      <div className="font-semibold text-[#111827] dark:text-slate-100 tabular-nums">{domain.assessmentReadiness}%</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 truncate">
                    {domain.owner} · {domain.updatedAt}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => navigate(`/sme/domains/${domain.id}/edit`)}
                      className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-[#111827] dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit domain"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateDomain(domain.id)}
                      className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-[#111827] dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Duplicate domain"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => archiveDomain(domain.id)}
                      className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-[#DC2626] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                      title="Archive domain"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/70">
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4 text-right">Coverage</th>
                <th className="py-3 px-4 text-right">Readiness</th>
                <th className="py-3 px-4">Owner & Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800 text-xs">
              {filtered.map((domain) => (
                <tr key={domain.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-semibold text-[#111827] dark:text-slate-100">
                    <Link to={`/sme/domains/${domain.id}`} className="hover:text-[#37852d] dark:hover:text-[#84E179]">
                      {domain.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <StatusLabel status={domain.status} />
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{domain.difficultyRange}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">{domain.contentCoverage}%</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-200">{domain.assessmentReadiness}%</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {domain.owner} · {domain.updatedAt}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/sme/domains/${domain.id}/edit`)}
                        className="text-[#37852d] dark:text-[#84E179] font-medium hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateDomain(domain.id)}
                        className="text-slate-600 dark:text-slate-300 font-medium hover:underline"
                      >
                        Duplicate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
