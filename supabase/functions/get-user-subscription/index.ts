import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Load Supabase environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://hjsdcsatfcysrwsryngu.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqc2Rjc2F0ZmN5c3J3c3J5bmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzEwMjA5MSwiZXhwIjoyMDYyNjc4MDkxfQ.BR-A3TEEErWOhUw8vHSy0jkToDsGGqNGCXiRwSpLrDk";

// Initialize Supabase admin client with service role
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  console.log("Get User Subscription function started");
  
  // CORS headers for all responses
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers 
    });
  }

  try {
    // Get user from JWT
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(JSON.stringify({
        success: false,
        message: "No authorization header",
        status: "inactive"
      }), {
        status: 200, // Always return 200 to avoid non-2xx errors
        headers
      });
    }
    
    // Handle both request methods
    let userId;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        userId = body.user_id;
      } catch (error) {
        console.error("Error parsing request body:", error);
      }
    }
    
    // If no userId from POST body, try to extract from JWT
    if (!userId && authorization) {
      try {
        // Extract the token
        const token = authorization.replace('Bearer ', '');
        
        // Use Supabase's getUser to validate the token and get user info
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        
        if (error || !user) {
          console.error("JWT validation error:", error);
          return new Response(JSON.stringify({
            success: false,
            message: "Invalid authentication token",
            status: "inactive"
          }), {
            status: 200,
            headers
          });
        }
        
        userId = user.id;
      } catch (tokenError) {
        console.error("Error processing auth token:", tokenError);
        return new Response(JSON.stringify({
          success: false,
          message: "Invalid token format",
          status: "inactive"
        }), {
          status: 200,
          headers
        });
      }
    }
    
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        message: "User ID not provided",
        status: "inactive"
      }), {
        status: 200,
        headers
      });
    }

    // First, check subscriptions table for active subscription
    let subscriptionStatus = "inactive";
    let planId = null;
    let expiresAt = null;
    let planName = null;
    let subscriptionId = null;
    
    try {
      const now = new Date().toISOString();
      
      // Check in subscriptions table
      const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
        .from("subscriptions")
        .select("id, plan_id, status, current_period_end")
        .eq("user_id", userId)
        .eq("status", "active")
        .gte("current_period_end", now)
        .order('current_period_end', { ascending: false })
        .limit(1)
        .single();
      
      if (!subscriptionError && subscriptionData) {
        subscriptionStatus = "active";
        planId = subscriptionData.plan_id;
        expiresAt = subscriptionData.current_period_end;
        subscriptionId = subscriptionData.id;
        
        // Get plan name if available
        if (planId) {
          const { data: planData } = await supabaseAdmin
            .from("plans")
            .select("name")
            .eq("id", planId)
            .single();
          
          if (planData) {
            planName = planData.name;
          }
        }
      } else {
        // No active subscription in subscriptions table, check profiles as fallback
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from("profiles")
          .select("is_subscribed, subscription_end_date, current_plan_id, subscription_id")
          .eq("user_id", userId)
          .single();
        
        if (!profileError && profileData) {
          // Check if subscription is still valid based on end date
          if (profileData.is_subscribed && 
              profileData.subscription_end_date && 
              new Date(profileData.subscription_end_date) > new Date()) {
            
            subscriptionStatus = "active";
            planId = profileData.current_plan_id;
            expiresAt = profileData.subscription_end_date;
            subscriptionId = profileData.subscription_id;
            
            // Get plan name if available
            if (planId) {
              // Try subscription_plans table first
              let planData;
              const { data: subPlanData } = await supabaseAdmin
                .from("subscription_plans")
                .select("name")
                .eq("id", planId)
                .single();
              
              if (subPlanData) {
                planName = subPlanData.name;
              } else {
                // Try plans table as fallback
                const { data: fallbackPlanData } = await supabaseAdmin
                  .from("plans")
                  .select("name")
                  .eq("id", planId)
                  .single();
                
                if (fallbackPlanData) {
                  planName = fallbackPlanData.name;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      // Continue with inactive status on error
    }

    return new Response(JSON.stringify({
      success: true,
      status: subscriptionStatus,
      plan_id: planId,
      plan_name: planName,
      expires_at: expiresAt,
      subscription_id: subscriptionId
    }), {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error("Unexpected error in get-user-subscription:", error);
    
    return new Response(JSON.stringify({
      success: false,
      message: "Error checking subscription status",
      status: "inactive"
    }), {
      status: 200, // Always return 200 to avoid non-2xx errors
      headers
    });
  }
}); 