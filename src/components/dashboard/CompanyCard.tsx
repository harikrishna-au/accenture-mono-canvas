
import { ArrowRight, Lock, Bell, Sparkles } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface CompanyCardProps {
    name: string;
    description: string;
    status: 'active' | 'coming-soon';
    onClick?: () => void;
    logoColor?: string; // Optional accent color
}

export const CompanyCard = ({ name, description, status, onClick, logoColor = "bg-stone-200" }: CompanyCardProps) => {
    const isActive = status === 'active';
    const cardRef = useRef<HTMLDivElement>(null);

    const { contextSafe } = useGSAP({ scope: cardRef });

    const handleMouseEnter = contextSafe(() => {
        gsap.to(cardRef.current, {
            y: -5,
            boxShadow: isActive
                ? "0 20px 40px -10px rgba(0,0,0,0.1)"
                : "0 10px 30px -10px rgba(0,0,0,0.05)",
            borderColor: isActive ? "#d6d3d1" : "#a8a29e",
            duration: 0.4,
            ease: "power2.out"
        });
    });

    const handleMouseLeave = contextSafe(() => {
        gsap.to(cardRef.current, {
            y: 0,
            boxShadow: "none",
            borderColor: "#e7e5e4", // stone-200
            duration: 0.4,
            ease: "power2.out"
        });
    });

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
                group relative w-full p-8 rounded-xl border border-stone-200 box-border
                flex flex-col justify-between min-h-[240px] bg-white cursor-pointer transition-colors
                ${!isActive && "border-dashed"} 
            `}
        >
            <div className="flex justify-between items-start z-10 pointer-events-none">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-stone-700 shadow-sm ${isActive ? 'bg-stone-50' : 'bg-stone-100/50'}`}>
                    {name.charAt(0)}
                </div>
                {isActive ? (
                    <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                ) : (
                    <div className="px-2 py-1 rounded bg-stone-100 text-[10px] font-bold tracking-widest text-stone-500 uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Waitlist Open
                    </div>
                )}
            </div>

            <div className="mt-8 z-10 pointer-events-none">
                <h3 className={`text-2xl font-serif tracking-tight mb-3 transition-colors ${isActive ? 'text-stone-800' : 'text-stone-500'}`}>
                    {name}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed font-light max-w-sm">
                    {description}
                </p>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100/50 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium tracking-widest uppercase ${isActive ? "text-stone-800" : "text-stone-600 underline decoration-stone-300 underline-offset-4"}`}>
                        {isActive ? "Start Journey" : "Join Waitlist"}
                    </span>
                    {isActive ? <ArrowRight className="w-4 h-4 text-stone-800" /> : <Bell className="w-3.5 h-3.5 text-stone-600" />}
                </div>
            </div>
        </div>
    );
};
