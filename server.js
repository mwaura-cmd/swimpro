require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const crypto = require('crypto');

const app = express();

// Simple pluggable session store: Redis if REDIS_URL provided, otherwise in-memory Map
let sessionStore = null;
let redisClient = null;
if (process.env.REDIS_URL) {
  try {
    const IORedis = require('ioredis');
    redisClient = new IORedis(process.env.REDIS_URL);
    sessionStore = {
      async set(key, value, ttlMs) {
        const payload = JSON.stringify(value);
        if (ttlMs && ttlMs > 0) {
          await redisClient.set(key, payload, 'PX', ttlMs);
        } else {
          await redisClient.set(key, payload);
        }
      },
      async get(key) {
        const v = await redisClient.get(key);
        return v ? JSON.parse(v) : null;
      },
      async del(key) {
        await redisClient.del(key);
      }
    };
    console.log('[SessionStore] Using Redis at', process.env.REDIS_URL);
  } catch (err) {
    console.warn('[SessionStore] Failed to initialize Redis, falling back to memory store:', err.message);
  }
}
if (!sessionStore) {
  const mem = new Map();
  sessionStore = {
    async set(key, value, ttlMs) {
      mem.set(key, { value, expiresAt: ttlMs ? Date.now() + ttlMs : null });
    },
    async get(key) {
      const e = mem.get(key);
      if (!e) return null;
      if (e.expiresAt && Date.now() > e.expiresAt) { mem.delete(key); return null; }
      return e.value;
    },
    async del(key) { mem.delete(key); }
  };
  console.log('[SessionStore] Using in-memory session store');
}

// ------------ Supabase config ------------
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rvpgoyufmegaqxvlwddi.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGdveXVmbWVnYXF4dmx3ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTQ4MjQsImV4cCI6MjA5MDQzMDgyNH0.xM0Xqvy9aX7JFyueg6duGGbsrocf2qgtfvngciYM4nE';

// Standard client for all operations (RLS enforced on database side)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// JWT verification middleware (verifies Supabase auth token)
async function verifySupabaseToken(req, res, next) {
  // Accept token from Authorization header or server-side session referenced by cookie `swimpro_sid`
  let token = req.headers.authorization?.replace('Bearer ', '');
  if (!token && req.headers.cookie) {
    const raw = req.headers.cookie.split(';').map(c => c.trim());
    let sid = null;
    for (const pair of raw) {
      const [k, v] = pair.split('=');
      if (k === 'swimpro_sid') { sid = decodeURIComponent(v); break; }
    }
    if (sid) {
      const sess = await sessionStore.get(`sess:${sid}`);
      if (sess && sess.access_token) token = sess.access_token;
    }
  }
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token' });
    }
    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        req.user = data.user;
        req.authToken = token;  // Store token for authenticated requests
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
    }
}

// ------------ Admin auth config ------------
// Set ADMIN_PASSWORD in your Render environment variables (never hardcode it)
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD
    ? crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD).digest('hex')
    : null;

// In-memory session tokens (cleared on server restart — intentional)
const adminSessions = new Set();

function requireAdminToken(req, res, next) {
    const token = req.headers['x-admin-token'] || req.query.adminToken;
    if (!token || !adminSessions.has(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}
// ------------ Paystack config ------------
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'bookings.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});
const upload = multer({ storage });

// ------------ Email setup ------------
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_TO   = process.env.EMAIL_TO   || EMAIL_USER; // where admin notifications go

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

async function sendBookingEmail(booking) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('[Email] EMAIL_USER or EMAIL_PASS not set — skipping email.');
    return;
  }
  const mailOptions = {
    from: EMAIL_USER,
    to: EMAIL_TO,
    subject: `New Booking from ${booking.name}`,
    text: [
      `Name:     ${booking.name}`,
      `Email:    ${booking.email}`,
      `Phone:    ${booking.phone}`,
      `Category: ${booking.category}`,
      `Stroke:   ${booking.stroke}`,
      `Date:     ${booking.date}`,
      `Message:  ${booking.message || '—'}`,
      `Booking ID: ${booking.id}`,
    ].join('\n'),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Booking notification sent successfully:', info.messageId);
  } catch (err) {
    console.error('[Email] Failed to send booking notification:', err.message);
  }
}

function readBookings() {
  try {
    const txt = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (e) {
    return [];
  }
}

function writeBookings(b) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(b, null, 2));
}

// Serve static frontend files (index.html, styles.css, etc.)
app.use(express.static(__dirname));

// Serve uploads
app.use('/uploads', express.static(UPLOAD_DIR));

// ----------------- Authentication endpoints (httpOnly cookie flow) -----------------
// Login: exchanges email/password for Supabase token and sets httpOnly cookie
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // Call Supabase auth token endpoint
    const resp = await axios.post(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token`, {
      email: email.toLowerCase(),
      password,
      grant_type: 'password'
    }, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = resp.data;
    if (!data || !data.access_token) return res.status(401).json({ error: 'Invalid credentials' });

    // Create a server-side session id and store JWT server-side (Redis or in-memory)
    const sessionId = crypto.randomUUID();
    const ttlMs = (data.expires_in || 3600) * 1000;
    await sessionStore.set(`sess:${sessionId}`, { access_token: data.access_token, user_id: data.user?.id || null }, ttlMs);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: ttlMs,
      path: '/'
    };
    // Set cookie with session id (not the JWT)
    res.cookie('swimpro_sid', sessionId, cookieOptions);

    // Return minimal user info (no token)
    res.json({ user: data.user || null });
  } catch (err) {
    console.error('Auth login error', err.response ? err.response.data : err.message);
    res.status(401).json({ error: 'Login failed', details: err.response ? err.response.data : err.message });
  }
});

// Get current user based on swimpro_session cookie
app.get('/api/auth/me', async (req, res) => {
  try {
    // parse cookie
    let sid = null;
    if (req.headers.cookie) {
      const raw = req.headers.cookie.split(';').map(c => c.trim());
      for (const pair of raw) {
        const [k, v] = pair.split('=');
        if (k === 'swimpro_sid') { sid = decodeURIComponent(v); break; }
      }
    }
    if (!sid) return res.status(401).json({ error: 'Not authenticated' });

    const sess = await sessionStore.get(`sess:${sid}`);
    if (!sess || !sess.access_token) return res.status(401).json({ error: 'Invalid session' });

    const { data, error } = await supabase.auth.getUser(sess.access_token);
    if (error || !data.user) return res.status(401).json({ error: 'Invalid session' });
    res.json({ user: data.user });
  } catch (err) {
    console.error('Auth me error', err.message);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

// Logout: clear cookie
app.post('/api/auth/logout', async (req, res) => {
  try {
    let sid = null;
    if (req.headers.cookie) {
      const raw = req.headers.cookie.split(';').map(c => c.trim());
      for (const pair of raw) {
        const [k, v] = pair.split('=');
        if (k === 'swimpro_sid') { sid = decodeURIComponent(v); break; }
      }
    }
    if (sid) await sessionStore.del(`sess:${sid}`);
  } catch (e) {
    console.warn('Logout cleanup failed:', e.message);
  }
  res.clearCookie('swimpro_sid');
  res.json({ ok: true });
});

// -----------------------------------------------------------------------------------

// ------------ Paystack integration ------------

// Admin login — validates password server-side, returns a session token
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    if (!ADMIN_PASSWORD_HASH) return res.status(503).json({ error: 'Admin not configured on server' });
    const submitted = crypto.createHash('sha256').update(password).digest('hex');
    if (submitted !== ADMIN_PASSWORD_HASH) {
        return res.status(401).json({ error: 'Incorrect password' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.add(token);
    // Auto-expire token after 2 hours
    setTimeout(() => adminSessions.delete(token), 2 * 60 * 60 * 1000);
    res.json({ token });
});

// Return public key to the frontend (never expose the secret key)
app.get('/api/paystack/config', (req, res) => {
  if (!PAYSTACK_PUBLIC_KEY) {
    return res.status(500).json({ error: 'PAYSTACK_PUBLIC_KEY not set on server' });
  }
  res.json({ publicKey: PAYSTACK_PUBLIC_KEY });
});

// Verify payment after Paystack inline popup completes
app.get('/api/paystack/verify/:reference', async (req, res) => {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: 'PAYSTACK_SECRET_KEY not set on server' });
    }
    const reference = req.params.reference;
    const resp = await axios.get(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
    });
    const data = resp.data;
    if (data.status && data.data && data.data.status === 'success') {
      // Find the booking by reference (we store reference as paystack_ref on the booking)
      const bookings = readBookings();
      const idx = bookings.findIndex(b => b.paystackRef === reference);
      if (idx !== -1) {
        bookings[idx].paid = true;
        bookings[idx].status = 'confirmed';
        bookings[idx].confirmedAt = Date.now();
        bookings[idx].paystackData = data.data;
        writeBookings(bookings);
      }
      return res.json({ verified: true, data: data.data });
    }
    res.json({ verified: false, data: data.data || null });
  } catch (err) {
    console.error('Paystack verify error', err && err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'Verification failed', detail: err && err.response ? err.response.data : err.message });
  }
});

// Paystack webhook handler (for server-to-server event notifications)
app.post('/api/paystack/webhook', async (req, res) => {
  try {
    // Validate signature (reject if secret not configured)
    if (!PAYSTACK_SECRET_KEY) {
      console.warn('[Webhook] PAYSTACK_SECRET_KEY not set');
      return res.status(503).send('Webhook not configured');
    }

    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-paystack-signature'];
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY)
                       .update(rawBody)
                       .digest('hex');
    if (!signature || hash !== signature) {
      console.warn('[Webhook] Invalid signature');
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;
    const eventId = event && event.id ? event.id : (event && event.data && (event.data.reference || event.data.id)) || crypto.randomUUID();

    // Idempotency: ensure we don't process the same webhook twice
    const webhookKey = `webhook:${eventId}`;
    const seen = await sessionStore.get(webhookKey);
    if (seen) {
      console.log('[Webhook] Duplicate event, skipping:', eventId);
      return res.sendStatus(200);
    }
    // mark processed for 7 days
    await sessionStore.set(webhookKey, { processed: true }, 7 * 24 * 60 * 60 * 1000);

    // Append structured log for audit/debug
    try {
      const logLine = `${new Date().toISOString()} ${event.event} ${eventId} ${JSON.stringify(event.data || {})}\n`;
      fs.appendFileSync(path.join(__dirname, 'webhooks.log'), logLine);
    } catch (logErr) {
      console.warn('[Webhook] Failed to write webhooks.log:', logErr.message || logErr);
    }

    console.log('Paystack webhook event:', event.event, 'id=', eventId);
    if (event.event === 'charge.success') {
      const reference = event.data && event.data.reference;
      if (reference) {
        const bookings = readBookings();
        const idx = bookings.findIndex(b => b.paystackRef === reference);
        if (idx !== -1) {
          // Avoid double-updating a booking that is already marked paid
          if (!bookings[idx].paid) {
            bookings[idx].paid = true;
            bookings[idx].status = 'confirmed';
            bookings[idx].confirmedAt = Date.now();
            bookings[idx].paystackData = event.data;
            writeBookings(bookings);
            console.log('[Webhook] Booking updated for reference:', reference, 'bookingId=', bookings[idx].id);
          } else {
            console.log('[Webhook] Booking already marked paid for reference:', reference);
          }
        } else {
          console.warn('[Webhook] No local booking matched paystack reference:', reference);
        }
      } else {
        console.warn('[Webhook] charge.success missing reference');
      }
    }
    res.sendStatus(200);
  } catch (e) {
    console.error('Paystack webhook error', e && (e.message || e));
    res.sendStatus(500);
  }
});

// Admin helper: clear webhook idempotency marker (admin only)
app.post('/api/admin/clear-webhook/:id', requireAdminToken, async (req, res) => {
  try {
    const id = req.params.id;
    const key = `webhook:${id}`;
    await sessionStore.del(key);
    console.log('[Admin] Cleared webhook marker for', id);
    res.json({ ok: true, cleared: id });
  } catch (err) {
    console.error('[Admin] Failed to clear webhook marker', err.message || err);
    res.status(500).json({ error: 'Failed to clear marker' });
  }
});

// Create booking — Supabase-backed with JWT verification
app.post('/api/bookings', verifySupabaseToken, upload.single('screenshot'), async (req, res) => {
  try {
    const userId = req.user.id;
    const token = req.authToken;

    // Create authenticated Supabase client with user's token
    // This way, when we insert, auth.uid() will resolve to the user's ID
    const userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false
      }
    });

    // Set the session with the user's token so auth.uid() works
    const { data: sessionData, error: sessError } = await userSupabase.auth.setSession({
      access_token: token,
      refresh_token: token
    });

    if (sessError) {
      console.error('Session error:', sessError);
      return res.status(401).json({ error: 'Failed to set session', details: sessError.message });
    }

    const b = {
      user_id: userId,
      class_id: req.body.class_id || null,
      name: req.body.name || '',
      email: req.body.email || '',
      phone: req.body.phone || '',
      booking_date: req.body.date || null,
      suggested_time: req.body.suggested_time || null,
      message: req.body.message || '',
      paid: req.body.paid === 'true' || req.body.paid === true,
      screenshot: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'pending'
    };

    console.log('Inserting booking:', b);

    // Use authenticated client - auth.uid() now works because we set the session
    const { data, error } = await userSupabase
      .from('bookings')
      .insert([b])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(400).json({ error: 'Failed to create booking', details: error.message });
    }

    console.log('Booking created:', data);

    // Send email notification (fire-and-forget)
    if (data && data.length > 0) {
      sendBookingEmail({ ...b, id: data[0].id });
    }

    res.json(data[0] || b);
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ error: 'Booking creation failed', details: err.message });
  }
});

// List bookings — admin only — Supabase-backed
app.get('/api/bookings', requireAdminToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: 'Failed to fetch bookings', details: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Fetch bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings', details: err.message });
  }
});

// Confirm/approve booking — admin only — Supabase-backed
app.put('/api/bookings/:id/confirm', requireAdminToken, async (req, res) => {
  try {
    const id = req.params.id;

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Booking not found', details: error?.message });
    }

    // Also update file-based backup
    const bookings = readBookings();
    const idx = bookings.findIndex(x => x.id === id);
    if (idx !== -1) {
      bookings[idx].status = 'confirmed';
      bookings[idx].confirmedAt = Date.now();
      writeBookings(bookings);
    }

    res.json(data[0]);
  } catch (err) {
    console.error('Confirm booking error:', err);
    res.status(500).json({ error: 'Confirmation failed', details: err.message });
  }
});

// Attach Paystack reference to a booking (called before opening the popup)
app.put('/api/bookings/:id/payref', (req, res) => {
  const bookings = readBookings();
  const id = req.params.id;
  const idx = bookings.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  bookings[idx].paystackRef = req.body.paystackRef || null;
  writeBookings(bookings);
  res.json(bookings[idx]);
});

// Get user's own bookings — Supabase-backed
app.get('/api/bookings/my', verifySupabaseToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: 'Failed to fetch bookings', details: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Fetch user bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings', details: err.message });
  }
});

// Approve/Confirm booking (admin) — Supabase-backed (alias for /confirm)
app.put('/api/bookings/:id/approve', requireAdminToken, async (req, res) => {
  try {
    const id = req.params.id;

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'approved', confirmed_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Booking not found', details: error?.message });
    }

    res.json(data[0]);
  } catch (err) {
    console.error('Approve booking error:', err);
    res.status(500).json({ error: 'Approval failed', details: err.message });
  }
});

// Decline/Reject booking (admin) — Supabase-backed
app.put('/api/bookings/:id/decline', requireAdminToken, async (req, res) => {
  try {
    const id = req.params.id;

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'declined', declined_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Booking not found', details: error?.message });
    }

    res.json(data[0]);
  } catch (err) {
    console.error('Decline booking error:', err);
    res.status(500).json({ error: 'Decline failed', details: err.message });
  }
});

// Delete booking (admin or owner) — Supabase-backed
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const adminToken = req.headers['x-admin-token'] || req.query.adminToken;

    // Verify either JWT token (owner) or admin token
    let userId = null;
    if (authToken) {
      const { data, error } = await supabase.auth.getUser(authToken);
      if (!error && data.user) {
        userId = data.user.id;
      }
    }

    if (!adminToken && !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch booking to check ownership
    const { data: bookingData, error: fetchError } = await supabase
      .from('bookings')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !bookingData) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user is owner or admin
    if (!adminToken && bookingData.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: Not your booking' });
    }

    // Delete from Supabase
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(400).json({ error: 'Failed to delete booking', details: deleteError.message });
    }

    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
