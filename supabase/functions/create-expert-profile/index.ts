/**
 * create-expert-profile
 * Inserts a new expert profile + availability windows using the service role key,
 * bypassing Row Level Security on the experts / availability tables.
 *
 * Accepts:
 *   expert: {
 *     name, title?, bio?, photo_url?, skills?,
 *     price_inr?, company?, interview_date?, package_lpa?, proof_url?
 *   }
 *   availability: [{ day_of_week, start_time, end_time }]   (optional)
 *
 * Returns: { success: true, expert_id } | { error: string }
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
    const { expert: expertData, availability = [] } = await req.json();

    // ── Basic validation ──────────────────────────────────────────────────
    if (!expertData?.name?.trim()) {
      throw new Error('Expert name is required');
    }

    // ── Use service role to bypass RLS ────────────────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ── Insert expert ─────────────────────────────────────────────────────
    const { data: expert, error: expertError } = await supabaseAdmin
      .from('experts')
      .insert({
        name: expertData.name.trim(),
        title: expertData.title?.trim() || null,
        bio: expertData.bio?.trim() || null,
        photo_url: expertData.photo_url || null,
        skills: Array.isArray(expertData.skills) && expertData.skills.length > 0
          ? expertData.skills
          : null,
        price_inr: expertData.price_inr ?? 100,
        company: expertData.company?.trim() || null,
        interview_date: expertData.interview_date || null,
        package_lpa: expertData.package_lpa ?? null,
        proof_url: expertData.proof_url || null,
      })
      .select('id')
      .single();

    if (expertError) throw expertError;

    // ── Insert availability windows ───────────────────────────────────────
    if (availability.length > 0) {
      const rows = availability.map((a: any) => ({
        expert_id: expert.id,
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time,
      }));

      const { error: avErr } = await supabaseAdmin.from('availability').insert(rows);
      if (avErr) throw avErr;
    }

    return new Response(
      JSON.stringify({ success: true, expert_id: expert.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[create-expert-profile]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
