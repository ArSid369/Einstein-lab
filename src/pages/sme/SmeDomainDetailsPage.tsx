import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Code2,
  Edit3,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  DifficultyText,
  DomainIcon,
  MetaRow,
  PageHeader,
  StatusLabel,
} from '../../components/shared/UiPrimitives';

export const SmeDomainDetailsPage: React.FC = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const { domains, modules, tasks, contents, assessments, createTask } = useApp();

  const domain = domains.find((d) => d.id === domainId) || domains[0];
  const domainModules = modules
    .filter((m) => m.domainId === domain.id)
    .sort((a, b) => a.order - b.order);

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    domainModules.forEach((m, i) => {
      if (i === 0) initial[m.id] = true;
    });
    return initial;
  });

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const domainTasks = tasks.filter((t) => t.domainId === domain.id);
  const domainAssessments = assessments.filter((a) => a.domainId === domain.id);
  const totalQuestions = domainAssessments.reduce((acc, a) => acc + a.questions.length, 0);

  return (
    <div className="space-y-6">
      <Link
        to="/sme/domains"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#111827] dark:hover:text-slate-100"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Domains</span>
      </Link>

      <PageHeader
        title={domain.name}
        description={domain.detailedOverview}
        actions={
          <button
            type="button"
            onClick={() => navigate(`/sme/domains/${domain.id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Domain</span>
          </button>
        }
      />

      {/* Domain Summary & Publishing Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  domain.accentColor.toLowerCase() === '#53b947' ? 'text-[#0B1A09]' : 'text-white'
                }`}
                style={{ backgroundColor: domain.accentColor }}
              >
                <DomainIcon iconKey={domain.iconKey} />
              </div>
              <div>
                <StatusLabel status={domain.status} />
                <MetaRow
                  className="mt-1"
                  items={[
                    domain.difficultyRange,
                    `${domain.estimatedHours}h estimated`,
                    `Owner: ${domain.owner}`,
                  ]}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-5 text-right tabular-nums">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Modules</div>
                <div className="text-lg font-bold text-[#111827] dark:text-slate-100">{domainModules.length}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Coding Tasks</div>
                <div className="text-lg font-bold text-[#111827] dark:text-slate-100">{domainTasks.length}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Questions</div>
                <div className="text-lg font-bold text-[#111827] dark:text-slate-100">{totalQuestions}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-[#111827] dark:text-slate-100 mb-2">Learning Objectives</h3>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
                {domain.learningObjectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#111827] dark:text-slate-100 mb-2">Prerequisites</h3>
              {domain.prerequisites.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
                  {domain.prerequisites.map((pre, idx) => (
                    <li key={idx}>{pre}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">No prior prerequisites required.</p>
              )}
            </div>
          </div>
        </div>

        {/* Publishing-Readiness Summary */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Publishing Readiness Summary</h2>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600 dark:text-slate-300">Content Coverage</span>
                <span className="font-mono font-semibold tabular-nums text-[#111827] dark:text-slate-100">{domain.contentCoverage}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#53b947]"
                  style={{ width: `${domain.contentCoverage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600 dark:text-slate-300">Assessment Readiness</span>
                <span className="font-mono font-semibold tabular-nums text-[#111827] dark:text-slate-100">{domain.assessmentReadiness}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#16A34A]"
                  style={{ width: `${domain.assessmentReadiness}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <div>All published tasks include automated test cases.</div>
            <div>Last updated: {domain.updatedAt}</div>
          </div>
        </div>
      </div>

      {/* Expandable Modules Breakdown */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[#111827] dark:text-slate-100">Domain Modules & Curriculum Items</h2>

        {domainModules.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No modules added to this domain yet. Click Edit Domain to structure modules.
          </div>
        ) : (
          domainModules.map((mod) => {
            const modTasks = tasks.filter((t) => t.moduleId === mod.id);
            const modContents = contents.filter((c) => c.moduleId === mod.id);
            const modAssessments = assessments.filter((a) => a.moduleId === mod.id);
            const isOpen = !!expandedModules[mod.id];

            return (
              <div
                key={mod.id}
                className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-900/60 text-left transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-semibold text-[#111827] dark:text-slate-100">
                          {mod.order}. {mod.title}
                        </span>
                        <DifficultyText level={mod.difficulty} />
                        <StatusLabel status={mod.status} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{mod.description}</p>
                    </div>
                  </div>

                  <MetaRow
                    className="hidden sm:flex shrink-0 tabular-nums"
                    items={[
                      `${modContents.length} lessons`,
                      `${modTasks.length} tasks`,
                      `${mod.estimatedHours}h`,
                    ]}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#E2E8F0] dark:border-slate-800 space-y-4">
                    {/* Coding Tasks inside Module */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-[#37852d] dark:text-[#84E179]" />
                          <span>Coding Tasks</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            const created = createTask(mod.id, domain.id);
                            navigate(`/sme/tasks/${created.id}`);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#37852d] dark:text-[#84E179] hover:underline"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Task</span>
                        </button>
                      </div>

                      {modTasks.length === 0 ? (
                        <p className="text-xs text-slate-400">No coding tasks in this module yet.</p>
                      ) : (
                        <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800 border border-[#E2E8F0] dark:border-slate-800 rounded-lg">
                          {modTasks.map((t) => (
                            <div
                              key={t.id}
                              className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0">
                                <span className="font-medium text-[#111827] dark:text-slate-100">{t.title}</span>
                                <MetaRow
                                  className="mt-0.5 tabular-nums"
                                  items={[
                                    t.taskType,
                                    t.difficulty,
                                    `${t.testCases.length} test cases`,
                                  ]}
                                />
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <StatusLabel status={t.status} />
                                <Link
                                  to={`/sme/tasks/${t.id}`}
                                  className="font-semibold text-[#37852d] dark:text-[#84E179] hover:underline whitespace-nowrap"
                                >
                                  Open Editor
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Lessons & Assessments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                          <BookOpen className="w-3.5 h-3.5 text-[#0284C7] dark:text-sky-400" />
                          <span>Lessons & Resources</span>
                        </h4>
                        {modContents.length === 0 ? (
                          <p className="text-xs text-slate-400">No lessons attached yet.</p>
                        ) : (
                          <ul className="space-y-1.5 text-xs">
                            {modContents.map((c) => (
                              <li key={c.id} className="flex items-center justify-between gap-2 py-1">
                                <span className="text-slate-700 dark:text-slate-300 truncate">{c.title}</span>
                                <StatusLabel status={c.status} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                          <ClipboardCheck className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400" />
                          <span>Module Assessments</span>
                        </h4>
                        {modAssessments.length === 0 ? (
                          <p className="text-xs text-slate-400">No linked module assessment.</p>
                        ) : (
                          <ul className="space-y-1.5 text-xs">
                            {modAssessments.map((a) => (
                              <li key={a.id} className="flex items-center justify-between gap-2 py-1">
                                <Link
                                  to={`/sme/assessments/${a.id}/edit`}
                                  className="text-[#37852d] dark:text-[#84E179] font-medium hover:underline truncate"
                                >
                                  {a.title} ({a.questions.length} Qs)
                                </Link>
                                <StatusLabel status={a.status} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
