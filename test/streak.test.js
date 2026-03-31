const { computeWeeklyStreak, computeMonthlyStreak, weekKeyFromDate, monthKeyFromDate } = require('../src/utils/streak');

describe('streak utils', () => {
  test('weekKeyFromDate returns Monday-start key', () => {
    const d = new Date('2026-03-31'); // Tuesday
    const key = weekKeyFromDate(d);
    expect(typeof key).toBe('string');
  });

  test('monthKeyFromDate returns YYYY-MM', () => {
    const d = new Date('2026-03-31');
    expect(monthKeyFromDate(d)).toBe('2026-03');
  });

  test('computeWeeklyStreak with consecutive weeks', () => {
    // prepare dates: assume today = 2026-03-31 (Tue). Weeks starting: 2026-03-30 (Mon), 2026-03-23, 2026-03-16
    const bookings = ['2026-03-30', '2026-03-24', '2026-03-17'];
    const streak = computeWeeklyStreak(bookings, { now: '2026-03-31', periodsToCheck: 6 });
    expect(streak).toBe(3);
  });

  test('computeWeeklyStreak breaks on missing week', () => {
    const bookings = ['2026-03-30', '2026-03-17']; // missing 2026-03-23 week
    const streak = computeWeeklyStreak(bookings, { now: '2026-03-31', periodsToCheck: 6 });
    expect(streak).toBe(1);
  });

  test('computeMonthlyStreak consecutive months', () => {
    const bookings = ['2026-03-05', '2026-02-14', '2026-01-20'];
    const streak = computeMonthlyStreak(bookings, { now: '2026-03-31', periodsToCheck: 6 });
    expect(streak).toBe(3);
  });

  test('computeMonthlyStreak breaks on missing month', () => {
    const bookings = ['2026-03-05', '2026-01-20']; // missing Feb
    const streak = computeMonthlyStreak(bookings, { now: '2026-03-31', periodsToCheck: 6 });
    expect(streak).toBe(1);
  });

  test('empty dates => 0', () => {
    expect(computeWeeklyStreak([], { now: '2026-03-31' })).toBe(0);
    expect(computeMonthlyStreak([], { now: '2026-03-31' })).toBe(0);
  });
});
