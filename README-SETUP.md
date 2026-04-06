Quick dev setup — SwimPro Daraja backend

1) Create a `.env` file based on `.env.example` and paste your Daraja credentials.

2) Install dependencies:

```bash
npm install
```

3) Start server:

```bash
npm start
```

4) Expose local server (for Daraja callbacks):

```bash
ngrok http 4000
```

Set `CALLBACK_BASE_URL` to the provided ngrok HTTPS URL.

5) Test token endpoint:

- Visit `http://localhost:4000/get-token` to verify OAuth token retrieval.

6) Create a booking from the frontend or with curl:

```bash
curl -F "name=Test" -F "phone=2547XXXXXXXX" -F "date=2026-02-27" http://localhost:4000/api/bookings
```

7) Initiate STK push:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"phone":"2547XXXXXXXX","amount":200}' http://localhost:4000/api/bookings/<bookingId>/stk
```

8) Watch logs for callback at `/api/mpesa/stk/callback` — the server updates `bookings.json` automatically.

Render deploy notes

- Use `npm install --omit=dev` as the build command to avoid installing test-only dependencies.
- Ensure service health checks point to `/healthz`.
- If a deploy ever fails while installing Puppeteer/Chrome, set:
	- `PUPPETEER_SKIP_DOWNLOAD=true`
	- `NPM_CONFIG_PUPPETEER_SKIP_DOWNLOAD=true`
