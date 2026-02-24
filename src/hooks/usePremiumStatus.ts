
import { useUser } from "@clerk/clerk-react";

export function usePremiumStatus() {
    const { user, isLoaded } = useUser();

    return {
        isPremium: (user?.publicMetadata?.isPremium as boolean) ?? false,
        loading: !isLoaded,
    };
}
