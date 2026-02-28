
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import accentureLogo from "@/lib/accenture-svgrepo-com.svg";

interface GameCardProps {
    game: {
        id: number;
        name: string;
        path: string;
        disabled?: boolean;
        isExternal?: boolean;
        subtitle?: string;
        special?: boolean;
        icon?: any;
        survey?: boolean;
        premiumBottomBarText?: string;
        typingHighlight?: boolean;
        typingText?: string;
        overlayText?: string;
    };
    isPremium: boolean;
    onSubscribe: () => void;
    onFeedback: () => void;
    id?: string;
    className?: string;
}

export const GameCard = ({ game, isPremium, onSubscribe, onFeedback, id, className = "" }: GameCardProps) => {
    const navigate = useNavigate();

    const handleCardClick = async () => {
        if (game.survey) {
            onFeedback();
            return;
        }


        if (game.special && !isPremium) {
            onSubscribe();
            return;
        }

        if (!game.disabled && game.path && !game.special) {
            if (game.isExternal) {
                window.open(game.path, '_blank', 'noopener,noreferrer');
            } else {
                navigate(game.path);
            }
        }
    };

    // Special premium render for "Connect with me"
    if (game.typingHighlight) {
        return (
            <div
                id={id}
                onClick={handleCardClick}
                className={`relative h-32 rounded-xl overflow-hidden cursor-pointer group transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] ${className}`}
                style={{
                    background: 'linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)',
                    boxShadow: '0 0 0 1px rgba(139,92,246,0.3), 0 8px 32px rgba(139,92,246,0.25), 0 20px 60px rgba(59,130,246,0.15)',
                }}
            >
                {/* Animated glow rings */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div
                        className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-700"
                        style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }}
                    />
                    <div
                        className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-20 group-hover:opacity-50 transition-opacity duration-700"
                        style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
                    />
                    {/* Shimmer sweep */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                </div>

                {/* Sparkle dots */}
                <div className="absolute top-3 left-4 w-1 h-1 rounded-full bg-purple-400 opacity-70 animate-pulse" />
                <div className="absolute top-6 left-8 w-0.5 h-0.5 rounded-full bg-blue-300 opacity-50 animate-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="absolute bottom-4 right-6 w-1 h-1 rounded-full bg-violet-300 opacity-60 animate-pulse" style={{ animationDelay: '0.7s' }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1.5 px-4">
                    <div className="flex items-center gap-1.5">
                        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🤝</span>
                        <span className="text-base font-bold text-white font-['Inter'] tracking-tight">
                            {game.name}
                        </span>
                    </div>

                    {/* Glowing CTA badge */}
                    <div
                        className="mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-white"
                        style={{
                            background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
                            boxShadow: '0 0 12px rgba(124,58,237,0.7)',
                        }}
                    >
                        {game.typingText || 'BOOK SESSION'}
                    </div>

                    {game.subtitle && (
                        <span className="text-[9px] text-center text-blue-300/80 font-medium tracking-wide leading-snug max-w-[160px]">
                            {game.subtitle}
                        </span>
                    )}
                </div>

                {/* Bottom accent line */}
                <div
                    className="absolute bottom-0 inset-x-0 h-0.5 group-hover:opacity-100 opacity-60 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(90deg, transparent, #a855f7, #3b82f6, transparent)' }}
                />
            </div>
        );
    }

    return (
        <div
            id={id}
            onClick={handleCardClick}
            className={`relative h-32 rounded-xl flex flex-col items-center justify-center p-4 overflow-hidden transition-all duration-300 ${className}
        /* Base Japandi Card - Matte, Warm, Handcrafted */
        bg-card border border-stone-200/60 shadow-sm
        
        ${game.name === "Connect with me"
                    ? "bg-[#fffcf5] border-secondary/30 hover:border-secondary hover:shadow-md hover:-translate-y-1 group"
                    : game.special
                        ? game.survey
                            ? "bg-[#f2fcf5] border-primary/20 hover:border-primary/50 hover:shadow-md hover:-translate-y-1 cursor-pointer group"
                            : isPremium
                                ? "bg-[#fffbf0] border-amber-500/30 cursor-default"
                                : "bg-[#fff5f5] border-rose-200 hover:border-rose-400 hover:shadow-md hover:-translate-y-1 cursor-pointer group"
                        : game.name
                            ? "hover:bg-white hover:border-stone-300 hover:shadow-md cursor-pointer group hover:-translate-y-1" + (game.name === "Communication Round" && !isPremium ? " border-amber-200 bg-[#fffdf5]" : "")
                            : "bg-stone-50 border-stone-100 cursor-not-allowed opacity-60 text-stone-300"}
        ${game.disabled ? "cursor-not-allowed opacity-40 grayscale" : ""}
      `}
        >
            {game.name === "Connect with me" && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:animate-shine pointer-events-none z-10" />
            )}

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {game.name && !game.typingHighlight ? (
                    <>
                        {game.name === "Connect with me" ? (
                            <div className="text-4xl mb-1 group-hover:scale-110 transition-transform">🤝</div>
                        ) : game.icon ? (
                            <div className="mb-1 text-amber-500">{game.icon}</div>
                        ) : game.special ? (
                            <div className="mb-1">{game.icon}</div>
                        ) : (
                            <img
                                src={accentureLogo}
                                alt="Accenture"
                                className="absolute top-3 right-3 h-4 w-auto opacity-60 group-hover:invert group-hover:opacity-100 transition-all"
                            />
                        )}

                        <span className={`text-lg font-bold text-center leading-tight mt-2 font-['Inter'] ${game.name === "Connect with me" ? "text-stone-800" : "text-stone-700 group-hover:text-stone-900 transition-colors"}`}>
                            {game.name}
                        </span>

                        {game.subtitle && (
                            <span className={`text-[10px] font-semibold text-center uppercase tracking-wider mt-1 font-['Inter'] ${game.special ? "text-stone-500" : "text-secondary"}`}>
                                {game.subtitle}
                            </span>
                        )}
                    </>
                ) : !game.name ? (
                    <span className="text-sm font-medium text-neutral-400 text-center italic">
                        Coming Soon
                    </span>
                ) : null}
            </div>

            {/* Overlays */}
            {game.disabled && !game.special && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative pointer-events-none">
                        <div className="w-[600px] h-10 bg-red-600/80 backdrop-blur-sm transform -rotate-[25deg] origin-center shadow-2xl flex items-center justify-center border-y-2 border-red-400/50">
                            <span className="text-white font-bold text-sm tracking-[0.2em] drop-shadow-md">{game.overlayText || "UNDER DEVELOPMENT"}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Banner (Bottom Strip) */}
            {game.premiumBottomBarText && !isPremium && (
                <div className="absolute inset-x-0 bottom-0 pointer-events-none">
                    <div className="w-full h-6 bg-amber-500 shadow-md flex items-center justify-center border-t border-amber-300/50">
                        <span className="text-white font-bold text-[10px] tracking-widest uppercase drop-shadow-sm">{game.premiumBottomBarText}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

