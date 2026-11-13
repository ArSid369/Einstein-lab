import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Eye, EyeOff, KeyRound, Moon, ShieldCheck, Sun, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginPage: React.FC = () => {
  const { loginAsSample, loginWithCredentials, theme, toggleTheme } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('marcus.chen@newtonlab.io');
  const [password, setPassword] = useState('robotics-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [roleHint, setRoleHint] = useState<'ASSOCIATE' | 'SME'>('ASSOCIATE');
  const [resetSent, setResetSent] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = loginWithCredentials(email, roleHint);
    navigate(target);
  };

  const handleSampleLogin = (preset: 'sme' | 'associate_returning' | 'associate_new') => {
    const target = loginAsSample(preset);
    navigate(target);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex items-stretch">
      {/* Left Authentication Column */}
      <div className="w-full lg:w-[48%] flex flex-col justify-between px-6 sm:px-12 lg:px-16 py-10 bg-white dark:bg-[#111827] border-r border-[#E2E8F0] dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 font-display font-bold text-xl tracking-tight text-[#111827] dark:text-white">
            <span className="w-9 h-9 rounded-lg bg-[#53b947] text-[#0B1A09] flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </span>
            <span>NewtonLab</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-medium text-slate-500 dark:text-slate-400">
              Robotics Engineering Platform
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-10">
          <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-slate-100 text-balance">
            Sign in to your robotics workspace
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Adaptive skill assessments, browser-based Python execution, and real-time 3D robot simulation.
          </p>

          {/* Role Intent Selector */}
          <div className="mt-6 grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-[10px]">
            <button
              type="button"
              onClick={() => {
                setRoleHint('ASSOCIATE');
                setEmail('marcus.chen@newtonlab.io');
              }}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                roleHint === 'ASSOCIATE'
                  ? 'bg-white dark:bg-slate-900 text-[#111827] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              Associate Learner
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleHint('SME');
                setEmail('elena.vance@newtonlab.io');
              }}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                roleHint === 'SME'
                  ? 'bg-white dark:bg-slate-900 text-[#111827] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              Subject Matter Expert
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work or Academy Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.io"
                className="w-full px-3.5 py-2.5 text-sm rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#53b947]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setResetSent(true)}
                  className="text-xs font-medium text-[#37852d] dark:text-[#84E179] hover:text-[#2D7525] dark:hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#53b947]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {resetSent && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Password recovery link queued for {email || 'your account'}.</span>
              </div>
            )}

            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-[#53b947] focus:ring-[#53b947]"
              />
              <span>Remember my session on this workstation</span>
            </label>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-sm font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Sample Accounts Quick Switcher */}
          <div className="mt-8 pt-6 border-t border-[#E2E8F0] dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Instant Demonstration Accounts
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSampleLogin('associate_new')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 hover:border-[#53b947] hover:bg-[#EBF7E9]/60 dark:hover:bg-[#53b947]/10 text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-[#111827] dark:text-slate-100">
                    First-Time Associate — Maya Patel
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Starts at Pre-Assessment → Skill Mapping → Adaptive Path
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-[#37852d] dark:text-[#84E179] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleSampleLogin('associate_returning')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 hover:border-[#53b947] hover:bg-[#EBF7E9]/60 dark:hover:bg-[#53b947]/10 text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-[#111827] dark:text-slate-100">
                    Returning Associate — Marcus Chen
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Opens Associate Dashboard, 3D Robotics Lab & Progress
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-[#16A34A] dark:text-[#84E179] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleSampleLogin('sme')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-[10px] border border-[#E2E8F0] dark:border-slate-700 hover:border-[#111827] dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-[#111827] dark:text-slate-100">
                    Subject Matter Expert — Dr. Elena Vance
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Opens SME Console, AI Task Editor, Assessments & Reports
                  </div>
                </div>
                <ShieldCheck className="w-4 h-4 text-[#111827] dark:text-slate-200 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500">
          NewtonLab Robotics Curriculum & Simulation Environment
        </div>
      </div>

      {/* Right Visual Robotics Artwork Column */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#111827] dark:bg-[#090D16] p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-medium text-[#84E179]">
            Python · NumPy · Pandas · Scikit-learn · Robotics · ROS 2
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white leading-tight text-balance">
            From diagnostic skill mapping to live 3D kinematics in one browser workspace.
          </h2>
        </div>

        <div className="relative z-10 my-6 rounded-[10px] overflow-hidden border border-slate-700/80 bg-slate-900 aspect-[4/3]">
          {!imgFailed ? (
            <img
              src="/src/assets/images/login_robotics_studio_1794547716678.jpg"
              alt="NewtonLab autonomous rover and 6-DOF articulated robotic arm on calibration grid"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-slate-300">
              <Bot className="w-12 h-12 text-[#53b947] mb-3" />
              <p className="text-sm font-semibold text-white">NewtonLab Calibration Studio</p>
              <p className="text-xs text-slate-400 mt-1">Mobile Rover & 6-DOF Articulated Arm</p>
            </div>
          )}
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6 pt-4 border-t border-slate-800 text-slate-300">
          <div>
            <div className="text-lg font-bold text-white tabular-nums">6 Domains</div>
            <div className="text-xs text-slate-400">Structured robotics path</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white tabular-nums">Real Python</div>
            <div className="text-xs text-slate-400">Automated unit test suites</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white tabular-nums">3D Simulation</div>
            <div className="text-xs text-slate-400">Rover & 6-DOF arm feedback</div>
          </div>
        </div>
      </div>
    </div>
  );
};
