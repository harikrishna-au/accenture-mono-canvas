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

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center bg-white overflow-hidden">
      <Header />
      <CompletionPopup />
      <SupportPopup isOpen={showSupportPopup} onClose={() => setShowSupportPopup(false)} />
      <FeedbackPopup isOpen={showFeedbackPopup} onClose={() => setShowFeedbackPopup(false)} />

      <div className="flex-1 flex flex-col items-center w-full p-8 pt-20 overflow-y-auto">
        <SignedIn>
          <div className="flex flex-col items-center w-full max-w-5xl flex-1">

            {/* Header Text */}
            <div className="text-center mb-8 space-y-2 mt-8">
              <h1 className="text-4xl font-black text-neutral-900 tracking-tight">@HARIKRISHNA-AU</h1>
              <p className="text-lg text-neutral-600 font-medium">
                I'm building this! Be a part of it by contributing to my journey.
              </p>
            </div>

            {/* YouTube Subscription Banner */}
            <div className="mb-10 text-center">
              <a
                href="https://www.youtube.com/@HARIKRISHNA-AU"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 px-8 py-4 bg-white border-2 border-red-100 text-red-600 rounded-full hover:bg-red-50 transition-all shadow-lg hover:shadow-xl group"
              >
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Youtube className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-neutral-500">Subscribe to</span>
                  <span className="text-xl font-bold text-neutral-900">@HARIKRISHNA-AU</span>
                </div>
              </a>
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

            {/* Footer */}
            <div className="w-full mt-auto pt-8 border-t border-neutral-100 flex flex-col items-center justify-center pb-8">
              <div className="flex items-center gap-4 bg-neutral-50 px-8 py-4 rounded-2xl border border-neutral-200 shadow-sm">
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
    </div>
  );
};

export default Dashboard;
