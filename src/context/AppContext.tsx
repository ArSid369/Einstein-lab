import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Assessment,
  AssessmentResult,
  CodingTask,
  Cohort,
  Domain,
  LessonContent,
  Module,
  NotificationItem,
  ProgressRecord,
  SavedReport,
  TopicPerformance,
  User,
} from '../types/newtonlab';
import {
  INITIAL_ASSESSMENTS,
  INITIAL_COHORTS,
  INITIAL_CONTENT,
  INITIAL_DOMAINS,
  INITIAL_MODULES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROGRESS_BY_USER,
  INITIAL_RESULTS,
  INITIAL_SAVED_REPORTS,
  INITIAL_TASKS,
  SAMPLE_USERS,
} from '../data/seedData';

interface AppContextValue {
  currentUser: User | null;
  cohorts: Cohort[];
  domains: Domain[];
  modules: Module[];
  tasks: CodingTask[];
  contents: LessonContent[];
  assessments: Assessment[];
  results: AssessmentResult[];
  progress: ProgressRecord;
  notifications: NotificationItem[];
  savedReports: SavedReport[];

  // Auth
  loginAsSample: (preset: 'sme' | 'associate_returning' | 'associate_new') => string;
  loginWithCredentials: (email: string, roleHint?: 'SME' | 'ASSOCIATE') => string;
  logout: () => void;
  updateCurrentUser: (patch: Partial<User>) => void;
  resetDemoData: () => void;

  // SME Domain & Module CRUD
  saveDomain: (domain: Domain, updatedModules?: Module[]) => void;
  duplicateDomain: (domainId: string) => void;
  archiveDomain: (domainId: string) => void;

  // SME Task CRUD
  saveTask: (task: CodingTask) => void;
  createTask: (moduleId: string, domainId: string) => CodingTask;

  // SME Learning Content CRUD
  saveContent: (item: LessonContent) => void;
  duplicateContent: (contentId: string) => void;

  // SME Assessment CRUD
  saveAssessment: (assessment: Assessment) => void;

  // Associate Learning & Assessment Flows
  submitAssessment: (
    assessmentId: string,
    answers: Record<string, { selectedOption?: number; code?: string; codingPassed?: boolean }>,
    timeTakenMinutes: number
  ) => AssessmentResult;
  markTaskCompleted: (taskId: string) => void;
  markLessonCompleted: (lessonId: string) => void;
  updateWeeklyGoal: (hours: number) => void;

  // Notifications & Reports
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  addSavedReport: (report: Omit<SavedReport, 'id' | 'createdAt'>) => void;

  // UI Preferences (Theme & Sidebar)
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (next: 'light' | 'dark') => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (next: boolean) => void;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'newtonlab_state_v1';
const THEME_STORAGE_KEY = 'newtonlab_theme';
const SIDEBAR_STORAGE_KEY = 'newtonlab_sidebar_collapsed';

interface PersistedState {
  currentUser: User | null;
  domains: Domain[];
  modules: Module[];
  tasks: CodingTask[];
  contents: LessonContent[];
  assessments: Assessment[];
  results: AssessmentResult[];
  progressByUser: Record<string, ProgressRecord>;
  notifications: NotificationItem[];
  savedReports: SavedReport[];
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as PersistedState;
    }
  } catch {
    // ignore corrupted local storage
  }
  return {
    currentUser: null,
    domains: INITIAL_DOMAINS,
    modules: INITIAL_MODULES,
    tasks: INITIAL_TASKS,
    contents: INITIAL_CONTENT,
    assessments: INITIAL_ASSESSMENTS,
    results: INITIAL_RESULTS,
    progressByUser: INITIAL_PROGRESS_BY_USER,
    notifications: INITIAL_NOTIFICATIONS,
    savedReports: INITIAL_SAVED_REPORTS,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(() => loadInitialState());
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage failure
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
    } catch {
      // ignore storage failure
    }
  }, [sidebarCollapsed]);

  const setTheme = (next: 'light' | 'dark') => setThemeState(next);
  const toggleTheme = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));
  const setSidebarCollapsed = (next: boolean) => setSidebarCollapsedState(next);
  const toggleSidebar = () => setSidebarCollapsedState((c) => !c);

  const activeUserId = state.currentUser?.id || 'user-assoc-1';
  const progress = state.progressByUser[activeUserId] || INITIAL_PROGRESS_BY_USER['user-assoc-1'];

  const loginAsSample = (preset: 'sme' | 'associate_returning' | 'associate_new'): string => {
    const user = SAMPLE_USERS[preset];
    setState((prev) => ({
      ...prev,
      currentUser: user,
      progressByUser: {
        ...prev.progressByUser,
        [user.id]: prev.progressByUser[user.id] || INITIAL_PROGRESS_BY_USER[user.id] || INITIAL_PROGRESS_BY_USER['user-assoc-1'],
      },
    }));
    if (user.role === 'SME') return '/sme/dashboard';
    if (preset === 'associate_new' && (state.progressByUser[user.id]?.completedTaskIds.length ?? 0) === 0) {
      return '/associate/pre-assessment';
    }
    return '/associate/dashboard';
  };

  const loginWithCredentials = (email: string, roleHint?: 'SME' | 'ASSOCIATE'): string => {
    const normalized = email.trim().toLowerCase();
    if (roleHint === 'SME' || normalized.includes('elena') || normalized.includes('sme')) {
      return loginAsSample('sme');
    }
    if (normalized.includes('maya') || normalized.includes('new')) {
      return loginAsSample('associate_new');
    }
    return loginAsSample('associate_returning');
  };

  const logout = () => {
    setState((prev) => ({ ...prev, currentUser: null }));
  };

  const updateCurrentUser = (patch: Partial<User>) => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      return {
        ...prev,
        currentUser: {
          ...prev.currentUser,
          ...patch,
          preferences: {
            ...prev.currentUser.preferences,
            ...(patch.preferences || {}),
          },
        },
      };
    });
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      currentUser: state.currentUser,
      domains: INITIAL_DOMAINS,
      modules: INITIAL_MODULES,
      tasks: INITIAL_TASKS,
      contents: INITIAL_CONTENT,
      assessments: INITIAL_ASSESSMENTS,
      results: INITIAL_RESULTS,
      progressByUser: INITIAL_PROGRESS_BY_USER,
      notifications: INITIAL_NOTIFICATIONS,
      savedReports: INITIAL_SAVED_REPORTS,
    });
  };

  const saveDomain = (domain: Domain, updatedModules?: Module[]) => {
    setState((prev) => {
      const exists = prev.domains.some((d) => d.id === domain.id);
      const nextDomains = exists
        ? prev.domains.map((d) => (d.id === domain.id ? domain : d))
        : [...prev.domains, domain];

      let nextModules = prev.modules;
      if (updatedModules) {
        const otherModules = prev.modules.filter((m) => m.domainId !== domain.id);
        nextModules = [...otherModules, ...updatedModules];
      }
      return { ...prev, domains: nextDomains, modules: nextModules };
    });
  };

  const duplicateDomain = (domainId: string) => {
    setState((prev) => {
      const source = prev.domains.find((d) => d.id === domainId);
      if (!source) return prev;
      const copy: Domain = {
        ...source,
        id: `dom-${Date.now()}`,
        name: `${source.name} (Copy)`,
        slug: `${source.slug}-copy`,
        status: 'Draft',
        updatedAt: '2026-11-12',
      };
      return { ...prev, domains: [...prev.domains, copy] };
    });
  };

  const archiveDomain = (domainId: string) => {
    setState((prev) => ({
      ...prev,
      domains: prev.domains.map((d) => (d.id === domainId ? { ...d, status: 'Archived', updatedAt: '2026-11-12' } : d)),
    }));
  };

  const saveTask = (task: CodingTask) => {
    setState((prev) => {
      const exists = prev.tasks.some((t) => t.id === task.id);
      const nextTasks = exists ? prev.tasks.map((t) => (t.id === task.id ? task : t)) : [...prev.tasks, task];
      return { ...prev, tasks: nextTasks };
    });
  };

  const createTask = (moduleId: string, domainId: string): CodingTask => {
    const newTask: CodingTask = {
      id: `task-${Date.now()}`,
      moduleId,
      domainId,
      order: state.tasks.filter((t) => t.moduleId === moduleId).length + 1,
      title: 'New Robotics Coding Lab',
      taskType: 'Coding Exercise',
      difficulty: 'Intermediate',
      status: 'Draft',
      estimatedMinutes: 20,
      problemStatement: 'Describe the robotics engineering problem, coordinate frame conventions, and expected behavior.',
      instructions: '1. Implement the required Python function.\n2. Emit simulation telemetry or print the formatted output.',
      learningObjectives: ['Apply clean modular robotics code'],
      requirements: ['Round numeric outputs to 2 decimal places'],
      starterCode: `def compute_step(x, z):\n    return round(x + z, 2)\n\nprint(compute_step(1.0, 2.0))`,
      referenceSolution: `def compute_step(x, z):\n    return round(x + z, 2)\n\nprint(compute_step(1.0, 2.0))`,
      expectedOutput: '3.0',
      hints: ['Check parameter types and rounding precision.'],
      testCases: [
        {
          id: `tc-${Date.now()}`,
          name: 'Baseline Output Check',
          input: 'print(compute_step(1.0, 2.0))',
          expectedOutput: '3.0\n3.0',
          isHidden: false,
        },
      ],
      simulation: {
        mode: 'rover',
        defaultWaypoints: [{ x: 0, z: 0 }, { x: 1.5, z: 1.5 }],
        obstacles: [],
      },
      updatedAt: '2026-11-12',
    };
    saveTask(newTask);
    return newTask;
  };

  const saveContent = (item: LessonContent) => {
    setState((prev) => {
      const exists = prev.contents.some((c) => c.id === item.id);
      return {
        ...prev,
        contents: exists ? prev.contents.map((c) => (c.id === item.id ? item : c)) : [item, ...prev.contents],
      };
    });
  };

  const duplicateContent = (contentId: string) => {
    setState((prev) => {
      const src = prev.contents.find((c) => c.id === contentId);
      if (!src) return prev;
      const copy: LessonContent = {
        ...src,
        id: `cnt-${Date.now()}`,
        title: `${src.title} (Copy)`,
        status: 'Draft',
        updatedAt: '2026-11-12',
      };
      return { ...prev, contents: [copy, ...prev.contents] };
    });
  };

  const saveAssessment = (assessment: Assessment) => {
    setState((prev) => {
      const exists = prev.assessments.some((a) => a.id === assessment.id);
      return {
        ...prev,
        assessments: exists
          ? prev.assessments.map((a) => (a.id === assessment.id ? assessment : a))
          : [...prev.assessments, assessment],
      };
    });
  };

  const submitAssessment = (
    assessmentId: string,
    answers: Record<string, { selectedOption?: number; code?: string; codingPassed?: boolean }>,
    timeTakenMinutes: number
  ): AssessmentResult => {
    const assessment = state.assessments.find((a) => a.id === assessmentId) || state.assessments[0];
    let earnedPoints = 0;
    let totalPoints = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const topicMap: Record<string, { correct: number; total: number }> = {};
    const evaluatedAnswers: AssessmentResult['answers'] = {};

    for (const q of assessment.questions) {
      totalPoints += q.points;
      if (!topicMap[q.skillCategory]) topicMap[q.skillCategory] = { correct: 0, total: 0 };
      topicMap[q.skillCategory].total += 1;

      const ans = answers[q.id];
      if (!ans || (q.type === 'multiple-choice' && ans.selectedOption === undefined) || (q.type === 'coding' && !ans.code?.trim())) {
        skippedCount += 1;
        evaluatedAnswers[q.id] = { isCorrect: false };
        continue;
      }

      let isCorrect = false;
      if (q.type === 'multiple-choice') {
        isCorrect = ans.selectedOption === q.correctOptionIndex;
      } else {
        isCorrect = Boolean(ans.codingPassed) || (q.starterCode !== undefined && ans.code?.trim() === q.starterCode.trim() && q.expectedOutput !== undefined);
      }

      if (isCorrect) {
        earnedPoints += q.points;
        correctCount += 1;
        topicMap[q.skillCategory].correct += 1;
      } else {
        incorrectCount += 1;
      }
      evaluatedAnswers[q.id] = {
        selectedOption: ans.selectedOption,
        code: ans.code,
        isCorrect,
      };
    }

    const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercent >= assessment.passingScore;

    // Determine skill-mapped module recommendation
    let recommendedModuleId = 'mod-py-1';
    let recommendationReason = 'Recommended starting point based on your topic-level score profile.';

    if (assessment.skillMappingRules.length > 0) {
      const rule = assessment.skillMappingRules.find((r) => scorePercent >= r.minScore && scorePercent <= r.maxScore);
      if (rule) {
        recommendedModuleId = rule.recommendedModuleId;
        recommendationReason = rule.rationale;
      }
    } else if (passed && assessment.moduleId) {
      const modIdx = state.modules.findIndex((m) => m.id === assessment.moduleId);
      const nextMod = state.modules[modIdx + 1];
      recommendedModuleId = nextMod ? nextMod.id : assessment.moduleId;
      recommendationReason = nextMod
        ? `Passed with ${scorePercent}%. Unlocked "${nextMod.title}" as your next milestone.`
        : 'Module assessment completed cleanly.';
    } else if (assessment.moduleId) {
      recommendedModuleId = assessment.moduleId;
      recommendationReason = `Score of ${scorePercent}% is below the ${assessment.passingScore}% threshold. Review this module's labs before retrying.`;
    }

    const topicBreakdown: TopicPerformance[] = Object.entries(topicMap).map(([topic, stats]) => ({
      topic,
      correct: stats.correct,
      total: stats.total,
      scorePercent: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }));

    const user = state.currentUser || SAMPLE_USERS.associate_returning;
    const result: AssessmentResult = {
      id: `res-${Date.now()}`,
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      assessmentType: assessment.type,
      domainId: assessment.domainId,
      learnerId: user.id,
      learnerName: user.name,
      cohortId: user.cohortId || 'cohort-alpha',
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      timeTakenMinutes: Math.max(1, timeTakenMinutes),
      scorePercent,
      passed,
      correctCount,
      incorrectCount,
      skippedCount,
      recommendedModuleId,
      recommendationReason,
      topicBreakdown,
      answers: evaluatedAnswers,
    };

    // Unlock recommended module and preceding modules in adaptive path
    const recIdx = state.modules.findIndex((m) => m.id === recommendedModuleId);
    const unlockedIds = state.modules
      .filter((_, idx) => idx <= Math.max(0, recIdx))
      .map((m) => m.id);

    const firstTaskForRec = state.tasks.find((t) => t.moduleId === recommendedModuleId)?.id || progress.currentTaskId;

    setState((prev) => {
      const currProg = prev.progressByUser[user.id] || INITIAL_PROGRESS_BY_USER['user-assoc-1'];
      const mergedUnlocked = Array.from(new Set([...currProg.unlockedModuleIds, ...unlockedIds]));
      const nextCompletedModules = passed && assessment.moduleId
        ? Array.from(new Set([...currProg.completedModuleIds, assessment.moduleId]))
        : currProg.completedModuleIds;

      return {
        ...prev,
        currentUser: prev.currentUser ? { ...prev.currentUser, isFirstTimeAssociate: false } : prev.currentUser,
        results: [result, ...prev.results],
        progressByUser: {
          ...prev.progressByUser,
          [user.id]: {
            ...currProg,
            unlockedModuleIds: mergedUnlocked,
            completedModuleIds: nextCompletedModules,
            currentModuleId: recommendedModuleId,
            currentTaskId: firstTaskForRec,
            hoursSpent: Number((currProg.hoursSpent + timeTakenMinutes / 60).toFixed(1)),
          },
        },
        notifications: [
          {
            id: `notif-${Date.now()}`,
            category: 'assessment',
            title: `${assessment.title} Graded`,
            message: `Scored ${scorePercent}% (${passed ? 'Passed' : 'Review Recommended'}). Mapped to next module.`,
            timestamp: 'Just now',
            read: false,
            actionLabel: 'View Results',
            actionRoute: `/associate/results/${result.id}`,
            roleTarget: 'ASSOCIATE',
          },
          ...prev.notifications,
        ],
      };
    });

    return result;
  };

  const markTaskCompleted = (taskId: string) => {
    const userId = state.currentUser?.id || 'user-assoc-1';
    setState((prev) => {
      const currProg = prev.progressByUser[userId] || INITIAL_PROGRESS_BY_USER['user-assoc-1'];
      if (currProg.completedTaskIds.includes(taskId)) return prev;

      const task = prev.tasks.find((t) => t.id === taskId);
      const nextCompletedTasks = [...currProg.completedTaskIds, taskId];
      let nextCompletedModules = currProg.completedModuleIds;
      let nextUnlocked = currProg.unlockedModuleIds;

      if (task) {
        const modTasks = prev.tasks.filter((t) => t.moduleId === task.moduleId);
        if (modTasks.every((t) => nextCompletedTasks.includes(t.id))) {
          nextCompletedModules = Array.from(new Set([...nextCompletedModules, task.moduleId]));
          const modIdx = prev.modules.findIndex((m) => m.id === task.moduleId);
          if (modIdx >= 0 && prev.modules[modIdx + 1]) {
            nextUnlocked = Array.from(new Set([...nextUnlocked, prev.modules[modIdx + 1].id]));
          }
        }
      }

      const nextWeekly = currProg.weeklyActivity.map((w, idx) =>
        idx === currProg.weeklyActivity.length - 1 ? { ...w, minutes: w.minutes + 20, tasks: w.tasks + 1 } : w
      );

      return {
        ...prev,
        progressByUser: {
          ...prev.progressByUser,
          [userId]: {
            ...currProg,
            completedTaskIds: nextCompletedTasks,
            completedModuleIds: nextCompletedModules,
            unlockedModuleIds: nextUnlocked,
            hoursSpent: Number((currProg.hoursSpent + 0.3).toFixed(1)),
            weeklyActivity: nextWeekly,
          },
        },
      };
    });
  };

  const markLessonCompleted = (lessonId: string) => {
    const userId = state.currentUser?.id || 'user-assoc-1';
    setState((prev) => {
      const currProg = prev.progressByUser[userId] || INITIAL_PROGRESS_BY_USER['user-assoc-1'];
      if (currProg.completedLessonIds.includes(lessonId)) return prev;
      return {
        ...prev,
        progressByUser: {
          ...prev.progressByUser,
          [userId]: {
            ...currProg,
            completedLessonIds: [...currProg.completedLessonIds, lessonId],
          },
        },
      };
    });
  };

  const updateWeeklyGoal = (hours: number) => {
    const userId = state.currentUser?.id || 'user-assoc-1';
    setState((prev) => {
      const currProg = prev.progressByUser[userId] || INITIAL_PROGRESS_BY_USER['user-assoc-1'];
      return {
        ...prev,
        progressByUser: {
          ...prev.progressByUser,
          [userId]: { ...currProg, weeklyGoalHours: hours },
        },
      };
    });
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    setState((prev) => ({
      ...prev,
      notifications: [
        {
          ...item,
          id: `notif-${Date.now()}`,
          timestamp: 'Just now',
          read: false,
        },
        ...prev.notifications,
      ],
    }));
  };

  const addSavedReport = (report: Omit<SavedReport, 'id' | 'createdAt'>) => {
    setState((prev) => ({
      ...prev,
      savedReports: [
        {
          ...report,
          id: `rep-${Date.now()}`,
          createdAt: '2026-11-12',
        },
        ...prev.savedReports,
      ],
    }));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser: state.currentUser,
        cohorts: INITIAL_COHORTS,
        domains: state.domains,
        modules: state.modules,
        tasks: state.tasks,
        contents: state.contents,
        assessments: state.assessments,
        results: state.results,
        progress,
        notifications: state.notifications,
        savedReports: state.savedReports,
        loginAsSample,
        loginWithCredentials,
        logout,
        updateCurrentUser,
        resetDemoData,
        saveDomain,
        duplicateDomain,
        archiveDomain,
        saveTask,
        createTask,
        saveContent,
        duplicateContent,
        saveAssessment,
        submitAssessment,
        markTaskCompleted,
        markLessonCompleted,
        updateWeeklyGoal,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        addSavedReport,
        theme,
        toggleTheme,
        setTheme,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
