/**
 * validate-coupon
 * Server-side coupon validation for premium subscription.
 *
 * Accepts: { coupon_code: string }
 * Returns: { valid: true, amount: number } | { valid: false }
 *
 * Required env var (set in Supabase Dashboard → Edge Functions → Secrets):
 *   COUPON_CODES_JSON — JSON string mapping code → discounted price in INR
 *   Example: {"HARRY20": 79, "BLAZE10": 99, "LAUNCH50": 59}
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { coupon_code } = await req.json();
    if (!coupon_code || typeof coupon_code !== 'string') {
      return new Response(
        JSON.stringify({ valid: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const code = coupon_code.trim().toUpperCase();
    if (code.length === 0 || code.length > 50) {
      return new Response(
        JSON.stringify({ valid: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const codesRaw = Deno.env.get('COUPON_CODES_JSON');
    const codes: Record<string, number> = codesRaw ? JSON.parse(codesRaw) : {};
    const amount = codes[code];

    if (amount && typeof amount === 'number' && amount > 0) {
      return new Response(
        JSON.stringify({ valid: true, amount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ valid: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[validate-coupon]', err);
    return new Response(
      JSON.stringify({ valid: false }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
