import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


// Supabase प्रोजेक्ट सेटिंग्स पर्यावरण चर से
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://hjsdcsatfcysrwsryngu.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqc2Rjc2F0ZmN5c3J3c3J5bmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzEwMjA5MSwiZXhwIjoyMDYyNjc4MDkxfQ.BR-A3TEEErWOhUw8vHSy0jkToDsGGqNGCXiRwSpLrDk";

// Debugging output
console.log("Initializing with URL:", SUPABASE_URL);
console.log("Service role key (first 10 chars):", SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + "...");

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  console.log("Initialize Payment function started");
  
  // CORS headers for all responses
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers 
    });
  }

  if (req.method !== "POST") {
    console.error("Method not allowed:", req.method);
    return new Response(JSON.stringify({ 
      success: false,
      error: "Method not allowed" 
    }), { 
      status: 200, // Always return 200 to avoid non-2xx errors
      headers
    });
  }

  try {
    const body = await req.json();
    console.log("Request body received:", JSON.stringify(body));
    
    const { plan_id, user_id } = body;
    
    if (!plan_id || !user_id) {
      console.error("Missing required parameters:", { plan_id, user_id });
      return new Response(JSON.stringify({ 
        success: false,
        error: "Missing parameters: plan_id and user_id are required." 
      }), { 
        status: 200, // Always return 200 to avoid non-2xx errors
        headers
      });
    }

    console.log("Fetching plan data");
    // Get subscription plan details
    let plan;
    try {
      // First try with subscription_plans table
      const { data, error } = await supabaseAdmin
        .from("subscription_plans")
        .select("id, price, duration_days, name")
        .eq("id", plan_id)
        .single();
      
      if (error) {
        console.warn("Error fetching from subscription_plans:", error.message);
        throw error;
      }
      
      if (!data) {
        console.warn("Plan not found in subscription_plans, trying default plans");
        throw new Error("Plan not found");
      }
      
      plan = data;
    } catch (error) {
      console.log("Using default plan data for:", plan_id);
      // Fallback to default plans if database fetch fails
      const defaultPlans = {
        'annual': { id: 'annual', price: 1999, duration_days: 365, name: 'Annual Plan' },
        'semi-annual': { id: 'semi-annual', price: 1199, duration_days: 180, name: 'Semi-Annual Plan' },
        'quarterly': { id: 'quarterly', price: 699, duration_days: 90, name: 'Quarterly Plan' },
        'monthly': { id: 'monthly', price: 299, duration_days: 30, name: 'Monthly Plan' },
        'trial': { id: 'trial', price: 0, duration_days: 7, name: 'Trial Plan' }
      };
      
      if (defaultPlans[plan_id]) {
        plan = defaultPlans[plan_id];
      } else {
        return new Response(JSON.stringify({ 
          success: false,
          error: "Plan not found" 
        }), { 
          status: 200, // Always return 200 to avoid non-2xx errors
          headers
        });
      }
    }

    console.log("Creating transaction record");
    // Create payment transaction
    const transactionId = v4.generate();
    try {
      const { error } = await supabaseAdmin
        .from("payment_transactions")
        .insert({
          id: transactionId,
          user_id: user_id,
          subscription_plan_id: plan.id,
          amount: plan.price,
          status: "INITIATED",
          bill_id: `OBS-${Date.now()}-${user_id.substring(0, 8)}`,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (e) {
      console.error("Error inserting transaction into DB:", e.message);
      return new Response(JSON.stringify({ 
        success: false,
        error: "Database error creating transaction: " + e.message 
      }), { 
        status: 200, // Always return 200 to avoid non-2xx errors
        headers
      });
    }

    // Get LightSpeed credentials
    let lightspeedCreds;
    try {
      const { data, error } = await supabaseAdmin
        .from("payment_gateway_credentials")
        .select("*")
        .eq("provider", "lightspeed")
        .single();
      
      if (error) throw error;
      if (!data) throw new Error("Lightspeed credentials not found");
      
      lightspeedCreds = data;
    } catch (e) {
      console.warn("Error fetching Lightspeed credentials, using defaults:", e.message);
      // Default LightSpeed credentials
      lightspeedCreds = {
        api_key: "b7f32871-b355-4aa7-96cb-a0fe3821b368",
        api_secret: "1uFp3tNWlS4PzmvyYPEnaM2sHIqYEbir",
        environment: "sandbox"
      };
    }

    // Get user name if available
    let customerName = "Valued Customer";
    try {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("full_name")
        .eq("user_id", user_id)
        .single();
      
      if (!profileError && profileData?.full_name) {
        customerName = profileData.full_name;
      }
    } catch (e) {
      console.warn("Error fetching user profile:", e.message);
    }

    // Prepare URLs
    const successUrl = `bigshow://payment-success?transaction_id=${transactionId}`;
    const failureUrl = `bigshow://payment-failure?transaction_id=${transactionId}`;

    // Prepare Lightspeed payload
    const lightspeedPayload = {
      customerName: customerName,
      status: "success", // Required by Lightspeed
      method: "Qr", // Required by Lightspeed
      description: `Payment for plan ${plan.name || plan_id}`,
      amount: plan.price,
      billId: transactionId,
      vpaId: "user@upi", // Placeholder
      apiKey: lightspeedCreds.api_key,
      apiSecret: lightspeedCreds.api_secret,
      type: lightspeedCreds.environment,
      successUrl: successUrl,
      failureUrl: failureUrl
    };

    console.log(`Calling Lightspeed API in ${lightspeedCreds.environment} mode`);
    
    // Call Lightspeed API
    let lightspeedResponse;
    try {
      lightspeedResponse = await fetch("https://api.lightspeedpay.in/api/v1/transaction/initiate-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(lightspeedPayload)
      });
    } catch (fetchError) {
      console.error("Network error fetching from Lightspeed API:", fetchError);
      // Update transaction status to failed
      try {
        await supabaseAdmin
          .from("payment_transactions")
          .update({
            status: "FAILED",
            updated_at: new Date().toISOString()
          })
          .eq("id", transactionId);
      } catch (updateError) {
        console.error("Error updating transaction status after API failure:", updateError);
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        error: "Payment gateway request failed", 
        details: fetchError.message
      }), { 
        status: 200, // Always return 200 to avoid non-2xx errors
        headers
      });
    }
    
    // Parse Lightspeed response
    let paymentData;
    try {
      const responseText = await lightspeedResponse.text();
      console.log("Lightspeed API response text:", responseText);
      paymentData = JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing Lightspeed response:", e);
      
      // Update transaction status to failed
      try {
        await supabaseAdmin
          .from("payment_transactions")
          .update({
            status: "FAILED",
            updated_at: new Date().toISOString()
          })
          .eq("id", transactionId);
      } catch (updateError) {
        console.error("Error updating transaction status after parsing failure:", updateError);
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        error: "Invalid response from payment gateway", 
        details: e.message
      }), { 
        status: 200, // Always return 200 to avoid non-2xx errors
        headers
      });
    }

    // Check if Lightspeed response is successful
    if (!lightspeedResponse.ok || paymentData.status !== "success") {
      console.error("Lightspeed API error:", paymentData);
      
      // Update transaction status to failed
      try {
        await supabaseAdmin
          .from("payment_transactions")
          .update({
            status: "FAILED",
            updated_at: new Date().toISOString()
          })
          .eq("id", transactionId);
      } catch (updateError) {
        console.error("Error updating transaction status after API error:", updateError);
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        error: paymentData.message || "Payment gateway error", 
        details: paymentData,
        transactionId
      }), { 
        status: 200, // Always return 200 to avoid non-2xx errors
        headers
      });
    }

    console.log("Lightspeed payment initialization successful");

    // Check if Lightspeed response has the necessary data
    if (!paymentData.data || !paymentData.data._id || !paymentData.paymentLink) {
      console.error("Lightspeed response missing crucial data:", paymentData);
      
      // Update transaction status to failed
      try {
        await supabaseAdmin
          .from("payment_transactions")
          .update({
            status: "FAILED",
            updated_at: new Date().toISOString()
          })
          .eq("id", transactionId);
      } catch (updateError) {
        console.error("Error updating transaction status after missing data:", updateError);
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        error: "Payment gateway returned incomplete data", 
        details: paymentData,
        transactionId
      }), { 
        status: 200, // Always return 200 to avoid non-2xx errors
        headers
      });
    }
    
    // Update transaction with payment link and Lightspeed transaction ID
    try {
      await supabaseAdmin
        .from("payment_transactions")
        .update({
          external_reference: paymentData.data._id,
          payment_link: paymentData.paymentLink,
          status: "PENDING_PAYMENT_GATEWAY"
        })
        .eq("id", transactionId);
    } catch (e) {
      console.error("Error updating transaction in DB:", e.message);
      // Non-fatal, continue with response
    }

    console.log("Payment initialization completed successfully");
    return new Response(JSON.stringify({
      success: true,
      transactionId, 
      paymentLink: paymentData.paymentLink,
      lightspeedTransactionId: paymentData.data._id
    }), { 
      status: 200, 
      headers
    });
  } catch (error) {
    console.error("Unexpected error in initialize-payment:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: "Internal server error", 
      details: error.message 
    }), { 
      status: 200, // Always return 200 to avoid non-2xx errors
      headers
    });
  }
}); 
