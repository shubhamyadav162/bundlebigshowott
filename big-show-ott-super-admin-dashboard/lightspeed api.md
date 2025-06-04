Here's the **detailed step-by-step implementation plan** that I'll execute to create and deploy your Lightspeed payment webhook server using Firebase Cloud Functions:

---

### **Step 1: Initialize Firebase Project**
1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and initialize**:
   ```bash
   firebase login
   firebase init functions
   ```
   - Select options:
     ```
     ? Language: TypeScript
     ? ESLint: Yes
     ? Install dependencies: Yes
     ```

---

### **Step 2: Configure Environment**
1. **Set Firebase config** (replaces `.env`):
   ```bash
   firebase functions:config:set \
     lightspeed.api_key="YOUR_LIGHTSPEED_API_KEY" \
     lightspeed.api_secret="YOUR_LIGHTSPEED_SECRET" \
     firebase.db_url="https://YOUR_PROJECT.firebaseio.com"
   ```

2. **Download service account key**:
   - Go to: [Firebase Console > Project Settings > Service Accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk)
   - Click **"Generate new private key"** → Save as `functions/firebase-admin-key.json`

---

### **Step 3: Write Webhook Function**
1. **Edit `functions/src/index.ts`**:
   ```typescript
   import * as functions from "firebase-functions";
   import * as admin from "firebase-admin";
   import * as cors from "cors";

   // Initialize Firebase
   const serviceAccount = require("../firebase-admin-key.json");
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
     databaseURL: functions.config().firebase.db_url
   });

   const db = admin.firestore();
   const corsHandler = cors({ origin: true });

   export const paymentWebhook = functions.https.onRequest((req, res) => {
     corsHandler(req, res, async () => {
       try {
         // 1. Validate request
         if (req.method !== "POST") throw new Error("Only POST allowed");
         if (!req.body.payment_id || !req.body.user_id) {
           throw new Error("Missing payment_id or user_id");
         }

         // 2. Verify payment (add your Lightspeed signature logic)
         const apiKey = functions.config().lightspeed.api_key;
         // ...signature verification code...

         // 3. Update Firestore
         if (req.body.status === "success") {
           await db.collection("users").doc(req.body.user_id).update({
             isSubscribed: true,
             subscriptionEnd: admin.firestore.Timestamp.fromDate(
               new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 1 month
             ),
             lastPayment: req.body.amount,
             paymentId: req.body.payment_id
           });
         }

         res.status(200).json({ success: true });
       } catch (error) {
         functions.logger.error("Webhook error:", error);
         res.status(400).json({ error: error.message });
       }
     });
   });
   ```

2. **Add dependencies**:
   ```bash
   cd functions
   npm install cors @types/cors
   cd ..
   ```

---

### **Step 4: Deploy to Firebase**
1. **Run deployment**:
   ```bash
   firebase deploy --only functions
   ```

2. **Expected output**:
   ```
   ✔  functions[paymentWebhook]: https://us-central1-YOUR_PROJECT.cloudfunctions.net/paymentWebhook
   ```

---

### **Step 5: Configure Lightspeed**
1. **Set webhook URL in Lightspeed Dashboard**:
   ```
   URL: https://us-central1-YOUR_PROJECT.cloudfunctions.net/paymentWebhook
   Events: payment.success
   Content-Type: application/json
   ```

2. **Add secret verification** (optional):
   ```typescript
   // Add to your function
   const expectedSignature = crypto
     .createHmac("sha256", functions.config().lightspeed.api_secret)
     .update(JSON.stringify(req.body))
     .digest("hex");

   if (req.headers["x-signature"] !== expectedSignature) {
     throw new Error("Invalid signature");
   }
   ```

---

### **Step 6: Test the Integration**
1. **Local testing**:
   ```bash
   firebase emulators:start --only functions
   ```
   Test with:
   ```bash
   curl -X POST http://localhost:5001/YOUR_PROJECT/us-central1/paymentWebhook \
     -H "Content-Type: application/json" \
     -d '{"payment_id":"test123", "user_id":"user1", "status":"success", "amount":100}'
   ```

2. **Verify Firestore update**:
   Check your Firebase Console > Firestore for the user document update.

---

### **Step 7: Monitor (Post-Deployment)**
1. **View logs**:
   ```bash
   firebase functions:log --only paymentWebhook
   ```

2. **Set up alerts** (optional):
   - Go to [Google Cloud Console > Monitoring](https://console.cloud.google.com/monitoring)
   - Create alert for function errors

---

### **Final Structure**
```
OneBigShowOTT/
└── functions/
    ├── src/
    │   └── index.ts          # Main function code
    ├── firebase-admin-key.json # Service account
    ├── .gitignore            # Ignore service account
    └── package.json          # Dependencies
```

---

### **Next Action**  
Should I:  
1. **Execute these steps now** (starting with `firebase init`), or  
2. **Customize any part further** before implementation?  

*(I'll wait for your confirmation before running any commands.)*
