
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

serve(async (req: Request) => {
    try {
        const signature = req.headers.get("x-razorpay-signature");
        if (!signature) {
            return new Response("No signature found", { status: 400 });
        }

        // Use RAZORPAY_WEBHOOK_SECRET if set, fall back to key secret
        const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') ?? Deno.env.get('RAZORPAY_KEY_SECRET');
        if (!secret) throw new Error("Razorpay webhook secret not configured");

        // Read raw body for signature verification
        const rawBody = await req.text();

        // Verify Signature: HMAC-SHA256(rawBody, secret)
        const encoder = new TextEncoder();
        const cryptoKey = await crypto.subtle.importKey(
            "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
        );
        const signed = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(rawBody));
        const calculatedSignature = Array.from(new Uint8Array(signed))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        if (calculatedSignature !== signature) {
            console.error("Invalid Signature", { calculatedSignature, signature });
            return new Response("Invalid Signature", { status: 403 });
        }

        const payload = JSON.parse(rawBody);
        const event: string = payload.event;

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const clerkSecret = Deno.env.get('CLERK_SECRET_KEY');

        // ── One-time payment captured (legacy flow) ──────────────────────────
        if (event === 'payment.captured') {
            const payment = payload.payload.payment.entity;
            const orderId = payment.order_id;
            const userId = payment.notes?.user_id;
            const email = payment.email;

            await supabaseAdmin.from('payment_transactions').update({
                status: 'success',
                provider_reference_id: payment.id,
                raw_response: payment
            }).eq('txnid', orderId);

            if (userId) {
                await supabaseAdmin.from('profiles').upsert({
                    user_id: userId,
                    email: email,
                    is_premium: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            }
        }

        // ── Subscription renewal (monthly users auto-renew) ───────────────────
        else if (event === 'subscription.charged') {
            const subscription = payload.payload?.subscription?.entity;
            const clerkUserId: string = subscription?.notes?.clerk_user_id;
            // current_end is Unix timestamp of when the current paid period ends
            const currentEnd: number = subscription?.current_end;

            if (!clerkUserId) {
                console.error('subscription.charged: no clerk_user_id in subscription notes');
                return new Response(JSON.stringify({ received: true }), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            const newExpiry = currentEnd
                ? new Date(currentEnd * 1000).toISOString()
                : (() => { const d = new Date(); d.setDate(d.getDate() + 31); return d.toISOString(); })();

            await supabaseAdmin.from('profiles').update({
                is_premium: true,
                subscription_status: 'active',
                premium_expires_at: newExpiry,
                updated_at: new Date().toISOString(),
            }).eq('subscription_id', subscription.id);

            if (clerkSecret) {
                await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${clerkSecret}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        public_metadata: {
                            isPremium: true,
                            planType: 'monthly',
                            premiumExpiry: newExpiry,
                        },
                    }),
                }).catch(e => console.error('Clerk update failed on renewal:', e));
            }

            console.log(`subscription.charged: extended premium for ${clerkUserId} until ${newExpiry}`);
        }

        // ── Subscription cancelled (user or admin) ────────────────────────────
        else if (event === 'subscription.cancelled') {
            const subscription = payload.payload?.subscription?.entity;
            if (subscription?.id) {
                await supabaseAdmin.from('profiles').update({
                    subscription_status: 'cancelled',
                    updated_at: new Date().toISOString(),
                }).eq('subscription_id', subscription.id);
            }
            console.log(`subscription.cancelled: ${subscription?.id}`);
        }

        // ── Subscription halted (payment failures exhausted) ──────────────────
        else if (event === 'subscription.halted') {
            const subscription = payload.payload?.subscription?.entity;
            if (subscription?.id) {
                await supabaseAdmin.from('profiles').update({
                    subscription_status: 'halted',
                    updated_at: new Date().toISOString(),
                }).eq('subscription_id', subscription.id);
            }
            console.log(`subscription.halted: ${subscription?.id}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message }), { status: 400 });
    }
});
