import { useRef, useEffect } from "react";
import PageWrapper from "@/components/PageWrapper";
import { VisemeDisplay } from "@/components/nilo/VisemeDisplay";
import { Clock, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIInterview } from "@/hooks/useAIInterview";
import { ResumeCollection } from "@/components/nilo/ResumeCollection";
import { InterviewFeedback } from "@/components/nilo/InterviewFeedback";
import { EndInterviewConfirmation } from "@/components/nilo/EndInterviewConfirmation";

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
        toggleRecording,
        uploadResumeToS3,
        userResponse,
        setUserResponse,
        submitResponse,
        handleAudioEnd,
        autoSubmitCountdown,
        cancelAutoSubmit,
        feedback,
        isEnding,
        showEndConfirmation,
        openEndConfirmation,
        closeEndConfirmation
    } = useAIInterview();

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [userResponse]);

    // Format time as MM:SS (Logic kept here for display, could be utility)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndClick = () => {
        openEndConfirmation();
    };

    return (
        <>
            {interviewEnded ? (
                <InterviewFeedback feedback={feedback} />
            ) : isEnding ? (
                <PageWrapper>
                    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 animate-fade-in">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl">🤖</span>
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Generating Your Feedback...</h2>
                            <p className="text-gray-500">Analysing your improved responses and generating a report.</p>
                            <p className="text-xs text-indigo-400 animate-pulse">This might take a few seconds.</p>
                        </div>
                    </div>
                </PageWrapper>
            ) : (
                <PageWrapper>
                    {!interviewStarted ? (
                        <ResumeCollection
                            onSubmit={(text) => startInterview(text, user?.id)}
                            onUpload={uploadResumeToS3}
                            isSubmitting={isResumeSubmitting}
                        />
                    ) : (
                        <div className="flex flex-col items-center min-h-[calc(100vh-100px)] pt-6 pb-12">
                            {/* Earphone Recommendation Banner */}
                            <div className="w-full max-w-4xl px-4 mb-6">
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 shadow-sm animate-fade-in">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-indigo-900 mb-1">🎧 Use Earphones for Better Experience</h3>
                                            <p className="text-xs text-indigo-700">For optimal audio quality and to avoid echo, please use earphones or headphones during this interview.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                        onClick={handleEndClick}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-full font-bold transition-all border border-red-200"
                                        title="End Interview"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span className="text-sm">End Interview</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4">

                                {/* LEFT: Avatar */}
                                <div className="relative w-full aspect-square flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white rounded-full blur-3xl -z-10 transform scale-110" />
                                    <VisemeDisplay text={textToSpeak} audioSrc={audioSrc} onAudioEnd={handleAudioEnd} />
                                </div>

                                {/* RIGHT: Interaction Panel */}
                                <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">

                                    {/* AI Question Display */}
                                    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <h3 className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wide">Current Question</h3>
                                        <p className="text-lg text-gray-800 font-medium leading-relaxed">
                                            {textToSpeak || "Waiting for question..."}
                                        </p>
                                    </div>

                                    {/* User Input Area */}
                                    <div className="flex flex-col gap-4">
                                        <textarea
                                            ref={textareaRef}
                                            className="w-full min-h-[8rem] p-4 rounded-2xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none shadow-inner text-lg overflow-hidden transition-height duration-100 ease-out"
                                            placeholder="Tap the mic to speak your answer..."
                                            value={userResponse}
                                            onChange={(e) => setUserResponse(e.target.value)}
                                            disabled={status === "processing" || status === "speaking"}
                                        />

                                        {/* Auto-Submit Countdown Banner */}
                                        {autoSubmitCountdown !== null && (
                                            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 p-3 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="relative flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                                    </span>
                                                    <span className="text-sm font-semibold text-indigo-700">
                                                        Auto-sending in {autoSubmitCountdown}s...
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={cancelAutoSubmit}
                                                    className="text-xs font-bold text-gray-500 hover:text-red-500 underline"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4">
                                            {/* Mic Button */}
                                            <button
                                                onClick={toggleRecording}
                                                disabled={status === "processing" || status === "speaking"}
                                                className={cn(
                                                    "flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                                                    isRecording
                                                        ? "bg-red-500 text-white animate-pulse shadow-red-200 shadow-lg"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                                                    (status === "processing" || status === "speaking") && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {isRecording ? "Listening..." : "Speak Answer"}
                                            </button>

                                            {/* Send Button */}
                                            <button
                                                onClick={() => submitResponse(false)}
                                                disabled={!userResponse.trim() || isRecording || status === "processing"}
                                                className={cn(
                                                    "flex-1 py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2",
                                                    !userResponse.trim() || isRecording || status === "processing"
                                                        ? "bg-gray-300 cursor-not-allowed"
                                                        : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5"
                                                )}
                                            >
                                                {status === "processing" ? "Sending..." : "Send Answer"}
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </PageWrapper>
            )}

            <EndInterviewConfirmation
                isOpen={showEndConfirmation}
                onConfirm={endInterview}
                onCancel={closeEndConfirmation}
                isEnding={isEnding}
            />
        </>
    );
};

export default AIInterview;
