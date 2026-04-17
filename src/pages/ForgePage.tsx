import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hammer, RefreshCw, User, GraduationCap, Wrench,
  FolderGit2, Briefcase, Award, ChevronLeft, ChevronRight, ChevronDown, Check, Plus, Trash2, Trophy, Wand2, Loader2, Copy, X, FileCode, Eye,
} from "lucide-react";
import Header from "@/components/Header";
import ResumeUploader from "./forge/ResumeUploader";
import ResumePreview from "./forge/ResumePreview";
import { ResumeData, emptyResume, Education, Project, Experience, Certification } from "./forge/types";
import { supabase } from "@/integrations/supabase/client";
import { generateLatex } from "./forge/latexGenerator";
import { useResume } from "@/hooks/useResume";

/* ─── Primitive field components ─── */
const Field = ({ label, value, onChange, placeholder, type = "text", rows }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; rows?: number;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold font-['Inter'] text-stone-400 uppercase tracking-wider">{label}</label>
    {rows ? (
      <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none font-['Inter'] transition-all" />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 font-['Inter'] transition-all" />
    )}
  </div>
);

const TagInput = ({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) => {
  const [input, setInput] = useState("");
  const add = () => { const v = input.trim(); if (v && !values.includes(v)) onChange([...values, v]); setInput(""); };
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold font-['Inter'] text-stone-400 uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2 min-h-[44px] p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
        {values.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-800 text-white rounded-lg text-xs font-['Inter']">
            {v}
            <button onClick={() => onChange(values.filter((_, j) => j !== i))} className="hover:text-stone-300 leading-none">×</button>
          </span>
        ))}
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder="Type and press Enter"
          className="flex-1 min-w-[120px] bg-transparent text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none font-['Inter']" />
      </div>
    </div>
  );
};

const RemoveBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="p-1.5 text-stone-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50">
    <Trash2 className="w-3.5 h-3.5" />
  </button>
);

/* ─── Step definitions ─── */
const STEPS = [
  { id: "personal",        label: "Personal",       icon: User },
  { id: "education",       label: "Education",      icon: GraduationCap },
  { id: "skills",          label: "Skills",         icon: Wrench },
  { id: "projects",        label: "Projects",       icon: FolderGit2 },
  { id: "experience",      label: "Experience",     icon: Briefcase },
  { id: "achievements",    label: "Achievements",   icon: Trophy },
];

/* ─── Step content renderer ─── */
function StepContent({ step, data, onChange }: { step: number; data: ResumeData; onChange: (d: ResumeData) => void }) {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const toggle = (i: number) => setCollapsed(c => ({ ...c, [i]: !c[i] }));

  const [descMode, setDescMode] = useState<Record<string, "para" | "points">>({});
  const getMode = (key: string) => descMode[key] ?? "para";
  const setMode = (key: string, m: "para" | "points") => setDescMode(d => ({ ...d, [key]: m }));

  const DescField = ({ entryKey, value, onChange: onCh, refactorContext }: {
    entryKey: string;
    value: string;
    onChange: (v: string) => void;
    refactorContext?: { type: "experience" | "project"; label: string };
  }) => {
    const mode = getMode(entryKey);
    const lines = value.split("\n");
    const [refactoring, setRefactoring] = useState(false);
    const [refactorError, setRefactorError] = useState("");

    const handleRefactor = async () => {
      if (!value.trim() || refactoring) return;
      setRefactoring(true);
      setRefactorError("");
      try {
        const { data, error } = await supabase.functions.invoke("refactor-description", {
          body: {
            description: value,
            type: refactorContext?.type ?? "experience",
            label: refactorContext?.label ?? "",
          },
        });
        // surface the real error from the function body (always 200 now)
        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);
        if (!data?.points?.length) throw new Error("Refactor failed — try adding more detail.");
        setMode(entryKey, "points");
        onCh(data.points.join("\n"));
      } catch (err: any) {
        setRefactorError(err.message || "Something went wrong");
      } finally {
        setRefactoring(false);
      }
    };

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] font-semibold font-['Inter'] text-stone-400 uppercase tracking-wider">Description</label>
          <div className="flex items-center gap-1.5">
            {refactorContext && (
              <button
                onClick={handleRefactor}
                disabled={refactoring || !value.trim()}
                title="Rewrite with STAR method (2 bullet points)"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold font-['Inter'] hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {refactoring
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Wand2 className="w-3 h-3" />}
                {refactoring ? "Rewriting…" : "Refactor"}
              </button>
            )}
            <div className="flex items-center gap-0.5 bg-stone-100 rounded-lg p-0.5">
              {(["para", "points"] as const).map(m => (
                <button key={m} onClick={() => setMode(entryKey, m)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold font-['Inter'] transition-all ${mode === m ? "bg-white text-stone-800 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}>
                  {m === "para" ? "¶ Para" : "· Points"}
                </button>
              ))}
            </div>
          </div>
        </div>
        {refactorError && (
          <p className="text-[11px] text-red-500 font-['Inter']">{refactorError}</p>
        )}
        {mode === "para" ? (
          <textarea rows={3} value={value} onChange={e => onCh(e.target.value)}
            placeholder="Describe what you worked on and its impact"
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none font-['Inter'] transition-all" />
        ) : (
          <div className="space-y-2">
            {lines.map((line, pi) => (
              <div key={pi} className="flex items-center gap-2">
                <span className="text-stone-300 text-base leading-none shrink-0">•</span>
                <textarea value={line}
                  onChange={e => { const el = e.currentTarget; const next = [...lines]; next[pi] = e.target.value; onCh(next.join("\n")); el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }}
                  placeholder={`Point ${pi + 1}`}
                  rows={1}
                  style={{ height: "auto" }}
                  ref={el => { if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }}
                  className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 font-['Inter'] resize-none overflow-hidden" />
                {lines.length > 1 && <RemoveBtn onClick={() => onCh(lines.filter((_, j) => j !== pi).join("\n"))} />}
              </div>
            ))}
            <button onClick={() => onCh(value.trimEnd() + "\n")}
              className="flex items-center gap-1.5 text-[12px] font-medium font-['Inter'] text-stone-400 hover:text-stone-700 transition-colors mt-1 ml-5">
              <Plus className="w-3.5 h-3.5" /> Add point
            </button>
          </div>
        )}
      </div>
    );
  };

  const EntryHeader = ({ i, title, canRemove, onRemove }: { i: number; title: string; canRemove?: boolean; onRemove?: () => void }) => (
    <div className="flex items-center gap-2">
      <button onClick={() => toggle(i)} className="flex items-center gap-2 flex-1 text-left group">
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-transform duration-200 ${collapsed[i] ? "-rotate-90" : ""}`} />
        <span className="text-xs font-semibold font-['Inter'] text-stone-600 truncate max-w-[220px]">
          {title}
        </span>
      </button>
      {canRemove && onRemove && <RemoveBtn onClick={onRemove} />}
    </div>
  );

  const set = (path: string, value: any) => {
    const keys = path.split(".");
    const next = JSON.parse(JSON.stringify(data));
    let cursor: any = next;
    for (let i = 0; i < keys.length - 1; i++) cursor = cursor[keys[i]];
    cursor[keys[keys.length - 1]] = value;
    onChange(next);
  };

  /* Education helpers */
  const setEdu = (i: number, key: keyof Education, v: string) => { const a = [...data.education]; a[i] = { ...a[i], [key]: v }; onChange({ ...data, education: a }); };
  const addEdu = () => onChange({ ...data, education: [...data.education, { degree: "", institution: "", branch: "", cgpa: "", year: "" }] });
  const rmEdu  = (i: number) => onChange({ ...data, education: data.education.filter((_, j) => j !== i) });

  /* Project helpers */
  const setProj = (i: number, key: keyof Project, v: string) => { const a = [...data.projects]; a[i] = { ...a[i], [key]: v }; onChange({ ...data, projects: a }); };
  const addProj = () => onChange({ ...data, projects: [...data.projects, { name: "", description: "", tech: "", link: "" }] });
  const rmProj  = (i: number) => onChange({ ...data, projects: data.projects.filter((_, j) => j !== i) });

  /* Experience helpers */
  const setExp = (i: number, key: keyof Experience, v: string) => { const a = [...data.experience]; a[i] = { ...a[i], [key]: v }; onChange({ ...data, experience: a }); };
  const addExp = () => onChange({ ...data, experience: [...data.experience, { company: "", role: "", duration: "", description: "" }] });
  const rmExp  = (i: number) => onChange({ ...data, experience: data.experience.filter((_, j) => j !== i) });

  /* Cert helpers */
  const setCert = (i: number, key: keyof Certification, v: string) => { const a = [...data.certifications]; a[i] = { ...a[i], [key]: v }; onChange({ ...data, certifications: a }); };
  const addCert = () => onChange({ ...data, certifications: [...data.certifications, { name: "", issuer: "", date: "" }] });
  const rmCert  = (i: number) => onChange({ ...data, certifications: data.certifications.filter((_, j) => j !== i) });

  const AddBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button onClick={onClick} className="flex items-center gap-1.5 text-[12px] font-medium font-['Inter'] text-stone-500 hover:text-stone-800 transition-colors mt-1">
      <Plus className="w-3.5 h-3.5" />{label}
    </button>
  );

  if (step === 0) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Full Name"  value={data.personal.name}      onChange={v => set("personal.name", v)}      placeholder="Hari Krishna" />
      <Field label="Email"      value={data.personal.email}     onChange={v => set("personal.email", v)}     placeholder="hari@email.com" type="email" />
      <Field label="Phone"      value={data.personal.phone}     onChange={v => set("personal.phone", v)}     placeholder="+91 99999 99999" />
      <Field label="Location"   value={data.personal.location}  onChange={v => set("personal.location", v)}  placeholder="Chennai, India" />
      <Field label="LinkedIn"   value={data.personal.linkedin}  onChange={v => set("personal.linkedin", v)}  placeholder="linkedin.com/in/username" />
      <Field label="GitHub"     value={data.personal.github}    onChange={v => set("personal.github", v)}    placeholder="github.com/username" />
      <Field label="Portfolio"  value={data.personal.portfolio} onChange={v => set("personal.portfolio", v)} placeholder="yoursite.com" />
    </div>
  );

  if (step === 1) return (
    <div className="space-y-4">
      {data.education.map((edu, i) => (
        <div key={i} className="pb-4 border-b border-stone-100 last:border-0 last:pb-0">
          <EntryHeader
            i={i}
            title={edu.degree || edu.institution || `Education ${i + 1}`}
            canRemove={data.education.length > 1}
            onRemove={() => rmEdu(i)}
          />
          {!collapsed[i] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Field label="Degree"       value={edu.degree}      onChange={v => setEdu(i, "degree", v)}      placeholder="B.E. Computer Science" />
              <Field label="Institution"  value={edu.institution} onChange={v => setEdu(i, "institution", v)} placeholder="Anna University" />
              <Field label="Branch"       value={edu.branch}      onChange={v => setEdu(i, "branch", v)}      placeholder="CSE" />
              <Field label="CGPA / %"     value={edu.cgpa}        onChange={v => setEdu(i, "cgpa", v)}        placeholder="8.5 / 10" />
              <Field label="Year"         value={edu.year}        onChange={v => setEdu(i, "year", v)}        placeholder="2025" />
            </div>
          )}
        </div>
      ))}
      <AddBtn onClick={addEdu} label="Add Education" />
    </div>
  );

  if (step === 2) return (
    <div className="space-y-5">
      <TagInput label="Technical Skills"      values={data.skills.technical} onChange={v => set("skills.technical", v)} />
      <TagInput label="Tools & Frameworks"    values={data.skills.tools}     onChange={v => set("skills.tools", v)} />
      <TagInput label="Programming Languages" values={data.skills.languages} onChange={v => set("skills.languages", v)} />
      <TagInput label="Soft Skills"           values={data.skills.soft}      onChange={v => set("skills.soft", v)} />
    </div>
  );

  if (step === 3) return (
    <div className="space-y-4">
      {data.projects.map((proj, i) => (
        <div key={i} className="pb-4 border-b border-stone-100 last:border-0 last:pb-0">
          <EntryHeader
            i={i}
            title={proj.name || `Project ${i + 1}`}
            canRemove={data.projects.length > 1}
            onRemove={() => rmProj(i)}
          />
          {!collapsed[i] && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Project Name" value={proj.name} onChange={v => setProj(i, "name", v)} placeholder="Smart Attendance System" />
                <Field label="Tech Stack"   value={proj.tech} onChange={v => setProj(i, "tech", v)} placeholder="React, Node.js, MongoDB" />
                <Field label="Link"         value={proj.link} onChange={v => setProj(i, "link", v)} placeholder="github.com/..." />
              </div>
              <DescField entryKey={`proj-${i}`} value={proj.description} onChange={v => setProj(i, "description", v)} refactorContext={{ type: "project", label: proj.name || `Project ${i + 1}` }} />
            </div>
          )}
        </div>
      ))}
      <AddBtn onClick={addProj} label="Add Project" />
    </div>
  );

  if (step === 4) return (
    <div className="space-y-4">
      {data.experience.length === 0 && (
        <p className="text-stone-400 text-sm font-['Inter'] text-center py-4">No experience yet — add your first internship or role.</p>
      )}
      {data.experience.map((exp, i) => (
        <div key={i} className="pb-4 border-b border-stone-100 last:border-0 last:pb-0">
          <EntryHeader
            i={i}
            title={exp.role && exp.company ? `${exp.role} · ${exp.company}` : exp.company || exp.role || `Experience ${i + 1}`}
            canRemove={true}
            onRemove={() => rmExp(i)}
          />
          {!collapsed[i] && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company"  value={exp.company}  onChange={v => setExp(i, "company", v)}  placeholder="Infosys" />
                <Field label="Role"     value={exp.role}     onChange={v => setExp(i, "role", v)}     placeholder="Software Engineer Intern" />
                <Field label="Duration" value={exp.duration} onChange={v => setExp(i, "duration", v)} placeholder="Jun 2024 – Aug 2024" />
              </div>
              <DescField entryKey={`exp-${i}`} value={exp.description} onChange={v => setExp(i, "description", v)} refactorContext={{ type: "experience", label: exp.role && exp.company ? `${exp.role} at ${exp.company}` : exp.role || exp.company || `Experience ${i + 1}` }} />
            </div>
          )}
        </div>
      ))}
      <AddBtn onClick={addExp} label="Add Experience" />
    </div>
  );

  if (step === 5) return (
    <div className="space-y-8">
      {/* Certifications */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-stone-400" />
          <span className="text-sm font-semibold font-['Merriweather'] text-stone-700">Certifications</span>
        </div>
        {data.certifications.length === 0 && (
          <p className="text-stone-400 text-sm font-['Inter'] text-center py-2">No certifications added yet.</p>
        )}
        {data.certifications.map((cert, i) => (
          <div key={i} className="pb-4 border-b border-stone-100 last:border-0">
            <EntryHeader
              i={100 + i}
              title={cert.name || `Certification ${i + 1}`}
              canRemove={true}
              onRemove={() => rmCert(i)}
            />
            {!collapsed[100 + i] && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <Field label="Name"   value={cert.name}   onChange={v => setCert(i, "name", v)}   placeholder="AWS Cloud Practitioner" />
                <Field label="Issuer" value={cert.issuer} onChange={v => setCert(i, "issuer", v)} placeholder="Amazon" />
                <Field label="Date"   value={cert.date}   onChange={v => setCert(i, "date", v)}   placeholder="Jan 2024" />
              </div>
            )}
          </div>
        ))}
        <AddBtn onClick={addCert} label="Add Certification" />
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-stone-400" />
          <span className="text-sm font-semibold font-['Merriweather'] text-stone-700">Achievements</span>
        </div>
        {data.achievements.map((ach, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input value={ach} onChange={e => { const a = [...data.achievements]; a[i] = e.target.value; onChange({ ...data, achievements: a }); }}
              placeholder={`Achievement ${i + 1}`}
              className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 font-['Inter'] transition-all" />
            <RemoveBtn onClick={() => onChange({ ...data, achievements: data.achievements.filter((_, j) => j !== i) })} />
          </div>
        ))}
        <AddBtn onClick={() => onChange({ ...data, achievements: [...data.achievements, ""] })} label="Add Achievement" />
      </div>
    </div>
  );

  return null;
}

/* ─── Main page ─── */
export default function ForgePage() {
  const { savedData, loading: resumeLoading, save, saveStatus, isSignedIn } = useResume();

  const [data, setData]           = useState<ResumeData | null>(null);
  const [step, setStep]           = useState(0);
  const [dir,  setDir]            = useState(1);
  const [latexOutput, setLatex]   = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [previewOpen, setPreview] = useState(false);

  // Load saved resume once it arrives
  useEffect(() => {
    if (!resumeLoading && savedData && !data) {
      setData(savedData);
    }
  }, [resumeLoading, savedData]);

  const handleParsed     = (parsed: ResumeData) => { setData(parsed); setStep(0); };
  const handleStartBlank = () => { setData(emptyResume()); setStep(0); };
  const handleReset      = () => { setData(null); setStep(0); setLatex(null); };

  const handleDone = () => {
    if (!data) return;
    if (isSignedIn) save(data);
    setLatex(generateLatex(data));
  };


  const handleCopy = () => {
    if (!latexOutput) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(latexOutput).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Fallback for Safari / non-HTTPS
      const ta = document.createElement("textarea");
      ta.value = latexOutput;
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };
  const next = () => { if (step < STEPS.length - 1) goTo(step + 1); };
  const back = () => { if (step > 0) goTo(step - 1); };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="min-h-screen" style={{ background: "#fcfcf9" }}>
      <Header />

      <div className="pt-20 pb-16 px-4 max-w-2xl mx-auto">

        {/* ── Brand pill ── */}
        <div className="flex justify-center mt-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200">
            <Hammer className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-[12px] font-semibold font-['Inter'] text-stone-600 tracking-wide">FORGE</span>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Upload screen ── */}
          {!data && (
            <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="font-['Merriweather'] font-bold text-3xl text-stone-900 mb-2">Build your resume.</h1>
                <p className="font-['Inter'] text-stone-500 text-[14px] max-w-sm mx-auto leading-relaxed">
                  Upload and AI fills everything. Then walk through each section and refine.
                </p>
              </div>

              <ResumeUploader onParsed={handleParsed} />

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="font-['Inter'] text-stone-400 text-xs">or</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              <button onClick={handleStartBlank}
                className="w-full py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-600 font-['Inter'] font-medium text-sm hover:bg-stone-50 hover:border-stone-300 transition-all duration-200 active:scale-[0.99]">
                Start from scratch instead
              </button>
            </motion.div>
          )}

          {/* ── Step wizard ── */}
          {data && (
            <motion.div key="wizard" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

              {/* ── Roadmap ── */}
              <div className="flex items-center justify-between mb-8 overflow-x-auto pb-1 gap-1">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const done    = i < step;
                  const active  = i === step;
                  return (
                    <button key={s.id} onClick={() => goTo(i)}
                      className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
                    >
                      <div className={`
                        w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                        ${active  ? "bg-stone-900 shadow-md scale-110" : ""}
                        ${done    ? "bg-stone-800" : ""}
                        ${!active && !done ? "bg-stone-100 group-hover:bg-stone-200" : ""}
                      `}>
                        {done
                          ? <Check className="w-3.5 h-3.5 text-white" />
                          : <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-stone-400 group-hover:text-stone-600"}`} />
                        }
                      </div>
                      <span className={`text-[10px] font-semibold font-['Inter'] tracking-wide transition-colors ${active ? "text-stone-900" : done ? "text-stone-500" : "text-stone-300 group-hover:text-stone-500"}`}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── Connector line ── */}
              <div className="relative h-0.5 bg-stone-100 rounded-full mb-8 -mt-4">
                <div className="absolute inset-y-0 left-0 bg-stone-800 rounded-full transition-all duration-500"
                  style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
              </div>

              {/* ── Section card ── */}
              <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    {(() => { const Icon = STEPS[step].icon; return <Icon className="w-4 h-4 text-stone-500" />; })()}
                    <span className="font-['Merriweather'] font-bold text-stone-800 text-sm">{STEPS[step].label}</span>
                  </div>
                  <button onClick={handleReset} className="flex items-center gap-1 text-[11px] font-['Inter'] text-stone-300 hover:text-stone-500 transition-colors">
                    <RefreshCw className="w-3 h-3" /> Upload again
                  </button>
                </div>

                {/* Animated step content */}
                <div className="p-6 min-h-[280px]">
                  <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                      key={step}
                      custom={dir}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                    >
                      <StepContent step={step} data={data} onChange={setData} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 bg-stone-50/50">
                  <button onClick={back} disabled={step === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-['Inter'] font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>

                  <span className="text-[11px] font-['Inter'] text-stone-400">
                    {step + 1} / {STEPS.length}
                  </span>

                  {step < STEPS.length - 1 ? (
                    <button onClick={next}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-['Inter'] font-semibold text-white bg-stone-900 hover:bg-stone-700 active:scale-95 transition-all">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* Preview & Download PDF */}
                      <button
                        onClick={() => setPreview(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-['Inter'] font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all border border-stone-200"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      {/* Save & Generate LaTeX */}
                      <button
                        onClick={handleDone}
                        disabled={saveStatus === "saving"}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-['Inter'] font-semibold text-white active:scale-95 transition-all disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #ea580c, #c2410c)", boxShadow: "0 4px 14px rgba(234,88,12,0.3)" }}>
                        {saveStatus === "saving"
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                          : saveStatus === "saved"
                          ? <><Check className="w-4 h-4" /> Saved!</>
                          : <><FileCode className="w-4 h-4" /> LaTeX</> }
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── LaTeX Output Modal ── */}
      <AnimatePresence>
        {latexOutput && (
          <motion.div
            key="latex-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(28,25,23,0.6)", backdropFilter: "blur(6px)" }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <FileCode className="w-4 h-4 text-stone-500" />
                  <span className="font-['Merriweather'] font-bold text-stone-800 text-sm">Your LaTeX Resume</span>
                  <span className="text-[11px] font-['Inter'] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">Overleaf ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 text-white text-[12px] font-semibold font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => setLatex(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Code block */}
              <div className="overflow-y-auto flex-1 p-6">
                <pre className="text-[12px] font-mono text-stone-700 bg-stone-50 rounded-2xl p-5 border border-stone-100 whitespace-pre-wrap leading-relaxed select-all">
                  {latexOutput}
                </pre>
              </div>

              {/* Footer — step-by-step Overleaf guide */}
              <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/60 shrink-0">
                <p className="text-[11px] font-bold font-['Inter'] text-stone-500 uppercase tracking-wider mb-3">
                  How to turn this into a PDF resume
                </p>
                <ol className="space-y-1.5">
                  {[
                    <>
                      <span className="font-semibold text-stone-700">Copy the code</span> using the button above.
                    </>,
                    <>
                      Open{' '}
                      <a
                        href="https://www.overleaf.com/project"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-green-700 underline underline-offset-2 hover:text-green-900 transition-colors"
                      >
                        overleaf.com/project
                      </a>
                      {' '}and sign in (free account).
                    </>,
                    <>
                      Click <span className="font-semibold text-stone-700">New Project</span> → <span className="font-semibold text-stone-700">Blank Project</span> → give it any name.
                    </>,
                    <>
                      In the editor, <span className="font-semibold text-stone-700">select all</span> the existing code (Ctrl+A / ⌘+A) and <span className="font-semibold text-stone-700">paste</span> your copied code.
                    </>,
                    <>
                      Click the green <span className="font-semibold text-stone-700">Recompile</span> button — your resume PDF appears on the right.
                    </>,
                    <>
                      Hit <span className="font-semibold text-stone-700">Download PDF</span> (the download icon) — done! 🎉
                    </>,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[11px] font-['Inter'] text-stone-500">
                      <span
                        className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white mt-0.5"
                        style={{ background: '#292524' }}
                      >
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resume Preview Modal ── */}
      {previewOpen && data && (
        <ResumePreview data={data} onClose={() => setPreview(false)} />
      )}

    </div>
  );
}
