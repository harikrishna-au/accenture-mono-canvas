import { useState } from "react";
import { Plus, Trash2, User, GraduationCap, Wrench, FolderGit2, Briefcase, Award, Trophy } from "lucide-react";
import { ResumeData, Education, Project, Experience, Certification } from "./types";

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

/* ── Shared primitives ── */
const Field = ({
  label, value, onChange, placeholder, type = "text", rows,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; rows?: number;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold font-['Inter'] text-stone-400 uppercase tracking-wider">{label}</label>
    {rows ? (
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none font-['Inter'] transition-all"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 font-['Inter'] transition-all"
      />
    )}
  </div>
);

const TagInput = ({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) => {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold font-['Inter'] text-stone-400 uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
        {values.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-800 text-white rounded-lg text-xs font-['Inter']">
            {v}
            <button onClick={() => onChange(values.filter((_, j) => j !== i))} className="hover:text-stone-300">×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder="Type and press Enter"
          className="flex-1 min-w-[120px] bg-transparent text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none font-['Inter']"
        />
      </div>
    </div>
  );
};

const SectionCard = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-5">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-stone-600" />
      </div>
      <h3 className="font-['Merriweather'] font-bold text-stone-900 text-sm">{title}</h3>
    </div>
    {children}
  </div>
);

const AddButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 text-[12px] font-medium font-['Inter'] text-stone-500 hover:text-stone-800 transition-colors mt-1"
  >
    <Plus className="w-3.5 h-3.5" /> {label}
  </button>
);

const RemoveButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="p-1.5 text-stone-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
  >
    <Trash2 className="w-3.5 h-3.5" />
  </button>
);

/* ── Main Form ── */
export default function ResumeForm({ data, onChange }: Props) {
  const set = (path: string, value: any) => {
    const keys = path.split(".");
    const next = JSON.parse(JSON.stringify(data));
    let cursor: any = next;
    for (let i = 0; i < keys.length - 1; i++) cursor = cursor[keys[i]];
    cursor[keys[keys.length - 1]] = value;
    onChange(next);
  };

  /* ── Education ── */
  const addEdu = () => onChange({ ...data, education: [...data.education, { degree: "", institution: "", branch: "", cgpa: "", year: "" }] });
  const removeEdu = (i: number) => onChange({ ...data, education: data.education.filter((_, j) => j !== i) });
  const setEdu = (i: number, key: keyof Education, val: string) => {
    const edu = [...data.education];
    edu[i] = { ...edu[i], [key]: val };
    onChange({ ...data, education: edu });
  };

  /* ── Projects ── */
  const addProj = () => onChange({ ...data, projects: [...data.projects, { name: "", description: "", tech: "", link: "" }] });
  const removeProj = (i: number) => onChange({ ...data, projects: data.projects.filter((_, j) => j !== i) });
  const setProj = (i: number, key: keyof Project, val: string) => {
    const p = [...data.projects];
    p[i] = { ...p[i], [key]: val };
    onChange({ ...data, projects: p });
  };

  /* ── Experience ── */
  const addExp = () => onChange({ ...data, experience: [...data.experience, { company: "", role: "", duration: "", description: "" }] });
  const removeExp = (i: number) => onChange({ ...data, experience: data.experience.filter((_, j) => j !== i) });
  const setExp = (i: number, key: keyof Experience, val: string) => {
    const e = [...data.experience];
    e[i] = { ...e[i], [key]: val };
    onChange({ ...data, experience: e });
  };

  /* ── Certifications ── */
  const addCert = () => onChange({ ...data, certifications: [...data.certifications, { name: "", issuer: "", date: "" }] });
  const removeCert = (i: number) => onChange({ ...data, certifications: data.certifications.filter((_, j) => j !== i) });
  const setCert = (i: number, key: keyof Certification, val: string) => {
    const c = [...data.certifications];
    c[i] = { ...c[i], [key]: val };
    onChange({ ...data, certifications: c });
  };

  return (
    <div className="space-y-5">

      {/* Personal */}
      <SectionCard icon={User} title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" value={data.personal.name} onChange={(v) => set("personal.name", v)} placeholder="Hari Krishna" />
          <Field label="Email" value={data.personal.email} onChange={(v) => set("personal.email", v)} placeholder="hari@email.com" type="email" />
          <Field label="Phone" value={data.personal.phone} onChange={(v) => set("personal.phone", v)} placeholder="+91 99999 99999" />
          <Field label="Location" value={data.personal.location} onChange={(v) => set("personal.location", v)} placeholder="Chennai, India" />
          <Field label="LinkedIn" value={data.personal.linkedin} onChange={(v) => set("personal.linkedin", v)} placeholder="linkedin.com/in/username" />
          <Field label="GitHub" value={data.personal.github} onChange={(v) => set("personal.github", v)} placeholder="github.com/username" />
          <Field label="Portfolio" value={data.personal.portfolio} onChange={(v) => set("personal.portfolio", v)} placeholder="yoursite.com" />
        </div>
      </SectionCard>

      {/* Education */}
      <SectionCard icon={GraduationCap} title="Education">
        {data.education.map((edu, i) => (
          <div key={i} className="space-y-4 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-['Inter'] text-stone-400">Entry {i + 1}</span>
              {data.education.length > 1 && <RemoveButton onClick={() => removeEdu(i)} />}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Degree" value={edu.degree} onChange={(v) => setEdu(i, "degree", v)} placeholder="B.E. Computer Science" />
              <Field label="Institution" value={edu.institution} onChange={(v) => setEdu(i, "institution", v)} placeholder="Anna University" />
              <Field label="Branch / Specialisation" value={edu.branch} onChange={(v) => setEdu(i, "branch", v)} placeholder="CSE" />
              <Field label="CGPA / Percentage" value={edu.cgpa} onChange={(v) => setEdu(i, "cgpa", v)} placeholder="8.5 / 10" />
              <Field label="Year of Passing" value={edu.year} onChange={(v) => setEdu(i, "year", v)} placeholder="2025" />
            </div>
          </div>
        ))}
        <AddButton onClick={addEdu} label="Add Education" />
      </SectionCard>

      {/* Skills */}
      <SectionCard icon={Wrench} title="Skills">
        <TagInput label="Technical Skills" values={data.skills.technical} onChange={(v) => set("skills.technical", v)} />
        <TagInput label="Tools & Frameworks" values={data.skills.tools} onChange={(v) => set("skills.tools", v)} />
        <TagInput label="Programming Languages" values={data.skills.languages} onChange={(v) => set("skills.languages", v)} />
        <TagInput label="Soft Skills" values={data.skills.soft} onChange={(v) => set("skills.soft", v)} />
      </SectionCard>

      {/* Projects */}
      <SectionCard icon={FolderGit2} title="Projects">
        {data.projects.map((proj, i) => (
          <div key={i} className="space-y-4 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-['Inter'] text-stone-400">Project {i + 1}</span>
              {data.projects.length > 1 && <RemoveButton onClick={() => removeProj(i)} />}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Project Name" value={proj.name} onChange={(v) => setProj(i, "name", v)} placeholder="Smart Attendance System" />
              <Field label="Tech Stack" value={proj.tech} onChange={(v) => setProj(i, "tech", v)} placeholder="React, Node.js, MongoDB" />
              <Field label="GitHub / Link" value={proj.link} onChange={(v) => setProj(i, "link", v)} placeholder="github.com/..." />
            </div>
            <Field label="Description" value={proj.description} onChange={(v) => setProj(i, "description", v)} placeholder="Briefly describe what you built and its impact" rows={3} />
          </div>
        ))}
        <AddButton onClick={addProj} label="Add Project" />
      </SectionCard>

      {/* Experience */}
      <SectionCard icon={Briefcase} title="Experience & Internships">
        {data.experience.length === 0 && (
          <p className="text-stone-400 text-xs font-['Inter'] text-center py-2">No experience added yet</p>
        )}
        {data.experience.map((exp, i) => (
          <div key={i} className="space-y-4 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-['Inter'] text-stone-400">Entry {i + 1}</span>
              <RemoveButton onClick={() => removeExp(i)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Company" value={exp.company} onChange={(v) => setExp(i, "company", v)} placeholder="Infosys" />
              <Field label="Role" value={exp.role} onChange={(v) => setExp(i, "role", v)} placeholder="Software Engineer Intern" />
              <Field label="Duration" value={exp.duration} onChange={(v) => setExp(i, "duration", v)} placeholder="Jun 2024 – Aug 2024" />
            </div>
            <Field label="Description" value={exp.description} onChange={(v) => setExp(i, "description", v)} placeholder="What did you work on? What was the impact?" rows={3} />
          </div>
        ))}
        <AddButton onClick={addExp} label="Add Experience" />
      </SectionCard>

      {/* Certifications */}
      <SectionCard icon={Award} title="Certifications">
        {data.certifications.length === 0 && (
          <p className="text-stone-400 text-xs font-['Inter'] text-center py-2">No certifications added yet</p>
        )}
        {data.certifications.map((cert, i) => (
          <div key={i} className="space-y-4 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-['Inter'] text-stone-400">Cert {i + 1}</span>
              <RemoveButton onClick={() => removeCert(i)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Name" value={cert.name} onChange={(v) => setCert(i, "name", v)} placeholder="AWS Cloud Practitioner" />
              <Field label="Issuer" value={cert.issuer} onChange={(v) => setCert(i, "issuer", v)} placeholder="Amazon Web Services" />
              <Field label="Date" value={cert.date} onChange={(v) => setCert(i, "date", v)} placeholder="Jan 2024" />
            </div>
          </div>
        ))}
        <AddButton onClick={addCert} label="Add Certification" />
      </SectionCard>

      {/* Achievements */}
      <SectionCard icon={Trophy} title="Achievements">
        {data.achievements.map((ach, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input
              value={ach}
              onChange={(e) => {
                const a = [...data.achievements];
                a[i] = e.target.value;
                onChange({ ...data, achievements: a });
              }}
              placeholder={`Achievement ${i + 1}`}
              className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 font-['Inter'] transition-all"
            />
            <RemoveButton onClick={() => onChange({ ...data, achievements: data.achievements.filter((_, j) => j !== i) })} />
          </div>
        ))}
        <AddButton onClick={() => onChange({ ...data, achievements: [...data.achievements, ""] })} label="Add Achievement" />
      </SectionCard>

    </div>
  );
}
