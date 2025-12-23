import { useNavigate } from "react-router-dom";
import { XCircle, Lock, Unlock, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Youtube } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import OutlineButton from "@/components/OutlineButton";
import CompletionPopup from "@/components/CompletionPopup";
import qrCode from "@/lib/qr-code.png";
import FeedbackPopup from "@/components/FeedbackPopup";
import { Coffee, MessageSquare, ClipboardList } from "lucide-react";

import Header from "@/components/Header";
import SupportPopup from "@/components/SupportPopup";

import accentureLogo from "@/lib/accenture-svgrepo-com.svg";
import SEO from "@/components/SEO";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useRazorpay } from "@/hooks/useRazorpay";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const { initiatePayment, isLoading: paymentLoading } = useRazorpay();

  // Release Timer Logic
  const TARGET_DATE =
    new Date('2025-12-23T20:00:00+05:30').getTime() + (60 * 60 * 1000);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isReleased, setIsReleased] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const distance = TARGET_DATE - now;

      if (distance < 0) {
        setIsReleased(true);
        setTimeRemaining("00:00:00");
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      setIsReleased(false);
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-show feedback popup once
  useEffect(() => {
    const hasSeenFeedback = localStorage.getItem('has_seen_feedback_v1');
    if (!hasSeenFeedback && !premiumLoading) {
      const timer = setTimeout(() => {
        setShowFeedbackPopup(true);
        localStorage.setItem('has_seen_feedback_v1', 'true');
      }, 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [premiumLoading]);

  const handleSubscribe = async () => {
    if (isPremium) {
      toast.success("You are already a Premium member!");
      return;
    }
    await initiatePayment();
  };

  const games: { id: number; name: string; path: string; disabled?: boolean; isExternal?: boolean; subtitle?: string; special?: boolean; icon?: any; survey?: boolean }[] = [
    { id: 1, name: "Matrix Flow", path: "/game/matrix" },
    { id: 2, name: "Balloon Math", path: "/game/balloon" },
    { id: 3, name: "Hidden Maze", path: "/game/hidden-maze" },
    { id: 4, name: "Communication Round", path: "/game/communication", disabled: !isReleased || !isPremium, subtitle: !isPremium ? "Premium Only" : undefined, icon: !isPremium ? <Lock className="w-4 h-4" /> : undefined },
    { id: 5, name: "Connect with me", path: "https://topmate.io/hari_krishna_nallana/", isExternal: true },
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
    { id: 9, name: "", path: "" },
    { id: 10, name: "", path: "" },
    { id: 11, name: "", path: "" },
    { id: 12, name: "", path: "" },
  ];

  const [isFooterHovered, setIsFooterHovered] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-neutral-50 overflow-y-auto font-sans selection:bg-red-100 selection:text-red-900">
      <SEO
        title="Harry The Blaze | Dashboard"
        description="Your central hub for Accenture practice rounds. Track progress, access new games, and prepare for success with Harry the Blaze."
      />
      {/* Premium Background Layer */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-neutral-50">
        <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        {/* Left Side Decoration */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-100/40 to-blue-100/40 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        {/* Right Side Decoration */}
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tl from-red-100/40 to-orange-100/40 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      </div>

      <div className={`w-full flex flex-col items-center transition-all duration-500 z-50 ${isFooterHovered ? 'blur-sm scale-[0.98] opacity-80' : ''}`}>
        <Header />
      </div>
      <CompletionPopup />
      <SupportPopup isOpen={showSupportPopup} onClose={() => setShowSupportPopup(false)} />
      <FeedbackPopup isOpen={showFeedbackPopup} onClose={() => setShowFeedbackPopup(false)} />

      <div className={`relative z-10 flex-1 flex flex-col items-center w-full p-8 pt-20 transition-all duration-500 ${isFooterHovered ? 'blur-sm scale-[0.98] opacity-80' : ''}`}>
        <SignedIn>
          <div className="flex flex-col items-center w-full max-w-5xl flex-1">

            {/* Hero Section */}
            <div className="w-full mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left space-y-4 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium text-white/90 mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Building in Public
                </div>
                {isPremium && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/50 text-xs font-bold text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)] mb-2">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    PREMIUM MEMBER
                  </div>
                )}
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  Join the Journey
                </h1>
                <p className="text-lg text-neutral-300 max-w-xl">
                  {isPremium
                    ? "Thank you for being a Premium Member! You have unlimited access to all levels."
                    : "I'm building this platform from scratch. Watch the process, learn with me, and be a part of the story."}
                </p>
              </div>

              <a
                href="https://www.youtube.com/@HARIKRISHNA-AU"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-4 px-8 py-4 bg-white text-neutral-900 rounded-2xl font-bold hover:bg-neutral-100 transition-all hover:scale-105 active:scale-95 shadow-xl z-10"
              >
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md">
                  <Youtube className="w-6 h-6 fill-current" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Subscribe to</span>
                  <span className="text-xl font-black tracking-tight">@HARIKRISHNA-AU</span>
                </div>

                {/* Decorative glow behind button */}
                <div className="absolute inset-0 -z-10 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </a>

              {/* Background Decorations */}
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-red-600/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full mb-12">
              <div className="grid grid-cols-4 gap-4">
                {games.map((game) =>
                  <div
                    key={game.id}
                    className={`relative h-32 border-2 rounded-xl flex flex-col items-center justify-center p-4 overflow-hidden transition-all duration-300
                      ${game.name === "Connect with me"
                        ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 shadow-lg shadow-yellow-200/50 hover:shadow-yellow-300 hover:scale-105 hover:-translate-y-1 group"
                        : (game as any).special
                          ? (game as any).survey
                            ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/50 hover:scale-105 hover:-translate-y-1 cursor-pointer group"
                            : isPremium
                              ? "bg-gradient-to-br from-amber-900 to-amber-950 border-amber-700/50 shadow-xl shadow-amber-900/20 cursor-default"
                              : "bg-gradient-to-br from-violet-600 to-rose-600 border-transparent shadow-xl shadow-rose-500/30 hover:shadow-2xl hover:shadow-rose-500/50 hover:scale-105 hover:-translate-y-1 cursor-pointer group"
                          : game.name
                            ? "bg-white border-black hover:bg-black hover:text-white cursor-pointer group hover:scale-105"
                            : "bg-gray-50 border-black cursor-not-allowed"}
                      ${game.disabled ? "cursor-not-allowed opacity-60" : ""}
                    `}
                    onClick={() => {
                      if ((game as any).survey) {
                        setShowFeedbackPopup(true);
                        return;
                      }
                      if ((game as any).special && !isPremium) {
                        handleSubscribe();
                        return;
                      }
                      if (!game.disabled && game.path && !((game as any).special)) {
                        if ((game as any).isExternal) {
                          window.open(game.path, '_blank', 'noopener,noreferrer');
                        } else {
                          navigate(game.path);
                        }
                      }
                    }}
                  >
                    {game.name === "Connect with me" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:animate-shine pointer-events-none z-10" />
                    )}
                    {game.name ? (
                      <>
                        {game.name === "Connect with me" ? (
                          <div className="text-4xl mb-1 group-hover:scale-110 transition-transform">🤝</div>
                        ) : (game as any).special ? (
                          <div className="mb-1">{(game as any).icon}</div>
                        ) : (
                          <img
                            src={accentureLogo}
                            alt="Accenture"
                            className="absolute top-3 right-3 h-4 w-auto opacity-60 group-hover:invert group-hover:opacity-100 transition-all"
                          />
                        )}
                        <span className={`text-lg font-bold text-center leading-tight mt-2 ${game.name === "Connect with me" ? "text-yellow-900" : (game as any).special ? "text-white" : ""}`}>
                          {game.name}
                        </span>
                        {(game as any).subtitle && (
                          <span className="text-[10px] font-medium text-white/90 text-center uppercase tracking-wide mt-1 animate-pulse">
                            {(game as any).subtitle}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm font-medium text-neutral-400 text-center italic">
                        Coming Soon
                      </span>
                    )}
                    {game.disabled && !((game as any).special) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {game.name === "Communication Round" ? (
                          <div className="flex flex-col items-center gap-2 bg-black/60 backdrop-blur-sm w-full h-full justify-center transition-all animate-fade-in">
                            <span className="text-white/90 font-bold text-xs tracking-[0.2em] uppercase drop-shadow-md">Launching In</span>
                            <div className="text-3xl font-black text-white tabular-nums tracking-widest drop-shadow-xl font-mono">
                              {timeRemaining}
                            </div>
                          </div>
                        ) : (
                          <div className="relative pointer-events-none">
                            <div className="w-[600px] h-10 bg-red-600 transform -rotate-[25deg] origin-center shadow-2xl flex items-center justify-center border-y-2 border-red-400/50">
                              <span className="text-white font-bold text-sm tracking-[0.2em] drop-shadow-md">UNDER DEVELOPMENT</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
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

      {/* Footer */}
      <div
        className="w-full py-8 border-t border-neutral-100 flex flex-col items-center justify-center relative z-50 bg-white/80 backdrop-blur-md"
        onMouseEnter={() => setIsFooterHovered(true)}
        onMouseLeave={() => setIsFooterHovered(false)}
      >
        <div className="group relative flex flex-wrap justify-center items-center gap-4 bg-neutral-50 px-8 py-4 rounded-2xl border border-neutral-200 shadow-sm mx-4">
          <span className="font-bold text-neutral-900 text-lg mr-2">Enjoying the practice?</span>

          <button
            onClick={() => setShowFeedbackPopup(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-neutral-200 text-neutral-700 rounded-xl font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-all hover:scale-105 active:scale-95"
          >
            <MessageSquare className="w-5 h-5" />
            Feedback
          </button>

          <button
            onClick={() => setShowSupportPopup(true)}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-yellow-900 rounded-xl font-bold hover:bg-yellow-500 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <Coffee className="w-5 h-5" />
            Buy me a chai
          </button>

          <div className="absolute bottom-full left-0 right-0 mb-4 flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-out pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.1)] border border-neutral-100 flex items-center gap-1.5 whitespace-nowrap group-hover:shadow-[0_0_30px_rgba(255,50,50,0.3)] transition-shadow duration-700">
              <span className="text-neutral-400 font-medium text-sm">Designed and developed by</span>
              <span className="text-neutral-900 font-bold text-sm">Hari Krishna</span>
              <span className="text-neutral-400 font-medium text-sm">with</span>
              <span className="text-red-500 animate-pulse text-sm">❤️</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
