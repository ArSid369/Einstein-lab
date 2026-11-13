import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  ClipboardCheck,
  Code2,
  Compass,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Sun,
  UserCircle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser,
    notifications,
    loginAsSample,
    logout,
    theme,
    toggleTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) {
    return <>{children}</>;
  }

  const isSme = currentUser.role === 'SME';
  const isDark = theme === 'dark';

  const unreadCount = notifications.filter(
    (n) => !n.read && (n.roleTarget === 'ALL' || n.roleTarget === currentUser.role)
  ).length;

  const smeNav = [
    { to: '/sme/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/sme/domains', label: 'Domains', icon: FolderKanban },
    { to: '/sme/tasks', label: 'Task Editor', icon: Sparkles },
    { to: '/sme/content', label: 'Learning Content', icon: BookOpen },
    { to: '/sme/assessments', label: 'Assessments', icon: ClipboardCheck },
    { to: '/sme/reports', label: 'Reports', icon: BarChart3 },
  ];

  const associateNav = [
    { to: '/associate/dashboard', label: 'My Learning', icon: LayoutDashboard },
    { to: '/associate/learning-path', label: 'Learning Path', icon: Compass },
    { to: '/associate/workspace', label: 'Coding Studio', icon: Code2 },
    { to: '/associate/assessments', label: 'Assessments', icon: ClipboardCheck },
    { to: '/associate/progress', label: 'Progress', icon: Award },
  ];

  const primaryNav = isSme ? smeNav : associateNav;

  const sharedNav = [
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/profile', label: 'Profile', icon: UserCircle, badge: 0 },
  ];

  const breadcrumbText = (() => {
    const segs = location.pathname.split('/').filter(Boolean);
    if (segs.length === 0) return 'Workspace';
    return segs
      .slice(0, 2)
      .map((s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
      .join(' / ');
  })();

  const handleRoleSwitch = (preset: 'sme' | 'associate_returning' | 'associate_new') => {
    const target = loginAsSample(preset);
    navigate(target);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#0B1120] text-[#111827] dark:text-slate-100">
      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Collapsible Role-Specific Navigation Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-[width,transform] duration-200 md:static md:translate-x-0 no-print shrink-0 ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full'
        } ${sidebarCollapsed ? 'md:w-[72px]' : 'md:w-64'} ${
          isSme
            ? 'bg-[#111827] text-slate-200 border-r border-slate-800'
            : 'bg-white dark:bg-[#111827] text-[#111827] dark:text-slate-200 border-r border-[#E2E8F0] dark:border-slate-800'
        }`}
      >
        {/* Brand Header & Collapse Control */}
        <div
          className={`h-16 px-4 flex items-center border-b ${
            sidebarCollapsed ? 'md:justify-center' : 'justify-between'
          } ${isSme ? 'border-slate-800' : 'border-[#E2E8F0] dark:border-slate-800'}`}
        >
          <Link
            to={isSme ? '/sme/dashboard' : '/associate/dashboard'}
            title="NewtonLab Home"
            className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-[#53b947] text-[#0B1A09] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </span>
            <span
              className={`${sidebarCollapsed ? 'md:hidden' : ''} ${
                isSme ? 'text-white' : 'text-[#111827] dark:text-white'
              }`}
            >
              NewtonLab
            </span>
          </Link>

          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className={`hidden md:inline-flex p-1.5 rounded-md transition-colors ${
                isSme
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 dark:text-slate-400 hover:text-[#111827] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Context Label */}
        {!sidebarCollapsed && (
          <div
            className={`px-5 py-3 text-xs font-medium border-b truncate ${
              isSme
                ? 'border-slate-800/80 text-slate-400'
                : 'border-[#E2E8F0] dark:border-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {isSme ? 'SME Authoring & Analytics' : 'Associate Learning Studio'}
          </div>
        )}

        {/* Primary Nav Links */}
        <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={sidebarCollapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    sidebarCollapsed ? 'md:justify-center md:px-2' : ''
                  } ${
                    isActive
                      ? isSme
                        ? 'bg-[#53b947] text-[#0B1A09] font-semibold'
                        : 'bg-[#EBF7E9] dark:bg-[#53b947]/20 text-[#2D7525] dark:text-[#84E179] font-semibold'
                      : isSme
                      ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[#111827] dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className={sidebarCollapsed ? 'md:hidden' : ''}>{item.label}</span>
              </NavLink>
            );
          })}

          <div
            className={`my-3 border-t ${
              isSme ? 'border-slate-800' : 'border-[#E2E8F0] dark:border-slate-800'
            }`}
          />

          {sharedNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={sidebarCollapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    sidebarCollapsed ? 'md:justify-center md:px-2' : ''
                  } ${
                    isActive
                      ? isSme
                        ? 'bg-[#53b947] text-[#0B1A09] font-semibold'
                        : 'bg-[#EBF7E9] dark:bg-[#53b947]/20 text-[#2D7525] dark:text-[#84E179] font-semibold'
                      : isSme
                      ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[#111827] dark:hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className={sidebarCollapsed ? 'md:hidden' : ''}>{item.label}</span>
                </span>
                {item.badge > 0 && (
                  <span
                    className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-[#53b947]/20 font-semibold ${
                      isSme ? 'text-[#84E179]' : 'text-[#2D7525] dark:text-[#84E179]'
                    } ${sidebarCollapsed ? 'md:hidden' : ''}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Demo Role Switcher & Sign Out Footer */}
        <div
          className={`p-3 border-t space-y-2 ${
            isSme ? 'border-slate-800' : 'border-[#E2E8F0] dark:border-slate-800'
          }`}
        >
          {!sidebarCollapsed ? (
            <>
              <label className="block text-[11px] font-medium text-slate-400 px-1">
                Switch Demonstration Role
              </label>
              <select
                aria-label="Switch demonstration role"
                value={
                  currentUser.role === 'SME'
                    ? 'sme'
                    : currentUser.id === 'user-assoc-2'
                    ? 'associate_new'
                    : 'associate_returning'
                }
                onChange={(e) =>
                  handleRoleSwitch(e.target.value as 'sme' | 'associate_returning' | 'associate_new')
                }
                className={`w-full text-xs rounded-lg px-2.5 py-2 border focus:outline-none focus:ring-2 focus:ring-[#53b947] ${
                  isSme
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-[#F8FAFC] dark:bg-slate-800 border-[#E2E8F0] dark:border-slate-700 text-[#111827] dark:text-slate-200'
                }`}
              >
                <option value="sme">SME — Dr. Elena Vance</option>
                <option value="associate_returning">Associate (Returning) — Marcus Chen</option>
                <option value="associate_new">Associate (First-Time) — Maya Patel</option>
              </select>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className={`w-full hidden md:flex items-center justify-center p-2 rounded-lg transition-colors ${
                isSme
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              sidebarCollapsed ? 'md:justify-center md:px-2' : ''
            } ${
              isSme
                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className={sidebarCollapsed ? 'md:hidden' : ''}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Clean 3-Zone Top Bar */}
        <header className="relative z-20 shrink-0 h-16 bg-white dark:bg-[#111827] border-b border-[#E2E8F0] dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-8 no-print">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden md:inline-flex items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#111827] dark:hover:text-white transition-colors shrink-0"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
              {breadcrumbText}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Dark / Light Mode Toggle beside Notification for all users */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#111827] dark:hover:text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )}
              <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            <Link
              to="/notifications"
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#111827] dark:hover:text-white transition-colors shrink-0"
              aria-label={`Notifications (${unreadCount} unread)`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#53b947] text-[#0B1A09] text-[10px] font-mono font-bold flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0] dark:border-slate-700"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-[#111827] dark:text-slate-100 leading-tight whitespace-nowrap">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight whitespace-nowrap">
                  {currentUser.role === 'SME' ? 'Subject Matter Expert' : 'Associate Learner'}
                </div>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
