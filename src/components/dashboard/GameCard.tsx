
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

        // Special handling for Communication Round
        // Allows Free Trial access (bypass subscription check if specific logic allows)
        if (game.name === "Communication Round") {
            // Logic: Allow if it's the Communication Round (Free Trial Mode)
            // Check permissions
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());
                navigate(game.path);
            } catch (error: any) {
                console.error("Permission check failed:", error);
                if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    toast.error("Microphone permission denied. Please click the lock icon in your address bar and allow microphone access.");
                } else {
                    toast.error("Microphone access validation failed. Please ensure your microphone is connected and accessible.");
                }
            }
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
            {/* Typing Highlight Effect */}
            {game.typingHighlight && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 transition-all duration-300 group-hover:bg-white/95">
                    <div className="relative">
                        <span className="text-4xl absolute -top-12 left-1/2 -translate-x-1/2 mb-4 animate-bounce">👇</span>
                        <div className="overflow-hidden whitespace-nowrap border-r-4 border-amber-600 animate-typing text-sm font-bold text-amber-900 tracking-widest uppercase">
                            {game.typingText || "BOOK NOW"}
                        </div>
                    </div>
                    <span className={`text-lg font-bold text-center leading-tight mt-6 text-amber-950`}>
                        {game.name}
                    </span>
                    {game.subtitle && (
                        <span className="text-xs text-center text-amber-700/80 mt-2 font-medium">
                            {game.subtitle}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

