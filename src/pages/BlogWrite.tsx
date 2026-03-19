import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, SignedOut, SignInButton } from '@clerk/clerk-react';
import { Send, X, Plus, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import SEO from '@/components/SEO';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { BlogTypeTag } from '@/components/blog/BlogTypeTag';
import { submitBlog } from '@/hooks/useBlogs';
import { BLOG_TYPES, type BlogType } from '@/lib/blog-utils';

const COVER_EMOJIS = ['📝', '🎯', '🧠', '🏆', '🗣️', '📄', '🌐', '🏢', '💡', '🚀', '⚡', '🎓'];

export default function BlogWrite() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<BlogType>('general');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverEmoji, setCoverEmoji] = useState('📝');
  const [submitting, setSubmitting] = useState(false);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 5) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error('Please add a title');
    if (content.trim().length < 500) return toast.error('Content too short — min 500 characters');
    if (!user) return;

    setSubmitting(true);
    const { error } = await submitBlog({
      title: title.trim(),
      content: content.trim(),
      type,
      tags,
      cover_emoji: coverEmoji,
      author_id: user.id,
      author_name:
        user.fullName ??
        user.username ??
        (user.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`.trim() : null) ??
        user.primaryEmailAddress?.emailAddress?.split('@')[0] ??
        'Community Member',
      author_email: user.primaryEmailAddress?.emailAddress,
    });
    setSubmitting(false);

    if (error) {
      toast.error('Failed to submit: ' + error);
    } else {
      toast.success('Blog submitted! It will be reviewed before publishing.');
      navigate('/blog/my');
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#fcfcf9' }}>
      <SEO
        title="Write a Blog | Harry The Blaze"
        description="Share your campus placement experience with the Harry The Blaze community."
      />
      {/* Background — matches Blog.tsx */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: 'radial-gradient(circle, #c4bdb4 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] blur-[120px] opacity-35"
          style={{ background: 'radial-gradient(ellipse, rgba(201,164,110,0.15) 0%, transparent 70%)' }}
        />
      </div>

      <Header />

      {/* Auth gate */}
      <SignedOut>
        <div className="relative z-10 container mx-auto px-6 pt-32 pb-20 max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center mx-auto mb-5">
            <PenLine className="w-6 h-6 text-stone-500" />
          </div>
          <h2 className="font-['Merriweather'] font-bold text-stone-800 text-2xl mb-2 tracking-tight">Sign in to write</h2>
          <p className="font-['Inter'] text-stone-500 text-[14px] mb-7 font-light leading-relaxed">
            Share your placement experience with the Harry The Blaze community.
          </p>
          <SignInButton mode="modal">
            <button
              className="px-6 py-3 rounded-xl text-[14px] font-semibold font-['Inter'] text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)' }}
            >
              Sign In to Continue
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <main className="relative z-10 container mx-auto px-6 pt-24 pb-24 max-w-3xl">
        {/* Page header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white border border-stone-100 text-[10px] uppercase tracking-widest font-bold text-stone-400 font-['Inter'] mb-4">
            <PenLine className="w-2.5 h-2.5" />
            New Post
          </div>
          <h1 className="font-['Merriweather'] font-black text-stone-900 text-2xl md:text-3xl tracking-tight mb-1.5 leading-tight">
            Write a blog
          </h1>
          <p className="font-['Inter'] text-[14px] text-stone-500 font-light leading-relaxed">
            Your post will be reviewed by our team before going live. Usually within 24 hours.
          </p>
        </div>

        <div className="space-y-7">

          {/* ── Cover emoji ── */}
          <div>
            <label className="block text-[11px] font-semibold font-['Inter'] text-stone-500 uppercase tracking-widest mb-3">
              Cover Emoji
            </label>
            <div className="flex gap-2 flex-wrap">
              {COVER_EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setCoverEmoji(e)}
                  className={`text-2xl w-11 h-11 rounded-xl border transition-all duration-200 active:scale-95 ${
                    coverEmoji === e
                      ? 'border-stone-400 bg-stone-100 shadow-sm scale-110'
                      : 'border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* ── Title ── */}
          <div>
            <label className="block text-[11px] font-semibold font-['Inter'] text-stone-500 uppercase tracking-widest mb-2">
              Title <span className="text-stone-400 font-normal normal-case">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g. How I cracked Accenture in 3 weeks"
              className="w-full px-4 py-3 font-['Inter'] text-[15px] text-stone-800 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 bg-white placeholder:text-stone-300 transition-colors shadow-sm"
            />
            <div className="flex justify-end mt-1.5">
              <span className="text-[10px] font-['Inter'] text-stone-400">{title.length}/120</span>
            </div>
          </div>

          {/* ── Blog type ── */}
          <div>
            <label className="block text-[11px] font-semibold font-['Inter'] text-stone-500 uppercase tracking-widest mb-3">
              Blog Type <span className="text-stone-400 font-normal normal-case">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(BLOG_TYPES) as BlogType[]).map(t => {
                const meta = BLOG_TYPES[t];
                const isActive = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'border-stone-400 bg-stone-100 shadow-sm'
                        : 'border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{meta.emoji}</span>
                    <span className="text-[11px] font-semibold font-['Inter'] text-stone-700 leading-tight">{meta.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] font-['Inter'] text-stone-400 font-light">
              {BLOG_TYPES[type].description}
            </p>
          </div>

          {/* ── Tags ── */}
          <div>
            <label className="block text-[11px] font-semibold font-['Inter'] text-stone-500 uppercase tracking-widest mb-2">
              Tags <span className="text-stone-400 font-normal normal-case">(up to 5)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="e.g. accenture, aptitude, coding"
                className="flex-1 px-3.5 py-2.5 text-[13px] font-['Inter'] border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 bg-white placeholder:text-stone-300 shadow-sm transition-colors"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                className="p-2.5 border border-stone-200 rounded-xl bg-white text-stone-500 hover:bg-stone-50 disabled:opacity-40 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-full text-[12px] font-['Inter'] text-stone-600">
                    #{t}
                    <button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="text-stone-400 hover:text-stone-700 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Content ── */}
          <div>
            <label className="block text-[11px] font-semibold font-['Inter'] text-stone-500 uppercase tracking-widest mb-2">
              Content <span className="text-stone-400 font-normal normal-case">* — Markdown supported</span>
            </label>
            <BlogEditor value={content} onChange={setContent} />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] font-['Inter'] text-stone-400">
                {content.trim().length < 500
                  ? `${500 - content.trim().length} more characters needed`
                  : `${content.trim().length} characters`}
              </span>
              <span className="text-[10px] font-['Inter'] text-stone-400">
                ~{Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min read
              </span>
            </div>
          </div>

          {/* ── Card preview ── */}
          <div
            className="p-4 rounded-xl border border-stone-200/60 flex items-start gap-3 shadow-sm"
            style={{ background: '#f2efe9' }}
          >
            <span className="text-xl flex-shrink-0">{coverEmoji}</span>
            <div className="flex-1 min-w-0">
              <div className="mb-1.5">
                <BlogTypeTag type={type} size="sm" />
              </div>
              <p className="font-['Merriweather'] font-bold text-stone-800 text-[0.88rem] leading-snug line-clamp-2">
                {title || 'Your blog title will appear here'}
              </p>
              <p className="font-['Inter'] text-[11px] text-stone-400 mt-1 font-light">
                by {user?.fullName ?? 'You'}
              </p>
            </div>
          </div>

          {/* ── Submit row ── */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || content.trim().length < 500}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[14px] font-['Inter'] text-white transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              }}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit for Review
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/blog')}
              className="px-5 py-3 rounded-xl text-[14px] font-['Inter'] font-medium text-stone-500 border border-stone-200 bg-white hover:bg-stone-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
