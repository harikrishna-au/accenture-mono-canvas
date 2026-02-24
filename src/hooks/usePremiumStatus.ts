
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

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
            const MAX_RETRIES = 3;
            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('is_premium')
                        .eq('user_id', user!.id)
                        .maybeSingle();

                    if (error) {
                        // Network-level error — retry with backoff
                        if (error.message?.includes('Failed to fetch') && attempt < MAX_RETRIES - 1) {
                            await delay(1000 * Math.pow(2, attempt)); // 1s, 2s, 4s
                            continue;
                        }
                        console.error("Error fetching premium status:", error);
                    }

                    if (data?.is_premium) {
                        setIsPremium(true);
                    }
                    break; // success — exit retry loop
                } catch (e: any) {
                    if (e?.message?.includes('Failed to fetch') && attempt < MAX_RETRIES - 1) {
                        await delay(1000 * Math.pow(2, attempt));
                        continue;
                    }
                    console.error("Error fetching premium status:", e);
                    break;
                }
            }
            setLoading(false);
        }

        checkPremium();
    }, [user, isLoaded]);

    return { isPremium, loading };
}
