import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Mic, Crown } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import PageWrapper from "@/components/PageWrapper";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import PaymentPopup from "@/components/PaymentPopup";

// ─── Pattern definitions ───────────────────────────────────────────────────────

const ACTIVE_PATTERN = {
    num: "01",
    name: "Pattern 1",
    path: "/game/communication",
    desc: "Full Communication Round simulation — conversation, listening, reading aloud, repeat sentences, fill-in-the-blank, error correction, speaking topic, and written email.",
    tag: "All Sections · AI Feedback",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.06)",
    border: "rgba(124,58,237,0.17)",
    glow: "rgba(124,58,237,0.15)",
};

const COMING_SOON_PATTERNS = [
    {
        num: "02",
        name: "Pattern 2",
    },
    {
        num: "03",
        name: "Pattern 3",
    },
];

// ─── Component ─────────────────────────────────────────────────────────────────

function PatternsContent() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const { isPremium } = usePremiumStatus();
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);

    useGSAP(
        () => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(containerRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55 });
        },
        { scope: containerRef }
    );

    const handlePatternClick = async () => {
        // Non-premium users → show payment popup instead of starting
        if (!isPremium) {
            setShowPaymentPopup(true);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track) => track.stop());
            navigate(ACTIVE_PATTERN.path);
        } catch (error: any) {
            console.error("Permission check failed:", error);
            if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                toast.error(
                    "Microphone permission denied. Please click the lock icon in your address bar and allow microphone access."
                );
            } else {
                toast.error(
                    "Microphone access validation failed. Please ensure your microphone is connected and accessible."
                );
            }
        }
    };

    return (
        <>
            <PaymentPopup isOpen={showPaymentPopup} onClose={() => setShowPaymentPopup(false)} />

            <div ref={containerRef} className="w-full max-w-5xl mx-auto px-6 py-10 opacity-0">

                {/* Back */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-[13px] font-medium font-['Inter'] transition-colors mb-10 group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    Back
                </button>

                {/* Hero */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-semibold tracking-[0.2em] uppercase font-['Inter'] mb-4">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500" />
                        </span>
                        Communication Round
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif text-stone-800 tracking-tight leading-[1.15] mb-2">
                        Select a Pattern
                    </h1>
                    <p className="text-stone-400 text-[0.88rem] font-['Inter'] font-light">
                        Choose a practice pattern modelled on the real MNC Communication Assessment.
                    </p>
                </div>

                {/* ── Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Pattern 1 — Active */}
                    <div
                        onClick={handlePatternClick}
                        className="relative rounded-2xl p-6 flex flex-col gap-5 cursor-pointer group overflow-hidden"
                        style={{
                            background: "#ffffff",
                            border: `1px solid ${ACTIVE_PATTERN.border}`,
                            boxShadow: "0 3px 16px rgba(0,0,0,0.04)",
                            transition: "box-shadow 0.22s ease, transform 0.22s ease",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.boxShadow = `0 14px 44px ${ACTIVE_PATTERN.glow}, 0 0 0 1.5px ${ACTIVE_PATTERN.border}`;
                            (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 3px 16px rgba(0,0,0,0.04)";
                            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        }}
                    >
                        {/* Accent wash */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: `radial-gradient(ellipse 90% 60% at 10% 0%, ${ACTIVE_PATTERN.bg} 0%, transparent 68%)`,
                            }}
                        />
                        {/* Shimmer sweep */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                        {/* Bottom accent line */}
                        <div
                            className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: `linear-gradient(90deg, ${ACTIVE_PATTERN.color}, transparent 70%)` }}
                        />

                        <div className="relative z-10 flex flex-col gap-5 h-full">
                            {/* Top row */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <div
                                        className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-2"
                                        style={{ color: ACTIVE_PATTERN.color }}
                                    >
                                        {ACTIVE_PATTERN.num}
                                    </div>
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: ACTIVE_PATTERN.bg, border: `1px solid ${ACTIVE_PATTERN.border}` }}
                                    >
                                        <Mic className="w-5 h-5" style={{ color: ACTIVE_PATTERN.color }} />
                                    </div>
                                </div>

                                {!isPremium && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowPaymentPopup(true); }}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border font-['Inter'] hover:opacity-80 transition-opacity"
                                        style={{
                                            color: "#d97706",
                                            background: "rgba(217,119,6,0.07)",
                                            borderColor: "rgba(217,119,6,0.2)",
                                        }}
                                    >
                                        <Crown className="w-2.5 h-2.5" />
                                        Unlock Full Access
                                    </button>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h3
                                    className="text-[1.1rem] font-bold tracking-tight font-['Inter'] mb-2"
                                    style={{ color: "#1c1c1e", letterSpacing: "-0.015em" }}
                                >
                                    {ACTIVE_PATTERN.name}
                                </h3>
                                <p className="text-stone-500 text-[12.5px] leading-relaxed font-['Inter']">
                                    {ACTIVE_PATTERN.desc}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                                <div
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold tracking-wide border font-['Inter']"
                                    style={{ color: ACTIVE_PATTERN.color, background: ACTIVE_PATTERN.bg, borderColor: ACTIVE_PATTERN.border }}
                                >
                                    {ACTIVE_PATTERN.tag}
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[12px] font-semibold font-['Inter']" style={{ color: ACTIVE_PATTERN.color }}>
                                        Start
                                    </span>
                                    <ArrowUpRight
                                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                        style={{ color: ACTIVE_PATTERN.color }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Patterns 2 & 3 — Coming Soon */}
                    {COMING_SOON_PATTERNS.map((pattern) => (
                        <div
                            key={pattern.num}
                            className="relative rounded-2xl p-6 flex flex-col gap-5 overflow-hidden select-none"
                            style={{
                                background: "#f9f9f8",
                                border: "1px solid rgba(0,0,0,0.055)",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.025)",
                            }}
                        >
                            {/* Top row */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-2 text-stone-300">
                                        {pattern.num}
                                    </div>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-100 border border-stone-200">
                                        <Mic className="w-5 h-5 text-stone-300" />
                                    </div>
                                </div>
                                <div className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider border border-stone-200 text-stone-300 font-['Inter']">
                                    Coming Soon
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex items-center justify-center">
                                <span className="text-stone-300 text-[13px] font-semibold font-['Inter'] tracking-wide">
                                    Coming Soon
                                </span>
                            </div>

                            {/* Footer */}
                            <div>
                                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold tracking-wide border border-stone-200 text-stone-300 font-['Inter']">
                                    Coming Soon
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export function CommunicationPatternsPage() {
    return (
        <PageWrapper>
            <SEO title="Communication Round — Select Pattern" />
            <Header />
            <div className="pt-20 flex justify-center">
                <PatternsContent />
            </div>
        </PageWrapper>
    );
}
