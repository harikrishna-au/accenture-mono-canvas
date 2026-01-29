import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewControlsProps {
    status: "idle" | "listening" | "processing" | "speaking";
    isRecording: boolean;
    onToggleRecording: () => void;
}

export const InterviewControls = ({ status, isRecording, onToggleRecording }: InterviewControlsProps) => {
    return (
        <div className="flex flex-col items-center gap-6 z-10 w-full">
            <div className="h-10 flex items-center justify-center min-w-[240px] px-6 py-2 bg-white/80 backdrop-blur-md rounded-full border border-stone-200 shadow-sm">
                {status === "listening" && (
                    <span className="flex items-center gap-2 text-rose-500 font-bold animate-pulse text-xs tracking-widest uppercase">
                        <div className="w-2 h-2 bg-rose-500 rounded-full" />
                        Listening...
                    </span>
                )}
                {status === "processing" && (
                    <span className="flex items-center gap-2 text-stone-600 font-bold text-xs tracking-widest uppercase">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Analyzing...
                    </span>
                )}
                {status === "speaking" && (
                    <span className="flex items-center gap-2 text-emerald-600 font-bold text-xs tracking-widest uppercase">
                        <div className="flex gap-1 h-3 items-end">
                            <div className="w-0.5 bg-emerald-500 animate-[music_1s_ease-in-out_infinite]" />
                            <div className="w-0.5 bg-emerald-500 animate-[music_1.2s_ease-in-out_infinite]" />
                            <div className="w-0.5 bg-emerald-500 animate-[music_0.8s_ease-in-out_infinite]" />
                        </div>
                        Sarah Speaking
                    </span>
                )}
                {status === "idle" && (
                    <span className="text-stone-400 font-medium text-xs flex items-center gap-2 uppercase tracking-wide">
                        <Mic className="w-3.5 h-3.5" />
                        Tap to speak
                    </span>
                )}
            </div>

            <div className="flex items-center gap-8">
                <button
                    onClick={onToggleRecording}
                    className={cn(
                        "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                        isRecording
                            ? "bg-rose-500 text-white hover:bg-rose-600 scale-110 ring-8 ring-rose-100"
                            : "bg-white text-stone-700 hover:scale-105 border-4 border-stone-50 ring-8 ring-stone-100"
                    )}
                >
                    {isRecording ? (
                        <Square className="w-10 h-10 fill-current" />
                    ) : (
                        <Mic className="w-10 h-10 stroke-1" />
                    )}
                </button>
            </div>

            <p className="text-xs text-center text-stone-400 mt-6 max-w-sm font-medium leading-relaxed">
                Speak clearly and naturally. Press the button to stop whenever you finish your answer.
            </p>
        </div>
    );
};
