import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { ArrowLeft, ArrowUpRight, Cpu, Zap, Navigation, Crown } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Game definitions ─────────────────────────────────────────────────────────

// Each group mirrors the assessment used by a specific company, so the games
// are grouped and labelled by that company rather than by an internal name.
const COMPANIES = {
  accenture: { name: "Accenture", accent: "#A100FF" },
  cognizant: { name: "Cognizant", accent: "#0033A0" },
} as const;

const ACCENTURE_GAMES = [
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

const COGNIZANT_GAMES = [
  {
    num: "04",
    name: "Geo-Sudo",
    path: "/game/geo-sudo",
    desc: "Fill a 4×4 grid so every row & column contains all 4 shapes. Tests deductive logic and pattern recognition.",
    tag: "Deductive · Logic",
    emoji: "◆",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.06)",
    border: "rgba(124,58,237,0.17)",
    glow: "rgba(124,58,237,0.15)",
  },
  {
    num: "05",
    name: "Grid Challenge",
    path: "/game/grid-challenge",
    desc: "Spot the rule in a 3×3 matrix and select the missing element from 4 choices. Inductive reasoning under time.",
    tag: "Inductive · Patterns",
    emoji: "⊞",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.06)",
    border: "rgba(8,145,178,0.17)",
    glow: "rgba(8,145,178,0.15)",
  },
  {
    num: "06",
    name: "Motion Challenge",
    path: "/game/motion",
    desc: "Tap shrinking coloured targets before they vanish. Tests hand-eye coordination, reaction speed, and focus.",
    tag: "Reaction · Speed",
    emoji: "🎯",
    color: "#e11d48",
    bg: "rgba(225,29,72,0.06)",
    border: "rgba(225,29,72,0.17)",
    glow: "rgba(225,29,72,0.15)",
  },
  {
    num: "07",
    name: "Switch Challenge",
    path: "/game/switch",
    desc: "Classify numbers (odd/even) and letters (vowel/consonant) as the task switches without warning. Adaptability under load.",
    tag: "Switching · Focus",
    emoji: "🔀",
    color: "#059669",
    bg: "rgba(5,150,105,0.06)",
    border: "rgba(5,150,105,0.17)",
    glow: "rgba(5,150,105,0.15)",
  },
  {
    num: "08",
    name: "Digit Challenge",
    path: "/game/digit",
    desc: "Watch digits flash one-by-one, then type the full sequence. Sequence length grows until you reach your limit.",
    tag: "Memory · Working",
    emoji: "🧠",
    color: "#d97706",
    bg: "rgba(217,119,6,0.06)",
    border: "rgba(217,119,6,0.17)",
    glow: "rgba(217,119,6,0.15)",
  },
  {
    num: "09",
    name: "BART",
    path: "/game/bart",
    desc: "Pump a balloon to earn points — but it can pop at any moment. Reveals your real risk appetite under uncertainty.",
    tag: "Risk · Strategy",
    emoji: "🎈",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.06)",
    border: "rgba(124,58,237,0.17)",
    glow: "rgba(124,58,237,0.15)",
  },
  {
    num: "10",
    name: "Swith Challenge",
    path: "/game/swith",
    desc: "Symbols appear in two rows — decode the output order back to input positions. Tests logical mapping and speed.",
    tag: "Logic · Mapping",
    emoji: "🔁",
    color: "#ca8a04",
    bg: "rgba(202,138,4,0.06)",
    border: "rgba(202,138,4,0.17)",
    glow: "rgba(202,138,4,0.15)",
  },
  {
    num: "11",
    name: "Dual Task Challenge",
    path: "/game/dual-task",
    desc: "Remember which circle blinks, judge symmetry of patterns, then recall all 3 circles in order. Tests divided attention and memory.",
    tag: "Attention · Memory",
    emoji: "🧩",
    color: "#059669",
    bg: "rgba(5,150,105,0.06)",
    border: "rgba(5,150,105,0.17)",
    glow: "rgba(5,150,105,0.15)",
  },
  {
    num: "12",
    name: "Inductive Challenge",
    path: "/game/inductive",
    desc: "Two grids show a hidden transformation rule. Find which two of four answer grids follow the same rule.",
    tag: "Inductive · Recognition",
    emoji: "🔍",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.06)",
    border: "rgba(124,58,237,0.17)",
    glow: "rgba(124,58,237,0.15)",
  },
];

// ─── Shared card hover handlers ────────────────────────────────────────────────

function onEnter(el: HTMLElement, glow: string, border: string) {
  el.style.boxShadow = `0 14px 44px ${glow}, 0 0 0 1.5px ${border}`;
  el.style.transform = "translateY(-5px)";
}
function onLeave(el: HTMLElement) {
  el.style.boxShadow = "0 3px 16px rgba(0,0,0,0.04)";
  el.style.transform = "translateY(0)";
}

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
    <div ref={containerRef} className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 opacity-0">

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

      {/* ── Accenture ── */}
      <div className="mb-10">
        <CompanyHeader
          company={COMPANIES.accenture}
          count={ACCENTURE_GAMES.length}
          blurb="Modelled on the Accenture cognitive assessment — pattern logic, numerical fluency and spatial memory."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACCENTURE_GAMES.map((game) => (
            <GameCard
              key={game.num}
              game={game}
              isPremium={isPremium}
              onSubscribe={onSubscribe}
              navigate={navigate}
              showPremium
            />
          ))}
        </div>
      </div>

      {/* ── Cognizant ── */}
      <div className="mb-2">
        <CompanyHeader
          company={COMPANIES.cognizant}
          count={COGNIZANT_GAMES.length}
          blurb="Modelled on the Cognizant assessment pack — logic, memory, reaction speed and risk appetite."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COGNIZANT_GAMES.map((game) => (
            <CognizantGameCard key={game.num} game={game} navigate={navigate} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Company group header ─────────────────────────────────────────────────────

function CompanyHeader({
  company,
  count,
  blurb,
}: {
  company: { name: string; accent: string };
  count: number;
  blurb: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: company.accent }} />
        <h2 className="text-[15px] font-bold tracking-tight font-['Inter'] text-stone-800">
          {company.name}
        </h2>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border border-stone-200 bg-stone-50 text-stone-500 font-['Inter']">
          {count} GAMES
        </span>
      </div>
      <p className="text-stone-400 text-[12.5px] font-['Inter'] font-light">{blurb}</p>
    </div>
  );
}

// ─── Classic game card ────────────────────────────────────────────────────────

function GameCard({
  game,
  isPremium,
  onSubscribe,
  navigate,
  showPremium,
}: {
  game: typeof ACCENTURE_GAMES[0];
  isPremium: boolean;
  onSubscribe: () => void;
  navigate: ReturnType<typeof useNavigate>;
  showPremium?: boolean;
}) {
  return (
    <div
      onClick={() => navigate(game.path)}
      className="relative rounded-2xl p-6 flex flex-col gap-5 cursor-pointer group overflow-hidden"
      style={{
        background: "#ffffff",
        border: `1px solid ${game.border}`,
        boxShadow: "0 3px 16px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.22s ease, transform 0.22s ease",
      }}
      onMouseEnter={(e) => onEnter(e.currentTarget as HTMLElement, game.glow, game.border)}
      onMouseLeave={(e) => onLeave(e.currentTarget as HTMLElement)}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 90% 60% at 10% 0%, ${game.bg} 0%, transparent 68%)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${game.color}, transparent 70%)` }}
      />

      <div className="relative z-10 flex flex-col gap-5 h-full">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-2" style={{ color: game.color }}>
              {game.num}
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: game.bg, border: `1px solid ${game.border}` }}>
              <game.Icon className="w-5 h-5" style={{ color: game.color }} />
            </div>
          </div>
          {showPremium && game.hasPremium && !isPremium && (
            <button
              onClick={(e) => { e.stopPropagation(); onSubscribe(); }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border font-['Inter'] hover:opacity-80 transition-opacity"
              style={{ color: "#d97706", background: "rgba(217,119,6,0.07)", borderColor: "rgba(217,119,6,0.2)" }}
            >
              <Crown className="w-2.5 h-2.5" />
              Extra Levels
            </button>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-[1.1rem] font-bold tracking-tight font-['Inter'] mb-2" style={{ color: "#1c1c1e", letterSpacing: "-0.015em" }}>
            {game.name}
          </h3>
          <p className="text-stone-500 text-[12.5px] leading-relaxed font-['Inter']">{game.desc}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold tracking-wide border font-['Inter']"
            style={{ color: game.color, background: game.bg, borderColor: game.border }}>
            {game.tag}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[12px] font-semibold font-['Inter']" style={{ color: game.color }}>Play now</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: game.color }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Assessment pack game card ────────────────────────────────────────────────

function CognizantGameCard({
  game,
  navigate,
}: {
  game: typeof COGNIZANT_GAMES[0];
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <div
      onClick={() => navigate(game.path)}
      className="relative rounded-2xl p-6 flex flex-col gap-5 cursor-pointer group overflow-hidden"
      style={{
        background: "#ffffff",
        border: `1px solid ${game.border}`,
        boxShadow: "0 3px 16px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.22s ease, transform 0.22s ease",
      }}
      onMouseEnter={(e) => onEnter(e.currentTarget as HTMLElement, game.glow, game.border)}
      onMouseLeave={(e) => onLeave(e.currentTarget as HTMLElement)}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 90% 60% at 10% 0%, ${game.bg} 0%, transparent 68%)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${game.color}, transparent 70%)` }}
      />

      <div className="relative z-10 flex flex-col gap-5 h-full">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-2" style={{ color: game.color }}>
              {game.num}
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: game.bg, border: `1px solid ${game.border}` }}>
              {game.emoji}
            </div>
          </div>
          <div
            className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border font-['Inter']"
            style={{ color: game.color, background: game.bg, borderColor: game.border }}
          >
            New
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-[1.1rem] font-bold tracking-tight font-['Inter'] mb-2" style={{ color: "#1c1c1e", letterSpacing: "-0.015em" }}>
            {game.name}
          </h3>
          <p className="text-stone-500 text-[12.5px] leading-relaxed font-['Inter']">{game.desc}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold tracking-wide border font-['Inter']"
            style={{ color: game.color, background: game.bg, borderColor: game.border }}>
            {game.tag}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[12px] font-semibold font-['Inter']" style={{ color: game.color }}>Play now</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: game.color }} />
          </div>
        </div>
      </div>
    </div>
  );
}
