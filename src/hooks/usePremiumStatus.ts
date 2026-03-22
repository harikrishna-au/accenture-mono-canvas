
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";

export function usePremiumStatus() {
    const { user, isLoaded } = useUser();
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;

        if (!user) {
            setIsPremium(false);
            setLoading(false);
            return;
        }

        async function checkPremium() {
            await user!.reload();

            const meta = user!.publicMetadata as {
                isPremium?: boolean;
                planType?: 'lifetime' | 'monthly';
                premiumExpiry?: string | null;
            };

            if (meta?.isPremium) {
                // Monthly subscribers: validate expiry
                if (meta.planType === 'monthly' && meta.premiumExpiry) {
                    const expired = new Date(meta.premiumExpiry) < new Date();
                    if (!expired) {
                        console.log('[PremiumStatus] active monthly subscriber via Clerk');
                        setIsPremium(true);
                        setLoading(false);
                        return;
                    }
                    // Expiry passed — fall through to Supabase check (webhook may have renewed)
                    console.log('[PremiumStatus] monthly expiry in Clerk looks stale, checking Supabase');
                } else {
                    // lifetime plan or no expiry — always premium
                    console.log('[PremiumStatus] lifetime premium via Clerk');
                    setIsPremium(true);
                    setLoading(false);
                    return;
                }
            }

            // Fallback: check Supabase (handles webhook renewals not yet synced to Clerk)
            const { data } = await supabase
                .from('profiles')
                .select('is_premium, plan_type, premium_expires_at')
                .eq('user_id', user!.id)
                .maybeSingle();

            if (data?.is_premium) {
                if (data.plan_type === 'monthly' && data.premium_expires_at) {
                    const expired = new Date(data.premium_expires_at) < new Date();
                    if (expired) {
                        console.log('[PremiumStatus] monthly subscription expired');
                        setIsPremium(false);
                        setLoading(false);
                        return;
                    }
                }
                console.log('[PremiumStatus] premium via Supabase fallback — syncing to Clerk');
                setIsPremium(true);
                // Auto-heal: sync back to Clerk
                await supabase.functions.invoke('sync-premium-to-clerk', {
                    body: { clerk_user_id: user!.id },
                }).catch(() => {});
            } else {
                console.log('[PremiumStatus] not premium');
            }

            setLoading(false);
        }

        checkPremium();
    }, [user, isLoaded]);

    return { isPremium, loading };
}
