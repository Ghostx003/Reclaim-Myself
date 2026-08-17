import { useLiveQuery } from 'dexie-react-hooks';
import { auditRepository } from '../db/repositories/auditRepository';
import { goalRepository } from '../db/repositories/goalRepository';
import { milestoneRepository } from '../db/repositories/milestoneRepository';
import { calculateDailyScore } from '../services/scoring/scoringEngine';
import { calculateGoalStreakStats } from '../services/streaks/streakEngine';
import { fireCelebrationConfetti } from '../components/feedback/ConfettiTrigger';
import { Award, DailyAudit, GoalAuditAnswer, UserPreferences } from '../types';
import { DEFAULT_USER_PREFERENCES } from '../constants';

export function useAudits() {
  const audits = useLiveQuery(async () => {
    return await auditRepository.getAllAudits();
  });

  const saveAudit = async (
    date: string,
    answers: Record<string, GoalAuditAnswer>,
    preferences: UserPreferences = DEFAULT_USER_PREFERENCES
  ): Promise<{ audit: DailyAudit; newAwards: Award[] }> => {
    const goals = await goalRepository.getAllGoals(false);
    const scoreResult = calculateDailyScore(goals, answers, preferences);

    const now = new Date().toISOString();
    const existing = await auditRepository.getAuditByDate(date);

    const audit: DailyAudit = {
      id: date,
      date,
      answers,
      score: scoreResult.score,
      total: scoreResult.total,
      percentage: scoreResult.percentage,
      starRating: scoreResult.starRating,
      completedAt: existing ? existing.completedAt : now,
      updatedAt: now,
    };

    await auditRepository.saveDailyAudit(audit);

    // Refresh all audits for streak evaluation
    const allAudits = await auditRepository.getAllAudits();
    const newAwards: Award[] = [];

    // Evaluate streaks & milestones for each goal
    for (const goal of goals) {
      const stats = calculateGoalStreakStats(goal, allAudits);
      const unlocked = await milestoneRepository.evaluateMilestonesForGoal(
        goal,
        stats.currentStreak,
        stats.totalSuccessfulDays
      );
      newAwards.push(...unlocked);
    }

    // Trigger confetti if high score reached
    if (scoreResult.percentage >= preferences.confettiThreshold * 100) {
      fireCelebrationConfetti();
    }

    return { audit, newAwards };
  };

  const getAudit = async (date: string): Promise<DailyAudit | null> => {
    return await auditRepository.getAuditByDate(date);
  };

  const deleteAudit = async (date: string): Promise<void> => {
    await auditRepository.deleteAudit(date);
  };

  return {
    audits: audits || [],
    isLoading: audits === undefined,
    saveAudit,
    getAudit,
    deleteAudit,
  };
}
