import { Goal, GoalAuditAnswer, GoalPolarity, UserPreferences } from '../../types';
import { DEFAULT_USER_PREFERENCES } from '../../constants';

/**
 * Determine if a single goal audit answer represents a success based on its polarity
 *
 * Positive Polarity:
 *   Yes (true)  => Success (true)
 *   No (false)  => Failure (false)
 *
 * Negative Polarity:
 *   No (false)  => Success (true)
 *   Yes (true)  => Failure (false)
 */
export function isGoalSuccess(polarity: GoalPolarity, answer: boolean): boolean {
  if (polarity === 'positive') {
    return answer === true;
  } else {
    return answer === false;
  }
}

export interface DailyScoreResult {
  score: number;
  total: number;
  percentage: number;
  starRating: 'gold' | 'silver' | 'bronze' | 'none';
  isSuccessByGoalId: Record<string, boolean>;
}

/**
 * Calculate the overall score, percentage, and star rating for a daily audit
 */
export function calculateDailyScore(
  goals: Goal[],
  answers: Record<string, GoalAuditAnswer>,
  preferences: UserPreferences = DEFAULT_USER_PREFERENCES
): DailyScoreResult {
  const activeGoals = goals.filter((g) => !g.isArchived);
  
  if (activeGoals.length === 0) {
    return {
      score: 0,
      total: 0,
      percentage: 0,
      starRating: 'none',
      isSuccessByGoalId: {},
    };
  }

  let successCount = 0;
  const isSuccessByGoalId: Record<string, boolean> = {};

  for (const goal of activeGoals) {
    const auditAnswer = answers[goal.id];
    if (auditAnswer !== undefined) {
      const success = isGoalSuccess(goal.polarity, auditAnswer.answer);
      isSuccessByGoalId[goal.id] = success;
      if (success) {
        successCount++;
      }
    } else {
      // Unanswered counts as failure in scoring
      isSuccessByGoalId[goal.id] = false;
    }
  }

  const total = activeGoals.length;
  const rawRatio = total > 0 ? successCount / total : 0;
  const percentage = Math.round(rawRatio * 1000) / 10; // e.g. 66.7%

  // Star grading
  let starRating: 'gold' | 'silver' | 'bronze' | 'none' = 'none';
  if (percentage >= preferences.starThresholds.gold * 100) {
    starRating = 'gold';
  } else if (percentage >= preferences.starThresholds.silver * 100) {
    starRating = 'silver';
  } else if (percentage > 0) {
    starRating = 'bronze';
  }

  return {
    score: successCount,
    total,
    percentage,
    starRating,
    isSuccessByGoalId,
  };
}

/**
 * Dynamically constructs a natural question prompt for any goal based on its text.
 * Asks: Did you [title] today?
 */
export function generateGoalQuestion(goal: Goal): string {
  const title = goal.title.trim();
  
  // If user already wrote a full question
  if (title.endsWith('?')) {
    return title;
  }

  return `Did you ${title} today?`;
}
