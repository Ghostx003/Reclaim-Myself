import { DailyAudit, Goal, GoalStreakStats } from '../../types';
import { isGoalSuccess } from '../scoring/scoringEngine';
import { addDaysToDateKey, getTodayKey } from '../date/dateService';

/**
 * Calculate comprehensive streak and historical stats for a single goal
 * derived dynamically and authoritatively from all stored audits.
 */
export function calculateGoalStreakStats(
  goal: Goal,
  audits: DailyAudit[],
  referenceDate: string = getTodayKey()
): GoalStreakStats {
  // Sort audits chronologically
  const sortedAudits = [...audits]
    .filter((a) => a.answers && a.answers[goal.id] !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sortedAudits.length === 0) {
    return {
      goalId: goal.id,
      currentStreak: 0,
      longestStreak: 0,
      previousStreak: 0,
      totalSuccessfulDays: 0,
      totalUnsuccessfulDays: 0,
      totalAuditedDays: 0,
      successRate: 0,
    };
  }

  let totalSuccessfulDays = 0;
  let totalUnsuccessfulDays = 0;
  let longestStreak = 0;
  let currentRun = 0;
  let previousStreak = 0;

  // Build a date lookup of audit results for this goal
  const auditMap = new Map<string, boolean>();
  for (const audit of sortedAudits) {
    const rawAnswer = audit.answers[goal.id].answer;
    const success = isGoalSuccess(goal.polarity, rawAnswer);
    auditMap.set(audit.date, success);

    if (success) {
      totalSuccessfulDays++;
    } else {
      totalUnsuccessfulDays++;
    }
  }

  // Calculate longest streak by scanning sorted chronological dates
  let prevDateKey: string | null = null;
  for (const audit of sortedAudits) {
    const success = auditMap.get(audit.date)!;
    
    if (success) {
      if (prevDateKey !== null && addDaysToDateKey(prevDateKey, 1) === audit.date) {
        currentRun++;
      } else {
        currentRun = 1;
      }
      if (currentRun > longestStreak) {
        longestStreak = currentRun;
      }
    } else {
      if (currentRun > 0) {
        previousStreak = currentRun;
      }
      currentRun = 0;
    }
    prevDateKey = audit.date;
  }

  // Calculate CURRENT active streak relative to referenceDate (today)
  let currentStreak = 0;
  const todayKey = referenceDate;
  const yesterdayKey = addDaysToDateKey(todayKey, -1);

  // Check if today was audited
  const todayAudited = auditMap.has(todayKey);
  const todaySuccess = auditMap.get(todayKey);

  let scanDateKey: string | null = null;

  if (todayAudited) {
    if (todaySuccess) {
      scanDateKey = todayKey;
    } else {
      // Failed today -> current streak is 0
      currentStreak = 0;
    }
  } else {
    // Today not yet audited: check yesterday
    const yesterdayAudited = auditMap.has(yesterdayKey);
    const yesterdaySuccess = auditMap.get(yesterdayKey);
    if (yesterdayAudited && yesterdaySuccess) {
      scanDateKey = yesterdayKey;
    } else {
      currentStreak = 0;
    }
  }

  if (scanDateKey !== null) {
    // Walk backward one day at a time
    let checkDate = scanDateKey;
    while (auditMap.has(checkDate) && auditMap.get(checkDate) === true) {
      currentStreak++;
      checkDate = addDaysToDateKey(checkDate, -1);
    }
  }

  const totalAuditedDays = sortedAudits.length;
  const successRate =
    totalAuditedDays > 0
      ? Math.round((totalSuccessfulDays / totalAuditedDays) * 1000) / 10
      : 0;

  const lastAudit = sortedAudits[sortedAudits.length - 1];

  return {
    goalId: goal.id,
    currentStreak,
    longestStreak,
    previousStreak,
    totalSuccessfulDays,
    totalUnsuccessfulDays,
    totalAuditedDays,
    successRate,
    lastAuditedDate: lastAudit ? lastAudit.date : undefined,
    lastResultSuccess: lastAudit ? auditMap.get(lastAudit.date) : undefined,
  };
}

/**
 * Calculate streak stats for all active goals
 */
export function calculateAllGoalsStreakStats(
  goals: Goal[],
  audits: DailyAudit[],
  referenceDate: string = getTodayKey()
): Record<string, GoalStreakStats> {
  const result: Record<string, GoalStreakStats> = {};
  for (const goal of goals) {
    result[goal.id] = calculateGoalStreakStats(goal, audits, referenceDate);
  }
  return result;
}
