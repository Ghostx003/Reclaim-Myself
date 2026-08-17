import { describe, it, expect } from 'vitest';
import {
  createExportBundle,
  validateImportJson,
} from '../services/importExport/importExportService';
import { Goal, DailyAudit } from '../types';

describe('Data Import & Export Validation', () => {
  it('creates and validates a valid JSON export bundle', () => {
    const goals: Goal[] = [
      {
        id: 'g1',
        title: 'Exercise Daily',
        polarity: 'positive',
        targetStreak: 30,
        isArchived: false,
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
    ];

    const audits: DailyAudit[] = [
      {
        id: '2026-08-15',
        date: '2026-08-15',
        answers: { g1: { goalId: 'g1', answer: true } },
        score: 1,
        total: 1,
        percentage: 100,
        starRating: 'gold',
        completedAt: '2026-08-15T22:00:00.000Z',
        updatedAt: '2026-08-15T22:00:00.000Z',
      },
    ];

    const bundle = createExportBundle({
      profile: {
        id: 'default_user',
        name: 'Jordan',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
        preferences: {
          theme: 'midnight',
          starThresholds: { gold: 0.85, silver: 0.5, bronze: 0 },
          confettiThreshold: 0.85,
          reducedMotion: false,
        },
      },
      goals,
      audits,
      counters: [],
      counterEvents: [],
      milestones: [],
      awards: [],
    });

    const jsonStr = JSON.stringify(bundle);
    const validation = validateImportJson(jsonStr);

    expect(validation.isValid).toBe(true);
    expect(validation.errors.length).toBe(0);
    expect(validation.summary.goalsCount).toBe(1);
    expect(validation.summary.auditsCount).toBe(1);
    expect(validation.summary.hasProfile).toBe(true);
    expect(validation.sanitizedData?.profile?.name).toBe('Jordan');
  });

  it('rejects malformed or invalid JSON', () => {
    const invalidJson = '{ "broken json';
    const validation = validateImportJson(invalidJson);
    expect(validation.isValid).toBe(false);
    expect(validation.errors[0]).toContain('Invalid JSON format');
  });

  it('rejects unsupported future schema versions', () => {
    const futureJson = JSON.stringify({
      schemaVersion: 999,
      goals: [],
      audits: [],
    });

    const validation = validateImportJson(futureJson);
    expect(validation.isValid).toBe(false);
    expect(validation.errors[0]).toContain('Unsupported schema version');
  });

  it('safely sanitizes goals with missing or invalid fields and warns the user', () => {
    const sketchyJson = JSON.stringify({
      schemaVersion: 1,
      goals: [
        { id: 'valid_g', title: 'Valid Goal', polarity: 'positive' },
        { id: 'bad_polarity', title: 'Weird Polarity', polarity: 'invalid_type' },
        { title: 'No ID' }, // invalid, skipped
      ],
      audits: [],
    });

    const validation = validateImportJson(sketchyJson);
    expect(validation.isValid).toBe(true);
    expect(validation.summary.goalsCount).toBe(2);
    expect(validation.warnings.length).toBeGreaterThan(0);
  });
});
