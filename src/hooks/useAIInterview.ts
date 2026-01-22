import { useState, useRef, useEffect } from "react";

const INTERVIEW_DURATION_SECONDS = 15 * 60; // 15 minutes

// API BASE URL - Adjust based on environment or Vite proxy
// API BASE URL
const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || "/api").replace(/\/$/, "");

export const useAIInterview = () => {
    // Session State
    const [resumeText, setResumeText] = useState("");
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [isResumeSubmitting, setIsResumeSubmitting] = useState(false);
    const [interviewEnded, setInterviewEnded] = useState(false);

    // Interview State
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [textToSpeak, setTextToSpeak] = useState("");
    const [status, setStatus] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
    const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION_SECONDS);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer Logic
    useEffect(() => {
        if (interviewStarted && !interviewEnded && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        endInterview(); // Auto-end logic
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [interviewStarted, interviewEnded]);

    const uploadResumeToS3 = async (file: File): Promise<void> => {
        try {
            // 1. Get Presigned URL
            const urlResponse = await fetch(`${API_BASE_URL}/api/resume/upload-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: file.name })
            });

            if (!urlResponse.ok) throw new Error("Failed to get upload URL");
            const { url, fields } = await urlResponse.json();

            // 2. Upload to S3
            const formData = new FormData();
            Object.entries(fields).forEach(([key, value]) => {
                formData.append(key, value as string);
            });
            formData.append("file", file);

            const uploadResponse = await fetch(url, {
                method: "POST",
                body: formData
            });

            if (!uploadResponse.ok) throw new Error("S3 Upload Failed");

        } catch (error) {
            console.error("Resume Upload Error:", error);
            throw error;
        }
    };

    const startInterview = async (resume: string, userId?: string | null) => {

        setIsResumeSubmitting(true);

        try {
            const formData = new FormData();
            // Always text now
            formData.append("resume_text", resume);

            if (userId) {
                formData.append("user_id", userId);
            }

            const response = await fetch(`${API_BASE_URL}/api/interview/start`, {
                method: "POST",
                // Content-Type header not set for FormData, browser sets it with boundary
                body: formData
            });

            if (response.status === 403) {
                alert("You have reached your 2-interview limit!");
                setIsResumeSubmitting(false); // Make sure to stop loading
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Unknown Start Error" }));
                console.error("Start Interview Error Details:", errorData);
                throw new Error(errorData.detail || "Failed to start session");
            }

            const data = await response.json();

            setSessionId(data.session_id);
            setInterviewStarted(true);
            setTextToSpeak(data.ai_message);

            // Play Audio
            if (data.audio_content) {
                setAudioSrc(data.audio_content);
                setStatus("speaking");
            }

        } catch (error) {
            console.error("Error starting interview:", error);
            alert(`Failed to start AI session: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsResumeSubmitting(false);
        }
    };

    const endInterview = async () => {
        if (timerRef.current) clearInterval(timerRef.current);

        if (sessionId) {
            try {
                await fetch(`${API_BASE_URL}/api/interview/end`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ session_id: sessionId })
                });
            } catch (e) {
                console.error("Error ending session:", e);
            }
        }

        setInterviewEnded(true);
        setStatus("idle");
        stopRecording();
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    // Text-based processing (replaces processAudio)
    const processText = async (text: string) => {
        if (!sessionId || !text.trim()) return;

        setIsProcessing(true);
        setStatus("processing");
        try {
            const response = await fetch(`${API_BASE_URL}/api/interview/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    user_text: text
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Unknown Backend Error" }));
                console.error("Chat Error Details:", errorData);
                throw new Error(errorData.detail || "Backend chat processing failed");
            }

            const data = await response.json();

            setTextToSpeak(data.ai_message);

            if (data.audio_content) {
                setAudioSrc(data.audio_content);
                setStatus("speaking");
            } else {
                setStatus("idle");
            }

        } catch (error) {
            console.error("Error processing chat:", error);
            setStatus("idle");
            alert(`Chat Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const startRecording = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Your browser does not support Speech Recognition. Please use Chrome or Safari.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsRecording(true);
            setStatus("listening");
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log("Transcript captured:", transcript);
            // Auto-send on result
            processText(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech Recognition Error:", event.error);
            setIsRecording(false);
            setStatus("idle");
            if (event.error === 'not-allowed') {
                alert("Microphone access denied. Please allow microphone access.");
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
            setStatus((prev) => {
                if (prev === "listening") return "idle";
                return prev;
            });
        };

        // Store in ref to stop if needed (though onresult usually handles it)
        (mediaRecorderRef.current as any) = recognition;
        recognition.start();
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            // It's actually a recognition instance now
            try {
                (mediaRecorderRef.current as any).stop();
            } catch (e) {
                console.error("Error stopping recognition:", e);
            }
            // setIsRecording(false) will be handled by onend
        }
    };

    return {
        resumeText,
        setResumeText,
        interviewStarted,
        isResumeSubmitting,
        interviewEnded,
        isRecording,
        isProcessing,
        textToSpeak,
        audioSrc,
        status,
        timeLeft,
        startInterview,
        endInterview,
        toggleRecording,
        uploadResumeToS3
    };
};
