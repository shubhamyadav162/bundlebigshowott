import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";
import * as crypto from "crypto";

// Initialize Firebase Admin with default credentials
admin.initializeApp();

const db = admin.firestore();
const corsHandler = cors({ origin: true });

export const paymentWebhook = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Validate method
      if (req.method !== "POST") {
        throw new Error("Only POST requests are accepted");
      }
      // Validate body
      const { payment_id, user_id, status, amount } = req.body;
      if (!payment_id || !user_id) {
        throw new Error("Missing payment_id or user_id");
      }
      // Verify signature
      const apiSecret = functions.config().lightspeed.api_secret;
      const expectedSignature = crypto
        .createHmac("sha256", apiSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");
      if (req.headers["x-signature"] !== expectedSignature) {
        throw new Error("Invalid signature");
      }
      // Update Firestore on success
      if (status === "success") {
        await db.collection("users").doc(user_id).update({
          isSubscribed: true,
          subscriptionEnd: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          ),
          lastPayment: amount,
          paymentId: payment_id
        });
      }
      res.status(200).json({ success: true });
    } catch (error: any) {
      functions.logger.error("Webhook error:", error);
      res.status(400).json({ error: error.message });
    }
  });
}); 