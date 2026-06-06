import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.9.6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LIFETIME_AMOUNT_INR = 299;
const LIFETIME_AMOUNT_PAISE = LIFETIME_AMOUNT_INR * 100;

const firebaseJwks = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function buildUsername(email: string, displayName: string) {
  const seed = normalizeText(displayName) || email.split('@')[0] || 'member';
  return seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24) || 'member';
}

async function verifyFirebaseToken(token: string) {
  const projectId = Deno.env.get('FIREBASE_PROJECT_ID');
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is missing');
  }

  const { payload } = await jwtVerify(token, firebaseJwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  const uid = normalizeText(payload.sub) || normalizeText(payload.user_id);
  if (!uid) {
    throw new Error('Firebase token did not include a user id');
  }

  return {
    uid,
    email: normalizeText(payload.email),
    name: normalizeText(payload.name),
  };
}

async function updateSupabaseProfile(params: {
  uid: string;
  email: string;
  username: string;
  paymentLinkId: string;
}) {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const profilePayload = {
    user_id: params.uid,
    email: params.email,
    username: params.username,
    is_premium: true,
    plan_type: 'lifetime',
    subscription_id: params.paymentLinkId,
    subscription_status: 'active',
    premium_expires_at: null,
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'user_id' });
  if (profileError) throw profileError;

  const { error: premiumError } = await supabaseAdmin
    .from('premium_members')
    .upsert(
      {
        user_id: params.uid,
        email: params.email,
        username: params.username,
        plan_type: 'lifetime',
        subscription_id: params.paymentLinkId,
        subscription_status: 'active',
        premium_expires_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  if (premiumError) throw premiumError;
}

async function syncFirestoreProfile(token: string, payload: Record<string, unknown>) {
  const backendUrl = normalizeText(Deno.env.get('BACKEND_URL'));
  if (!backendUrl) return;

  await fetch(`${backendUrl.replace(/\/$/, '')}/api/firestore/user/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

async function createPaymentLink(params: {
  uid: string;
  email: string;
  username: string;
}) {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID');
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are missing');
  }

  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: LIFETIME_AMOUNT_PAISE,
      currency: 'INR',
      description: 'SSB Ready Lifetime Premium',
      customer: {
        name: params.username,
        email: params.email,
      },
      notify: {
        email: true,
        sms: false,
      },
      reminder_enable: true,
      notes: {
        uid: params.uid,
        email: params.email,
        username: params.username,
        plan: 'lifetime',
      },
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.description ?? body.error ?? 'Payment link creation failed');
  }

  return body;
}

async function fetchPaymentLink(paymentLinkId: string) {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID');
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are missing');
  }

  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch(`https://api.razorpay.com/v1/payment_links/${paymentLinkId}`, {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.description ?? body.error ?? 'Unable to fetch payment link');
  }

  return body;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const authUser = await verifyFirebaseToken(token);
    const body = await req.json();
    const action = normalizeText(body.action);

    if (action === 'create_payment_link') {
      const username = buildUsername(authUser.email, normalizeText(body.username) || authUser.name);
      const paymentLink = await createPaymentLink({
        uid: authUser.uid,
        email: normalizeText(body.email) || authUser.email,
        username,
      });

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabaseAdmin.from('payment_transactions').insert({
        user_id: authUser.uid,
        txnid: paymentLink.id,
        amount: LIFETIME_AMOUNT_INR,
        status: 'payment_link_created',
        provider_reference_id: paymentLink.id,
        raw_response: paymentLink,
      }).catch(() => {});

      return jsonResponse({
        success: true,
        payment_link_id: paymentLink.id,
        short_url: paymentLink.short_url,
        amount: LIFETIME_AMOUNT_INR,
      });
    }

    if (action === 'confirm_payment') {
      const paymentLinkId = normalizeText(body.payment_link_id);
      if (!paymentLinkId) {
        throw new Error('payment_link_id is required');
      }

      const paymentLink = await fetchPaymentLink(paymentLinkId);
      const linkNotes = paymentLink.notes ?? {};
      const noteUid = normalizeText(linkNotes.uid) || authUser.uid;
      const noteEmail = normalizeText(linkNotes.email) || authUser.email;
      const noteUsername = normalizeText(linkNotes.username) || buildUsername(noteEmail, authUser.name);

      if (paymentLink.status !== 'paid') {
        return jsonResponse({ success: false, status: paymentLink.status }, 409);
      }

      await updateSupabaseProfile({
        uid: noteUid,
        email: noteEmail,
        username: noteUsername,
        paymentLinkId,
      });

      await syncFirestoreProfile(token, {
        userId: noteUid,
        email: noteEmail,
        username: noteUsername,
        isPremium: true,
        planType: 'lifetime',
        premiumAmount: LIFETIME_AMOUNT_INR,
        premiumPaymentLinkId: paymentLinkId,
      });

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabaseAdmin.from('payment_transactions').update({
        status: 'premium_activated',
        provider_reference_id: paymentLinkId,
      }).eq('txnid', paymentLinkId).catch(() => {});

      return jsonResponse({ success: true, isPremium: true, planType: 'lifetime' });
    }

    throw new Error('Unsupported action');
  } catch (error: any) {
    console.error('[lifetime-premium]', error);
    return jsonResponse({ error: error.message }, 400);
  }
});