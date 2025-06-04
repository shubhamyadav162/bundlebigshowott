const express = require('express');
const cors = require('cors');
const paymentWebhookHandler = require('./paymentWebhook');
const subscriptionsRouter = require('./subscriptions');
const oauthRouter = require('./oauth');

// Load environment variables
require('dotenv').config({ path: '../lightspeed.env' });
const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

// Register webhook route based on LIGHTSPEED_WEBHOOK_URL
const { URL } = require('url');
const webhookUrl = process.env.LIGHTSPEED_WEBHOOK_URL;
let webhookPath = '/paymentWebhook';
if (webhookUrl) {
  try {
    webhookPath = new URL(webhookUrl).pathname;
  } catch (err) {
    console.warn('Invalid LIGHTSPEED_WEBHOOK_URL:', webhookUrl);
  }
}
console.log(`Registering Lightspeed webhook on path ${webhookPath}`);
app.post(webhookPath, paymentWebhookHandler);
app.use('/subscriptions', subscriptionsRouter);
app.use('/oauth', oauthRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 