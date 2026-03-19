import { BLOG_TYPES, type BlogType } from '@/lib/blog-utils';

type FilterType = BlogType | 'all';

interface BlogFiltersProps {
  active: FilterType;
  onChange: (type: FilterType) => void;
}

const ALL_FILTERS: { key: FilterType; label: string; emoji: string }[] = [
  { key: 'all', label: 'All Posts', emoji: '✨' },
  ...Object.entries(BLOG_TYPES).map(([key, val]) => ({
    key: key as BlogType,
    label: val.label,
    emoji: val.emoji,
  })),
];

export function BlogFilters({ active, onChange }: BlogFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {ALL_FILTERS.map(({ key, label, emoji }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold font-['Inter'] whitespace-nowrap transition-all duration-200 border active:scale-95 flex-shrink-0 ${
              isActive
                ? 'text-white border-transparent shadow-sm'
                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700 hover:bg-stone-50'
            }`}
            style={isActive ? {
              background: 'linear-gradient(135deg, #1c1c1e 0%, #3d3d40 100%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            } : {}}
          >
            <span className="text-[13px]">{emoji}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
