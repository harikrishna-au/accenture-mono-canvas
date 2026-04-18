import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import {
  ArrowLeft, ArrowUpRight, Code2, FileText,
  Trophy, Clock, Target, ChevronRight, Zap, Sparkles,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const INFY_BLUE = "#007CC3";
const INFY_BG   = "rgba(0,124,195,0.07)";
const INFY_BDR  = "rgba(0,124,195,0.18)";
const INFY_GLOW = "rgba(0,124,195,0.15)";

// ─── Role tiers ───────────────────────────────────────────────────────────────
const ROLES = [
  { label: "DSE",   lpa: "₹7 LPA",  sub: "6.25L + ₹75K joining bonus", color: "#0891b2", bg: "rgba(8,145,178,0.08)",   border: "rgba(8,145,178,0.2)"   },
  { label: "SP L1", lpa: "₹11 LPA", sub: "10L + ₹1L joining bonus",    color: INFY_BLUE, bg: INFY_BG,                  border: INFY_BDR                },
  { label: "SP L2", lpa: "₹16 LPA", sub: "Post probation (6 months)",  color: "#1d4ed8", bg: "rgba(29,78,216,0.08)",   border: "rgba(29,78,216,0.2)"   },
  { label: "SP L3", lpa: "₹21 LPA", sub: "Post probation (6 months)",  color: "#d97706", bg: "rgba(217,119,6,0.08)",   border: "rgba(217,119,6,0.2)"   },
];

// ─── Rounds ───────────────────────────────────────────────────────────────────
const ROUNDS = [
  {
    num: "01",
    title: "Round 1 — Online Coding Test",
    desc: "3 questions in 3 hours (Virtual). Easy → Medium → Hard. Shortlisting for DSE & SP roles. Languages: C, C++, Java, Python, JavaScript.",
    badge: "3 Qs · 3 hrs · Virtual",
    color: INFY_BLUE,
    bg: INFY_BG,
    border: INFY_BDR,
  },
  {
    num: "02",
    title: "Round 2 — Advanced Coding Test",
    desc: "4 questions (Easy, Medium, Hard, Complex) — choose any 3 to solve in 3 hours. Mode: Physical (on-site). Shortlisting for SP roles.",
    badge: "4 Qs choose 3 · 3 hrs · Physical",
    color: "#059669",
    bg: "rgba(5,150,105,0.07)",
    border: "rgba(5,150,105,0.18)",
  },
  {
    num: "03",
    title: "Interview Round",
    desc: "~1 hour: technical and behavioral. CS/IT: DSA, automata, compilers, OS, networks, OOP. Other streams: DSA, digital electronics, math, control systems.",
    badge: "~1 hr · Technical + Behavioral",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.07)",
    border: "rgba(124,58,237,0.18)",
  },
];

// ─── Quick nav sections ───────────────────────────────────────────────────────
const SECTIONS = [
  {
    icon: Target,
    title: "Role-wise Syllabus",
    desc: "Exact topics for DSE & SP (CS/IT and other streams). Know what to study — no guessing.",
    path: "/hackwithinfy/syllabus",
    tag: "DSE · SP L1 · SP L2/L3",
  },
  {
    icon: FileText,
    title: "Study Resources",
    desc: "Curated PDFs: DSA notes, CS fundamentals, SP interview guide, last-mile prep.",
    path: "/hackwithinfy/resources",
    tag: "PDFs · Notes · Guides",
  },
  {
    icon: Clock,
    title: "Previous Year Questions",
    desc: "Real HackWithInfy questions (2019–2025) with solutions and topic analysis.",
    path: "/hackwithinfy/previous-years",
    tag: "2019–2025 · Solutions",
  },
  {
    icon: Zap,
    title: "Strategy & Tips",
    desc: "Time management, scoring system, role selection guidance, and common mistakes.",
    path: "/hackwithinfy/tips",
    tag: "Round 1 · Round 2 · Interview",
  },
  {
    icon: Code2,
    title: "Practice Questions",
    desc: "330+ DSA problems across 16 topics — Arrays, Trees, Graphs, DP and more. Track your progress with a built-in checklist.",
    path: "/coding-questions",
    tag: "330+ Problems · LeetCode · GFG",
  },
  {
    icon: Sparkles,
    title: "Resume Builder",
    desc: "Don't have a resume? Build an ATS-friendly one in minutes — tailored for Infosys DSE & SP roles.",
    path: "/forge",
    tag: "ATS-ready · LaTeX · Free",
  },
];

// ─── CodeViz ─ decorative terminal-like animation ─────────────────────────────
const CodeViz = () => {
  const lines = [
    { text: "def solve(n, arr):",        w: 88 },
    { text: "  dp = [0] * (n + 1)",      w: 74 },
    { text: "  for i in range(n):",      w: 66 },
    { text: "    dp[i+1] = max(...)",     w: 80 },
    { text: "  return dp[n]",            w: 56 },
  ];
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.03)",
        border: `1px solid ${INFY_BDR}`,
        borderRadius: 10,
        padding: "10px 14px",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 10.5,
      }}
    >
      {lines.map((l, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < lines.length - 1 ? 5 : 0 }}>
          <span style={{ color: "rgba(0,124,195,0.3)", minWidth: 14, textAlign: "right", fontSize: 9 }}>{i + 1}</span>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: `rgba(0,124,195,${0.12 + (l.w / 100) * 0.22})`,
              width: `${l.w}%`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const HackWithInfyLanding = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" });
    },
    { scope: containerRef }
  );

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[#fcfcf9]">
        <div
          className="absolute top-0 left-0 w-full h-[400px]"
          style={{
            background: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,124,195,0.06) 0%, transparent 70%)`,
          }}
        />
      </div>

      <div ref={containerRef} className="w-full max-w-4xl mx-auto px-6 py-12 opacity-0 min-h-screen">

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-[13px] font-medium font-['Inter'] transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Dashboard
        </button>

        {/* ── Hero ── */}
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase font-['Inter'] mb-5"
            style={{ background: INFY_BG, color: INFY_BLUE, border: `1px solid ${INFY_BDR}` }}
          >
            <Trophy className="w-3 h-3" />
            Infosys · HackWithInfy Prep
          </div>

          <h1 className="text-3xl md:text-4xl font-serif text-stone-800 tracking-tight leading-[1.15] mb-3">
            Crack HackWithInfy.
            <br />
            <span className="text-stone-400 font-light italic">Land your dream role.</span>
          </h1>
          <p className="text-stone-500 text-[0.9rem] font-['Inter'] font-light max-w-lg leading-relaxed">
            India's biggest coding competition — roles from DSE (₹7 LPA) up to SP Level 3 (₹21 LPA).
            No academic criteria. All eligible streams.
          </p>
        </div>

        {/* ── VIDEO — moved to top ── */}
        <div className="mb-5">
          <p
            className="text-[9.5px] font-bold tracking-[0.22em] uppercase font-['Inter'] mb-3"
            style={{ color: INFY_BLUE, opacity: 0.7 }}
          >
            Watch First
          </p>
          <h2 className="text-[18px] font-serif text-stone-800 tracking-tight mb-4 leading-snug">
            Official HackWithInfy Walkthrough
          </h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: `1px solid ${INFY_BDR}`,
              boxShadow: `0 4px 24px ${INFY_GLOW}, 0 1px 4px rgba(0,0,0,0.06)`,
              aspectRatio: "16/9",
            }}
          >
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/50mbEzZHekQ?si=Nmuy4mxKv1HXffdH"
              title="HackWithInfy Official Walkthrough"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              style={{ display: "block" }}
            />
          </div>
        </div>

        {/* ── AI MOCK INTERVIEW — moved to top ── */}
        <div
          className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden group cursor-pointer mb-12"
          style={{
            background: `linear-gradient(135deg, rgba(0,124,195,0.06) 0%, rgba(0,124,195,0.02) 100%)`,
            border: `1px solid ${INFY_BDR}`,
          }}
          onClick={() => navigate("/ai-interview")}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 60% 120% at 95% 50%, rgba(0,124,195,0.09) 0%, transparent 65%)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

          <div className="relative z-10 flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: INFY_BG, border: `1px solid ${INFY_BDR}` }}
            >
              <Code2 className="w-5 h-5" style={{ color: INFY_BLUE }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[15px] font-bold font-['Inter'] text-stone-800">AI Mock Interview — Infosys Mode</h3>
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border font-['Inter']"
                  style={{ color: INFY_BLUE, background: INFY_BG, borderColor: INFY_BDR }}
                >
                  AVAILABLE
                </span>
              </div>
              <p className="text-stone-500 text-[13px] font-['Inter'] leading-relaxed">
                Practice the interview round — live coding, DSA questions, OOPs, OS, DBMS, and HR. Real-time AI feedback.
              </p>
            </div>
          </div>
          <div
            className="relative z-10 flex items-center gap-1.5 flex-shrink-0 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold font-['Inter'] transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: `linear-gradient(135deg, ${INFY_BLUE}, #005a8e)`, boxShadow: `0 4px 16px ${INFY_GLOW}` }}
          >
            Start Mock
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* ── Role tiers ── */}
        <div className="mb-10">
          <p
            className="text-[9.5px] font-bold tracking-[0.22em] uppercase font-['Inter'] mb-3"
            style={{ color: INFY_BLUE, opacity: 0.7 }}
          >
            Roles & Packages
          </p>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <div
                key={r.label}
                className="flex flex-col px-3 py-2 rounded-xl text-[11px] font-semibold font-['Inter']"
                style={{ background: r.bg, border: `1px solid ${r.border}`, color: r.color }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">{r.label}</span>
                  <span className="font-bold">{r.lpa}</span>
                </div>
                <span className="text-[9.5px] opacity-60 font-normal mt-0.5">{r.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Competition structure ── */}
        <div className="mb-12">
          <p
            className="text-[9.5px] font-bold tracking-[0.22em] uppercase font-['Inter'] mb-4"
            style={{ color: INFY_BLUE, opacity: 0.7 }}
          >
            Competition Structure
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROUNDS.map((r) => (
              <div
                key={r.num}
                className="relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden group"
                style={{
                  background: "#ffffff",
                  border: `1px solid ${r.border}`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.22s ease, transform 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 36px rgba(0,0,0,0.06), 0 0 0 1.5px ${r.border}`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse 90% 60% at 10% 0%, ${r.bg} 0%, transparent 70%)` }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${r.color}, transparent 70%)` }}
                />
                <div className="relative z-10">
                  <div className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-1" style={{ color: r.color }}>
                    {r.num}
                  </div>
                  <h3 className="text-[13.5px] font-bold font-['Inter'] text-stone-800 mb-2 leading-tight">
                    {r.title}
                  </h3>
                  <p className="text-stone-500 text-[12px] leading-relaxed font-['Inter'] mb-3">{r.desc}</p>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold tracking-wide border font-['Inter']"
                    style={{ color: r.color, background: r.bg, borderColor: r.border }}
                  >
                    {r.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Prep sections ── */}
        <div className="mb-12">
          <p
            className="text-[9.5px] font-bold tracking-[0.22em] uppercase font-['Inter'] mb-4"
            style={{ color: INFY_BLUE, opacity: 0.7 }}
          >
            Prep Sections
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SECTIONS.map((s) => (
              <div
                key={s.path}
                onClick={() => navigate(s.path)}
                className="relative rounded-2xl p-5 flex items-start gap-4 cursor-pointer group overflow-hidden"
                style={{
                  background: "#ffffff",
                  border: `1px solid ${INFY_BDR}`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                  transition: "box-shadow 0.22s ease, transform 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 36px ${INFY_GLOW}, 0 0 0 1.5px ${INFY_BDR}`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.03)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse 80% 55% at 5% 0%, ${INFY_BG} 0%, transparent 65%)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                <div
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${INFY_BLUE}, transparent 70%)` }}
                />

                <div
                  className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: INFY_BG, border: `1px solid ${INFY_BDR}` }}
                >
                  <s.icon className="w-4 h-4" style={{ color: INFY_BLUE }} />
                </div>

                <div className="relative z-10 flex-1">
                  <h3 className="text-[14px] font-bold font-['Inter'] text-stone-800 mb-1 leading-tight">{s.title}</h3>
                  <p className="text-stone-500 text-[12px] leading-relaxed font-['Inter'] mb-2">{s.desc}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold tracking-wide border font-['Inter']"
                      style={{ color: INFY_BLUE, background: INFY_BG, borderColor: INFY_BDR }}
                    >
                      {s.tag}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <span className="text-[11.5px] font-semibold font-['Inter']" style={{ color: INFY_BLUE }}>
                        Explore
                      </span>
                      <ArrowUpRight
                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        style={{ color: INFY_BLUE }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Decorative code viz ── */}
        <div className="opacity-40">
          <CodeViz />
        </div>
      </div>
    </>
  );
};

export default HackWithInfyLanding;
