
import { useUser } from "@clerk/clerk-react";

export function usePremiumStatus() {
    const { user, isLoaded } = useUser();

    const isPremium = !!(user?.publicMetadata?.isPremium);

    return { isPremium, loading: !isLoaded };
}
