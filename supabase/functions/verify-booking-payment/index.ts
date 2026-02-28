/**
 * verify-booking-payment
 * 1. Verifies Razorpay payment signature.
 * 2. Inserts confirmed booking.
 * 3. Creates a Google Meet via Calendar API (service account).
 * 4. Stores meet_link on the booking row.
 * 5. Emails both the booker and the expert via Resend.
 *
 * Required env vars:
 *   RAZORPAY_KEY_SECRET
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL   — service account email
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY — RSA private key PEM (replace \n literals with actual newlines when setting in Supabase)
 *   RESEND_API_KEY
 *   FROM_EMAIL  (optional, defaults to onboarding@resend.dev for testing)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function b64url(data: ArrayBuffer | string): string {
  const buf = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function getGoogleAccessToken(serviceEmail: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    iss: serviceEmail,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));

  const signingInput = `${header}.${payload}`;
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(signingInput));
  const jwt = `${signingInput}.${b64url(sig)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Google auth failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function createGoogleMeetLink(params: {
  title: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM:SS
  endTime: string;    // HH:MM:SS
  accessToken: string;
}): Promise<string> {
  const { title, date, startTime, endTime, accessToken } = params;
  // Format as local datetime (no Z — Google interprets per timeZone field)
  const start = `${date}T${startTime}`;
  const end   = `${date}T${endTime}`;

  const event = {
    summary: title,
    start: { dateTime: start, timeZone: 'Asia/Kolkata' },
    end:   { dateTime: end,   timeZone: 'Asia/Kolkata' },
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`Google Calendar error: ${data.error?.message ?? JSON.stringify(data)}`);

  const meetLink = data.conferenceData?.entryPoints?.find(
    (ep: any) => ep.entryPointType === 'video'
  )?.uri;
  if (!meetLink) throw new Error('Google Calendar did not return a Meet link');
  return meetLink;
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  resendKey: string;
  from: string;
}): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[sendEmail] Resend error:', err);
    // Don't throw — a failed email shouldn't roll back a successful booking
  }
}

function formatTime(t: string) {
  // "HH:MM:SS" → "HH:MM"
  return t.slice(0, 5);
}

function buildBookerEmail(params: {
  userName: string;
  expertName: string;
  date: string;
  startTime: string;
  endTime: string;
  meetLink: string;
}): string {
  return `
    <div style="font-family:'Inter',sans-serif;max-width:520px;margin:0 auto;background:#fcfcf9;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
      <div style="background:#1c1917;padding:24px 28px;">
        <h1 style="color:#fafaf9;font-size:20px;margin:0;font-weight:600;">Your session is confirmed! 🎉</h1>
      </div>
      <div style="padding:28px;">
        <p style="color:#44403c;font-size:14px;line-height:1.6;margin:0 0 20px;">
          Hi <strong>${params.userName}</strong>, your 20-minute session with
          <strong>${params.expertName}</strong> is all set.
        </p>

        <div style="background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;color:#44403c;">
            <tr>
              <td style="padding:6px 0;color:#78716c;">Date</td>
              <td style="padding:6px 0;font-weight:600;text-align:right;">${params.date}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#78716c;">Time</td>
              <td style="padding:6px 0;font-weight:600;text-align:right;">${formatTime(params.startTime)} – ${formatTime(params.endTime)} IST</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#78716c;">Expert</td>
              <td style="padding:6px 0;font-weight:600;text-align:right;">${params.expertName}</td>
            </tr>
          </table>
        </div>

        <a href="${params.meetLink}"
           style="display:block;background:#1c1917;color:#fafaf9;text-align:center;padding:14px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:20px;">
          Join Google Meet
        </a>

        <p style="color:#78716c;font-size:12px;line-height:1.6;margin:0;">
          Save this link — both you and ${params.expertName} will use the same meeting room.<br/>
          <a href="${params.meetLink}" style="color:#44403c;">${params.meetLink}</a>
        </p>
      </div>
    </div>
  `;
}

function buildExpertEmail(params: {
  expertName: string;
  userName: string;
  userEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  meetLink: string;
  message: string | null;
}): string {
  return `
    <div style="font-family:'Inter',sans-serif;max-width:520px;margin:0 auto;background:#fcfcf9;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
      <div style="background:#1c1917;padding:24px 28px;">
        <h1 style="color:#fafaf9;font-size:20px;margin:0;font-weight:600;">New session booked with you</h1>
      </div>
      <div style="padding:28px;">
        <p style="color:#44403c;font-size:14px;line-height:1.6;margin:0 0 20px;">
          Hi <strong>${params.expertName}</strong>,
          <strong>${params.userName}</strong> (<a href="mailto:${params.userEmail}" style="color:#44403c;">${params.userEmail}</a>)
          has booked a 20-minute session with you.
        </p>

        <div style="background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;color:#44403c;">
            <tr>
              <td style="padding:6px 0;color:#78716c;">Date</td>
              <td style="padding:6px 0;font-weight:600;text-align:right;">${params.date}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#78716c;">Time</td>
              <td style="padding:6px 0;font-weight:600;text-align:right;">${formatTime(params.startTime)} – ${formatTime(params.endTime)} IST</td>
            </tr>
          </table>
          ${params.message ? `
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e7e5e4;">
            <p style="color:#78716c;font-size:12px;margin:0 0 4px;">Message from student:</p>
            <p style="color:#44403c;font-size:13px;margin:0;font-style:italic;">"${params.message}"</p>
          </div>` : ''}
        </div>

        <a href="${params.meetLink}"
           style="display:block;background:#1c1917;color:#fafaf9;text-align:center;padding:14px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:20px;">
          Join Google Meet
        </a>

        <p style="color:#78716c;font-size:12px;line-height:1.6;margin:0;">
          Both you and the student will use the same link:<br/>
          <a href="${params.meetLink}" style="color:#44403c;">${params.meetLink}</a>
        </p>
      </div>
    </div>
  `;
}

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

// ── Main handler ───────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_data } =
      await req.json();

    // Validate required fields
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

    // Fetch expert name + email
    const { data: expert, error: expertError } = await supabaseAdmin
      .from('experts')
      .select('name, email')
      .eq('id', expert_id)
      .single();

    if (expertError) throw expertError;

    // Create Google Meet link
    let meetLink: string | null = null;
    try {
      const serviceEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
      const privateKey   = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
      if (!serviceEmail || !privateKey) throw new Error('Google service account env vars missing');

      // Supabase stores env vars with literal \n — convert to real newlines
      const normalizedKey = privateKey.replace(/\\n/g, '\n');

      const accessToken = await getGoogleAccessToken(serviceEmail, normalizedKey);
      meetLink = await createGoogleMeetLink({
        title: `Session: ${user_name} × ${expert.name}`,
        date,
        startTime: start_time,
        endTime:   end_time,
        accessToken,
      });
    } catch (meetErr: any) {
      // Log but don't fail the booking — better to have a booking without a Meet link
      // than no booking at all
      console.error('[verify-booking-payment] Meet creation failed:', meetErr.message);
    }

    // Insert booking
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
        meet_link: meetLink,
        status: 'paid',
      })
      .select('id')
      .single();

    if (bookingError) throw bookingError;

    // Send emails (fire-and-forget — don't fail booking if email fails)
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const from      = Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev';

    if (resendKey && meetLink) {
      const emailParams = { date, startTime: start_time, endTime: end_time, meetLink };

      await Promise.allSettled([
        sendEmail({
          to: user_email,
          subject: `Your session with ${expert.name} is confirmed`,
          html: buildBookerEmail({ userName: user_name, expertName: expert.name, ...emailParams }),
          resendKey,
          from,
        }),
        ...(expert.email ? [
          sendEmail({
            to: expert.email,
            subject: `New session booked — ${user_name} on ${date}`,
            html: buildExpertEmail({
              expertName: expert.name,
              userName:   user_name,
              userEmail:  user_email,
              message:    message ?? null,
              ...emailParams,
            }),
            resendKey,
            from,
          }),
        ] : []),
      ]);
    }

    return new Response(
      JSON.stringify({ success: true, booking_id: booking.id, meet_link: meetLink }),
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
