'use strict';
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const crypto = require('crypto');

// Initialize Firebase Admin with default credentials
admin.initializeApp();

const db = admin.firestore();

exports.paymentWebhook = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        throw new Error('Only POST requests are accepted');
      }
      const { payment_id, user_id, status, amount } = req.body;
      if (!payment_id || !user_id) {
        throw new Error('Missing payment_id or user_id');
      }
      const apiSecret = functions.config().lightspeed.api_secret;
      const expectedSignature = crypto
        .createHmac('sha256', apiSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      if (req.headers['x-signature'] !== expectedSignature) {
        throw new Error('Invalid signature');
      }
      if (status === 'success') {
        await db.collection('users').doc(user_id).update({
          isSubscribed: true,
          subscriptionEnd: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          ),
          lastPayment: amount,
          paymentId: payment_id,
        });
      }
      res.status(200).json({ success: true });
    } catch (error) {
      functions.logger.error('Webhook error:', error);
      res.status(400).json({ error: error.message });
    }
  });
}); 