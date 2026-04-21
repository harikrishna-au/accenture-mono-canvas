import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

interface PrivateRouteProps {
    children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
    const { isSignedIn, isLoaded } = useUser();

    if (!isLoaded) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-neutral-50">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    if (!isSignedIn) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
