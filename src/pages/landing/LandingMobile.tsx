import { motion, AnimatePresence } from "framer-motion";
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { Link, NavigateFunction } from "react-router-dom";
import { ArrowRight, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";
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
    {/* Signed-in: skip landing, show welcome directly */}
    <SignedIn>
      <div className="min-h-screen flex flex-col items-center justify-center px-5">
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
      {/* Section 1: Hero */}
      <section className="min-h-screen flex flex-col">
        <div className="flex items-center justify-between px-5 pt-7 pb-2">
          <div className="flex items-center gap-2">
            <img
              src="/favicon.svg"
              alt="Harry The Blaze"
              className="w-7 h-7 flex-shrink-0"
              style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.22))" }}
            />
            <span className="font-['Merriweather'] font-black text-[0.82rem] tracking-tight text-stone-800">
              HARRY THE BLAZE
            </span>
          </div>
          <a
            href="#auth-section"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-['Inter'] font-semibold bg-stone-900 text-white active:scale-95 transition-transform"
          >
            Sign In
          </a>
        </div>

        <div className="px-5 pt-8 pb-6 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-5 bg-white border border-stone-200"
            style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.03)" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-['Inter'] font-semibold text-stone-600">
              Campus Placement Accelerator · Free to join
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-['Merriweather'] font-black text-stone-900 leading-[1.1] tracking-tight text-[2rem] mb-4"
          >
            Crack campus<br />
            placements.{" "}
            <span className="text-stone-400">Faster.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="font-['Inter'] text-[14px] text-stone-500 leading-relaxed mb-8"
          >
            AI mock interviews, gamified aptitude tests, communication practice — and 1:1 sessions with students who just got placed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
            className="flex flex-col gap-3 mb-10"
          >
            <a
              href="#auth-section"
              className="flex items-center justify-center gap-2 py-4 rounded-2xl font-['Inter'] font-semibold text-[15px] bg-stone-900 text-white active:scale-[0.98] transition-transform"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#auth-section"
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-['Inter'] font-medium text-[14px] text-stone-600 border border-stone-200 bg-white active:scale-[0.98] transition-transform"
              onClick={() => setView("sign-in")}
            >
              Already have an account? Sign In
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center gap-4 mb-8"
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
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-2.5 h-2.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="font-['Inter'] text-[11px] text-stone-500">
                <span className="font-semibold text-stone-700">500+ students</span> placed
              </p>
            </div>
          </motion.div>

          {/* Features list */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, label, sub, to }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.35 + i * 0.06 }}
                className={`flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-stone-100 shadow-sm${to ? " cursor-pointer hover:border-amber-200 hover:shadow-md transition-all active:scale-[0.98]" : ""}`}
                onClick={to ? () => navigate(to) : undefined}
              >
                <div className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-stone-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-['Inter'] text-[13px] font-semibold text-stone-800">{label}</p>
                  <p className="font-['Inter'] text-[11px] text-stone-400">{sub}</p>
                </div>
                {to ? (
                  <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-200 flex-shrink-0 mr-1.5" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center pb-6 gap-1">
          <p className="font-['Inter'] text-[11px] text-stone-400">Scroll to sign up</p>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Auth */}
      <section
        id="auth-section"
        className="min-h-screen flex flex-col px-5 pt-10 pb-8"
        style={{ scrollMarginTop: "0px" }}
      >
        <div className="mb-7">
          <h2 className="font-['Merriweather'] font-black text-[1.5rem] text-stone-900 leading-tight mb-1">
            {view === "sign-in" ? "Welcome back" : "Join for free"}
          </h2>
          <p className="font-['Inter'] text-[13px] text-stone-500">
            {view === "sign-in" ? "Sign in to continue your prep." : "No credit card required. Ready in seconds."}
          </p>
        </div>

        <SignedOut>
          {!isLoaded ? (
            <AuthSkeleton />
          ) : (
            <>
              <div
                className={`flex p-1 rounded-2xl mb-6 ${isClerkVerificationStep ? "hidden" : ""}`}
                style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}
              >
                {(["sign-in", "sign-up"] as AuthView[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className="flex-1 py-2.5 rounded-xl text-[13.5px] font-['Inter'] font-semibold transition-all duration-200 active:scale-[0.97]"
                    style={
                      view === v
                        ? { background: "#ffffff", color: "#1c1c1e", boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }
                        : { color: "#a8a29e" }
                    }
                  >
                    {v === "sign-in" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={view + "-mob"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="w-full"
                >
                  {view === "sign-in" ? (
                    <SignIn routing="hash" forceRedirectUrl="/dashboard" appearance={clerkAppearance} />
                  ) : (
                    <SignUp routing="hash" forceRedirectUrl="/dashboard" appearance={clerkAppearance} />
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="flex items-center justify-center gap-2 text-stone-400 pt-6">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
                <span className="font-['Inter'] text-[11px]">
                  Secure sign-in · We never share your data
                </span>
              </div>
            </>
          )}
        </SignedOut>

        <div className="flex items-center gap-4 pt-8 flex-wrap">
          {[
            { label: "About", to: "/about" },
            { label: "Terms", to: "/terms" },
            { label: "Connect", to: "/connect" },
            { label: "Be a Guru", to: "/placed-guru" },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-[11px] font-['Inter'] text-stone-400 hover:text-stone-600 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </SignedOut>
  </div>
);
