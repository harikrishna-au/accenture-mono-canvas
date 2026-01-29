
import { Crown, Youtube } from "lucide-react";

interface DashboardHeroProps {
    isPremium: boolean;
}

export const DashboardHero = ({ isPremium }: DashboardHeroProps) => {
    return (
        <div className="w-full mb-10 relative overflow-hidden rounded-xl bg-stone-50/50 border border-stone-100/50 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left space-y-4 z-10">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white border border-stone-100 text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Live Updates
                </div>

                <h1 className="text-3xl font-serif text-stone-800 tracking-tight">
                    Your learning sanctuary.
                </h1>
                <p className="text-stone-500 max-w-lg font-light leading-relaxed text-sm">
                    {isPremium
                        ? "Welcome back. Your premium access is active."
                        : "Track your progress, access resources, and prepare for your interviews with focus."}
                </p>
            </div>

            <a
                href="https://www.youtube.com/@HARIKRISHNA-AU"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 pl-6 pr-8 py-3 bg-white hover:bg-stone-50 text-stone-800 rounded-full border border-stone-200/60 transition-all hover:border-stone-300"
            >
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                    <Youtube className="w-4 h-4 fill-current" />
                </div>
                <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Subscribe</span>
                    <span className="text-sm font-semibold tracking-tight text-stone-700">@HARIKRISHNA-AU</span>
                </div>
            </a>
        </div>
    );
};
