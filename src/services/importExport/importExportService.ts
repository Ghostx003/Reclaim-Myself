import {
  AppExportData,
  Award,
  CounterEvent,
  CustomCounter,
  DailyAudit,
  Goal,
  Milestone,
  UserProfile,
} from '../../types';
import { APP_NAME, CURRENT_SCHEMA_VERSION } from '../../constants';

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    goalsCount: number;
    auditsCount: number;
    countersCount: number;
    counterEventsCount: number;
    milestonesCount: number;
    awardsCount: number;
    hasProfile: boolean;
  };
  sanitizedData?: AppExportData;
}

/**
 * Creates a clean export JSON bundle of the user's entire local dataset
 */
export function createExportBundle(data: {
  profile: UserProfile | null;
  goals: Goal[];
  audits: DailyAudit[];
  counters: CustomCounter[];
  counterEvents: CounterEvent[];
  milestones: Milestone[];
  awards: Award[];
}): AppExportData {
  return {
    appName: APP_NAME,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportDate: new Date().toISOString(),
    profile: data.profile,
    goals: data.goals,
    audits: data.audits,
    counters: data.counters,
    counterEvents: data.counterEvents,
    milestones: data.milestones,
    awards: data.awards,
  };
}

/**
 * Strict validator for imported backup JSON
 */
export function validateImportJson(rawJson: string): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      isValid: false,
      errors: [`Invalid JSON format: ${msg}`],
      warnings: [],
      summary: {
        goalsCount: 0,
        auditsCount: 0,
        countersCount: 0,
        counterEventsCount: 0,
        milestonesCount: 0,
        awardsCount: 0,
        hasProfile: false,
      },
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      isValid: false,
      errors: ['Import data must be a JSON object.'],
      warnings: [],
      summary: {
        goalsCount: 0,
        auditsCount: 0,
        countersCount: 0,
        counterEventsCount: 0,
        milestonesCount: 0,
        awardsCount: 0,
        hasProfile: false,
      },
    };
  }

  const obj = parsed as Record<string, unknown>;

  // Check Schema Version
  if (typeof obj.schemaVersion !== 'number') {
    errors.push('Missing or invalid "schemaVersion" property.');
  } else if (obj.schemaVersion > CURRENT_SCHEMA_VERSION) {
    errors.push(
      `Unsupported schema version (${obj.schemaVersion}). This application supports up to version ${CURRENT_SCHEMA_VERSION}.`
    );
  }

  // Validate Goals
  const validGoals: Goal[] = [];
  if (!Array.isArray(obj.goals)) {
    errors.push('Missing "goals" array in backup.');
  } else {
    for (let i = 0; i < obj.goals.length; i++) {
      const g = obj.goals[i];
      if (!g || typeof g !== 'object' || typeof g.id !== 'string' || typeof g.title !== 'string') {
        warnings.push(`Goal at index ${i} is missing required fields (id, title) and was skipped.`);
        continue;
      }
      if (g.polarity !== 'positive' && g.polarity !== 'negative') {
        warnings.push(`Goal "${g.title}" had invalid polarity "${g.polarity}". Defaulted to "positive".`);
        g.polarity = 'positive';
      }
      validGoals.push({
        id: String(g.id),
        title: String(g.title).trim(),
        description: g.description ? String(g.description).trim() : undefined,
        polarity: g.polarity,
        color: g.color ? String(g.color) : undefined,
        category: g.category ? String(g.category) : undefined,
        targetStreak: typeof g.targetStreak === 'number' ? g.targetStreak : undefined,
        isArchived: Boolean(g.isArchived),
        createdAt: typeof g.createdAt === 'string' ? g.createdAt : new Date().toISOString(),
        updatedAt: typeof g.updatedAt === 'string' ? g.updatedAt : new Date().toISOString(),
      });
    }
  }

  // Validate Audits
  const validAudits: DailyAudit[] = [];
  if (!Array.isArray(obj.audits)) {
    errors.push('Missing "audits" array in backup.');
  } else {
    for (let i = 0; i < obj.audits.length; i++) {
      const a = obj.audits[i];
      if (!a || typeof a !== 'object' || typeof a.id !== 'string' || typeof a.date !== 'string') {
        warnings.push(`Audit at index ${i} is invalid and was skipped.`);
        continue;
      }
      validAudits.push({
        id: String(a.id),
        date: String(a.date),
        answers: a.answers && typeof a.answers === 'object' ? a.answers : {},
        score: typeof a.score === 'number' ? a.score : 0,
        total: typeof a.total === 'number' ? a.total : 0,
        percentage: typeof a.percentage === 'number' ? a.percentage : 0,
        starRating: ['gold', 'silver', 'bronze', 'none'].includes(String(a.starRating))
          ? (a.starRating as DailyAudit['starRating'])
          : 'none',
        completedAt: typeof a.completedAt === 'string' ? a.completedAt : new Date().toISOString(),
        updatedAt: typeof a.updatedAt === 'string' ? a.updatedAt : new Date().toISOString(),
      });
    }
  }

  // Validate Counters
  const validCounters: CustomCounter[] = [];
  if (Array.isArray(obj.counters)) {
    for (const c of obj.counters) {
      if (c && typeof c === 'object' && typeof c.id === 'string' && typeof c.name === 'string') {
        validCounters.push({
          id: String(c.id),
          goalId: c.goalId ? String(c.goalId) : undefined,
          name: String(c.name).trim(),
          unit: c.unit ? String(c.unit).trim() : 'units',
          incrementValue: typeof c.incrementValue === 'number' ? c.incrementValue : 1,
          currentValue: typeof c.currentValue === 'number' ? c.currentValue : 0,
          createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date().toISOString(),
          updatedAt: typeof c.updatedAt === 'string' ? c.updatedAt : new Date().toISOString(),
        });
      }
    }
  }

  // Validate Counter Events
  const validCounterEvents: CounterEvent[] = [];
  if (Array.isArray(obj.counterEvents)) {
    for (const ce of obj.counterEvents) {
      if (ce && typeof ce === 'object' && typeof ce.id === 'string' && typeof ce.counterId === 'string') {
        validCounterEvents.push({
          id: String(ce.id),
          counterId: String(ce.counterId),
          delta: typeof ce.delta === 'number' ? ce.delta : 0,
          valueAfter: typeof ce.valueAfter === 'number' ? ce.valueAfter : 0,
          date: typeof ce.date === 'string' ? ce.date : new Date().toISOString().substring(0, 10),
          timestamp: typeof ce.timestamp === 'string' ? ce.timestamp : new Date().toISOString(),
          note: ce.note ? String(ce.note) : undefined,
        });
      }
    }
  }

  // Validate Milestones
  const validMilestones: Milestone[] = [];
  if (Array.isArray(obj.milestones)) {
    for (const m of obj.milestones) {
      if (m && typeof m === 'object' && typeof m.id === 'string' && typeof m.goalId === 'string') {
        validMilestones.push({
          id: String(m.id),
          goalId: String(m.goalId),
          targetValue: typeof m.targetValue === 'number' ? m.targetValue : 7,
          type: m.type === 'total_days' ? 'total_days' : 'streak',
          status: m.status === 'achieved' ? 'achieved' : 'pending',
          createdAt: typeof m.createdAt === 'string' ? m.createdAt : new Date().toISOString(),
          achievedAt: m.achievedAt ? String(m.achievedAt) : undefined,
        });
      }
    }
  }

  // Validate Awards
  const validAwards: Award[] = [];
  if (Array.isArray(obj.awards)) {
    for (const aw of obj.awards) {
      if (aw && typeof aw === 'object' && typeof aw.id === 'string') {
        validAwards.push({
          id: String(aw.id),
          goalId: String(aw.goalId || ''),
          milestoneId: String(aw.milestoneId || ''),
          goalTitle: String(aw.goalTitle || 'Goal Milestone'),
          milestoneValue: typeof aw.milestoneValue === 'number' ? aw.milestoneValue : 7,
          title: String(aw.title || 'Achievement Unlocked'),
          description: String(aw.description || ''),
          badgeIcon: String(aw.badgeIcon || 'Trophy'),
          achievedAt: typeof aw.achievedAt === 'string' ? aw.achievedAt : new Date().toISOString(),
        });
      }
    }
  }

  // Validate UserProfile
  let validProfile: UserProfile | null = null;
  if (obj.profile && typeof obj.profile === 'object') {
    const p = obj.profile as Record<string, unknown>;
    if (typeof p.name === 'string' && p.name.trim().length > 0) {
      validProfile = {
        id: typeof p.id === 'string' ? p.id : 'default_user',
        name: p.name.trim(),
        createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString(),
        updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : new Date().toISOString(),
        preferences:
          p.preferences && typeof p.preferences === 'object'
            ? (p.preferences as UserProfile['preferences'])
            : {
                theme: 'midnight',
                starThresholds: { gold: 0.85, silver: 0.5, bronze: 0.0 },
                confettiThreshold: 0.85,
                reducedMotion: false,
              },
      };
    }
  }

  const isValid = errors.length === 0;

  const sanitizedData: AppExportData | undefined = isValid
    ? {
        appName: APP_NAME,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        exportDate: typeof obj.exportDate === 'string' ? obj.exportDate : new Date().toISOString(),
        profile: validProfile,
        goals: validGoals,
        audits: validAudits,
        counters: validCounters,
        counterEvents: validCounterEvents,
        milestones: validMilestones,
        awards: validAwards,
      }
    : undefined;

  return {
    isValid,
    errors,
    warnings,
    summary: {
      goalsCount: validGoals.length,
      auditsCount: validAudits.length,
      countersCount: validCounters.length,
      counterEventsCount: validCounterEvents.length,
      milestonesCount: validMilestones.length,
      awardsCount: validAwards.length,
      hasProfile: validProfile !== null,
    },
    sanitizedData,
  };
}
