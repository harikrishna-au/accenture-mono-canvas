#!/usr/bin/env node

/**
 * Syncs all premium users from Supabase → Clerk
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<your_key> node scripts/sync-premium-to-clerk.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ixgusnrurhurhpezhzem.supabase.co";
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!CLERK_SECRET_KEY) {
  console.error("ERROR: Missing CLERK_SECRET_KEY env variable");
  console.error("Run: CLERK_SECRET_KEY=<your_key> SUPABASE_SERVICE_ROLE_KEY=<your_key> node scripts/sync-premium-to-clerk.js");
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("ERROR: Missing SUPABASE_SERVICE_ROLE_KEY env variable");
  console.error("Run: CLERK_SECRET_KEY=<your_key> SUPABASE_SERVICE_ROLE_KEY=<your_key> node scripts/sync-premium-to-clerk.js");
  process.exit(1);
}

async function fetchPremiumUsersFromSupabase() {
  console.log("Fetching premium users from Supabase...");
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=user_id,email,is_premium&is_premium=eq.true`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }

  const users = await res.json();
  console.log(`Found ${users.length} premium users in Supabase`);
  return users;
}

async function setClerkPremium(clerkUserId, email) {
  const res = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ public_metadata: { isPremium: true } }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Clerk error ${res.status}: ${text}`);
  }

  return res.json();
}

async function main() {
  const premiumUsers = await fetchPremiumUsersFromSupabase();

  if (premiumUsers.length === 0) {
    console.log("No premium users found in Supabase. Nothing to sync.");
    return;
  }

  let success = 0;
  let failed = 0;

  for (const user of premiumUsers) {
    const { user_id, email } = user;
    try {
      await setClerkPremium(user_id, email);
      console.log(`✓ ${email || user_id}`);
      success++;
    } catch (err) {
      console.error(`✗ ${email || user_id} — ${err.message}`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\nDone! ${success} synced, ${failed} failed`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
