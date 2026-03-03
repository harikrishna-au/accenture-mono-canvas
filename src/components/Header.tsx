import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Maximize, Minimize, LogOut, HelpCircle, Zap } from "lucide-react";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  onStartTour?: () => void;
}

const Header = ({ onStartTour }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
          className="flex items-center gap-2.5 group"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3"
            style={{
              background: "linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="hidden sm:inline text-stone-800 text-[1.05rem] font-bold tracking-tight font-['Merriweather'] transition-colors duration-300 group-hover:text-stone-600">
            HARRY THE BLAZE
          </span>
        </button>

        {/* ── Actions ── */}
        <div className="flex items-center gap-1.5">

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
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all duration-200"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <SignedOut>
            <SignInButton mode="modal">
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
            <div className="ml-1">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

        </div>
      </div>
    </header>
  );
};

export default Header;
