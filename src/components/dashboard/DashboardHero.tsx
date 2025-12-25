
import { Crown, Youtube } from "lucide-react";

interface DashboardHeroProps {
    isPremium: boolean;
}

export const DashboardHero = ({ isPremium }: DashboardHeroProps) => {
    return (
        <div className="w-full mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left space-y-4 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium text-white/90 mb-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Building in Public
                </div>
                {isPremium && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/50 text-xs font-bold text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)] mb-2">
                        <Crown className="w-3.5 h-3.5 fill-current" />
                        PREMIUM MEMBER
                    </div>
                )}
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                    Join the Journey
                </h1>
                <p className="text-lg text-neutral-300 max-w-xl">
                    {isPremium
                        ? "Thank you for being a Premium Member! You have unlimited access to all levels."
                        : "I'm building this platform from scratch. Watch the process, learn with me, and be a part of the story."}
                </p>
            </div>

            <a
                href="https://www.youtube.com/@HARIKRISHNA-AU"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-4 px-8 py-4 bg-white text-neutral-900 rounded-2xl font-bold hover:bg-neutral-100 transition-all hover:scale-105 active:scale-95 shadow-xl z-10"
            >
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md">
                    <Youtube className="w-6 h-6 fill-current" />
                </div>
                <div className="flex flex-col items-start text-left">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Subscribe to</span>
                    <span className="text-xl font-black tracking-tight">@HARIKRISHNA-AU</span>
                </div>

                {/* Decorative glow behind button */}
                <div className="absolute inset-0 -z-10 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </a>

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
        </div>
    );
};
