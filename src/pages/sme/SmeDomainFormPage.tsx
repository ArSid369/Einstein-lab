import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Domain, Module } from '../../types/newtonlab';
import { DomainIcon, MetaRow, PageHeader, StatusLabel } from '../../components/shared/UiPrimitives';

export const SmeDomainFormPage: React.FC = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const { domains, modules, saveDomain } = useApp();

  const existing = domainId ? domains.find((d) => d.id === domainId) : undefined;
  const isEdit = Boolean(existing);

  const [name, setName] = useState(existing?.name || '');
  const [iconKey, setIconKey] = useState<Domain['iconKey']>(existing?.iconKey || 'robotics');
  const [accentColor, setAccentColor] = useState(existing?.accentColor || '#53b947');
  const [shortDescription, setShortDescription] = useState(existing?.shortDescription || '');
  const [detailedOverview, setDetailedOverview] = useState(existing?.detailedOverview || '');
  const [objectivesText, setObjectivesText] = useState(
    existing?.learningObjectives.join('\n') || 'Master core robotics workflows\nValidate solutions with unit tests'
  );
  const [prerequisitesText, setPrerequisitesText] = useState(existing?.prerequisites.join(', ') || '');
  const [difficultyRange, setDifficultyRange] = useState(existing?.difficultyRange || 'Beginner – Intermediate');
  const [estimatedHours, setEstimatedHours] = useState(existing?.estimatedHours || 8);
  const [owner, setOwner] = useState(existing?.owner || 'Dr. Elena Vance');

  const [outlineModules, setOutlineModules] = useState<Module[]>(() => {
    if (existing) {
      return modules.filter((m) => m.domainId === existing.id).sort((a, b) => a.order - b.order);
    }
    return [
      {
        id: `mod-${Date.now()}-1`,
        domainId: '',
        order: 1,
        title: 'Foundations & Setup',
        description: 'Core concepts and calibration exercises.',
        difficulty: 'Beginner',
        estimatedHours: 4,
        learningObjectives: ['Verify environment and baseline syntax'],
        prerequisites: [],
        status: 'Draft',
      },
    ];
  });

  const [newModTitle, setNewModTitle] = useState('');

  const moveModule = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= outlineModules.length) return;
    const next = [...outlineModules];
    [next[idx], next[target]] = [next[target], next[idx]];
    setOutlineModules(next.map((m, i) => ({ ...m, order: i + 1 })));
  };

  const addOutlineModule = () => {
    if (!newModTitle.trim()) return;
    setOutlineModules((prev) => [
      ...prev,
      {
        id: `mod-${Date.now()}`,
        domainId: existing?.id || '',
        order: prev.length + 1,
        title: newModTitle.trim(),
        description: 'Structured learning module with coding labs.',
        difficulty: 'Intermediate',
        estimatedHours: 4,
        learningObjectives: ['Complete module coding lab'],
        prerequisites: [],
        status: 'Draft',
      },
    ]);
    setNewModTitle('');
  };

  const handleSave = (status: 'Draft' | 'Published') => {
    const targetId = existing?.id || `dom-${Date.now()}`;
    const slug = (name || 'new-domain').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const domainObj: Domain = {
      id: targetId,
      name: name.trim() || 'Untitled Robotics Domain',
      slug,
      iconKey,
      accentColor,
      shortDescription: shortDescription.trim() || 'Structured robotics engineering domain.',
      detailedOverview: detailedOverview.trim() || shortDescription.trim() || 'Comprehensive hands-on robotics curriculum.',
      learningObjectives: objectivesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      prerequisites: prerequisitesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      difficultyRange,
      estimatedHours: Number(estimatedHours) || 6,
      owner: owner.trim() || 'Dr. Elena Vance',
      status,
      updatedAt: '2026-11-12',
      contentCoverage: existing?.contentCoverage ?? 60,
      assessmentReadiness: existing?.assessmentReadiness ?? 50,
    };

    const syncedModules = outlineModules.map((m, idx) => ({
      ...m,
      domainId: targetId,
      order: idx + 1,
      status,
    }));

    saveDomain(domainObj, syncedModules);
    navigate(`/sme/domains/${targetId}`);
  };

  return (
    <div className="space-y-6">
      <Link
        to={isEdit ? `/sme/domains/${domainId}` : '/sme/domains'}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#111827] dark:hover:text-slate-100"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </Link>

      <PageHeader
        title={isEdit ? `Edit Domain: ${existing?.name}` : 'Create Learning Domain'}
        description="Configure metadata, learning objectives, and reorderable module sequence."
        actions={
          <>
            <button
              type="button"
              onClick={() => handleSave('Draft')}
              className="px-4 py-2 rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#111827] dark:text-slate-100 whitespace-nowrap"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('Published')}
              className="px-4 py-2 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold whitespace-nowrap"
            >
              Publish Domain
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Fields */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Domain Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Computer Vision for Autonomous Rovers"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#53b947]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Domain Icon</label>
              <select
                value={iconKey}
                onChange={(e) => setIconKey(e.target.value as Domain['iconKey'])}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
              >
                <option value="python">Python Code</option>
                <option value="numpy">NumPy Matrix Grid</option>
                <option value="pandas">Pandas Analytics</option>
                <option value="sklearn">Scikit-learn ML</option>
                <option value="robotics">Robotics Kinematics</option>
                <option value="ros">ROS Network</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Display Color</label>
              <div className="flex items-center gap-2">
                {['#53b947', '#0284C7', '#0D9488', '#D97706', '#7C3AED', '#111827'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setAccentColor(col)}
                    className={`w-7 h-7 rounded-lg border-2 transition-transform ${
                      accentColor === col ? 'border-[#111827] dark:border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col }}
                    aria-label={`Select color ${col}`}
                  />
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Short Description</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Concise summary displayed on domain cards"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Detailed Overview</label>
              <textarea
                rows={3}
                value={detailedOverview}
                onChange={(e) => setDetailedOverview(e.target.value)}
                placeholder="Comprehensive explanation of domain scope and practical outcomes"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Learning Objectives (one per line)
              </label>
              <textarea
                rows={4}
                value={objectivesText}
                onChange={(e) => setObjectivesText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Prerequisites (comma-separated)
                </label>
                <input
                  type="text"
                  value={prerequisitesText}
                  onChange={(e) => setPrerequisitesText(e.target.value)}
                  placeholder="Python Fundamentals, NumPy"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Difficulty Range</label>
                  <select
                    value={difficultyRange}
                    onChange={(e) => setDifficultyRange(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Beginner – Intermediate">Beginner – Intermediate</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Intermediate – Advanced">Intermediate – Advanced</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 tabular-nums"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Content Owner</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Reorderable Module Outline */}
          <div className="pt-5 border-t border-[#E2E8F0] dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Reorderable Module Outline</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newModTitle}
                onChange={(e) => setNewModTitle(e.target.value)}
                placeholder="New module title..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={addOutlineModule}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-[#111827] dark:text-slate-100 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Module</span>
              </button>
            </div>

            <ul className="divide-y divide-[#E2E8F0] dark:divide-slate-800 border border-[#E2E8F0] dark:border-slate-800 rounded-lg">
              {outlineModules.map((mod, idx) => (
                <li key={mod.id} className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-slate-400 tabular-nums">{idx + 1}.</span>
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) =>
                        setOutlineModules((prev) =>
                          prev.map((m) => (m.id === mod.id ? { ...m, title: e.target.value } : m))
                        )
                      }
                      className="font-medium text-[#111827] dark:text-slate-100 bg-transparent border-b border-transparent focus:border-[#53b947] focus:outline-none min-w-[200px]"
                    />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveModule(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-[#111827] dark:hover:text-slate-100 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveModule(idx, 1)}
                      disabled={idx === outlineModules.length - 1}
                      className="p-1 text-slate-400 hover:text-[#111827] dark:hover:text-slate-100 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setOutlineModules((prev) =>
                          prev.filter((m) => m.id !== mod.id).map((m, i) => ({ ...m, order: i + 1 }))
                        )
                      }
                      className="p-1 text-slate-400 hover:text-[#DC2626] dark:hover:text-red-400"
                      title="Remove module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Live Domain Preview */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4 sticky top-6">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Live Card Preview</div>
          <div className="border border-[#E2E8F0] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-[10px] p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  accentColor.toLowerCase() === '#53b947' ? 'text-[#0B1A09]' : 'text-white'
                }`}
                style={{ backgroundColor: accentColor }}
              >
                <DomainIcon iconKey={iconKey} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#111827] dark:text-slate-100 truncate">
                  {name || 'Untitled Robotics Domain'}
                </div>
                <StatusLabel status={existing?.status || 'Draft'} />
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {shortDescription || 'Short summary of what associates will master in this domain.'}
            </p>

            <MetaRow
              items={[
                difficultyRange,
                `${outlineModules.length} modules`,
                `${estimatedHours}h`,
              ]}
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div>Owner: {owner}</div>
            <div>Modules will inherit publication state when saved.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
