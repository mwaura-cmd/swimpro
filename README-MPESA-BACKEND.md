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

Notes:
- This is a simple local mock for admin verification and testing. Do not use in production without proper security, authentication, and validation.
