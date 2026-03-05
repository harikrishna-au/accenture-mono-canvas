
import { Star } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Testimonial {
  text: string;
  author: string;
  role: string;
  stars: number;
  w: number; // px width — creates the brick-wall misalignment
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ROW_1: Testimonial[] = [
  {
    text: "Harry The Blaze is really helpful, especially for candidates who are not familiar with the MNC assessment process. I genuinely appreciate the effort put into creating it.",
    author: "Aspiring Candidate",
    role: "MNC Applicant",
    stars: 5,
    w: 390,
  },
  {
    text: "Got placed at Accenture after a week of serious practice here. The cognitive drills hit different.",
    author: "Karthik S.",
    role: "Placed · Accenture",
    stars: 5,
    w: 260,
  },
  {
    text: "The cognitive games really build raw speed. I could feel a measurable difference in the actual test. Nothing else I tried came close.",
    author: "Priya R.",
    role: "Engineering Student",
    stars: 5,
    w: 420,
  },
  {
    text: "I used to freeze during assessments. Not anymore.",
    author: "Divya M.",
    role: "Campus Applicant",
    stars: 5,
    w: 215,
  },
  {
    text: "Overall, my experience was excellent. Well designed and the practice structure is really helpful — better than any YouTube playlist I tried.",
    author: "User Feedback",
    role: "Platform User",
    stars: 5,
    w: 370,
  },
  {
    text: "Practiced every day for two weeks. Cleared the cognitive round on my first attempt. Balloon Math is genuinely addictive.",
    author: "Rahul T.",
    role: "Off-Campus Applicant",
    stars: 5,
    w: 340,
  },
];

const ROW_2: Testimonial[] = [
  {
    text: "The AI interview feedback was brutally honest — and that's exactly what I needed. Real improvement, not validation.",
    author: "Sneha K.",
    role: "Final Year, CSE",
    stars: 5,
    w: 355,
  },
  {
    text: "Ha sir, no option for unselecting the bubble — excellent work either way. This helps to practice more, hope you keep it like that.",
    author: "Student",
    role: "Campus Applicant",
    stars: 5,
    w: 390,
  },
  {
    text: "Short, sharp, effective. This is what exam prep should look like.",
    author: "Vikram N.",
    role: "MNC Aspirant",
    stars: 5,
    w: 230,
  },
  {
    text: "The platform feels like it was made by someone who actually sat through these assessments. Every feature is intentional and purposeful.",
    author: "Ananya P.",
    role: "Engineering Graduate",
    stars: 5,
    w: 430,
  },
  {
    text: "Thanks for your portal buddy — really helped with cognitive assessment. Company conducted the selection yesterday for on campus.",
    author: "On-Campus Student",
    role: "Placed Candidate",
    stars: 5,
    w: 320,
  },
  {
    text: "Add the updated Communication Round pattern from Round 1 till final selection — would be extremely helpful for future candidates.",
    author: "Community Member",
    role: "Student",
    stars: 4,
    w: 360,
  },
];

// ─── Accent palette (matches bento tiles) ─────────────────────────────────────

const ACCENTS = [
  {
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.055)",
    border: "rgba(124,58,237,0.13)",
    quote: "rgba(124,58,237,0.11)",
    avatar: "linear-gradient(135deg,#7c3aed,#a78bfa)",
  },
  {
    color: "#0891b2",
    bg: "rgba(8,145,178,0.055)",
    border: "rgba(8,145,178,0.13)",
    quote: "rgba(8,145,178,0.11)",
    avatar: "linear-gradient(135deg,#0891b2,#38bdf8)",
  },
  {
    color: "#059669",
    bg: "rgba(5,150,105,0.055)",
    border: "rgba(5,150,105,0.13)",
    quote: "rgba(5,150,105,0.11)",
    avatar: "linear-gradient(135deg,#059669,#34d399)",
  },
  {
    color: "#d97706",
    bg: "rgba(217,119,6,0.055)",
    border: "rgba(217,119,6,0.13)",
    quote: "rgba(217,119,6,0.11)",
    avatar: "linear-gradient(135deg,#d97706,#fbbf24)",
  },
  {
    color: "#e11d48",
    bg: "rgba(225,29,72,0.055)",
    border: "rgba(225,29,72,0.13)",
    quote: "rgba(225,29,72,0.11)",
    avatar: "linear-gradient(135deg,#e11d48,#fb7185)",
  },
  {
    color: "#0891b2",
    bg: "rgba(8,145,178,0.055)",
    border: "rgba(8,145,178,0.13)",
    quote: "rgba(8,145,178,0.11)",
    avatar: "linear-gradient(135deg,#0891b2,#38bdf8)",
  },
];

// ─── CSS keyframes ─────────────────────────────────────────────────────────────

const STYLES = `
  @keyframes ts-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .ts-row-a {
    animation: ts-scroll 52s linear infinite;
  }
  .ts-row-b {
    animation: ts-scroll 40s linear infinite;
    animation-delay: -14s;
  }
  .ts-row-a:hover,
  .ts-row-b:hover {
    animation-play-state: paused;
  }
`;

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({
  t,
  accent,
}: {
  t: Testimonial;
  accent: (typeof ACCENTS)[0];
}) {
  return (
    <div
      className="flex-shrink-0 rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4"
      style={{
        width: t.w,
        background: "#ffffff",
        border: `1px solid ${accent.border}`,
        boxShadow: "0 3px 20px rgba(0,0,0,0.038)",
      }}
    >
      {/* Accent wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 85% 60% at 0% 0%, ${accent.bg} 0%, transparent 70%)`,
        }}
      />

      {/* Decorative quote */}
      <div
        className="absolute top-1 right-4 select-none pointer-events-none leading-none"
        style={{
          fontSize: 76,
          fontFamily: "Georgia, serif",
          color: accent.quote,
          fontWeight: 700,
        }}
      >
        "
      </div>

      <div className="relative z-10 flex flex-col gap-4 h-full">
        {/* Stars */}
        <div className="flex gap-0.5">
          {Array.from({ length: t.stars }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-current" style={{ color: accent.color }} />
          ))}
          {Array.from({ length: 5 - t.stars }).map((_, i) => (
            <Star key={`e${i}`} className="w-3 h-3" style={{ color: "rgba(0,0,0,0.08)" }} />
          ))}
        </div>

        {/* Quote text */}
        <p className="text-stone-600 text-[13px] leading-relaxed font-['Inter'] flex-1">
          "{t.text}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[12px] font-bold"
            style={{ background: accent.avatar }}
          >
            {t.author[0]}
          </div>
          <div>
            <p className="text-[11.5px] font-bold text-stone-800 font-['Inter'] leading-tight">
              {t.author}
            </p>
            <p
              className="text-[9.5px] font-semibold uppercase tracking-[0.1em] font-['Inter'] mt-0.5"
              style={{ color: accent.color }}
            >
              {t.role}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1.5px]"
        style={{
          background: `linear-gradient(90deg, ${accent.color}, transparent 60%)`,
          opacity: 0.45,
        }}
      />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const TestimonialScroller = () => {
  // Duplicate each row for seamless infinite loop
  const r1 = [...ROW_1, ...ROW_1];
  const r2 = [...ROW_2, ...ROW_2];

  return (
    <div className="w-full overflow-hidden bg-[#fcfcf9]">
      <style>{STYLES}</style>

      {/* Top divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

      <div className="py-10 sm:py-20">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-14 px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 text-stone-500 text-[10.5px] font-semibold tracking-[0.2em] uppercase font-['Inter'] mb-5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Student Reviews
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-stone-800 tracking-tight leading-tight">
            Trusted by aspirants
            <br />
            <span className="text-stone-400 font-light italic">across campuses.</span>
          </h2>
        </div>

        {/* Brick scroller */}
        <div className="relative">
          {/* Edge fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-44 z-10 bg-gradient-to-r from-[#fcfcf9] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-44 z-10 bg-gradient-to-l from-[#fcfcf9] to-transparent pointer-events-none" />

          {/* Row 1 */}
          <div className="ts-row-a flex w-max gap-3.5 px-4 mb-3.5 items-stretch">
            {r1.map((t, i) => (
              <Card key={i} t={t} accent={ACCENTS[i % ACCENTS.length]} />
            ))}
          </div>

          {/* Row 2 — different card widths + different speed = brick wall effect */}
          <div className="ts-row-b flex w-max gap-3.5 px-4 items-stretch">
            {r2.map((t, i) => (
              <Card key={i} t={t} accent={ACCENTS[(i + 2) % ACCENTS.length]} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
    </div>
  );
};
