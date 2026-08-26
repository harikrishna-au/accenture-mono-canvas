import { motion, AnimatePresence } from "framer-motion";
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { Link, NavigateFunction } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, Mail } from "lucide-react";
import { AuthView, clerkAppearance, AuthSkeleton } from "./authConfig";

interface Feature {
  icon: React.ElementType;
  label: string;
  sub: string;
  to?: string;
}

interface LandingMobileProps {
  view: AuthView;
  setView: (v: AuthView) => void;
  navigate: NavigateFunction;
  isPremium: boolean;
  isLoaded: boolean;
  isClerkVerificationStep: boolean;
  features: Feature[];
}

export const LandingMobile = ({
  view,
  setView,
  navigate,
  isPremium,
  isLoaded,
  isClerkVerificationStep,
}: LandingMobileProps) => (
  <div className="lg:hidden relative z-10">
    <SignedIn>
      <div className="min-h-dvh flex flex-col items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full text-center"
        >
          <div className="flex justify-center mb-5">
            <UserButton />
          </div>
          <h2 className="font-['Merriweather'] font-bold text-2xl text-stone-900 mb-2">
            Welcome back!
          </h2>
          {isPremium ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[12px] font-semibold font-['Inter'] text-amber-700">Premium Member</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 mb-3">
              <span className="text-[12px] font-medium font-['Inter'] text-stone-500">Free Plan</span>
            </div>
          )}
          <p className="font-['Inter'] text-[14px] text-stone-500 mb-8">
            Continue where you left off.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-['Inter'] font-semibold text-[15px] bg-stone-900 text-white active:scale-[0.98] transition-transform mb-3"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            to="/connect"
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-['Inter'] font-medium text-[14px] text-stone-600 border border-stone-200 bg-white active:scale-[0.98] transition-transform"
          >
            Browse Placed Gurus
          </Link>
        </motion.div>
      </div>
    </SignedIn>

    <SignedOut>
      <div className="min-h-dvh flex flex-col px-5 pt-5 pb-24">
        <header className="flex items-center h-11 mb-6">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/favicon.svg"
              alt="Harry The Blaze"
              className="w-7 h-7 flex-shrink-0"
              style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.22))" }}
            />
            <span className="font-['Merriweather'] font-black text-[0.82rem] tracking-tight text-stone-800 truncate">
              HARRY THE BLAZE
            </span>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="font-['Merriweather'] font-black text-stone-900 leading-[1.15] tracking-tight text-[1.65rem]">
            Crack campus placements.{" "}
            <span className="text-stone-400">Faster.</span>
          </h1>
          <p className="font-['Inter'] text-[13.5px] text-stone-500 leading-relaxed mt-2">
            Games, interviews, and 1:1 with seniors who just got placed.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="mt-6 rounded-2xl bg-white border border-stone-200/90 p-4"
          style={{ boxShadow: "0 8px 28px rgba(28, 25, 23, 0.06)" }}
        >
          {!isLoaded ? (
            <AuthSkeleton />
          ) : (
            <>
              {!isClerkVerificationStep && (
                <div
                  className="flex p-1 rounded-xl mb-4"
                  style={{ background: "rgba(0,0,0,0.045)" }}
                  role="tablist"
                  aria-label="Account"
                >
                  {(["sign-up", "sign-in"] as AuthView[]).map((v) => {
                    const active = view === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setView(v)}
                        className="flex-1 min-h-[40px] rounded-[10px] font-['Inter'] text-[13.5px] font-semibold transition-all duration-200 active:scale-[0.98]"
                        style={
                          active
                            ? { background: "#ffffff", color: "#1c1c1e", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                            : { color: "#78716c" }
                        }
                      >
                        {v === "sign-up" ? "Sign up" : "Sign in"}
                      </button>
                    );
                  })}
                </div>
              )}

              {isClerkVerificationStep && (
                <div className="mb-4 flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <Mail className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-['Inter'] text-[13px] font-semibold text-amber-900 leading-snug">
                      Check your email to verify
                    </p>
                    <p className="font-['Inter'] text-[12px] text-amber-700 leading-snug mt-0.5">
                      Enter the code below. If it is not in your inbox, check spam.
                    </p>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={view + "-mob"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="w-full"
                >
                  {view === "sign-in" ? (
                    <SignIn routing="hash" forceRedirectUrl="/dashboard" appearance={clerkAppearance} />
                  ) : (
                    <SignUp routing="hash" forceRedirectUrl="/dashboard" appearance={clerkAppearance} />
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </motion.div>

        <p className="mt-4 text-center font-['Inter'] text-[12px] text-stone-400">
          500+ students · Free · No credit card
        </p>
        <p className="mt-2 text-center font-['Inter'] text-[12px] text-stone-400">
          Cognitive games · Communication · AI interviews
        </p>

        <div className="mt-auto pt-8 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span className="font-['Inter'] text-[11px] text-stone-400">
            Secure · We never share your data
          </span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          {[
            { label: "About", to: "/about" },
            { label: "Terms", to: "/terms" },
            { label: "Connect", to: "/connect" },
            { label: "Be a Guru", to: "/placed-guru" },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="inline-flex items-center justify-center min-h-[44px] px-2.5 text-[12px] font-['Inter'] text-stone-400"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </SignedOut>
  </div>
);
