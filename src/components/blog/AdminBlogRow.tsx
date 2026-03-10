import { useState } from 'react';
import { Check, X, Trash2, ChevronDown, ChevronUp, Clock, Eye, ArrowLeft, Calendar, Share2 } from 'lucide-react';
import type { Blog } from '@/lib/blog-utils';
import { formatDate, displayAuthor } from '@/lib/blog-utils';
import { BlogTypeTag } from './BlogTypeTag';

interface AdminBlogRowProps {
  blog: Blog;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_PILL: Record<string, string> = {
  pending:   'bg-[#fdf8f0] text-[#8a6a3a] border-[#e8d5b0]',
  published: 'bg-[#f4f8f5] text-[#4a7060] border-[#bfd4c8]',
  rejected:  'bg-stone-100 text-stone-600 border-stone-300',
};

function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^#{3}\s(.+)/gm, '<h3 style="font-family:Merriweather,serif;font-weight:700;font-size:1.2rem;color:#1c1c1b;margin-top:2.25rem;margin-bottom:0.5rem;line-height:1.4">$1</h3>')
    .replace(/^#{2}\s(.+)/gm, '<h2 style="font-family:Merriweather,serif;font-weight:700;font-size:1.45rem;color:#1c1c1b;margin-top:2.75rem;margin-bottom:0.75rem;line-height:1.3">$1</h2>')
    .replace(/^#{1}\s(.+)/gm, '<h1 style="font-family:Merriweather,serif;font-weight:900;font-size:1.75rem;color:#1c1c1b;margin-bottom:1.25rem;line-height:1.2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:#1c1c1b">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="font-style:italic;color:#57534e">$1</em>')
    .replace(/`([^`]+)`/g, '<code style="padding:2px 7px;border-radius:5px;background:#f2efe9;color:#44403c;font-size:13px;font-family:monospace;border:1px solid #e7e5e0">$1</code>')
    .replace(/^>\s(.+)/gm, '<blockquote style="padding:0.75rem 1rem;border-left:3px solid #c4bdb4;color:#78716c;font-style:italic;margin:1.25rem 0;background:#faf9f7;border-radius:0 8px 8px 0">$1</blockquote>')
    .replace(/^[-*]\s(.+)/gm, '<li style="margin-left:1.5rem;list-style-type:disc;color:#57534e;margin-top:5px;line-height:1.75">$1</li>')
    .replace(/^\d+\.\s(.+)/gm, '<li style="margin-left:1.5rem;list-style-type:decimal;color:#57534e;margin-top:5px;line-height:1.75">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#557d6b;text-decoration:underline;text-underline-offset:3px;font-weight:500" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, '</p><p style="margin-top:1.25rem;color:#57534e;line-height:1.85;font-family:Inter,sans-serif;font-size:15.5px">')
    .replace(/\n/g, '<br/>');
}

// ── Full preview drawer ────────────────────────────────────────────────────────
function BlogPreviewDrawer({ blog, onClose }: { blog: Blog; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-2xl shadow-2xl overflow-y-auto"
        style={{ background: '#fcfcf9' }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.2]"
            style={{
              backgroundImage: 'radial-gradient(circle, #c4bdb4 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        {/* Drawer header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 border-b border-stone-200/70"
          style={{ background: 'rgba(252,252,249,0.94)', backdropFilter: 'blur(14px)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold font-['Inter'] uppercase tracking-widest border"
              style={{ background: '#fdf8f0', color: '#8a6a3a', borderColor: '#e8d5b0' }}
            >
              Admin Preview
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold font-['Inter'] uppercase tracking-widest ${STATUS_PILL[blog.status]}`}>
              {blog.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-[13px] font-['Inter'] text-stone-400 hover:text-stone-700 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to admin
          </button>
        </div>

        {/* Content — mirrors BlogPost.tsx layout */}
        <div className="relative z-10 px-8 pt-8 pb-16 max-w-xl mx-auto">

          {/* Type + tags */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            <BlogTypeTag type={blog.type} />
            {blog.tags?.map(t => (
              <span
                key={t}
                className="px-2.5 py-0.5 bg-white border border-stone-200 rounded-full text-[10px] font-medium font-['Inter'] text-stone-500"
              >
                #{t}
              </span>
            ))}
          </div>

          {/* Emoji */}
          <span className="text-5xl block mb-5 select-none">{blog.cover_emoji}</span>

          {/* Title */}
          <h1
            className="font-['Merriweather'] font-black text-stone-900 leading-[1.12] tracking-tight mb-6"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}
          >
            {blog.title}
          </h1>

          {/* Meta row */}
          <div
            className="flex items-center gap-3 flex-wrap py-3.5 mb-8"
            style={{ borderTop: '1px solid #e7e5e0', borderBottom: '1px solid #e7e5e0' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white font-['Inter'] flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #8a6a3a, #c9a46e)' }}
              >
                {displayAuthor(blog.author_name).charAt(0).toUpperCase()}
              </div>
              <span className="font-['Inter'] text-[13px] font-semibold text-stone-700">{displayAuthor(blog.author_name)}</span>
            </div>
            <span className="text-stone-300">·</span>
            <span className="flex items-center gap-1 text-[12px] font-['Inter'] text-stone-400">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              {formatDate(blog.created_at)}
            </span>
            <span className="flex items-center gap-1 text-[12px] font-['Inter'] text-stone-400">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              {blog.read_time} min read
            </span>
            <span className="flex items-center gap-1 text-[12px] font-['Inter'] text-stone-400">
              <Eye className="w-3.5 h-3.5 flex-shrink-0" />
              {blog.views} views
            </span>
            <span className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-[12px] font-['Inter'] text-stone-400 cursor-default">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </span>
          </div>

          {/* Excerpt */}
          {blog.excerpt && (
            <p
              className="font-['Inter'] text-[15px] text-stone-600 leading-relaxed mb-8 pl-4 font-light italic"
              style={{ borderLeft: '3px solid #c4bdb4' }}
            >
              {blog.excerpt}
            </p>
          )}

          {/* Rendered content */}
          <div
            style={{ fontFamily: 'Inter, sans-serif' }}
            dangerouslySetInnerHTML={{
              __html: `<p style="color:#57534e;line-height:1.85;font-family:Inter,sans-serif;font-size:15.5px">${renderMarkdown(blog.content)}</p>`,
            }}
          />

          {/* Author card */}
          <div
            className="mt-14 p-5 rounded-xl border border-stone-200/60 flex items-center gap-4 shadow-sm"
            style={{ background: '#f2efe9' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0 font-['Inter'] shadow-sm"
              style={{ background: 'linear-gradient(135deg, #8a6a3a, #c9a46e)' }}
            >
              {displayAuthor(blog.author_name).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-['Merriweather'] font-bold text-stone-800 text-[0.95rem]">{displayAuthor(blog.author_name)}</p>
              <p className="font-['Inter'] text-[12px] text-stone-500 mt-0.5 font-light">
                {blog.author_email ?? 'Contributed to Harry The Blaze community'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Admin row ──────────────────────────────────────────────────────────────────
export function AdminBlogRow({ blog, onApprove, onReject, onDelete }: AdminBlogRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');
  const [previewing, setPreviewing] = useState(false);

  const handleReject = () => {
    if (!reason.trim()) return;
    onReject(blog.id, reason.trim());
    setRejectMode(false);
    setReason('');
  };

  return (
    <>
      {previewing && (
        <BlogPreviewDrawer blog={blog} onClose={() => setPreviewing(false)} />
      )}

      <div className="bg-card border border-stone-200/60 rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:border-stone-300">
        {/* Row header */}
        <div className="flex items-start gap-4 p-4">
          <span className="text-2xl mt-0.5 flex-shrink-0 select-none">{blog.cover_emoji}</span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h3 className="font-['Merriweather'] font-bold text-stone-800 text-[0.93rem] leading-snug">
                {blog.title}
              </h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold font-['Inter'] uppercase tracking-widest ${STATUS_PILL[blog.status]}`}>
                {blog.status}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <BlogTypeTag type={blog.type} size="sm" />
              <span className="text-[11px] font-['Inter'] text-stone-400">by {displayAuthor(blog.author_name)}</span>
              <span className="flex items-center gap-1 text-[11px] font-['Inter'] text-stone-400">
                <Clock className="w-3 h-3 flex-shrink-0" />
                {formatDate(blog.created_at)}
              </span>
              <span className="text-[11px] font-['Inter'] text-stone-400">{blog.read_time}m read</span>
            </div>

            {blog.reject_reason && (
              <p className="mt-2 text-[11px] font-['Inter'] text-stone-600 bg-stone-100 px-2.5 py-1.5 rounded-lg border border-stone-200">
                Reason: {blog.reject_reason}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {blog.status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(blog.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-semibold font-['Inter'] transition-all duration-200 active:scale-95 border"
                  style={{ background: '#f4f8f5', color: '#4a7060', borderColor: '#bfd4c8' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  onClick={() => setRejectMode(r => !r)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-300 rounded-xl text-[12px] font-semibold font-['Inter'] transition-all duration-200 active:scale-95"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </button>
              </>
            )}

            {/* View post button */}
            <button
              onClick={() => setPreviewing(true)}
              className="flex items-center gap-1 px-3 py-1.5 border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-stone-500 rounded-xl text-[12px] font-semibold font-['Inter'] transition-all duration-200 active:scale-95"
              title="Preview as user"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </button>

            <button
              onClick={() => onDelete(blog.id)}
              className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-all"
              title="Raw preview"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Reject reason input */}
        {rejectMode && (
          <div className="px-4 pb-3 pt-3 border-t border-stone-100 bg-stone-50/60">
            <p className="text-[11px] font-semibold font-['Inter'] text-stone-500 uppercase tracking-widest mb-2">Reason for rejection</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Off-topic, spam, incomplete content..."
                className="flex-1 px-3 py-2 text-[13px] font-['Inter'] border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 bg-white text-stone-700 placeholder:text-stone-300 transition-colors"
                onKeyDown={e => e.key === 'Enter' && handleReject()}
                autoFocus
              />
              <button
                onClick={handleReject}
                disabled={!reason.trim()}
                className="px-4 py-2 text-white text-[12px] font-semibold font-['Inter'] rounded-xl disabled:opacity-40 transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)' }}
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* Expanded raw preview */}
        {expanded && (
          <div className="px-4 pb-4 pt-3 border-t border-stone-100">
            {blog.excerpt && (
              <p className="text-[13px] font-['Inter'] font-light text-stone-500 italic mb-3 leading-relaxed">{blog.excerpt}</p>
            )}
            {blog.tags?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {blog.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-stone-100 border border-stone-200 rounded-full text-[10px] font-['Inter'] text-stone-500">#{t}</span>
                ))}
              </div>
            )}
            <div className="max-h-48 overflow-y-auto p-4 bg-stone-50 rounded-xl border border-stone-200">
              <pre className="text-[12px] text-stone-600 whitespace-pre-wrap break-words leading-relaxed" style={{ fontFamily: 'monospace' }}>
                {blog.content.slice(0, 1200)}{blog.content.length > 1200 ? '\n…' : ''}
              </pre>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
