import { useNavigate } from "react-router-dom";
import React, { useRef, useState, useCallback } from "react";
import { Users, ArrowUpRight, Hammer, Radar } from "lucide-react";
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
  @keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes ambientPulse {
    0%, 100% { opacity: 0.7; transform: scale(1); }
    50%       { opacity: 1;   transform: scale(1.1); }
  }
  @keyframes dotsPulse {
    0%   { opacity: 1; }
    33%  { opacity: 0.3; }
    66%  { opacity: 0.7; }
    100% { opacity: 1; }
  }
`;

// ─── Decorative visuals ───────────────────────────────────────────────────────

const ConnectViz = () => (
  <div style={{ display: "flex", alignItems: "center" }}>
    {[0.28, 0.37, 0.46, 0.55].map((op, i) => (
      <div
        key={i}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: `rgba(217,119,6,${op})`,
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
        color: "rgba(217,119,6,0.65)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      5000+ users
    </span>
  </div>
);

// ─── 3D Tilt wrapper ──────────────────────────────────────────────────────────

interface TiltCardProps {
  children: React.ReactNode;
  onClick: () => void;
  glow: string;
  border: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

const TiltCard = ({
  children,
  onClick,
  glow,
  border,
  className = "",
  style: extra = {},
  id,
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
      onMouseMove={mm}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => {
        setOn(false);
        setTilt({ x: 0, y: 0 });
        setLight({ x: 50, y: 35 });
      }}
      onClick={onClick}
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

        <p className="text-[0.92rem] text-stone-500 font-light max-w-[400px] leading-relaxed font-['Inter']">
          Four focused tools. Built for the exact hiring process you're preparing for.
        </p>
      </div>

      {/* ── Bento grid ───────────────────────────────────────────────────── */}
      <div ref={bentoRef} className="flex flex-col gap-4">

        {/* ── Row 1: Card 01 (tall left) + Cards 02 & 03 (stacked right) ── */}
        <div className="flex flex-col md:flex-row gap-4">

          {/* Card 01 — Cognitive Puzzles: black editorial, numeral bleeds off */}
          <div className="md:flex-[1.4] flex flex-col">
            <TiltCard
              id="onboarding-tr-group"
              onClick={() => onSelectCompany("accenture")}
              glow="rgba(28,25,23,0.12)"
              border="rgba(28,25,23,0.08)"
              className="flex-1 rounded-2xl bg-white"
            >
              {/* Dot matrix — puzzle pattern, top-right */}
              <div className="absolute top-6 right-6 pointer-events-none">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 11px)", gap: 4 }}>
                  {[0,1,0,0,1, 1,1,0,1,0, 0,1,1,0,1, 1,0,0,1,1, 0,1,1,0,0].map((lit, i) => (
                    <div key={i} style={{
                      width: 11, height: 11, borderRadius: 3,
                      background: lit ? "rgba(28,25,23,0.22)" : "rgba(28,25,23,0.05)",
                    }} />
                  ))}
                </div>
              </div>

              {/* Faded "01" ghost — stone, not outlined */}
              <div className="absolute bottom-4 right-5 pointer-events-none select-none">
                <span className="font-['Merriweather'] font-black" style={{ fontSize: "9rem", color: "rgba(28,25,23,0.04)", lineHeight: 1, userSelect: "none" }}>01</span>
              </div>

              <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full min-h-[280px] sm:min-h-[380px]">
                <p className="font-['Inter'] text-stone-400" style={{ fontSize: 9, letterSpacing: "0.38em", textTransform: "uppercase" }}>
                  Cognitive Games
                </p>

                <div style={{ flex: 1 }} />

                <div>
                  <h2 className="font-['Merriweather'] font-black text-stone-900" style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)", letterSpacing: "-0.02em", lineHeight: 1.12, marginBottom: 10 }}>
                    Sharpen<br />your edge.
                  </h2>
                  <p className="text-stone-400 font-['Inter']" style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 210, marginBottom: 20 }}>
                    Matrix Flow · Balloon Math · Hidden Maze
                  </p>
                  <div className="flex items-center gap-1.5 group/cta">
                    <span className="font-['Inter'] font-semibold text-stone-500" style={{ fontSize: 13 }}>Start training</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg, rgba(28,25,23,0.18), transparent 65%)" }} />
            </TiltCard>
          </div>

          {/* Right column: Cards 02 + 03 stacked */}
          <div className="md:flex-1 flex flex-col gap-4">

            {/* Card 02 — Communication: warm parchment, waveform as hero */}
            <TiltCard
              id="onboarding-comm-card"
              onClick={() => navigate("/game/communication-patterns")}
              glow="rgba(28,25,23,0.08)"
              border="rgba(28,25,23,0.07)"
              className="flex-1 rounded-2xl bg-white"
            >
              <div className="relative z-10 p-6 flex flex-col h-full min-h-[160px]">
                <p className="font-['Inter'] text-stone-400" style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase" }}>
                  02 / Communication
                </p>

                {/* Waveform spans full width as hero visual */}
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", marginLeft: -6, marginRight: -6, minHeight: 56, paddingTop: 12 }}>
                  {[38,72,51,88,44,95,62,78,33,85,58,70,42,90,55,48,80,65,92,40,74,56,88,44,70].map((h, i) => (
                    <div key={i} style={{
                      flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0",
                      background: `rgba(28,25,23,${0.06 + (h / 100) * 0.3})`,
                      animation: `waveBar ${0.32 + (i % 5) * 0.11}s ease-in-out ${i * 0.04}s infinite alternate`,
                      transformOrigin: "bottom",
                    }} />
                  ))}
                </div>

                {/* Heading overlaps the wave bottom */}
                <div style={{ marginTop: "-1.5rem", position: "relative", zIndex: 2 }}>
                  <h3 className="font-['Merriweather'] font-black text-stone-900" style={{ fontSize: "clamp(1.9rem, 4vw, 2.5rem)", letterSpacing: "-0.025em", lineHeight: 1 }}>
                    Speak up.
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <p className="text-stone-400 font-['Inter']" style={{ fontSize: 11 }}>Reading · Listening · Speaking</p>
                  <div className="flex items-center gap-1 group/cta">
                    <span className="font-['Inter'] font-semibold text-stone-500" style={{ fontSize: 12 }}>Start round</span>
                    <ArrowUpRight className="w-3 h-3 text-stone-400 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg, rgba(28,25,23,0.18), transparent 65%)" }} />
            </TiltCard>

            {/* Card 03 — AI Interview: dark terminal, scanlines */}
            <TiltCard
              id="onboarding-ai-card"
              onClick={() => navigate("/ai-interview")}
              glow="rgba(28,25,23,0.1)"
              border="rgba(28,25,23,0.07)"
              className="flex-1 rounded-2xl"
              style={{ background: "#f7f6f4" } as React.CSSProperties}
            >
              <div className="relative z-10 p-6 flex flex-col h-full min-h-[160px] gap-3">
                <p className="font-['Inter'] text-stone-400" style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase" }}>
                  03 / AI Interview
                </p>

                {/* Terminal lines — stone tones */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
                  {[
                    { line: "> Initializing interview.exe", op: 0.25 },
                    { line: "> Calibrating speech model...", op: 0.35 },
                    { line: "  Confidence baseline: 78%", op: 0.48 },
                    { line: "> Session ready. Speak now.", op: 0.62 },
                  ].map(({ line, op }, i) => (
                    <p key={i} className="font-['Inter']" style={{ fontFamily: "monospace", fontSize: 10, color: `rgba(28,25,23,${op})`, lineHeight: 1.55 }}>{line}</p>
                  ))}
                  <p className="font-['Inter']" style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(28,25,23,0.55)", lineHeight: 1.55 }}>
                    &gt; <span style={{ animation: "cursorBlink 1s step-end infinite" }}>█</span>
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-['Merriweather'] font-black text-stone-800" style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
                    AI Mock Interview
                  </h3>
                  <span className="font-['Inter'] font-semibold text-stone-500" style={{ fontSize: 11 }}>
                    Enter →
                  </span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg, rgba(28,25,23,0.18), transparent 65%)" }} />
            </TiltCard>
          </div>
        </div>

        {/* ── Card 04: Connect 1:1 — editorial amber banner ── */}
        <TiltCard
          id="onboarding-connect-card"
          onClick={() => navigate("/connect")}
          glow="rgba(217,119,6,0.14)"
          border="rgba(217,119,6,0.18)"
          className="w-full rounded-2xl"
          style={{ background: "#fffbf0" } as React.CSSProperties}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 35% 130% at 96% 50%, rgba(217,119,6,0.07) 0%, transparent 60%)" }} />

          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
            {/* Left: giant editorial "1:1" — the headline IS the icon */}
            <div className="flex-shrink-0">
              <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.35em", color: "rgba(180,83,9,0.45)", textTransform: "uppercase", marginBottom: 2 }}>04 / Connect</p>
              <h3 className="font-['Merriweather'] font-black" style={{
                fontSize: "clamp(3.2rem, 7vw, 5rem)",
                color: "rgba(180,83,9,0.88)",
                letterSpacing: "-0.04em", lineHeight: 0.9,
              }}>1:1</h3>
            </div>

            {/* Vertical divider */}
            <div className="hidden sm:block w-px self-stretch" style={{ background: "rgba(217,119,6,0.14)", minHeight: 52 }} />

            {/* Middle: description */}
            <div className="flex-1 min-w-0">
              <h4 style={{ fontFamily: "'Merriweather', Georgia, serif", fontSize: "1.15rem", fontWeight: 700, color: "rgba(28,24,20,0.78)", letterSpacing: "-0.01em", marginBottom: 5 }}>
                Book a session with a placed expert.
              </h4>
              <p style={{ fontSize: 13, color: "rgba(28,24,20,0.42)", fontFamily: "'Inter',sans-serif", lineHeight: 1.55 }}>
                Students who cracked the same process — last month. Real guidance, real results.
              </p>
            </div>

            {/* Right: avatar stack + CTA */}
            <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
              <ConnectViz />
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold font-['Inter'] group/btn transition-all hover:scale-[1.03] active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg, #d97706, #b45309)", boxShadow: "0 4px 16px rgba(217,119,6,0.26)" }}
              >
                Book now
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg, rgba(217,119,6,0.45), transparent 65%)" }} />
        </TiltCard>

        {/* ── Row 3: Forge + Radar (left) + Coming Soon (right) ── */}
        <div className="flex flex-col md:flex-row gap-4">

          {/* Left column — Forge + Radar stacked */}
          <div className="md:flex-1 flex flex-col gap-4">

            {/* ── Card 05: Forge — dark, "FORGE" ghost bleeds off ── */}
            <TiltCard
              id="onboarding-premium-card"
              onClick={() => navigate("/forge")}
              glow="rgba(28,25,23,0.18)"
              border="rgba(255,255,255,0.07)"
              className="flex-1 rounded-2xl"
              style={{ background: "#1c1917" } as React.CSSProperties}
            >
              {/* Faded "05" stone ghost */}
              <div className="absolute bottom-3 right-5 pointer-events-none select-none">
                <span className="font-['Merriweather'] font-black" style={{ fontSize: "7rem", color: "rgba(255,255,255,0.04)", lineHeight: 1 }}>05</span>
              </div>
              <div className="relative z-10 p-6 flex flex-col h-full gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-['Inter'] text-stone-500" style={{ fontSize: 9, letterSpacing: "0.38em", textTransform: "uppercase" }}>05 / Forge</p>
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

            {/* ── Card 06: Radar — pale lavender, SVG radar as visual ── */}
            <TiltCard
              id="onboarding-radar-card"
              onClick={() => navigate("/radar")}
              glow="rgba(28,25,23,0.08)"
              border="rgba(28,25,23,0.07)"
              className="flex-1 rounded-2xl bg-white"
            >
              {/* Rotating radar SVG — stone toned */}
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
                <p className="font-['Inter'] text-stone-400" style={{ fontSize: 9, letterSpacing: "0.38em", textTransform: "uppercase" }}>06 / Radar</p>
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

          {/* Right column — Coming Soon (tall, Classified Transmission) */}
          <div className="md:flex-[1.4] flex flex-col">
            <div
              className="flex-1 rounded-2xl overflow-hidden relative min-h-[300px] sm:min-h-[400px] select-none"
              style={{
                background: "#07060a",
                border: "1px solid rgba(251,191,36,0.08)",
                boxShadow: "inset 0 0 80px rgba(251,191,36,0.025), 0 8px 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* Ambient warm glow blob */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div style={{
                  width: 300, height: 300, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, rgba(251,146,60,0.03) 45%, transparent 70%)",
                  animation: "ambientPulse 5s ease-in-out infinite",
                }} />
              </div>

              {/* Giant ? backdrop glyph */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <span style={{
                  fontFamily: "'Merriweather', Georgia, serif",
                  fontSize: "18rem", fontWeight: 900, fontStyle: "italic",
                  color: "rgba(251,191,36,0.025)", lineHeight: 1, userSelect: "none",
                  marginTop: "1.5rem",
                }}>?</span>
              </div>

              {/* CLASSIFIED ghost stamp */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: "rotate(-16deg)", marginTop: "-3rem" }}>
                <span style={{
                  fontFamily: "'Merriweather', Georgia, serif",
                  fontSize: "2rem", fontWeight: 900, letterSpacing: "0.3em",
                  color: "rgba(239,68,68,0.055)",
                  border: "2.5px solid rgba(239,68,68,0.055)",
                  padding: "3px 14px", textTransform: "uppercase", whiteSpace: "nowrap",
                }}>CLASSIFIED</span>
              </div>

              {/* Rotating targeting reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div style={{ width: 150, height: 150, animation: "scanRotate 14s linear infinite" }}>
                  <svg width="150" height="150" viewBox="0 0 150 150" fill="none">
                    {/* Outer dashed ring */}
                    <circle cx="75" cy="75" r="70" stroke="rgba(251,191,36,0.1)" strokeWidth="1" strokeDasharray="6 5" />
                    {/* Inner ring */}
                    <circle cx="75" cy="75" r="42" stroke="rgba(251,191,36,0.07)" strokeWidth="0.75" />
                    {/* Tick lines */}
                    <line x1="75" y1="2"   x2="75" y2="28"  stroke="rgba(251,191,36,0.2)" strokeWidth="1" strokeLinecap="round" />
                    <line x1="75" y1="122" x2="75" y2="148" stroke="rgba(251,191,36,0.2)" strokeWidth="1" strokeLinecap="round" />
                    <line x1="2"   y1="75" x2="28"  y2="75" stroke="rgba(251,191,36,0.2)" strokeWidth="1" strokeLinecap="round" />
                    <line x1="122" y1="75" x2="148" y2="75" stroke="rgba(251,191,36,0.2)" strokeWidth="1" strokeLinecap="round" />
                    {/* Bright arc sweep — single quadrant */}
                    <path d="M 145 75 A 70 70 0 0 1 75 145" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 145 75 A 70 70 0 0 1 108 18" stroke="rgba(251,191,36,0.18)" strokeWidth="0.75" strokeLinecap="round" />
                    {/* Center pip */}
                    <circle cx="75" cy="75" r="3.5" fill="rgba(251,191,36,0.55)" />
                    <circle cx="75" cy="75" r="1.5" fill="rgba(251,191,36,0.9)" />
                  </svg>
                </div>
              </div>

              {/* Main content layer */}
              <div className="relative z-10 p-7 sm:p-9 flex flex-col h-full">

                {/* Top row */}
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.4em", color: "rgba(255,255,255,0.16)", textTransform: "uppercase" }}>07</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", color: "rgba(251,191,36,0.5)", textTransform: "uppercase" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(251,191,36,0.65)", display: "inline-block", animation: "cursorBlink 1.8s step-end infinite" }} />
                    RESTRICTED
                  </span>
                </div>

                <div className="flex-1" />

                {/* Hero block */}
                <div className="text-center space-y-4">
                  <p style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 600, letterSpacing: "0.3em", color: "rgba(251,191,36,0.35)", textTransform: "uppercase" }}>
                    INCOMING TRANSMISSION
                  </p>

                  <h3 style={{
                    fontFamily: "'Merriweather', Georgia, serif",
                    fontSize: "clamp(1.7rem, 2.8vw, 2.3rem)",
                    fontWeight: 900, fontStyle: "italic",
                    color: "rgba(255,252,245,0.82)",
                    letterSpacing: "-0.02em", lineHeight: 1.15,
                  }}>
                    Something<br />
                    <span style={{ color: "rgba(251,191,36,0.92)" }}>new</span>
                    <span style={{ animation: "cursorBlink 1.1s step-end infinite", color: "rgba(251,191,36,0.85)", fontStyle: "normal", marginLeft: 2 }}>_</span>
                  </h3>

                  {/* Redacted content bars */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "center", paddingTop: 4 }}>
                    {[72, 52, 64].map((w, i) => (
                      <div key={i} style={{ width: w, height: 5, borderRadius: 2, background: "rgba(255,255,255,0.1)", animation: `dotsPulse ${1.8 + i * 0.4}s ease-in-out ${i * 0.25}s infinite` }} />
                    ))}
                  </div>

                  <p style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.12em", color: "rgba(251,191,36,0.28)", paddingTop: 2 }}>
                    DECRYPTING
                    <span style={{ animation: "cursorBlink 0.55s step-end infinite" }}>...</span>
                  </p>
                </div>

                <div className="flex-1" />

                {/* Footer row */}
                <div className="flex items-center justify-between pt-2">
                  <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.12)", textTransform: "uppercase" }}>ETA: UNKNOWN</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "monospace", fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", color: "rgba(251,191,36,0.38)", textTransform: "uppercase" }}>
                    <span className="relative flex" style={{ width: 6, height: 6 }}>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: "rgba(251,191,36,0.5)", opacity: 0.65 }} />
                      <span className="relative inline-flex rounded-full" style={{ width: 6, height: 6, background: "rgba(251,191,36,0.6)" }} />
                    </span>
                    IN DEV
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>


      </div>
    </div>
  );
};
