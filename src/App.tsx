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
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
import CodingQuestionsPage from "./pages/coding-questions/CodingQuestionsPage";
import PrivateRoute from "@/components/PrivateRoute";
import RadarPage from "./pages/RadarPage";
import GeoSudo from "./pages/GeoSudo";
import GridChallenge from "./pages/GridChallenge";
import MotionChallenge from "./pages/MotionChallenge";
import SwitchChallenge from "./pages/SwitchChallenge";
import DigitChallenge from "./pages/DigitChallenge";
import BARTGame from "./pages/BARTGame";
import SwithChallenge from "./pages/SwithChallenge";
import InductiveChallenge from "./pages/InductiveChallenge";
import DualTaskChallenge from "./pages/DualTaskChallenge";

import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import CustomerSupport from "@/components/CustomerSupport";

const queryClient = new QueryClient();
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Reword Clerk's default auth errors so users immediately know to switch
// between Sign In and Sign Up instead of getting stuck.
const clerkLocalization = {
  unstable__errors: {
    form_identifier_not_found:
      "No account found with this email. Tap “Sign Up — I'm new here” above to create one.",
    form_identifier_exists:
      "This email is already registered. Tap “Sign In — I have an account” above to log in.",
    form_password_incorrect:
      "Incorrect password. Try again, or use “Forgot password?” to reset it.",
  },
};

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
      localization={clerkLocalization}
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
          <CustomerSupport />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/dashboard/:companyId" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/coupon-stats" element={<PrivateRoute><CouponDashboard /></PrivateRoute>} />
              <Route path="/ai-interview" element={<PremiumRoute><AIInterviewSelection /></PremiumRoute>} />
              <Route path="/ai-interview/:type" element={<PremiumRoute><AIInterview /></PremiumRoute>} />
              <Route path="/forge" element={<PremiumRoute><ForgePage /></PremiumRoute>} />
              <Route path="/forge/profile" element={<PremiumRoute><ForgeProfilePage /></PremiumRoute>} />
              <Route path="/radar" element={<PremiumRoute><RadarPage /></PremiumRoute>} />
              <Route path="/connect" element={<PrivateRoute><ConnectPage /></PrivateRoute>} />
              <Route path="/connect/:expertId" element={<PrivateRoute><ConnectPage /></PrivateRoute>} />
              <Route path="/placed-guru" element={<PrivateRoute><PlacedGuruPage /></PrivateRoute>} />
              <Route path="/oauth/google/callback" element={<GoogleOAuthCallback />} />

              {/* Matrix Flow Game */}
              <Route path="/game/matrix" element={<PrivateRoute><Guidelines /></PrivateRoute>} />
              <Route path="/game/matrix/play" element={<PrivateRoute><FindMin /></PrivateRoute>} />

              {/* Balloon Math Game */}
              <Route path="/game/balloon" element={<PrivateRoute><BalloonMathGame /></PrivateRoute>} />

              {/* Hidden Maze Game */}
              <Route path="/game/hidden-maze" element={<PrivateRoute><HiddenMaze /></PrivateRoute>} />

              {/* Assessment Games */}
              <Route path="/game/geo-sudo" element={<PrivateRoute><GeoSudo /></PrivateRoute>} />
              <Route path="/game/grid-challenge" element={<PrivateRoute><GridChallenge /></PrivateRoute>} />
              <Route path="/game/motion" element={<PrivateRoute><MotionChallenge /></PrivateRoute>} />
              <Route path="/game/switch" element={<PrivateRoute><SwitchChallenge /></PrivateRoute>} />
              <Route path="/game/digit" element={<PrivateRoute><DigitChallenge /></PrivateRoute>} />
              <Route path="/game/bart" element={<PrivateRoute><BARTGame /></PrivateRoute>} />
              <Route path="/game/swith" element={<PrivateRoute><SwithChallenge /></PrivateRoute>} />
              <Route path="/game/inductive" element={<PrivateRoute><InductiveChallenge /></PrivateRoute>} />
              <Route path="/game/dual-task" element={<PrivateRoute><DualTaskChallenge /></PrivateRoute>} />

              {/* Communication Pattern Selector */}
              <Route
                path="/game/communication-patterns"
                element={<PrivateRoute><CommunicationPatternsPage /></PrivateRoute>}
              />

              {/* Communication Game - Pattern 1 */}
              <Route
                path="/game/communication"
                element={
                  <ErrorBoundary>
                    <PremiumRoute>
                      <CommunicationRounds />
                    </PremiumRoute>
                  </ErrorBoundary>
                }
              />

              {/* Communication Game - Pattern 2 */}
              <Route
                path="/game/communication-p2"
                element={
                  <ErrorBoundary>
                    <PremiumRoute>
                      <CommunicationRoundsP2 />
                    </PremiumRoute>
                  </ErrorBoundary>
                }
              />

              {/* Blog */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/write" element={<PrivateRoute><BlogWrite /></PrivateRoute>} />
              <Route path="/blog/my" element={<PrivateRoute><BlogMyPosts /></PrivateRoute>} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              {/* HackWithInfy — landing is public (teaser), resources are premium */}
              <Route path="/hackwithinfy" element={<PrivateRoute><HackWithInfyLanding /></PrivateRoute>} />
              <Route path="/hackwithinfy/syllabus" element={<PremiumRoute><HackWithInfySyllabus /></PremiumRoute>} />
              <Route path="/hackwithinfy/resources" element={<PremiumRoute><HackWithInfyResources /></PremiumRoute>} />
              <Route path="/hackwithinfy/tips" element={<PremiumRoute><HackWithInfyTips /></PremiumRoute>} />
              <Route path="/hackwithinfy/previous-years" element={<PremiumRoute><HackWithInfyPreviousYears /></PremiumRoute>} />

              {/* Coding Questions — Premium */}
              <Route path="/coding-questions" element={<PremiumRoute><CodingQuestionsPage /></PremiumRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<BlogAdmin />} />
              <Route path="/admin/blog" element={<BlogAdmin />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default App;
