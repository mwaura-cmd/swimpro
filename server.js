const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
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

// Serve uploads
app.use('/uploads', express.static(UPLOAD_DIR));

// ------------ Daraja / M-Pesa integration ------------
// Environment variables used:
// DAR_CONSUMER_KEY, DAR_CONSUMER_SECRET, DAR_SHORTCODE, DAR_PASSKEY, CALLBACK_BASE_URL
// Set CALLBACK_BASE_URL to the public URL (e.g., https://<your-ngrok>.ngrok.io) for production/ testing.

const DAR_USE_SANDBOX = process.env.DAR_USE_SANDBOX !== 'false';
const DAR_CONSUMER_KEY = process.env.DAR_CONSUMER_KEY || '';
const DAR_CONSUMER_SECRET = process.env.DAR_CONSUMER_SECRET || '';
const DAR_SHORTCODE = process.env.DAR_SHORTCODE || process.env.BUSINESS_SHORTCODE || '';
const DAR_PASSKEY = process.env.DAR_PASSKEY || '';
const CALLBACK_BASE_URL = process.env.CALLBACK_BASE_URL || '';

const OAUTH_URL = DAR_USE_SANDBOX
  ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
  : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

const STK_URL = DAR_USE_SANDBOX
  ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

let tokenCache = { token: null, expiry: 0 };

async function getDarajaToken() {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expiry > now + 5000) return tokenCache.token;
  if (!DAR_CONSUMER_KEY || !DAR_CONSUMER_SECRET) throw new Error('Daraja credentials not set');
  const auth = Buffer.from(`${DAR_CONSUMER_KEY}:${DAR_CONSUMER_SECRET}`).toString('base64');
  const resp = await axios.get(OAUTH_URL, { headers: { Authorization: `Basic ${auth}` } });
  const t = resp.data.access_token;
  const expiresIn = (resp.data.expires_in || 3600) * 1000;
  tokenCache = { token: t, expiry: now + expiresIn };
  return t;
}

function darajaTimestamp() {
  const d = new Date();
  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${YYYY}${MM}${DD}${hh}${mm}${ss}`;
}

// Initiate STK Push for a booking
app.post('/api/bookings/:id/stk', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    if (!phone || !amount) return res.status(400).json({ error: 'phone and amount are required' });
    const bookings = readBookings();
    const id = req.params.id;
    const idx = bookings.findIndex(x => x.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Booking not found' });

    if (!DAR_SHORTCODE || !DAR_PASSKEY || !CALLBACK_BASE_URL) {
      return res.status(500).json({ error: 'Daraja config missing on server. Set DAR_SHORTCODE, DAR_PASSKEY and CALLBACK_BASE_URL.' });
    }

    const timestamp = darajaTimestamp();
    const password = Buffer.from(DAR_SHORTCODE + DAR_PASSKEY + timestamp).toString('base64');
    const token = await getDarajaToken();

    const payload = {
      BusinessShortCode: DAR_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: String(amount),
      PartyA: phone,
      PartyB: DAR_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: `${CALLBACK_BASE_URL}/api/mpesa/stk/callback`,
      AccountReference: `SwimPro ${id}`,
      TransactionDesc: `Payment for booking ${id}`
    };

    const resp = await axios.post(STK_URL, payload, { headers: { Authorization: `Bearer ${token}` } });
    // Save checkout id to booking for later matching
    bookings[idx].stkRequest = resp.data;
    bookings[idx].status = 'stk_requested';
    writeBookings(bookings);
    res.json(resp.data);
  } catch (err) {
    console.error('STK error', err && err.response ? err.response.data : err.message || err);
    res.status(500).json({ error: 'STK initiation failed', detail: err && err.response ? err.response.data : err.message });
  }
});

// Daraja STK callback handler
app.post('/api/mpesa/stk/callback', (req, res) => {
  try {
    const body = req.body;
    console.log('MPESA STK callback received:', JSON.stringify(body).slice(0, 2000));
    // The structure from Daraja places the results under Body.stkCallback
    const cb = body.Body && body.Body.stkCallback ? body.Body.stkCallback : null;
    if (!cb) return res.status(200).send('ok');

    const checkoutId = cb.CheckoutRequestID;
    const merchantReqId = cb.MerchantRequestID;
    const resultCode = cb.ResultCode;
    const resultDesc = cb.ResultDesc;

    const bookings = readBookings();
    // Find booking where bookings[x].stkRequest.CheckoutRequestID === checkoutId
    const idx = bookings.findIndex(b => b.stkRequest && b.stkRequest.CheckoutRequestID === checkoutId);
    if (idx !== -1) {
      bookings[idx].stkCallback = cb;
      bookings[idx].merchantRequestId = merchantReqId;
      bookings[idx].checkoutRequestId = checkoutId;
      bookings[idx].resultCode = resultCode;
      bookings[idx].resultDesc = resultDesc;
      bookings[idx].updatedAt = Date.now();
      if (resultCode === 0) {
        // Payment successful — capture any mpesaReceiptNumber and set paid/confirmed
        const metadata = cb.CallbackMetadata && cb.CallbackMetadata.Item ? cb.CallbackMetadata.Item.reduce((acc, it) => { acc[it.Name] = it.Value; return acc; }, {}) : {};
        bookings[idx].mpesa = metadata;
        bookings[idx].paid = true;
        bookings[idx].status = 'confirmed';
        bookings[idx].confirmedAt = Date.now();
      } else {
        bookings[idx].status = 'failed';
      }
      writeBookings(bookings);
    } else {
      console.warn('No booking matching CheckoutRequestID', checkoutId);
    }

    // Respond quickly to Daraja
    res.json({ ResultCode: 0, ResultDesc: 'Received' });
  } catch (e) {
    console.error('Callback handling error', e);
    res.status(500).json({ error: 'callback handling error' });
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
  res.json(b);
});

// List bookings
app.get('/api/bookings', (req, res) => {
  const bookings = readBookings();
  res.json(bookings);
});

// Confirm booking
app.put('/api/bookings/:id/confirm', (req, res) => {
  const bookings = readBookings();
  const id = req.params.id;
  const idx = bookings.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  bookings[idx].status = 'confirmed';
  bookings[idx].confirmedAt = Date.now();
  writeBookings(bookings);
  res.json(bookings[idx]);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
