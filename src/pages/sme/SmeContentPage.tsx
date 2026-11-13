import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ContentType, LessonContent, PublicationStatus } from '../../types/newtonlab';
import { MetaRow, PageHeader, StatusLabel } from '../../components/shared/UiPrimitives';

const CONTENT_TYPES: ContentType[] = [
  'Written Lesson',
  'Documentation',
  'Video',
  'Code Example',
  'Practice Exercise',
  'Coding Lab',
  'Reference Resource',
];

export const SmeContentPage: React.FC = () => {
  const { domains, modules, contents, saveContent, duplicateContent } = useApp();

  const [selectedDomainId, setSelectedDomainId] = useState<string>('ALL');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusTab, setStatusTab] = useState<'ALL' | 'Published' | 'Draft'>('ALL');
  const [search, setSearch] = useState('');

  const [previewItem, setPreviewItem] = useState<LessonContent | null>(null);
  const [editingItem, setEditingItem] = useState<LessonContent | null>(null);

  const visibleModules =
    selectedDomainId === 'ALL'
      ? modules
      : modules.filter((m) => m.domainId === selectedDomainId);

  const filteredContents = contents.filter((c) => {
    const matchDomain = selectedDomainId === 'ALL' || c.domainId === selectedDomainId;
    const matchModule = selectedModuleId === 'ALL' || c.moduleId === selectedModuleId;
    const matchType = typeFilter === 'ALL' || c.type === typeFilter;
    const matchStatus = statusTab === 'ALL' || c.status === statusTab;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.summary.toLowerCase().includes(search.toLowerCase());
    return matchDomain && matchModule && matchType && matchStatus && matchSearch;
  });

  // Content health: modules missing published content
  const modulesMissingContent = modules.filter(
    (m) => !contents.some((c) => c.moduleId === m.id && c.status === 'Published')
  );

  const openNewContent = () => {
    const domId = selectedDomainId === 'ALL' ? domains[0].id : selectedDomainId;
    const modId =
      selectedModuleId === 'ALL'
        ? modules.find((m) => m.domainId === domId)?.id || modules[0].id
        : selectedModuleId;
    setEditingItem({
      id: `cnt-${Date.now()}`,
      domainId: domId,
      moduleId: modId,
      title: '',
      type: 'Written Lesson',
      status: 'Draft',
      durationMinutes: 15,
      summary: '',
      body: '',
      codeSnippet: '',
      updatedAt: '2026-11-12',
      author: 'Dr. Elena Vance',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Content Management"
        description="Organize written lessons, reference documentation, code examples, videos, and robotics labs across modules."
        actions={
          <button
            type="button"
            onClick={openNewContent}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Content</span>
          </button>
        }
      />

      {/* Content Health Advisory */}
      {modulesMissingContent.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-[10px] px-4 py-3 flex items-center justify-between gap-4 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#D97706] dark:text-amber-400 shrink-0" />
            <span>
              <span className="font-semibold">{modulesMissingContent.length} modules</span> currently have no published lesson material ({modulesMissingContent.slice(0, 2).map((m) => m.title).join(', ')}).
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const m = modulesMissingContent[0];
              setSelectedDomainId(m.domainId);
              setSelectedModuleId(m.id);
              openNewContent();
            }}
            className="font-semibold text-[#37852d] dark:text-[#84E179] hover:underline whitespace-nowrap shrink-0"
          >
            Add Lesson
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Hierarchical Domain & Module Tree */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4 space-y-3">
          <h2 className="text-xs font-semibold text-[#111827] dark:text-slate-100">Domain & Module Hierarchy</h2>
          <button
            type="button"
            onClick={() => {
              setSelectedDomainId('ALL');
              setSelectedModuleId('ALL');
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
              selectedDomainId === 'ALL'
                ? 'bg-[#EBF7E9] dark:bg-[#53b947]/20 text-[#2D7525] dark:text-[#84E179] font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Domains ({contents.length})
          </button>

          <div className="space-y-2">
            {domains.map((d) => {
              const dMods = modules.filter((m) => m.domainId === d.id);
              const isDomSelected = selectedDomainId === d.id;
              return (
                <div key={d.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDomainId(d.id);
                      setSelectedModuleId('ALL');
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isDomSelected && selectedModuleId === 'ALL'
                        ? 'bg-[#EBF7E9] dark:bg-[#53b947]/20 text-[#2D7525] dark:text-[#84E179]'
                        : 'text-[#111827] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {d.name}
                  </button>
                  <div className="pl-3 space-y-0.5">
                    {dMods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedDomainId(d.id);
                          setSelectedModuleId(m.id);
                        }}
                        className={`w-full text-left px-2.5 py-1 rounded text-[11px] truncate block ${
                          selectedModuleId === m.id
                            ? 'bg-slate-100 dark:bg-slate-800 text-[#2D7525] dark:text-[#84E179] font-semibold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-[#111827] dark:hover:text-slate-100'
                        }`}
                      >
                        {m.order}. {m.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Library */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search lessons & resources..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>

              <select
                aria-label="Filter by content type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
              >
                <option value="ALL">All Content Types</option>
                {CONTENT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(['ALL', 'Published', 'Draft'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusTab(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                    statusTab === tab
                      ? 'bg-white dark:bg-slate-700 text-[#111827] dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab}
                </button>
              ))}
            </div>
          </div>

          {filteredContents.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-12 text-center">
              <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">No learning materials match this view</p>
              <button
                type="button"
                onClick={openNewContent}
                className="mt-3 px-4 py-2 rounded-lg bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold"
              >
                Create Learning Content
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContents.map((item) => {
                const modName = modules.find((m) => m.id === item.moduleId)?.title || 'Module';
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100">{item.title}</h3>
                        <StatusLabel status={item.status} />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{item.summary}</p>
                      <MetaRow
                        items={[
                          item.type,
                          modName,
                          `${item.durationMinutes} min`,
                          `Updated ${item.updatedAt}`,
                        ]}
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-[#111827] dark:text-slate-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-[#111827] dark:text-slate-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateContent(item.id)}
                        className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {item.status === 'Draft' && (
                        <button
                          type="button"
                          onClick={() => saveContent({ ...item, status: 'Published', updatedAt: '2026-11-12' })}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#16A34A] text-white text-xs font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Publish</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-[10px] border border-[#E2E8F0] dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <MetaRow items={[previewItem.type, `${previewItem.durationMinutes} min`, previewItem.author]} />
                <h2 className="text-lg font-bold text-[#111827] dark:text-slate-100 mt-1">{previewItem.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#111827] dark:hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{previewItem.body}</p>
            {previewItem.codeSnippet && (
              <pre className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 text-slate-100 text-xs font-mono overflow-x-auto">
                {previewItem.codeSnippet}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Content Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-[10px] border border-[#E2E8F0] dark:border-slate-800 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#111827] dark:text-slate-100">Edit Learning Material</h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#111827] dark:hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Title</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Content Type</label>
                <select
                  value={editingItem.type}
                  onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as ContentType })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                >
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Module</label>
                <select
                  value={editingItem.moduleId}
                  onChange={(e) => {
                    const m = modules.find((mod) => mod.id === e.target.value);
                    setEditingItem({
                      ...editingItem,
                      moduleId: e.target.value,
                      domainId: m ? m.domainId : editingItem.domainId,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                >
                  {(visibleModules.length > 0 ? visibleModules : modules).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Summary</label>
                <input
                  type="text"
                  value={editingItem.summary}
                  onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Lesson Body</label>
                <textarea
                  rows={4}
                  value={editingItem.body}
                  onChange={(e) => setEditingItem({ ...editingItem, body: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Optional Code Snippet</label>
                <textarea
                  rows={3}
                  value={editingItem.codeSnippet || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, codeSnippet: e.target.value })}
                  className="w-full px-3 py-2 font-mono rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {(['Draft', 'Published'] as PublicationStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    saveContent({
                      ...editingItem,
                      title: editingItem.title || 'Untitled Learning Material',
                      status: st,
                      updatedAt: '2026-11-12',
                    });
                    setEditingItem(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                    st === 'Published'
                      ? 'bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09]'
                      : 'border border-[#E2E8F0] dark:border-slate-700 text-[#111827] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Save as {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
