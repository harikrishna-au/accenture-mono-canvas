import { Link } from 'react-router-dom';
import { Eye, Clock } from 'lucide-react';
import type { Blog } from '@/lib/blog-utils';
import { formatDate, displayAuthor } from '@/lib/blog-utils';
import { BlogTypeTag } from './BlogTypeTag';

export function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group bg-card border border-stone-200/60 rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:bg-white hover:shadow-md hover:-translate-y-1 hover:border-stone-300 transition-all duration-300"
    >
      {/* Emoji + type tag */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl leading-none select-none">{blog.cover_emoji}</span>
        <BlogTypeTag type={blog.type} size="sm" />
      </div>

      {/* Title */}
      <h3 className="font-['Merriweather'] font-bold text-stone-800 text-[0.95rem] leading-snug group-hover:text-stone-900 transition-colors line-clamp-2">
        {blog.title}
      </h3>

      {/* Excerpt */}
      {blog.excerpt && (
        <p className="font-['Inter'] text-[13px] text-stone-500 leading-relaxed line-clamp-3 font-light">
          {blog.excerpt}
        </p>
      )}

      {/* Tags */}
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {blog.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-500 text-[10px] font-['Inter'] font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-auto">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-[9px] font-bold text-stone-600 flex-shrink-0 font-['Inter']">
            {displayAuthor(blog.author_name).charAt(0).toUpperCase()}
          </div>
          <span className="text-[11px] font-['Inter'] text-stone-500 truncate max-w-[90px]">
            {displayAuthor(blog.author_name)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] font-['Inter'] text-stone-400">
            <Clock className="w-3 h-3 flex-shrink-0" />
            {blog.read_time}m
          </span>
          <span className="flex items-center gap-1 text-[11px] font-['Inter'] text-stone-400">
            <Eye className="w-3 h-3 flex-shrink-0" />
            {blog.views}
          </span>
        </div>
      </div>

      {blog.published_at && (
        <p className="text-[10px] font-['Inter'] text-stone-400 -mt-1 tracking-wide">
          {formatDate(blog.published_at)}
        </p>
      )}
    </Link>
  );
}
