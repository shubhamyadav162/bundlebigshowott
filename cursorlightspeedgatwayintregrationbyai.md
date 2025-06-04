Below is a single, self-contained English prompt you can paste directly into Cursor AI. It includes all project details (Supabase MCP, environment variables, function names, table schemas, expected flow, and observed errors) and asks Cursor AI to generate working Edge Function code, configure MCP, and explain how to remove the “non-2xx status code” and “Invalid API key” issues. Feel free to adjust any variable names or table schema details to match your actual database.

---

**Cursor AI Prompt:**

```
## Project Overview (OneBigShow OTT)

- **App Name:** OneBigShow OTT  
- **Supabase Project Reference:** hjsdcsatfcysrwsryngu  
- **Supabase URL:** https://hjsdcsatfcysrwsryngu.supabase.co  
- **Supabase Region:** ap-south-1  

- **Anon/Public API Key:** 
```

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqc2Rjc2F0ZmN5c3J3c3J5bmd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDIwOTEsImV4cCI6MjA2MjY3ODA5MX0.X1m5n0q-bw4p7tetegdjq-uQoSVypPmrlko4\_SZXjgw

```

- **Service Role Secret Key:** 
```

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqc2Rjc2F0ZmN5c3J3c3J5bmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzEwMjA5MSwiZXhwIjoyMDYyNjc4MDkxfQ.BR-A3TEEErWOhUw8vHSy0jkToDsGGqNGCXiRwSpLrDk

```

- **PAT Token (for MCP):** 
```

sbp\_7d174f0462e9ae16b9e7647a9cadef8383628c68

```

- **Database Password:** 
```

Avanger\@16143777

````

- **MCP Configuration (supabase mcp server)**  
```jsonc
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase",
        "--access-token",
        "sbp_7d174f0462e9ae16b9e7647a9cadef8383628c68",
        "--project-ref",
        "hjsdcsatfcysrwsryngu"
      ],
      "env": {
        "SUPABASE_DB_PASSWORD": "Avanger@16143777",
        "SUPABASE_REGION": "ap-south-1",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqc2Rjc2F0ZmN5c3J3c3J5bmd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDIwOTEsImV4cCI6MjA2MjY3ODA5MX0.X1m5n0q-bw4p7tetegdjq-uQoSVypPmrlko4_SZXjgw",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqc2Rjc2F0ZmN5c3J3c3J5bmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzEwMjA5MSwiZXhwIjoyMDYyNjc4MDkxfQ.BR-A3TEEErWOhUw8vHSy0jkToDsGGqNGCXiRwSpLrDk"
      }
    }
  }
}
````

---

## LightSpeedPay Credentials

* **API Key:** b7f32871-b355-4aa7-96cb-a0fe3821b368
* **API Secret:** 1uFp3tNWlS4PzmvyYPEnaM2sHIqYEbir
* **Environment:** sandbox
* **Webhook URL:** (publicly accessible)
  Example: `https://your-railway-hostname.app/paymentWebhook`
* **Success Deep Link:** `bigshow://payment-success`
* **Failure Deep Link:** `bigshow://payment-failure`
* **Webhook Verification Token:** (any random secure string, e.g.)
  `4865b7e026601b8f2a65d684019cee709c51f816010d04b04a224c7b7faa7598`

---

## Database Schema (examples)

1. **plans** table

   ```sql
   CREATE TABLE plans (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     price NUMERIC NOT NULL,
     duration_days INTEGER NOT NULL
   );
   ```

   * `id`: plan identifier (e.g. “basic”, “pro”).
   * `price`: integer or decimal in INR (e.g., 299, 599).
   * `duration_days`: length of subscription in days.

2. **payment\_transactions** table

   ```sql
   CREATE TABLE payment_transactions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     plan_id UUID REFERENCES plans(id),
     status TEXT NOT NULL,           -- “INITIATED” / “COMPLETED” / “FAILED”
     amount NUMERIC NOT NULL,
     external_reference TEXT,        -- LightSpeedPay’s transaction ID
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   ```

   * Insert a row when user clicks “Subscribe Now.”
   * `external_reference` stores LightSpeedPay’s `_id` after initiation.

3. **subscriptions** table

   ```sql
   CREATE TABLE subscriptions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     plan_id UUID REFERENCES plans(id),
     status TEXT NOT NULL,           -- “ACTIVE” / “EXPIRED”
     starts_at TIMESTAMPTZ NOT NULL,
     expires_at TIMESTAMPTZ NOT NULL,
     latest_transaction_id UUID REFERENCES payment_transactions(id)
   );
   ```

   * Upsert a row once LightSpeedPay webhook returns status “COMPLETED.”

---

## Desired Flow & Observed Errors

1. **Client (Expo React)** calls:

   ```js
   const { data, error } = await supabase.functions.invoke('initialize-payment', {
     body: { plan_id: '<some-plan-uuid>' }
   });
   ```

   * Expected: `{ url: 'https://pay.lightspeedpay.in/payment.php?txn=<...>' }`
   * Actual: `FunctionsHttpError: Edge Function returned a non-2xx status code`

2. **Inspecting Supabase Edge Function Logs** for `initialize-payment` shows:

   ```
   Plan not found or error fetching plan: Invalid API key
   Could not fetch user metadata: Invalid API key
   Could not fetch profile data, trying user metadata: Invalid API key
   ```

   * Root cause: The Edge Function’s Supabase client was constructed with missing or incorrect `SUPABASE_URL` / `SERVICE_ROLE_KEY`.
   * Because `createClient(undefined, undefined)` throws an “Invalid API key” on any `.from().select()`, the function aborts and returns 500 (non-2xx).

3. **Client also attempted** a fallback function `check-payment-status` but that also fails because the Supabase client is not authenticated.

4. **Webhook Handling** (Edge Function `lightspeed-webhook-handler`):

   * Should validate the `X-Lightspeed-Signature` header using `LIGHTSPEED_WEBHOOK_TOKEN`.
   * Update `payment_transactions` and upsert into `subscriptions`.
   * But currently can’t reach the database due to same “Invalid API key” issue.

---

## What We Need Cursor AI to Do

1. **Use Supabase MCP** (no custom Docker):

   * Deploy/manage all Edge Functions (`initialize-payment` and `lightspeed-webhook-handler`) via Supabase CLI (MCB).
   * Ensure they're configured to read SPLASH environment variables (stored with `supabase secrets set`) rather than being hardcoded.

2. **Write or Fix the Edge Function Code** so that:

   * It reads and validates all required environment variables (`SUPABASE_URL`, `SERVICE_ROLE_KEY`, LightSpeedPay keys & URLs).
   * It constructs `createClient(SUPABASE_URL, SERVICE_ROLE_KEY)` correctly.
   * It queries the `plans` table, inserts into `payment_transactions`, calls LightSpeedPay’s “initiate-transaction” endpoint, returns a `{ url }` JSON.
   * It never returns a non-2xx status code unless absolutely necessary, and always logs helpful error messages if something is missing (e.g. `Missing SUPABASE_URL or SERVICE_ROLE_KEY`).

3. **Configure `config.toml`** so that both functions have `verify_jwt = false` (because we don’t want to require a Supabase JWT for these).

4. **Provide Complete Edge Function Sources** for both:

   * `supabase/functions/initialize-payment/index.ts`
   * `supabase/functions/lightspeed-webhook-handler/index.ts`

5. **Explain MCP Deployment Steps** (via CLI):

   * How to run `supabase secrets set …` for each environment variable.
   * How to run `supabase functions deploy initialize-payment --project-ref hjsdcsatfcysrwsryngu`.
   * How to verify in the Dashboard that both functions are ACTIVE.

6. **Validate Deep-Linking / WebView** (briefly)—just enough so that the client can detect `bigshow://payment-success` or `bigshow://payment-failure`.

7. **Resolve “non-2xx status code”** by making sure any missing secret or missing param returns a friendly JSON error (400 or 500) instead of throwing. Example:

   ```ts
   if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
     console.error("Missing Supabase secrets");
     return new Response(JSON.stringify({ error: "Supabase environment variables not set" }), { status: 500 });
   }
   ```

8. **Resolve “Invalid API key”** by verifying that `SUPABASE_URL` / `SERVICE_ROLE_KEY` truly come from `Deno.env.get(...)`. If the user accidentally used `SUPABASE_SERVICE_ROLE_KEY` instead of `SERVICE_ROLE_KEY`, Cursor must detect and fix that mapping.

9. **Write any SQL RLS Policies** if necessary (to allow the webhook handler to upsert `subscriptions` with a service role). But since we use the service role key, RLS is effectively bypassed. You can mention as a best practice but do not write them if they’re already open.

10. **Provide a Sample React Client Snippet** (in English) showing how to call `initialize-payment` and then `Linking.openURL(data.url)`, as well as how to detect deep-link callbacks.

---

### Step-by-Step for Cursor AI:

1. **Create or Update `supabase/functions/config.toml`** (root of your repo):

   ```toml
   [[functions]]
   name = "initialize-payment"
   verify_jwt = false

   [[functions]]
   name = "lightspeed-webhook-handler"
   verify_jwt = false
   ```

2. **Create `supabase/functions/initialize-payment/index.ts`** with the following content (TypeScript/Deno + Supabase JS v2):

   ```ts
   import { serve } from "https://deno.land/x/sift/mod.ts";
   import { createClient } from "https://esm.sh/@supabase/supabase-js";

   // 1. Load environment variables
   const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
   const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
   const LS_API_KEY = Deno.env.get("LIGHTSPEED_API_KEY");
   const LS_API_SECRET = Deno.env.get("LIGHTSPEED_API_SECRET");
   const LS_ENV = Deno.env.get("LIGHTSPEED_ENV");
   const LS_WEBHOOK_URL = Deno.env.get("LIGHTSPEED_WEBHOOK_URL");
   const LS_SUCCESS_URL = Deno.env.get("LIGHTSPEED_SUCCESS_URL");
   const LS_FAILURE_URL = Deno.env.get("LIGHTSPEED_FAILURE_URL");

   // 2. Validate critical env vars
   if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
     console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY:", {
       SUPABASE_URL,
       SERVICE_ROLE_KEY,
     });
     throw new Error("Supabase environment variables are not set");
   }
   if (!LS_API_KEY || !LS_API_SECRET || !LS_ENV || !LS_WEBHOOK_URL || !LS_SUCCESS_URL || !LS_FAILURE_URL) {
     console.error("Missing one or more LightSpeedPay environment variables");
     throw new Error("LightSpeedPay environment variables are not set");
   }

   // 3. Initialize Supabase client with service role
   const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

   serve(async (req) => {
     try {
       if (req.method !== "POST") {
         return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
       }
       // 4. Parse incoming JSON (plan_id should be provided)
       const { plan_id } = await req.json();
       if (!plan_id) {
         return new Response(JSON.stringify({ error: "Missing plan_id" }), { status: 400 });
       }

       // 5. Fetch plan details from 'plans' table
       const { data: plan, error: planError } = await supabase
         .from("plans")
         .select("id, name, price, duration_days")
         .eq("id", plan_id)
         .single();

       if (planError || !plan) {
         console.error("Plan not found or error fetching plan:", planError);
         return new Response(JSON.stringify({ error: "Plan not found" }), { status: 404 });
       }

       // 6. Create a new payment_transactions row
       //    user_id should be extracted from authenticated context if needed.
       //    But since verify_jwt=false, read user_id from the request body or require it:
       const { user_id } = await req.json();
       if (!user_id) {
         return new Response(JSON.stringify({ error: "Missing user_id" }), { status: 400 });
       }

       const { data: transaction, error: txError } = await supabase
         .from("payment_transactions")
         .insert({
           user_id,
           plan_id,
           amount: plan.price,
           status: "INITIATED",
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString(),
         })
         .select()
         .single();

       if (txError || !transaction) {
         console.error("Error inserting payment_transactions:", txError);
         return new Response(JSON.stringify({ error: "DB insertion failed" }), { status: 500 });
       }

       // 7. Call LightSpeedPay “initiate-transaction” API
       const payload = {
         billId: transaction.id,                     // UUID of newly created transaction
         amount: parseFloat(plan.price),              // Price as number
         currency: "INR",
         description: `Subscription for plan ${plan.name}`,
         customerName: user_id,
         vpaId: "-",                                  // You can customize if you have a default VPA
         apiKey: LS_API_KEY,
         apiSecret: LS_API_SECRET,
         type: LS_ENV,                                // "sandbox" or "live"
         webhook: LS_WEBHOOK_URL,
         success_url: LS_SUCCESS_URL,
         failure_url: LS_FAILURE_URL
       };

       const lsResponse = await fetch(
         "https://api.lightspeedpay.in/api/v1/transaction/initiate-transaction",
         {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(payload),
         }
       );

       const lsResult = await lsResponse.json();
       if (!lsResponse.ok) {
         console.error("LightSpeedPay initiation error:", lsResult);
         return new Response(JSON.stringify({ error: "Payment gateway request failed", detail: lsResult }), { status: 502 });
       }

       // 8. Optionally store external_reference (Lightspeed’s _id) in payment_transactions
       const externalRef = lsResult.data?._id || null;
       if (externalRef) {
         const { error: updateError } = await supabase
           .from("payment_transactions")
           .update({ external_reference: externalRef })
           .eq("id", transaction.id);
         if (updateError) {
           console.error("Failed to update external_reference:", updateError);
           // Not a showstopper for returning payment URL; just log
         }
       }

       // 9. Return the paymentLink to the client
       return new Response(JSON.stringify({ url: lsResult.paymentLink }), { status: 200 });
     } catch (err) {
       console.error("Unexpected error in initialize-payment:", err);
       return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
     }
   });
   ```

3. **Create `supabase/functions/lightspeed-webhook-handler/index.ts`** with this content:

   ```ts
   import { serve } from "https://deno.land/x/sift/mod.ts";
   import { createClient } from "https://esm.sh/@supabase/supabase-js";

   // Load env vars
   const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
   const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
   const LS_WEBHOOK_TOKEN = Deno.env.get("LIGHTSPEED_WEBHOOK_TOKEN");

   if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
     console.error("Missing Supabase environment variables");
     throw new Error("Supabase environment variables not set");
   }
   if (!LS_WEBHOOK_TOKEN) {
     console.error("Missing LIGHTSPEED_WEBHOOK_TOKEN");
     throw new Error("LightSpeedPay webhook token not set");
   }

   // Initialize Supabase client
   const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

   // A simple HMAC verification helper (if LightSpeedPay uses HMAC)
   function verifySignature(payload: string, signatureHeader: string, token: string): boolean {
     try {
       // If LightSpeedPay sends a plain token match rather than HMAC, do:
       return signatureHeader === token;
       // If LightSpeedPay uses HMAC SHA256, implement HMAC verification here.
     } catch {
       return false;
     }
   }

   serve(async (req) => {
     if (req.method !== "POST") {
       return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
     }

     try {
       // 1. Parse payload
       const payload = await req.clone().json();
       //    Example payload fields: { transactionId, billId, status, amount, paymentTime, ... }
       const signature = req.headers.get("X-Lightspeed-Signature") || "";

       // 2. Verify webhook token/signature
       if (!verifySignature(JSON.stringify(payload), signature, LS_WEBHOOK_TOKEN)) {
         console.error("Invalid webhook signature");
         return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
       }

       // 3. Extract relevant data
       const { transactionId, billId, status } = payload;
       const normalizedStatus = status?.toUpperCase() || "";

       // 4. Update payment_transactions row
       const updateData: any = { updated_at: new Date().toISOString() };
       if (["COMPLETED", "FAILED"].includes(normalizedStatus)) {
         updateData.status = normalizedStatus;
         updateData.external_reference = transactionId;
       }

       const { error: updateError } = await supabase
         .from("payment_transactions")
         .update(updateData)
         .eq("id", billId);

       if (updateError) {
         console.error("Error updating payment_transactions:", updateError);
         return new Response(JSON.stringify({ error: "DB update failed" }), { status: 500 });
       }

       // 5. If status = "COMPLETED", upsert into subscriptions
       if (normalizedStatus === "COMPLETED") {
         // a) Fetch plan_id and user_id from payment_transactions record
         const { data: txn, error: txnError } = await supabase
           .from("payment_transactions")
           .select("plan_id, user_id")
           .eq("id", billId)
           .single();

         if (txnError || !txn) {
           console.error("Failed to fetch transaction for subscription:", txnError);
           return new Response(JSON.stringify({ error: "Transaction not found" }), { status: 404 });
         }

         // b) Fetch plan duration to calculate expires_at
         const { data: plan, error: planError } = await supabase
           .from("plans")
           .select("duration_days")
           .eq("id", txn.plan_id)
           .single();

         if (planError || !plan) {
           console.error("Failed to fetch plan duration:", planError);
           return new Response(JSON.stringify({ error: "Plan not found" }), { status: 404 });
         }

         const startsAt = new Date().toISOString();
         const expiresAt = new Date(
           Date.now() + plan.duration_days * 24 * 60 * 60 * 1000
         ).toISOString();

         // c) Upsert into subscriptions
         const { error: subError } = await supabase
           .from("subscriptions")
           .upsert({
             user_id: txn.user_id,
             plan_id: txn.plan_id,
             status: "ACTIVE",
             starts_at: startsAt,
             expires_at: expiresAt,
             latest_transaction_id: billId,
           });

         if (subError) {
           console.error("Error upserting subscription:", subError);
           return new Response(JSON.stringify({ error: "Subscription upsert failed" }), { status: 500 });
         }
       }

       // 6. Return success
       return new Response(JSON.stringify({ success: true }), { status: 200 });
     } catch (err) {
       console.error("Unexpected error in lightspeed-webhook-handler:", err);
       return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
     }
   });
   ```

4. **Ensure Database Tables Exist**

   * In your Supabase SQL editor (or via migration), confirm you have tables matching the schemas above (`plans`, `payment_transactions`, `subscriptions`).
   * If not, run SQL migrations or manually create them. Example:

     ```sql
     create table plans (
       id uuid primary key default gen_random_uuid(),
       name text not null,
       price numeric not null,
       duration_days int not null
     );

     create table payment_transactions (
       id uuid primary key default gen_random_uuid(),
       user_id uuid references auth.users(id),
       plan_id uuid references plans(id),
       status text not null,
       amount numeric not null,
       external_reference text,
       created_at timestamptz default now(),
       updated_at timestamptz default now()
     );

     create table subscriptions (
       id uuid primary key default gen_random_uuid(),
       user_id uuid references auth.users(id),
       plan_id uuid references plans(id),
       status text not null,
       starts_at timestamptz not null,
       expires_at timestamptz not null,
       latest_transaction_id uuid references payment_transactions(id)
     );
     ```

5. **Deploy (MCB) via Supabase CLI**

   * From your project root, run:

     ```bash
     # Deploy initialize-payment
     supabase functions deploy initialize-payment \
       --project-ref hjsdcsatfcysrwsryngu

     # Deploy webhook handler
     supabase functions deploy lightspeed-webhook-handler \
       --project-ref hjsdcsatfcysrwsryngu
     ```
   * Wait until CLI shows **“Function initialized: initialize-payment”** and **“Function initialized: lightspeed-webhook-handler”** with **“Status: ACTIVE”**.
   * You can confirm in the Supabase Dashboard → Edge Functions that both are active and have correct “Invoke URL.”

6. **Set or Confirm Edge Function Secrets** (if you did not already use CLI commands above)

   * In Dashboard → Settings → API → Project → “Edge Function Secrets,” verify each of these exists exactly as spelled:

     * `SUPABASE_URL = https://hjsdcsatfcysrwsryngu.supabase.co`
     * `SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI...BR-A3TEEErWOhUw8vHSy0jkToDsGGqNGCXiRwSpLrDk`
     * `LIGHTSPEED_API_KEY = b7f32871-b355-4aa7-96cb-a0fe3821b368`
     * `LIGHTSPEED_API_SECRET = 1uFp3tNWlS4PzmvyYPEnaM2sHIqYEbir`
     * `LIGHTSPEED_ENV = sandbox`
     * `LIGHTSPEED_WEBHOOK_URL = https://<YOUR_RAILWAY_APP>.railway.app/paymentWebhook`
     * `LIGHTSPEED_SUCCESS_URL = bigshow://payment-success`
     * `LIGHTSPEED_FAILURE_URL = bigshow://payment-failure`
     * `LIGHTSPEED_WEBHOOK_TOKEN = 4865b7e026601b8f2a65d684019cee709c51f816010d04b04a224c7b7faa7598`

7. **React/Expo Client Code Example**

   * In your React component where user clicks “Subscribe Now,” implement:

     ```js
     import React from 'react';
     import { Alert, Button, Linking } from 'react-native';
     import { supabase } from '../lib/supabaseClient'; // supabase-js client configured with anon key

     export default function SubscriptionScreen({ planId }) {
       async function handleSubscribe() {
         try {
           // Pass both plan_id and the current user_id (obtain from auth.user)
           const user = supabase.auth.user();
           if (!user) {
             Alert.alert('Error', 'User not signed in');
             return;
           }

           const { data, error } = await supabase.functions.invoke('initialize-payment', {
             body: { plan_id: planId, user_id: user.id },
           });
           if (error || !data?.url) {
             console.error('Error invoking initialize-payment:', error);
             Alert.alert('Payment Error', (error?.message) || 'No payment URL returned');
             return;
           }

           // Open LightSpeedPay URL in external browser or WebView
           const paymentUrl = data.url;
           Linking.openURL(paymentUrl);
         } catch (err) {
           console.error('Unexpected error:', err);
           Alert.alert('Unexpected Error', err.message);
         }
       }

       return <Button title="Subscribe Now" onPress={handleSubscribe} />;
     }
     ```
   * **Deep-Link Setup (app.json)**:

     ```json
     {
       "expo": {
         "scheme": "bigshow",
         "android": {
           "intentFilters": [
             {
               "action": "VIEW",
               "data": [
                 { "scheme": "bigshow", "host": "payment-success" },
                 { "scheme": "bigshow", "host": "payment-failure" }
               ],
               "category": ["BROWSABLE", "DEFAULT"]
             }
           ]
         }
       }
     }
     ```
   * In a `PaymentWebView.js` (if using WebView), listen for navigation changes:

     ```js
     import React from 'react';
     import { WebView } from 'react-native-webview';

     export default function PaymentWebView({ initialUrl, onSuccess, onFailure }) {
       return (
         <WebView
           source={{ uri: initialUrl }}
           onNavigationStateChange={(navState) => {
             const url = navState.url;
             if (url.startsWith('bigshow://payment-success')) {
               onSuccess();
             } else if (url.startsWith('bigshow://payment-failure')) {
               onFailure();
             }
           }}
           javaScriptEnabled={true}
           domStorageEnabled={true}
         />
       );
     }
     ```

8. **Testing & Verification**

   1. **Deploy & Verify Functions**: Confirm both Edge Functions show as ACTIVE.
   2. **Call `initialize-payment`** from your app with a valid `plan_id` and `user_id`.

      * Check Supabase Edge Functions logs → `initialize-payment` → ensure logs show:

        ```
        Plan found: { id: "...", name: "...", price: ... }
        Inserted payment_transactions: { id: "...", ... }
        LightSpeedPay response: { paymentLink: "..." }
        ```
      * No “Invalid API key” errors.
   3. **Browser/WebView**: The LightSpeedPay page should load. Complete a sandbox transaction.
   4. **Webhook**: LightSpeedPay posts to `https://<your-railway-host>.railway.app/paymentWebhook`.

      * Check Edge Functions logs → `lightspeed-webhook-handler` → ensure logs show:

        ```
        Payload: { transactionId: "...", billId: "...", status: "COMPLETED", ... }
        payment_transactions updated
        Subscriptions upserted
        ```
      * Return 200.
   5. **App Deep Link**: After WebView redirects to `bigshow://payment-success`, your React code triggers `onSuccess()`, at which point you can re-query `subscriptions`:

      ```js
      const { data: subs, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE');
      if (subs.length > 0) {
        // User is now subscribed—show premium content
      }
      ```

---

### Final Notes

* **No Manual Docker Needed**: All functions live in `supabase/functions/…`. Supabase MCP (MCB) manages the runtime.
* **Environment Management**: We used `supabase secrets set …` commands to push every required environment variable so you don’t have to click around.
* **verify\_jwt = false**: ensures the functions don’t expect a logged-in user token.
* **Logging**: Each function logs errors via `console.error(...)`, so you can inspect the Supabase Dashboard logs to diagnose any further issues.
* **CORS / Response Codes**: We explicitly return JSON + appropriate status codes so `supabase.functions.invoke` never sees an unhandled exception (non-2xx) unless something truly went wrong.

With this detailed prompt, Cursor AI should:

1. Create or verify the `config.toml`.
2. Write both Edge Function files (TypeScript code above).
3. Explain any missing pieces (SQL tables, deep-link steps).
4. Provide final MCP CLI commands to deploy.
5. Confirm that after these changes, the “non-2xx status code” and “Invalid API key” errors are resolved, and the subscription/payment flow works end-to-end.

Paste this entire block into Cursor AI so it can automatically generate and configure everything needed via Supabase Managed Compute.
