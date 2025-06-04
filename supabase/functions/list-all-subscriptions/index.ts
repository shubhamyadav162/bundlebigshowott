import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Load Supabase environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://hjsdcsatfcysrwsryngu.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqc2Rjc2F0ZmN5c3J3c3J5bmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzEwMjA5MSwiZXhwIjoyMDYyNjc4MDkxfQ.BR-A3TEEErWOhUw8vHSy0jkToDsGGqNGCXiRwSpLrDk";

// Initialize Supabase admin client with service role
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  console.log("List All Subscriptions function started");
  
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
    
    // Verify the user is an admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("user_id", authenticatedUserId)
      .single();
    
    if (userError || !userData || userData.role !== "admin") {
      return new Response(JSON.stringify({ 
        success: false,
        message: "Unauthorized. Admin access required." 
      }), { 
        status: 200, 
        headers
      });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sort_by') || 'created_at';
    const sortOrder = url.searchParams.get('sort_order') || 'desc';
    
    const offset = (page - 1) * limit;
    
    // Build the query
    let query = supabaseAdmin
      .from("subscriptions")
      .select(`
        id,
        user_id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        canceled_at,
        created_at,
        updated_at,
        profiles:user_id(full_name, email:auth.users!user_id(email)),
        plans:plan_id(name, price)
      `, { count: 'exact' });
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (search) {
      // Join to profiles to search by name or email
      query = query.or(`profiles.full_name.ilike.%${search}%,profiles.email.ilike.%${search}%`);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data: subscriptions, error: subsError, count } = await query;
    
    if (subsError) {
      console.error("Error fetching subscriptions:", subsError);
      return new Response(JSON.stringify({ 
        success: false,
        message: "Error fetching subscriptions", 
        error: subsError.message
      }), { 
        status: 200, 
        headers
      });
    }
    
    // Calculate pagination metadata
    const totalPages = count ? Math.ceil(count / limit) : 0;
    
    return new Response(JSON.stringify({ 
      success: true,
      subscriptions,
      pagination: {
        total_items: count,
        total_pages: totalPages,
        current_page: page,
        limit: limit
      }
    }), { 
      status: 200, 
      headers
    });
    
  } catch (error) {
    console.error("Unexpected error in list-all-subscriptions:", error);
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