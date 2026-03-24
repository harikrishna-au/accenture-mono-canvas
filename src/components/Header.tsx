import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

import { Maximize, Minimize, LogOut, HelpCircle, Sparkles, FileText, BookOpen } from "lucide-react";

import { useLocation } from "react-router-dom";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import PaymentPopup from "@/components/PaymentPopup";

interface HeaderProps {
  onStartTour?: () => void;
}

const Header = ({ onStartTour }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const showExit = location.pathname !== "/" && location.pathname !== "/dashboard";

  return (
    <>
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "rgba(252,252,249,0.94)"
          : "rgba(252,252,249,0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: scrolled
          ? "1px solid rgba(0,0,0,0.07)"
          : "1px solid transparent",
        boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.05)" : "none",
      }}
    >
      <div className="container mx-auto px-6 py-3.5 flex justify-between items-center">

        {/* ── Logo ── */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center group"
        >
          {/* Mobile: just the icon mark */}
          <img
            src="/favicon.svg"
            alt="Harry The Blaze"
            className="sm:hidden w-8 h-8 flex-shrink-0 transition-all duration-300 group-hover:scale-105"
            style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.22))" }}
          />
          {/* Desktop: full wordmark (icon + HARRY THE + BLAZE + tagline) */}
          <img
            src="/logo.svg"
            alt="Harry The Blaze"
            className="hidden sm:block h-10 w-auto flex-shrink-0 transition-all duration-300 group-hover:opacity-85"
          />
        </button>

        {/* ── Actions ── */}
        <div className="flex items-center gap-1.5">

          {/* Blog nav link */}
          <Link
            to="/blog"
            className="flex items-center gap-1.5 px-3.5 py-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl font-medium transition-all duration-200 text-[13px] font-['Inter']"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Blog</span>
          </Link>

          {onStartTour && (
            <button
              onClick={onStartTour}
              className="flex items-center gap-1.5 px-3.5 py-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl font-medium transition-all duration-200 text-[13px] font-['Inter']"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Tour</span>
            </button>
          )}

          {showExit && (
            <button
              onClick={() => {
                if (location.pathname === '/placed-guru') {
                  window.location.href = 'https://www.harrytheblaze.site/connect';
                } else if (location.pathname === '/connect' || location.pathname === '/ai-interview') {
                  navigate('/');
                } else {
                  navigate('/dashboard/Accenture');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-rose-600/80 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-medium transition-all duration-200 text-[13px] font-['Inter']"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all duration-200"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl={location.pathname}>
              <button
                className="ml-1 px-4 py-2 text-[13px] font-semibold font-['Inter'] text-white rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <button
              onClick={() => navigate("/forge/profile")}
              className="flex items-center gap-1.5 px-3.5 py-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl font-medium transition-all duration-200 text-[13px] font-['Inter']"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>

{!premiumLoading && (
              isPremium ? (
                /* ── Premium badge ── */
                <div
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    border: "1px solid #f59e0b",
                    boxShadow: "0 2px 10px rgba(245,158,11,0.25), inset 0 1px 0 rgba(255,255,255,0.5)",
                  }}
                >
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="text-[13px] font-bold font-['Inter'] text-amber-800 hidden sm:inline tracking-wide">
                    PREMIUM
                  </span>
                </div>
              ) : (
                /* ── Get Premium CTA ── */
                <button
                  onClick={() => setShowPayment(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[13px] font-['Inter'] text-white transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #1c1c1e 0%, #44403c 60%, #a16207 100%)",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="hidden sm:inline">Get Premium</span>
                  <span className="sm:hidden">Pro</span>
                </button>
              )
            )}
            {/* ── Avatar with golden ring for premium users ── */}
            <div
              className="ml-1.5 rounded-full p-[2px] transition-all duration-300"
              style={isPremium && !premiumLoading ? {
                background: "linear-gradient(135deg, #f59e0b, #fcd34d, #f59e0b)",
                boxShadow: "0 0 10px rgba(245,158,11,0.5)",
              } : {}}
            >
              <div className={isPremium && !premiumLoading ? "rounded-full overflow-hidden" : ""}>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </SignedIn>

        </div>
      </div>
    </header>

    <PaymentPopup isOpen={showPayment} onClose={() => setShowPayment(false)} />
    </>
  );
};

export default Header;
