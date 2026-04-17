import { useState, useRef } from "react";
import { X, Eye, FileCode, Copy, Check } from "lucide-react";
import { ResumeData } from "./types";
import { generateLatex } from "./latexGenerator";

interface ResumePreviewProps {
  data: ResumeData;
  onClose: () => void;
}

// ─── Build a clean printable HTML resume ─────────────────────────────────────
function buildHtml(data: ResumeData): string {
  const { personal, education, skills, projects, experience, certifications, achievements } = data;

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const contact = [
    personal.email    && `<a href="mailto:${esc(personal.email)}">${esc(personal.email)}</a>`,
    personal.phone    && esc(personal.phone),
    personal.location && esc(personal.location),
    personal.linkedin && `<a href="https://${esc(personal.linkedin)}">${esc(personal.linkedin)}</a>`,
    personal.github   && `<a href="https://${esc(personal.github)}">${esc(personal.github)}</a>`,
    personal.portfolio && `<a href="https://${esc(personal.portfolio)}">${esc(personal.portfolio)}</a>`,
  ].filter(Boolean).join(" &nbsp;|&nbsp; ");

  const sec = (title: string, body: string) =>
    body.trim()
      ? `<div class="sec"><div class="sec-title">${title}</div><hr class="rule"/>${body}</div>`
      : "";

  const eduHtml = education.filter(e => e.institution || e.degree).map(e => `
    <div class="entry">
      <div class="row"><span class="bold">${esc(e.institution)}</span><span class="right">${esc(e.year)}</span></div>
      <div class="row sub"><span>${esc(e.degree)}${e.branch ? ` — ${esc(e.branch)}` : ""}</span>${e.cgpa ? `<span class="right">${esc(e.cgpa)}</span>` : ""}</div>
    </div>`).join("");

  const allSkills = [
    skills.languages.length ? `<strong>Languages:</strong> ${skills.languages.map(esc).join(", ")}` : "",
    skills.technical.length ? `<strong>Technical:</strong> ${skills.technical.map(esc).join(", ")}` : "",
    skills.tools.length     ? `<strong>Tools:</strong> ${skills.tools.map(esc).join(", ")}` : "",
    skills.soft.length      ? `<strong>Soft Skills:</strong> ${skills.soft.map(esc).join(", ")}` : "",
  ].filter(Boolean).join("<br/>");

  const expHtml = experience.filter(e => e.company || e.role).map(e => {
    const bullets = e.description.split("\n").map(l => l.trim()).filter(Boolean)
      .map(l => `<li>${esc(l)}</li>`).join("");
    return `<div class="entry">
      <div class="row"><span class="bold">${esc(e.role)}</span><span class="right">${esc(e.duration)}</span></div>
      <div class="sub">${esc(e.company)}</div>
      ${bullets ? `<ul class="bullets">${bullets}</ul>` : ""}
    </div>`;
  }).join("");

  const projHtml = projects.filter(p => p.name).map(p => {
    const bullets = p.description.split("\n").map(l => l.trim()).filter(Boolean)
      .map(l => `<li>${esc(l)}</li>`).join("");
    return `<div class="entry">
      <div class="row">
        <span class="bold">${esc(p.name)}${p.tech ? ` <span class="tech">| ${esc(p.tech)}</span>` : ""}</span>
        ${p.link ? `<a class="right link" href="https://${esc(p.link)}">${esc(p.link)}</a>` : ""}
      </div>
      ${bullets ? `<ul class="bullets">${bullets}</ul>` : ""}
    </div>`;
  }).join("");

  const certHtml = certifications.filter(c => c.name).map(c => `
    <div class="row sub">
      <span>${esc(c.name)}${c.issuer ? ` — ${esc(c.issuer)}` : ""}</span>
      ${c.date ? `<span class="right">${esc(c.date)}</span>` : ""}
    </div>`).join("");

  const achHtml = achievements.filter(Boolean).length
    ? `<ul class="bullets">${achievements.filter(Boolean).map(a => `<li>${esc(a)}</li>`).join("")}</ul>` : "";

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/>
<title>${esc(personal.name || "Resume")}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  /* Desk surface */
  html{background:#b0a99a;min-height:100%;padding:24px 0 48px;}
  /* Paper — A4 width, natural height, page seams every 297mm */
  body{
    font-family:'Inter',Arial,sans-serif;font-size:10.5pt;color:#1c1c1e;
    background-color:#fff;
    /* Page-seam lines at every A4 height */
    background-image:linear-gradient(
      to bottom,
      transparent calc(297mm - 2px),
      #c8bfb0 calc(297mm - 2px),
      #c8bfb0 297mm,
      transparent 297mm
    );
    background-size:100% 297mm;
    background-repeat:repeat-y;
    max-width:210mm;
    margin:0 auto;
    padding:18mm 16mm;
    box-shadow:0 4px 36px rgba(0,0,0,0.28),0 1px 4px rgba(0,0,0,0.14);
  }
  .name{font-size:20pt;font-weight:700;letter-spacing:-0.5px;text-align:center}
  .contact{font-size:8.5pt;text-align:center;color:#555;margin-top:4px}
  .contact a{color:#1a6ec8;text-decoration:none}
  .sec{margin-top:12px}
  .sec-title{font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px}
  .rule{border:none;border-top:1.5px solid #1c1c1e;margin-bottom:6px}
  .entry{margin-bottom:7px}
  .row{display:flex;justify-content:space-between;align-items:baseline}
  .bold{font-weight:600}
  .right{font-size:9pt;color:#444;white-space:nowrap;margin-left:8px;flex-shrink:0}
  .sub{font-size:9.5pt;color:#444;margin-top:1px}
  .tech{font-weight:400;color:#555}
  .link{font-size:8.5pt;color:#1a6ec8;text-decoration:none}
  .bullets{padding-left:14px;margin-top:3px}
  .bullets li{font-size:9.5pt;color:#2d2d2d;line-height:1.5;margin-bottom:2px}
  @media print{html{background:#fff}body{margin:0;padding:20px 28px;box-shadow:none}@page{margin:.5cm .8cm;size:A4}}
</style></head><body>
  <div class="name">${esc(personal.name || "Your Name")}</div>
  <div class="contact">${contact}</div>
  ${sec("Education", eduHtml)}
  ${sec("Skills", allSkills ? `<div style="font-size:9.5pt;line-height:1.7">${allSkills}</div>` : "")}
  ${sec("Experience", expHtml)}
  ${sec("Projects", projHtml)}
  ${certHtml ? sec("Certifications", certHtml) : ""}
  ${achHtml  ? sec("Achievements",   achHtml)  : ""}
</body></html>`;
}

// ─── Component ────────────────────────────────────────────────────────────────
type Tab = "preview" | "latex";

export default function ResumePreview({ data, onClose }: ResumePreviewProps) {
  const [tab, setTab] = useState<Tab>("preview");
  const [copied, setCopied] = useState(false);
  const blobRef = useRef<string | null>(null);

  const latex = generateLatex(data);

  // Generate blob URL lazily once
  if (!blobRef.current) {
    const html = buildHtml(data);
    blobRef.current = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  }

  const handleCopy = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(latex).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    } else {
      const ta = document.createElement("textarea");
      ta.value = latex;
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(28,25,23,0.88)", backdropFilter: "blur(8px)" }}>

      {/* ── Toolbar ── */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ background: "#1c1917", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-stone-800 rounded-xl p-1">
          {([
            { id: "preview", label: "Preview", icon: Eye    },
            { id: "latex",   label: "LaTeX",   icon: FileCode },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold font-['Inter'] transition-all ${
                tab === id ? "bg-stone-600 text-white shadow" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {tab === "latex" && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold font-['Inter'] text-white bg-stone-700 hover:bg-stone-600 active:scale-95 transition-all border border-stone-600"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy LaTeX"}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:text-white hover:bg-stone-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-hidden bg-stone-700">
        {tab === "preview" && (
          <iframe
            src={blobRef.current}
            title="Resume Preview"
            className="w-full h-full border-0"
            style={{ background: "#b0a99a" }}
            onLoad={() => { if (blobRef.current) URL.revokeObjectURL(blobRef.current); blobRef.current = null; }}
          />
        )}

        {tab === "latex" && (
          <div className="w-full h-full overflow-auto p-6 bg-[#1e1e1e]">
            <pre
              className="text-[12px] font-mono leading-relaxed whitespace-pre select-all"
              style={{ color: "#d4d4d4", fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
            >
              {latex}
            </pre>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        className="px-6 py-2 text-center text-[11px] font-['Inter'] text-stone-500 shrink-0"
        style={{ background: "#1c1917" }}
      >
        {tab === "preview"
          ? "Live HTML preview · Switch to LaTeX tab to copy the source"
          : <>Copy the LaTeX code → paste into <a href="https://overleaf.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">Overleaf</a> → click Recompile → Download PDF</>
        }
      </div>
    </div>
  );
}
