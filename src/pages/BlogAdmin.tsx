import { useState, useEffect } from 'react';
import {
  Shield, LogOut, RefreshCw, Eye, EyeOff, Hourglass, BookOpen,
  XCircle, LayoutList, Users, Check, Trash2, ExternalLink, UserCheck, UserX,
  Briefcase, Plus, X, MapPin, Package, Link, ToggleLeft, ToggleRight,
  Sparkles, ClipboardPaste, PenLine, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminBlogRow } from '@/components/blog/AdminBlogRow';
import { useAdminBlogs } from '@/hooks/useBlogs';
import { isAdminAuthenticated, loginAdmin, logoutAdmin } from '@/lib/admin-auth';
import type { BlogStatus } from '@/lib/blog-utils';

type BlogTabFilter = BlogStatus | 'all';
type MainTab = 'blog' | 'experts' | 'jobs';

/* ── Job type ── */
type Job = {
  id: string; title: string; company: string | null; type: string;
  location: string | null; skills_required: string[]; description: string | null;
  apply_url: string | null; package_lpa: number | null; active: boolean; created_at: string;
};

const BLOG_TABS: { key: BlogTabFilter; label: string }[] = [
  { key: 'pending',   label: 'Pending' },
  { key: 'published', label: 'Published' },
  { key: 'rejected',  label: 'Rejected' },
  { key: 'all',       label: 'All' },
];

const BLOG_STAT_META: Record<string, { icon: React.ReactNode; card: string; text: string; label: string }> = {
  pending:   { icon: <Hourglass className="w-4 h-4" />, card: 'bg-[#fdf8f0] border-[#e8d5b0]', text: 'text-[#8a6a3a]', label: 'Pending' },
  published: { icon: <BookOpen className="w-4 h-4" />,  card: 'bg-[#f4f8f5] border-[#bfd4c8]', text: 'text-[#4a7060]', label: 'Published' },
  rejected:  { icon: <XCircle className="w-4 h-4" />,   card: 'bg-stone-100 border-stone-300',  text: 'text-stone-600', label: 'Rejected' },
};

const BLOG_EMPTY_META: Record<string, { icon: React.ReactNode; heading: string; sub: string }> = {
  pending:   { icon: <Hourglass className="w-7 h-7 text-stone-400" />, heading: 'All caught up!', sub: 'No posts awaiting review.' },
  published: { icon: <BookOpen className="w-7 h-7 text-stone-400" />,  heading: 'Nothing published yet', sub: 'Approve pending posts to see them here.' },
  rejected:  { icon: <XCircle className="w-7 h-7 text-stone-400" />,   heading: 'No rejected posts', sub: '' },
  all:       { icon: <LayoutList className="w-7 h-7 text-stone-400" />, heading: 'No blogs yet', sub: 'Submitted blogs will appear here.' },
};

/* ─────────────────── Password gate ─────────────────── */
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      onLogin();
    } else {
      setError('Incorrect password. Try again.');
      setPassword('');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6" style={{ background: '#fcfcf9' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.25]"
          style={{ backgroundImage: 'radial-gradient(circle, #c4bdb4 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] blur-[120px] opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(201,164,110,0.15) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="font-['Merriweather'] font-black text-stone-800 text-lg tracking-tight">Harry The Blaze</span>
          <p className="font-['Inter'] text-[11px] text-stone-400 uppercase tracking-widest mt-0.5">Admin Panel</p>
        </div>

        <div className={`border border-stone-200/60 rounded-2xl overflow-hidden shadow-sm transition-transform ${shake ? 'animate-[shake_0.4s_ease]' : ''}`} style={{ background: 'white' }}>
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #8a6a3a, #c9a46e, #8a6a3a)' }} />
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)' }}>
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="font-['Merriweather'] font-black text-stone-900 text-xl text-center mb-1 tracking-tight">Admin Access</h1>
            <p className="font-['Inter'] text-[13px] text-stone-400 text-center mb-7 font-light">Enter the admin password to continue</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold font-['Inter'] text-stone-500 uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter admin password"
                    autoFocus
                    className={`w-full px-4 py-3 pr-11 text-[14px] font-['Inter'] border rounded-xl focus:outline-none bg-stone-50 placeholder:text-stone-300 transition-colors ${error ? 'border-stone-400' : 'border-stone-200 focus:border-stone-400'}`}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors" tabIndex={-1}>
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && (
                  <p className="mt-1.5 text-[12px] font-['Inter'] text-stone-600 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />{error}
                  </p>
                )}
              </div>
              <button type="submit" disabled={!password}
                className="w-full py-3 rounded-xl font-semibold text-[14px] font-['Inter'] text-white disabled:opacity-40 transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
                Access Admin Panel
              </button>
            </form>
          </div>
        </div>
        <p className="text-center text-[11px] font-['Inter'] text-stone-400 mt-4 font-light">Access is logged and monitored.</p>
      </div>

      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }`}</style>
    </div>
  );
}

/* ─────────────────── Blog counts hook ─────────────────── */
function useBlogCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({ pending: 0, published: 0, rejected: 0 });
  const load = async () => {
    try {
      const statuses: BlogStatus[] = ['pending', 'published', 'rejected'];
      const results = await Promise.all(statuses.map(s =>
        (supabase as any).from('blogs').select('id', { count: 'exact', head: true }).eq('status', s)
      ));
      if (results.some((r: any) => r.error)) return;
      setCounts({ pending: results[0].count ?? 0, published: results[1].count ?? 0, rejected: results[2].count ?? 0 });
    } catch {}
  };
  useEffect(() => { load(); }, []);
  return { counts, reload: load };
}

/* ─────────────────── Experts hook ─────────────────── */
type ExpertRow = {
  id: string; name: string; title: string | null; company: string | null;
  package_lpa: number | null; photo_url: string | null; proof_url: string | null;
  skills: string[] | null; approved: boolean; created_at: string;
};

function useExperts(filter: 'pending' | 'approved') {
  const [experts, setExperts] = useState<ExpertRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('experts')
      .select('id, name, title, company, package_lpa, photo_url, proof_url, skills, approved, created_at')
      .eq('approved', filter === 'approved')
      .order('created_at', { ascending: false });
    setExperts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);
  return { experts, loading, reload: load };
}

/* ─────────────────── Expert card ─────────────────── */
function ExpertCard({ expert, onApprove, onReject }: {
  expert: ExpertRow;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const initials = expert.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4">
      {/* Photo / avatar */}
      <div className="shrink-0">
        {expert.photo_url ? (
          <img src={expert.photo_url} alt={expert.name} className="w-16 h-16 rounded-xl object-cover border border-stone-100" />
        ) : (
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-['Merriweather'] font-bold text-lg"
            style={{ background: 'linear-gradient(135deg,#292524,#57534e)' }}>
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold font-['Inter'] text-stone-900 text-sm">{expert.name}</p>
            <p className="text-stone-500 text-xs font-['Inter'] mt-0.5">{expert.title}{expert.company ? ` · ${expert.company}` : ''}</p>
            {expert.package_lpa && (
              <p className="text-xs font-['Inter'] text-stone-400 mt-0.5">Package: <span className="font-semibold text-stone-600">{expert.package_lpa} LPA</span></p>
            )}
          </div>
          <p className="text-[11px] text-stone-400 font-['Inter'] shrink-0">{new Date(expert.created_at).toLocaleDateString()}</p>
        </div>

        {/* Skills */}
        {expert.skills && expert.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {expert.skills.slice(0, 6).map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-['Inter']">{s}</span>
            ))}
            {expert.skills.length > 6 && <span className="text-[11px] text-stone-400 font-['Inter']">+{expert.skills.length - 6} more</span>}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          {expert.proof_url && (
            <a href={expert.proof_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-xs font-['Inter'] font-medium hover:bg-stone-50 transition-all">
              <ExternalLink className="w-3.5 h-3.5" /> View Proof
            </a>
          )}
          {!expert.approved && (
            <>
              <button onClick={() => onApprove(expert.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-['Inter'] font-semibold hover:bg-emerald-700 active:scale-95 transition-all">
                <UserCheck className="w-3.5 h-3.5" /> Approve
              </button>
              <button onClick={() => onReject(expert.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-['Inter'] font-semibold hover:bg-red-100 active:scale-95 transition-all">
                <UserX className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}
          {expert.approved && (
            <button onClick={() => onReject(expert.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-['Inter'] font-semibold hover:bg-red-100 active:scale-95 transition-all">
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Experts section ─────────────────── */
function ExpertsSection() {
  const [expertTab, setExpertTab] = useState<'pending' | 'approved'>('pending');
  const { experts, loading, reload } = useExperts(expertTab);

  const handleApprove = async (id: string) => {
    const { error } = await (supabase as any).from('experts').update({ approved: true }).eq('id', id);
    if (error) { toast.error('Failed to approve.'); return; }
    toast.success('Expert approved — they are now visible on /connect');
    reload();
  };

  const handleReject = async (id: string) => {
    const { error } = await (supabase as any).from('experts').delete().eq('id', id);
    if (error) { toast.error('Failed to reject.'); return; }
    toast.success('Expert removed.');
    reload();
  };

  const pendingCount = expertTab === 'pending' ? experts.length : null;

  return (
    <div>
      {/* Expert sub-tabs */}
      <div className="flex items-center gap-0.5 mb-6 border-b border-stone-200">
        {([{ key: 'pending', label: 'Pending Approval' }, { key: 'approved', label: 'Approved' }] as const).map(t => (
          <button key={t.key} onClick={() => setExpertTab(t.key)}
            className={`relative px-4 py-2.5 text-[13px] font-semibold font-['Inter'] border-b-2 -mb-px transition-all duration-200 ${
              expertTab === t.key ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse h-28 bg-stone-100/80 rounded-xl" />)}</div>
      ) : experts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mb-5 shadow-sm">
            <Users className="w-7 h-7 text-stone-400" />
          </div>
          <h3 className="font-['Merriweather'] font-bold text-stone-700 text-xl mb-2">
            {expertTab === 'pending' ? 'No pending experts' : 'No approved experts'}
          </h3>
          <p className="font-['Inter'] text-stone-400 text-[13px] font-light">
            {expertTab === 'pending' ? 'All expert submissions have been reviewed.' : 'Approve pending experts to see them here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {experts.map(expert => (
            <ExpertCard key={expert.id} expert={expert} onApprove={handleApprove} onReject={handleReject} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────── Blog section ─────────────────── */
function BlogSection() {
  const [tab, setTab] = useState<BlogTabFilter>('pending');
  const { blogs, loading, refetch, approve, reject, deleteBlog } = useAdminBlogs(tab);
  const { counts, reload: reloadCounts } = useBlogCounts();

  const handleApprove = async (id: string) => {
    try { await approve(id); reloadCounts(); toast.success('Blog approved and published!'); }
    catch { toast.error('Failed to approve blog.'); }
  };
  const handleReject = async (id: string, reason: string) => {
    try { await reject(id, reason); reloadCounts(); toast.success('Blog rejected.'); }
    catch { toast.error('Failed to reject blog.'); }
  };
  const handleDelete = async (id: string) => {
    try { await deleteBlog(id); reloadCounts(); toast.success('Blog deleted.'); }
    catch { toast.error('Failed to delete blog.'); }
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {(['pending', 'published', 'rejected'] as const).map(key => {
          const s = BLOG_STAT_META[key];
          return (
            <button key={key} onClick={() => setTab(key)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 hover:shadow-md active:scale-95 ${s.card} ${tab === key ? 'ring-2 ring-stone-300/70 shadow-sm' : ''}`}>
              <div className={`flex items-center gap-1.5 mb-2 ${s.text}`}>
                {s.icon}
                <p className="text-[11px] font-semibold font-['Inter'] uppercase tracking-widest">{s.label}</p>
              </div>
              <p className={`text-3xl font-black font-['Inter'] ${s.text}`}>{counts[key]}</p>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 mb-6 border-b border-stone-200">
        {BLOG_TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`relative px-4 py-2.5 text-[13px] font-semibold font-['Inter'] border-b-2 -mb-px transition-all duration-200 ${
              tab === t.key ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}>
            {t.label}
            {t.key === 'pending' && counts.pending > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-white text-[10px] font-bold rounded-full" style={{ background: '#8a6a3a' }}>
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse h-24 bg-stone-100/80 rounded-xl" />)}</div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mb-5 shadow-sm">
            {BLOG_EMPTY_META[tab].icon}
          </div>
          <h3 className="font-['Merriweather'] font-bold text-stone-700 text-xl mb-2">{BLOG_EMPTY_META[tab].heading}</h3>
          {BLOG_EMPTY_META[tab].sub && <p className="font-['Inter'] text-stone-400 text-[13px] font-light max-w-xs">{BLOG_EMPTY_META[tab].sub}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map(blog => (
            <AdminBlogRow key={blog.id} blog={blog} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────── AI job parser ─────────────────── */
async function parseJobWithAI(raw: string): Promise<{
  title: string; company: string; type: string; location: string;
  description: string; apply_url: string; package_lpa: string; skills_required: string[];
}> {
  const { data, error } = await (supabase as any).functions.invoke('parse-job', { body: { raw } });
  if (error) throw new Error(error.message ?? 'Edge function error');
  if (data?.error) throw new Error(data.error);
  return data;
}

/* ─────────────────── Jobs section ─────────────────── */
const EMPTY_SKILLS_INPUT = '';

function JobsSection() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState(EMPTY_SKILLS_INPUT);
  const [entryMode, setEntryMode] = useState<'ai' | 'manual'>('ai');
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);

  const [form, setForm] = useState({
    title: '', company: '', type: 'Full-time', location: '',
    description: '', apply_url: '', package_lpa: '', skills_required: [] as string[],
  });

  const loadJobs = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('jobs').select('*').order('created_at', { ascending: false });
    setJobs(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadJobs(); }, []);

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !form.skills_required.includes(v)) {
      setForm(f => ({ ...f, skills_required: [...f.skills_required, v] }));
    }
    setSkillInput('');
  };

  const handleParse = async () => {
    if (!rawText.trim()) { toast.error('Paste some job details first.'); return; }
    setParsing(true);
    try {
      const parsed = await parseJobWithAI(rawText);
      setForm({
        title: parsed.title ?? '',
        company: parsed.company ?? '',
        type: ['Internship', 'Full-time', 'Part-time'].includes(parsed.type) ? parsed.type : 'Full-time',
        location: parsed.location ?? '',
        description: parsed.description ?? '',
        apply_url: parsed.apply_url ?? '',
        package_lpa: parsed.package_lpa ?? '',
        skills_required: parsed.skills_required ?? [],
      });
      setEntryMode('manual');
      toast.success('Fields filled! Review and post.');
    } catch (e: any) {
      toast.error(e.message ?? 'Parsing failed.');
    } finally {
      setParsing(false);
    }
  };

  const resetForm = () => {
    setForm({ title: '', company: '', type: 'Full-time', location: '', description: '', apply_url: '', package_lpa: '', skills_required: [] });
    setSkillInput('');
    setRawText('');
    setEntryMode('ai');
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      company: form.company.trim() || null,
      type: form.type,
      location: form.location.trim() || null,
      description: form.description.trim() || null,
      apply_url: form.apply_url.trim() || null,
      package_lpa: form.package_lpa ? parseFloat(form.package_lpa) : null,
      skills_required: form.skills_required,
      active: true,
    };
    const { error } = await (supabase as any).from('jobs').insert(payload);
    setSaving(false);
    if (error) { toast.error('Failed to save job.'); return; }
    toast.success('Job posted!');
    resetForm();
    loadJobs();
  };

  const toggleActive = async (job: Job) => {
    await (supabase as any).from('jobs').update({ active: !job.active }).eq('id', job.id);
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, active: !j.active } : j));
  };

  const deleteJob = async (id: string) => {
    await (supabase as any).from('jobs').delete().eq('id', id);
    toast.success('Job removed.');
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold font-['Inter'] text-stone-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );

  const inputCls = "px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-['Inter'] placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all";

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-['Merriweather'] font-bold text-stone-800">Job Listings</p>
          <p className="text-xs font-['Inter'] text-stone-400 mt-0.5">{jobs.filter(j => j.active).length} active · {jobs.length} total</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Add Job
        </button>
      </div>

      {/* Add Job form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-6 space-y-4">
          {/* Header + close */}
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold font-['Inter'] text-stone-800 text-sm">New Job / Internship</p>
            <button onClick={resetForm} className="text-stone-400 hover:text-stone-600 transition-colors"><X className="w-4 h-4" /></button>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl w-fit">
            <button
              onClick={() => setEntryMode('ai')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-['Inter'] transition-all ${
                entryMode === 'ai' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'
              }`}>
              <Sparkles className="w-3.5 h-3.5" /> Paste & Parse
            </button>
            <button
              onClick={() => setEntryMode('manual')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-['Inter'] transition-all ${
                entryMode === 'manual' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'
              }`}>
              <PenLine className="w-3.5 h-3.5" /> Manual Entry
            </button>
          </div>

          {/* AI paste panel */}
          {entryMode === 'ai' && (
            <div className="space-y-3">
              <p className="text-xs font-['Inter'] text-stone-400">Paste the full job description, LinkedIn post, or any raw text — AI will extract the fields.</p>
              <textarea
                rows={7}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste job details here…&#10;&#10;e.g. Software Engineer Intern at Google&#10;Location: Bangalore | Package: 18 LPA&#10;Skills: React, TypeScript, Node.js&#10;Apply: https://careers.google.com/…"
                className={`${inputCls} resize-none w-full`}
              />
              <div className="flex justify-end gap-2">
                <button onClick={resetForm} className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm font-['Inter'] font-medium hover:bg-stone-50 transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleParse}
                  disabled={parsing || !rawText.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all disabled:opacity-50">
                  {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {parsing ? 'Parsing…' : 'Parse with AI'}
                </button>
              </div>
            </div>
          )}

          {/* Manual fields */}
          {entryMode === 'manual' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Title *">
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Software Engineer Intern" className={inputCls} />
                </Field>
                <Field label="Company">
                  <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Google, Zepto, Startup…" className={inputCls} />
                </Field>
                <Field label="Type">
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className={inputCls}>
                    <option>Internship</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                  </select>
                </Field>
                <Field label="Location">
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Bangalore / Remote" className={inputCls} />
                </Field>
                <Field label="Package (LPA)">
                  <input type="number" value={form.package_lpa} onChange={e => setForm(f => ({ ...f, package_lpa: e.target.value }))}
                    placeholder="6" className={inputCls} />
                </Field>
                <Field label="Apply URL">
                  <input value={form.apply_url} onChange={e => setForm(f => ({ ...f, apply_url: e.target.value }))}
                    placeholder="https://…" className={inputCls} />
                </Field>
              </div>

              <Field label="Description">
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What the role involves…" className={`${inputCls} resize-none`} />
              </Field>

              <Field label="Skills Required">
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-stone-50 border border-stone-200 rounded-xl min-h-[44px]">
                  {form.skills_required.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-800 text-white rounded-lg text-xs font-['Inter']">
                      {s}
                      <button onClick={() => setForm(f => ({ ...f, skills_required: f.skills_required.filter((_, j) => j !== i) }))}
                        className="hover:text-stone-300 leading-none">×</button>
                    </span>
                  ))}
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); } }}
                    placeholder="Type skill + Enter"
                    className="flex-1 min-w-[120px] bg-transparent text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none font-['Inter']" />
                </div>
              </Field>

              <div className="flex justify-between gap-2 pt-1">
                <button
                  onClick={() => setEntryMode('ai')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 text-stone-500 text-sm font-['Inter'] hover:bg-stone-50 transition-all">
                  <ClipboardPaste className="w-3.5 h-3.5" /> Re-parse
                </button>
                <div className="flex gap-2">
                  <button onClick={resetForm} className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm font-['Inter'] font-medium hover:bg-stone-50 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="px-5 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold font-['Inter'] hover:bg-stone-700 active:scale-95 transition-all disabled:opacity-50">
                    {saving ? 'Saving…' : 'Post Job'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Jobs list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse h-24 bg-stone-100/80 rounded-xl" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mb-4 shadow-sm">
            <Briefcase className="w-7 h-7 text-stone-400" />
          </div>
          <p className="font-['Merriweather'] font-bold text-stone-700 text-xl mb-1">No jobs posted yet</p>
          <p className="font-['Inter'] text-stone-400 text-sm">Add your first job listing above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-opacity ${job.active ? 'border-stone-100' : 'border-stone-100 opacity-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold font-['Inter'] text-stone-900 text-sm">{job.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold font-['Inter'] border ${
                      job.type === 'Internship' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>{job.type}</span>
                    {!job.active && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold font-['Inter'] bg-stone-100 text-stone-500">Inactive</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {job.company   && <span className="text-xs font-['Inter'] text-stone-500">{job.company}</span>}
                    {job.location  && <span className="flex items-center gap-1 text-xs font-['Inter'] text-stone-400"><MapPin className="w-3 h-3" />{job.location}</span>}
                    {job.package_lpa && <span className="flex items-center gap-1 text-xs font-['Inter'] text-stone-400"><Package className="w-3 h-3" />{job.package_lpa} LPA</span>}
                  </div>
                  {job.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.skills_required.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-['Inter']">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {job.apply_url && (
                    <a href={job.apply_url} target="_blank" rel="noreferrer"
                      className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-all" title="Open apply URL">
                      <Link className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button onClick={() => toggleActive(job)} title={job.active ? 'Deactivate' : 'Activate'}
                    className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-all">
                    {job.active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteJob(job.id)} title="Delete"
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────── Main admin dashboard ─────────────────── */
function AdminDashboard() {
  const [authed, setAuthed] = useState(true);
  const [mainTab, setMainTab] = useState<MainTab>('blog');

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen relative" style={{ background: '#fcfcf9' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.22]"
          style={{ backgroundImage: 'radial-gradient(circle, #c4bdb4 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/70"
        style={{ background: 'rgba(252,252,249,0.94)', backdropFilter: 'blur(14px)' }}>
        <div className="container mx-auto px-6 py-3.5 flex items-center justify-between max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)' }}>
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-['Merriweather'] font-bold text-stone-800 text-[0.95rem]">Admin</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-['Inter'] uppercase tracking-widest border"
                style={{ background: '#fdf8f0', color: '#8a6a3a', borderColor: '#e8d5b0' }}>
                Harry The Blaze
              </span>
            </div>
          </div>

          {/* Main tabs in header */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
            <button onClick={() => setMainTab('blog')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold font-['Inter'] transition-all ${mainTab === 'blog' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
              <BookOpen className="w-3.5 h-3.5" /> Blog
            </button>
            <button onClick={() => setMainTab('experts')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold font-['Inter'] transition-all ${mainTab === 'experts' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
              <Users className="w-3.5 h-3.5" /> Experts
            </button>
            <button onClick={() => setMainTab('jobs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold font-['Inter'] transition-all ${mainTab === 'jobs' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
              <Briefcase className="w-3.5 h-3.5" /> Jobs
            </button>
          </div>

          <button onClick={() => { logoutAdmin(); setAuthed(false); }}
            className="flex items-center gap-1.5 px-3 py-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg text-[13px] font-['Inter'] font-medium transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 pt-24 pb-20 max-w-5xl">
        {mainTab === 'blog'    && <BlogSection />}
        {mainTab === 'experts' && <ExpertsSection />}
        {mainTab === 'jobs'    && <JobsSection />}
      </main>
    </div>
  );
}

/* ─────────────────── Entry ─────────────────── */
export default function BlogAdmin() {
  const [authed, setAuthed] = useState(isAdminAuthenticated());
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return <AdminDashboard />;
}
