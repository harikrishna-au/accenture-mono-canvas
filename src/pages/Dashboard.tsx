import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Youtube } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import OutlineButton from "@/components/OutlineButton";
import CompletionPopup from "@/components/CompletionPopup";
import qrCode from "@/lib/qr-code.png";
import FeedbackPopup from "@/components/FeedbackPopup";
import { Coffee, MessageSquare } from "lucide-react";

import Header from "@/components/Header";
import SupportPopup from "@/components/SupportPopup";

import accentureLogo from "@/lib/accenture-svgrepo-com.svg";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

  const games = [
    { id: 1, name: "Matrix Flow", path: "/game/matrix" },
    { id: 2, name: "Balloon Math", path: "/game/balloon" },
    { id: 3, name: "Hidden Maze", path: "/game/hidden-maze" },
    { id: 4, name: "", path: "" },
    { id: 5, name: "", path: "" },
    { id: 6, name: "", path: "" },
    { id: 7, name: "", path: "" },
    { id: 8, name: "", path: "" },
    { id: 9, name: "", path: "" },
    { id: 10, name: "", path: "" },
    { id: 11, name: "", path: "" },
    { id: 12, name: "", path: "" },
  ];

  const [isFooterHovered, setIsFooterHovered] = useState(false);

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center bg-neutral-50 overflow-hidden font-sans selection:bg-red-100 selection:text-red-900">
      {/* Premium Background Layer */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-neutral-50">
        <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        {/* Left Side Decoration */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-100/40 to-blue-100/40 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        {/* Right Side Decoration */}
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tl from-red-100/40 to-orange-100/40 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      </div>

      <div className={`w-full flex flex-col items-center transition-all duration-500 z-10 ${isFooterHovered ? 'blur-sm scale-[0.98] opacity-80' : ''}`}>
        <Header />
      </div>
      <CompletionPopup />
      <SupportPopup isOpen={showSupportPopup} onClose={() => setShowSupportPopup(false)} />
      <FeedbackPopup isOpen={showFeedbackPopup} onClose={() => setShowFeedbackPopup(false)} />

      <div className={`relative z-10 flex-1 flex flex-col items-center w-full p-8 pt-20 overflow-hidden transition-all duration-500 ${isFooterHovered ? 'blur-sm scale-[0.98] opacity-80' : ''}`}>
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
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  Join the Journey
                </h1>
                <p className="text-lg text-neutral-300 max-w-xl">
                  I'm building this platform from scratch. Watch the process, learn with me, and be a part of the story.
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
                {games.map((game) => (
                  <div
                    key={game.id}
                    className={`relative h-32 border-2 border-black rounded-xl flex items-center justify-center p-4 ${game.name
                      ? "bg-white hover:bg-black hover:text-white cursor-pointer transition-colors group"
                      : "bg-gray-50 cursor-not-allowed"
                      }`}
                    onClick={() => game.path && navigate(game.path)}
                  >
                    {game.name ? (
                      <>
                        <img
                          src={accentureLogo}
                          alt="Accenture"
                          className="absolute top-3 right-3 h-4 w-auto opacity-60 group-hover:invert group-hover:opacity-100 transition-all"
                        />
                        <span className="text-lg font-bold text-center leading-tight mt-2">
                          {game.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-neutral-400 text-center italic">
                        Coming Soon
                      </span>
                    )}
                  </div>
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

      {/* Footer */}
      <div
        className="w-full mt-auto pt-8 border-t border-neutral-100 flex flex-col items-center justify-center pb-8 relative z-50 bg-white/80 backdrop-blur-md"
        onMouseEnter={() => setIsFooterHovered(true)}
        onMouseLeave={() => setIsFooterHovered(false)}
      >
        <div className="group relative flex items-center gap-4 bg-neutral-50 px-8 py-4 rounded-2xl border border-neutral-200 shadow-sm">
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
