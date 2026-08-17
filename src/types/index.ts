/**
 * Core Domain Interfaces and Types for Reclaim Myself
 */

export type GoalPolarity = 'positive' | 'negative';

export interface UserPreferences {
  theme: 'dark' | 'midnight' | 'oled';
  starThresholds: {
    gold: number;   // default >= 0.85 (85%)
    silver: number; // default >= 0.50 (50%)
    bronze: number; // default < 0.50
  };
  confettiThreshold: number; // default 0.85 (85%)
  reducedMotion: boolean;
}

export interface UserProfile {
  id: string; // usually 'default_user'
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
  preferences: UserPreferences;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  polarity: GoalPolarity;
  color?: string; // hex or theme color token
  category?: string;
  targetStreak?: number; // target streak in days (e.g. 21, 30, 90)
  isArchived: boolean;
  createdAt: string; // ISO string
  updatedAt: string;
}

export interface GoalAuditAnswer {
  goalId: string;
  answer: boolean; // raw Yes (true) / No (false)
  note?: string;   // optional reason / reflection
}

export interface DailyAudit {
  id: string; // YYYY-MM-DD
  date: string; // YYYY-MM-DD
  answers: Record<string, GoalAuditAnswer>; // keyed by goalId
  score: number; // number of successful goals
  total: number; // total number of active goals audited
  percentage: number; // 0 to 100
  starRating: 'gold' | 'silver' | 'bronze' | 'none';
  completedAt: string; // ISO string
  updatedAt: string;
}

export type CounterUnit = string;

export interface CustomCounter {
  id: string;
  goalId?: string; // optional association with a goal
  name: string;
  unit: CounterUnit; // e.g. "steps", "$", "pages", "glasses", "mins"
  incrementValue: number; // default step increment e.g. 1, 5, 10
  currentValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface CounterEvent {
  id: string;
  counterId: string;
  delta: number;
  valueAfter: number;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  note?: string;
}

export type MilestoneType = 'streak' | 'total_days';

export interface Milestone {
  id: string;
  goalId: string;
  targetValue: number; // e.g. 7, 21, 30, 60, 90 days
  type: MilestoneType;
  status: 'pending' | 'achieved';
  createdAt: string;
  achievedAt?: string;
}

export interface Award {
  id: string;
  goalId: string;
  milestoneId: string;
  goalTitle: string;
  milestoneValue: number;
  title: string;
  description: string;
  badgeIcon: string;
  achievedAt: string; // ISO string
}

export interface GoalStreakStats {
  goalId: string;
  currentStreak: number;
  longestStreak: number;
  previousStreak: number;
  totalSuccessfulDays: number;
  totalUnsuccessfulDays: number;
  totalAuditedDays: number;
  successRate: number; // 0 to 100
  lastAuditedDate?: string;
  lastResultSuccess?: boolean;
}

export interface MotivationalMessage {
  id: string;
  text: string;
  author?: string;
  minStreak?: number;
  category?: 'starting' | 'momentum' | 'mastery' | 'comeback';
}

export interface DayAuditSummary {
  date: string;
  isAudited: boolean;
  score: number;
  total: number;
  percentage: number;
  starRating: 'gold' | 'silver' | 'bronze' | 'none';
  isFuture: boolean;
  isToday: boolean;
  answers: Record<string, { success: boolean; rawAnswer: boolean; note?: string }>;
}

export interface AppExportData {
  schemaVersion: number;
  exportDate: string;
  appName: 'Reclaim Myself';
  profile: UserProfile | null;
  goals: Goal[];
  audits: DailyAudit[];
  counters: CustomCounter[];
  counterEvents: CounterEvent[];
  milestones: Milestone[];
  awards: Award[];
}
