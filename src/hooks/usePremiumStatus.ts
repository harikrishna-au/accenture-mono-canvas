
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";

// Matches Chrome "Failed to fetch", Firefox "NetworkError when attempting to fetch resource", etc.
const isNetworkError = (msg?: string) =>
    !msg || msg.includes('fetch') || msg.includes('NetworkError') || msg.includes('network');

export function usePremiumStatus() {
    const { user, isLoaded } = useUser();
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !user) {
            setLoading(false);
            return;
        }

        async function checkPremium() {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_premium')
                    .eq('user_id', user!.id)
                    .maybeSingle();

                if (error && !isNetworkError(error.message)) {
                    console.error("Error fetching premium status:", error);
                }

                if (data?.is_premium) setIsPremium(true);
            } catch (e: any) {
                if (!isNetworkError(e?.message)) {
                    console.error("Error fetching premium status:", e);
                }
            } finally {
                setLoading(false);
            }
        }

        checkPremium();
    }, [user, isLoaded]);

    return { isPremium, loading };
}
