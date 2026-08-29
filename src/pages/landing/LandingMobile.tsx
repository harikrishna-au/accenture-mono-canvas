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
  features,
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
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
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
        <a
          href="#auth-section"
          onClick={() => setView("sign-in")}
          className="inline-flex items-center justify-center min-h-[44px] px-3 font-['Inter'] text-[13px] font-semibold text-stone-600"
        >
          Sign in
        </a>
      </header>

      <section className="px-5 pt-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-5 bg-white border border-stone-200"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-['Inter'] font-semibold text-stone-600">
            Campus Placement Accelerator
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="font-['Merriweather'] font-black text-stone-900 leading-[1.12] tracking-tight text-[2rem]"
        >
          Crack campus<br />
          placements.{" "}
          <span className="text-stone-400">Faster.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="font-['Inter'] text-[14px] text-stone-500 leading-relaxed mt-3"
        >
          AI mock interviews, cognitive games, communication practice — and 1:1 with seniors who just got placed.
        </motion.p>

        <motion.a
          href="#auth-section"
          onClick={() => setView("sign-up")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="mt-6 flex items-center justify-center gap-2 min-h-[48px] rounded-2xl font-['Inter'] font-semibold text-[15px] bg-stone-900 text-white active:scale-[0.98] transition-transform"
        >
          Get started free
          <ArrowRight className="w-4 h-4" />
        </motion.a>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="flex items-center gap-3 mt-5"
        >
          <div className="flex -space-x-2">
            {["#d6cfc7", "#c4bdb4", "#b8b0a8", "#a8a29e"].map((c, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-[#fcfcf9] flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: c }}
              >
                {["A", "R", "K", "S"][i]}
              </div>
            ))}
          </div>
          <p className="font-['Inter'] text-[12px] text-stone-500">
            <span className="font-semibold text-stone-700">500+ students</span> placed
          </p>
        </motion.div>

        <div className="mt-8 space-y-2.5">
          {features.map(({ icon: Icon, label, sub }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.22 + i * 0.04 }}
              className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-100"
            >
              <div className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-stone-600" />
              </div>
              <div className="min-w-0">
                <p className="font-['Inter'] text-[13px] font-semibold text-stone-800">{label}</p>
                <p className="font-['Inter'] text-[12px] text-stone-400">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="auth-section" className="px-5 pt-4 pb-24 scroll-mt-4">
        <h2 className="font-['Merriweather'] font-black text-[1.35rem] text-stone-900 leading-tight">
          {view === "sign-in" ? "Welcome back" : "Create your free account"}
        </h2>
        <p className="font-['Inter'] text-[13px] text-stone-500 mt-1 mb-5">
          {view === "sign-in" ? "Sign in to continue your prep." : "Takes under a minute. No credit card."}
        </p>

        <div
          className="rounded-2xl bg-white border border-stone-200/90 p-4"
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
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span className="font-['Inter'] text-[11px] text-stone-400">
            Secure · We never share your data
          </span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-1 pt-1">
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
      </section>
    </SignedOut>
  </div>
);
