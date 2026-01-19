import PageWrapper from "@/components/PageWrapper";
import { VisemeDisplay } from "@/components/nilo/VisemeDisplay";
import { Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIInterview } from "@/hooks/useAIInterview";
import { ResumeCollection } from "@/components/nilo/ResumeCollection";
import { InterviewFeedback } from "@/components/nilo/InterviewFeedback";
import { InterviewControls } from "@/components/nilo/InterviewControls";
import { useUser } from "@clerk/clerk-react";

const AIInterview = () => {
    const { user } = useUser();
    const {
        setResumeText,
        interviewStarted,
        isResumeSubmitting,
        interviewEnded,
        isRecording,
        status,
        textToSpeak,
        audioSrc,
        timeLeft,
        startInterview,
        endInterview,
        toggleRecording
    } = useAIInterview();

    // Format time as MM:SS (Logic kept here for display, could be utility)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (interviewEnded) {
        return <InterviewFeedback />;
    }

    return (
        <PageWrapper>
            {!interviewStarted ? (
                <ResumeCollection
                    onSubmit={(text) => startInterview(text, user?.id)}
                    isSubmitting={isResumeSubmitting}
                />
            ) : (
                <div className="flex flex-col items-center min-h-[calc(100vh-100px)] pt-6 pb-12">
                    <div className="w-full max-w-4xl px-4 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Live Interview</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold border",
                                timeLeft < 300 ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-gray-700 border-gray-200"
                            )}>
                                <Clock className="w-4 h-4" />
                                {formatTime(timeLeft)}
                            </div>
                            <button
                                onClick={endInterview}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="End Interview"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl relative">
                        {/* Main Avatar Container */}
                        <div className="relative w-full max-w-lg aspect-square mb-12 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white rounded-full blur-3xl -z-10 transform scale-110" />
                            <VisemeDisplay text={textToSpeak} audioSrc={audioSrc} />
                        </div>

                        <InterviewControls
                            status={status}
                            isRecording={isRecording}
                            onToggleRecording={toggleRecording}
                        />
                    </div>
                </div>
            )}
        </PageWrapper>
    );
};

export default AIInterview;
