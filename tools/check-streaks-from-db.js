const { createClient } = require('@supabase/supabase-js');
const { computeWeeklyStreak, computeMonthlyStreak } = require('../src/utils/streak');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  try {
    console.log('[check-streaks] Querying confirmed bookings from Supabase...');
    const { data, error } = await supabase
      .from('bookings')
      .select('id,user_id,booking_date,confirmed_at,status')
      .eq('status', 'confirmed')
      .order('confirmed_at', { ascending: false })
      .limit(2000);

    if (error) {
      console.error('[check-streaks] Supabase error:', error);
      process.exit(1);
    }

    const byUser = {};
    for (const b of data || []) {
      const uid = b.user_id || 'unknown';
      const date = b.confirmed_at || b.booking_date;
      if (!date) continue;
      if (!byUser[uid]) byUser[uid] = [];
      byUser[uid].push(date);
    }

    console.log(`[check-streaks] Found ${Object.keys(byUser).length} users with confirmed bookings`);

    for (const [uid, dates] of Object.entries(byUser)) {
      const weekly = computeWeeklyStreak(dates, { now: new Date().toISOString(), periodsToCheck: 52 });
      const monthly = computeMonthlyStreak(dates, { now: new Date().toISOString(), periodsToCheck: 24 });
      console.log(`user=${uid} weekly=${weekly} monthly=${monthly} samples=${dates.slice(0,5).join(',')}`);
    }

    console.log('[check-streaks] Done');
    process.exit(0);
  } catch (err) {
    console.error('[check-streaks] Unexpected error:', err.message || err);
    process.exit(2);
  }
})();
