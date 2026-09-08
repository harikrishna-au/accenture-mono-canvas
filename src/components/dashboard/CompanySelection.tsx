import { useNavigate } from "react-router-dom";
import { useRef, useState, useCallback } from "react";
import { Layers, Mic2, Bot, Users, ArrowUpRight, Code2, Hammer, Radar } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { WaitlistPopup } from "./WaitlistPopup";

// ─── CSS animations ───────────────────────────────────────────────────────────

const STYLES = `
  @keyframes waveBar {
    0%   { transform: scaleY(1); }
    100% { transform: scaleY(0.28); }
  }
  @keyframes pulseRing {
    0%, 100% { opacity: 0.55; transform: translate(-50%,-50%) scale(1); }
    50%       { opacity: 0.1;  transform: translate(-50%,-50%) scale(1.2); }
  }
  @keyframes pulseDot {
    0%, 100% { transform: translate(-50%,-50%) scale(1);    opacity: 1;   }
    50%       { transform: translate(-50%,-50%) scale(0.8); opacity: 0.65; }
  }
  @keyframes scanRotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

// ─── Decorative visuals ───────────────────────────────────────────────────────

const CognitiveViz = () => {
  const lit = new Set([0, 2, 4, 7, 12, 17, 20, 22, 24]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 15px)", gap: 5 }}>
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 15,
            height: 15,
            borderRadius: 4,
            background: lit.has(i)
              ? "rgba(124,58,237,0.42)"
              : "rgba(124,58,237,0.07)",
          }}
        />
      ))}
    </div>
  );
};

const CommViz = () => {
  const bars = [42, 78, 54, 96, 62, 84, 38, 72, 50, 88];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3.5, height: 44 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: `${h}%`,
            borderRadius: 3,
            background: `rgba(8,145,178,${0.22 + (h / 100) * 0.48})`,
            animation: `waveBar ${0.38 + (i % 4) * 0.13}s ease-in-out ${i * 0.055}s infinite alternate`,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
};

const AIViz = () => (
  <div style={{ position: "relative", width: 58, height: 58 }}>
    {[58, 42, 26].map((sz, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: sz,
          height: sz,
          borderRadius: "50%",
          border: `1.5px solid rgba(5,150,105,${0.55 - i * 0.15})`,
          animation: `pulseRing ${0.9 + i * 0.45}s ease-in-out ${i * 0.28}s infinite`,
        }}
      />
    ))}
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        width: 11,
        height: 11,
        borderRadius: "50%",
        background: "rgba(5,150,105,0.78)",
        animation: "pulseDot 1.3s ease-in-out infinite",
      }}
    />
  </div>
);

const ConnectViz = () => (
  <div style={{ display: "flex", alignItems: "center" }}>
    {[0.28, 0.37, 0.46, 0.55].map((op, i) => (
      <div
        key={i}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: `rgba(28,25,23,${op})`,
          border: "2.5px solid white",
          marginLeft: i > 0 ? -10 : 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        {["H", "A", "R", "I"][i]}
      </div>
    ))}
    <span
      style={{
        marginLeft: 12,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: "rgba(28,25,23,0.55)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      5000+ users
    </span>
  </div>
);

// ─── DSACheckViz — mini checklist decoration for Coding Questions card ───────
const DSACheckViz = () => {
  const rows = [
    { w: 72, checked: true  },
    { w: 55, checked: true  },
    { w: 80, checked: false },
    { w: 60, checked: false },
    { w: 68, checked: true  },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: 0.9 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            width: 12, height: 12, borderRadius: 3, flexShrink: 0,
            background: r.checked ? "rgba(220,38,38,0.55)" : "transparent",
            border: `1.5px solid rgba(220,38,38,${r.checked ? 0.55 : 0.22})`,
          }} />
          <div style={{
            height: 6, borderRadius: 4, width: `${r.w}%`,
            background: `rgba(220,38,38,${0.1 + (r.w / 100) * 0.18})`,
          }} />
        </div>
      ))}
    </div>
  );
};

// ─── 3D Tilt wrapper ──────────────────────────────────────────────────────────

interface TiltCardProps {
  children: React.ReactNode;
  onClick: () => void;
  glow: string;
  border: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  label: string;
}

const TiltCard = ({
  children,
  onClick,
  glow,
  border,
  className = "",
  style: extra = {},
  id,
  label,
}: TiltCardProps) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [light, setLight] = useState({ x: 50, y: 35 });
  const [on, setOn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const mm = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    setTilt({ x: (ny - 0.5) * -10, y: (nx - 0.5) * 10 });
    setLight({ x: nx * 100, y: ny * 100 });
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      role="button"
      tabIndex={0}
      aria-label={label}
      onMouseMove={mm}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => {
        setOn(false);
        setTilt({ x: 0, y: 0 });
        setLight({ x: 50, y: 35 });
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative overflow-hidden cursor-pointer group ${className}`}
      style={{
        ...extra,
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${on ? -8 : 0}px)`,
        transition: on
          ? "transform 0.1s ease-out, box-shadow 0.22s ease"
          : "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.38s ease",
        boxShadow: on
          ? `0 28px 72px ${glow}, 0 0 0 1.5px ${border}, 0 8px 22px rgba(0,0,0,0.04)`
          : `0 2px 14px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.05)`,
      }}
    >
      {/* Specular light follows cursor */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at ${light.x}% ${light.y}%, rgba(255,255,255,0.24) 0%, transparent 52%)`,
          opacity: on ? 1 : 0,
          transition: "opacity 0.18s ease",
        }}
      />
      {/* Shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[920ms] ease-in-out pointer-events-none z-10" />
      {children}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

interface CompanySelectionProps {
  onSelectCompany: (companyId: string) => void;
  onFeedbackClick: () => void;
  onSupportClick: () => void;
}

export const CompanySelection = ({ onSelectCompany }: CompanySelectionProps) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);

  const [showWaitlist, setShowWaitlist] = useState(false);
  const [selectedWaitlistCompany] = useState<{ name: string; id: string } | null>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.7 })
      .fromTo(
        heroRef.current?.children || [],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.11 },
        "-=0.45"
      )
      .fromTo(
        bentoRef.current,
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.38"
      );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-14 opacity-0">
      <style>{STYLES}</style>

      <WaitlistPopup
        isOpen={showWaitlist}
        onClose={() => setShowWaitlist(false)}
        companyName={selectedWaitlistCompany?.name || ""}
        companyId={selectedWaitlistCompany?.id || ""}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="flex flex-col items-center text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 text-stone-500 text-[10.5px] font-semibold tracking-[0.2em] uppercase font-['Inter']">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Interview Prep Platform
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.3rem] font-serif text-stone-800 tracking-tight leading-[1.12] max-w-2xl">
          Practice what top MNCs
          <br />
          <span className="text-stone-400 font-light italic">actually test.</span>
        </h1>

        <p className="text-[0.92rem] text-stone-500 font-light max-w-[440px] leading-relaxed font-['Inter']">
          Accenture 2026 placements — cognitive games and communication rounds can be practiced here.
        </p>
      </div>

      {/* ── Bento grid ───────────────────────────────────────────────────── */}
      <div ref={bentoRef} className="flex flex-col gap-4">

        {/* Row 1 — Card 01 (tall left) + Card 02 & 03 (stacked right) */}
        <div className="flex flex-col md:flex-row gap-4">

          {/* Left wrapper — stretches to match right column height */}
          <div className="md:flex-[1.4] flex flex-col">
            <TiltCard
              label="Cognitive Puzzles"
              onClick={() => onSelectCompany("accenture")}
              glow="rgba(124,58,237,0.18)"
              border="rgba(124,58,237,0.22)"
              className="flex-1 rounded-2xl bg-white"
            >
              {/* Top wash */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 90% 55% at 25% 0%, rgba(124,58,237,0.09) 0%, transparent 68%)",
                  transition: "opacity 0.3s ease",
                }}
              />

              <div className="relative z-10 p-5 sm:p-8 flex flex-col h-full min-h-[260px] sm:min-h-[360px]">
                {/* Header row */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div
                      className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-2"
                      style={{ color: "#7c3aed" }}
                    >
                      01
                    </div>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(124,58,237,0.09)",
                        border: "1px solid rgba(124,58,237,0.16)",
                      }}
                    >
                      <Layers className="w-5 h-5" style={{ color: "#7c3aed" }} />
                    </div>
                  </div>
                  <CognitiveViz />
                </div>

                {/* Main text */}
                <div className="mb-6">
                  <h2
                    className="text-[2.1rem] font-bold tracking-tight leading-[1.1] font-['Inter'] mb-4"
                    style={{
                      color: "#1c1c1e",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Cognitive
                    <br />
                    Puzzles
                  </h2>
                  <p className="text-stone-500 text-[0.85rem] leading-relaxed font-['Inter']">
                    Game-based cognitive simulations — the exact way top MNCs
                    assess reasoning speed, memory, and problem-solving under
                    pressure.
                  </p>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Tag + CTA */}
                <div className="flex flex-col gap-4">
                  <div
                    className="inline-flex self-start items-center px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border font-['Inter']"
                    style={{
                      color: "#7c3aed",
                      background: "rgba(124,58,237,0.07)",
                      borderColor: "rgba(124,58,237,0.22)",
                    }}
                  >
                    Matrix Flow · Balloon Math · Maze
                  </div>
                  <div className="flex items-center gap-1.5 group/cta">
                    <span
                      className="text-[13px] font-semibold font-['Inter']"
                      style={{ color: "#7c3aed" }}
                    >
                      Start practicing
                    </span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                      style={{ color: "#7c3aed" }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(90deg, #7c3aed, transparent 70%)" }}
              />
            </TiltCard>
          </div>

          {/* Right column — Cards 02 + 03 stacked */}
          <div className="md:flex-1 flex flex-col gap-4">

            {/* ── Card 02: Communication Tests ── */}
            <TiltCard
              label="Communication Tests"
              onClick={() => navigate("/game/communication-patterns")}
              glow="rgba(8,145,178,0.16)"
              border="rgba(8,145,178,0.22)"
              className="flex-1 rounded-2xl bg-white"
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 55% at 85% 0%, rgba(8,145,178,0.08) 0%, transparent 68%)",
                }}
              />

              <div className="relative z-10 p-6 flex flex-col gap-4 h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-2"
                      style={{ color: "#0891b2" }}
                    >
                      02
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(8,145,178,0.09)",
                        border: "1px solid rgba(8,145,178,0.16)",
                      }}
                    >
                      <Mic2 className="w-4.5 h-4.5" style={{ color: "#0891b2" }} />
                    </div>
                  </div>
                  <CommViz />
                </div>

                <div>
                  <h3
                    className="text-xl font-bold tracking-tight font-['Inter'] mb-2"
                    style={{ color: "#1c1c1e", letterSpacing: "-0.015em" }}
                  >
                    Communication Tests
                  </h3>
                  <p className="text-stone-500 text-[13px] leading-relaxed font-['Inter']">
                    AI-assessed reading, listening, and speaking simulations from
                    real MNC assessment rounds.
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 flex-wrap">
                  <div
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border font-['Inter']"
                    style={{
                      color: "#0891b2",
                      background: "rgba(8,145,178,0.07)",
                      borderColor: "rgba(8,145,178,0.22)",
                    }}
                  >
                    Reading · Listening · Speaking
                  </div>
                  <div className="flex items-center gap-1 group/cta flex-shrink-0">
                    <span
                      className="text-[12px] font-semibold font-['Inter']"
                      style={{ color: "#0891b2" }}
                    >
                      Start round
                    </span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                      style={{ color: "#0891b2" }}
                    />
                  </div>
                </div>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(90deg, #0891b2, transparent 70%)" }}
              />
            </TiltCard>

            {/* ── Card 03: AI Mock Interview ── */}
            <TiltCard
              label="AI Mock Interview"
              onClick={() => navigate("/ai-interview")}
              glow="rgba(5,150,105,0.15)"
              border="rgba(5,150,105,0.22)"
              className="flex-1 rounded-2xl bg-white"
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 55% at 85% 0%, rgba(5,150,105,0.08) 0%, transparent 68%)",
                }}
              />

              <div className="relative z-10 p-6 flex flex-col gap-4 h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-2"
                      style={{ color: "#059669" }}
                    >
                      03
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(5,150,105,0.09)",
                        border: "1px solid rgba(5,150,105,0.16)",
                      }}
                    >
                      <Bot className="w-4.5 h-4.5" style={{ color: "#059669" }} />
                    </div>
                  </div>
                  <AIViz />
                </div>

                <div>
                  <h3
                    className="text-xl font-bold tracking-tight font-['Inter'] mb-2"
                    style={{ color: "#1c1c1e", letterSpacing: "-0.015em" }}
                  >
                    AI Mock Interview
                  </h3>
                  <p className="text-stone-500 text-[13px] leading-relaxed font-['Inter']">
                    Face a live AI interviewer. Instant feedback on answers,
                    confidence, and communication quality.
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 flex-wrap">
                  <div
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border font-['Inter']"
                    style={{
                      color: "#059669",
                      background: "rgba(5,150,105,0.07)",
                      borderColor: "rgba(5,150,105,0.22)",
                    }}
                  >
                    Live AI · Real-time Feedback
                  </div>
                  <div className="flex items-center gap-1 group/cta flex-shrink-0">
                    <span
                      className="text-[12px] font-semibold font-['Inter']"
                      style={{ color: "#059669" }}
                    >
                      Start interview
                    </span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                      style={{ color: "#059669" }}
                    />
                  </div>
                </div>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(90deg, #059669, transparent 70%)" }}
              />
            </TiltCard>
          </div>
        </div>

        {/* ── Card 04: Connect 1:1 — full-width banner ── */}
        <TiltCard
          label="Connect 1:1"
          onClick={() =>
            window.open("https://topmate.io/hari_krishna_nallana", "_blank", "noopener,noreferrer")
          }
          glow="rgba(28,25,23,0.12)"
          border="rgba(28,25,23,0.22)"
          className="w-full rounded-2xl"
          style={{ background: "#ffffff" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 50% 120% at 92% 50%, rgba(28,25,23,0.05) 0%, transparent 65%)",
            }}
          />

          <div className="relative z-10 p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            {/* Left: icon + text */}
            <div className="flex items-center gap-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "#1c1917",
                }}
              >
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-0.5">
                  <div
                    className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter']"
                    style={{ color: "#78716c" }}
                  >
                    04
                  </div>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border font-['Inter']"
                    style={{
                      color: "#44403c",
                      background: "#f5f5f4",
                      borderColor: "#e7e5e4",
                    }}
                  >
                    PAID
                  </span>
                </div>
                <h3
                  className="text-xl font-bold tracking-tight font-['Inter'] mb-1"
                  style={{ color: "#1c1c1e", letterSpacing: "-0.015em" }}
                >
                  Connect 1:1
                </h3>
                <p className="text-stone-500 text-[13px] font-['Inter']">
                  Book a personal session with a placed expert. Tailored guidance,
                  real talk, real results.
                </p>
              </div>
            </div>

            {/* Right: avatar stack + CTA button */}
            <div className="flex flex-col sm:items-end gap-3 flex-shrink-0">
              <ConnectViz />
              <span
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold font-['Inter'] group/btn"
                style={{
                  background: "#1c1917",
                }}
              >
                Book a session
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </span>
            </div>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(90deg, #1c1917, transparent 70%)" }}
          />
        </TiltCard>

        {/* ── Card 05: Important Coding Questions Checklist — full-width banner ── */}
        <TiltCard
          label="Important Coding Questions"
          onClick={() => navigate("/coding-questions")}
          glow="rgba(220,38,38,0.14)"
          border="rgba(220,38,38,0.22)"
          className="w-full rounded-2xl"
          style={{ background: "rgba(255,249,249,0.97)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 50% 120% at 92% 50%, rgba(220,38,38,0.08) 0%, transparent 65%)",
            }}
          />

          <div className="relative z-10 p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            {/* Left: icon + text */}
            <div className="flex items-center gap-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(220,38,38,0.1)",
                  border: "1px solid rgba(220,38,38,0.18)",
                }}
              >
                <Code2 className="w-5 h-5" style={{ color: "#dc2626" }} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-0.5">
                  <div
                    className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter']"
                    style={{ color: "#dc2626" }}
                  >
                    05
                  </div>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border font-['Inter']"
                    style={{
                      color: "#dc2626",
                      background: "rgba(220,38,38,0.09)",
                      borderColor: "rgba(220,38,38,0.22)",
                    }}
                  >
                    DSA
                  </span>
                </div>
                <h3
                  className="text-xl font-bold tracking-tight font-['Inter'] mb-1"
                  style={{ color: "#1c1c1e", letterSpacing: "-0.015em" }}
                >
                  Important Coding Questions
                </h3>
                <p className="text-stone-500 text-[13px] font-['Inter']">
                  330+ curated DSA problems across 16 topics — Arrays, DP, Graphs, Trees & more. Track your progress with a built-in checklist.
                </p>
              </div>
            </div>

            {/* Right: viz + CTA */}
            <div className="flex flex-col sm:items-end gap-3 flex-shrink-0">
              <div className="w-40 hidden sm:block">
                <DSACheckViz />
              </div>
              <span
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold font-['Inter'] group/btn"
                style={{
                  background: "linear-gradient(135deg, #dc2626, #991b1b)",
                  boxShadow: "0 4px 16px rgba(220,38,38,0.28)",
                }}
              >
                Open Checklist
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </span>
            </div>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(90deg, #dc2626, transparent 70%)" }}
          />
        </TiltCard>

        {/* ── Row: Forge + Radar side by side ── */}
        <div className="flex flex-col md:flex-row gap-4">

          {/* ── Forge — Resume Builder ── */}
          <TiltCard
            id="onboarding-premium-card"
            label="Resume Builder"
            onClick={() => navigate("/forge")}
            glow="rgba(28,25,23,0.18)"
            border="rgba(255,255,255,0.07)"
            className="flex-1 rounded-2xl"
            style={{ background: "#1c1917" } as React.CSSProperties}
          >
            <div className="absolute bottom-3 right-5 pointer-events-none select-none">
              <span className="font-['Merriweather'] font-black text-[4.5rem] sm:text-[7rem]" style={{ color: "rgba(255,255,255,0.04)", lineHeight: 1 }}>06</span>
            </div>
            <div className="relative z-10 p-6 flex flex-col h-full gap-3">
              <div className="flex items-center justify-between">
                <p className="font-['Inter'] text-stone-500" style={{ fontSize: 9, letterSpacing: "0.38em", textTransform: "uppercase" }}>06 / Forge</p>
                <span className="font-['Inter'] font-bold text-stone-500" style={{ fontSize: 9, letterSpacing: "0.2em", border: "1px solid rgba(255,255,255,0.12)", padding: "2px 7px", borderRadius: 4 }}>FREE</span>
              </div>
              <div style={{ flex: 1 }} />
              <div>
                <h3 className="font-['Merriweather'] font-black text-stone-100" style={{ fontSize: "1.55rem", letterSpacing: "-0.02em", marginBottom: 8 }}>Resume Builder</h3>
                <p className="text-stone-500 font-['Inter']" style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>Upload PDF or DOCX — AI extracts everything. Export as LaTeX.</p>
                <div className="flex items-center gap-1.5 group/cta">
                  <Hammer className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-['Inter'] font-semibold text-stone-400" style={{ fontSize: 12 }}>Build resume</span>
                  <ArrowUpRight className="w-3 h-3 text-stone-500 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent 65%)" }} />
          </TiltCard>

          {/* ── Radar — Job Match ── */}
          <TiltCard
            id="onboarding-radar-card"
            label="Job Match"
            onClick={() => navigate("/radar")}
            glow="rgba(28,25,23,0.08)"
            border="rgba(28,25,23,0.07)"
            className="flex-1 rounded-2xl bg-white"
          >
            <div className="absolute top-4 right-4 pointer-events-none" style={{ opacity: 0.45 }}>
              <div style={{ width: 78, height: 78, animation: "scanRotate 8s linear infinite" }}>
                <svg width="78" height="78" viewBox="0 0 78 78" fill="none">
                  <circle cx="39" cy="39" r="36" stroke="rgba(28,25,23,0.2)" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="39" cy="39" r="23" stroke="rgba(28,25,23,0.12)" strokeWidth="0.75" />
                  <circle cx="39" cy="39" r="10" stroke="rgba(28,25,23,0.1)" strokeWidth="0.75" />
                  <line x1="39" y1="2" x2="39" y2="15" stroke="rgba(28,25,23,0.28)" strokeWidth="1" strokeLinecap="round" />
                  <line x1="39" y1="63" x2="39" y2="76" stroke="rgba(28,25,23,0.28)" strokeWidth="1" strokeLinecap="round" />
                  <line x1="2" y1="39" x2="15" y2="39" stroke="rgba(28,25,23,0.28)" strokeWidth="1" strokeLinecap="round" />
                  <line x1="63" y1="39" x2="76" y2="39" stroke="rgba(28,25,23,0.28)" strokeWidth="1" strokeLinecap="round" />
                  <path d="M 75 39 A 36 36 0 0 1 39 75" stroke="rgba(28,25,23,0.55)" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="39" cy="39" r="2.5" fill="rgba(28,25,23,0.5)" />
                </svg>
              </div>
            </div>
            <div className="relative z-10 p-6 flex flex-col h-full gap-3">
              <p className="font-['Inter'] text-stone-400" style={{ fontSize: 9, letterSpacing: "0.38em", textTransform: "uppercase" }}>07 / Radar</p>
              <div style={{ flex: 1 }} />
              <div>
                <h3 className="font-['Merriweather'] font-black text-stone-900" style={{ fontSize: "1.55rem", letterSpacing: "-0.02em", marginBottom: 8 }}>Job Match</h3>
                <p className="text-stone-400 font-['Inter']" style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>Skills scanned against real openings. Match score + gaps.</p>
                <div className="flex items-center gap-1.5 group/cta">
                  <Radar className="w-3.5 h-3.5 text-stone-500" />
                  <span className="font-['Inter'] font-semibold text-stone-500" style={{ fontSize: 12 }}>Scan now</span>
                  <ArrowUpRight className="w-3 h-3 text-stone-400 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg, rgba(28,25,23,0.18), transparent 65%)" }} />
          </TiltCard>

        </div>
      </div>
    </div>
  );
};
