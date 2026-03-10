import { useState, useEffect } from 'react';
import { Shield, LogOut, RefreshCw, Eye, EyeOff, Hourglass, BookOpen, XCircle, LayoutList } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminBlogRow } from '@/components/blog/AdminBlogRow';
import { useAdminBlogs } from '@/hooks/useBlogs';
import { isAdminAuthenticated, loginAdmin, logoutAdmin } from '@/lib/admin-auth';
import type { BlogStatus } from '@/lib/blog-utils';

type TabFilter = BlogStatus | 'all';

const TAB_OPTIONS: { key: TabFilter; label: string }[] = [
  { key: 'pending',   label: 'Pending' },
  { key: 'published', label: 'Published' },
  { key: 'rejected',  label: 'Rejected' },
  { key: 'all',       label: 'All' },
];

const STAT_META: Record<string, { icon: React.ReactNode; card: string; text: string; label: string }> = {
  pending:   { icon: <Hourglass className="w-4 h-4" />, card: 'bg-[#fdf8f0] border-[#e8d5b0]', text: 'text-[#8a6a3a]', label: 'Pending' },
  published: { icon: <BookOpen className="w-4 h-4" />,  card: 'bg-[#f4f8f5] border-[#bfd4c8]', text: 'text-[#4a7060]', label: 'Published' },
  rejected:  { icon: <XCircle className="w-4 h-4" />,   card: 'bg-stone-100 border-stone-300',  text: 'text-stone-600', label: 'Rejected' },
};

const EMPTY_META: Record<string, { icon: React.ReactNode; heading: string; sub: string }> = {
  pending:   { icon: <Hourglass className="w-7 h-7 text-stone-400" />, heading: 'All caught up!', sub: 'No posts awaiting review.' },
  published: { icon: <BookOpen className="w-7 h-7 text-stone-400" />,  heading: 'Nothing published yet', sub: 'Approve pending posts to see them here.' },
  rejected:  { icon: <XCircle className="w-7 h-7 text-stone-400" />,   heading: 'No rejected posts', sub: '' },
  all:       { icon: <LayoutList className="w-7 h-7 text-stone-400" />, heading: 'No blogs yet', sub: 'Submitted blogs will appear here.' },
};

// ── Password gate ──────────────────────────────────────────────────────────────
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
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: 'radial-gradient(circle, #c4bdb4 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] blur-[120px] opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(201,164,110,0.15) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-[300px] h-[300px] blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(168,162,158,0.12) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Branding above card */}
        <div className="text-center mb-6">
          <span className="font-['Merriweather'] font-black text-stone-800 text-lg tracking-tight">Harry The Blaze</span>
          <p className="font-['Inter'] text-[11px] text-stone-400 uppercase tracking-widest mt-0.5">Blog Moderation</p>
        </div>

        <div
          className={`border border-stone-200/60 rounded-2xl overflow-hidden shadow-sm transition-transform ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}
          style={{ background: 'white' }}
        >
          {/* Accent top bar */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #8a6a3a, #c9a46e, #8a6a3a)' }} />

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)' }}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>

            <h1 className="font-['Merriweather'] font-black text-stone-900 text-xl text-center mb-1 tracking-tight">
              Admin Access
            </h1>
            <p className="font-['Inter'] text-[13px] text-stone-400 text-center mb-7 font-light">
              Enter the admin password to continue
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold font-['Inter'] text-stone-500 uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter admin password"
                    autoFocus
                    className={`w-full px-4 py-3 pr-11 text-[14px] font-['Inter'] border rounded-xl focus:outline-none bg-stone-50 placeholder:text-stone-300 transition-colors ${
                      error ? 'border-stone-400' : 'border-stone-200 focus:border-stone-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && (
                  <p className="mt-1.5 text-[12px] font-['Inter'] text-stone-600 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={!password}
                className="w-full py-3 rounded-xl font-semibold text-[14px] font-['Inter'] text-white disabled:opacity-40 transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                }}
              >
                Access Admin Panel
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[11px] font-['Inter'] text-stone-400 mt-4 font-light">
          Access is logged and monitored.
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

// ── Counts hook ────────────────────────────────────────────────────────────────
function useAdminCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({ pending: 0, published: 0, rejected: 0 });

  const load = async () => {
    const statuses: BlogStatus[] = ['pending', 'published', 'rejected'];
    const results = await Promise.all(
      statuses.map(s =>
        (supabase as any).from('blogs').select('id', { count: 'exact', head: true }).eq('status', s)
      )
    );
    setCounts({
      pending:   results[0].count ?? 0,
      published: results[1].count ?? 0,
      rejected:  results[2].count ?? 0,
    });
  };

  useEffect(() => { load(); }, []);
  return { counts, reload: load };
}

// ── Main admin panel ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const [tab, setTab] = useState<TabFilter>('pending');
  const [authed, setAuthed] = useState(true);
  const { blogs, loading, refetch, approve, reject, deleteBlog } = useAdminBlogs(tab);
  const { counts, reload: reloadCounts } = useAdminCounts();

  const handleApprove = async (id: string) => {
    await approve(id);
    reloadCounts();
    toast.success('Blog approved and published!');
  };

  const handleReject = async (id: string, reason: string) => {
    await reject(id, reason);
    reloadCounts();
    toast.success('Blog rejected.');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this blog?')) return;
    await deleteBlog(id);
    reloadCounts();
    toast.success('Blog deleted.');
  };

  const handleRefresh = () => {
    refetch();
    reloadCounts();
  };

  const handleLogout = () => {
    logoutAdmin();
    setAuthed(false);
  };

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen relative" style={{ background: '#fcfcf9' }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage: 'radial-gradient(circle, #c4bdb4 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Admin header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/70"
        style={{ background: 'rgba(252,252,249,0.94)', backdropFilter: 'blur(14px)' }}
      >
        <div className="container mx-auto px-6 py-3.5 flex items-center justify-between max-w-5xl">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)' }}
            >
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-['Merriweather'] font-bold text-stone-800 text-[0.95rem]">Blog Admin</span>
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-bold font-['Inter'] uppercase tracking-widest border"
                style={{ background: '#fdf8f0', color: '#8a6a3a', borderColor: '#e8d5b0' }}
              >
                Harry The Blaze
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {counts.pending > 0 && (
              <button
                onClick={() => setTab('pending')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold font-['Inter'] border transition-all"
                style={{ background: '#fdf8f0', color: '#8a6a3a', borderColor: '#e8d5b0' }}
              >
                <Hourglass className="w-3.5 h-3.5" />
                {counts.pending} pending
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg text-[13px] font-['Inter'] font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 pt-24 pb-20 max-w-5xl">

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {(['pending', 'published', 'rejected'] as const).map(key => {
            const s = STAT_META[key];
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 hover:shadow-md active:scale-95 ${s.card} ${
                  tab === key ? 'ring-2 ring-stone-300/70 shadow-sm' : ''
                }`}
              >
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
          {TAB_OPTIONS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-4 py-2.5 text-[13px] font-semibold font-['Inter'] border-b-2 -mb-px transition-all duration-200 ${
                tab === t.key
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {t.label}
              {t.key === 'pending' && counts.pending > 0 && (
                <span
                  className="ml-1.5 px-1.5 py-0.5 text-white text-[10px] font-bold rounded-full"
                  style={{ background: '#8a6a3a' }}
                >
                  {counts.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Blog list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-24 bg-stone-100/80 rounded-xl" />)}
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mb-5 shadow-sm">
              {EMPTY_META[tab].icon}
            </div>
            <h3 className="font-['Merriweather'] font-bold text-stone-700 text-xl mb-2 tracking-tight">
              {EMPTY_META[tab].heading}
            </h3>
            {EMPTY_META[tab].sub && (
              <p className="font-['Inter'] text-stone-400 text-[13px] font-light max-w-xs">
                {EMPTY_META[tab].sub}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {blogs.map(blog => (
              <AdminBlogRow
                key={blog.id}
                blog={blog}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BlogAdmin() {
  const [authed, setAuthed] = useState(isAdminAuthenticated());
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return <AdminDashboard />;
}
