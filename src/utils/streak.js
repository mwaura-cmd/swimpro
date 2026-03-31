// Pure helpers for computing weekly/monthly streaks from confirmed booking dates

function weekKeyFromDate(d) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (date.getDay() + 6) % 7; // 0 = Monday
  date.setDate(date.getDate() - day);
  const y = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${y}-${mm}-${dd}`; // week starting date
}

function monthKeyFromDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function computeWeeklyStreak(dates, options = {}) {
  // dates: array of ISO date strings or Date objects (confirmed booking dates)
  // options.periodsToCheck: max weeks to look back (default 12)
  const periodsToCheck = options.periodsToCheck || 12;
  if (!Array.isArray(dates) || dates.length === 0) return 0;

  const normalized = dates.map(d => typeof d === 'string' ? new Date(d) : new Date(d));
  const presentWeeks = new Set(normalized.map(d => weekKeyFromDate(d)));

  const now = options.now ? new Date(options.now) : new Date();
  const currentDay = now.getDay();
  const daysSinceMonday = (currentDay + 6) % 7;
  const startOfCurrentWeek = new Date(now);
  startOfCurrentWeek.setDate(now.getDate() - daysSinceMonday);

  let streak = 0;
  for (let i = 0; i < periodsToCheck; i++) {
    const checkMonday = new Date(startOfCurrentWeek);
    checkMonday.setDate(startOfCurrentWeek.getDate() - i * 7);
    const key = weekKeyFromDate(checkMonday);
    if (presentWeeks.has(key)) streak++; else break;
  }
  return streak;
}

function computeMonthlyStreak(dates, options = {}) {
  // dates: array of ISO date strings or Date objects
  const periodsToCheck = options.periodsToCheck || 12;
  if (!Array.isArray(dates) || dates.length === 0) return 0;

  const normalized = dates.map(d => typeof d === 'string' ? new Date(d) : new Date(d));
  const presentMonths = new Set(normalized.map(d => monthKeyFromDate(d)));

  const now = options.now ? new Date(options.now) : new Date();
  let streak = 0;
  for (let i = 0; i < periodsToCheck; i++) {
    const checkDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKeyFromDate(checkDate);
    if (presentMonths.has(key)) streak++; else break;
  }
  return streak;
}

module.exports = {
  weekKeyFromDate,
  monthKeyFromDate,
  computeWeeklyStreak,
  computeMonthlyStreak
};
