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
            <div className="h-10 flex items-center justify-center min-w-[240px] px-6 py-2 bg-white/80 backdrop-blur-md rounded-full border border-gray-100 shadow-sm">
                {status === "listening" && (
                    <span className="flex items-center gap-2 text-red-500 font-bold animate-pulse text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        LISTENING TO YOU...
                    </span>
                )}
                {status === "processing" && (
                    <span className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        ANALYZING RESPONSE...
                    </span>
                )}
                {status === "speaking" && (
                    <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                        <div className="flex gap-1 h-3 items-end">
                            <div className="w-1 bg-emerald-500 animate-[music_1s_ease-in-out_infinite]" />
                            <div className="w-1 bg-emerald-500 animate-[music_1.2s_ease-in-out_infinite]" />
                            <div className="w-1 bg-emerald-500 animate-[music_0.8s_ease-in-out_infinite]" />
                        </div>
                        SARAH IS SPEAKING
                    </span>
                )}
                {status === "idle" && (
                    <span className="text-neutral-400 font-medium text-sm flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        Tap mic to answer
                    </span>
                )}
            </div>

            <div className="flex items-center gap-8">
                <button
                    onClick={onToggleRecording}
                    className={cn(
                        "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                        isRecording
                            ? "bg-red-500 text-white hover:bg-red-600 scale-110 ring-8 ring-red-100"
                            : "bg-white text-indigo-600 hover:scale-105 border-4 border-indigo-50 ring-8 ring-indigo-50/50"
                    )}
                >
                    {isRecording ? (
                        <Square className="w-10 h-10 fill-current" />
                    ) : (
                        <Mic className="w-10 h-10" />
                    )}
                </button>
            </div>

            <p className="text-xs text-center text-gray-400 mt-4 max-w-sm">
                Tip: Speak clearly. Devi will listen until you stop the recording.
                Keep answers concise to cover more ground.
            </p>
        </div>
    );
};
