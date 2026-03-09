require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer');

const crypto = require('crypto');

const app = express();

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
    console.log('[Email] ✅ Booking notification sent successfully:', info.messageId);
  } catch (err) {
    console.error('[Email] ❌ Failed to send booking notification:', err.message);
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
app.post('/api/paystack/webhook', (req, res) => {
  try {
    // Validate signature
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY)
                       .update(JSON.stringify(req.body))
                       .digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).send('Invalid signature');
    }
    const event = req.body;
    console.log('Paystack webhook event:', event.event);
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const bookings = readBookings();
      const idx = bookings.findIndex(b => b.paystackRef === reference);
      if (idx !== -1) {
        bookings[idx].paid = true;
        bookings[idx].status = 'confirmed';
        bookings[idx].confirmedAt = Date.now();
        bookings[idx].paystackData = event.data;
        writeBookings(bookings);
      }
    }
    res.sendStatus(200);
  } catch (e) {
    console.error('Paystack webhook error', e);
    res.sendStatus(500);
  }
});

// Create booking (with screenshot upload optional)
app.post('/api/bookings', upload.single('screenshot'), (req, res) => {
  const bookings = readBookings();
  const id = 'bk_' + Date.now();
  const b = {
    id,
    name: req.body.name || '',
    email: req.body.email || '',
    phone: req.body.phone || '',
    category: req.body.category || '',
    stroke: req.body.stroke || '',
    date: req.body.date || '',
    message: req.body.message || '',
    paid: req.body.paid === 'true' || req.body.paid === true,
    screenshot: req.file ? `/uploads/${req.file.filename}` : null,
    status: 'pending',
    createdAt: Date.now()
  };
  bookings.push(b);
  writeBookings(bookings);
  sendBookingEmail(b); // fire-and-forget — does not block the response
  res.json(b);
});

// List bookings — admin only
app.get('/api/bookings', requireAdminToken, (req, res) => {
  const bookings = readBookings();
  res.json(bookings);
});

// Confirm booking — admin only
app.put('/api/bookings/:id/confirm', requireAdminToken, (req, res) => {
  const bookings = readBookings();
  const id = req.params.id;
  const idx = bookings.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  bookings[idx].status = 'confirmed';
  bookings[idx].confirmedAt = Date.now();
  writeBookings(bookings);
  res.json(bookings[idx]);
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
