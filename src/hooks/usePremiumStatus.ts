
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const isNetworkError = (msg?: string) =>
    !msg || msg.includes('fetch') || msg.includes('NetworkError') || msg.includes('network') || msg.includes('timeout');

function getCached(userId: string): boolean | null {
    try {
        const raw = localStorage.getItem(`premium_${userId}`);
        if (!raw) return null;
        const { value, ts } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL_MS) return null;
        return value;
    } catch {
        return null;
    }
}

function setCache(userId: string, value: boolean) {
    try {
        localStorage.setItem(`premium_${userId}`, JSON.stringify({ value, ts: Date.now() }));
    } catch {}
}

export function usePremiumStatus() {
    const { user, isLoaded } = useUser();
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !user) {
            setLoading(false);
            return;
        }

        // Use cached value immediately so UI doesn't block
        const cached = getCached(user.id);
        if (cached !== null) {
            setIsPremium(cached);
            setLoading(false);
        }

        async function checkPremium() {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_premium')
                    .eq('user_id', user!.id)
                    .maybeSingle();

                if (error) {
                    if (!isNetworkError(error.message)) {
                        console.error("Error fetching premium status:", error);
                    }
                    return;
                }

                const value = data?.is_premium ?? false;
                setIsPremium(value);
                setCache(user!.id, value);
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
