import { serve } from "https://deno.land/x/sift@0.5.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LIGHTSPEED_API_KEY = Deno.env.get("LIGHTSPEED_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

serve(async (req) => {
  try {
    const { user_id, plan_id, amount } = await req.json();

    const { data: payment, error: insertError } = await supabase
      .from("payments")
      .insert({ user_id, plan_id, amount, status: "pending" })
      .select("id")
      .single();

    if (insertError || !payment) {
      console.error("Error inserting payment:", insertError);
      return new Response(JSON.stringify({ success: false, message: "Failed to create payment record" }), { status: 200 });
    }

    const lightspeedResponse = await fetch("https://api.lightspeed.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LIGHTSPEED_API_KEY}`,
      },
      body: JSON.stringify({
        payment_id: payment.id,
        amount,
        currency: "USD",
        success_url: `${Deno.env.get("APP_URL")}/payment-success?payment_id=${payment.id}`,
        cancel_url: `${Deno.env.get("APP_URL")}/payment-cancel?payment_id=${payment.id}`,
      }),
    });

    const lightspeedData = await lightspeedResponse.json();

    return new Response(JSON.stringify({
      success: true,
      payment_id: payment.id,
      checkout_url: lightspeedData.checkout_url,
    }), { status: 200 });

  } catch (err) {
    console.error("Unexpected error in create-payment-session:", err);
    return new Response(JSON.stringify({ success: false, message: "Internal error" }), { status: 200 });
  }
}); 