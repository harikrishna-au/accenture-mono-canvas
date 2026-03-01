/**
 * generate-meet-link
 * Uses the expert's stored Google OAuth refresh token to create a Meet space,
 * stores the link, and emails both parties.
 *
 * Accepts: { booking_id }
 * Returns: { success: true, meet_link } | { error: string }
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   RESEND_API_KEY
 *   FROM_EMAIL
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (auto-injected)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAccessTokenFromRefreshToken(refreshToken: string): Promise<string> {
  const clientId     = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  if (!clientId || !clientSecret) throw new Error('Google OAuth credentials not configured');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error(`Failed to refresh token: ${data.error_description ?? data.error}`);
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

async function sendEmail(params: {
  to: string; subject: string; html: string; resendKey: string; from: string;
}): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${params.resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: params.from, to: [params.to], subject: params.subject, html: params.html }),
  });
  if (!res.ok) console.error('[generate-meet-link] Resend error:', await res.text());
}

function formatTime(t: string) { return t.slice(0, 5); }

function emailHtml(params: {
  recipientName: string; otherName: string; date: string;
  startTime: string; endTime: string; meetLink: string;
  isExpert: boolean; userEmail?: string; message?: string | null;
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
            ? `<strong>${otherName}</strong> (<a href="mailto:${userEmail}" style="color:#44403c;">${userEmail}</a>) has requested the meeting link.`
            : `Your Google Meet link for the session with <strong>${otherName}</strong> is ready.`}
        </p>
        <div style="background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;color:#44403c;">
            <tr><td style="padding:6px 0;color:#78716c;">Date</td><td style="padding:6px 0;font-weight:600;text-align:right;">${date}</td></tr>
            <tr><td style="padding:6px 0;color:#78716c;">Time</td><td style="padding:6px 0;font-weight:600;text-align:right;">${formatTime(startTime)} – ${formatTime(endTime)} IST</td></tr>
            <tr><td style="padding:6px 0;color:#78716c;">${isExpert ? 'Student' : 'Expert'}</td><td style="padding:6px 0;font-weight:600;text-align:right;">${otherName}</td></tr>
          </table>
          ${isExpert && message ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #e7e5e4;"><p style="color:#78716c;font-size:12px;margin:0 0 4px;">Student's message:</p><p style="color:#44403c;font-size:13px;margin:0;font-style:italic;">"${message}"</p></div>` : ''}
        </div>
        <a href="${meetLink}" style="display:block;background:#1a73e8;color:#fff;text-align:center;padding:14px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:16px;">Join Google Meet</a>
        <p style="color:#78716c;font-size:12px;line-height:1.6;margin:0;">Both you and ${otherName} share the same link:<br/><a href="${meetLink}" style="color:#44403c;">${meetLink}</a></p>
      </div>
    </div>`;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { booking_id } = await req.json();
    if (!booking_id) throw new Error('booking_id is required');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch booking + expert (including refresh token)
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*, experts(name, email, google_refresh_token)')
      .eq('id', booking_id)
      .single();

    if (bookingError) throw bookingError;
    if (!booking) throw new Error('Booking not found');

    // Return existing link if already generated
    if (booking.meet_link) {
      return new Response(
        JSON.stringify({ success: true, meet_link: booking.meet_link }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const expert = booking.experts as { name: string; email: string | null; google_refresh_token: string | null };

    if (!expert.google_refresh_token) {
      return new Response(
        JSON.stringify({ error: 'GOOGLE_NOT_CONNECTED' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get a fresh access token using the expert's refresh token
    const accessToken = await getAccessTokenFromRefreshToken(expert.google_refresh_token);

    // Create the Meet space
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

    if (resendKey) {
      const base = { date: booking.date, startTime: booking.start_time, endTime: booking.end_time, meetLink };
      await Promise.allSettled([
        sendEmail({
          to: booking.user_email,
          subject: `Your Google Meet link — session with ${expert.name}`,
          html: emailHtml({ recipientName: booking.user_name, otherName: expert.name, isExpert: false, ...base }),
          resendKey, from,
        }),
        ...(expert.email ? [sendEmail({
          to: expert.email,
          subject: `Google Meet link — session with ${booking.user_name}`,
          html: emailHtml({ recipientName: expert.name, otherName: booking.user_name, isExpert: true, userEmail: booking.user_email, message: booking.message, ...base }),
          resendKey, from,
        })] : []),
      ]);
    }

    return new Response(
      JSON.stringify({ success: true, meet_link: meetLink }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[generate-meet-link]', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
