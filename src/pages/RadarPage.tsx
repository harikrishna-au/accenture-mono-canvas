import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar, Loader2, ExternalLink, TrendingUp, AlertCircle,
  Briefcase, Clock, MapPin, Package, RefreshCw, Hammer, Zap,
  CheckCircle2, XCircle
} from "lucide-react";
import Header from "@/components/Header";
import { useResume } from "@/hooks/useResume";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

/* ── Types ── */
type DBJob = {
  id: string; title: string; company: string | null; type: string;
  location: string | null; skills_required: string[]; description: string | null;
  apply_url: string | null; package_lpa: number | null; active: boolean;
};

type MatchedJob = DBJob & {
  match_score: number;
  skills_match: string[];
  skills_gap: string[];
};

/* ── Match score calculator ── */
function calculateMatch(job: DBJob, userSkills: string[]): MatchedJob {
  const norm = (s: string) => s.toLowerCase().trim();
  const userSet = new Set(userSkills.map(norm));
  const required = job.skills_required.map(norm);

  const skills_match = job.skills_required.filter(s => userSet.has(norm(s)));
  const skills_gap   = job.skills_required.filter(s => !userSet.has(norm(s)));

  if (required.length === 0) {
    return { ...job, match_score: 0, skills_match, skills_gap };
  }

  let score = Math.round(50 + (skills_match.length / required.length) * 49);
  if (userSkills.length > 8) score = Math.min(99, score + 5);

  return { ...job, match_score: score, skills_match, skills_gap };
}

/* ── Score ring color ── */
function scoreColor(s: number) {
  if (s >= 85) return { ring: "#16a34a", text: "#15803d", bg: "bg-green-50", label: "Strong Match" };
  if (s >= 70) return { ring: "#d97706", text: "#b45309", bg: "bg-amber-50", label: "Good Match" };
  if (s > 0)   return { ring: "#6b7280", text: "#4b5563", bg: "bg-stone-100", label: "Partial Match" };
  return { ring: "#d4d4d4", text: "#a8a29e", bg: "bg-stone-50", label: "No Score" };
}

/* ── Score arc ── */
function ScoreArc({ score }: { score: number }) {
  const c = scoreColor(score);
  const r = 26, cx = 32, cy = 32;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e7e5e4" strokeWidth="4" />
        {score > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.ring} strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        )}
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        {score > 0
          ? <span className="text-[15px] font-black font-['Inter']" style={{ color: c.text }}>{score}</span>
          : <span className="text-[11px] font-bold font-['Inter'] text-stone-300">N/A</span>
        }
      </div>
    </div>
  );
}

/* ── Job card ── */
function JobCard({ job, index }: { job: MatchedJob; index: number }) {
  const typeColor = job.type === "Internship"
    ? "bg-blue-50 text-blue-600 border-blue-100"
    : job.type === "Part-time"
    ? "bg-purple-50 text-purple-600 border-purple-100"
    : "bg-emerald-50 text-emerald-600 border-emerald-100";

  const c = scoreColor(job.match_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-stone-200 transition-all flex flex-col h-full"
    >
      {/* Card top */}
      <div className="p-5 flex-1">
        {/* Score + title row */}
        <div className="flex items-start gap-4">
          <ScoreArc score={job.match_score} />
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="font-semibold font-['Inter'] text-stone-900 text-sm leading-snug">{job.title}</p>
            {job.company && (
              <p className="text-xs font-['Inter'] text-stone-500 mt-0.5">{job.company}</p>
            )}
            {job.match_score > 0 && (
              <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold font-['Inter'] ${c.bg}`} style={{ color: c.text }}>
                {c.label}
              </span>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold font-['Inter'] border ${typeColor}`}>
            {job.type === "Internship" ? <Clock className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
            {job.type}
          </span>
          {job.location && (
            <span className="flex items-center gap-1 text-[11px] text-stone-400 font-['Inter']">
              <MapPin className="w-3 h-3" />{job.location}
            </span>
          )}
          {job.package_lpa && (
            <span className="flex items-center gap-1 text-[11px] text-stone-400 font-['Inter']">
              <Package className="w-3 h-3" />{job.package_lpa} LPA
            </span>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <p className="text-xs font-['Inter'] text-stone-500 mt-3 leading-relaxed line-clamp-3">{job.description}</p>
        )}

        {/* Skills sections */}
        {job.skills_match.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-semibold font-['Inter'] text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> You have
            </p>
            <div className="flex flex-wrap gap-1">
              {job.skills_match.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-['Inter'] border border-green-100">{s}</span>
              ))}
            </div>
          </div>
        )}

        {job.skills_gap.length > 0 && (
          <div className="mt-2.5">
            <p className="text-[10px] font-semibold font-['Inter'] text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-500" /> Learn
            </p>
            <div className="flex flex-wrap gap-1">
              {job.skills_gap.slice(0, 4).map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-['Inter'] border border-amber-100">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply button pinned to bottom */}
      {job.apply_url && (
        <div className="px-5 pb-4 pt-2 border-t border-stone-50">
          <a href={job.apply_url} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> Apply Now
          </a>
        </div>
      )}
    </motion.div>
  );
}

/* ── Scan animation ── */
function ScanAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="relative w-32 h-32">
        {[1, 2, 3].map(i => (
          <motion.div key={i} className="absolute inset-0 rounded-full border border-stone-300"
            style={{ margin: `${(i - 1) * 16}px` }}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }} />
        ))}
        <motion.div className="absolute inset-0 rounded-full overflow-hidden"
          animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
            style={{ background: "linear-gradient(90deg, transparent, #1c1917)" }} />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-stone-800" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-['Merriweather'] font-bold text-stone-800 text-base">Scanning opportunities…</p>
        <p className="font-['Inter'] text-stone-400 text-sm mt-1">Matching your profile to available roles</p>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function RadarPage() {
  const navigate = useNavigate();
  const { savedData, loading: profileLoading } = useResume();
  const [results, setResults] = useState<MatchedJob[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const userSkills = savedData ? [
    ...savedData.skills.languages,
    ...savedData.skills.technical,
    ...savedData.skills.tools,
  ] : [];

  const runScan = async () => {
    if (!savedData) return;
    setScanning(true);
    setError("");
    setResults(null);

    const { data, error: dbErr } = await (supabase as any)
      .from("jobs")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (dbErr) {
      setError("Failed to load jobs. Try again.");
      setScanning(false);
      return;
    }

    const jobs: DBJob[] = data ?? [];
    const matched = jobs
      .map(j => calculateMatch(j, userSkills))
      .sort((a, b) => b.match_score - a.match_score);

    setResults(matched);
    setScanning(false);
  };

  const hasProfile = savedData && (
    savedData.skills.languages.length > 0 ||
    savedData.skills.technical.length > 0 ||
    savedData.education.some(e => e.degree)
  );

  return (
    <div className="min-h-screen" style={{ background: "#fcfcf9" }}>
      <Header />

      <div className="pt-20 pb-16 px-4">

        {/* Brand pill — always centred, narrow */}
        <div className="flex justify-center mt-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200">
            <Radar className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-[12px] font-semibold font-['Inter'] text-stone-600 tracking-wide">RADAR</span>
          </div>
        </div>

        <SignedOut>
          <div className="max-w-2xl mx-auto text-center py-16 space-y-3">
            <p className="font-['Merriweather'] font-bold text-stone-800 text-xl">Sign in to use Radar</p>
            <p className="font-['Inter'] text-stone-400 text-sm">We need your profile to find matching roles.</p>
          </div>
        </SignedOut>

        <SignedIn>
          {profileLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-stone-400 animate-spin" /></div>
          ) : !hasProfile ? (
            <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center mx-auto">
                <Radar className="w-7 h-7 text-stone-400" />
              </div>
              <p className="font-['Merriweather'] font-bold text-stone-800 text-xl">No profile to scan</p>
              <p className="font-['Inter'] text-stone-400 text-sm max-w-xs mx-auto">
                Build your resume in Forge first — Radar uses your skills to match you with real openings.
              </p>
              <button onClick={() => navigate("/forge")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all">
                <Hammer className="w-4 h-4" /> Go to Forge
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">

              {/* Idle */}
              {!scanning && !results && (
                <motion.div key="idle" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="max-w-2xl mx-auto text-center space-y-6 py-8">
                  <div>
                    <h1 className="font-['Merriweather'] font-bold text-stone-900 text-2xl mb-2">Find your best-fit roles</h1>
                    <p className="font-['Inter'] text-stone-400 text-sm max-w-sm mx-auto leading-relaxed">
                      Radar matches your skills and education against real openings and ranks them by how well you fit.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 text-left">
                    <p className="text-[11px] font-semibold font-['Inter'] text-stone-400 uppercase tracking-widest mb-2">Scanning from your profile</p>
                    <div className="flex flex-wrap gap-1.5">
                      {userSkills.slice(0, 12).map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs font-['Inter']">{s}</span>
                      ))}
                      {savedData?.education[0]?.degree && (
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-white text-xs font-['Inter']">
                          {savedData.education[0].degree}
                        </span>
                      )}
                    </div>
                  </div>

                  <button onClick={runScan}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-semibold font-['Inter'] text-sm hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: "linear-gradient(135deg,#1c1917,#44403c)", boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}>
                    <Radar className="w-4 h-4" /> Scan for Opportunities
                  </button>
                </motion.div>
              )}

              {/* Scanning */}
              {scanning && (
                <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ScanAnimation />
                </motion.div>
              )}

              {/* Results — full width */}
              {results && !scanning && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">

                  {/* Results header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-['Merriweather'] font-bold text-stone-900 text-xl">
                        {results.length} {results.length === 1 ? "opening" : "openings"} found
                      </h2>
                      <p className="text-xs font-['Inter'] text-stone-400 mt-0.5">Sorted by match score · Based on your skills</p>
                    </div>
                    <button onClick={runScan}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold font-['Inter'] hover:bg-stone-50 transition-all active:scale-95">
                      <RefreshCw className="w-3.5 h-3.5" /> Rescan
                    </button>
                  </div>

                  {results.length === 0 ? (
                    <div className="text-center py-24 space-y-3">
                      <Zap className="w-10 h-10 text-stone-300 mx-auto" />
                      <p className="font-['Merriweather'] font-bold text-stone-700 text-lg">No openings yet</p>
                      <p className="font-['Inter'] text-stone-400 text-sm">Check back soon — new roles are added regularly.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Error */}
              {error && !scanning && !results && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="max-w-2xl mx-auto text-center py-16 space-y-4">
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                  <p className="font-['Inter'] text-stone-600 text-sm">{error}</p>
                  <button onClick={runScan}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold font-['Inter'] hover:bg-stone-700 transition-all">
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </SignedIn>

      </div>
    </div>
  );
}
