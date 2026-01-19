import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import Landing from "./pages/Landing";
import Guidelines from "./pages/Guidelines";
import Dashboard from "./pages/Dashboard";
import FindMin from "./pages/findmin";
import BalloonMathGame from "./pages/BalloonMath";
import HiddenMaze from "./pages/HiddenMaze";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { CommunicationRounds } from "./pages/communication-rounds";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import AboutUs from "./pages/AboutUs";
import CouponDashboard from "./pages/CouponDashboard";
import AIInterview from "./pages/AIInterview";
import PremiumRoute from "@/components/PremiumRoute";

import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";

const queryClient = new QueryClient();
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash if not already shown in this session
    return !sessionStorage.getItem('hasShownSplash');
  });

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasShownSplash', 'true');
  };

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={{
        baseTheme: undefined,
        variables: { colorPrimary: '#000000' }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/coupon-stats" element={<CouponDashboard />} />
              <Route path="/ai-interview" element={<AIInterview />} />

              {/* Matrix Flow Game */}
              <Route path="/game/matrix" element={<Guidelines />} />
              <Route path="/game/matrix/play" element={<FindMin />} />

              {/* Balloon Math Game */}
              <Route path="/game/balloon" element={<BalloonMathGame />} />

              {/* Hidden Maze Game */}
              <Route path="/game/hidden-maze" element={<HiddenMaze />} />

              {/* Communication Game - Refactored */}
              <Route
                path="/game/communication"
                element={
                  <PremiumRoute>
                    <CommunicationRounds />
                  </PremiumRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default App;
