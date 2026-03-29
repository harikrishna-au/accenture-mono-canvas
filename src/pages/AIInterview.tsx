import { useRef, useEffect, useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import { VisemeDisplay } from "@/components/nilo/VisemeDisplay";
import { Clock, XCircle, Loader2, MicOff, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIInterview } from "@/hooks/useAIInterview";
import { ResumeCollection } from "@/components/nilo/ResumeCollection";
import { InterviewFeedback } from "@/components/nilo/InterviewFeedback";
import { EndInterviewConfirmation } from "@/components/nilo/EndInterviewConfirmation";

import { useUser } from "@clerk/clerk-react";
import { useParams } from "react-router-dom";

const AIInterview = () => {
    const { user } = useUser();
    const { type } = useParams<{ type?: string }>();
    const interviewType: "hr" | "technical" = type === "technical" ? "technical" : "hr";
    const {
        setResumeText,
        interviewStarted,
        isResumeSubmitting,
        interviewEnded,
        isRecording,
        isMicMuted,
        toggleMicMute,
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

    const [hasStarted, setHasStarted] = useState(false);
    const [showAudioTip, setShowAudioTip] = useState(true);
    const [questionNum, setQuestionNum] = useState(0);

    useEffect(() => {
        if (textToSpeak) setQuestionNum(prev => prev + 1);
    }, [textToSpeak]);

    const statusConfig: Record<string, { label: string; pill: string; dot: string }> = {
        idle:       { label: "Your turn",      pill: "bg-stone-100 text-stone-500 border-stone-200",    dot: "bg-stone-400" },
        listening:  { label: "Listening...",   pill: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500 animate-pulse" },
        processing: { label: "Thinking...",    pill: "bg-amber-50 text-amber-600 border-amber-200",     dot: "bg-amber-400" },
        speaking:   { label: "AI is speaking", pill: "bg-sky-50 text-sky-600 border-sky-200",           dot: "bg-sky-500" },
    };
    const currentStatus = statusConfig[status] || statusConfig.idle;

    const handleStartSession = () => {
        // Create an empty AudioContext to unlock the browser engine immediately on click
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        ctx.resume().then(() => {
            ctx.close(); // Just warming it up / validating gesture
            setHasStarted(true);
        });
    };

    return (
        <>
            {/* Japandi Background */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-[#fcfcf9] overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-stone-50 to-transparent opacity-60"></div>
            </div>

            {interviewEnded ? (
                <InterviewFeedback feedback={feedback} />
            ) : isEnding ? (
                <PageWrapper>
                    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 animate-fade-in">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-stone-100 border-t-stone-800 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl grayscale opacity-80">🤖</span>
                            </div>
                        </div>
                        <div className="text-center space-y-3">
                            <h2 className="text-3xl font-serif text-stone-800">Generating Your Feedback...</h2>
                            <p className="text-stone-500 font-light">Analysing your improved responses and generating a report.</p>
                            <p className="text-xs text-stone-400 animate-pulse tracking-widest uppercase">This might take a few seconds</p>
                        </div>
                    </div>
                </PageWrapper>
            ) : (
                <PageWrapper>
                    {!interviewStarted ? (
                        <ResumeCollection
                            onSubmit={(text) => startInterview(text, user?.id, interviewType)}
                            onUpload={uploadResumeToS3}
                            isSubmitting={isResumeSubmitting}
                            interviewType={interviewType}
                        />
                    ) : !hasStarted ? (
                        /* --- GET READY SCREEN --- */
                        <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in-95 duration-500 px-4">
                            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-stone-200 max-w-md w-full text-center space-y-7 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-400 to-rose-600" />

                                {/* Type badge */}
                                <div className="flex justify-center pt-2">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border",
                                        interviewType === "technical"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-rose-50 text-rose-700 border-rose-200"
                                    )}>
                                        <span className={cn("w-1.5 h-1.5 rounded-full", interviewType === "technical" ? "bg-emerald-500" : "bg-rose-500")} />
                                        {interviewType === "technical" ? "Technical Interview" : "HR Interview"}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-serif text-stone-800">Your Interviewer is Ready</h2>
                                    <p className="text-stone-400 text-sm font-light">Resume reviewed. First question prepared.</p>
                                </div>

                                {/* Tips */}
                                <div className="bg-stone-50 rounded-2xl p-5 text-left space-y-3 border border-stone-100">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Quick tips</p>
                                    {[
                                        interviewType === "hr" ? "Use the STAR method for behavioral answers" : "Think aloud — explain your reasoning",
                                        "Speak clearly; the mic transcribes your voice",
                                        "Use earphones to prevent echo",
                                    ].map((tip, i) => (
                                        <div key={i} className="flex items-start gap-2.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                                            <p className="text-stone-600 text-sm leading-relaxed">{tip}</p>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleStartSession}
                                    className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold text-lg hover:bg-stone-800 hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>Begin Interview</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* --- MAIN INTERVIEW UI --- */
                        <div className="flex flex-col items-center min-h-[calc(100vh-100px)] pt-6 pb-12 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Earphone Recommendation Banner */}
                            {showAudioTip && (
                                <div className="w-full max-w-4xl px-4 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                </svg>
                                            </div>
                                            <p className="flex-1 text-xs text-stone-500 leading-relaxed">
                                                <span className="font-semibold text-stone-700">Tip:</span> Use earphones to prevent echo and ensure clear audio capture.
                                            </p>
                                            <button
                                                onClick={() => setShowAudioTip(false)}
                                                className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-stone-300 hover:text-stone-500 transition-colors rounded-full hover:bg-stone-100"
                                                title="Dismiss"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="w-full max-w-4xl px-4 mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Live Interview</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-sm font-bold border transition-colors",
                                        timeLeft < 300 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-white text-stone-600 border-stone-200"
                                    )}>
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatTime(timeLeft)}
                                    </div>
                                    <button
                                        onClick={handleEndClick}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-full font-bold transition-all border border-transparent"
                                        title="End Interview"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span className="text-xs uppercase tracking-wide">End</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4">

                                {/* LEFT: Avatar */}
                                <div className="relative w-full flex flex-col items-center gap-4">
                                    <div className="relative w-full aspect-square flex items-center justify-center">
                                        <div className="absolute inset-0 bg-gradient-to-b from-stone-100 to-white rounded-full blur-3xl -z-10 transform scale-90 opacity-60" />
                                        <VisemeDisplay text={textToSpeak} audioSrc={audioSrc} onAudioEnd={handleAudioEnd} />
                                    </div>
                                    {/* Status pill */}
                                    <div className={cn(
                                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300",
                                        currentStatus.pill
                                    )}>
                                        <span className={cn("w-2 h-2 rounded-full", currentStatus.dot)} />
                                        {currentStatus.label}
                                    </div>
                                </div>

                                {/* RIGHT: Interaction Panel */}
                                <div className="flex flex-col gap-8 w-full max-w-lg mx-auto">

                                    {/* AI Question Display */}
                                    <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className={cn(
                                            "absolute top-0 left-0 w-1 h-full transition-colors duration-500",
                                            status === "speaking" ? "bg-sky-400" : "bg-emerald-500/20 group-hover:bg-emerald-500"
                                        )} />
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Current Question</h3>
                                            {questionNum > 0 && (
                                                <span className="text-xs font-bold text-stone-300 uppercase tracking-widest">
                                                    Q{questionNum}
                                                </span>
                                            )}
                                        </div>
                                        <p key={questionNum} className="text-xl md:text-2xl text-stone-800 font-serif leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            {textToSpeak || "Waiting for question..."}
                                        </p>
                                    </div>

                                    {/* User Input Area */}
                                    <div className="flex flex-col gap-6">
                                        <textarea
                                            ref={textareaRef}
                                            className="w-full min-h-[8rem] p-6 rounded-2xl border border-stone-200 bg-white focus:ring-1 focus:ring-stone-400 focus:border-stone-400 resize-none shadow-sm text-lg text-stone-700 placeholder:text-stone-300 overflow-hidden transition-all duration-200 ease-out"
                                            placeholder="Tap the mic to speak your answer..."
                                            value={userResponse}
                                            onChange={(e) => setUserResponse(e.target.value)}
                                            disabled={status === "processing" || status === "speaking"}
                                        />

                                        {/* Auto-Submit Countdown Banner */}
                                        {autoSubmitCountdown !== null && (
                                            <div className="flex items-center justify-between bg-stone-50 border border-stone-200 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="relative flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-stone-800"></span>
                                                    </span>
                                                    <span className="text-sm font-medium text-stone-700">
                                                        Auto-sending in {autoSubmitCountdown}s...
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={cancelAutoSubmit}
                                                    className="text-xs font-bold text-stone-400 hover:text-stone-900 border-b border-stone-200 hover:border-stone-900 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 text-center">
                                            {/* Mute Button */}
                                            <button
                                                onClick={toggleMicMute}
                                                title={isMicMuted ? "Unmute mic" : "Mute mic"}
                                                className={cn(
                                                    "shrink-0 w-14 h-14 rounded-xl flex items-center justify-center border transition-all",
                                                    isMicMuted
                                                        ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                                                        : "bg-stone-100 border-stone-200 text-stone-500 hover:bg-stone-200"
                                                )}
                                            >
                                                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                            </button>

                                            {/* Speak Button */}
                                            <button
                                                onClick={toggleRecording}
                                                disabled={isMicMuted || status === "processing" || status === "speaking"}
                                                className={cn(
                                                    "flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                                                    isRecording
                                                        ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200"
                                                        : isMicMuted
                                                        ? "bg-stone-100 text-stone-300 border border-stone-200 cursor-not-allowed"
                                                        : "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200",
                                                    (status === "processing" || status === "speaking") && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {isRecording ? "Listening..." : isMicMuted ? "Mic muted" : "Speak Answer"}
                                            </button>

                                            {/* Send Button */}
                                            <button
                                                onClick={() => submitResponse(false)}
                                                disabled={!userResponse.trim() || isRecording || status === "processing"}
                                                className={cn(
                                                    "flex-1 py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2",
                                                    !userResponse.trim() || isRecording || status === "processing"
                                                        ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                                                        : "bg-stone-900 hover:bg-stone-800 hover:shadow-xl hover:-translate-y-0.5"
                                                )}
                                            >
                                                {status === "processing" ? "Processing..." : "Send Answer"}
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
