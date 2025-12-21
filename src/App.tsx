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
import CommunicationGame from "./pages/CommunicationGame";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import MobileRestriction from "@/components/MobileRestriction";

import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";

const queryClient = new QueryClient();
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

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
          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
          <MobileRestriction />
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

              {/* Matrix Flow Game */}
              <Route path="/game/matrix" element={<Guidelines />} />
              <Route path="/game/matrix/play" element={<FindMin />} />

              {/* Balloon Math Game */}
              <Route path="/game/balloon" element={<BalloonMathGame />} />

              {/* Hidden Maze Game */}
              <Route path="/game/hidden-maze" element={<HiddenMaze />} />

              {/* Communication Game */}
              <Route path="/game/communication" element={<CommunicationGame />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default App;
