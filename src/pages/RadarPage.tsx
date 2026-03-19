import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar, Loader2, ExternalLink, Zap, TrendingUp, AlertCircle,
  Briefcase, Clock, Building2, ChevronRight, RefreshCw, Hammer
} from "lucide-react";
import Header from "@/components/Header";
import { useResume } from "@/hooks/useResume";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

/* ── Types ── */
type Job = {
  title: string;
  type: "Internship" | "Full-time" | "Part-time";
  company_type: string;
  match_score: number;
  why: string;
  skills_match: string[];
  skills_gap: string[];
  search_url: string;
  internshala_url: string;
};

/* ── Score ring color ── */
function scoreColor(s: number) {
  if (s >= 85) return { ring: "#16a34a", bg: "#f0fdf4", text: "#15803d" };
  if (s >= 70) return { ring: "#d97706", bg: "#fffbeb", text: "#b45309" };
  return { ring: "#6b7280", bg: "#f9fafb", text: "#4b5563" };
}

/* ── Score arc ── */
function ScoreArc({ score }: { score: number }) {
  const c = scoreColor(score);
  const r = 22, cx = 28, cy = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e7e5e4" strokeWidth="4" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.ring} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-[13px] font-black font-['Inter']" style={{ color: c.text }}>{score}</span>
    </div>
  );
}

/* ── Job card ── */
function JobCard({ job, index }: { job: Job; index: number }) {
  const c = scoreColor(job.match_score);
  const typeIcon = job.type === "Internship" ? <Clock className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />;
  const typeColor = job.type === "Internship"
    ? "bg-blue-50 text-blue-600 border-blue-100"
    : "bg-emerald-50 text-emerald-600 border-emerald-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex gap-4 group"
    >
      {/* Score */}
      <ScoreArc score={job.match_score} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold font-['Inter'] text-stone-900 text-sm leading-snug">{job.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold font-['Inter'] border ${typeColor}`}>
                {typeIcon}{job.type}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-stone-400 font-['Inter']">
                <Building2 className="w-3 h-3" />{job.company_type}
              </span>
            </div>
          </div>
        </div>

        {/* Why match */}
        <p className="text-xs font-['Inter'] text-stone-500 mt-2 leading-relaxed">{job.why}</p>

        {/* Skills match */}
        {job.skills_match.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {job.skills_match.map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-stone-900 text-white text-[11px] font-['Inter']">{s}</span>
            ))}
          </div>
        )}

        {/* Skills gap */}
        {job.skills_gap.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp className="w-3 h-3 text-amber-500 shrink-0" />
            <p className="text-[11px] font-['Inter'] text-amber-600">
              Learn: <span className="font-semibold">{job.skills_gap.join(", ")}</span>
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex items-center gap-2 mt-3">
          <a href={job.search_url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white text-[11px] font-semibold font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all">
            <ExternalLink className="w-3 h-3" /> LinkedIn Jobs
          </a>
          {job.type === "Internship" && job.internshala_url && (
            <a href={job.internshala_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-[11px] font-semibold font-['Inter'] hover:bg-stone-50 active:scale-95 transition-all">
              <ExternalLink className="w-3 h-3" /> Internshala
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Scanning animation ── */
function ScanAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="relative w-32 h-32">
        {/* Rings */}
        {[1, 2, 3].map(i => (
          <motion.div key={i} className="absolute inset-0 rounded-full border border-stone-300"
            style={{ margin: `${(i - 1) * 16}px` }}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }} />
        ))}
        {/* Sweep */}
        <motion.div className="absolute inset-0 rounded-full overflow-hidden"
          animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
            style={{ background: "linear-gradient(90deg, transparent, #1c1917)" }} />
        </motion.div>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-stone-800" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-['Merriweather'] font-bold text-stone-800 text-base">Scanning your profile…</p>
        <p className="font-['Inter'] text-stone-400 text-sm mt-1">Finding roles that match your skills</p>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function RadarPage() {
  const navigate = useNavigate();
  const { savedData, loading: profileLoading } = useResume();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const runScan = async () => {
    if (!savedData) return;
    setScanning(true);
    setError("");
    setJobs(null);

    const { data, error: fnErr } = await supabase.functions.invoke("radar-jobs", {
      body: { profile: savedData },
    });

    if (fnErr || data?.error) {
      setError(data?.error || fnErr?.message || "Scan failed. Try again.");
    } else {
      setJobs(data.jobs ?? []);
    }
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

      <div className="pt-20 pb-16 px-4 max-w-2xl mx-auto">

        {/* Brand pill */}
        <div className="flex justify-center mt-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200">
            <Radar className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-[12px] font-semibold font-['Inter'] text-stone-600 tracking-wide">RADAR</span>
          </div>
        </div>

        <SignedOut>
          <div className="text-center py-16 space-y-3">
            <p className="font-['Merriweather'] font-bold text-stone-800 text-xl">Sign in to use Radar</p>
            <p className="font-['Inter'] text-stone-400 text-sm">We need your profile to find matching roles.</p>
          </div>
        </SignedOut>

        <SignedIn>
          {profileLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-stone-400 animate-spin" /></div>
          ) : !hasProfile ? (
            /* No profile */
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center mx-auto">
                <Radar className="w-7 h-7 text-stone-400" />
              </div>
              <p className="font-['Merriweather'] font-bold text-stone-800 text-xl">No profile to scan</p>
              <p className="font-['Inter'] text-stone-400 text-sm max-w-xs mx-auto">
                Build your resume in Forge first — Radar uses your skills and education to find matching roles.
              </p>
              <button onClick={() => navigate("/forge")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all">
                <Hammer className="w-4 h-4" /> Go to Forge
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">

              {/* Idle — show scan button */}
              {!scanning && !jobs && (
                <motion.div key="idle" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-center space-y-6 py-8">
                  <div>
                    <h1 className="font-['Merriweather'] font-bold text-stone-900 text-2xl mb-2">Find your best-fit roles</h1>
                    <p className="font-['Inter'] text-stone-400 text-sm max-w-sm mx-auto leading-relaxed">
                      Radar analyses your skills, education and projects, then surfaces the most relevant internships and jobs for you right now.
                    </p>
                  </div>

                  {/* Profile summary pill */}
                  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 text-left">
                    <p className="text-[11px] font-semibold font-['Inter'] text-stone-400 uppercase tracking-widest mb-2">Scanning from your profile</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        ...savedData.skills.languages,
                        ...savedData.skills.technical,
                        ...savedData.skills.tools,
                      ].slice(0, 10).map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs font-['Inter']">{s}</span>
                      ))}
                      {savedData.education[0]?.degree && (
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

              {/* Results */}
              {jobs && !scanning && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Results header */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-['Merriweather'] font-bold text-stone-900 text-lg">
                        {jobs.length} opportunities found
                      </h2>
                      <p className="text-xs font-['Inter'] text-stone-400 mt-0.5">Sorted by match score · Based on your profile</p>
                    </div>
                    <button onClick={runScan}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold font-['Inter'] hover:bg-stone-50 transition-all active:scale-95">
                      <RefreshCw className="w-3.5 h-3.5" /> Rescan
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4 text-sm font-['Inter'] text-red-600">
                      <AlertCircle className="w-4 h-4 shrink-0" />{error}
                    </div>
                  )}

                  <div className="space-y-3">
                    {jobs.map((job, i) => <JobCard key={i} job={job} index={i} />)}
                  </div>
                </motion.div>
              )}

              {/* Error on first scan */}
              {error && !jobs && !scanning && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-4">
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                  <p className="font-['Inter'] text-stone-600 text-sm">{error}</p>
                  <button onClick={runScan} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold font-['Inter'] hover:bg-stone-700 transition-all">
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
