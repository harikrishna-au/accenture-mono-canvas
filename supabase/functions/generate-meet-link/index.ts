/**
 * generate-meet-link
 * Called when user clicks "Request Meeting" on a booking.
 * 1. Creates a Google Meet space via Meet API (service account).
 * 2. Stores meet_link on the booking row.
 * 3. Emails both the booker and the expert with the link.
 *
 * Accepts: { booking_id }
 * Returns: { success: true, meet_link } | { error: string }
 *
 * Required env vars:
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (auto-injected)
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
 *   RESEND_API_KEY
 *   FROM_EMAIL
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Google Meet helpers ────────────────────────────────────────────────────

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
    scope: 'https://www.googleapis.com/auth/meetings.space.created',
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

async function createMeetSpace(accessToken: string): Promise<string> {
  const res = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google Meet error: ${data.error?.message ?? JSON.stringify(data)}`);
  if (!data.meetingUri) throw new Error('No meetingUri in Google Meet response');
  return data.meetingUri;
}

// ── Email helpers ──────────────────────────────────────────────────────────

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
    console.error('[generate-meet-link] Resend error:', await res.text());
  }
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

function meetEmailHtml(params: {
  recipientName: string;
  otherName: string;
  date: string;
  startTime: string;
  endTime: string;
  meetLink: string;
  isExpert: boolean;
  userEmail?: string;
  message?: string | null;
}): string {
  const { recipientName, otherName, date, startTime, endTime, meetLink, isExpert, userEmail, message } = params;
  return `
    <div style="font-family:'Inter',sans-serif;max-width:520px;margin:0 auto;background:#fcfcf9;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
      <div style="background:#1c1917;padding:24px 28px;">
        <h1 style="color:#fafaf9;font-size:20px;margin:0;font-weight:600;">Your Google Meet link is ready</h1>
      </div>
      <div style="padding:28px;">
        <p style="color:#44403c;font-size:14px;line-height:1.6;margin:0 0 20px;">
          Hi <strong>${recipientName}</strong>,<br/>
          ${isExpert
            ? `<strong>${otherName}</strong> (<a href="mailto:${userEmail}" style="color:#44403c;">${userEmail}</a>) has requested the meeting link for your upcoming session.`
            : `Your meeting link for the session with <strong>${otherName}</strong> is ready.`
          }
        </p>

        <div style="background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;color:#44403c;">
            <tr>
              <td style="padding:6px 0;color:#78716c;">Date</td>
              <td style="padding:6px 0;font-weight:600;text-align:right;">${date}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#78716c;">Time</td>
              <td style="padding:6px 0;font-weight:600;text-align:right;">${formatTime(startTime)} – ${formatTime(endTime)} IST</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#78716c;">${isExpert ? 'Student' : 'Expert'}</td>
              <td style="padding:6px 0;font-weight:600;text-align:right;">${otherName}</td>
            </tr>
          </table>
          ${isExpert && message ? `
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e7e5e4;">
            <p style="color:#78716c;font-size:12px;margin:0 0 4px;">Message from student:</p>
            <p style="color:#44403c;font-size:13px;margin:0;font-style:italic;">"${message}"</p>
          </div>` : ''}
        </div>

        <a href="${meetLink}"
           style="display:block;background:#1a73e8;color:#ffffff;text-align:center;padding:14px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:16px;">
          Join Google Meet
        </a>

        <p style="color:#78716c;font-size:12px;line-height:1.6;margin:0;">
          Both you and ${otherName} share the same link:<br/>
          <a href="${meetLink}" style="color:#44403c;">${meetLink}</a>
        </p>
      </div>
    </div>
  `;
}

// ── Main handler ───────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { booking_id } = await req.json();
    if (!booking_id) throw new Error('booking_id is required');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch booking + expert details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*, experts(name, email)')
      .eq('id', booking_id)
      .single();

    if (bookingError) throw bookingError;
    if (!booking) throw new Error('Booking not found');

    // If already has a meet link, just return it
    if (booking.meet_link) {
      return new Response(
        JSON.stringify({ success: true, meet_link: booking.meet_link }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate Google Meet link
    const serviceEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const privateKey   = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
    if (!serviceEmail || !privateKey) throw new Error('Google service account env vars missing');

    const normalizedKey = privateKey.replace(/\\n/g, '\n');
    const accessToken = await getGoogleAccessToken(serviceEmail, normalizedKey);
    const meetLink = await createMeetSpace(accessToken);

    // Store meet_link on the booking
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ meet_link: meetLink })
      .eq('id', booking_id);

    if (updateError) throw updateError;

    // Send emails to both parties
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const from      = Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev';
    const expert    = booking.experts as { name: string; email: string | null };

    if (resendKey) {
      const emailBase = {
        date: booking.date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        meetLink,
      };

      await Promise.allSettled([
        // Email to booker
        sendEmail({
          to: booking.user_email,
          subject: `Your Google Meet link — session with ${expert.name}`,
          html: meetEmailHtml({
            recipientName: booking.user_name,
            otherName: expert.name,
            isExpert: false,
            ...emailBase,
          }),
          resendKey,
          from,
        }),
        // Email to expert (if they have an email)
        ...(expert.email ? [
          sendEmail({
            to: expert.email,
            subject: `Google Meet link — session with ${booking.user_name}`,
            html: meetEmailHtml({
              recipientName: expert.name,
              otherName: booking.user_name,
              isExpert: true,
              userEmail: booking.user_email,
              message: booking.message,
              ...emailBase,
            }),
            resendKey,
            from,
          }),
        ] : []),
      ]);
    }

    return new Response(
      JSON.stringify({ success: true, meet_link: meetLink }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[generate-meet-link]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
