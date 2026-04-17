import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap, Wrench, FolderGit2, Briefcase, Award, Trophy,
  Mail, Phone, MapPin, ExternalLink, Github, Linkedin,
  Pencil, Hammer, Loader2, Building2, CalendarDays
} from "lucide-react";
import Header from "@/components/Header";
import { useResume } from "@/hooks/useResume";
import { useUser, SignedIn, SignedOut } from "@clerk/clerk-react";

/* ── Avatar ── */
function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
  return (
    <div className="w-20 h-20 rounded-full border-4 border-white shadow-md flex items-center justify-center shrink-0"
      style={{ background: "linear-gradient(135deg, #292524, #57534e)" }}>
      <span className="text-white font-['Merriweather'] font-bold text-xl">{initials || "?"}</span>
    </div>
  );
}

/* ── Skill pill ── */
const Pill = ({ label, dark }: { label: string; dark?: boolean }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-['Inter'] font-medium ${dark ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"}`}>
    {label}
  </span>
);

/* ── Section card ── */
const Card = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100">
      <Icon className="w-3.5 h-3.5 text-stone-400" />
      <span className="font-['Merriweather'] font-bold text-stone-800 text-xs tracking-wide uppercase">{title}</span>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

/* ── Timeline entry ── */
const TRow = ({ title, sub, right, rightSub, bullets, last }: {
  title: string; sub?: string; right?: string; rightSub?: string; bullets?: string[]; last?: boolean;
}) => (
  <div className={`flex gap-3 ${!last ? "pb-4 mb-4 border-b border-stone-100" : ""}`}>
    <div className="flex flex-col items-center pt-1.5 shrink-0">
      <div className="w-2 h-2 rounded-full bg-stone-700" />
      {!last && <div className="w-px flex-1 bg-stone-100 mt-1" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold font-['Inter'] text-stone-800 text-sm leading-snug truncate">{title}</p>
          {sub && <p className="text-stone-400 text-xs font-['Inter'] mt-0.5">{sub}</p>}
        </div>
        {(right || rightSub) && (
          <div className="text-right shrink-0 ml-2">
            {right    && <p className="text-[11px] text-stone-400 font-['Inter'] flex items-center gap-1 justify-end"><CalendarDays className="w-3 h-3" />{right}</p>}
            {rightSub && <p className="text-[11px] text-stone-400 font-['Inter'] mt-0.5">{rightSub}</p>}
          </div>
        )}
      </div>
      {bullets && bullets.length > 0 && (
        <ul className="mt-2 space-y-1">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-1.5 text-xs font-['Inter'] text-stone-500 leading-snug">
              <span className="text-stone-300 shrink-0 mt-0.5">•</span>{b}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default function ForgeProfilePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { savedData, loading } = useResume();

  const p = savedData?.personal;

  return (
    <div className="min-h-screen" style={{ background: "#fcfcf9" }}>
      <Header />

      <SignedOut>
        <div className="pt-40 text-center space-y-2 px-4">
          <p className="font-['Merriweather'] font-bold text-stone-800 text-xl">Sign in to view your profile</p>
          <p className="font-['Inter'] text-stone-400 text-sm">Your saved details will appear here.</p>
        </div>
      </SignedOut>

      <SignedIn>
        {loading ? (
          <div className="flex justify-center pt-40"><Loader2 className="w-6 h-6 text-stone-400 animate-spin" /></div>
        ) : !savedData ? (
          <div className="pt-40 text-center space-y-4 px-4">
            <p className="font-['Merriweather'] font-bold text-stone-800 text-xl">No profile yet</p>
            <p className="font-['Inter'] text-stone-400 text-sm">Build your resume in Forge and it'll show up here.</p>
            <button onClick={() => navigate("/forge")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all">
              <Hammer className="w-4 h-4" /> Go to Forge
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

            {/* Cover */}
            <div className="w-full h-36 mt-16" style={{ background: "linear-gradient(135deg, #1c1917 0%, #44403c 60%, #78716c 100%)" }} />

            <div className="max-w-5xl mx-auto px-4 -mt-12 pb-12">
              <div className="grid grid-cols-[2fr_3fr] gap-4 items-start">

                {/* ═══════ LEFT COLUMN ═══════ */}
                <div className="space-y-3">

                  {/* Identity card */}
                  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 pt-4 pb-5">
                    <div className="flex items-end justify-between mb-3">
                      <Avatar name={p?.name || user?.firstName || "?"} />
                      <button onClick={() => navigate("/forge")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-500 text-xs font-['Inter'] font-medium hover:bg-stone-50 transition-all active:scale-95 mb-0.5">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    </div>
                    <h1 className="font-['Merriweather'] font-bold text-stone-900 text-lg leading-tight">
                      {p?.name || user?.fullName || "Your Name"}
                    </h1>
                    {p?.location && (
                      <p className="flex items-center gap-1 text-stone-400 text-xs font-['Inter'] mt-1">
                        <MapPin className="w-3 h-3" /> {p.location}
                      </p>
                    )}
                    <div className="flex flex-col gap-1.5 mt-3">
                      {p?.email && (
                        <a href={`mailto:${p.email}`} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-100 text-stone-600 text-xs font-['Inter'] hover:bg-stone-100 transition-colors truncate">
                          <Mail className="w-3 h-3 shrink-0" /><span className="truncate">{p.email}</span>
                        </a>
                      )}
                      {p?.phone && (
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-100 text-stone-600 text-xs font-['Inter']">
                          <Phone className="w-3 h-3 shrink-0" />{p.phone}
                        </span>
                      )}
                      {p?.linkedin && (
                        <a href={`https://${p.linkedin}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-100 text-stone-600 text-xs font-['Inter'] hover:bg-stone-100 transition-colors">
                          <Linkedin className="w-3 h-3 shrink-0" /> LinkedIn
                        </a>
                      )}
                      {p?.github && (
                        <a href={`https://${p.github}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-100 text-stone-600 text-xs font-['Inter'] hover:bg-stone-100 transition-colors">
                          <Github className="w-3 h-3 shrink-0" /> GitHub
                        </a>
                      )}
                      {p?.portfolio && (
                        <a href={`https://${p.portfolio}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-100 text-stone-600 text-xs font-['Inter'] hover:bg-stone-100 transition-colors">
                          <ExternalLink className="w-3 h-3 shrink-0" /> Portfolio
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {(savedData.skills.languages.length > 0 || savedData.skills.technical.length > 0 || savedData.skills.tools.length > 0 || savedData.skills.soft.length > 0) && (
                    <Card icon={Wrench} title="Skills">
                      <div className="space-y-3">
                        {[
                          { label: "Languages",   items: savedData.skills.languages },
                          { label: "Frameworks",  items: savedData.skills.technical },
                          { label: "Tools",       items: savedData.skills.tools },
                          { label: "Soft Skills", items: savedData.skills.soft },
                        ].filter(g => g.items.length > 0).map(group => (
                          <div key={group.label}>
                            <p className="text-[10px] font-semibold font-['Inter'] text-stone-400 uppercase tracking-widest mb-1.5">{group.label}</p>
                            <div className="flex flex-wrap gap-1">{group.items.map((s, i) => <Pill key={i} label={s} />)}</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Education */}
                  {savedData.education.some(e => e.degree || e.institution) && (
                    <Card icon={GraduationCap} title="Education">
                      <div>
                        {savedData.education.filter(e => e.degree || e.institution).map((edu, i, arr) => (
                          <TRow key={i}
                            title={`${edu.degree}${edu.branch ? ` — ${edu.branch}` : ""}`}
                            sub={edu.institution}
                            right={edu.year}
                            rightSub={edu.cgpa ? `CGPA ${edu.cgpa}` : undefined}
                            last={i === arr.length - 1}
                          />
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Certifications */}
                  {savedData.certifications.some(c => c.name) && (
                    <Card icon={Award} title="Certifications">
                      <div className="space-y-3">
                        {savedData.certifications.filter(c => c.name).map((cert, i, arr) => (
                          <div key={i} className={`flex items-start gap-2.5 ${i < arr.length - 1 ? "pb-3 border-b border-stone-100" : ""}`}>
                            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <div>
                              <p className="font-semibold font-['Inter'] text-stone-800 text-xs">{cert.name}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {cert.issuer && <span className="text-[11px] font-['Inter'] text-stone-400 flex items-center gap-1"><Building2 className="w-3 h-3" />{cert.issuer}</span>}
                                {cert.date   && <span className="text-[11px] font-['Inter'] text-stone-400 flex items-center gap-1"><CalendarDays className="w-3 h-3" />{cert.date}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                </div>

                {/* ═══════ RIGHT COLUMN ═══════ */}
                <div className="space-y-3 mt-12">

                  {/* Experience */}
                  {savedData.experience.some(e => e.company || e.role) && (
                    <Card icon={Briefcase} title="Experience">
                      <div>
                        {savedData.experience.filter(e => e.company || e.role).map((ex, i, arr) => (
                          <TRow key={i}
                            title={ex.role}
                            sub={ex.company}
                            right={ex.duration}
                            bullets={ex.description ? ex.description.split("\n").filter(Boolean) : []}
                            last={i === arr.length - 1}
                          />
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Projects */}
                  {savedData.projects.some(p => p.name) && (
                    <Card icon={FolderGit2} title="Projects">
                      <div className="space-y-4">
                        {savedData.projects.filter(p => p.name).map((proj, i, arr) => (
                          <div key={i} className={i < arr.length - 1 ? "pb-4 border-b border-stone-100" : ""}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="font-semibold font-['Inter'] text-stone-800 text-sm">{proj.name}</p>
                              {proj.link && (
                                <a href={proj.link} target="_blank" rel="noreferrer"
                                  className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-700 font-['Inter'] transition-colors shrink-0">
                                  <ExternalLink className="w-3 h-3" /> Link
                                </a>
                              )}
                            </div>
                            {proj.tech && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {proj.tech.split(",").map(t => t.trim()).filter(Boolean).map((t, j) => <Pill key={j} label={t} dark />)}
                              </div>
                            )}
                            {proj.description && (
                              <ul className="space-y-1">
                                {proj.description.split("\n").filter(Boolean).map((line, j) => (
                                  <li key={j} className="flex gap-1.5 text-xs font-['Inter'] text-stone-500 leading-snug">
                                    <span className="text-stone-300 shrink-0 mt-0.5">•</span>{line}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Achievements */}
                  {savedData.achievements.some(Boolean) && (
                    <Card icon={Trophy} title="Achievements">
                      <ul className="space-y-2.5">
                        {savedData.achievements.filter(Boolean).map((ach, i) => (
                          <li key={i} className="flex gap-2.5 items-start">
                            <div className="w-5 h-5 rounded-md bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                              <Trophy className="w-3 h-3 text-stone-500" />
                            </div>
                            <p className="text-xs font-['Inter'] text-stone-600 leading-snug">{ach}</p>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                </div>
              </div>
            </div>

          </motion.div>
        )}
      </SignedIn>
    </div>
  );
}
