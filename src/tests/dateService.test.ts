import { describe, it, expect } from 'vitest';
import {
  isFutureDate,
  addDaysToDateKey,
  isLeapYear,
  getDaysInMonth,
  getMonthMatrix,
  getTodayKey,
} from '../services/date/dateService';

describe('Date Service & Restrictions', () => {
  it('correctly detects future dates and blocks auditing them', () => {
    const today = getTodayKey();
    const tomorrow = addDaysToDateKey(today, 1);
    const yesterday = addDaysToDateKey(today, -1);

    expect(isFutureDate(tomorrow)).toBe(true);
    expect(isFutureDate(yesterday)).toBe(false);
    expect(isFutureDate(today)).toBe(false);
  });

  it('correctly handles month and year rollovers', () => {
    expect(addDaysToDateKey('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysToDateKey('2027-01-01', -1)).toBe('2026-12-31');
    expect(addDaysToDateKey('2026-02-28', 1)).toBe('2026-03-01'); // Non leap year
  });

  it('handles leap years accurately', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);

    expect(getDaysInMonth(2024, 1)).toBe(29); // Feb 2024
    expect(getDaysInMonth(2026, 1)).toBe(28); // Feb 2026
  });

  it('generates a full 35 or 42 cell month matrix', () => {
    const matrix = getMonthMatrix(2026, 7); // August 2026 (0-indexed 7)
    expect(matrix.length).toBeGreaterThanOrEqual(35);
    const aug15 = matrix.find((m) => m.dateKey === '2026-08-15');
    expect(aug15).toBeDefined();
    expect(aug15?.isCurrentMonth).toBe(true);
  });
});
