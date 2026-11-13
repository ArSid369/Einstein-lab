import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FolderPlus,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DomainIcon, MetaRow, PageHeader, StatusLabel } from '../../components/shared/UiPrimitives';

export const SmeDashboardPage: React.FC = () => {
  const { domains, modules, tasks, assessments, contents, results } = useApp();
  const navigate = useNavigate();

  const totalQuestions = assessments.reduce((acc, a) => acc + a.questions.length, 0);
  const publishedDomains = domains.filter((d) => d.status === 'Published').length;
  const draftDomains = domains.filter((d) => d.status === 'Draft').length;

  const kpis = [
    { label: 'Total Domains', value: domains.length, detail: `${publishedDomains} published · ${draftDomains} draft` },
    { label: 'Learning Modules', value: modules.length, detail: 'Across 6 robotics tracks' },
    { label: 'Assessment Questions', value: totalQuestions, detail: 'MC & coding evaluations' },
    { label: 'Coding Tasks', value: tasks.length, detail: 'With automated test suites' },
    { label: 'Assessments', value: assessments.length, detail: `${assessments.filter((a) => a.status === 'Published').length} active` },
  ];

  const recentActivity = [
    {
      title: 'Updated Obstacle-Avoiding Rover Waypoint Planner',
      meta: 'Robotics Fundamentals · 2 public tests verified',
      time: 'Today, 14:20',
      route: '/sme/tasks/task-rob-1',
    },
    {
      title: 'Published NumPy Transformations & LiDAR Arrays Check',
      meta: 'NumPy · 29 learner attempts · 78% avg',
      time: 'Yesterday',
      route: '/sme/assessments/assess-mod-np/edit',
    },
    {
      title: 'Drafted ROS 2 QoS Profiles Reference Resource',
      meta: 'ROS · Pending SME review',
      time: '2 days ago',
      route: '/sme/content',
    },
    {
      title: `${results.length} Recent Assessment Submissions Logged`,
      meta: 'Cohort Alpha & Cohort Beta',
      time: '3 days ago',
      route: '/sme/reports',
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="SME Curriculum & Analytics Console"
        description="Manage robotics domains, author AI-assisted coding tasks, configure adaptive assessments, and monitor cohort performance."
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate('/sme/tasks')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#111827] dark:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#37852d] dark:text-[#84E179]" />
              <span>AI Task Editor</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/sme/domains/new')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Domain</span>
            </button>
          </>
        }
      />

      {/* 5-Column KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4 flex flex-col justify-between"
          >
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{kpi.label}</div>
            <div className="mt-2 text-2xl font-bold text-[#111827] dark:text-slate-100 tabular-nums font-display">
              {kpi.value}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{kpi.detail}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Publishing Status + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4">
          <h2 className="text-base font-semibold text-[#111827] dark:text-slate-100">Quick Authoring Actions</h2>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              {
                label: 'Create New Domain',
                sub: 'Configure curriculum track & module sequence',
                to: '/sme/domains/new',
                icon: FolderPlus,
              },
              {
                label: 'Open AI Task Editor',
                sub: 'Refine instructions & generate edge-case tests',
                to: '/sme/tasks',
                icon: Sparkles,
              },
              {
                label: 'Manage Learning Content',
                sub: `${contents.length} lessons, labs & documentation items`,
                to: '/sme/content',
                icon: BookOpen,
              },
              {
                label: 'Build Assessment',
                sub: 'Configure MC, coding items & skill-mapping rules',
                to: '/sme/assessments/new',
                icon: ClipboardCheck,
              },
              {
                label: 'Generate Cohort Report',
                sub: 'Analytics, struggling learners & AI insights',
                to: '/sme/reports',
                icon: BarChart3,
              },
            ].map((act) => {
              const Icon = act.icon;
              return (
                <Link
                  key={act.to}
                  to={act.to}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] dark:border-slate-800 hover:border-[#53b947] dark:hover:border-[#53b947] hover:bg-[#EBF7E9]/45 dark:hover:bg-[#53b947]/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 text-[#37852d] dark:text-[#84E179] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#111827] dark:text-slate-100 truncate">{act.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{act.sub}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-[#111827] dark:text-slate-100">Publishing Status & Recent Activity</h2>
              <Link to="/sme/domains" className="text-xs font-medium text-[#37852d] dark:text-[#84E179] hover:underline">
                View all domains
              </Link>
            </div>

            {/* Publishing Health Summary */}
            <div className="grid grid-cols-3 gap-4 py-3 border-y border-[#E2E8F0] dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Published Tasks</span>
                <div className="mt-0.5 font-semibold text-[#111827] dark:text-slate-100 tabular-nums">
                  {tasks.filter((t) => t.status === 'Published').length} / {tasks.length}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Published Content</span>
                <div className="mt-0.5 font-semibold text-[#111827] dark:text-slate-100 tabular-nums">
                  {contents.filter((c) => c.status === 'Published').length} / {contents.length}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Published Assessments</span>
                <div className="mt-0.5 font-semibold text-[#111827] dark:text-slate-100 tabular-nums">
                  {assessments.filter((a) => a.status === 'Published').length} / {assessments.length}
                </div>
              </div>
            </div>
          </div>

          <ul className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
            {recentActivity.map((act, idx) => (
              <li key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    to={act.route}
                    className="text-sm font-medium text-[#111827] dark:text-slate-100 hover:text-[#37852d] dark:hover:text-[#84E179] transition-colors truncate block"
                  >
                    {act.title}
                  </Link>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{act.meta}</div>
                </div>
                <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap shrink-0">
                  {act.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Domain Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#111827] dark:text-slate-100">Learning Domains & Health</h2>
          <Link to="/sme/domains" className="text-xs font-semibold text-[#37852d] dark:text-[#84E179] hover:underline">
            Manage Domains
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {domains.map((domain) => {
            const modCount = modules.filter((m) => m.domainId === domain.id).length;
            const taskCount = tasks.filter((t) => t.domainId === domain.id).length;
            const qCount = assessments
              .filter((a) => a.domainId === domain.id)
              .reduce((acc, a) => acc + a.questions.length, 0);

            return (
              <div
                key={domain.id}
                className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
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
                        <DomainIcon iconKey={domain.iconKey} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-[#111827] dark:text-slate-100 truncate">{domain.name}</h3>
                        <StatusLabel status={domain.status} />
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{domain.shortDescription}</p>

                  <MetaRow
                    className="mt-4 tabular-nums"
                    items={[
                      `${modCount} modules`,
                      `${qCount} questions`,
                      `${taskCount} coding tasks`,
                    ]}
                  />
                </div>

                <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    Health: <span className="font-semibold text-[#111827] dark:text-slate-100">{domain.contentCoverage}%</span> coverage
                  </div>
                  <Link
                    to={`/sme/domains/${domain.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#37852d] dark:text-[#84E179] hover:text-[#2D7525] dark:hover:text-[#A5EC9C] whitespace-nowrap"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
