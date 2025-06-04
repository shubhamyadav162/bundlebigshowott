const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const crypto = require('crypto');

// Initialize Firebase Admin once, with fallback for local testing
let skipFirestore = false;
if (!process.env.SERVICE_ACCOUNT || !process.env.FIREBASE_DB_URL) {
  console.warn('SERVICE_ACCOUNT or FIREBASE_DB_URL not defined. Skipping Firestore update.');
  skipFirestore = true;
}
if (!admin.apps.length && !skipFirestore) {
  const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
  });
} else if (!admin.apps.length && skipFirestore) {
  // Initialize default app without credentials for local environment
  admin.initializeApp();
}

const db = skipFirestore ? null : admin.firestore();

module.exports = async (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST requests accepted' });
      }

      // Verify Webhook Bearer Token
      if (req.headers.authorization !== `Bearer ${process.env.LIGHTSPEED_WEBHOOK_TOKEN}`) {
        return res.status(401).json({ error: 'Invalid webhook bearer token' });
      }

      const { payment_id, user_id, status, amount } = req.body;
      if (!payment_id || !user_id) {
        throw new Error('Missing payment_id or user_id');
      }
      // Verify Lightspeed signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.LIGHTSPEED_API_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');
      if (req.headers['x-signature'] !== expectedSignature) {
        throw new Error('Invalid signature');
      }
      if (status === 'success') {
        if (db) {
          await db.collection('users').doc(user_id).update({
            isSubscribed: true,
            subscriptionEnd: admin.firestore.Timestamp.fromDate(
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            ),
            lastPayment: amount,
            paymentId: payment_id
          });
        } else {
          console.log('Skipping Firestore update in local mode.');
        }
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(400).json({ error: error.message });
    }
  });
}; 