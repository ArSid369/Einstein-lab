import React, { useState } from 'react';
import { Check, Moon, RefreshCw, Shield, Sliders, Sun, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/shared/UiPrimitives';

export const ProfileSettingsPage: React.FC = () => {
  const { currentUser, updateCurrentUser, progress, updateWeeklyGoal, resetDemoData, theme, setTheme } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [title, setTitle] = useState(currentUser?.title || '');
  const [organization, setOrganization] = useState(currentUser?.organization || '');
  const [timezone, setTimezone] = useState(currentUser?.timezone || 'America/Los_Angeles');
  const [savedBanner, setSavedBanner] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [newPass, setNewPass] = useState('');
  const [defaultPassThreshold, setDefaultPassThreshold] = useState(75);

  if (!currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({ name, title, organization, timezone });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2200);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
      setPasswordStatus('Enter at least 6 characters.');
      return;
    }
    setNewPass('');
    setPasswordStatus('Security credentials updated.');
    setTimeout(() => setPasswordStatus(null), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile & Settings"
        description="Manage personal details, security credentials, accessibility, and workspace preferences."
        actions={
          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Prototype Data</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal & Organization Info */}
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-2 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-6 space-y-5"
        >
          <div className="flex items-center gap-4 pb-5 border-b border-[#E2E8F0] dark:border-slate-800">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border border-[#E2E8F0] dark:border-slate-700"
            />
            <div>
              <h2 className="text-lg font-semibold text-[#111827] dark:text-slate-100">
                {currentUser.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser.email} · {currentUser.role === 'SME' ? 'Subject Matter Expert' : 'Associate Learner'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#53b947]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Role Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#53b947]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Organization / Cohort
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#53b947]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Timezone & Region
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#53b947]"
              >
                <option value="America/Los_Angeles">Pacific Time (UTC-08:00)</option>
                <option value="America/New_York">Eastern Time (UTC-05:00)</option>
                <option value="Europe/London">London (UTC+00:00)</option>
                <option value="Europe/Berlin">Berlin (UTC+01:00)</option>
                <option value="Asia/Kolkata">India Standard Time (UTC+05:30)</option>
                <option value="Asia/Tokyo">Tokyo (UTC+09:00)</option>
              </select>
            </div>
          </div>

          {/* Role-Specific Settings */}
          <div className="pt-4 border-t border-[#E2E8F0] dark:border-slate-800">
            <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100 flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-[#37852d] dark:text-[#84E179]" />
              <span>{currentUser.role === 'SME' ? 'SME Authoring Defaults' : 'Associate Study Target'}</span>
            </h3>

            {currentUser.role === 'SME' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Default Assessment Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={defaultPassThreshold}
                    onChange={(e) => setDefaultPassThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 tabular-nums"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Weekly Learning Goal:{' '}
                  <span className="font-mono text-[#37852d] dark:text-[#84E179]">
                    {progress.weeklyGoalHours} hrs/week
                  </span>
                </label>
                <input
                  type="range"
                  min={2}
                  max={20}
                  value={progress.weeklyGoalHours}
                  onChange={(e) => updateWeeklyGoal(Number(e.target.value))}
                  className="w-full max-w-sm accent-[#53b947]"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedBanner ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#16A34A] dark:text-[#84E179]">
                <Check className="w-4 h-4" />
                <span>Profile settings saved</span>
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold transition-colors whitespace-nowrap"
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* Right Column: Appearance, Accessibility & Security */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#37852d] dark:text-[#84E179]" />
              <span>Appearance & Accessibility</span>
            </h3>

            {/* Color Theme Selector */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold rounded-md transition-colors ${
                  theme === 'light'
                    ? 'bg-white text-[#111827] shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold rounded-md transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-[#84E179]" />
                <span>Dark</span>
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {[
                {
                  key: 'highContrastCode' as const,
                  label: 'High-contrast code editor',
                  desc: 'Deep obsidian syntax surface for coding panels',
                },
                {
                  key: 'compactDensity' as const,
                  label: 'Compact table density',
                  desc: 'Tighter vertical spacing across data lists',
                },
                {
                  key: 'reducedMotion' as const,
                  label: 'Reduce UI transitions',
                  desc: 'Minimize animated motion cues',
                },
              ].map((item) => (
                <label key={item.key} className="flex items-start justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-[#111827] dark:text-slate-100">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentUser.preferences[item.key]}
                    onChange={(e) =>
                      updateCurrentUser({
                        preferences: { ...currentUser.preferences, [item.key]: e.target.checked },
                      })
                    }
                    className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-[#53b947]"
                  />
                </label>
              ))}
            </div>
          </div>

          <form
            onSubmit={handlePasswordUpdate}
            className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-5 space-y-3"
          >
            <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#37852d] dark:text-[#84E179]" />
              <span>Password & Security</span>
            </h3>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100"
              />
            </div>
            {passwordStatus && (
              <p className="text-xs text-[#16A34A] dark:text-[#84E179] font-medium">{passwordStatus}</p>
            )}
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#111827] dark:text-slate-100 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
