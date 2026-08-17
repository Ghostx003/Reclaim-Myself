import { MOTIVATIONAL_MESSAGES } from '../../constants';
import { GoalStreakStats, MotivationalMessage } from '../../types';

/**
 * Returns a contextual motivational quote for a given goal based on streak and history
 */
export function getContextualMotivation(
  stats?: GoalStreakStats,
  excludeId?: string
): MotivationalMessage {
  const currentStreak = stats ? stats.currentStreak : 0;
  const wasBrokenRecently =
    stats && stats.currentStreak === 0 && stats.previousStreak > 2;

  let pool: MotivationalMessage[] = [];

  if (wasBrokenRecently) {
    // Priority for comeback quotes
    pool = MOTIVATIONAL_MESSAGES.filter((m) => m.category === 'comeback');
  } else if (currentStreak >= 15) {
    pool = MOTIVATIONAL_MESSAGES.filter((m) => m.category === 'mastery');
  } else if (currentStreak >= 4) {
    pool = MOTIVATIONAL_MESSAGES.filter((m) => m.category === 'momentum');
  } else {
    pool = MOTIVATIONAL_MESSAGES.filter((m) => m.category === 'starting');
  }

  if (pool.length === 0) {
    pool = MOTIVATIONAL_MESSAGES;
  }

  const eligible = pool.filter((m) => m.id !== excludeId);
  const candidates = eligible.length > 0 ? eligible : pool;
  const index = Math.floor(Math.random() * candidates.length);

  return candidates[index];
}
