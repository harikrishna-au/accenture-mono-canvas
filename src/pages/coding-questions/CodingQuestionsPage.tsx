import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronDown, ChevronUp, Search, X,
  CheckCircle2, Circle, RotateCcw, Trophy, ExternalLink,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CODING_TOPICS, TOTAL_PROBLEMS, type Difficulty } from "./data";

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "cq_done_v1";

const DIFF_STYLE: Record<Difficulty, { color: string; bg: string; border: string }> = {
  Easy:   { color: "#059669", bg: "rgba(5,150,105,0.09)",   border: "rgba(5,150,105,0.22)"   },
  Medium: { color: "#d97706", bg: "rgba(217,119,6,0.09)",   border: "rgba(217,119,6,0.22)"   },
  Hard:   { color: "#dc2626", bg: "rgba(220,38,38,0.09)",   border: "rgba(220,38,38,0.22)"   },
};

type FilterDiff = "All" | Difficulty;
const DIFF_FILTERS: FilterDiff[] = ["All", "Easy", "Medium", "Hard"];

// ─── Decorative viz for header ────────────────────────────────────────────────
const DSAViz = () => {
  const nodes = [
    [0, 0], [1, -1], [1, 1], [2, -2], [2, 0], [2, 2],
  ];
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,4],[2,5]];
  const W = 120, H = 80, pad = 18;
  const xs = nodes.map(n => pad + n[1] * 26 + 52);
  const ys = nodes.map(n => pad + n[0] * 24);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      {edges.map(([a, b], i) => (
        <line key={i} x1={xs[a]} y1={ys[a]} x2={xs[b]} y2={ys[b]}
          stroke="rgba(220,38,38,0.22)" strokeWidth="1.2" />
      ))}
      {nodes.map(([, ], i) => (
        <circle key={i} cx={xs[i]} cy={ys[i]} r={5.5}
          fill={`rgba(220,38,38,${0.12 + i * 0.09})`}
          stroke={`rgba(220,38,38,${0.3 + i * 0.07})`} strokeWidth="1.2" />
      ))}
    </svg>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CodingQuestionsPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Persisted checked state ───────────────────────────────────────────────
  const [done, setDone] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  }, [done]);

  const toggle = (id: string) => {
    setDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<FilterDiff>("All");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(CODING_TOPICS.map(t => t.id)));

  const toggleSection = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── Filtered topics ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CODING_TOPICS.map(topic => ({
      ...topic,
      problems: topic.problems.filter(p => {
        const matchDiff = diffFilter === "All" || p.difficulty === diffFilter;
        const matchQ = !q || p.title.toLowerCase().includes(q);
        return matchDiff && matchQ;
      }),
    })).filter(t => t.problems.length > 0);
  }, [search, diffFilter]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalDone = done.size;
  const pct = Math.round((totalDone / TOTAL_PROBLEMS) * 100);

  // ── GSAP entry animation ──────────────────────────────────────────────────
  useGSAP(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }
    );
  }, { scope: containerRef });

  const handleReset = () => {
    if (window.confirm(`Reset all ${totalDone} checked items?`)) {
      setDone(new Set());
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full font-['Inter'] opacity-0"
      style={{ background: "#fcfcf9" }}
    >
      {/* ── Fixed background wash ── */}
      <div className="fixed inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(220,38,38,0.06) 0%, transparent 70%)" }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14">

        {/* ── Back nav ── */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 mb-8 text-stone-400 hover:text-stone-700 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
              style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.18)" }}>
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: "#dc2626" }}>
                DSA Checklist
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight leading-tight mb-2">
              Important Coding Questions
            </h1>
            <p className="text-stone-500 text-sm leading-relaxed">
              {TOTAL_PROBLEMS} curated problems across {CODING_TOPICS.length} topics
            </p>
          </div>
          <DSAViz />
        </div>

        {/* ── Overall progress ── */}
        <div className="rounded-2xl bg-white border border-stone-100 shadow-sm p-5 mb-6"
          style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" style={{ color: "#dc2626" }} />
              <span className="text-sm font-semibold text-stone-700">Overall Progress</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400 font-medium">{totalDone}/{TOTAL_PROBLEMS}</span>
              {totalDone > 0 && (
                <button onClick={handleReset}
                  className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-red-500 transition-colors">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>
          <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct >= 80 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-stone-400">{pct}% complete</span>
            <span className="text-[11px] text-stone-400">{TOTAL_PROBLEMS - totalDone} remaining</span>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search problems…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl bg-white border border-stone-200 text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent transition"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Difficulty pills */}
          <div className="flex gap-2 flex-wrap">
            {DIFF_FILTERS.map(d => (
              <button key={d} onClick={() => setDiffFilter(d)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all"
                style={diffFilter === d
                  ? d === "All"
                    ? { background: "#1c1c1e", color: "#fff", borderColor: "#1c1c1e" }
                    : { background: DIFF_STYLE[d as Difficulty].bg, color: DIFF_STYLE[d as Difficulty].color, borderColor: DIFF_STYLE[d as Difficulty].border }
                  : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }
                }>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* ── Topics list ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No problems found. Try a different search or filter.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(topic => {
              const topicDone = topic.problems.filter(p => done.has(p.id)).length;
              const isOpen = expanded.has(topic.id);
              const topicPct = Math.round((topicDone / topic.problems.length) * 100);

              return (
                <div key={topic.id}
                  className="rounded-2xl bg-white overflow-hidden"
                  style={{
                    border: `1px solid ${topic.border}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}>

                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(topic.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Color dot */}
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: topic.color, opacity: 0.8 }} />
                      <div className="min-w-0">
                        <span className="font-semibold text-stone-800 text-[0.95rem] leading-tight">
                          {topic.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-stone-400">
                            {topicDone}/{topic.problems.length} done
                          </span>
                          {topicDone === topic.problems.length && topic.problems.length > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>
                              ✓ Complete
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      {/* Mini progress bar */}
                      <div className="hidden sm:block w-20 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${topicPct}%`, background: topic.color, opacity: 0.7 }} />
                      </div>
                      {isOpen
                        ? <ChevronUp className="w-4 h-4 text-stone-400" />
                        : <ChevronDown className="w-4 h-4 text-stone-400" />
                      }
                    </div>
                  </button>

                  {/* Problems list */}
                  {isOpen && (
                    <div className="border-t" style={{ borderColor: topic.border }}>
                      <div className="p-3 sm:p-4 grid grid-cols-1 gap-1.5">
                        {topic.problems.map((prob, idx) => {
                          const checked = done.has(prob.id);
                          const ds = DIFF_STYLE[prob.difficulty];
                          return (
                            <button
                              key={prob.id}
                              onClick={() => toggle(prob.id)}
                              className="flex items-center gap-3 w-full text-left rounded-xl px-3 py-2.5 transition-all group/item"
                              style={{
                                background: checked ? topic.bg : "transparent",
                              }}
                              onMouseEnter={e => {
                                if (!checked) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.025)";
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = checked ? topic.bg : "transparent";
                              }}
                            >
                              {/* Checkbox icon */}
                              {checked
                                ? <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" style={{ color: topic.color }} />
                                : <Circle className="w-4.5 h-4.5 flex-shrink-0 text-stone-300 group-hover/item:text-stone-400 transition-colors" />
                              }

                              {/* Number */}
                              <span className="text-[11px] text-stone-300 font-mono w-5 text-right flex-shrink-0">
                                {idx + 1}
                              </span>

                              {/* Title */}
                              <span className={`flex-1 text-[13px] font-medium leading-tight transition-colors ${checked ? "line-through" : ""}`}
                                style={{ color: checked ? "#9ca3af" : "#374151" }}>
                                {prob.title}
                              </span>

                              {/* Link button */}
                              {prob.link && (
                                <a
                                  href={prob.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="flex-shrink-0 p-1 rounded-lg text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                                  title="Open problem"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Difficulty badge */}
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                style={{ color: ds.color, background: ds.bg, border: `1px solid ${ds.border}` }}>
                                {prob.difficulty}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Bottom padding ── */}
        <div className="h-16" />
      </div>
    </div>
  );
}
