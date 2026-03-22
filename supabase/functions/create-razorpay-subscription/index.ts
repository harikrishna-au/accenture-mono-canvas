import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Verify a Clerk session JWT and return the clerk user id, or null. */
async function verifyClerkToken(token: string): Promise<string | null> {
    try {
        const clerkSecret = Deno.env.get('CLERK_SECRET_KEY');
        if (!clerkSecret) return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payloadJson = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        const userId: string | undefined = payloadJson.sub;
        if (!userId) return null;
        const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${clerkSecret}` },
        });
        if (!res.ok) return null;
        return userId;
    } catch {
        return null;
    }
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization') ?? '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        const clerkUserId = token ? await verifyClerkToken(token) : null;

        if (!clerkUserId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const keyId = Deno.env.get('RAZORPAY_KEY_ID');
        const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
        const planId = Deno.env.get('RAZORPAY_MONTHLY_PLAN_ID');

        if (!keyId || !keySecret || !planId) {
            throw new Error('Server misconfiguration: Razorpay credentials or plan ID missing');
        }

        const auth = btoa(`${keyId}:${keySecret}`);

        // Create subscription on Razorpay
        const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plan_id: planId,
                total_count: 120, // 10 years max (effectively indefinite)
                quantity: 1,
                customer_notify: 1,
                notes: {
                    clerk_user_id: clerkUserId,
                },
            }),
        });

        if (!subRes.ok) {
            const err = await subRes.text();
            throw new Error(`Razorpay subscription creation failed: ${err}`);
        }

        const subscription = await subRes.json();

        // Log to Supabase
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        await supabaseAdmin.from('payment_transactions').insert({
            user_id: clerkUserId,
            txnid: subscription.id,
            amount: 149,
            status: 'subscription_created',
            provider_reference_id: subscription.id,
            raw_response: subscription,
        }).catch(() => {}); // non-critical

        return new Response(
            JSON.stringify({ subscription_id: subscription.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
});
