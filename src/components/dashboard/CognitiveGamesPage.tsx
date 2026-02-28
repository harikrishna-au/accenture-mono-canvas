import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { ArrowLeft, ArrowUpRight, Cpu, Zap, Navigation, BarChart3, BookOpen, Brain, Crown } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Game definitions ─────────────────────────────────────────────────────────

const ACTIVE = [
  {
    num: "01",
    name: "Matrix Flow",
    path: "/game/matrix",
    desc: "Spot patterns in shifting matrices and find the missing piece. Tests logical reasoning speed under pressure.",
    tag: "Logic · Patterns",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.06)",
    border: "rgba(124,58,237,0.17)",
    glow: "rgba(124,58,237,0.15)",
    Icon: Cpu,
    hasPremium: true,
  },
  {
    num: "02",
    name: "Balloon Math",
    path: "/game/balloon",
    desc: "Pop the correct balloons to solve arithmetic sequences at pace. Builds numerical fluency and decision speed.",
    tag: "Arithmetic · Speed",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.06)",
    border: "rgba(8,145,178,0.17)",
    glow: "rgba(8,145,178,0.15)",
    Icon: Zap,
    hasPremium: false,
  },
  {
    num: "03",
    name: "Hidden Maze",
    path: "/game/hidden-maze",
    desc: "Navigate invisible pathways using spatial memory alone. Tests working memory and orientation.",
    tag: "Spatial · Memory",
    color: "#059669",
    bg: "rgba(5,150,105,0.06)",
    border: "rgba(5,150,105,0.17)",
    glow: "rgba(5,150,105,0.15)",
    Icon: Navigation,
    hasPremium: true,
  },
];

const COMING_SOON = [
  {
    num: "04",
    name: "Speed Math",
    desc: "Lightning fast arithmetic under increasing cognitive load and distractions.",
    tag: "Arithmetic · Focus",
    Icon: BarChart3,
  },
  {
    num: "05",
    name: "Word Grid",
    desc: "Find hidden words in a shifting letter matrix before the clock runs out.",
    tag: "Language · Pattern",
    Icon: BookOpen,
  },
  {
    num: "06",
    name: "Sequence Recall",
    desc: "Memorize and reproduce increasingly complex visual sequences.",
    tag: "Memory · Attention",
    Icon: Brain,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  isPremium: boolean;
  onSubscribe: () => void;
}

export const CognitiveGamesPage = ({ isPremium, onSubscribe }: Props) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(containerRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55 });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto px-6 py-10 opacity-0">

      {/* Back */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-[13px] font-medium font-['Inter'] transition-colors mb-10 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back
      </button>

      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-semibold tracking-[0.2em] uppercase font-['Inter'] mb-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500" />
          </span>
          Cognitive Assessment Prep
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-stone-800 tracking-tight leading-[1.15] mb-2">
          Cognitive Games
        </h1>
        <p className="text-stone-400 text-[0.88rem] font-['Inter'] font-light">
          Game-based simulations modelled on the exact cognitive tests used in MNC assessments.
        </p>
      </div>

      {/* ── Active games ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {ACTIVE.map((game) => (
          <div
            key={game.num}
            onClick={() => navigate(game.path)}
            className="relative rounded-2xl p-6 flex flex-col gap-5 cursor-pointer group overflow-hidden"
            style={{
              background: "#ffffff",
              border: `1px solid ${game.border}`,
              boxShadow: "0 3px 16px rgba(0,0,0,0.04)",
              transition: "box-shadow 0.22s ease, transform 0.22s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 14px 44px ${game.glow}, 0 0 0 1.5px ${game.border}`;
              (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 3px 16px rgba(0,0,0,0.04)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            {/* Accent wash */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 90% 60% at 10% 0%, ${game.bg} 0%, transparent 68%)`,
              }}
            />
            {/* Shimmer sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            {/* Bottom accent line */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${game.color}, transparent 70%)` }}
            />

            <div className="relative z-10 flex flex-col gap-5 h-full">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-2"
                    style={{ color: game.color }}
                  >
                    {game.num}
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: game.bg, border: `1px solid ${game.border}` }}
                  >
                    <game.Icon className="w-5 h-5" style={{ color: game.color }} />
                  </div>
                </div>

                {game.hasPremium && !isPremium && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSubscribe(); }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border font-['Inter'] hover:opacity-80 transition-opacity"
                    style={{
                      color: "#d97706",
                      background: "rgba(217,119,6,0.07)",
                      borderColor: "rgba(217,119,6,0.2)",
                    }}
                  >
                    <Crown className="w-2.5 h-2.5" />
                    Extra Levels
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3
                  className="text-[1.1rem] font-bold tracking-tight font-['Inter'] mb-2"
                  style={{ color: "#1c1c1e", letterSpacing: "-0.015em" }}
                >
                  {game.name}
                </h3>
                <p className="text-stone-500 text-[12.5px] leading-relaxed font-['Inter']">
                  {game.desc}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold tracking-wide border font-['Inter']"
                  style={{ color: game.color, background: game.bg, borderColor: game.border }}
                >
                  {game.tag}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-semibold font-['Inter']" style={{ color: game.color }}>
                    Play now
                  </span>
                  <ArrowUpRight
                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ color: game.color }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Coming soon ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMING_SOON.map((game) => (
          <div
            key={game.num}
            className="relative rounded-2xl p-6 flex flex-col gap-5 overflow-hidden select-none"
            style={{
              background: "#f9f9f8",
              border: "1px solid rgba(0,0,0,0.055)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.025)",
            }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-2 text-stone-300">
                  {game.num}
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-100 border border-stone-200">
                  <game.Icon className="w-5 h-5 text-stone-300" />
                </div>
              </div>
              <div className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider border border-stone-200 text-stone-300 font-['Inter']">
                Coming Soon
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center">
              <span className="text-stone-300 text-[13px] font-semibold font-['Inter'] tracking-wide">
                Coming Soon
              </span>
            </div>

            {/* Footer */}
            <div>
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold tracking-wide border border-stone-200 text-stone-300 font-['Inter']">
                {game.tag}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
