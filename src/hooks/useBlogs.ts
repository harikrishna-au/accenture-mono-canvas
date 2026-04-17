import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Blog, BlogType, BlogStatus } from '@/lib/blog-utils';
import { generateSlug, calcReadTime, generateExcerpt } from '@/lib/blog-utils';

// ─── Published blogs (public) ─────────────────────────────────────────────────
export function usePublishedBlogs(filterType?: BlogType | 'all') {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = (supabase as any)
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (filterType && filterType !== 'all') {
      query = query.eq('type', filterType);
    }

    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setBlogs(data ?? []);
    setLoading(false);
  }, [filterType]);

  useEffect(() => { fetch(); }, [fetch]);

  return { blogs, loading, error, refetch: fetch };
}

// ─── Single blog by slug ──────────────────────────────────────────────────────
export function useBlogBySlug(slug: string) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data, error: err } = await (supabase as any)
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (err) setError(err.message);
      else {
        setBlog(data);
        // atomic increment view count (fire-and-forget)
        if (data?.id) {
          (supabase as any).rpc('increment_blog_views', { blog_id: data.id });
        }
      }
      setLoading(false);
    })();
  }, [slug]);

  return { blog, loading, error };
}

// ─── Author's own blogs ───────────────────────────────────────────────────────
export function useMyBlogs(authorId: string) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!authorId) {
      setBlogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await (supabase as any)
      .from('blogs')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });
    setBlogs(data ?? []);
    setLoading(false);
  }, [authorId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { blogs, loading, refetch: fetch };
}

// ─── Admin: all blogs by status ────────────────────────────────────────────────
export function useAdminBlogs(statusFilter: BlogStatus | 'all' = 'pending') {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = (supabase as any)
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    setBlogs(data ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const approve = async (id: string) => {
    await (supabase as any)
      .from('blogs')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id);
    fetch();
  };

  const reject = async (id: string, reason: string) => {
    await (supabase as any)
      .from('blogs')
      .update({ status: 'rejected', reject_reason: reason })
      .eq('id', id);
    fetch();
  };

  const deleteBlog = async (id: string) => {
    await (supabase as any).from('blogs').delete().eq('id', id);
    fetch();
  };

  return { blogs, loading, refetch: fetch, approve, reject, deleteBlog };
}

// ─── Related blogs (same type, exclude current) ───────────────────────────────
export function useRelatedBlogs(type: string, excludeSlug: string, limit = 3) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type || !excludeSlug) {
      setBlogs([]);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from('blogs')
        .select('id, title, slug, excerpt, cover_emoji, type, tags, author_name, read_time, views, published_at, created_at, updated_at, content, author_id, author_email, status, reject_reason')
        .eq('status', 'published')
        .eq('type', type)
        .neq('slug', excludeSlug)
        .order('published_at', { ascending: false })
        .limit(limit);
      setBlogs(data ?? []);
      setLoading(false);
    })();
  }, [type, excludeSlug, limit]);

  return { blogs, loading };
}

// ─── Submit a new blog ────────────────────────────────────────────────────────
export async function submitBlog(params: {
  title: string;
  content: string;
  type: BlogType;
  tags: string[];
  cover_emoji: string;
  author_id: string;
  author_name: string;
  author_email?: string;
}): Promise<{ data: Blog | null; error: string | null }> {
  if (params.content.trim().length < 500) {
    return { data: null, error: 'Content must be at least 500 characters' };
  }

  const slug = generateSlug(params.title);
  const read_time = calcReadTime(params.content);
  const excerpt = generateExcerpt(params.content);

  const { data, error } = await (supabase as any)
    .from('blogs')
    .insert({
      ...params,
      slug,
      read_time,
      excerpt,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
