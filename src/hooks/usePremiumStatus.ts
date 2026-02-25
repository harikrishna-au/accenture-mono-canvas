
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

        // Fast path: Clerk metadata is already set
        if (user.publicMetadata?.isPremium) {
            console.log('[PremiumStatus] premium via Clerk metadata');
            setIsPremium(true);
            setLoading(false);
            return;
        }

        // Fallback: check Supabase for users who paid before Clerk sync was added
        async function checkSupabase() {
            const { data } = await supabase
                .from('profiles')
                .select('is_premium')
                .eq('user_id', user!.id)
                .maybeSingle();

            if (data?.is_premium) {
                console.log('[PremiumStatus] premium via Supabase fallback — syncing to Clerk');
                setIsPremium(true);
                // Auto-heal: sync to Clerk so future checks are instant
                await supabase.functions.invoke('sync-premium-to-clerk', {
                    body: { clerk_user_id: user!.id },
                }).catch(() => {}); // non-critical
            } else {
                console.log('[PremiumStatus] not premium (Clerk: false, Supabase: false)');
            }

            setLoading(false);
        }

        checkSupabase();
    }, [user, isLoaded]);

    return { isPremium, loading };
}
