import { Clock, Tag, BadgeCheck, TrendingUp, Calendar, CalendarOff } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

export interface Expert {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  skills: string[] | null;
  photo_url: string | null;
  price_inr: number;
  company: string | null;
  interview_date: string | null;
  package_lpa: number | null;
  proof_url: string | null;
  created_at: string;
  // Populated when fetched with availability join
  availability?: { id: string }[];
}

interface ExpertCardProps {
  expert: Expert;
  onBook: (expert: Expert) => void;
}

const COMPANY_STYLES: Record<string, { pill: string; glow: string; dot: string }> = {
  Accenture: {
    pill: 'bg-violet-50 text-violet-700 border border-violet-100',
    glow: 'from-violet-50 to-transparent',
    dot: 'bg-violet-500',
  },
  Infosys: {
    pill: 'bg-blue-50 text-blue-700 border border-blue-100',
    glow: 'from-blue-50 to-transparent',
    dot: 'bg-blue-500',
  },
  TCS: {
    pill: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
    glow: 'from-cyan-50 to-transparent',
    dot: 'bg-cyan-500',
  },
  Cognizant: {
    pill: 'bg-sky-50 text-sky-700 border border-sky-100',
    glow: 'from-sky-50 to-transparent',
    dot: 'bg-sky-500',
  },
};

const DEFAULT_STYLE = {
  pill: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  glow: 'from-emerald-50 to-transparent',
  dot: 'bg-emerald-500',
};

const ExpertCard = ({ expert, onBook }: ExpertCardProps) => {
  const style = expert.company
    ? (COMPANY_STYLES[expert.company] ?? DEFAULT_STYLE)
    : DEFAULT_STYLE;

  const placedAgo = expert.interview_date
    ? formatDistanceToNow(parseISO(expert.interview_date), { addSuffix: true })
    : null;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* Company banner strip */}
      {expert.company && (
        <div className={`bg-gradient-to-r ${style.glow} px-5 pt-4 pb-3 flex items-center justify-between border-b border-stone-50`}>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.pill} font-['Inter']`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            <BadgeCheck className="w-3 h-3" />
            Placed at {expert.company}
          </div>
          {expert.package_lpa && (
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 font-['Inter']">
              <TrendingUp className="w-3 h-3" />
              ₹{expert.package_lpa} LPA
            </div>
          )}
        </div>
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Profile row */}
        <div className="flex items-start gap-3.5">
          <div className="flex-shrink-0">
            {expert.photo_url ? (
              <img
                src={expert.photo_url}
                alt={expert.name}
                className="w-14 h-14 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-xl font-['Merriweather'] text-stone-500">
                {expert.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-['Merriweather'] text-stone-900 leading-snug">
              {expert.name}
            </h3>
            {expert.title && (
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed line-clamp-2 font-['Inter']">
                {expert.title}
              </p>
            )}
            {placedAgo && (
              <div className="flex items-center gap-1 mt-1.5 text-stone-400 font-['Inter']">
                <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="text-[11px]">Placed {placedAgo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {expert.bio && (
          <p className="text-sm text-stone-600 leading-relaxed line-clamp-3 font-['Inter']">
            {expert.bio}
          </p>
        )}

        {/* Skills */}
        {expert.skills && expert.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {expert.skills.slice(0, 4).map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-50 text-stone-600 rounded-full text-xs font-medium border border-stone-100 font-['Inter']"
              >
                <Tag className="w-2.5 h-2.5" />
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Proof badge */}
        {expert.proof_url && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-['Inter']">
            <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Placement verified</span>
          </div>
        )}

        {/* No availability warning */}
        {expert.availability && expert.availability.length === 0 && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-50 border border-stone-100 rounded-xl text-xs text-stone-400 font-['Inter']">
            <CalendarOff className="w-3.5 h-3.5 flex-shrink-0" />
            Not accepting bookings right now
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-stone-50">
          <div className="flex items-center gap-1.5 text-stone-500 text-sm font-['Inter']">
            <Clock className="w-3.5 h-3.5" />
            <span>20 min · ₹{expert.price_inr}</span>
          </div>
          <button
            onClick={() => onBook(expert)}
            disabled={expert.availability !== undefined && expert.availability.length === 0}
            className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-700 active:scale-95 transition-all duration-200 font-['Inter'] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            Book a Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertCard;
