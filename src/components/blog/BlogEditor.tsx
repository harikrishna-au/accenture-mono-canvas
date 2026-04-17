import { useState } from 'react';
import { Eye, Edit3 } from 'lucide-react';

interface BlogEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^#{3}\s(.+)/gm, '<h3 style="font-family:Merriweather,serif;font-weight:700;font-size:1.25rem;color:#1c1c1b;margin-top:1.5rem;margin-bottom:0.5rem">$1</h3>')
    .replace(/^#{2}\s(.+)/gm, '<h2 style="font-family:Merriweather,serif;font-weight:700;font-size:1.5rem;color:#1c1c1b;margin-top:2rem;margin-bottom:0.75rem">$1</h2>')
    .replace(/^#{1}\s(.+)/gm, '<h1 style="font-family:Merriweather,serif;font-weight:900;font-size:1.75rem;color:#1c1c1b;margin-bottom:1rem">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:#1c1c1b">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="font-style:italic;color:#57534e">$1</em>')
    .replace(/`([^`]+)`/g, '<code style="padding:2px 6px;border-radius:4px;background:#f2efe9;color:#44403c;font-size:13px;font-family:monospace">$1</code>')
    .replace(/^>\s(.+)/gm, '<blockquote style="padding-left:1rem;border-left:3px solid #d6d3d1;color:#78716c;font-style:italic;margin:0.75rem 0">$1</blockquote>')
    .replace(/^[-*]\s(.+)/gm, '<li style="margin-left:1.25rem;list-style-type:disc;color:#57534e;margin-top:2px">$1</li>')
    .replace(/^\d+\.\s(.+)/gm, '<li style="margin-left:1.25rem;list-style-type:decimal;color:#57534e;margin-top:2px">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
      const safe = /^https?:\/\//i.test(url) || /^mailto:/i.test(url) || url.startsWith('/') || url.startsWith('#');
      if (!safe) return text;
      return `<a href="${url.replace(/"/g, '%22')}" style="color:#557d6b;text-decoration:underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
    })
    .replace(/\n\n/g, '</p><p style="margin-top:0.75rem;color:#57534e;line-height:1.75;font-family:Inter,sans-serif;font-size:15px">')
    .replace(/\n/g, '<br/>');
}

export function BlogEditor({ value, onChange, placeholder }: BlogEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  return (
    <div className="flex flex-col border border-stone-200 rounded-xl overflow-hidden bg-white">
      {/* Tab bar — matches Header button style */}
      <div className="flex items-center gap-1 px-3 py-2 bg-stone-50/80 border-b border-stone-200">
        {(['write', 'preview'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold font-['Inter'] transition-all duration-200 ${
              tab === t
                ? 'bg-white text-stone-800 shadow-sm border border-stone-200'
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
            }`}
          >
            {t === 'write' ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {t === 'write' ? 'Write' : 'Preview'}
          </button>
        ))}
        <span className="ml-auto text-[10px] uppercase tracking-widest text-stone-400 font-['Inter'] font-semibold">
          Markdown
        </span>
      </div>

      {tab === 'write' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '# Start with your heading\n\nShare your experience...\n\n## What happened\n\nYour story here...'}
          className="w-full min-h-[400px] p-5 font-mono text-[14px] text-stone-700 bg-white placeholder:text-stone-300 resize-y focus:outline-none leading-7"
          style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
        />
      ) : (
        <div
          className="min-h-[400px] p-6 bg-white overflow-auto"
          style={{ fontFamily: 'Inter, sans-serif' }}
          dangerouslySetInnerHTML={{
            __html: value
              ? `<p style="color:#57534e;line-height:1.75;font-family:Inter,sans-serif;font-size:15px">${renderMarkdown(value)}</p>`
              : '<p style="color:#d6d3d1;font-family:Inter,sans-serif;font-size:14px">Nothing to preview yet…</p>',
          }}
        />
      )}
    </div>
  );
}
