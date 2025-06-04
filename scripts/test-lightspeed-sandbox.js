require('dotenv').config({ path: 'lightspeed.env' });
const axios = require('axios');

const API_KEY = process.env.LIGHTSPEED_API_KEY;
const API_SECRET = process.env.LIGHTSPEED_API_SECRET;
const TYPE = 'sandbox';

async function initiateTransaction() {
  try {
    const payload = {
      customerName: 'Test User',
      status: 'success',
      method: 'Qr',
      description: 'Test Payment',
      amount: 1,
      billId: 'TEST123',
      vpaId: 'test@upi',
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      type: TYPE,
    };
    const response = await axios.post(
      'https://api.lightspeedpay.in/api/v1/transaction/sandbox/initiate-transaction',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('Sandbox Initiate Response:', response.data);
  } catch (error) {
    console.error('Error initiating sandbox transaction:', error.response ? error.response.data : error.message);
  }
}

initiateTransaction(); 