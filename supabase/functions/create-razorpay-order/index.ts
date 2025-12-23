
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Razorpay from "npm:razorpay@2.9.2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();
        // Fallback to clerk_user_id from body if auth header not present
        const { amount, clerk_user_id } = await req.json();
        const userId = user?.id || clerk_user_id;

        if (!userId) throw new Error('User ID is required');

        const razorpay = new Razorpay({
            key_id: Deno.env.get('RAZORPAY_KEY_ID'),
            key_secret: Deno.env.get('RAZORPAY_KEY_SECRET'),
        });

        const options = {
            amount: amount * 100, // Razorpay works in subunits (paise)
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${userId.slice(0, 5)}`,
            notes: {
                user_id: userId
            }
        };

        const order = await razorpay.orders.create(options);

        // Log transaction
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        await supabaseAdmin.from('payment_transactions').insert({
            user_id: userId,
            txnid: order.id, // Storing Razorpay Order ID as txnid
            amount: amount,
            status: 'created',
            provider_reference_id: order.id,
            raw_response: order
        });

        return new Response(
            JSON.stringify(order),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );

    } catch (error: any) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        );
    }
});
