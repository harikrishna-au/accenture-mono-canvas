import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowLeft, FileText, X, ExternalLink, Download, Archive } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const INFY_BLUE = "#007CC3";
const INFY_BG   = "rgba(0,124,195,0.07)";
const INFY_BDR  = "rgba(0,124,195,0.18)";

// ─── Real prep files from Google Drive ────────────────────────────────────────
// Preview URL: https://drive.google.com/file/d/{ID}/preview  (no download toolbar)
// DOCX files use Google Docs viewer: https://docs.google.com/document/d/{ID}/preview

type Resource = {
  id: string;
  title: string;
  desc: string;
  tag: string;
  type: "pdf" | "docx" | "zip";
  category: string;
  pages?: string;
  color: string;
  bg: string;
  border: string;
};

const RESOURCES: Resource[] = [
  // ── Zip bundle (download only) ────────────────────────────────────────────
  {
    id: "1T-dgK3xA4LzZdL-BIFDFoikAu-nB3uwj",
    title: "Complete Infosys Prep Bundle",
    desc: "Full collection of Infosys prep materials zipped together — all PDFs, DOCX guides, and question sets in one download.",
    tag: "Full Bundle",
    type: "zip",
    category: "Bundle",
    color: "#059669",
    bg: "rgba(5,150,105,0.07)",
    border: "rgba(5,150,105,0.18)",
  },
  // ── Individual files (preview only) ──────────────────────────────────────
  {
    id: "1H98Ntbv2l0sEONpXWf0yy92qmi46W7mx",
    title: "HackWithInfy — DSA",
    desc: "Curated DSA topics and problem types mapped to HackWithInfy Round 1 & Round 2. Essential foundation.",
    tag: "DSA",
    type: "pdf",
    category: "Core Prep",
    color: INFY_BLUE,
    bg: INFY_BG,
    border: INFY_BDR,
  },
  {
    id: "1D6nrO9wRSeg0Ple5_rRMMFdmQke3k92c",
    title: "50 Common Coding Questions for Interviews",
    desc: "50 must-know interview coding problems that cover arrays, strings, trees, graphs, and DP — curated for Infosys.",
    tag: "Problem Set",
    type: "pdf",
    category: "Core Prep",
    pages: "50 problems",
    color: INFY_BLUE,
    bg: INFY_BG,
    border: INFY_BDR,
  },
  {
    id: "1nfr_MHDGiQncC6AbN3W83aYaosQe1IxF",
    title: "CS Fundamentals — By RitikRaj (2025)",
    desc: "Comprehensive CS fundamentals guide covering OOPs, OS, DBMS, Networks — tailored for placement interviews.",
    tag: "CS Fundamentals",
    type: "pdf",
    category: "CS Fundamentals",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.07)",
    border: "rgba(124,58,237,0.18)",
  },
  {
    id: "127XV5IolcMuWbVUh3dTCoDu9vPeToRgm",
    title: "Infosys SP Interview Preparation Guide",
    desc: "Official-style SP interview prep guide covering technical depth, DSA expectations, and role-specific advice.",
    tag: "SP Guide",
    type: "pdf",
    category: "SP Interview",
    pages: "1,002 KB",
    color: "#d97706",
    bg: "rgba(217,119,6,0.07)",
    border: "rgba(217,119,6,0.18)",
  },
  {
    id: "1NhEvCW-vbqTkIxvkO9oqatQcEUbEgrid",
    title: "Infosys DSE — Last Mile Prep",
    desc: "Quick revision guide for the final days before your Infosys DSE round. Key topics, patterns, and tips.",
    tag: "Last Mile",
    type: "docx",
    category: "Last Mile",
    color: "#059669",
    bg: "rgba(5,150,105,0.07)",
    border: "rgba(5,150,105,0.18)",
  },
  {
    id: "1oQNyG_j-oegIL4WWU8XjUab_jK1hi5Fh",
    title: "Infosys SP — Prep Doc",
    desc: "In-depth prep document for the Specialist Programmer track. Covers advanced DSA, system design basics, and interview Q&A.",
    tag: "SP Prep",
    type: "docx",
    category: "SP Interview",
    color: "#d97706",
    bg: "rgba(217,119,6,0.07)",
    border: "rgba(217,119,6,0.18)",
  },
];

// Build the Google preview URL
function previewUrl(res: Resource): string {
  if (res.type === "pdf") {
    return `https://drive.google.com/file/d/${res.id}/preview`;
  }
  // DOCX → Google Docs viewer
  return `https://docs.google.com/document/d/${res.id}/preview`;
}

// ─── Fullscreen Preview Modal ──────────────────────────────────────────────────
function PreviewModal({ res, onClose }: { res: Resource; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(28,25,23,0.88)", backdropFilter: "blur(8px)" }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ background: "#1c1917", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4" style={{ color: res.color }} />
          <span className="text-white text-sm font-semibold font-['Inter'] truncate max-w-[500px]">
            {res.title}
          </span>
          <span
            className="text-[10px] font-bold tracking-wide border px-2 py-0.5 rounded-full font-['Inter']"
            style={{ color: res.color, background: res.bg, borderColor: res.border }}
          >
            {res.tag}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:text-white hover:bg-stone-700 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* iframe — wrapped so we can overlay the Drive toolbar */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          src={previewUrl(res)}
          title={res.title}
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay"
          style={{ background: "#525659" }}
        />
        {/* Transparent overlay covering the Google Drive top-right popout button */}
        <div
          className="absolute top-0 right-0 z-10"
          style={{ width: 120, height: 52, pointerEvents: "all", background: "transparent" }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
const HackWithInfyResources = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePreview, setActivePreview] = useState<Resource | null>(null);

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
            <FileText className="w-3 h-3" />
            Study Resources
          </div>
          <h1 className="text-3xl font-serif text-stone-800 tracking-tight leading-[1.15] mb-2">
            Prep Files
          </h1>
          <p className="text-stone-500 text-[0.88rem] font-['Inter'] font-light">
            {RESOURCES.length} curated documents — click any card to open a full preview.
          </p>
        </div>

        {/* Resource cards */}
        <div className="flex flex-col gap-3">
          {RESOURCES.map((res) => (
            <div
              key={res.id}
              onClick={() => res.type !== "zip" && setActivePreview(res)}
              className="relative rounded-2xl overflow-hidden cursor-pointer group"
              style={{
                background: "#ffffff",
                border: `1px solid ${res.border}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                transition: "box-shadow 0.22s ease, transform 0.22s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 36px rgba(0,124,195,0.1), 0 0 0 1.5px ${res.border}`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {/* Accent wash */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 70% 60% at 5% 50%, ${res.bg} 0%, transparent 65%)` }}
              />
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${res.color}, transparent 70%)` }}
              />

              <div className="relative z-10 p-5 flex items-center gap-4">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: res.bg, border: `1px solid ${res.border}` }}
                >
                  {res.type === "zip"
                    ? <Archive className="w-4 h-4" style={{ color: res.color }} />
                    : <FileText className="w-4 h-4" style={{ color: res.color }} />}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-[13.5px] font-bold font-['Inter'] text-stone-800 leading-tight">
                      {res.title}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-[9.5px] font-semibold border font-['Inter']"
                      style={{ color: res.color, background: res.bg, borderColor: res.border }}
                    >
                      {res.tag}
                    </span>
                    {res.type === "docx" && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold border border-stone-200 text-stone-400 font-['Inter']">
                        DOCX
                      </span>
                    )}
                    {res.type === "zip" && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold border border-emerald-200 text-emerald-500 font-['Inter']">
                        ZIP
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] leading-relaxed font-['Inter'] text-stone-500">
                    {res.desc}
                  </p>
                </div>

                {/* CTA */}
                {res.type === "zip" ? (
                  <a
                    href={`https://drive.google.com/uc?export=download&id=${res.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[12px] font-semibold font-['Inter'] flex-shrink-0 transition-all group-hover:scale-[1.04]"
                    style={{
                      background: `linear-gradient(135deg, ${res.color}, ${res.color}cc)`,
                      boxShadow: `0 4px 14px ${res.bg}`,
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                ) : (
                  <div
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[12px] font-semibold font-['Inter'] flex-shrink-0 transition-all group-hover:scale-[1.04]"
                    style={{
                      background: `linear-gradient(135deg, ${res.color}, ${res.color}cc)`,
                      boxShadow: `0 4px 14px ${res.bg}`,
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Preview
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="mt-10 rounded-2xl p-5 text-center"
          style={{ background: INFY_BG, border: `1px solid ${INFY_BDR}` }}
        >
          <p className="text-[12.5px] font-['Inter'] text-stone-500">
            All materials open in a full online preview — no download needed.
          </p>
          <p className="text-[11px] font-['Inter'] mt-1" style={{ color: INFY_BLUE }}>
            Use the LaTeX resume builder to pair your prep with a strong resume.
          </p>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {activePreview && (
        <PreviewModal res={activePreview} onClose={() => setActivePreview(null)} />
      )}
    </>
  );
};

export default HackWithInfyResources;
