import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase project settings
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;

// Webhook bearer token for validation
const WEBHOOK_BEARER_TOKEN = "4865b7e026601b8f2a65d684019cee709c51f816010d04b04a224c7b7faa7598";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  console.log("Lightspeed webhook handler started");

  // Validate request method
  if (req.method !== "POST") {
    console.error("Method not allowed:", req.method);
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405,
      headers: { "Content-Type": "application/json" } 
    });
  }

  // Validate authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.replace("Bearer ", "") !== WEBHOOK_BEARER_TOKEN) {
    console.error("Invalid or missing authorization header");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" } 
    });
  }

  // Parse webhook payload
  let webhookData;
  try {
    webhookData = await req.json();
    console.log("Webhook payload received:", JSON.stringify(webhookData));
  } catch (e) {
    console.error("Invalid JSON body:", e);
    return new Response(JSON.stringify({ error: "Invalid JSON body", details: e.message }), { 
      status: 400,
      headers: { "Content-Type": "application/json" } 
    });
  }

  // Extract necessary data from the webhook
  const { billId, status, _id } = webhookData;
  
  if (!billId || !status) {
    console.error("Missing required parameters in webhook payload:", webhookData);
    return new Response(JSON.stringify({ error: "Missing required parameters" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" } 
    });
  }

  console.log(`Processing payment update for transaction ${billId} with status ${status}`);

  // Update the payment transaction in our database
  const { data: transaction, error: fetchError } = await supabaseAdmin
    .from("payment_transactions")
    .select("*")
    .eq("id", billId)
    .single();

  if (fetchError || !transaction) {
    console.error("Transaction not found or error fetching transaction:", fetchError?.message);
    return new Response(JSON.stringify({ error: "Transaction not found", details: fetchError?.message }), { 
      status: 404,
      headers: { "Content-Type": "application/json" } 
    });
  }

  // Map Lightspeed status to our status
  let transactionStatus;
  if (status === "success") {
    transactionStatus = "COMPLETED";
  } else if (status === "failed") {
    transactionStatus = "FAILED";
  } else {
    transactionStatus = "PENDING";
  }

  // Update transaction status
  const { error: updateError } = await supabaseAdmin
    .from("payment_transactions")
    .update({
      status: transactionStatus,
      updated_at: new Date().toISOString(),
      external_reference: _id || transaction.external_reference
    })
    .eq("id", billId);

  if (updateError) {
    console.error("Error updating transaction:", updateError.message);
    return new Response(JSON.stringify({ error: "Database error updating transaction", details: updateError.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" } 
    });
  }

  // If payment was successful, create or update subscription
  if (transactionStatus === "COMPLETED") {
    console.log("Payment successful, creating/updating subscription");
    
    try {
      // Get plan details
      const { data: plan, error: planError } = await supabaseAdmin
        .from("subscription_plans")
        .select("*")
        .eq("id", transaction.subscription_plan_id)
        .single();
      
      if (planError || !plan) {
        console.error("Error fetching plan details:", planError?.message);
        throw new Error("Plan not found");
      }

      // Calculate expiry date
      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(now.getDate() + plan.duration_days);

      // Create or update subscription
      const { data: existingSub, error: subFetchError } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("user_id", transaction.user_id)
        .single();

      if (!existingSub) {
        // Create new subscription
        const { error: createSubError } = await supabaseAdmin
          .from("subscriptions")
          .insert({
            user_id: transaction.user_id,
            subscription_plan_id: transaction.subscription_plan_id,
            starts_at: now.toISOString(),
            expires_at: expiryDate.toISOString(),
            status: "ACTIVE",
            latest_transaction_id: transaction.id
          });

        if (createSubError) {
          console.error("Error creating subscription:", createSubError.message);
          throw new Error("Failed to create subscription");
        }
      } else {
        // Update existing subscription
        const newExpiryDate = new Date(existingSub.expires_at);
        // If current subscription is still active, extend it
        if (new Date(existingSub.expires_at) > now) {
          newExpiryDate.setDate(newExpiryDate.getDate() + plan.duration_days);
        } else {
          // If expired, start fresh from now
          newExpiryDate.setDate(now.getDate() + plan.duration_days);
        }

        const { error: updateSubError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            subscription_plan_id: transaction.subscription_plan_id,
            expires_at: newExpiryDate.toISOString(),
            status: "ACTIVE",
            latest_transaction_id: transaction.id
          })
          .eq("user_id", transaction.user_id);

        if (updateSubError) {
          console.error("Error updating subscription:", updateSubError.message);
          throw new Error("Failed to update subscription");
        }
      }
    } catch (e) {
      console.error("Error processing subscription:", e);
      // We don't return an error response here because we want to acknowledge 
      // the webhook even if subscription processing fails
    }
  }

  console.log("Webhook processing completed successfully");
  return new Response(JSON.stringify({ success: true }), { 
    status: 200, 
    headers: { "Content-Type": "application/json" } 
  });
}); 