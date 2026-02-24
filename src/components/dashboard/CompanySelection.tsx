import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { CompanyCard } from "./CompanyCard";
import { WaitlistPopup } from "./WaitlistPopup";
import { Sparkles, MessageSquare, Coffee, Youtube, Linkedin, Bot } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface CompanySelectionProps {
    onSelectCompany: (companyId: string) => void;
    onFeedbackClick: () => void;
    onSupportClick: () => void;
}

export const CompanySelection = ({ onSelectCompany, onFeedbackClick, onSupportClick }: CompanySelectionProps) => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Waitlist State
    const [showWaitlist, setShowWaitlist] = useState(false);
    const [selectedWaitlistCompany, setSelectedWaitlistCompany] = useState<{ name: string, id: string } | null>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(containerRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 1 }
        )
            .fromTo(heroRef.current?.children || [],
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
                "-=0.6"
            )
            .fromTo(gridRef.current?.children || [],
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
                "-=0.4"
            );
    }, { scope: containerRef });

    const companies = [
        {
            id: "accenture",
            name: "Accenture",
            description: "Master the communication rounds and cognitive assessments specific to Accenture's recruitment process.",
            status: "active" as const,
            color: "bg-purple-100"
        },
        {
            id: "cognizant",
            name: "Cognizant",
            description: "Prepare for GenC and GenC Next roles with tailored technical and HR interview simulations.",
            status: "active" as const,
            color: "bg-blue-100"
        },
        {
            id: "ibm",
            name: "IBM",
            description: "Crack the IPAT and coding challenges with resources designed for IBM's hiring standards.",
            status: "coming-soon" as const,
            color: "bg-indigo-100"
        },
        {
            id: "wipro",
            name: "Wipro",
            description: "Get ready for NLTH (Elite) and Turbo challenges with comprehensive practice modules.",
            status: "coming-soon" as const,
            color: "bg-sky-100"
        },
    ];

    const handleCompanyClick = (company: typeof companies[0]) => {
        if (company.status === 'active') {
            onSelectCompany(company.id);
        } else {
            setSelectedWaitlistCompany({ name: company.name, id: company.id });
            setShowWaitlist(true);
        }
    };

    return (
        <div ref={containerRef} className="w-full max-w-5xl mx-auto px-6 py-20 opacity-0">
            <WaitlistPopup
                isOpen={showWaitlist}
                onClose={() => setShowWaitlist(false)}
                companyName={selectedWaitlistCompany?.name || ''}
                companyId={selectedWaitlistCompany?.id || ''}
            />

            {/* Minimalist Hero */}
            <div ref={heroRef} className="flex flex-col items-center text-center mb-24 space-y-8">
                <div className="space-y-4 max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-serif text-stone-800 tracking-tight leading-tight">
                        Choose your <span className="italic text-stone-500">path</span>.
                    </h1>
                    <p className="text-lg text-stone-600 font-light leading-relaxed max-w-2xl mx-auto">
                        Curated preparation journeys for top-tier recruitment processes. Simple, focused, and effective.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* NEW AI Interview Button */}
                    <button
                        onClick={() => navigate('/ai-interview')}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 rounded-full border border-white/10" />
                        <Bot className="w-5 h-5 text-emerald-400" />
                        <span className="font-medium tracking-wide">Try New AI Interview</span>
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    </button>

                    {/* Connect Button — Premium */}
                    <div className="relative">

                        <button
                            onClick={() => navigate('/connect')}
                            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:scale-[1.03]"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed, #4f46e5, #2563eb)',
                                boxShadow: '0 0 0 1px rgba(139,92,246,0.4), 0 8px 30px rgba(124,58,237,0.4), 0 16px 50px rgba(59,130,246,0.2)',
                            }}
                        >
                            {/* Shimmer sweep */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                            {/* Sparkle dots */}
                            <div className="absolute top-2 left-5 w-1 h-1 rounded-full bg-purple-200 opacity-70 animate-pulse" />
                            <div className="absolute bottom-2.5 right-7 w-0.5 h-0.5 rounded-full bg-blue-200 opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }} />
                            <MessageSquare className="w-5 h-5 text-white/90 group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-semibold tracking-wide text-white">Connect</span>
                            <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Clean Grid */}
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                {companies.map((company) => (
                    <CompanyCard
                        key={company.id}
                        name={company.name}
                        description={company.description}
                        status={company.status}
                        logoColor={company.color}
                        onClick={() => handleCompanyClick(company)}
                    />
                ))}
            </div>

        </div>
    );
};
