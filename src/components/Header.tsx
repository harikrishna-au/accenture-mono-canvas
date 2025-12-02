import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Maximize, Minimize, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";

const Header = () => {
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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate("/")}
          className="text-neutral-900 text-xl font-black tracking-tight hover:opacity-70 transition-opacity"
        >
          HARRY THE BLAZE
        </button>
        <div className="flex items-center gap-4">
          {showExit && (
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Exit
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-neutral-900 text-sm font-medium hover:opacity-70 transition-opacity">
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
