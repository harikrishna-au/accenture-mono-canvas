import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  ArrowRight,
  Brain,
  Trophy,
  Users,
  Mic,
  BarChart2,
  TrendingUp,
  CheckCircle,
  Sparkles,
} from "lucide-react";

type AuthView = "sign-in" | "sign-up";

/* ── Clerk appearance: Japandi light theme ── */
const clerkAppearance = {
  variables: {
    colorPrimary: "#1c1c1e",
    colorBackground: "transparent",   // removes Clerk's nested white card
    colorText: "#1c1c1e",
    colorTextSecondary: "#78716c",
    colorInputBackground: "#faf9f7",
    colorInputText: "#1c1c1e",
    borderRadius: "12px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
  },
  elements: {
    // strip all Clerk's own card chrome
    card: { boxShadow: "none", border: "none", padding: "0", backgroundColor: "transparent" },
    cardBox: { boxShadow: "none", border: "none", backgroundColor: "transparent", width: "100%" },
    main: { backgroundColor: "transparent" },
    // hide Clerk's initial form header only (we draw our own heading above)
    // NOTE: we cannot hide ALL headers — verification steps like "Check your email" live in the header
    headerTitle: { fontSize: "0.95rem", fontWeight: "600", color: "#1c1c1e" },
    headerSubtitle: { fontSize: "0.8rem", color: "#78716c" },
    // hide "Don't have an account?" + "Secured by Clerk" footer
    footer: { display: "none" },
    rootBox: { width: "100%" },
    formButtonPrimary: {
      backgroundColor: "#1c1c1e",
      fontFamily: "'Inter', sans-serif",
      fontWeight: "600",
    },
    socialButtonsBlockButton: { border: "1px solid #e7e5e0" },
    dividerLine: { backgroundColor: "#e7e5e0" },
  },
};

/* ── Skeleton shown while Clerk JS loads ── */
const AuthSkeleton = () => (
  <div className="animate-pulse space-y-5">
    {/* tab switcher ghost */}
    <div className="flex gap-2 p-1 rounded-xl bg-stone-100 border border-stone-200">
      <div className="flex-1 h-8 rounded-[10px] bg-stone-200/70" />
      <div className="flex-1 h-8 rounded-[10px] bg-stone-100" />
    </div>
    {/* heading ghost */}
    <div className="space-y-2 pt-1">
      <div className="h-6 w-36 bg-stone-100 rounded-lg" />
      <div className="h-3.5 w-52 bg-stone-100 rounded-lg" />
    </div>
    {/* social buttons ghost */}
    <div className="flex gap-2">
      <div className="flex-1 h-10 bg-stone-100 rounded-xl border border-stone-200" />
      <div className="flex-1 h-10 bg-stone-100 rounded-xl border border-stone-200" />
    </div>
    {/* divider ghost */}
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-stone-100" />
      <div className="w-6 h-3 bg-stone-100 rounded" />
      <div className="flex-1 h-px bg-stone-100" />
    </div>
    {/* email input ghost */}
    <div className="space-y-1.5">
      <div className="h-3 w-24 bg-stone-100 rounded" />
      <div className="h-10 bg-stone-100 rounded-xl border border-stone-200" />
    </div>
    {/* button ghost */}
    <div className="h-10 bg-stone-900/12 rounded-xl" />
  </div>
);

/* ── Feature list ── */
const features = [
  { icon: BarChart2, label: "Company Dashboard", sub: "Top MNCs, IT firms & Fortune 500" },
  { icon: Brain, label: "AI Mock Interviews", sub: "Real-time adaptive feedback" },
  { icon: Trophy, label: "Gamified Aptitude", sub: "Learn through engaging games" },
  { icon: Mic, label: "Communication Rounds", sub: "Speaking, writing & fluency" },
  { icon: Users, label: "Placed Guru Sessions", sub: "1:1 with recently placed seniors" },
];

/* ── 3-D floating shapes config ── */
const shapes = [
  { w: 72, h: 72, top: "9%", left: "4%", rz: 18, delay: 0, dur: 5.5 },
  { w: 48, h: 48, top: "22%", right: "5%", rz: -22, delay: 1.1, dur: 6.2 },
  { w: 36, h: 36, top: "55%", left: "2%", rz: 40, delay: 2.3, dur: 5 },
  { w: 60, h: 60, top: "72%", right: "8%", rz: -12, delay: 0.6, dur: 6.8 },
  { w: 28, h: 28, top: "40%", left: "10%", rz: 60, delay: 1.8, dur: 4.5 },
];

/* ─────────────────────────────────────────────────────────────────── */

export default function Landing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>("sign-in");
  const [clerkStep, setClerkStep] = useState<string>("");

  /* track Clerk's hash-based step changes */
  useEffect(() => {
    const onHash = () => setClerkStep(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const isClerkVerificationStep = clerkStep.includes("verify") || clerkStep.includes("factor");

  /* 3-D tilt for auth card */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rX = useTransform(my, [-160, 160], [7, -7]);
  const rY = useTransform(mx, [-160, 160], [-7, 7]);
  const sX = useSpring(rX, { stiffness: 350, damping: 38 });
  const sY = useSpring(rY, { stiffness: 350, damping: 38 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  const { isLoaded } = useAuth();

  /* referral code */
  useEffect(() => {
    const code = searchParams.get("referral") || searchParams.get("refferal");
    if (code) {
      localStorage.setItem("referral_coupon", code);
      localStorage.setItem("auto_open_payment", "true");
    }
  }, [searchParams]);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#fcfcf9" }}
    >

      {/* ══ BACKGROUND LAYER ══════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(circle, #c4bdb4 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* warm gradient orbs */}
        <div
          className="absolute -top-40 -right-40 w-[640px] h-[640px] blur-[130px] opacity-50"
          style={{ background: "radial-gradient(ellipse, rgba(201,164,110,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] blur-[100px] opacity-40"
          style={{ background: "radial-gradient(ellipse, rgba(168,162,158,0.14) 0%, transparent 70%)" }}
        />

        {/* 3-D floating glass cubes */}
        {shapes.map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-2xl"
            style={{
              width: s.w,
              height: s.h,
              top: s.top,
              left: (s as any).left,
              right: (s as any).right,
              rotate: s.rz,
              background: "rgba(255,255,255,0.45)",
              border: "1px solid rgba(201,164,110,0.22)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
              transformStyle: "preserve-3d",
            }}
            animate={{
              y: [0, -(14 + i * 2), 0],
              rotateX: [0, 14, 0],
              rotateY: [0, 9, 0],
            }}
            transition={{
              duration: s.dur,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* inner shimmer line */}
            <div
              className="absolute inset-x-3 top-2 h-px rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)" }}
            />
          </motion.div>
        ))}

        {/* floating stat badges */}
        <motion.div
          className="absolute top-[18%] right-[10%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.75)",
            border: "1px solid rgba(228,224,218,0.9)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.9 },
            x: { duration: 0.6, delay: 0.9 },
            y: { duration: 4, delay: 0.9, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <TrendingUp className="w-3.5 h-3.5 text-stone-600" />
          <span className="text-[12px] font-['Inter'] font-semibold text-stone-700">500+ Students Placed</span>
        </motion.div>


      </div>

      {/* ══ MAIN LAYOUT ═══════════════════════════════════════════════ */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

        {/* ── LEFT: brand ─────────────────────────────────────────── */}
        <div className="flex flex-col justify-between px-5 sm:px-10 lg:px-14 py-8 lg:py-14 lg:w-[54%] lg:min-h-screen">

          {/* logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-2.5"
          >
            <motion.img
              src="/favicon.svg"
              alt="Harry The Blaze"
              whileHover={{ scale: 1.08, rotate: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-8 h-8 flex-shrink-0"
              style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.22))" }}
            />
            <span className="font-['Merriweather'] font-black text-[0.9rem] tracking-tight text-stone-800">
              HARRY THE BLAZE
            </span>
          </motion.div>

          {/* hero copy */}
          <div className="py-8 lg:py-0">

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7 bg-stone-100 border border-stone-200"
            >
              <Sparkles className="w-3 h-3 text-stone-500" />
              <span className="text-[11px] font-['Inter'] font-medium text-stone-600">
                Campus Placement Accelerator
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease: "easeOut" }}
              className="font-['Merriweather'] font-black text-stone-900 leading-[1.08] tracking-tight mb-5"
              style={{ fontSize: "clamp(1.85rem, 7vw, 4rem)" }}
            >
              Crack campus
              <br />
              placements.
              <br />
              <span className="text-stone-400">Faster.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
              className="font-['Inter'] text-stone-500 leading-relaxed mb-9 max-w-sm"
              style={{ fontSize: "0.96rem" }}
            >
              AI interviews, gamified aptitude, communication practice — and 1:1
              sessions with students who just got placed.
            </motion.p>

            {/* feature rows */}
            <div className="space-y-2.5">
              {features.map(({ icon: Icon, label, sub }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.32 + i * 0.07, ease: "easeOut" }}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-stone-300 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-stone-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-['Inter'] text-[13px] font-semibold text-stone-800">
                      {label}
                    </span>
                    <span className="font-['Inter'] text-[11.5px] text-stone-400 ml-2">
                      {sub}
                    </span>
                  </div>
                  <CheckCircle className="w-3.5 h-3.5 text-stone-300 flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.85 }}
            className="flex items-center gap-5 flex-wrap"
          >
            {[
              { label: "About", to: "/about" },
              { label: "Terms", to: "/terms" },
              { label: "Connect", to: "/connect" },
              { label: "Be a Guru", to: "/placed-guru" },
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="text-[11.5px] font-['Inter'] text-stone-400 hover:text-stone-600 transition-colors"
              >
                {label}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: auth card ─────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22, ease: "easeOut" }}
            style={{
              rotateX: sX,
              rotateY: sY,
              transformStyle: "preserve-3d",
              perspective: 1000,
            }}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className="w-full max-w-[380px]"
          >
            {/* card — overflow:hidden clips Clerk's inner chrome */}
            <div
              className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-100 overflow-hidden"
              style={{
                boxShadow:
                  "0 24px 64px rgba(0,0,0,0.09), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <SignedOut>
                {/* show skeleton while Clerk JS bootstraps */}
                {!isLoaded ? (
                  <AuthSkeleton />
                ) : (
                  <>
                    {/* tabs — hidden during multi-step flows like email verification */}
                    <div className={`flex p-1 rounded-xl bg-stone-100 border border-stone-200 mb-7 ${isClerkVerificationStep ? "hidden" : ""}`}>
                      {(["sign-in", "sign-up"] as AuthView[]).map((v) => (
                        <button
                          key={v}
                          onClick={() => setView(v)}
                          className="flex-1 py-2 rounded-[10px] text-[13px] font-['Inter'] font-semibold transition-all duration-200 active:scale-[0.97]"
                          style={
                            view === v
                              ? {
                                background: "#ffffff",
                                color: "#1c1c1e",
                                boxShadow: "0 1px 5px rgba(0,0,0,0.09)",
                              }
                              : { color: "#a8a29e" }
                          }
                        >
                          {v === "sign-in" ? "Sign In" : "Sign Up"}
                        </button>
                      ))}
                    </div>

                    {/* heading — hide when Clerk shows verification step (it has its own header) */}
                    {!isClerkVerificationStep && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={view + "-head"}
                          initial={{ opacity: 0, y: 7 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -7 }}
                          transition={{ duration: 0.18 }}
                          className="mb-5"
                        >
                          {view === "sign-in" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-['Inter'] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                              Already registered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-['Inter'] font-semibold bg-violet-50 text-violet-700 border border-violet-200 mb-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
                              Welcome! Register now
                            </span>
                          )}
                          <h2 className="font-['Merriweather'] font-bold text-[1.3rem] text-stone-900 mb-1">
                            {view === "sign-in" ? "Welcome back" : "Get started free"}
                          </h2>
                          <p className="font-['Inter'] text-[13px] text-stone-500">
                            {view === "sign-in"
                              ? "Sign in to continue your prep."
                              : "No credit card required. Ready in seconds."}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {/* Clerk embed — fade in/out on view switch */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={view + "-clerk"}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="w-full"
                      >
                        {view === "sign-in" ? (
                          <SignIn
                            routing="hash"
                            forceRedirectUrl="/dashboard"
                            appearance={clerkAppearance}
                          />
                        ) : (
                          <SignUp
                            routing="hash"
                            forceRedirectUrl="/dashboard"
                            appearance={clerkAppearance}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </>
                )}
              </SignedOut>

              {/* signed-in state */}
              <SignedIn>
                <div className="text-center py-4">
                  <div className="flex justify-center mb-5">
                    <UserButton />
                  </div>
                  <h2 className="font-['Merriweather'] font-bold text-[1.3rem] text-stone-900 mb-2">
                    Welcome back!
                  </h2>
                  <p className="font-['Inter'] text-[13.5px] text-stone-500 mb-7">
                    Continue where you left off.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/dashboard")}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-['Inter'] font-semibold text-[14px] bg-stone-900 text-white hover:bg-stone-700 transition-colors duration-200"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  <Link
                    to="/connect"
                    className="mt-3 flex items-center justify-center gap-2 py-3 rounded-xl font-['Inter'] font-medium text-[13.5px] text-stone-500 border border-stone-200 hover:bg-stone-50 transition-colors duration-200"
                  >
                    Browse Placed Gurus
                  </Link>
                </div>
              </SignedIn>
            </div>

            {/* card glow shadow */}
            <div
              className="absolute -inset-4 -z-10 blur-[40px] opacity-30 rounded-3xl"
              style={{ background: "radial-gradient(ellipse, rgba(201,164,110,0.3) 0%, transparent 70%)" }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
