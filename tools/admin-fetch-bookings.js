const http = require('http');
const fetch = globalThis.fetch || require('node-fetch');

(async () => {
  try {
    const loginRes = await fetch('http://localhost:4000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || 'admin123' })
    });
    const login = await loginRes.json();
    if (!login.token) {
      console.error('Admin login failed:', login);
      process.exit(1);
    }
    console.log('Admin token received');

    const bookingsRes = await fetch('http://localhost:4000/api/bookings', {
      headers: { 'x-admin-token': login.token }
    });
    const bookings = await bookingsRes.json();
    console.log('Bookings count:', Array.isArray(bookings) ? bookings.length : 'error', '\n');
    if (Array.isArray(bookings)) {
      console.log(bookings.slice(0,20));
    } else {
      console.error('Failed to fetch bookings:', bookings);
    }
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(2);
  }
})();
