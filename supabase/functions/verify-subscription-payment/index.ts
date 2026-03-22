import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

async function hmacSha256(message: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return Array.from(new Uint8Array(signed)).map(b => b.toString(16).padStart(2, '0')).join('');
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

        const { payment_id, subscription_id, signature } = await req.json();

        if (!payment_id || !subscription_id || !signature) {
            throw new Error('Missing required fields: payment_id, subscription_id, signature');
        }

        const secret = Deno.env.get('RAZORPAY_KEY_SECRET');
        if (!secret) throw new Error('Server misconfiguration: secret missing');

        // Razorpay subscription signature = HMAC-SHA256(payment_id + "|" + subscription_id, secret)
        const expectedSig = await hmacSha256(`${payment_id}|${subscription_id}`, secret);

        if (expectedSig !== signature) {
            return new Response(JSON.stringify({ error: 'Invalid payment signature' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Set premium_expires_at to 31 days from now (first cycle)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 31);

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
            user_id: clerkUserId,
            is_premium: true,
            plan_type: 'monthly',
            subscription_id: subscription_id,
            subscription_status: 'active',
            premium_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        if (profileError) throw profileError;

        // Update Clerk metadata
        const clerkSecret = Deno.env.get('CLERK_SECRET_KEY');
        if (!clerkSecret) throw new Error('Server misconfiguration: Clerk secret missing');

        const clerkRes = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${clerkSecret}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                public_metadata: {
                    isPremium: true,
                    planType: 'monthly',
                    premiumExpiry: expiresAt.toISOString(),
                },
            }),
        });

        if (!clerkRes.ok) {
            const body = await clerkRes.text();
            throw new Error(`Clerk metadata update failed (${clerkRes.status}): ${body}`);
        }

        // Update transaction log
        await supabaseAdmin.from('payment_transactions').update({
            status: 'subscription_active',
            provider_reference_id: payment_id,
        }).eq('txnid', subscription_id).catch(() => {});

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
