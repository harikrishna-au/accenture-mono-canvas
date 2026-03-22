
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

            const meta = user!.publicMetadata as { isPremium?: boolean };

            if (meta?.isPremium) {
                setIsPremium(true);
                setLoading(false);
                return;
            }

            // Fallback: check Supabase (handles cases not yet synced to Clerk)
            const { data } = await supabase
                .from('profiles')
                .select('is_premium')
                .eq('user_id', user!.id)
                .maybeSingle();

            if (data?.is_premium) {
                setIsPremium(true);
                // Auto-heal: sync back to Clerk
                await supabase.functions.invoke('sync-premium-to-clerk', {
                    body: { clerk_user_id: user!.id },
                }).catch(() => {});
            }

            setLoading(false);
        }

        checkPremium();
    }, [user, isLoaded]);

    return { isPremium, loading };
}
