const dotenv = require('dotenv');
const crypto = require('crypto');
const axios = require('axios');

// Load environment variables from lightspeed.env
dotenv.config({ path: 'lightspeed.env' });

// Prepare webhook details
const url = process.env.LIGHTSPEED_WEBHOOK_URL || 'http://localhost:3000/paymentWebhook';
console.log(`Sending webhook to URL: ${url}`);
const body = {
  payment_id: 'TEST123',
  user_id: 'some-user-id',
  status: 'success',
  amount: 1
};

// Compute HMAC signature
const signature = crypto
  .createHmac('sha256', process.env.LIGHTSPEED_API_SECRET)
  .update(JSON.stringify(body))
  .digest('hex');

// Send POST request
axios.post(url, body, {
  headers: {
    Authorization: `Bearer ${process.env.LIGHTSPEED_WEBHOOK_TOKEN}`,
    'Content-Type': 'application/json',
    'x-signature': signature
  }
})
.then(res => console.log('Response:', res.status, res.data))
.catch(err => console.error('Error:', err.response ? err.response.data : err.message)); 