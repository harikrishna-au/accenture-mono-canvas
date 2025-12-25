
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
    };
    isPremium: boolean;
    onSubscribe: () => void;
    onFeedback: () => void;
}

export const GameCard = ({ game, isPremium, onSubscribe, onFeedback }: GameCardProps) => {
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
            onClick={handleCardClick}
            className={`relative h-32 border-2 rounded-xl flex flex-col items-center justify-center p-4 overflow-hidden transition-all duration-300
        ${game.name === "Connect with me"
                    ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 shadow-lg shadow-yellow-200/50 hover:shadow-yellow-300 hover:scale-105 hover:-translate-y-1 group"
                    : game.special
                        ? game.survey
                            ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/50 hover:scale-105 hover:-translate-y-1 cursor-pointer group"
                            : isPremium
                                ? "bg-gradient-to-br from-amber-900 to-amber-950 border-amber-700/50 shadow-xl shadow-amber-900/20 cursor-default"
                                : "bg-gradient-to-br from-violet-600 to-rose-600 border-transparent shadow-xl shadow-rose-500/30 hover:shadow-2xl hover:shadow-rose-500/50 hover:scale-105 hover:-translate-y-1 cursor-pointer group"
                        : game.name
                            ? "bg-white border-black" + (game.name === "Communication Round" && !isPremium ? " border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]" : "") + " hover:bg-black hover:text-white cursor-pointer group hover:scale-105"
                            : "bg-gray-50 border-black cursor-not-allowed"}
        ${game.disabled ? "cursor-not-allowed opacity-60" : ""}
      `}
        >
            {game.name === "Connect with me" && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:animate-shine pointer-events-none z-10" />
            )}

            {game.name ? (
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

                    <span className={`text-lg font-bold text-center leading-tight mt-2 ${game.name === "Connect with me" ? "text-yellow-900" : game.special ? "text-white" : ""}`}>
                        {game.name}
                    </span>

                    {game.subtitle && (
                        <span className={`text-[10px] font-medium text-center uppercase tracking-wide mt-1 animate-pulse ${game.special ? "text-white/90" : "text-amber-600"}`}>
                            {game.subtitle}
                        </span>
                    )}
                </>
            ) : (
                <span className="text-sm font-medium text-neutral-400 text-center italic">
                    Coming Soon
                </span>
            )}

            {/* Overlays */}
            {game.disabled && !game.special && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative pointer-events-none">
                        <div className="w-[600px] h-10 bg-red-600 transform -rotate-[25deg] origin-center shadow-2xl flex items-center justify-center border-y-2 border-red-400/50">
                            <span className="text-white font-bold text-sm tracking-[0.2em] drop-shadow-md">UNDER DEVELOPMENT</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Communication Round Premium Banner (Bottom Strip) */}
            {game.name === "Communication Round" && !isPremium && (
                <div className="absolute inset-x-0 bottom-0 pointer-events-none">
                    <div className="w-full h-6 bg-amber-500 shadow-md flex items-center justify-center border-t border-amber-300/50">
                        <span className="text-white font-bold text-[10px] tracking-widest uppercase drop-shadow-sm">UNLOCK WITH PREMIUM</span>
                    </div>
                </div>
            )}
        </div>
    );
};
