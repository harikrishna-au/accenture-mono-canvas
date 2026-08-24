import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowLeft, ChevronDown, Zap, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import {
  INFY_BLUE, INFY_BG, INFY_BDR,
  PRIMARY_TONE, ACCENT_TONE, NEUTRAL_TONE,
} from "./theme";

// ─── Tips data ─────────────────────────────────────────────────────────────────

type Tip = { text: string; type?: "do" | "dont" | "info" };
type Section = { title: string; subtitle: string; tips: Tip[] };

const ROUND1_TIPS: Section[] = [
  {
    title: "Time Allocation",
    subtitle: "How to divide your 3 hours across 3 problems (Round 1)",
    tips: [
      { text: "Problem 1 (Easy): Aim to solve in under 25 minutes — it's a warm-up. Don't over-engineer.", type: "do" },
      { text: "Problem 2 (Medium): Budget 50–60 minutes. This is where most shortlisting marks are decided.", type: "do" },
      { text: "Problem 3 (Hard): Spend the remaining time here. Even a partial solution (20–30 testcases) is valuable.", type: "info" },
      { text: "Never spend more than 90 minutes on Problem 2 alone — you'll lose time on Problem 1 corrections.", type: "dont" },
      { text: "Use the first 5 minutes to read ALL problems before coding. Choose the order strategically.", type: "do" },
    ],
  },
  {
    title: "Scoring & Role Shortlisting",
    subtitle: "How your Round 1 score maps to shortlisting for DSE or SP roles",
    tips: [
      { text: "DSE (₹7 LPA): Solve Problems 1 & 2 fully. Partial on Problem 3 helps strengthen your case.", type: "info" },
      { text: "SP Shortlisting: All 3 problems solved fully or near-fully. Requires mastery of Hard-tier DSA.", type: "info" },
      { text: "There's NO negative marking — always submit something, even if brute-force. Partial marks exist.", type: "do" },
      { text: "Don't leave Problem 1 unsolved to focus only on Problem 3 — the easy problem has guaranteed points.", type: "dont" },
      { text: "Shortlisting for both DSE and SP roles happens based on performance in this single Round 1 test.", type: "info" },
    ],
  },
  {
    title: "Language & Platform",
    subtitle: "Platform specifics to know before sitting the exam (Virtual mode)",
    tips: [
      { text: "Allowed languages: C, C++, Java, Python, JavaScript. Python recommended for brevity.", type: "do" },
      { text: "The test is conducted virtually — ensure stable internet, a quiet environment, and a working webcam.", type: "info" },
      { text: "Familiarize yourself with HackerEarth/HackerRank IDE before exam day — no setup surprises.", type: "do" },
      { text: "Test your solution against all provided examples before submitting. Check edge cases: n=0, n=1.", type: "do" },
      { text: "Don't use print() for debugging in your final submission — it adds noise but won't fail the run.", type: "dont" },
    ],
  },
  {
    title: "Common Mistakes",
    subtitle: "What trips up even prepared candidates in Round 1",
    tips: [
      { text: "Integer overflow: Always use long/int64 in Java/C++ when dealing with large numbers.", type: "dont" },
      { text: "Off-by-one errors: Recheck your loop bounds, especially in binary search and DP transitions.", type: "dont" },
      { text: "Reading the problem wrong: The 'Hard' problem often has a clever observation that makes it Medium.", type: "info" },
      { text: "Skipping constraints: Check n carefully — O(n²) with n=10⁵ will TLE. Plan time complexity first.", type: "dont" },
      { text: "Not testing edge cases: Empty array, single element, all-same elements. Add these to your checklist.", type: "dont" },
    ],
  },
];

const ROUND2_TIPS: Section[] = [
  {
    title: "Round 2 Format",
    subtitle: "4 questions (Easy, Medium, Hard, Complex) — choose any 3 to solve in 3 hours. Physical/On-site.",
    tips: [
      { text: "You will see 4 problems but only need to submit solutions for 3. Skip the one you find hardest.", type: "info" },
      { text: "Start by reading all 4 problems (5 min). Pick the 3 easiest relative to your strengths.", type: "do" },
      { text: "The 'Complex' problem is often an advanced graph, DP, or combinatorics problem — only attempt if confident.", type: "info" },
      { text: "Don't skip all hard problems — the 'Hard' level here is roughly equivalent to Round 1's Medium.", type: "dont" },
      { text: "Mode is Physical: bring ID proof, a charged laptop, and arrive 30 minutes early.", type: "do" },
    ],
  },
  {
    title: "SP Role Strategy in Round 2",
    subtitle: "Round 2 is where SP L1, L2, L3 roles are decided",
    tips: [
      { text: "SP L1 (₹11 LPA): Solve all 3 chosen problems fully. Clean code and optimal solutions matter. Campus offers can differ.", type: "info" },
      { text: "SP L2/L3 (₹16–21 LPA): Solving harder combinations (Medium + Hard + Complex) distinguishes you.", type: "info" },
      { text: "Code quality and approach matter — write readable code with comments where needed.", type: "do" },
      { text: "Don't rush to submit — test against edge cases before final submission in Round 2 too.", type: "dont" },
    ],
  },
];

const INTERVIEW_TIPS: Section[] = [
  {
    title: "Interview Structure",
    subtitle: "What to expect in the ~1 hour HackWithInfy interview",
    tips: [
      { text: "The interview evaluates both technical skills and behavioral/cultural fit.", type: "info" },
      { text: "CS/IT students: DSA, automata theory, compilers, computer networks, OS, digital signal processing, OOP.", type: "info" },
      { text: "Other stream students: DSA, computer networks, digital electronics, DSP, mathematics, OOP, control systems.", type: "info" },
      { text: "Prepare a crisp 90-second 'introduce yourself' — the first 5 minutes almost always start here.", type: "do" },
      { text: "Don't assume you'll get the same questions as a CS/IT student if you're from ECE/EEE/Mech.", type: "dont" },
    ],
  },
  {
    title: "Technical Discussion Tips",
    subtitle: "How to handle CS fundamentals and DSA questions",
    tips: [
      { text: "OOPs: Always support your answers with examples from real code. Abstract definitions alone won't impress.", type: "do" },
      { text: "OS: Deadlock (4 conditions), Process vs Thread (key: shared memory), Scheduling (RR is most asked) — drill these.", type: "info" },
      { text: "Networks: OSI model layers, TCP vs UDP, HTTP vs HTTPS, DNS resolution — common across all streams.", type: "info" },
      { text: "If you don't know an answer, say 'I'm not certain, but here's my understanding' — never bluff confidently.", type: "dont" },
      { text: "Think out loud when solving DSA problems — interviewers value your reasoning process.", type: "do" },
    ],
  },
  {
    title: "Role-Specific Strategy",
    subtitle: "What changes between DSE and SP interviews",
    tips: [
      { text: "DSE Interview: Moderate DSA + CS fundamentals. Interviewers test core concepts, not advanced topics.", type: "info" },
      { text: "SP Interview: Harder DSA required. Deeper CS theory expected. May include system design basics.", type: "info" },
      { text: "SP L2/L3: Be ready for complex algorithmic problems and architecture-level questions.", type: "info" },
      { text: "Know the exact role compensations — interviewers sometimes test if you've researched the roles.", type: "do" },
      { text: "Don't mention salary expectations unless directly asked — focus on problem-solving confidence.", type: "dont" },
    ],
  },
];

// ─── TipItem ──────────────────────────────────────────────────────────────────

// Do / avoid / info are separated by icon, so they share the section palette:
// blue for recommended actions, gold for cautions, neutral for context.
const TYPE_COLORS = {
  do: PRIMARY_TONE,
  dont: ACCENT_TONE,
  info: NEUTRAL_TONE,
};

const TipItem = ({ tip }: { tip: Tip }) => {
  const t = tip.type ?? "info";
  const { color } = TYPE_COLORS[t];
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex-shrink-0 mt-0.5">
        {t === "do"   && <CheckCircle2 className="w-4 h-4" style={{ color }} />}
        {t === "dont" && <AlertTriangle className="w-4 h-4" style={{ color }} />}
        {t === "info" && <Zap className="w-3.5 h-3.5 mt-0.5" style={{ color }} />}
      </div>
      <p className="text-[13px] font-['Inter'] text-stone-600 leading-relaxed">{tip.text}</p>
    </div>
  );
};

// ─── Accordion section ────────────────────────────────────────────────────────

const AccordionSection = ({ section, accent }: { section: Section; accent: { color: string; bg: string; border: string } }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#fff", border: `1px solid ${accent.border}` }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 text-left group"
      >
        <div>
          <h3 className="text-[14px] font-bold font-['Inter'] text-stone-800 mb-0.5">{section.title}</h3>
          <p className="text-stone-400 text-[11.5px] font-['Inter']">{section.subtitle}</p>
        </div>
        <ChevronDown
          className="w-4 h-4 text-stone-400 transition-transform duration-200 flex-shrink-0"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {open && (
        <div className="px-5 pb-4 flex flex-col divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
          {section.tips.map((tip, i) => (
            <TipItem key={i} tip={tip} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const HackWithInfyTips = () => {
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
      <div className="fixed inset-0 -z-10 bg-[#fcfcf9]" />

      <div ref={containerRef} className="w-full max-w-4xl mx-auto px-6 py-12 opacity-0 min-h-screen">

        {/* Back */}
        <button
          onClick={() => navigate("/hackwithinfy")}
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-[13px] font-medium font-['Inter'] transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to HackWithInfy
        </button>

        {/* Hero */}
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase font-['Inter'] mb-4"
            style={{ background: INFY_BG, color: INFY_BLUE, border: `1px solid ${INFY_BDR}` }}
          >
            <Zap className="w-3 h-3" />
            Strategy & Tips
          </div>
          <h1 className="text-3xl font-serif text-stone-800 tracking-tight leading-[1.15] mb-2">
            How to play it smart.
          </h1>
          <p className="text-stone-500 text-[0.88rem] font-['Inter'] font-light">
            Round-by-round strategy from people who've won HackWithInfy. No fluff.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          {[
            { icon: CheckCircle2, label: "Do this", color: TYPE_COLORS.do.color },
            { icon: AlertTriangle, label: "Avoid this", color: TYPE_COLORS.dont.color },
            { icon: Zap, label: "Good to know", color: TYPE_COLORS.info.color },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" style={{ color }} />
              <span className="text-[12px] font-['Inter'] text-stone-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Round 1 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-[0.15em] uppercase font-['Inter']"
              style={{ background: INFY_BG, color: INFY_BLUE, border: `1px solid ${INFY_BDR}` }}
            >
              <Clock className="w-3 h-3" />
              Round 1 — Online Coding Test · 3 Qs · 3 hrs · Virtual
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {ROUND1_TIPS.map((s) => (
              <AccordionSection key={s.title} section={s} accent={PRIMARY_TONE} />
            ))}
          </div>
        </div>

        {/* Round 2 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-[0.15em] uppercase font-['Inter']"
              style={{ background: INFY_BG, color: INFY_BLUE, border: `1px solid ${INFY_BDR}` }}
            >
              <Clock className="w-3 h-3" />
              Round 2 — Advanced Coding Test · 4 Qs choose 3 · 3 hrs · Physical
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {ROUND2_TIPS.map((s) => (
              <AccordionSection key={s.title} section={s} accent={PRIMARY_TONE} />
            ))}
          </div>
        </div>

        {/* Interview */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-[0.15em] uppercase font-['Inter']"
              style={{ background: INFY_BG, color: INFY_BLUE, border: `1px solid ${INFY_BDR}` }}
            >
              <Zap className="w-3 h-3" />
              Interview Round · ~1 hr · Technical + Behavioral
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {INTERVIEW_TIPS.map((s) => (
              <AccordionSection key={s.title} section={s} accent={PRIMARY_TONE} />
            ))}
          </div>
        </div>

        {/* Key takeaway */}
        <div
          className="mt-10 rounded-2xl p-6"
          style={{
            background: `linear-gradient(135deg, rgba(0,124,195,0.06) 0%, rgba(0,124,195,0.02) 100%)`,
            border: `1px solid ${INFY_BDR}`,
          }}
        >
          <h3 className="text-[14px] font-bold font-['Inter'] text-stone-800 mb-2">The one thing that matters most</h3>
          <p className="text-stone-500 text-[13px] font-['Inter'] leading-relaxed">
            HackWithInfy rewards <span className="font-semibold text-stone-700">consistent practice over cramming</span>. Candidates who land SP L1–L3 have typically
            been doing DSA problem-solving for 3–6 months. No academic criteria — all streams eligible. Start early, be methodical, and trust the process.
          </p>
        </div>
      </div>
    </>
  );
};

export default HackWithInfyTips;
