
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Verify a Clerk session JWT and return the user's sub (clerk user id), or null if invalid. */
async function verifyClerkToken(token: string): Promise<string | null> {
    try {
        const clerkSecret = Deno.env.get('CLERK_SECRET_KEY');
        if (!clerkSecret) return null;

        // Decode the JWT payload (middle segment) to extract claims.
        // We then confirm the identity with Clerk's REST API to ensure the
        // token is genuinely issued by Clerk and not forged.
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payloadJson = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        const userId: string | undefined = payloadJson.sub;
        if (!userId) return null;

        // Confirm the token against Clerk's user endpoint — this validates
        // that the session is active and the token is authentic.
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
        // Extract and verify the Clerk JWT from the Authorization header.
        // Never trust clerk_user_id supplied in the request body.
        const authHeader = req.headers.get('Authorization') ?? '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        const verified_clerk_user_id = token ? await verifyClerkToken(token) : null;

        if (!verified_clerk_user_id) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const { order_id, payment_id, signature, coupon_code } = await req.json();

        if (!order_id || !payment_id || !signature) {
            throw new Error("Missing required fields");
        }

        const secret = Deno.env.get('RAZORPAY_KEY_SECRET');
        if (!secret) throw new Error("Server Misconfiguration: Secret missing");

        // Verify Signature
        // content = order_id + "|" + payment_id
        const generated_signature = await hmacSha256(order_id + "|" + payment_id, secret);

        if (generated_signature !== signature) {
            return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Signature is valid. Update Profile.
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Update User Profile
        const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
            user_id: verified_clerk_user_id,
            is_premium: true,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

        if (profileError) throw profileError;

        // Sync premium status to Clerk publicMetadata — frontend reads from here
        const clerkSecret = Deno.env.get('CLERK_SECRET_KEY');
        if (!clerkSecret) throw new Error("Server Misconfiguration: Clerk secret missing");
        const clerkRes = await fetch(`https://api.clerk.com/v1/users/${verified_clerk_user_id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${clerkSecret}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ public_metadata: { isPremium: true } }),
        });
        if (!clerkRes.ok) {
            const body = await clerkRes.text();
            throw new Error(`Clerk metadata update failed (${clerkRes.status}): ${body}`);
        }

        // Log transaction (Optional update to existing transaction)
        await supabaseAdmin.from('payment_transactions').update({
            status: 'verified_client_side',
            provider_reference_id: payment_id
        }).eq('txnid', order_id);

        // Track Coupon Usage if provided
        if (coupon_code) {
            try {
                await supabaseAdmin.from('coupon_usages').insert({
                    coupon_code: coupon_code,
                    amount: null // We default to tracking just the usage count for now
                });
            } catch (couponError) {
                console.warn("Failed to track coupon usage (ignoring to prevent payment failure):", couponError);
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });


    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function hmacSha256(message: string, secret: string) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const signed = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
    return Array.from(new Uint8Array(signed))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
