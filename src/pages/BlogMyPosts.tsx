import { useNavigate } from 'react-router-dom';
import { useUser, SignedOut, SignInButton } from '@clerk/clerk-react';
import { PenLine, Clock, Eye, AlertCircle, CheckCircle2, Hourglass, FileText } from 'lucide-react';
import Header from '@/components/Header';
import { BlogTypeTag } from '@/components/blog/BlogTypeTag';
import { useMyBlogs } from '@/hooks/useBlogs';
import { formatDate } from '@/lib/blog-utils';
import type { BlogStatus } from '@/lib/blog-utils';

const STATUS_META: Record<BlogStatus, { label: string; icon: React.ReactNode; classes: string }> = {
  pending: {
    label: 'Under Review',
    icon: <Hourglass className="w-3.5 h-3.5" />,
    classes: 'bg-[#fdf8f0] text-[#8a6a3a] border-[#e8d5b0]',
  },
  published: {
    label: 'Published',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    classes: 'bg-[#f4f8f5] text-[#4a7060] border-[#bfd4c8]',
  },
  rejected: {
    label: 'Rejected',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    classes: 'bg-stone-100 text-stone-600 border-stone-300',
  },
};

export default function BlogMyPosts() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { blogs, loading } = useMyBlogs(user?.id ?? '');

  return (
    <div className="min-h-screen relative" style={{ background: '#fcfcf9' }}>
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
            <FileText className="w-6 h-6 text-stone-500" />
          </div>
          <h2 className="font-['Merriweather'] font-bold text-stone-800 text-2xl mb-2 tracking-tight">Sign in to view your posts</h2>
          <p className="font-['Inter'] text-stone-500 text-[14px] mb-7 font-light leading-relaxed">
            Track the status of your submitted blog posts.
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
        <div className="flex items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white border border-stone-100 text-[10px] uppercase tracking-widest font-bold text-stone-400 font-['Inter'] mb-4">
              <FileText className="w-2.5 h-2.5" />
              My Posts
            </div>
            <h1 className="font-['Merriweather'] font-black text-stone-900 text-2xl md:text-3xl tracking-tight mb-1 leading-tight">
              My Blogs
            </h1>
            <p className="font-['Inter'] text-[14px] text-stone-500 font-light">
              Track the status of your submitted posts.
            </p>
          </div>
          <button
            onClick={() => navigate('/blog/write')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-[13.5px] font-['Inter'] text-white transition-all duration-200 hover:opacity-90 active:scale-95 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
          >
            <PenLine className="w-4 h-4" />
            Write New
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-24 bg-stone-100/80 rounded-xl" />)}
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mb-5 shadow-sm">
              <PenLine className="w-7 h-7 text-stone-400" />
            </div>
            <h3 className="font-['Merriweather'] font-bold text-stone-700 text-xl mb-2 tracking-tight">
              No posts yet
            </h3>
            <p className="font-['Inter'] text-[14px] text-stone-400 max-w-xs leading-relaxed font-light mb-7">
              Share your placement experience with the community.
            </p>
            <button
              onClick={() => navigate('/blog/write')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] font-['Inter'] text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)' }}
            >
              <PenLine className="w-4 h-4" />
              Write your first blog
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {blogs.map(blog => {
              const sm = STATUS_META[blog.status];
              return (
                <div
                  key={blog.id}
                  className="bg-white border border-stone-200/60 rounded-xl p-4 flex items-start gap-4 shadow-sm hover:border-stone-300 hover:shadow-md transition-all duration-200"
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5 select-none">{blog.cover_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h3
                        className={`font-['Merriweather'] font-bold text-stone-800 text-[0.93rem] leading-snug ${
                          blog.status === 'published'
                            ? 'cursor-pointer hover:text-stone-600 transition-colors'
                            : ''
                        }`}
                        onClick={() => blog.status === 'published' && navigate(`/blog/${blog.slug}`)}
                      >
                        {blog.title}
                      </h3>
                      <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-['Inter'] uppercase tracking-widest ${sm.classes}`}>
                        {sm.icon}
                        {sm.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <BlogTypeTag type={blog.type} size="sm" />
                      <span className="flex items-center gap-1 text-[11px] font-['Inter'] text-stone-400">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        {formatDate(blog.created_at)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-['Inter'] text-stone-400">
                        <Eye className="w-3 h-3 flex-shrink-0" />
                        {blog.views} views
                      </span>
                    </div>

                    {blog.status === 'rejected' && blog.reject_reason && (
                      <p className="mt-2 text-[11px] font-['Inter'] text-stone-600 bg-stone-100 px-2.5 py-1.5 rounded-lg border border-stone-200">
                        Reason: {blog.reject_reason}
                      </p>
                    )}
                    {blog.status === 'pending' && (
                      <p className="mt-1.5 text-[11px] font-['Inter'] text-[#8a6a3a]">
                        Under review — usually approved within 24 hours.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
