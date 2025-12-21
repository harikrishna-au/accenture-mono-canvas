
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode as hex } from "https://deno.land/std@0.168.0/encoding/hex.ts";

serve(async (req) => {
    // PayU sends form data (application/x-www-form-urlencoded)
    const formData = await req.formData();
    const data: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value as string;
    }

    const {
        mihpayid,
        mode,
        status,
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        lastname,
        email,
        phone,
        udf1,
        hash,
        error,
        bank_ref_num,
        cardnum,
        unmappedstatus
    } = data;

    const salt = Deno.env.get('PAYU_MERCHANT_SALT') || 'YOUR_MERCHANT_SALT';

    // Verification Hash: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
    // Note the REVERSE ORDER compared to request hash
    const hashString = `${salt}|${status}|||||||||${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

    const encoder = new TextEncoder();
    const calculatedHashBuffer = await crypto.subtle.digest("SHA-512", encoder.encode(hashString));
    const calculatedHash = new TextDecoder().decode(hex(new Uint8Array(calculatedHashBuffer)));

    if (calculatedHash !== hash) {
        console.error('Hash mismatch', { calculatedHash, receivedHash: hash });
        return new Response("Invalid Signature", { status: 400 });
    }

    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update Transaction
    await supabaseAdmin.from('payment_transactions').update({
        status: status,
        provider_reference_id: mihpayid,
        raw_response: data
    }).eq('txnid', txnid);

    if (status === 'success') {
        // Update User Profile to Premium
        // udf1 contains user_id
        const userId = udf1;
        await supabaseAdmin.from('profiles').update({
            is_premium: true,
            updated_at: new Date()
        }).eq('user_id', userId);

        // Redirect to success page on frontend
        return Response.redirect(`${Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '')}/dashboard?payment=success`, 303);
    } else {
        // Redirect to failure page
        return Response.redirect(`${Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '')}/dashboard?payment=failure`, 303);
    }
});
