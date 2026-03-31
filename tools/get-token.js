const axios = require('axios');

// Usage: set env vars SUPABASE_URL, SUPABASE_ANON_KEY, EMAIL, PASSWORD then run `node tools/get-token.js`

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

if (!SUPABASE_URL || !ANON_KEY || !EMAIL || !PASSWORD) {
  console.error('Missing required env vars. Example:');
  console.error('  SUPABASE_URL, SUPABASE_ANON_KEY, EMAIL, PASSWORD');
  process.exit(1);
}

(async () => {
  try {
    const url = `${SUPABASE_URL.replace(/\/+$/,'')}/auth/v1/token?grant_type=password`;
    const res = await axios.post(url, { email: EMAIL, password: PASSWORD }, {
      headers: {
        apikey: ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    // Response contains access_token, refresh_token, user
    const data = res.data;
    console.log('ACCESS_TOKEN:\n', data.access_token);
    console.log('\nUSER JSON:\n', JSON.stringify(data.user, null, 2));
  } catch (err) {
    if (err.response && err.response.data) console.error('Error response:', err.response.data);
    else console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
