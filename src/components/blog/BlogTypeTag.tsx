import { BLOG_TYPES, type BlogType } from '@/lib/blog-utils';

interface BlogTypeTagProps {
  type: BlogType;
  size?: 'sm' | 'md';
}

// Japandi palette — warm stone tones only, no vivid colors
const TYPE_STYLES: Record<BlogType, string> = {
  interview_experience: 'bg-stone-100 text-stone-700 border-stone-300',
  aptitude_strategy:   'bg-[#f2efe9] text-stone-600 border-stone-300',
  company_profile:     'bg-[#faf9f7] text-stone-600 border-stone-200',
  communication_tips:  'bg-stone-50 text-stone-600 border-stone-200',
  success_story:       'bg-[#fdf8f0] text-[#8a6a3a] border-[#e8d5b0]',
  resume_advice:       'bg-[#f4f8f5] text-[#4a7060] border-[#bfd4c8]',
  off_campus:          'bg-[#faf7f4] text-stone-600 border-stone-300',
  general:             'bg-stone-50 text-stone-500 border-stone-200',
};

export function BlogTypeTag({ type, size = 'md' }: BlogTypeTagProps) {
  const meta = BLOG_TYPES[type] ?? BLOG_TYPES.general;
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.general;
  const cls = size === 'sm'
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-2.5 py-1 text-[11px]';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-['Inter'] font-semibold tracking-wide whitespace-nowrap ${cls} ${style}`}>
      <span>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}
