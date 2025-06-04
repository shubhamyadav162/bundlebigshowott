const express = require('express');
const admin = require('firebase-admin');

// Initialize Firebase Admin with configuration from environment variables
let skipFirestore = false;
if (!process.env.SERVICE_ACCOUNT || !process.env.FIREBASE_DB_URL) {
  console.warn('SERVICE_ACCOUNT or FIREBASE_DB_URL not defined. Subscription endpoints will not work properly.');
  skipFirestore = true;
}
if (!admin.apps.length && !skipFirestore) {
  const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
  });
} else if (!admin.apps.length && skipFirestore) {
  admin.initializeApp();
}

const db = skipFirestore ? null : admin.firestore();
const router = express.Router();

// Static subscription plans
const plans = [
  { id: 'trial', label: 'Trial', duration: '3 days', durationDays: 3, price: 99, pricePerDay: 33, savings: null, isBestValue: false },
  { id: 'short-term-intro', label: 'Short-Term Intro', duration: '15 days', durationDays: 15, price: 149, pricePerDay: 9.9, savings: 67, isBestValue: false },
  { id: 'monthly', label: 'Monthly', duration: '1 month', durationDays: 30, price: 199, pricePerDay: 6.6, savings: null, isBestValue: false },
  { id: 'quarterly', label: 'Quarterly', duration: '3 months', durationDays: 90, price: 299, pricePerDay: 3.3, savings: 50, isBestValue: false },
  { id: 'semi-annual', label: 'Semi-Annual', duration: '6 months', durationDays: 180, price: 599, pricePerDay: 3.33, savings: 50, isBestValue: false },
  { id: 'annual', label: 'Annual (Best Value)', duration: '12 months', durationDays: 365, price: 699, pricePerDay: 1.92, savings: 71, isBestValue: true }
];

// GET /subscriptions/plans - list available plans
router.get('/plans', (req, res) => {
  res.json({ plans });
});

// GET /subscriptions/all - list all subscribed users with subscription data
router.get('/all', async (req, res) => {
  if (skipFirestore) {
    return res.status(503).json({ error: 'Firestore is not configured' });
  }
  try {
    const snapshot = await db.collection('users').where('isSubscribed', '==', true).get();
    const users = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      let authUser = {};
      try {
        const userRecord = await admin.auth().getUser(doc.id);
        authUser.email = userRecord.email;
        authUser.displayName = userRecord.displayName;
      } catch (err) {
        console.error('Could not fetch auth user for', doc.id, err);
      }
      const subscriptionEnd = data.subscriptionEnd ? data.subscriptionEnd.toDate() : null;
      const daysRemaining = subscriptionEnd ? Math.max(0, Math.ceil((subscriptionEnd - new Date()) / (1000*60*60*24))) : 0;
      return {
        uid: doc.id,
        planId: data.planId || null,
        name: authUser.displayName || null,
        email: authUser.email || null,
        subscriptionEnd: subscriptionEnd ? subscriptionEnd.toISOString() : null,
        daysRemaining,
        lastPayment: data.lastPayment || null,
      };
    }));
    return res.json({ users });
  } catch (err) {
    console.error('Error fetching all subscriptions:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware: verify Firebase ID token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = { uid: decoded.uid };
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
router.use(authenticate);

// GET /subscriptions/current - get current subscription status
router.get('/current', async (req, res) => {
  if (skipFirestore) {
    return res.status(503).json({ error: 'Firestore is not configured' });
  }
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User subscription not found' });
    }
    const data = userDoc.data();
    let subscriptionEnd = data.subscriptionEnd;
    if (subscriptionEnd && subscriptionEnd.toDate) {
      subscriptionEnd = subscriptionEnd.toDate().toISOString();
    }
    return res.json({ isSubscribed: data.isSubscribed, subscriptionEnd, planId: data.planId || null });
  } catch (err) {
    console.error('Error fetching subscription:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /subscriptions/subscribe - subscribe user to a plan
router.post('/subscribe', async (req, res) => {
  if (skipFirestore) {
    return res.status(503).json({ error: 'Firestore is not configured' });
  }
  const { planId } = req.body;
  const plan = plans.find(p => p.id === planId);
  if (!plan) {
    return res.status(400).json({ error: 'Invalid plan ID' });
  }
  try {
    const now = new Date();
    const newExpiry = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    const expiryTimestamp = admin.firestore.Timestamp.fromDate(newExpiry);

    await db.collection('users').doc(req.user.uid).set({
      isSubscribed: true,
      subscriptionEnd: expiryTimestamp,
      planId: plan.id,
      lastPayment: plan.price
    }, { merge: true });

    return res.json({ success: true, planId: plan.id, subscriptionEnd: newExpiry.toISOString() });
  } catch (err) {
    console.error('Error subscribing user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 