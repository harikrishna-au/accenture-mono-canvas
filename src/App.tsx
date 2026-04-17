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
import { CommunicationRoundsP2 } from "./pages/communication-rounds-p2";
import { CommunicationPatternsPage } from "@/components/dashboard/CommunicationPatternsPage";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import AboutUs from "./pages/AboutUs";
import CouponDashboard from "./pages/CouponDashboard";
import AIInterview from "./pages/AIInterview";
import AIInterviewSelection from "./pages/AIInterviewSelection";
import PremiumRoute from "@/components/PremiumRoute";
import ConnectPage from "./pages/ConnectPage";
import PlacedGuruPage from "./pages/PlacedGuruPage";
import GoogleOAuthCallback from "./pages/GoogleOAuthCallback";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogWrite from "./pages/BlogWrite";
import BlogMyPosts from "./pages/BlogMyPosts";
import BlogAdmin from "./pages/BlogAdmin";
import HackWithInfyLanding from "./pages/hackwithinfy/HackWithInfyLanding";
import HackWithInfySyllabus from "./pages/hackwithinfy/HackWithInfySyllabus";
import HackWithInfyResources from "./pages/hackwithinfy/HackWithInfyResources";
import HackWithInfyTips from "./pages/hackwithinfy/HackWithInfyTips";
import HackWithInfyPreviousYears from "./pages/hackwithinfy/HackWithInfyPreviousYears";
import ForgePage from "./pages/ForgePage";
import ForgeProfilePage from "./pages/ForgeProfilePage";

import GeoSudo from "./pages/GeoSudo";
import GridChallenge from "./pages/GridChallenge";
import MotionChallenge from "./pages/MotionChallenge";
import SwitchChallenge from "./pages/SwitchChallenge";
import DigitChallenge from "./pages/DigitChallenge";
import BARTGame from "./pages/BARTGame";

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
      signInUrl="/"
      signUpUrl="/"
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
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/:companyId" element={<Dashboard />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/coupon-stats" element={<CouponDashboard />} />
              <Route path="/ai-interview" element={<AIInterviewSelection />} />
              <Route path="/ai-interview/:type" element={<AIInterview />} />
              <Route path="/connect" element={<ConnectPage />} />
              <Route path="/connect/:expertId" element={<ConnectPage />} />
              <Route path="/placed-guru" element={<PlacedGuruPage />} />
              <Route path="/oauth/google/callback" element={<GoogleOAuthCallback />} />

              {/* Matrix Flow Game */}
              <Route path="/game/matrix" element={<Guidelines />} />
              <Route path="/game/matrix/play" element={<FindMin />} />

              {/* Balloon Math Game */}
              <Route path="/game/balloon" element={<BalloonMathGame />} />

              {/* Hidden Maze Game */}
              <Route path="/game/hidden-maze" element={<HiddenMaze />} />

              {/* Assessment Games */}
              <Route path="/game/geo-sudo" element={<GeoSudo />} />
              <Route path="/game/grid-challenge" element={<GridChallenge />} />
              <Route path="/game/motion" element={<MotionChallenge />} />
              <Route path="/game/switch" element={<SwitchChallenge />} />
              <Route path="/game/digit" element={<DigitChallenge />} />
              <Route path="/game/bart" element={<BARTGame />} />

              {/* Communication Pattern Selector */}
              <Route
                path="/game/communication-patterns"
                element={<CommunicationPatternsPage />}
              />

              {/* Communication Game - Pattern 1 */}
              <Route
                path="/game/communication"
                element={
                  <PremiumRoute>
                    <CommunicationRounds />
                  </PremiumRoute>
                }
              />

              {/* Communication Game - Pattern 2 */}
              <Route
                path="/game/communication-p2"
                element={
                  <PremiumRoute>
                    <CommunicationRoundsP2 />
                  </PremiumRoute>
                }
              />

              {/* Blog */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/write" element={<BlogWrite />} />
              <Route path="/blog/my" element={<BlogMyPosts />} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              {/* HackWithInfy */}
              <Route path="/hackwithinfy" element={<HackWithInfyLanding />} />
              <Route path="/hackwithinfy/syllabus" element={<HackWithInfySyllabus />} />
              <Route path="/hackwithinfy/resources" element={<HackWithInfyResources />} />
              <Route path="/hackwithinfy/tips" element={<HackWithInfyTips />} />
              <Route path="/hackwithinfy/previous-years" element={<HackWithInfyPreviousYears />} />

              {/* Admin */}
              <Route path="/admin/blog" element={<BlogAdmin />} />

              {/* Forge - Resume Builder */}
              <Route path="/forge" element={<ForgePage />} />
              <Route path="/forge/profile" element={<ForgeProfilePage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default App;
