export type UserRole = 'SME' | 'ASSOCIATE';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type PublicationStatus = 'Published' | 'Draft' | 'Archived';
export type ContentType =
  | 'Written Lesson'
  | 'Documentation'
  | 'Video'
  | 'Code Example'
  | 'Practice Exercise'
  | 'Coding Lab'
  | 'Reference Resource';

export type AssessmentType =
  | 'Pre-Assessment'
  | 'Module Assessment'
  | 'Final Assessment'
  | 'Practical Coding Assessment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  title: string;
  avatarUrl: string;
  cohortId?: string;
  isFirstTimeAssociate?: boolean;
  timezone: string;
  preferences: {
    emailNotifications: boolean;
    assessmentReminders: boolean;
    aiSuggestions: boolean;
    compactDensity: boolean;
    highContrastCode: boolean;
    reducedMotion: boolean;
  };
}

export interface Cohort {
  id: string;
  name: string;
  startDate: string;
  learnerCount: number;
  leadSme: string;
}

export interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface SimulationConfig {
  mode: 'rover' | 'arm';
  defaultWaypoints?: Array<{ x: number; z: number }>;
  obstacles?: Array<{ x: number; z: number; radius: number; label?: string }>;
  targetPoint?: { x: number; y: number; z: number };
  defaultJoints?: [number, number, number, number];
}

export interface CodingTask {
  id: string;
  moduleId: string;
  domainId: string;
  order: number;
  title: string;
  taskType: 'Coding Exercise' | 'Simulation Lab' | 'Debugging Challenge';
  difficulty: DifficultyLevel;
  status: PublicationStatus;
  problemStatement: string;
  instructions: string;
  learningObjectives: string[];
  requirements: string[];
  starterCode: string;
  referenceSolution: string;
  expectedOutput: string;
  hints: string[];
  testCases: TestCase[];
  simulation: SimulationConfig;
  estimatedMinutes: number;
  updatedAt: string;
}

export interface LessonContent {
  id: string;
  domainId: string;
  moduleId: string;
  title: string;
  type: ContentType;
  status: PublicationStatus;
  durationMinutes: number;
  summary: string;
  body: string;
  codeSnippet?: string;
  updatedAt: string;
  author: string;
}

export interface Module {
  id: string;
  domainId: string;
  order: number;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedHours: number;
  learningObjectives: string[];
  prerequisites: string[];
  status: PublicationStatus;
  assessmentId?: string;
}

export interface Domain {
  id: string;
  name: string;
  slug: string;
  iconKey: 'python' | 'numpy' | 'pandas' | 'sklearn' | 'robotics' | 'ros';
  accentColor: string;
  shortDescription: string;
  detailedOverview: string;
  learningObjectives: string[];
  prerequisites: string[];
  difficultyRange: string;
  estimatedHours: number;
  owner: string;
  status: PublicationStatus;
  updatedAt: string;
  contentCoverage: number;
  assessmentReadiness: number;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'coding';
  prompt: string;
  points: number;
  difficulty: DifficultyLevel;
  skillCategory: string;
  // Multiple choice fields
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  // Coding fields
  starterCode?: string;
  expectedOutput?: string;
  testCases?: TestCase[];
}

export interface SkillMappingRule {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  minScore: number;
  maxScore: number;
  recommendedModuleId: string;
  rationale: string;
}

export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  domainId: string;
  moduleId?: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  attemptLimit: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  status: PublicationStatus;
  questions: Question[];
  skillMappingRules: SkillMappingRule[];
  avgScore: number;
  completionRate: number;
  attemptsCount: number;
  updatedAt: string;
}

export interface TopicPerformance {
  topic: string;
  correct: number;
  total: number;
  scorePercent: number;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentType: AssessmentType;
  domainId: string;
  learnerId: string;
  learnerName: string;
  cohortId: string;
  submittedAt: string;
  timeTakenMinutes: number;
  scorePercent: number;
  passed: boolean;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  recommendedModuleId: string;
  recommendationReason: string;
  topicBreakdown: TopicPerformance[];
  answers: Record<string, { selectedOption?: number; code?: string; isCorrect: boolean }>;
}

export interface ProgressRecord {
  learnerId: string;
  completedTaskIds: string[];
  completedLessonIds: string[];
  completedModuleIds: string[];
  unlockedModuleIds: string[];
  currentModuleId: string;
  currentTaskId: string;
  streakDays: number;
  hoursSpent: number;
  weeklyGoalHours: number;
  weeklyActivity: Array<{ day: string; minutes: number; tasks: number }>;
  skillProficiency: Array<{ skill: string; score: number; target: number }>;
  badges: Array<{ id: string; title: string; earnedAt: string; criteria: string }>;
}

export interface NotificationItem {
  id: string;
  category: 'learning' | 'assessment' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionRoute?: string;
  roleTarget: UserRole | 'ALL';
}

export interface SavedReport {
  id: string;
  title: string;
  reportType: string;
  createdAt: string;
  schedule: 'None' | 'Weekly' | 'Monthly';
  domainFilter: string;
  cohortFilter: string;
  avgScore: number;
  completionRate: number;
}
