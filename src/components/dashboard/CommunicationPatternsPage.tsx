import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import {
    ArrowLeft, ArrowUpRight, Mic, Crown, Lock, X,
    MessageSquare, Headphones, BookOpen, Repeat2,
    PencilLine, AlertCircle, Radio, Mail, BarChart2, MonitorCheck,
    Play, CheckCircle2,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useActivityResults } from "@/hooks/useActivityResults";
import { formatAttempts, formatBestScore, type ActivityResult } from "@/lib/activityResults";
import PageWrapper from "@/components/PageWrapper";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import PaymentPopup from "@/components/PaymentPopup";

// ─── Pattern definitions ───────────────────────────────────────────────────────

// Each pattern mirrors a specific company's Communication Assessment, so the
// cards are named after that company. Accents match the company dots used on
// the Cognitive Games page.
const ACTIVE_PATTERN = {
    num: "01",
    name: "Accenture",
    path: "/game/communication",
    desc: "Full Communication Round simulation — conversation, listening, reading aloud, repeat sentences, fill-in-the-blank, error correction, speaking topic, and written email.",
    tag: "All Sections · AI Feedback",
    color: "#A100FF",
    bg: "rgba(161,0,255,0.06)",
    border: "rgba(161,0,255,0.17)",
    glow: "rgba(161,0,255,0.15)",
    dark: "#7A00C2",
};

const PATTERN_2 = {
    num: "02",
    name: "Cognizant",
    path: "/game/communication-p2",
    desc: "Read sentences aloud, listen and repeat, spoken Q&A, sentence rearrangement, and story retelling — a fresh set of skills with AI feedback.",
    tag: "5 Sections · AI Feedback",
    color: "#0033A0",
    bg: "rgba(0,51,160,0.06)",
    border: "rgba(0,51,160,0.17)",
    glow: "rgba(0,51,160,0.15)",
    dark: "#002374",
};

const PATTERN_2_SECTIONS = [
    { label: "Microphone Setup", detail: "Quick device check before the assessment begins", icon: MonitorCheck, tag: "Pre-check", tagColor: "text-stone-400", tagBg: "bg-stone-100" },
    { label: "Section A — Read the Sentence", detail: "5 sentences · Read each sentence aloud clearly", icon: BookOpen, tag: "Reading", tagColor: "text-cyan-600", tagBg: "bg-cyan-50" },
    { label: "Section B — Listen & Repeat", detail: "5 sentences · Listen to audio and repeat accurately", icon: Repeat2, tag: "Speaking", tagColor: "text-violet-600", tagBg: "bg-violet-50" },
    { label: "Section C — Spoken Q&A", detail: "4 questions · Listen to question and answer verbally", icon: MessageSquare, tag: "Speaking", tagColor: "text-violet-600", tagBg: "bg-violet-50" },
    { label: "Section D — Sentence Rearrangement", detail: "4 puzzles · Tap words to form the correct sentence", icon: PencilLine, tag: "Grammar", tagColor: "text-amber-600", tagBg: "bg-amber-50" },
    { label: "Section E — Story Retelling", detail: "1 story · Listen then retell in your own words", icon: Radio, tag: "Speaking", tagColor: "text-violet-600", tagBg: "bg-violet-50" },
    { label: "AI Score Analysis", detail: "Fluency · Grammar · Vocabulary · Pronunciation breakdown", icon: BarChart2, tag: "Feedback", tagColor: "text-stone-500", tagBg: "bg-stone-100" },
];

const COMING_SOON_PATTERNS = [
    { num: "03", name: "More companies" },
];

// ─── Exam sections shown inside the modal ─────────────────────────────────────

const PATTERN_SECTIONS = [
    {
        label: "Microphone Setup",
        detail: "Quick device check before the assessment begins",
        icon: MonitorCheck,
        tag: "Pre-check",
        tagColor: "text-stone-400",
        tagBg: "bg-stone-100",
    },
    {
        label: "Section A — Conversation",
        detail: "6 questions · Have a natural spoken conversation with AI",
        icon: MessageSquare,
        tag: "Speaking",
        tagColor: "text-violet-600",
        tagBg: "bg-violet-50",
    },
    {
        label: "Section B — Listening Comprehension",
        detail: "6 questions · Listen to audio clips and answer questions",
        icon: Headphones,
        tag: "Listening",
        tagColor: "text-blue-600",
        tagBg: "bg-blue-50",
    },
    {
        label: "Section C — Reading Aloud",
        detail: "8 questions · Read passages aloud for pronunciation scoring",
        icon: BookOpen,
        tag: "Reading",
        tagColor: "text-emerald-600",
        tagBg: "bg-emerald-50",
    },
    {
        label: "Section D — Repeat Sentences",
        detail: "8 questions · Listen and repeat sentences accurately",
        icon: Repeat2,
        tag: "Speaking",
        tagColor: "text-violet-600",
        tagBg: "bg-violet-50",
    },
    {
        label: "Section E — Fill in the Blank",
        detail: "5 questions · Complete sentences with the correct word",
        icon: PencilLine,
        tag: "Vocabulary",
        tagColor: "text-amber-600",
        tagBg: "bg-amber-50",
    },
    {
        label: "Section F — Error Correction",
        detail: "5 questions · Identify and correct grammatical errors",
        icon: AlertCircle,
        tag: "Grammar",
        tagColor: "text-rose-600",
        tagBg: "bg-rose-50",
    },
    {
        label: "Section G — Speaking Topic",
        detail: "3 questions · Speak for 60 seconds on a given topic",
        icon: Radio,
        tag: "Speaking",
        tagColor: "text-violet-600",
        tagBg: "bg-violet-50",
    },
    {
        label: "Written Email",
        detail: "1 task · Compose a professional email in a given scenario",
        icon: Mail,
        tag: "Writing",
        tagColor: "text-sky-600",
        tagBg: "bg-sky-50",
    },
    {
        label: "AI Score Analysis",
        detail: "Fluency · Grammar · Vocabulary · Pronunciation breakdown",
        icon: BarChart2,
        tag: "Feedback",
        tagColor: "text-stone-500",
        tagBg: "bg-stone-100",
    },
];

// ─── Pattern Detail Modal ──────────────────────────────────────────────────────

function PatternDetailModal({
    isOpen,
    onClose,
    onStart,
    onUnlock,
    isPremium,
}: {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
    onUnlock: () => void;
    isPremium: boolean;
}) {
    if (!isOpen) return null;

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Sheet */}
            <div
                className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
                style={{
                    maxHeight: "90dvh",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
                    border: `1px solid ${ACTIVE_PATTERN.border}`,
                }}
            >
                {/* Header */}
                <div
                    className="px-6 pt-6 pb-4 flex-shrink-0"
                    style={{
                        background: `linear-gradient(135deg, ${ACTIVE_PATTERN.bg} 0%, transparent 100%)`,
                        borderBottom: `1px solid ${ACTIVE_PATTERN.border}`,
                    }}
                >
                    {/* Drag handle (mobile) */}
                    <div className="w-9 h-1 bg-stone-200 rounded-full mx-auto mb-4 sm:hidden" />

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: ACTIVE_PATTERN.bg, border: `1px solid ${ACTIVE_PATTERN.border}` }}
                            >
                                <Mic className="w-5 h-5" style={{ color: ACTIVE_PATTERN.color }} />
                            </div>
                            <div>
                                <div
                                    className="text-[9px] font-bold tracking-[0.35em] uppercase font-['Inter'] mb-0.5"
                                    style={{ color: ACTIVE_PATTERN.color }}
                                >
                                    Communication Round · {ACTIVE_PATTERN.num}
                                </div>
                                <h2 className="text-[1.1rem] font-bold tracking-tight font-['Inter'] text-stone-900">
                                    {ACTIVE_PATTERN.name}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors mt-0.5 flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <p className="text-stone-500 text-[12.5px] leading-relaxed font-['Inter'] mt-3">
                        {ACTIVE_PATTERN.desc}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                        {[
                            { val: "9", label: "Sections" },
                            { val: "42+", label: "Questions" },
                            { val: "AI", label: "Graded" },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-1.5">
                                <span
                                    className="text-[11px] font-bold font-['Inter']"
                                    style={{ color: ACTIVE_PATTERN.color }}
                                >
                                    {s.val}
                                </span>
                                <span className="text-stone-400 text-[11px] font-['Inter']">{s.label}</span>
                                <span className="text-stone-200 text-[11px]">·</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sections list */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
                    <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-stone-400 font-['Inter'] mb-3">
                        Exam Structure
                    </p>
                    {PATTERN_SECTIONS.map((sec, idx) => {
                        const Icon = sec.icon;
                        return (
                            <div
                                key={idx}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors"
                            >
                                {/* Step number */}
                                <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[9px] font-bold text-stone-400 font-['Inter']">
                                        {idx + 1}
                                    </span>
                                </div>

                                {/* Icon */}
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: ACTIVE_PATTERN.bg }}
                                >
                                    <Icon className="w-3.5 h-3.5" style={{ color: ACTIVE_PATTERN.color }} />
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12.5px] font-semibold text-stone-800 font-['Inter'] leading-tight truncate">
                                        {sec.label}
                                    </div>
                                    <div className="text-[11px] text-stone-400 font-['Inter'] leading-tight mt-0.5 truncate">
                                        {sec.detail}
                                    </div>
                                </div>

                                {/* Tag */}
                                <div
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide font-['Inter'] flex-shrink-0 ${sec.tagBg} ${sec.tagColor}`}
                                >
                                    {sec.tag}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA */}
                <div
                    className="px-6 py-5 flex-shrink-0"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                >
                    {isPremium ? (
                        <button
                            onClick={onStart}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] font-['Inter'] text-white transition-all active:scale-[0.98]"
                            style={{
                                background: `linear-gradient(135deg, ${ACTIVE_PATTERN.color} 0%, ${ACTIVE_PATTERN.dark} 100%)`,
                                boxShadow: `0 4px 20px ${ACTIVE_PATTERN.glow}`,
                            }}
                        >
                            <Play className="w-4 h-4 fill-white" />
                            Start Practice Round
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <button
                                onClick={onUnlock}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] font-['Inter'] transition-all active:scale-[0.98]"
                                style={{
                                    background: "rgba(217,119,6,0.07)",
                                    border: "1.5px solid rgba(217,119,6,0.3)",
                                    color: "#b45309",
                                }}
                            >
                                <Lock className="w-4 h-4" />
                                Unlock with Premium
                            </button>
                            <p className="text-center text-[11px] text-stone-400 font-['Inter']">
                                <Crown className="w-3 h-3 inline-block mr-1 text-amber-400" />
                                Premium users get full access to all Communication Rounds
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Cognizant Detail Modal ───────────────────────────────────────────────────

function Pattern2Modal({
    isOpen,
    onClose,
    onStart,
    onUnlock,
    isPremium,
}: {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
    onUnlock: () => void;
    isPremium: boolean;
}) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
                style={{ maxHeight: "90dvh", boxShadow: "0 32px 80px rgba(0,0,0,0.2)", border: `1px solid ${PATTERN_2.border}` }}
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${PATTERN_2.bg} 0%, transparent 100%)`, borderBottom: `1px solid ${PATTERN_2.border}` }}>
                    <div className="w-9 h-1 bg-stone-200 rounded-full mx-auto mb-4 sm:hidden" />
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: PATTERN_2.bg, border: `1px solid ${PATTERN_2.border}` }}>
                                <Mic className="w-5 h-5" style={{ color: PATTERN_2.color }} />
                            </div>
                            <div>
                                <div className="text-[9px] font-bold tracking-[0.35em] uppercase font-['Inter'] mb-0.5" style={{ color: PATTERN_2.color }}>
                                    Communication Round · {PATTERN_2.num}
                                </div>
                                <h2 className="text-[1.1rem] font-bold tracking-tight font-['Inter'] text-stone-900">{PATTERN_2.name}</h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors mt-0.5 flex-shrink-0">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-stone-500 text-[12.5px] leading-relaxed font-['Inter'] mt-3">{PATTERN_2.desc}</p>
                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                        {[{ val: "5", label: "Sections" }, { val: "19+", label: "Questions" }, { val: "AI", label: "Graded" }].map((s) => (
                            <div key={s.label} className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold font-['Inter']" style={{ color: PATTERN_2.color }}>{s.val}</span>
                                <span className="text-stone-400 text-[11px] font-['Inter']">{s.label}</span>
                                <span className="text-stone-200 text-[11px]">·</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sections list */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
                    <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-stone-400 font-['Inter'] mb-3">Exam Structure</p>
                    {PATTERN_2_SECTIONS.map((sec, idx) => {
                        const Icon = sec.icon;
                        return (
                            <div key={idx} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors">
                                <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[9px] font-bold text-stone-400 font-['Inter']">{idx + 1}</span>
                                </div>
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: PATTERN_2.bg }}>
                                    <Icon className="w-3.5 h-3.5" style={{ color: PATTERN_2.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12.5px] font-semibold text-stone-800 font-['Inter'] leading-tight truncate">{sec.label}</div>
                                    <div className="text-[11px] text-stone-400 font-['Inter'] leading-tight mt-0.5 truncate">{sec.detail}</div>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide font-['Inter'] flex-shrink-0 ${sec.tagBg} ${sec.tagColor}`}>{sec.tag}</div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className="px-6 py-5 flex-shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    {isPremium ? (
                        <button
                            onClick={onStart}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] font-['Inter'] text-white transition-all active:scale-[0.98]"
                            style={{ background: `linear-gradient(135deg, ${PATTERN_2.color} 0%, ${PATTERN_2.dark} 100%)`, boxShadow: `0 4px 20px ${PATTERN_2.glow}` }}
                        >
                            <Play className="w-4 h-4 fill-white" />
                            Start Practice Round
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <button
                                onClick={onUnlock}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] font-['Inter'] transition-all active:scale-[0.98]"
                                style={{ background: "rgba(217,119,6,0.07)", border: "1.5px solid rgba(217,119,6,0.3)", color: "#b45309" }}
                            >
                                <Lock className="w-4 h-4" />
                                Unlock with Premium
                            </button>
                            <p className="text-center text-[11px] text-stone-400 font-['Inter']">
                                <Crown className="w-3 h-3 inline-block mr-1 text-amber-400" />
                                Premium users get full access to all Communication Rounds
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Component ─────────────────────────────────────────────────────────────────

function RoundResultLine({ result, color }: { result: ActivityResult; color: string }) {
    return (
        <div className="flex items-center gap-2 text-[11.5px] font-['Inter']">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
            <span className="font-semibold" style={{ color }}>
                {formatBestScore(result)}
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-500">{formatAttempts(result)}</span>
        </div>
    );
}

function PatternsContent() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const { isPremium } = usePremiumStatus();
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [showPatternModal, setShowPatternModal] = useState(false);
    const [showPattern2Modal, setShowPattern2Modal] = useState(false);

    const results = useActivityResults();
    const accentureResult = results[ACTIVE_PATTERN.path];
    const cognizantResult = results[PATTERN_2.path];

    useGSAP(
        () => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(containerRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55 });
        },
        { scope: containerRef }
    );

    const handlePatternClick = () => {
        // Always show the pattern detail modal first
        setShowPatternModal(true);
    };

    const handleStartRound = async () => {
        setShowPatternModal(false);
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

    const handleUnlock = () => {
        setShowPatternModal(false);
        setShowPaymentPopup(true);
    };

    const handleStartPattern2 = async () => {
        setShowPattern2Modal(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track) => track.stop());
            navigate(PATTERN_2.path);
        } catch (error: any) {
            if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                toast.error("Microphone permission denied. Please allow microphone access in your browser settings.");
            } else {
                toast.error("Microphone access validation failed. Please ensure your microphone is connected.");
            }
        }
    };

    const handleUnlockPattern2 = () => {
        setShowPattern2Modal(false);
        setShowPaymentPopup(true);
    };

    return (
        <>
            <PaymentPopup isOpen={showPaymentPopup} onClose={() => setShowPaymentPopup(false)} />

            <PatternDetailModal
                isOpen={showPatternModal}
                onClose={() => setShowPatternModal(false)}
                onStart={handleStartRound}
                onUnlock={handleUnlock}
                isPremium={!!isPremium}
            />

            <Pattern2Modal
                isOpen={showPattern2Modal}
                onClose={() => setShowPattern2Modal(false)}
                onStart={handleStartPattern2}
                onUnlock={handleUnlockPattern2}
                isPremium={!!isPremium}
            />

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
                        Select a Company
                    </h1>
                    <p className="text-stone-400 text-[0.88rem] font-['Inter'] font-light">
                        Each round is modelled on that company's real Communication Assessment.
                    </p>
                </div>

                {/* ── Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Accenture — Active */}
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="Accenture communication round"
                        onClick={handlePatternClick}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handlePatternClick();
                            }
                        }}
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

                                {!isPremium ? (
                                    <div
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border font-['Inter']"
                                        style={{
                                            color: "#d97706",
                                            background: "rgba(217,119,6,0.07)",
                                            borderColor: "rgba(217,119,6,0.2)",
                                        }}
                                    >
                                        <Lock className="w-2.5 h-2.5" />
                                        Premium Only
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border font-['Inter']"
                                        style={{
                                            color: "#16a34a",
                                            background: "rgba(22,163,74,0.07)",
                                            borderColor: "rgba(22,163,74,0.2)",
                                        }}
                                    >
                                        <Crown className="w-2.5 h-2.5" />
                                        Unlocked
                                    </div>
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

                            {accentureResult && (
                                <RoundResultLine result={accentureResult} color={ACTIVE_PATTERN.color} />
                            )}

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
                                        {accentureResult ? "Retake round" : "View Round"}
                                    </span>
                                    <ArrowUpRight
                                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                        style={{ color: ACTIVE_PATTERN.color }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cognizant — Active */}
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="Cognizant communication round"
                        onClick={() => setShowPattern2Modal(true)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setShowPattern2Modal(true);
                            }
                        }}
                        className="relative rounded-2xl p-6 flex flex-col gap-5 cursor-pointer group overflow-hidden"
                        style={{
                            background: "#ffffff",
                            border: `1px solid ${PATTERN_2.border}`,
                            boxShadow: "0 3px 16px rgba(0,0,0,0.04)",
                            transition: "box-shadow 0.22s ease, transform 0.22s ease",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.boxShadow = `0 14px 44px ${PATTERN_2.glow}, 0 0 0 1.5px ${PATTERN_2.border}`;
                            (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 3px 16px rgba(0,0,0,0.04)";
                            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        }}
                    >
                        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 90% 60% at 10% 0%, ${PATTERN_2.bg} 0%, transparent 68%)` }} />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, ${PATTERN_2.color}, transparent 70%)` }} />

                        <div className="relative z-10 flex flex-col gap-5 h-full">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-2" style={{ color: PATTERN_2.color }}>
                                        {PATTERN_2.num}
                                    </div>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: PATTERN_2.bg, border: `1px solid ${PATTERN_2.border}` }}>
                                        <Mic className="w-5 h-5" style={{ color: PATTERN_2.color }} />
                                    </div>
                                </div>
                                {!isPremium ? (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border font-['Inter']" style={{ color: "#d97706", background: "rgba(217,119,6,0.07)", borderColor: "rgba(217,119,6,0.2)" }}>
                                        <Lock className="w-2.5 h-2.5" />
                                        Premium Only
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border font-['Inter']" style={{ color: "#16a34a", background: "rgba(22,163,74,0.07)", borderColor: "rgba(22,163,74,0.2)" }}>
                                        <Crown className="w-2.5 h-2.5" />
                                        Unlocked
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[1.1rem] font-bold tracking-tight font-['Inter'] mb-2" style={{ color: "#1c1c1e", letterSpacing: "-0.015em" }}>
                                    {PATTERN_2.name}
                                </h3>
                                <p className="text-stone-500 text-[12.5px] leading-relaxed font-['Inter']">{PATTERN_2.desc}</p>
                            </div>

                            {cognizantResult && (
                                <RoundResultLine result={cognizantResult} color={PATTERN_2.color} />
                            )}
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-semibold tracking-wide border font-['Inter']" style={{ color: PATTERN_2.color, background: PATTERN_2.bg, borderColor: PATTERN_2.border }}>
                                    {PATTERN_2.tag}
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[12px] font-semibold font-['Inter']" style={{ color: PATTERN_2.color }}>
                                        {cognizantResult ? "Retake round" : "View Round"}
                                    </span>
                                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: PATTERN_2.color }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coming Soon */}
                    {COMING_SOON_PATTERNS.map((pattern) => (
                        <div
                            key={pattern.num}
                            className="relative rounded-2xl p-6 flex flex-col gap-5 overflow-hidden select-none"
                            style={{ background: "#f9f9f8", border: "1px solid rgba(0,0,0,0.055)", boxShadow: "0 2px 10px rgba(0,0,0,0.025)" }}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-[9px] font-bold tracking-[0.38em] uppercase font-['Inter'] mb-2 text-stone-300">{pattern.num}</div>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-100 border border-stone-200">
                                        <Mic className="w-5 h-5 text-stone-300" />
                                    </div>
                                </div>
                                <div className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider border border-stone-200 text-stone-300 font-['Inter']">
                                    Coming Soon
                                </div>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <span className="text-stone-300 text-[13px] font-semibold font-['Inter'] tracking-wide">Coming Soon</span>
                            </div>
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
            <SEO title="Communication Round — Select Company" />
            <Header />
            <div className="pt-20 flex justify-center">
                <PatternsContent />
            </div>
        </PageWrapper>
    );
}
