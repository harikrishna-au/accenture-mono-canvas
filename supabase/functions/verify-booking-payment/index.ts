/**
 * verify-booking-payment
 * Verifies Razorpay payment signature and writes a confirmed booking.
 * Security: re-validates amount server-side, checks availability windows,
 * validates expert exists, enforces field length limits.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const MAX = { name: 100, email: 254, message: 1000 };

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

function err(msg: string, status = 400) {
  return new Response(
    JSON.stringify({ error: msg }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_data } =
      await req.json();

    // ── 1. Presence checks ────────────────────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return err('Missing Razorpay payment fields');
    }
    if (!booking_data) return err('booking_data is required');

    const { expert_id, user_name, user_email, message, date, start_time, end_time } = booking_data;
    if (!expert_id || !user_name || !user_email || !date || !start_time || !end_time) {
      return err('Incomplete booking_data');
    }

    // ── 2. Field length + email format validation ─────────────────────────────
    if (user_name.length > MAX.name)  return err(`Name must be ${MAX.name} characters or fewer`);
    if (user_email.length > MAX.email) return err('Email address is too long');
    if (!EMAIL_RE.test(user_email))    return err('Invalid email address');
    if (message && message.length > MAX.message) return err(`Message must be ${MAX.message} characters or fewer`);

    // ── 3. Verify HMAC-SHA256 signature ───────────────────────────────────────
    const secret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!secret) throw new Error('RAZORPAY_KEY_SECRET missing');

    const generatedSig = await hmacSha256(`${razorpay_order_id}|${razorpay_payment_id}`, secret);
    if (generatedSig !== razorpay_signature) {
      console.error('[verify-booking-payment] Signature mismatch', { razorpay_order_id, razorpay_payment_id });
      return err('Invalid payment signature', 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ── 4. Verify expert exists + get authoritative price ─────────────────────
    const { data: expert, error: expertErr } = await supabaseAdmin
      .from('experts')
      .select('id, price_inr')
      .eq('id', expert_id)
      .single();

    if (expertErr || !expert) {
      return err('Expert not found');
    }

    // ── 5. Re-validate payment amount via Razorpay API ────────────────────────
    const rzpKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    if (rzpKeyId) {
      try {
        const orderRes = await fetch(
          `https://api.razorpay.com/v1/orders/${razorpay_order_id}`,
          { headers: { Authorization: `Basic ${btoa(`${rzpKeyId}:${secret}`)}` } }
        );
        if (orderRes.ok) {
          const rzpOrder = await orderRes.json();
          const expectedPaise = expert.price_inr * 100;
          if (rzpOrder.amount !== expectedPaise) {
            console.error(
              `[verify-booking-payment] Amount mismatch: order=${rzpOrder.amount} expected=${expectedPaise}`,
              { razorpay_order_id }
            );
            return err('Payment amount does not match the session price');
          }
        }
      } catch (amountCheckErr) {
        // Log but don't block — Razorpay API may be temporarily unavailable
        console.warn('[verify-booking-payment] Could not verify order amount:', amountCheckErr);
      }
    }

    // ── 6. Validate booking falls within expert's availability ────────────────
    const bookingDayOfWeek = new Date(date).getDay(); // 0=Sun … 6=Sat
    const { data: windows } = await supabaseAdmin
      .from('availability')
      .select('start_time, end_time')
      .eq('expert_id', expert_id)
      .eq('day_of_week', bookingDayOfWeek);

    if (windows && windows.length > 0) {
      const inWindow = windows.some(
        (w: any) => start_time >= w.start_time && end_time <= w.end_time
      );
      if (!inWindow) {
        return err('Selected time is outside the expert\'s available hours');
      }
    }

    // ── 7. Race-condition guard: expert slot conflict ─────────────────────────
    const { data: conflict } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('expert_id', expert_id)
      .eq('date', date)
      .eq('start_time', start_time)
      .in('status', ['paid', 'confirmed'])
      .maybeSingle();

    if (conflict) {
      return new Response(
        JSON.stringify({ error: 'This slot was just booked by someone else. Please choose another time.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 8. User overlap guard ─────────────────────────────────────────────────
    const { data: userOverlap } = await supabaseAdmin
      .from('bookings')
      .select('id, start_time, end_time')
      .eq('user_email', user_email)
      .eq('date', date)
      .in('status', ['paid', 'confirmed']);

    const hasOverlap = (userOverlap ?? []).some(
      (b: any) => start_time < b.end_time && end_time > b.start_time
    );

    if (hasOverlap) {
      return new Response(
        JSON.stringify({ error: 'You already have a session booked during this time. Please choose a different slot.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 9. Insert booking ─────────────────────────────────────────────────────
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        expert_id,
        user_name:          user_name.trim().slice(0, MAX.name),
        user_email:         user_email.trim().toLowerCase(),
        message:            message ? message.trim().slice(0, MAX.message) : null,
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

    // ── 10. Auto-generate Google Meet link (best-effort, non-blocking) ────────
    let meetLink: string | null = null;
    try {
      const meetRes = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-meet-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({ booking_id: booking.id }),
        }
      );
      if (meetRes.ok) {
        const meetData = await meetRes.json();
        meetLink = meetData.meet_link ?? null;
      }
      // If expert hasn't connected Google (GOOGLE_NOT_CONNECTED), meetLink stays null —
      // the user can still request it manually via "My Bookings".
    } catch (meetErr) {
      console.warn('[verify-booking-payment] Meet link auto-generation skipped:', meetErr);
    }

    return new Response(
      JSON.stringify({ success: true, booking_id: booking.id, meet_link: meetLink }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[verify-booking-payment] Unhandled error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
