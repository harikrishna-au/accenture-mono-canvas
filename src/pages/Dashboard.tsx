
import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/clerk-react";
import { Lock, Crown, ClipboardList, Users, Linkedin } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import OutlineButton from "@/components/OutlineButton";
import CompletionPopup from "@/components/CompletionPopup";
import FeedbackPopup from "@/components/FeedbackPopup";
import Header from "@/components/Header";
import SupportPopup from "@/components/SupportPopup";
import SEO from "@/components/SEO";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { toast } from "sonner";
import { OnboardingTour } from "@/components/OnboardingTour";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { GameCard } from "@/components/dashboard/GameCard";
import PaymentPopup from "@/components/PaymentPopup";

import { useSearchParams } from "react-router-dom";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const { isSignedIn } = useAuth();
  // useRazorpay removed to force popup flow
  const [isFooterHovered, setIsFooterHovered] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Capture Referral Code
  useEffect(() => {
    const referralCode = searchParams.get("referral") || searchParams.get("refferal"); // Handle typo
    if (referralCode) {
      localStorage.setItem("referral_coupon", referralCode);
      localStorage.setItem("auto_open_payment", "true");
      // Optional: Clear param from URL? Maybe not needed for now.
    }
  }, [searchParams]);

  // Function to trigger feedback popup check
  const triggerFeedbackCheck = () => {
    const hasSeenFeedback = localStorage.getItem('has_seen_feedback_v1');
    if (!hasSeenFeedback && !premiumLoading && isSignedIn) {
      setTimeout(() => {
        setShowFeedbackPopup(true);
        localStorage.setItem('has_seen_feedback_v1', 'true');
      }, 2000);
    }
  };

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('has_seen_tour_v1');
    if (!hasSeenTour) {
      setTimeout(() => setShowTour(true), 1000);
      // Feedback will be triggered after tour closes
    } else {
      // Tour already seen, safe to trigger feedback check directly
      triggerFeedbackCheck();
    }
  }, [premiumLoading, isSignedIn]);

  const handleTourClose = () => {
    setShowTour(false);
    // Trigger feedback check when tour is closed
    triggerFeedbackCheck();
  };

  // Handle Auto-Open Payment (Referral Flow)
  useEffect(() => {
    const shouldAutoOpen = localStorage.getItem("auto_open_payment");
    if (shouldAutoOpen && isSignedIn && !isPremium) {
      // Delay to let dashboard animations finish
      const timer = setTimeout(() => {
        setShowPaymentPopup(true);
        localStorage.removeItem("auto_open_payment");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, isPremium]);

  const handleSubscribe = async () => {
    if (isPremium) {
      toast.success("You are already a Premium member!");
      return;
    }
    setShowPaymentPopup(true);
  };

  const games = [
    { id: 1, name: "Matrix Flow", path: "/game/matrix", premiumBottomBarText: "EXTRA LEVELS with Premium" },
    { id: 2, name: "Balloon Math", path: "/game/balloon" },
    { id: 3, name: "Hidden Maze", path: "/game/hidden-maze", premiumBottomBarText: "EXTRA LEVELS with Premium" },
    {
      id: 4,
      name: "Communication Round",
      path: "/game/communication",
      // Removed isReleased check; effectively enabled (free trial)
      disabled: false,
      premiumBottomBarText: "UNLOCK WITH PREMIUM"
    },
    {
      id: 5,
      name: "Connect with me",
      subtitle: "Accenture Interview Guidance – Paid 1-on-1 Session",
      path: "https://topmate.io/hari_krishna_nallana/",
      isExternal: true,
      typingHighlight: true,
      typingText: "BOOK 1:1 SESSION"
    },
    { id: 6, name: "Accenture Resources", path: "https://drive.google.com/drive/folders/1wepyyapyvzyUR9T26CZJjQE-fGesd3A3?usp=sharing", isExternal: true },
    {
      id: 7,
      name: isPremium ? "Premium Active" : "Unlock All Levels",
      subtitle: isPremium ? "" : "Early Access: Communication Round",
      path: "#subscribe",
      special: true,
      icon: isPremium ? <Crown className="w-8 h-8 text-amber-400 fill-amber-400/20" /> : <Lock className="w-8 h-8 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
    },
    {
      id: 8,
      name: "Take Survey",
      path: "#survey",
      special: true,
      survey: true,
      icon: <ClipboardList className="w-8 h-8 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
    },
    {
      id: 9,
      name: "LinkedIn Profile",
      subtitle: "Connect with me on LinkedIn",
      path: "https://www.linkedin.com/in/hari-krishna-nallana-33949b277/",
      isExternal: true,
      icon: <div className="p-2 bg-blue-100 rounded-full"><Linkedin className="w-6 h-6 text-blue-600" /></div>
    },
    { id: 10, name: "", path: "" },
    { id: 11, name: "", path: "" },
    { id: 12, name: "", path: "" },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-neutral-50 overflow-y-auto font-sans selection:bg-red-100 selection:text-red-900">
      <SEO
        title="Harry The Blaze | Dashboard"
        description="Your central hub for Accenture practice rounds. Track progress, access new games, and prepare for success with Harry the Blaze."
      />
      {/* Premium Background Layer */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-neutral-50">
        <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-100/40 to-blue-100/40 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tl from-red-100/40 to-orange-100/40 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      </div>

      <div className={`w-full flex flex-col items-center transition-all duration-500 z-50 ${isFooterHovered ? 'blur-sm scale-[0.98] opacity-80' : ''}`}>
        <Header onStartTour={() => setShowTour(true)} />
      </div>
      <CompletionPopup />
      <SupportPopup isOpen={showSupportPopup} onClose={() => setShowSupportPopup(false)} />
      <FeedbackPopup isOpen={showFeedbackPopup} onClose={() => setShowFeedbackPopup(false)} />
      <PaymentPopup isOpen={showPaymentPopup} onClose={() => setShowPaymentPopup(false)} />
      <OnboardingTour isOpen={showTour} onClose={handleTourClose} />

      <div className={`relative z-10 flex-1 flex flex-col items-center w-full p-4 pt-20 md:p-8 transition-all duration-500 ${isFooterHovered ? 'blur-sm scale-[0.98] opacity-80' : ''}`}>
        <SignedIn>
          <div className="flex flex-col items-center w-full max-w-5xl flex-1">
            <DashboardHero isPremium={isPremium} />

            <div className="w-full mb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Technical Round Group */}
                <div id="onboarding-tr-group" style={{ display: 'contents' }}>
                  {games.slice(0, 3).map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isPremium={isPremium}
                      onSubscribe={handleSubscribe}
                      onFeedback={() => setShowFeedbackPopup(true)}
                    />
                  ))}
                </div>

                {/* Remaining Games */}
                {games.slice(3).map((game) => (
                  <GameCard
                    key={game.id}
                    id={
                      game.name === "Communication Round" ? "onboarding-comm-card" :
                        (game.name === "Unlock All Levels" || game.name === "Premium Active") ? "onboarding-premium-card" :
                          undefined
                    }
                    game={game}
                    isPremium={isPremium}
                    onSubscribe={handleSubscribe}
                    onFeedback={() => setShowFeedbackPopup(true)}
                  />
                ))}
              </div>
            </div>
          </div>
        </SignedIn>

        <SignedOut>
          <div className="text-center mt-20">
            <h2 className="text-2xl font-bold mb-4">Please sign in to continue</h2>
            <SignInButton mode="modal">
              <OutlineButton variant="large">
                SIGN IN
              </OutlineButton>
            </SignInButton>
          </div>
        </SignedOut>
      </div>

      <DashboardFooter
        onFeedbackClick={() => setShowFeedbackPopup(true)}
        onSupportClick={() => setShowSupportPopup(true)}
        onMouseEnter={() => setIsFooterHovered(true)}
        onMouseLeave={() => setIsFooterHovered(false)}
      />
    </div>
  );
};

export default Dashboard;
