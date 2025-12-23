import { useNavigate, Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

interface PremiumRouteProps {
    children: React.ReactNode;
}

const PremiumRoute = ({ children }: PremiumRouteProps) => {
    const { isSignedIn, isLoaded: isUserLoaded } = useUser();
    const { isPremium, loading: isPremiumLoading } = usePremiumStatus();
    const navigate = useNavigate();

    useEffect(() => {
        if (isUserLoaded && !isSignedIn) {
            toast.error("Please sign in to access this feature.");
        } else if (isUserLoaded && isSignedIn && !isPremiumLoading && !isPremium) {
            toast.error("This feature requires a Premium subscription.");
        }
    }, [isUserLoaded, isSignedIn, isPremiumLoading, isPremium]);

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
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default PremiumRoute;
