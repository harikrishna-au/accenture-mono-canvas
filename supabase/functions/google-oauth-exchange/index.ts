/**
 * google-oauth-exchange
 * Exchanges a Google OAuth authorization code for tokens
 * and stores the refresh_token on the expert row.
 *
 * Accepts: { code, expert_id, redirect_uri }
 * Returns: { success: true } | { error: string }
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (auto-injected)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, expert_id, redirect_uri } = await req.json();
    if (!code) throw new Error('code is required');
    if (!expert_id) throw new Error('expert_id is required');
    if (!redirect_uri) throw new Error('redirect_uri is required');

    const clientId     = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    if (!clientId || !clientSecret) throw new Error('Google OAuth credentials not configured');

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(`Token exchange failed: ${tokens.error_description ?? tokens.error}`);
    if (!tokens.refresh_token) throw new Error('No refresh_token returned — make sure prompt=consent is set in the OAuth URL');

    // Store refresh_token on the expert row
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabaseAdmin
      .from('experts')
      .update({ google_refresh_token: tokens.refresh_token })
      .eq('id', expert_id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[google-oauth-exchange]', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
