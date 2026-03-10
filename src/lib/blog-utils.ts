// ─── Blog Utilities ───────────────────────────────────────────────────────────

export type BlogType =
  | 'interview_experience'
  | 'aptitude_strategy'
  | 'company_profile'
  | 'communication_tips'
  | 'success_story'
  | 'resume_advice'
  | 'off_campus'
  | 'general';

export type BlogStatus = 'pending' | 'published' | 'rejected';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  type: BlogType;
  tags: string[];
  cover_emoji: string;
  author_id: string;
  author_name: string;
  author_email: string | null;
  status: BlogStatus;
  reject_reason: string | null;
  views: number;
  read_time: number;
  created_at: string;
  published_at: string | null;
  updated_at: string;
}

export const BLOG_TYPES: Record<BlogType, { label: string; emoji: string; color: string; description: string }> = {
  interview_experience: {
    label: 'Interview Experience',
    emoji: '🎯',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Share your actual interview rounds, questions asked, and how you cracked it',
  },
  aptitude_strategy: {
    label: 'Aptitude Strategy',
    emoji: '🧠',
    color: 'bg-violet-50 text-violet-700 border-violet-200',
    description: 'Tips and tricks for quantitative, logical, and verbal reasoning',
  },
  company_profile: {
    label: 'Company Insight',
    emoji: '🏢',
    color: 'bg-stone-100 text-stone-700 border-stone-300',
    description: 'Culture, CTC, rounds, HR questions — everything about a specific company',
  },
  communication_tips: {
    label: 'Communication Tips',
    emoji: '🗣️',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    description: 'GD topics, PI techniques, English fluency, written communication',
  },
  success_story: {
    label: 'Success Story',
    emoji: '🏆',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Your placed journey — from preparation to offer letter',
  },
  resume_advice: {
    label: 'Resume Advice',
    emoji: '📄',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'ATS tips, project framing, LinkedIn profile, and formatting',
  },
  off_campus: {
    label: 'Off-Campus Guide',
    emoji: '🌐',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Referrals, cold emailing, job portals, LinkedIn outreach',
  },
  general: {
    label: 'General',
    emoji: '📝',
    color: 'bg-stone-50 text-stone-600 border-stone-200',
    description: 'Anything else related to campus placements',
  },
};

/** Generate a URL-safe slug from a title + random suffix to ensure uniqueness */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

/** Estimate reading time in minutes */
export function calcReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Generate a plain-text excerpt from markdown content */
export function generateExcerpt(content: string, maxLen = 160): string {
  const plain = content
    .replace(/#{1,6}\s/g, '')       // headings
    .replace(/\*\*|__|~~|`/g, '')   // bold, italic, code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/\n+/g, ' ')
    .trim();
  return plain.length > maxLen ? plain.slice(0, maxLen).trimEnd() + '…' : plain;
}

/** Resolve a display name — hides 'Anonymous' and empty values */
export function displayAuthor(name: string | null | undefined): string {
  if (!name || name.trim() === '' || name.toLowerCase() === 'anonymous') {
    return 'HTB Community Member';
  }
  return name;
}

/** Format a date string to a human-readable format */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
