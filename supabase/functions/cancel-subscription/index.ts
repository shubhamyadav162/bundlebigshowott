import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Load Supabase environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://hjsdcsatfcysrwsryngu.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqc2Rjc2F0ZmN5c3J3c3J5bmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzEwMjA5MSwiZXhwIjoyMDYyNjc4MDkxfQ.BR-A3TEEErWOhUw8vHSy0jkToDsGGqNGCXiRwSpLrDk";

// Initialize Supabase admin client with service role
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  console.log("Cancel Subscription function started");
  
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
      message: "Method not allowed" 
    }), { 
      status: 200, // Always return 200 to avoid non-2xx errors
      headers
    });
  }

  try {
    // Get user from JWT for authorization
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(JSON.stringify({
        success: false,
        message: "Authentication required"
      }), {
        status: 200,
        headers
      });
    }
    
    let authenticatedUserId;
    try {
      // Extract the token
      const token = authorization.replace('Bearer ', '');
      
      // Use Supabase's getUser to validate the token and get user info
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (error || !user) {
        console.error("JWT validation error:", error);
        return new Response(JSON.stringify({
          success: false,
          message: "Invalid authentication token"
        }), {
          status: 200,
          headers
        });
      }
      
      authenticatedUserId = user.id;
    } catch (tokenError) {
      console.error("Error processing auth token:", tokenError);
      return new Response(JSON.stringify({
        success: false,
        message: "Invalid token format"
      }), {
        status: 200,
        headers
      });
    }

    const body = await req.json();
    console.log("Request body received:", JSON.stringify(body));
    
    const { user_id, subscription_id } = body;
    
    // Ensure the authenticated user matches the requested user_id or is an admin
    if (user_id !== authenticatedUserId) {
      // Check if the authenticated user is an admin
      const { data: userData, error: userError } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("user_id", authenticatedUserId)
        .single();
      
      if (userError || !userData || userData.role !== "admin") {
        return new Response(JSON.stringify({ 
          success: false,
          message: "Unauthorized. You can only cancel your own subscription." 
        }), { 
          status: 200, 
          headers
        });
      }
    }
    
    if (!user_id) {
      console.error("Missing required parameter: user_id");
      return new Response(JSON.stringify({ 
        success: false,
        message: "Missing parameter: user_id is required." 
      }), { 
        status: 200, 
        headers
      });
    }

    const now = new Date().toISOString();
    
    // 1. If subscription_id is provided, update that specific subscription
    if (subscription_id) {
      // Verify the subscription belongs to the user
      const { data: subData, error: subError } = await supabaseAdmin
        .from("subscriptions")
        .select("id, status")
        .eq("id", subscription_id)
        .eq("user_id", user_id)
        .single();
      
      if (subError || !subData) {
        console.error("Subscription not found or doesn't belong to user:", subError);
        return new Response(JSON.stringify({ 
          success: false,
          message: "Subscription not found or doesn't belong to user" 
        }), { 
          status: 200, 
          headers
        });
      }
      
      // Update the subscription status to cancelled and set expires_at to now
      const { error: updateError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: now,
          updated_at: now
        })
        .eq("id", subscription_id);
      
      if (updateError) {
        console.error("Error updating subscription:", updateError);
        return new Response(JSON.stringify({ 
          success: false,
          message: "Error cancelling subscription" 
        }), { 
          status: 200, 
          headers
        });
      }
      
      // Record to subscription history
      try {
        await supabaseAdmin
          .from("subscription_history")
          .insert({
            subscription_id: subscription_id,
            event_type: "cancellation",
            previous_status: subData.status,
            new_status: "canceled",
            event_time: now
          });
      } catch (historyError) {
        console.error("Error recording subscription history:", historyError);
        // Non-fatal, continue
      }
    } else {
      // 2. If no subscription_id, find and cancel all active subscriptions for the user
      const { data: subscriptions, error: subsError } = await supabaseAdmin
        .from("subscriptions")
        .select("id, status")
        .eq("user_id", user_id)
        .eq("status", "active");
      
      if (subsError) {
        console.error("Error fetching user subscriptions:", subsError);
        return new Response(JSON.stringify({ 
          success: false,
          message: "Error fetching user subscriptions" 
        }), { 
          status: 200, 
          headers
        });
      }
      
      if (subscriptions && subscriptions.length > 0) {
        for (const sub of subscriptions) {
          // Update subscription to cancelled
          const { error: updateError } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "canceled",
              canceled_at: now,
              updated_at: now
            })
            .eq("id", sub.id);
          
          if (updateError) {
            console.error(`Error cancelling subscription ${sub.id}:`, updateError);
            // Continue with next subscription
          } else {
            // Record to subscription history
            try {
              await supabaseAdmin
                .from("subscription_history")
                .insert({
                  subscription_id: sub.id,
                  event_type: "cancellation",
                  previous_status: sub.status,
                  new_status: "canceled",
                  event_time: now
                });
            } catch (historyError) {
              console.error("Error recording subscription history:", historyError);
              // Non-fatal, continue
            }
          }
        }
      } else {
        console.log("No active subscriptions found for user:", user_id);
      }
    }
    
    // Update user profile to reflect cancelled subscription
    try {
      await supabaseAdmin
        .from("profiles")
        .update({
          is_subscribed: false,
          updated_at: now
        })
        .eq("user_id", user_id);
    } catch (profileError) {
      console.error("Error updating user profile:", profileError);
      // Non-fatal, continue
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Subscription cancelled successfully"
    }), { 
      status: 200, 
      headers
    });
    
  } catch (error) {
    console.error("Unexpected error in cancel-subscription:", error);
    return new Response(JSON.stringify({ 
      success: false,
      message: "Internal server error", 
      details: error.message 
    }), { 
      status: 200, // Always return 200 to avoid non-2xx errors
      headers
    });
  }
}); 