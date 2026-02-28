import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { ArrowLeft, ArrowUpRight, Users, Code2, Briefcase, Presentation } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Interview types ──────────────────────────────────────────────────────────

const ACTIVE = [
  {
    num: "01",
    name: "HR Interview",
    path: "/ai-interview/hr",
    desc: "Behavioral and situational questions focused on your personality, communication, and cultural fit. Real-time feedback on confidence and articulation.",
    points: ["Tell me about yourself", "Strengths & weaknesses", "Situation-based scenarios", "Career goals & motivation"],
    tag: "Behavioral · Soft Skills",
    color: "#e11d48",
    bg: "rgba(225,29,72,0.06)",
    border: "rgba(225,29,72,0.17)",
    glow: "rgba(225,29,72,0.14)",
    Icon: Users,
  },
  {
    num: "02",
    name: "Technical Interview",
    path: "/ai-interview/technical",
    desc: "CS fundamentals, data structures, algorithms, and role-specific technical questions. Assessed on accuracy, depth, and problem-solving clarity.",
    points: ["Data structures & algorithms", "OOP & system concepts", "Role-specific questions", "Code walkthrough & logic"],
    tag: "DSA · CS Fundamentals",
    color: "#059669",
    bg: "rgba(5,150,105,0.06)",
    border: "rgba(5,150,105,0.17)",
    glow: "rgba(5,150,105,0.14)",
    Icon: Code2,
  },
];

const COMING_SOON = [
  {
    num: "03",
    name: "Case Study Round",
    desc: "Business case simulations and consulting-style problem-solving interviews.",
    tag: "Business · Consulting",
    Icon: Briefcase,
  },
  {
    num: "04",
    name: "Group Discussion Sim",
    desc: "AI-moderated topic-based group discussion with participation and argument scoring.",
    tag: "Communication · Leadership",
    Icon: Presentation,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const AIInterviewSelection = () => {
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
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[#fcfcf9]">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-stone-50 to-transparent opacity-60" />
      </div>

      <div ref={containerRef} className="w-full max-w-4xl mx-auto px-6 py-12 opacity-0 min-h-screen">

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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Live AI Interviewer
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-stone-800 tracking-tight leading-[1.15] mb-2">
            AI Mock Interview
          </h1>
          <p className="text-stone-400 text-[0.88rem] font-['Inter'] font-light">
            Choose your interview type. The AI adapts its questions and feedback style to match.
          </p>
        </div>

        {/* ── Active interview types ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {ACTIVE.map((item) => (
            <div
              key={item.num}
              onClick={() => navigate(item.path)}
              className="relative rounded-2xl p-7 flex flex-col gap-6 cursor-pointer group overflow-hidden"
              style={{
                background: "#ffffff",
                border: `1px solid ${item.border}`,
                boxShadow: "0 3px 16px rgba(0,0,0,0.04)",
                transition: "box-shadow 0.22s ease, transform 0.22s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px ${item.glow}, 0 0 0 1.5px ${item.border}`;
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
                  background: `radial-gradient(ellipse 90% 65% at 10% 0%, ${item.bg} 0%, transparent 68%)`,
                }}
              />
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${item.color}, transparent 70%)` }}
              />

              <div className="relative z-10 flex flex-col gap-6 h-full">
                {/* Header */}
                <div>
                  <div
                    className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-2.5"
                    style={{ color: item.color }}
                  >
                    {item.num}
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: item.bg, border: `1px solid ${item.border}` }}
                  >
                    <item.Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <h3
                    className="text-[1.25rem] font-bold tracking-tight font-['Inter'] mb-2"
                    style={{ color: "#1c1c1e", letterSpacing: "-0.015em" }}
                  >
                    {item.name}
                  </h3>
                  <p className="text-stone-500 text-[13px] leading-relaxed font-['Inter']">
                    {item.desc}
                  </p>
                </div>

                {/* What's covered */}
                <div className="flex-1">
                  <p
                    className="text-[9.5px] font-bold tracking-[0.18em] uppercase font-['Inter'] mb-2.5"
                    style={{ color: item.color, opacity: 0.7 }}
                  >
                    Covers
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {item.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-2 font-['Inter']">
                        <span
                          className="w-1 h-1 rounded-full flex-shrink-0"
                          style={{ background: item.color, opacity: 0.5 }}
                        />
                        <span className="text-[12.5px] text-stone-500">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold tracking-wide border font-['Inter']"
                    style={{ color: item.color, background: item.bg, borderColor: item.border }}
                  >
                    {item.tag}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[12px] font-semibold font-['Inter']" style={{ color: item.color }}>
                      Start now
                    </span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      style={{ color: item.color }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Coming soon ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMING_SOON.map((item) => (
            <div
              key={item.num}
              className="relative rounded-2xl p-6 flex flex-col gap-4 overflow-hidden select-none"
              style={{
                background: "#f9f9f8",
                border: "1px solid rgba(0,0,0,0.055)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.025)",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-2 text-stone-300">
                    {item.num}
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-100 border border-stone-200">
                    <item.Icon className="w-5 h-5 text-stone-300" />
                  </div>
                </div>
                <div className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider border border-stone-200 text-stone-300 font-['Inter']">
                  Coming Soon
                </div>
              </div>

              <div>
                <h3
                  className="text-[1.05rem] font-bold tracking-tight font-['Inter'] mb-1.5 text-stone-300"
                  style={{ letterSpacing: "-0.015em" }}
                >
                  {item.name}
                </h3>
                <p className="text-stone-300 text-[12.5px] leading-relaxed font-['Inter']">
                  {item.desc}
                </p>
              </div>

              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold tracking-wide border border-stone-200 text-stone-300 font-['Inter'] w-fit">
                {item.tag}
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
};

export default AIInterviewSelection;
