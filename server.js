const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

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
