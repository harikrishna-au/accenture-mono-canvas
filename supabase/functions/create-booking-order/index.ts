/**
 * create-booking-order
 * Creates a Razorpay order for an expert session booking.
 * Accepts: { expert_id, amount, guest_email }
 * Returns: Razorpay order object { id, amount, currency }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Razorpay from "npm:razorpay@2.9.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { expert_id, amount, guest_email } = await req.json();

    if (!expert_id) throw new Error('expert_id is required');
    if (!amount || amount <= 0) throw new Error('A valid amount is required');
    if (!guest_email) throw new Error('guest_email is required');

    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) throw new Error('Razorpay credentials not configured');

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `booking_${expert_id.slice(0, 8)}_${Date.now()}`,
      notes: {
        expert_id,
        guest_email,
        type: 'expert_session',
      },
    });

    return new Response(
      JSON.stringify({ id: order.id, amount: order.amount, currency: order.currency }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[create-booking-order]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
