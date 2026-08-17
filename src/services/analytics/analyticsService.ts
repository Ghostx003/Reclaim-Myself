import { CounterEvent, CustomCounter, DailyAudit, DayAuditSummary, Goal } from '../../types';
import { addDaysToDateKey, getTodayKey, isFutureDate, isTodayDate } from '../date/dateService';
import { isGoalSuccess } from '../scoring/scoringEngine';

export interface HeatmapCell {
  date: string;
  status: 'success' | 'failure' | 'untracked' | 'future';
  isToday: boolean;
  score?: number;
  total?: number;
  percentage?: number;
  note?: string;
}

/**
 * Generates an activity heatmap matrix for a specific goal over a given number of trailing days (default 84 days = 12 weeks)
 */
export function generateGoalHeatmap(
  goal: Goal,
  audits: DailyAudit[],
  totalDays: number = 84,
  endDateKey: string = getTodayKey()
): HeatmapCell[] {
  const auditMap = new Map<string, { answer: boolean; note?: string }>();
  for (const audit of audits) {
    if (audit.answers && audit.answers[goal.id] !== undefined) {
      auditMap.set(audit.date, audit.answers[goal.id]);
    }
  }

  const cells: HeatmapCell[] = [];
  
  for (let i = totalDays - 1; i >= 0; i--) {
    const date = addDaysToDateKey(endDateKey, -i);
    const isFuture = isFutureDate(date);
    const isToday = isTodayDate(date);

    if (isFuture) {
      cells.push({ date, status: 'future', isToday });
      continue;
    }

    const auditEntry = auditMap.get(date);
    if (!auditEntry) {
      cells.push({ date, status: 'untracked', isToday });
    } else {
      const success = isGoalSuccess(goal.polarity, auditEntry.answer);
      cells.push({
        date,
        status: success ? 'success' : 'failure',
        isToday,
        note: auditEntry.note,
      });
    }
  }

  return cells;
}

/**
 * Builds a fast lookup map of DayAuditSummary for the calendar view
 */
export function buildCalendarAuditSummaries(
  audits: DailyAudit[],
  goals: Goal[]
): Map<string, DayAuditSummary> {
  const summaries = new Map<string, DayAuditSummary>();
  const activeGoalsMap = new Map(goals.map((g) => [g.id, g]));

  for (const audit of audits) {
    const isFuture = isFutureDate(audit.date);
    const isToday = isTodayDate(audit.date);
    
    const answersRecord: Record<string, { success: boolean; rawAnswer: boolean; note?: string }> = {};
    for (const [goalId, ans] of Object.entries(audit.answers || {})) {
      const goal = activeGoalsMap.get(goalId);
      const success = goal ? isGoalSuccess(goal.polarity, ans.answer) : ans.answer;
      answersRecord[goalId] = {
        success,
        rawAnswer: ans.answer,
        note: ans.note,
      };
    }

    summaries.set(audit.date, {
      date: audit.date,
      isAudited: true,
      score: audit.score,
      total: audit.total,
      percentage: audit.percentage,
      starRating: audit.starRating,
      isFuture,
      isToday,
      answers: answersRecord,
    });
  }

  return summaries;
}

export interface CounterAggregates {
  currentTotal: number;
  monthlyTotal: number;
  lifetimeTotal: number;
  todayDelta: number;
  eventsCount: number;
}

/**
 * Computes cumulative analytics for a custom counter across historical events
 */
export function calculateCounterAggregates(
  counter: CustomCounter,
  events: CounterEvent[],
  referenceDate: string = getTodayKey()
): CounterAggregates {
  const counterEvents = events.filter((e) => e.counterId === counter.id);
  const currentMonthPrefix = referenceDate.substring(0, 7); // "YYYY-MM"

  let lifetimeTotal = 0;
  let monthlyTotal = 0;
  let todayDelta = 0;

  for (const ev of counterEvents) {
    lifetimeTotal += ev.delta;
    if (ev.date.startsWith(currentMonthPrefix)) {
      monthlyTotal += ev.delta;
    }
    if (ev.date === referenceDate) {
      todayDelta += ev.delta;
    }
  }

  return {
    currentTotal: counter.currentValue,
    monthlyTotal,
    lifetimeTotal,
    todayDelta,
    eventsCount: counterEvents.length,
  };
}
