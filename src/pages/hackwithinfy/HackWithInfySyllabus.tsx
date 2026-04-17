import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, ChevronDown } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const INFY_BLUE = "#007CC3";
const INFY_BG   = "rgba(0,124,195,0.07)";
const INFY_BDR  = "rgba(0,124,195,0.18)";

// ─── Syllabus data ────────────────────────────────────────────────────────────

type Topic = { name: string; difficulty: "Easy" | "Medium" | "Hard"; roles: ("DSE" | "SP")[] };
type Section = { title: string; topics: Topic[] };

const SYLLABUS: Section[] = [
  {
    title: "Arrays & Strings",
    topics: [
      { name: "Two Pointers / Sliding Window",    difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Prefix Sums & Difference Arrays",  difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Kadane's Algorithm (Max Subarray)", difficulty: "Easy",  roles: ["DSE", "SP"] },
      { name: "String Manipulation & Parsing",    difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "KMP / Z-Algorithm",                difficulty: "Hard",   roles: ["SP"] },
      { name: "Rabin-Karp Hashing",               difficulty: "Hard",   roles: ["SP"] },
    ],
  },
  {
    title: "Sorting & Searching",
    topics: [
      { name: "Binary Search (variants)",         difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Merge Sort / Quick Sort",          difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Counting Sort / Radix Sort",       difficulty: "Medium", roles: ["DSE", "SP"] },
      { name: "Ternary Search",                   difficulty: "Medium", roles: ["SP"] },
    ],
  },
  {
    title: "Stacks, Queues & Heaps",
    topics: [
      { name: "Monotonic Stack",                  difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Next Greater / Smaller Element",   difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Priority Queue (Min/Max Heap)",    difficulty: "Medium", roles: ["DSE", "SP"] },
      { name: "Deque (Sliding Window Max)",       difficulty: "Medium", roles: ["DSE", "SP"] },
    ],
  },
  {
    title: "Trees & Graphs",
    topics: [
      { name: "BFS / DFS",                        difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Binary Trees (LCA, traversal)",    difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "BST operations",                   difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Dijkstra / Bellman-Ford",          difficulty: "Medium", roles: ["DSE", "SP"] },
      { name: "Floyd-Warshall (APSP)",            difficulty: "Medium", roles: ["DSE", "SP"] },
      { name: "Topological Sort (Kahn's)",        difficulty: "Medium", roles: ["DSE", "SP"] },
      { name: "Tries",                            difficulty: "Medium", roles: ["DSE", "SP"] },
      { name: "Segment Trees",                    difficulty: "Hard",   roles: ["SP"] },
      { name: "Fenwick Tree (BIT)",               difficulty: "Hard",   roles: ["SP"] },
      { name: "Heavy-Light Decomposition",        difficulty: "Hard",   roles: ["SP"] },
    ],
  },
  {
    title: "Dynamic Programming",
    topics: [
      { name: "0/1 Knapsack",                     difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Longest Common Subsequence",       difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Longest Increasing Subsequence",   difficulty: "Medium", roles: ["DSE", "SP"] },
      { name: "Coin Change / Unbounded Knapsack", difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Matrix Chain Multiplication",      difficulty: "Medium", roles: ["DSE", "SP"] },
      { name: "Bitmask DP",                       difficulty: "Hard",   roles: ["SP"] },
      { name: "Digit DP",                         difficulty: "Hard",   roles: ["SP"] },
      { name: "Matrix Exponentiation",            difficulty: "Hard",   roles: ["SP"] },
    ],
  },
  {
    title: "Greedy Algorithms",
    topics: [
      { name: "Activity Selection",               difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Fractional Knapsack",              difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Huffman Encoding",                 difficulty: "Medium", roles: ["DSE", "SP"] },
      { name: "Job Scheduling",                   difficulty: "Medium", roles: ["DSE", "SP"] },
    ],
  },
  {
    title: "Backtracking",
    topics: [
      { name: "N-Queens",                         difficulty: "Medium", roles: ["DSE", "SP"] },
      { name: "Sudoku Solver",                    difficulty: "Medium", roles: ["SP"] },
      { name: "Permutations & Combinations",      difficulty: "Easy",   roles: ["DSE", "SP"] },
      { name: "Word Search",                      difficulty: "Medium", roles: ["DSE", "SP"] },
    ],
  },
  {
    title: "Advanced Topics",
    topics: [
      { name: "Bit Manipulation",                 difficulty: "Medium", roles: ["DSE", "SP"] },
      { name: "Game Theory (Grundy / Nim)",       difficulty: "Hard",   roles: ["SP"] },
      { name: "Computational Geometry (basics)",  difficulty: "Hard",   roles: ["SP"] },
      { name: "Union-Find (DSU)",                 difficulty: "Medium", roles: ["DSE", "SP"] },
    ],
  },
];

const CS_FUNDAMENTALS = [
  {
    title: "CS/IT Students — Technical Focus",
    items: [
      "Algorithms & Data Structures",
      "Automata Theory & Compilers",
      "Computer Networks (OSI, TCP/IP, HTTP, DNS)",
      "Computer Organization & Architecture",
      "Operating Systems (scheduling, deadlock, paging)",
      "Digital Signal Processing",
      "Object-Oriented Programming",
    ],
  },
  {
    title: "Other Stream Students — Technical Focus",
    items: [
      "Algorithms & Data Structures",
      "Computer Networks (basics)",
      "Digital Electronics",
      "Digital Signal Processing",
      "Mathematics (discrete math, linear algebra)",
      "Object-Oriented Programming",
      "Control Systems",
    ],
  },
  {
    title: "OOPs (All Streams)",
    items: ["Classes & Objects", "Inheritance, Polymorphism", "Abstraction & Encapsulation", "Design Patterns (Singleton, Factory)"],
  },
  {
    title: "Behavioral (All Streams)",
    items: ["Interview lasts ~1 hour", "Tell me about yourself", "Strengths & weaknesses", "Situational / STAR format questions"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Role = "DSE" | "SP";

const ROLE_TABS: Role[] = ["DSE", "SP"];

const DIFF_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Easy:   { color: "#059669", bg: "rgba(5,150,105,0.08)",   border: "rgba(5,150,105,0.2)"   },
  Medium: { color: "#d97706", bg: "rgba(217,119,6,0.08)",   border: "rgba(217,119,6,0.2)"   },
  Hard:   { color: "#dc2626", bg: "rgba(220,38,38,0.08)",   border: "rgba(220,38,38,0.2)"   },
};

const ROLE_STYLES: Record<Role, { color: string; bg: string; border: string }> = {
  DSE: { color: "#0891b2", bg: "rgba(8,145,178,0.08)",   border: "rgba(8,145,178,0.2)"   },
  SP:  { color: INFY_BLUE, bg: INFY_BG,                  border: INFY_BDR               },
};

// ─── Component ────────────────────────────────────────────────────────────────

const HackWithInfySyllabus = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeRole, setActiveRole] = useState<Role>("DSE");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [openSection, setOpenSection] = useState<string | null>(null);

  useGSAP(
    () => {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" });
    },
    { scope: containerRef }
  );

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filteredSections = SYLLABUS.map((sec) => ({
    ...sec,
    topics: sec.topics.filter((t) => t.roles.includes(activeRole)),
  })).filter((sec) => sec.topics.length > 0);

  const totalTopics = filteredSections.reduce((a, s) => a + s.topics.length, 0);
  const doneTopics = filteredSections.reduce(
    (a, s) => a + s.topics.filter((t) => checked.has(`${s.title}::${t.name}`)).length,
    0
  );
  const progress = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0;

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
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase font-['Inter'] mb-4"
            style={{ background: INFY_BG, color: INFY_BLUE, border: `1px solid ${INFY_BDR}` }}
          >
            Role-wise Syllabus
          </div>
          <h1 className="text-3xl font-serif text-stone-800 tracking-tight leading-[1.15] mb-2">
            What to Study — by Role
          </h1>
          <p className="text-stone-500 text-[0.88rem] font-['Inter'] font-light">
            Topics are cumulative: SP includes all DSE topics plus advanced algorithms.
          </p>
        </div>

        {/* Role tabs */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {ROLE_TABS.map((role) => {
            const s = ROLE_STYLES[role];
            const active = role === activeRole;
            return (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className="px-4 py-2 rounded-xl text-[12.5px] font-bold font-['Inter'] transition-all"
                style={{
                  background: active ? s.color : s.bg,
                  color: active ? "#fff" : s.color,
                  border: `1.5px solid ${s.border}`,
                  boxShadow: active ? `0 4px 14px ${s.bg}` : "none",
                }}
              >
                {role}
                {role === "SP" && (
                  <span className="ml-1.5 text-[9px] opacity-80">₹11 LPA</span>
                )}
                {role === "DSE" && (
                  <span className="ml-1.5 text-[9px] opacity-80">₹7 LPA</span>
                )}
              </button>
            );
          })}

          {/* Progress */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[12px] text-stone-400 font-['Inter']">
              {doneTopics}/{totalTopics} done
            </span>
            <div className="w-28 h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: INFY_BLUE }}
              />
            </div>
            <span className="text-[12px] font-semibold font-['Inter']" style={{ color: INFY_BLUE }}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-3 mb-12">
          {filteredSections.map((sec) => {
            const secDone = sec.topics.filter((t) => checked.has(`${sec.title}::${t.name}`)).length;
            const isOpen = openSection === sec.title || openSection === null;
            return (
              <div
                key={sec.title}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${INFY_BDR}`, background: "#fff" }}
              >
                <button
                  onClick={() => setOpenSection(isOpen && openSection === sec.title ? null : sec.title)}
                  className="w-full flex items-center justify-between p-5 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-[14px] font-bold font-['Inter'] text-stone-800">{sec.title}</h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-[9.5px] font-semibold border font-['Inter']"
                      style={{ color: INFY_BLUE, background: INFY_BG, borderColor: INFY_BDR }}
                    >
                      {sec.topics.length} topics
                    </span>
                    {secDone > 0 && (
                      <span className="text-[11px] text-emerald-600 font-['Inter'] font-medium">
                        {secDone}/{sec.topics.length} done
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className="w-4 h-4 text-stone-400 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 flex flex-col gap-2">
                    {sec.topics.map((t) => {
                      const key = `${sec.title}::${t.name}`;
                      const done = checked.has(key);
                      const diff = DIFF_STYLES[t.difficulty];
                      return (
                        <div
                          key={key}
                          onClick={() => toggle(key)}
                          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                          style={{
                            background: done ? "rgba(5,150,105,0.05)" : "rgba(0,0,0,0.015)",
                            border: `1px solid ${done ? "rgba(5,150,105,0.2)" : "transparent"}`,
                          }}
                        >
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#059669" }} />
                          ) : (
                            <Circle className="w-4 h-4 flex-shrink-0 text-stone-300" />
                          )}
                          <span
                            className="flex-1 text-[13px] font-['Inter']"
                            style={{ color: done ? "#059669" : "#1c1c1e", textDecoration: done ? "line-through" : "none" }}
                          >
                            {t.name}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full text-[9.5px] font-semibold border font-['Inter']"
                            style={{ color: diff.color, background: diff.bg, borderColor: diff.border }}
                          >
                            {t.difficulty}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CS Fundamentals */}
        <div>
          <p
            className="text-[9.5px] font-bold tracking-[0.22em] uppercase font-['Inter'] mb-4"
            style={{ color: INFY_BLUE, opacity: 0.7 }}
          >
            CS Fundamentals (Interview Round)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CS_FUNDAMENTALS.map((cs) => (
              <div
                key={cs.title}
                className="rounded-2xl p-5"
                style={{ background: "#fff", border: `1px solid ${INFY_BDR}` }}
              >
                <h3 className="text-[13.5px] font-bold font-['Inter'] text-stone-800 mb-3">{cs.title}</h3>
                <ul className="flex flex-col gap-2">
                  {cs.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: INFY_BLUE, opacity: 0.5 }} />
                      <span className="text-[12.5px] text-stone-500 font-['Inter']">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HackWithInfySyllabus;
