import { describe, it, expect } from 'vitest';
import { calculateGoalStreakStats } from '../services/streaks/streakEngine';
import { DailyAudit, Goal } from '../types';

describe('Streak Engine & Historical Persistence', () => {
  const sampleGoal: Goal = {
    id: 'goal_test',
    title: 'Daily Journaling',
    polarity: 'positive',
    isArchived: false,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  };

  it('calculates first successful day (current streak = 1, longest streak = 1)', () => {
    const audits: DailyAudit[] = [
      {
        id: '2026-08-10',
        date: '2026-08-10',
        answers: {
          goal_test: { goalId: 'goal_test', answer: true },
        },
        score: 1,
        total: 1,
        percentage: 100,
        starRating: 'gold',
        completedAt: '',
        updatedAt: '',
      },
    ];

    const stats = calculateGoalStreakStats(sampleGoal, audits, '2026-08-10');
    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(1);
    expect(stats.totalSuccessfulDays).toBe(1);
    expect(stats.totalUnsuccessfulDays).toBe(0);
    expect(stats.successRate).toBe(100);
  });

  it('calculates consecutive successful days', () => {
    const audits: DailyAudit[] = [
      { id: '2026-08-08', date: '2026-08-08', answers: { goal_test: { goalId: 'goal_test', answer: true } }, score: 1, total: 1, percentage: 100, starRating: 'gold', completedAt: '', updatedAt: '' },
      { id: '2026-08-09', date: '2026-08-09', answers: { goal_test: { goalId: 'goal_test', answer: true } }, score: 1, total: 1, percentage: 100, starRating: 'gold', completedAt: '', updatedAt: '' },
      { id: '2026-08-10', date: '2026-08-10', answers: { goal_test: { goalId: 'goal_test', answer: true } }, score: 1, total: 1, percentage: 100, starRating: 'gold', completedAt: '', updatedAt: '' },
    ];

    const stats = calculateGoalStreakStats(sampleGoal, audits, '2026-08-10');
    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
    expect(stats.totalSuccessfulDays).toBe(3);
  });

  it('preserves longest streak and historical stats when current streak is broken', () => {
    // 3 days streak, then broken on day 4
    const audits: DailyAudit[] = [
      { id: '2026-08-05', date: '2026-08-05', answers: { goal_test: { goalId: 'goal_test', answer: true } }, score: 1, total: 1, percentage: 100, starRating: 'gold', completedAt: '', updatedAt: '' },
      { id: '2026-08-06', date: '2026-08-06', answers: { goal_test: { goalId: 'goal_test', answer: true } }, score: 1, total: 1, percentage: 100, starRating: 'gold', completedAt: '', updatedAt: '' },
      { id: '2026-08-07', date: '2026-08-07', answers: { goal_test: { goalId: 'goal_test', answer: true } }, score: 1, total: 1, percentage: 100, starRating: 'gold', completedAt: '', updatedAt: '' },
      { id: '2026-08-08', date: '2026-08-08', answers: { goal_test: { goalId: 'goal_test', answer: false } }, score: 0, total: 1, percentage: 0, starRating: 'none', completedAt: '', updatedAt: '' }, // failed
    ];

    const stats = calculateGoalStreakStats(sampleGoal, audits, '2026-08-08');
    expect(stats.currentStreak).toBe(0); // broken
    expect(stats.previousStreak).toBe(3); // preserved
    expect(stats.longestStreak).toBe(3);  // preserved!
    expect(stats.totalSuccessfulDays).toBe(3); // preserved!
    expect(stats.totalUnsuccessfulDays).toBe(1);
    expect(stats.successRate).toBe(75);
  });

  it('accurately recalculates streaks after editing past historical audits', () => {
    // Initially failed on 2026-08-06
    let audits: DailyAudit[] = [
      { id: '2026-08-05', date: '2026-08-05', answers: { goal_test: { goalId: 'goal_test', answer: true } }, score: 1, total: 1, percentage: 100, starRating: 'gold', completedAt: '', updatedAt: '' },
      { id: '2026-08-06', date: '2026-08-06', answers: { goal_test: { goalId: 'goal_test', answer: false } }, score: 0, total: 1, percentage: 0, starRating: 'none', completedAt: '', updatedAt: '' },
      { id: '2026-08-07', date: '2026-08-07', answers: { goal_test: { goalId: 'goal_test', answer: true } }, score: 1, total: 1, percentage: 100, starRating: 'gold', completedAt: '', updatedAt: '' },
    ];

    let stats = calculateGoalStreakStats(sampleGoal, audits, '2026-08-07');
    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(1);

    // User retroactively edits 2026-08-06 to true
    audits = audits.map((a) =>
      a.date === '2026-08-06'
        ? { ...a, answers: { goal_test: { goalId: 'goal_test', answer: true } } }
        : a
    );

    stats = calculateGoalStreakStats(sampleGoal, audits, '2026-08-07');
    expect(stats.currentStreak).toBe(3); // Connected all 3 days!
    expect(stats.longestStreak).toBe(3);
    expect(stats.totalSuccessfulDays).toBe(3);
    expect(stats.totalUnsuccessfulDays).toBe(0);
  });

  it('respects negative polarity habits (No answer continues streak)', () => {
    const negGoal: Goal = {
      id: 'neg_goal',
      title: 'No Smoking',
      polarity: 'negative',
      isArchived: false,
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
    };

    const audits: DailyAudit[] = [
      { id: '2026-08-01', date: '2026-08-01', answers: { neg_goal: { goalId: 'neg_goal', answer: false } }, score: 1, total: 1, percentage: 100, starRating: 'gold', completedAt: '', updatedAt: '' }, // resisted -> win
      { id: '2026-08-02', date: '2026-08-02', answers: { neg_goal: { goalId: 'neg_goal', answer: false } }, score: 1, total: 1, percentage: 100, starRating: 'gold', completedAt: '', updatedAt: '' }, // resisted -> win
    ];

    const stats = calculateGoalStreakStats(negGoal, audits, '2026-08-02');
    expect(stats.currentStreak).toBe(2);
    expect(stats.longestStreak).toBe(2);
  });
});
