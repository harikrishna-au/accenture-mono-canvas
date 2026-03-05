import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/clerk-react";
import { Lock, Crown, ClipboardList, Users, Linkedin, Bot, ArrowLeft, MessageCircle } from "lucide-react";
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
import { CompanySelection } from "@/components/dashboard/CompanySelection";
import { TestimonialScroller } from "@/components/dashboard/TestimonialScroller";
import { CognitiveGamesPage } from "@/components/dashboard/CognitiveGamesPage";
import PaymentPopup from "@/components/PaymentPopup";

import { useSearchParams, useParams, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"recruitment" | "platform">("recruitment");
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

  const companyName = companyId ? companyId.charAt(0).toUpperCase() + companyId.slice(1) : 'Assessment';

  const accentureGames = [
    { id: 1, name: "Matrix Flow", path: "/game/matrix", premiumBottomBarText: "EXTRA LEVELS with Premium" },
    { id: 2, name: "Balloon Math", path: "/game/balloon" },
    { id: 3, name: "Hidden Maze", path: "/game/hidden-maze", premiumBottomBarText: "EXTRA LEVELS with Premium" },
    {
      id: 4,
      name: "Communication Round",
      path: "/game/communication-patterns",
      // Navigates to pattern selector page first
      disabled: false,
      premiumBottomBarText: "UNLOCK WITH PREMIUM"
    },
    {
      id: 5,
      name: "Connect with me",
      subtitle: `${companyName} Interview Guidance – Paid 1-on-1 Session`,
      path: "https://topmate.io/hari_krishna_nallana/",
      isExternal: true,
      typingHighlight: true,
      typingText: "BOOK 1:1 SESSION"
    },
    {
      id: 10,
      name: "AI Interview",
      path: "/ai-interview",
      icon: <Bot className="w-8 h-8" />
    },
    {
      id: 7,
      name: isPremium ? "Premium Active" : "Unlock All Levels",
      subtitle: isPremium ? "" : "Extra Levels : Communication Round",
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
    { id: 6, name: `${companyName} Resources`, path: "https://drive.google.com/drive/folders/1wepyyapyvzyUR9T26CZJjQE-fGesd3A3?usp=sharing", isExternal: true },
    {
      id: 11,
      name: `${companyName} Community`,
      subtitle: "Join the WhatsApp Group",
      path: "https://chat.whatsapp.com/CBORD8aR3x91d5rmwo87de",
      isExternal: true,
      icon: <div className="p-2 bg-green-100 rounded-full"><MessageCircle className="w-6 h-6 text-green-600" /></div>
    },
    { id: 12, name: "", path: "" },
  ];

  const cognizantGames = [
    // You can add different games/endpoints here for Cognizant
    {
      id: 5,
      name: "Connect with me",
      subtitle: `${companyName} Interview Guidance – Paid 1-on-1 Session`,
      path: "https://topmate.io/hari_krishna_nallana/",
      isExternal: true,
      typingHighlight: true,
      typingText: "BOOK 1:1 SESSION"
    },
    {
      id: 9,
      name: "LinkedIn Profile",
      subtitle: "Connect with me on LinkedIn",
      path: "https://www.linkedin.com/in/hari-krishna-nallana-33949b277/",
      isExternal: true,
      icon: <div className="p-2 bg-blue-100 rounded-full"><Linkedin className="w-6 h-6 text-blue-600" /></div>
    },
  ];

  const games = companyId === 'cognizant' ? cognizantGames : accentureGames;

  return (
    <div className={`min-h-screen w-full flex flex-col items-center font-sans selection:bg-secondary/20 selection:text-secondary-foreground ${companyId ? 'overflow-y-auto' : 'overflow-y-auto'}`}>
      <SEO
        title="Harry The Blaze | Dashboard"
        description="Your central hub for MNC cognitive practice. Track progress, access games, and sharpen your skills for top company assessments."
      />
      {/* Japandi / Zen Sanctuary Background */}
      {/* Japandi / Zen Sanctuary Background */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[#fcfcf9] overflow-hidden">
        {/* Subtle Gradient - Barely there */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-stone-50 to-transparent opacity-60"></div>
      </div>

      {!companyId && (
        <div className={`w-full flex flex-col items-center transition-all duration-700 z-50 ${isFooterHovered ? 'blur-sm scale-[0.98] opacity-80' : ''}`}>
          {/* Header - Transparent/Minimal */}
          <Header onStartTour={() => setShowTour(true)} />
        </div>
      )}

      <CompletionPopup />
      <SupportPopup isOpen={showSupportPopup} onClose={() => setShowSupportPopup(false)} />
      <FeedbackPopup
        isOpen={showFeedbackPopup}
        onClose={() => setShowFeedbackPopup(false)}
        feedbackType={feedbackType}
      />
      <PaymentPopup isOpen={showPaymentPopup} onClose={() => setShowPaymentPopup(false)} />
      <OnboardingTour
        isOpen={showTour}
        onClose={handleTourClose}
        mode={companyId ? 'journey' : 'landing'}
      />

      <div className={`relative z-10 flex-1 flex flex-col items-center w-full transition-all duration-500 ${companyId ? 'justify-start pt-16 p-3 sm:p-4' : 'p-3 sm:p-4 pt-16 md:p-8'} ${isFooterHovered ? 'blur-sm scale-[0.98] opacity-80' : ''}`}>
        <SignedIn>
          <div className={`flex flex-col items-center w-full max-w-6xl flex-1 ${companyId ? 'justify-start' : 'min-h-[60vh] justify-start'}`}>

            {/* Conditional Views */}
            {!companyId ? (
              // VIEW 1: Company Selection
              <CompanySelection
                onSelectCompany={(id) => navigate(`/dashboard/${id}`)}
                onFeedbackClick={() => {
                  setFeedbackType('recruitment');
                  setShowFeedbackPopup(true);
                }}
                onSupportClick={() => setShowSupportPopup(true)}
              />
            ) : (
              // VIEW 2: Cognitive Games
              <CognitiveGamesPage isPremium={isPremium} onSubscribe={handleSubscribe} />
            )}

          </div>
        </SignedIn>

        <SignedOut>
          <div className="text-center mt-20">
            <h2 className="text-2xl font-bold mb-4 font-['Merriweather'] text-stone-700">Please sign in to continue</h2>
            <SignInButton mode="modal">
              <OutlineButton variant="large">
                SIGN IN
              </OutlineButton>
            </SignInButton>
          </div>
        </SignedOut>
      </div>

      {!companyId && <TestimonialScroller />}

      {!companyId && (
        <DashboardFooter
          onFeedbackClick={() => {
            setFeedbackType('platform');
            setShowFeedbackPopup(true);
          }}
          onSupportClick={() => setShowSupportPopup(true)}
          onMouseEnter={() => setIsFooterHovered(true)}
          onMouseLeave={() => setIsFooterHovered(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
