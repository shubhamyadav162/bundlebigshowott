import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase project settings
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://hjsdcsatfcysrwsryngu.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqc2Rjc2F0ZmN5c3J3c3J5bmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzEwMjA5MSwiZXhwIjoyMDYyNjc4MDkxfQ.BR-A3TEEErWOhUw8vHSy0jkToDsGGqNGCXiRwSpLrDk";

// Debugging output
console.log("Initializing with URL:", SUPABASE_URL);
console.log("Service role key (first 10 chars):", SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + "...");

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  console.log("Check Payment Status function started");
  
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

    const { transactionId } = body;
    if (!transactionId) {
      console.error("Missing required parameter: transactionId");
      return new Response(JSON.stringify({ 
        success: false,
        error: "Missing parameter: transactionId is required." 
      }), { 
        status: 200, // Always return 200 to avoid non-2xx errors
        headers
      });
    }

    try {
      // Get transaction status from database
      const { data, error } = await supabaseAdmin
        .from("payment_transactions")
        .select("status, external_reference, payment_link")
        .eq("id", transactionId)
        .single();

      if (error) {
        console.error("Database error:", error);
        return new Response(JSON.stringify({ 
          success: false,
          error: "Error fetching transaction: " + error.message
        }), { 
          status: 200, // Always return 200 to avoid non-2xx errors
          headers
        });
      }

      if (!data) {
        return new Response(JSON.stringify({ 
          success: false,
          error: "Transaction not found" 
        }), { 
          status: 200, // Always return 200 to avoid non-2xx errors
          headers
        });
      }

      return new Response(JSON.stringify({
        success: true,
        status: data.status,
        externalReference: data.external_reference,
        paymentLink: data.payment_link
      }), { 
        status: 200, 
        headers
      });
    } catch (error) {
      console.error("Error checking payment status:", error);
      return new Response(JSON.stringify({ 
        success: false,
        error: "Error checking payment status", 
        details: error.message
      }), { 
        status: 200, // Always return 200 to avoid non-2xx errors
        headers
      });
    }
  } catch (error) {
    console.error("Error parsing request:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: "Invalid request format", 
      details: error.message
    }), { 
      status: 200, // Always return 200 to avoid non-2xx errors
      headers
    });
  }
}); 