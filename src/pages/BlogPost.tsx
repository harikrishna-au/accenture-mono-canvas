import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Calendar, Share2, Check, PenLine } from 'lucide-react';
import Header from '@/components/Header';
import SEO from '@/components/SEO';
import { BlogTypeTag } from '@/components/blog/BlogTypeTag';
import { useBlogBySlug, useRelatedBlogs } from '@/hooks/useBlogs';
import { formatDate, displayAuthor, BLOG_TYPES } from '@/lib/blog-utils';

function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^#{3}\s(.+)/gm, '<h4 style="font-family:Merriweather,serif;font-weight:700;font-size:1.05rem;color:#1c1c1b;margin-top:2rem;margin-bottom:0.4rem;line-height:1.4">$1</h4>')
    .replace(/^#{2}\s(.+)/gm, '<h3 style="font-family:Merriweather,serif;font-weight:700;font-size:1.2rem;color:#1c1c1b;margin-top:2.25rem;margin-bottom:0.5rem;line-height:1.4">$1</h3>')
    .replace(/^#{1}\s(.+)/gm, '<h2 style="font-family:Merriweather,serif;font-weight:700;font-size:1.45rem;color:#1c1c1b;margin-top:2.75rem;margin-bottom:0.75rem;line-height:1.3">$1</h2>')
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

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { blog, loading, error } = useBlogBySlug(slug ?? '');
  const { blogs: relatedBlogs } = useRelatedBlogs(blog?.type ?? '', slug ?? '');
  const [readProgress, setReadProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setReadProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#fcfcf9' }}>
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-20 max-w-2xl">
          <div className="animate-pulse space-y-5">
            <div className="h-4 w-16 bg-stone-100 rounded-full" />
            <div className="h-10 w-3/4 bg-stone-100 rounded-xl" />
            <div className="h-4 w-1/2 bg-stone-100 rounded-lg" />
            <div className="h-px bg-stone-100 w-full" />
            <div className="space-y-3 pt-6">
              {[100, 92, 97, 85, 90].map((w, i) => (
                <div key={i} className="h-4 bg-stone-100 rounded" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen" style={{ background: '#fcfcf9' }}>
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-20 max-w-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <span className="text-2xl">🔍</span>
          </div>
          <h2 className="font-['Merriweather'] font-bold text-stone-800 text-2xl mb-2 tracking-tight">Blog not found</h2>
          <p className="font-['Inter'] text-stone-500 text-[14px] mb-7 font-light">
            This post may have been removed or the link is incorrect.
          </p>
          <button
            onClick={() => navigate('/blog')}
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold font-['Inter'] text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)' }}
          >
            Back to Blogs
          </button>
        </main>
      </div>
    );
  }

  const canonicalUrl = `https://www.harrytheblaze.site/blog/${blog.slug}`;
  const authorDisplay = displayAuthor(blog.author_name);
  const blogTypeLabel = BLOG_TYPES[blog.type]?.label ?? 'Blog';
  const seoKeywords = [
    blogTypeLabel,
    ...(blog.tags ?? []),
    'campus placement', 'Harry The Blaze', 'placement preparation',
  ].join(', ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt ?? '',
    datePublished: blog.published_at ?? blog.created_at,
    dateModified: blog.updated_at,
    author: {
      '@type': 'Person',
      name: authorDisplay,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Harry The Blaze',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.harrytheblaze.site/favicon.svg',
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    keywords: seoKeywords,
    url: canonicalUrl,
    timeRequired: `PT${blog.read_time}M`,
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#fcfcf9' }}>
      <SEO
        title={`${blog.title} | Harry The Blaze`}
        description={blog.excerpt ?? `${blogTypeLabel} — ${blog.title}`}
        type="article"
        canonical={canonicalUrl}
        keywords={seoKeywords}
        publishedTime={blog.published_at ?? blog.created_at}
        authorName={authorDisplay}
        jsonLd={jsonLd}
      />
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px]" style={{ background: '#e7e5e0' }}>
        <div
          className="h-full transition-all duration-75"
          style={{
            width: `${readProgress}%`,
            background: 'linear-gradient(90deg, #8a6a3a, #c9a46e)',
          }}
        />
      </div>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage: 'radial-gradient(circle, #c4bdb4 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="absolute -top-24 -right-24 w-[400px] h-[400px] blur-[100px] opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(201,164,110,0.14) 0%, transparent 70%)' }}
        />
      </div>

      <Header />

      <main className="relative z-10 container mx-auto px-6 pt-24 pb-28 max-w-2xl">

        {/* Back button */}
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-1.5 text-[13px] font-['Inter'] text-stone-400 hover:text-stone-700 transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          All Blogs
        </button>

        <article>
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
            style={{ fontSize: 'clamp(1.55rem, 4vw, 2.2rem)' }}
          >
            {blog.title}
          </h1>

          {/* Meta row */}
          <div
            className="flex items-center gap-3 flex-wrap py-3.5 mb-8"
            style={{ borderTop: '1px solid #e7e5e0', borderBottom: '1px solid #e7e5e0' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white font-['Inter'] flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #8a6a3a, #c9a46e)' }}
              >
                {displayAuthor(blog.author_name).charAt(0).toUpperCase()}
              </div>
              <span className="font-['Inter'] text-[13px] font-semibold text-stone-700">{displayAuthor(blog.author_name)}</span>
            </div>

            <span className="text-stone-300 select-none">·</span>

            <span className="flex items-center gap-1 text-[12px] font-['Inter'] text-stone-400">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              {blog.published_at ? formatDate(blog.published_at) : formatDate(blog.created_at)}
            </span>

            <span className="flex items-center gap-1 text-[12px] font-['Inter'] text-stone-400">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              {blog.read_time} min read
            </span>

            <span className="flex items-center gap-1 text-[12px] font-['Inter'] text-stone-400">
              <Eye className="w-3.5 h-3.5 flex-shrink-0" />
              {blog.views} views
            </span>

            <button
              onClick={handleShare}
              className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-['Inter'] transition-all duration-200 active:scale-95 ${
                copied
                  ? 'border-[#bfd4c8] bg-[#f4f8f5] text-[#4a7060]'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>

          {/* Excerpt highlight */}
          {blog.excerpt && (
            <p
              className="font-['Inter'] text-[15px] text-stone-600 leading-relaxed mb-8 pl-4 font-light italic"
              style={{ borderLeft: '3px solid #c4bdb4' }}
            >
              {blog.excerpt}
            </p>
          )}

          {/* Content */}
          <div
            className="prose-content"
            style={{ fontFamily: 'Inter, sans-serif' }}
            dangerouslySetInnerHTML={{
              __html: `<p style="color:#57534e;line-height:1.85;font-family:Inter,sans-serif;font-size:15.5px">${renderMarkdown(blog.content)}</p>`,
            }}
          />

          {/* Divider */}
          <div className="mt-14 mb-8" style={{ borderTop: '1px solid #e7e5e0' }} />

          {/* Author card */}
          <div
            className="p-5 rounded-xl border border-stone-200/60 flex items-center gap-4 shadow-sm"
            style={{ background: '#f2efe9' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0 font-['Inter'] shadow-sm"
              style={{ background: 'linear-gradient(135deg, #8a6a3a, #c9a46e)' }}
            >
              {displayAuthor(blog.author_name).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-['Merriweather'] font-bold text-stone-800 text-[0.95rem]">{displayAuthor(blog.author_name)}</p>
              <p className="font-['Inter'] text-[12px] text-stone-500 mt-0.5 font-light">
                Contributed to Harry The Blaze community
              </p>
            </div>
          </div>

          {/* Related posts */}
          {relatedBlogs.length > 0 && (
            <div className="mt-10">
              <p className="font-['Inter'] text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">
                More {blogTypeLabel}
              </p>
              <div className="flex flex-col gap-3">
                {relatedBlogs.map(r => (
                  <Link
                    key={r.id}
                    to={`/blog/${r.slug}`}
                    className="flex items-start gap-3 p-4 rounded-xl border border-stone-200/60 bg-white hover:border-stone-300 hover:shadow-sm transition-all duration-200 group"
                  >
                    <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{r.cover_emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-['Merriweather'] font-bold text-stone-800 text-[0.88rem] leading-snug group-hover:text-stone-900 transition-colors line-clamp-2">
                        {r.title}
                      </p>
                      <p className="font-['Inter'] text-[11px] text-stone-400 mt-1">
                        {r.read_time} min read · {displayAuthor(r.author_name)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center gap-1.5 text-[13px] font-['Inter'] text-stone-400 hover:text-stone-700 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to all blogs
            </button>
            <Link
              to="/blog/write"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] font-['Inter'] text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)' }}
            >
              <PenLine className="w-3.5 h-3.5" />
              Write your own
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
