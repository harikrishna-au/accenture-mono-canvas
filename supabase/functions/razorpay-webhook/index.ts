
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode as hex } from "https://deno.land/std@0.168.0/encoding/hex.ts";

serve(async (req: Request) => {
    try {
        const signature = req.headers.get("x-razorpay-signature");
        if (!signature) {
            return new Response("No signature found", { status: 400 });
        }

        const secret = Deno.env.get('RAZORPAY_KEY_SECRET');
        if (!secret) throw new Error("RAZORPAY_KEY_SECRET not set");

        // Important: Read raw text first for signature verification
        const rawBody = await req.text();

        // Verify Signature
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        const msgData = encoder.encode(rawBody);

        const cryptoKey = await crypto.subtle.importKey(
            "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
        );
        const signed = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
        // Convert to hex
        const calculatedSignature = Array.from(new Uint8Array(signed))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        if (calculatedSignature !== signature) {
            console.error("Invalid Signature", { calculatedSignature, signature });
            return new Response("Invalid Signature", { status: 403 });
        }

        const payload = JSON.parse(rawBody);
        const event = payload.event;

        if (event === 'payment.captured') {
            const payment = payload.payload.payment.entity;
            const orderId = payment.order_id;
            const userId = payment.notes.user_id;
            const email = payment.email;

            const supabaseAdmin = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );

            // Update Transaction
            await supabaseAdmin.from('payment_transactions').update({
                status: 'success',
                provider_reference_id: payment.id,
                raw_response: payment
            }).eq('txnid', orderId);

            // Update User Profile
            if (userId) {
                await supabaseAdmin.from('profiles').upsert({
                    user_id: userId,
                    email: email,
                    is_premium: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message }), { status: 400 });
    }
});
