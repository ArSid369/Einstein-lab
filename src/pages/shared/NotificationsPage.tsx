import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Bell, CheckCheck, ClipboardCheck, Cpu, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetaRow, PageHeader } from '../../components/shared/UiPrimitives';

export const NotificationsPage: React.FC = () => {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead, updateCurrentUser } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'learning' | 'assessment' | 'system'>('all');

  const roleFiltered = notifications.filter(
    (n) => n.roleTarget === 'ALL' || !currentUser || n.roleTarget === currentUser.role
  );

  const visible = roleFiltered.filter((n) => (filter === 'all' ? true : n.category === filter));
  const unreadCount = roleFiltered.filter((n) => !n.read).length;

  const prefs = currentUser?.preferences;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Updates on assigned assessments, unlocked robotics modules, and AI curriculum audits."
        actions={
          <button
            type="button"
            onClick={markAllNotificationsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-xs font-semibold text-[#111827] dark:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            <CheckCheck className="w-4 h-4 text-[#37852d] dark:text-[#84E179]" />
            <span>Mark all as read ({unreadCount})</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Notifications Stream */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'learning', label: 'Learning' },
                  { id: 'assessment', label: 'Assessment' },
                  { id: 'system', label: 'System' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    filter === tab.id
                      ? 'bg-white dark:bg-slate-900 text-[#111827] dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-[#111827] dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {visible.length} notifications
            </span>
          </div>

          {visible.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-[#111827] dark:text-slate-100">
                No notifications in this category
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                New activity will appear here automatically.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
              {visible.map((item) => {
                const Icon =
                  item.category === 'assessment'
                    ? ClipboardCheck
                    : item.category === 'system'
                    ? Sparkles
                    : Cpu;
                return (
                  <li
                    key={item.id}
                    className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                      !item.read
                        ? 'bg-[#EBF7E9]/45 dark:bg-[#53b947]/10'
                        : 'bg-white dark:bg-[#111827] hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          item.category === 'assessment'
                            ? 'bg-[#EBF7E9] dark:bg-[#53b947]/20 text-[#37852d] dark:text-[#84E179]'
                            : item.category === 'system'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100">
                            {item.title}
                          </h3>
                          {!item.read && (
                            <span className="text-[11px] font-semibold text-[#37852d] dark:text-[#84E179]">
                              Unread
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
                        <MetaRow
                          className="mt-2"
                          items={[
                            item.category.charAt(0).toUpperCase() + item.category.slice(1),
                            item.timestamp,
                          ]}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!item.read && (
                        <button
                          type="button"
                          onClick={() => markNotificationRead(item.id)}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#111827] dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
                        >
                          Mark read
                        </button>
                      )}
                      {item.actionRoute && (
                        <button
                          type="button"
                          onClick={() => {
                            markNotificationRead(item.id);
                            navigate(item.actionRoute!);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          <span>{item.actionLabel || 'Open'}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Notification Preference Controls */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4">
          <h2 className="text-base font-semibold text-[#111827] dark:text-slate-100">
            Notification Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure how NewtonLab delivers learning reminders and curriculum alerts.
          </p>

          <div className="space-y-3 pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
            {[
              {
                key: 'emailNotifications' as const,
                label: 'Email digests',
                desc: 'Daily summary of completed labs and scores',
              },
              {
                key: 'assessmentReminders' as const,
                label: 'Assessment deadlines',
                desc: 'Alerts 24h before module gates close',
              },
              {
                key: 'aiSuggestions' as const,
                label: 'AI assistant advisories',
                desc: 'Notifications for generated test cases & insights',
              },
            ].map((pref) => (
              <label key={pref.key} className="flex items-start justify-between gap-3 cursor-pointer py-1">
                <div>
                  <div className="text-sm font-medium text-[#111827] dark:text-slate-100">
                    {pref.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{pref.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs ? prefs[pref.key] : true}
                  onChange={(e) =>
                    prefs &&
                    updateCurrentUser({
                      preferences: { ...prefs, [pref.key]: e.target.checked },
                    })
                  }
                  className="mt-1 rounded border-slate-300 dark:border-slate-600 text-[#53b947] focus:ring-[#53b947]"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
