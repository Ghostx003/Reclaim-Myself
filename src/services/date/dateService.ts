/**
 * Centralized Date & Time Utility Service
 * Strictly handles local calendar date calculations without server clock dependencies.
 */

/**
 * Format a Date object into YYYY-MM-DD local calendar string
 */
export function formatDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a local Date object set at 00:00:00 local time
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Returns today's date key formatted as YYYY-MM-DD
 */
export function getTodayKey(): string {
  return formatDateKey(new Date());
}

/**
 * Check if the given date is in the future compared to local device Today
 */
export function isFutureDate(dateKey: string): boolean {
  const target = parseDateKey(dateKey);
  const today = parseDateKey(getTodayKey());
  return target.getTime() > today.getTime();
}

/**
 * Check if the given date is today
 */
export function isTodayDate(dateKey: string): boolean {
  return dateKey === getTodayKey();
}

/**
 * Returns formatted human-readable date string (e.g. "Monday, August 17, 2026")
 */
export function formatDisplayDate(dateKey: string, options?: Intl.DateTimeFormatOptions): string {
  const date = parseDateKey(dateKey);
  const defaultOpts: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString(undefined, options || defaultOpts);
}

/**
 * Returns short display string (e.g. "Aug 17")
 */
export function formatShortDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Add or subtract days to a dateKey
 */
export function addDaysToDateKey(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

/**
 * Check if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get the number of days in a given month (0-indexed month: 0=Jan, 11=Dec)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export interface MonthMatrixDay {
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
}

/**
 * Generates a standard 6-week (42 days) calendar grid for a given year and month.
 * Starts from Sunday (0) to Saturday (6).
 */
export function getMonthMatrix(year: number, month: number): MonthMatrixDay[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInCurrentMonth = getDaysInMonth(year, month);
  
  const todayKey = getTodayKey();
  const matrix: MonthMatrixDay[] = [];
  
  // Previous month days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dateKey = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    matrix.push({
      dateKey,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      isFuture: isFutureDate(dateKey),
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    matrix.push({
      dateKey,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
      isFuture: isFutureDate(dateKey),
    });
  }
  
  // Next month filler days to complete 35 or 42 grid cells
  const remainingCells = (matrix.length > 35 ? 42 : 35) - matrix.length;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  
  for (let day = 1; day <= remainingCells; day++) {
    const dateKey = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    matrix.push({
      dateKey,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      isFuture: isFutureDate(dateKey),
    });
  }
  
  return matrix;
}
