import { describe, it, expect } from 'vitest';
import {
  isGoalSuccess,
  calculateDailyScore,
  generateGoalQuestion,
} from '../services/scoring/scoringEngine';
import { Goal, GoalAuditAnswer } from '../types';
import { DEFAULT_USER_PREFERENCES } from '../constants';

describe('Scoring Engine & Goal Polarity', () => {
  it('correctly evaluates Positive Polarity (Yes = Success, No = Failure)', () => {
    expect(isGoalSuccess('positive', true)).toBe(true);
    expect(isGoalSuccess('positive', false)).toBe(false);
  });

  it('correctly evaluates Negative Polarity (No = Success, Yes = Failure)', () => {
    expect(isGoalSuccess('negative', false)).toBe(true);
    expect(isGoalSuccess('negative', true)).toBe(false);
  });

  it('calculates full completion (N / N, 100%, Gold Star)', () => {
    const goals: Goal[] = [
      {
        id: 'g1',
        title: 'Morning Meditation',
        polarity: 'positive',
        isArchived: false,
        createdAt: '2026-08-01',
        updatedAt: '2026-08-01',
      },
      {
        id: 'g2',
        title: 'No Late Night Snacking',
        polarity: 'negative',
        isArchived: false,
        createdAt: '2026-08-01',
        updatedAt: '2026-08-01',
      },
    ];

    const answers: Record<string, GoalAuditAnswer> = {
      g1: { goalId: 'g1', answer: true },  // positive goal + Yes => success
      g2: { goalId: 'g2', answer: false }, // negative goal + No => success
    };

    const result = calculateDailyScore(goals, answers, DEFAULT_USER_PREFERENCES);
    expect(result.score).toBe(2);
    expect(result.total).toBe(2);
    expect(result.percentage).toBe(100);
    expect(result.starRating).toBe('gold');
  });

  it('calculates 0 / N (0%, Bronze / None)', () => {
    const goals: Goal[] = [
      {
        id: 'g1',
        title: 'Read 20 pages',
        polarity: 'positive',
        isArchived: false,
        createdAt: '2026-08-01',
        updatedAt: '2026-08-01',
      },
      {
        id: 'g2',
        title: 'No Social Media Scrolling',
        polarity: 'negative',
        isArchived: false,
        createdAt: '2026-08-01',
        updatedAt: '2026-08-01',
      },
    ];

    const answers: Record<string, GoalAuditAnswer> = {
      g1: { goalId: 'g1', answer: false }, // positive goal + No => fail
      g2: { goalId: 'g2', answer: true },  // negative goal + Yes => fail
    };

    const result = calculateDailyScore(goals, answers, DEFAULT_USER_PREFERENCES);
    expect(result.score).toBe(0);
    expect(result.total).toBe(2);
    expect(result.percentage).toBe(0);
    expect(result.starRating).toBe('none');
  });

  it('calculates partial completion with Silver star grading (2 / 3, 66.7%)', () => {
    const goals: Goal[] = [
      { id: 'g1', title: 'Goal 1', polarity: 'positive', isArchived: false, createdAt: '', updatedAt: '' },
      { id: 'g2', title: 'Goal 2', polarity: 'positive', isArchived: false, createdAt: '', updatedAt: '' },
      { id: 'g3', title: 'Goal 3', polarity: 'negative', isArchived: false, createdAt: '', updatedAt: '' },
    ];

    const answers: Record<string, GoalAuditAnswer> = {
      g1: { goalId: 'g1', answer: true },  // 1
      g2: { goalId: 'g2', answer: false }, // 0
      g3: { goalId: 'g3', answer: false }, // 1 (negative goal answered No is success)
    };

    const result = calculateDailyScore(goals, answers, DEFAULT_USER_PREFERENCES);
    expect(result.score).toBe(2);
    expect(result.total).toBe(3);
    expect(result.percentage).toBe(66.7);
    expect(result.starRating).toBe('silver'); // between 50% and 85%
  });

  it('generates dynamic natural questions for positive and negative goals', () => {
    const posGoal: Goal = {
      id: 'g1',
      title: 'Workout 45 mins',
      polarity: 'positive',
      isArchived: false,
      createdAt: '',
      updatedAt: '',
    };
    const negGoal: Goal = {
      id: 'g2',
      title: 'Smoking cigarettes',
      polarity: 'negative',
      isArchived: false,
      createdAt: '',
      updatedAt: '',
    };

    expect(generateGoalQuestion(posGoal)).toBe('Did you Workout 45 mins today?');
    expect(generateGoalQuestion(negGoal)).toBe('Did you Smoking cigarettes today?');
  });
});
