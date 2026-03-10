import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PenLine, BookOpen, Search, X } from 'lucide-react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Header from '@/components/Header';
import SEO from '@/components/SEO';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { usePublishedBlogs } from '@/hooks/useBlogs';
import type { BlogType } from '@/lib/blog-utils';

type FilterType = BlogType | 'all';

export default function Blog() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { blogs, loading } = usePublishedBlogs(activeFilter === 'all' ? undefined : activeFilter);

  const filteredBlogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.excerpt?.toLowerCase().includes(q) ||
      b.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [blogs, searchQuery]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Harry The Blaze — Community Blogs',
    description: 'Real interview experiences, aptitude strategies, and placement success stories shared by students.',
    url: 'https://www.harrytheblaze.site/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Harry The Blaze',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.harrytheblaze.site/favicon.svg',
      },
    },
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#fcfcf9' }}>
      <SEO
        title="Campus Placement Blogs | Harry The Blaze"
        description="Real interview experiences, aptitude strategies, resume tips, and placement success stories — shared by students, for students."
        canonical="https://www.harrytheblaze.site/blog"
        keywords="campus placement blogs, interview experience, aptitude strategy, placement success story, resume tips, off campus placement India, Harry The Blaze"
        jsonLd={jsonLd}
      />
      <Header />

      {/* ── Background layer (matches Landing page) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: 'radial-gradient(circle, #c4bdb4 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Warm orb top-right */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] blur-[120px] opacity-40"
          style={{ background: 'radial-gradient(ellipse, rgba(201,164,110,0.16) 0%, transparent 70%)' }}
        />
        {/* Stone orb bottom-left */}
        <div
          className="absolute -bottom-24 -left-24 w-[400px] h-[400px] blur-[100px] opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(168,162,158,0.12) 0%, transparent 70%)' }}
        />
      </div>

      <main className="relative z-10 container mx-auto px-6 pt-28 pb-24 max-w-5xl">

        {/* ── Hero ── */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            {/* Section badge — matches DashboardHero pattern */}
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white border border-stone-100 text-[10px] uppercase tracking-widest font-bold text-stone-400 font-['Inter'] mb-4">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Community Blogs
            </div>

            <h1
              className="font-['Merriweather'] font-black text-stone-900 leading-[1.08] tracking-tight mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
            >
              Placement insights,
              <br />
              <span className="text-stone-400 font-light italic">from students like you.</span>
            </h1>

            <p className="font-['Inter'] text-[14px] text-stone-500 max-w-md leading-relaxed font-light">
              Real interview experiences, aptitude strategies, and success stories — shared by the community, for the community.
            </p>
          </div>

          {/* Write CTA — matches Header button gradient */}
          <SignedIn>
            <button
              onClick={() => navigate('/blog/write')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-[13.5px] font-['Inter'] text-white transition-all duration-200 hover:opacity-90 active:scale-95 self-start sm:self-auto flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <PenLine className="w-4 h-4" />
              Write a Blog
            </button>
          </SignedIn>
          <SignedOut>
            <Link
              to="/"
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-[13.5px] font-['Inter'] text-white transition-all duration-200 hover:opacity-90 active:scale-95 self-start sm:self-auto flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              }}
            >
              <PenLine className="w-4 h-4" />
              Sign in to Write
            </Link>
          </SignedOut>
        </div>

        {/* ── Search + Filters ── */}
        <div className="mb-8 space-y-3">
          {/* Search row */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, keyword or tag…"
              className="w-full pl-8 pr-8 py-2.5 text-[13px] font-['Inter'] bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 text-stone-700 placeholder:text-stone-300 shadow-sm transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Filter pills row */}
          <BlogFilters active={activeFilter} onChange={setActiveFilter} />
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-stone-100/80 rounded-xl h-56" />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mb-5 shadow-sm">
              <BookOpen className="w-7 h-7 text-stone-400" />
            </div>
            <h3 className="font-['Merriweather'] font-bold text-stone-700 text-xl mb-2 tracking-tight">
              {searchQuery ? 'No results found' : 'No blogs yet'}
            </h3>
            <p className="font-['Inter'] text-[14px] text-stone-400 max-w-xs leading-relaxed font-light">
              {searchQuery
                ? `No blogs match "${searchQuery}". Try a different keyword or clear the search.`
                : activeFilter === 'all'
                  ? 'Be the first to share your placement experience with the community.'
                  : 'No blogs in this category yet. Try a different filter or write the first one!'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-7 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] font-['Inter'] text-stone-600 border border-stone-200 bg-white hover:bg-stone-50 transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
                Clear search
              </button>
            ) : (
              <SignedIn>
                <button
                  onClick={() => navigate('/blog/write')}
                  className="mt-7 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] font-['Inter'] text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)' }}
                >
                  <PenLine className="w-4 h-4" />
                  Write the first blog
                </button>
              </SignedIn>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBlogs.map(blog => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}

        {/* ── Footer nav ── */}
        <SignedIn>
          <div className="mt-14 flex justify-center">
            <Link
              to="/blog/my"
              className="text-[12px] font-['Inter'] font-medium text-stone-400 hover:text-stone-700 transition-colors tracking-wide"
            >
              View my submitted blogs →
            </Link>
          </div>
        </SignedIn>

      </main>
    </div>
  );
}
