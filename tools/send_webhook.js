const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error('PAYSTACK_SECRET_KEY not set in .env');

    const payloadObj = {
      event: 'charge.success',
      id: 'evt_node_001',
      data: { reference: 'WEBHOOK-TEST-001', amount: 10000, status: 'success' }
    };
    const raw = JSON.stringify(payloadObj);
    const hmac = crypto.createHmac('sha512', secret).update(raw).digest('hex');

    console.log('Posting webhook to http://localhost:52000/api/paystack/webhook');
    console.log('Signature:', hmac);

    const resp = await axios.post('http://localhost:52000/api/paystack/webhook', payloadObj, {
      headers: { 'x-paystack-signature': hmac, 'Content-Type': 'application/json' },
      timeout: 5000
    });

    console.log('Status:', resp.status);
    console.log('Data:', resp.data);
  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Body:', err.response.data);
    } else {
      console.error('Request failed:', err.message);
    }
    process.exit(1);
  }
})();
