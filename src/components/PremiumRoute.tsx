import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { Loader2 } from "lucide-react";
import PaymentPopup from "@/components/PaymentPopup";

interface PremiumRouteProps {
    children: React.ReactNode;
}

const PremiumRoute = ({ children }: PremiumRouteProps) => {
    const { isSignedIn, isLoaded: isUserLoaded } = useUser();
    const { isPremium, loading: isPremiumLoading } = usePremiumStatus();
    const [popupClosed, setPopupClosed] = useState(false);

    if (!isUserLoaded || isPremiumLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-neutral-50">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    if (!isSignedIn) {
        return <Navigate to="/auth" replace />;
    }

    if (!isPremium) {
        // If user closed the popup, send them back to dashboard
        if (popupClosed) {
            return <Navigate to="/dashboard" replace />;
        }

        return (
            <PaymentPopup
                isOpen={true}
                onClose={() => setPopupClosed(true)}
            />
        );
    }

    return <>{children}</>;
};

export default PremiumRoute;
