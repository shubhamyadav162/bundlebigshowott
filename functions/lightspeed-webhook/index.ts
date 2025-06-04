import { serve } from "https://deno.land/x/sift@0.5.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as crypto from "https://deno.land/std@0.185.0/crypto/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LIGHTSPEED_WEBHOOK_SECRET = Deno.env.get("LIGHTSPEED_API_SECRET")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

serve(async (req) => {
  try {
    const signature = req.headers.get("X-Lightspeed-Signature") || "";
    const payload = await req.text();
    const key = new TextEncoder().encode(LIGHTSPEED_WEBHOOK_SECRET);
    const data = new TextEncoder().encode(payload);
    const computed = await crypto.subtle.sign(
      { name: "HMAC" },
      await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      data
    );
    const expectedSignature = Array.from(new Uint8Array(computed))
      .map(b => b.toString(16).padStart(2, "0")).join("");
    if (signature !== expectedSignature) {
      console.error("Invalid Lightspeed signature");
      return new Response(JSON.stringify({ success: false, message: "Invalid signature" }), { status: 200 });
    }

    const event = JSON.parse(payload);
    const paymentId = event.data.payment_id;
    const status = event.data.status; // 'paid' or 'failed'

    const { error: updateError } = await supabase
      .from("payments")
      .update({ status })
      .eq("id", paymentId);

    if (updateError) {
      console.error("Error updating payment status:", updateError);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Unexpected error in lightspeed-webhook:", err);
    return new Response(JSON.stringify({ success: false, message: "Internal error" }), { status: 200 });
  }
}); 