/**
 * verify-booking-payment
 * Verifies Razorpay payment signature and writes a confirmed booking.
 * Meet link generation is handled separately via generate-meet-link.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_data } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing Razorpay payment fields');
    }
    if (!booking_data) throw new Error('booking_data is required');

    const { expert_id, user_name, user_email, message, date, start_time, end_time } = booking_data;
    if (!expert_id || !user_name || !user_email || !date || !start_time || !end_time) {
      throw new Error('Incomplete booking_data');
    }

    // Verify HMAC-SHA256 signature
    const secret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!secret) throw new Error('RAZORPAY_KEY_SECRET missing');

    const generatedSig = await hmacSha256(`${razorpay_order_id}|${razorpay_payment_id}`, secret);
    if (generatedSig !== razorpay_signature) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Race-condition guard
    const { data: conflict } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('expert_id', expert_id)
      .eq('date', date)
      .eq('start_time', start_time)
      .eq('status', 'confirmed')
      .maybeSingle();

    if (conflict) {
      return new Response(
        JSON.stringify({ error: 'This slot was just booked by someone else. Please choose another time.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        expert_id,
        user_name,
        user_email,
        message: message ?? null,
        date,
        start_time,
        end_time,
        razorpay_order_id,
        razorpay_payment_id,
        status: 'paid',
      })
      .select('id')
      .single();

    if (bookingError) throw bookingError;

    return new Response(
      JSON.stringify({ success: true, booking_id: booking.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[verify-booking-payment]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
