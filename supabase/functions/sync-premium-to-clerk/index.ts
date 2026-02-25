import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { clerk_user_id } = await req.json();
        if (!clerk_user_id) throw new Error("clerk_user_id is required");

        const clerkSecret = Deno.env.get('CLERK_SECRET_KEY');
        if (!clerkSecret) throw new Error("Server Misconfiguration: Clerk secret missing");

        const res = await fetch(`https://api.clerk.com/v1/users/${clerk_user_id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${clerkSecret}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ public_metadata: { isPremium: true } }),
        });

        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Clerk update failed (${res.status}): ${body}`);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
