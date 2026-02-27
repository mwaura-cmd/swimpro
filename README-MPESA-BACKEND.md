SwimPro mock backend

This small Express server accepts bookings with an optional screenshot upload, stores them in `bookings.json`, and serves uploaded images from `/uploads`.

Quick start:

1. Install dependencies:

```bash
npm install
```

2. Run server:

```bash
npm start
```

3. Server runs on `http://localhost:4000` by default.

API endpoints:
- `POST /api/bookings` (multipart/form-data) fields: `name,email,phone,stroke,date,message,paid` and file `screenshot`
- `GET /api/bookings` returns all bookings
- `PUT /api/bookings/:id/confirm` marks booking confirmed

Daraja (M-Pesa) STK Push integration
-----------------------------------

This server can initiate M-Pesa STK Push (Daraja) requests and accept Daraja callbacks. To enable Daraja features set these environment variables before running:

- `DAR_CONSUMER_KEY` - your Daraja consumer key
- `DAR_CONSUMER_SECRET` - your Daraja consumer secret
- `DAR_SHORTCODE` - the BusinessShortCode (paybill or till)
- `DAR_PASSKEY` - the Daraja passkey for STK Push
- `CALLBACK_BASE_URL` - public base URL where Daraja can call back (e.g. https://<ngrok-id>.ngrok.io)
- `DAR_USE_SANDBOX` - set to `false` for production; defaults to sandbox

Endpoints:
- `POST /api/bookings/:id/stk` - initiate an STK Push for a previously created booking. JSON body: `{ "phone": "2547XXXXXXXX", "amount": 100 }`.
- `POST /api/mpesa/stk/callback` - callback endpoint that Daraja will POST to. The server updates the booking status automatically when a callback is received.

Testing tips:
- For local testing use `ngrok` or similar to expose `http://localhost:4000` and set `CALLBACK_BASE_URL` to the ngrok URL.
- Use the Safaricom Daraja sandbox credentials and endpoints when `DAR_USE_SANDBOX` is not set to `false`.

Frontend configuration:
- If your frontend is served from a different origin (for example GitHub Pages), set the frontend `API_BASE` variable to point to your backend. You can do this by setting `window.API_BASE` before the site's inline scripts, or by editing the `API_BASE` constant in `index.html`.

Example (place in a script tag before other scripts):
```html
<script>window.API_BASE = 'https://your-ngrok-id.ngrok.io';</script>
```

Security & production notes:
- Protect the callback endpoint and admin endpoints in production.
- Validate and verify callbacks server-side (use the provided `CheckoutRequestID` to match requests).
- Replace file-based storage with a proper database for production.

Notes:
- This is a simple local mock for admin verification and testing. Do not use in production without proper security, authentication, and validation.
