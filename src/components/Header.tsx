import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Maximize, Minimize, LogOut, HelpCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  onStartTour?: () => void;
}

const Header = ({ onStartTour }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200 bg-[#fcfcf9]/95 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate("/")}
          className="text-stone-800 text-xl font-bold tracking-tight hover:text-stone-600 transition-colors font-['Merriweather']"
        >
          HARRY THE BLAZE
        </button>
        <div className="flex items-center gap-4">
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-lg font-medium hover:bg-stone-200 transition-colors text-sm font-['Inter']"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Tour</span>
            </button>
          )}
          {showExit && (
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700/80 rounded-lg font-medium hover:bg-rose-100 transition-colors text-sm font-['Inter']"
            >
              <LogOut className="w-4 h-4" />
              Exit
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-stone-800 text-sm font-medium hover:text-stone-600 transition-colors font-['Inter']">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Header;
