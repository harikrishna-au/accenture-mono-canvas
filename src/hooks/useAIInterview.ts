import { useState, useRef, useEffect, useCallback } from "react";

const INTERVIEW_DURATION_SECONDS = 10 * 60; // 10 minutes

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
    const [feedback, setFeedback] = useState<any>(null); // Store detailed feedback

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);



    const uploadResumeToS3 = async (file: File): Promise<void> => {
        try {
            // 1. Get Presigned URL
            const urlResponse = await fetch(`${API_BASE_URL}/api/resume/upload-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: file.name })
            });

            if (!urlResponse.ok) throw new Error("Failed to get upload URL");

            const data = await urlResponse.json();

            if (!data.fields) {
                console.error("Upload configuration missing from backend:", data);
                throw new Error(data.error || "Resume storage is not configured on the server.");
            }

            const { url, fields } = data;

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

    const requestMicPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop tracks immediately after permission check to release mic
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error("Mic permission denied:", error);
            alert("Microphone access is required for the interview. Please allow access.");
            return false;
        }
    };

    const startInterview = async (resume: string, userId?: string | null) => {

        // Request Mic immediately
        const hasMic = await requestMicPermission();
        if (!hasMic) return;

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

    const [isEnding, setIsEnding] = useState(false);

    const endInterview = useCallback(async () => {
        if (timerRef.current) clearInterval(timerRef.current);

        setIsEnding(true);

        if (sessionId) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/interview/end`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ session_id: sessionId })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.feedback) {
                        // Robust check: Ensure feedback is nested as expected by component
                        if (data.feedback.feedback) {
                            setFeedback(data.feedback);
                        } else {
                            // Wrap flat feedback in expected structure
                            setFeedback({ feedback: data.feedback });
                        }
                    }
                }
            } catch (e) {
                console.error("Error ending session:", e);
            }
        }

        setInterviewEnded(true);
        setStatus("idle");
        setIsEnding(false);
        stopRecording();
    }, [sessionId]);

    // Timer Logic - Must be after endInterview definition
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
    }, [interviewStarted, interviewEnded, endInterview]);

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
            } else if (data.status === "completed") {
                setStatus("idle");
                setInterviewEnded(true);
                if (data.feedback) {
                    setFeedback(data.feedback);
                }
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

    // User Interaction State
    const [userResponse, _setUserResponse] = useState("");
    const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const baseTextRef = useRef(""); // Snapshot of text before current recording session

    // Wrapper to ensure we cancel timer on manual edit
    const setUserResponse = (val: string) => {
        cancelAutoSubmit();
        _setUserResponse(val);
    };

    const cancelAutoSubmit = () => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        setAutoSubmitCountdown(null);
    };

    const startRecording = () => {
        cancelAutoSubmit(); // Cancel any existing countdown

        // Snapshot current text so we append to it
        baseTextRef.current = userResponse;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Your browser does not support Speech Recognition. Please use Chrome or Safari.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true; // Changed to true to show live text
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsRecording(true);
            setStatus("listening");
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log("Transcript captured:", transcript);
            // Update state directly (we don't want to cancel inside onresult loop repeatedly, wait, actually we do want to ensure no timer)
            cancelAutoSubmit();

            // Append new transcript to the base text
            const prefix = baseTextRef.current.trim() ? " " : "";
            _setUserResponse(baseTextRef.current + prefix + transcript);
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

            // Start Auto-Submit Timer if we have text
            // Access ref-less state might be stale in closure? No, onend runs after updates.
            // But strict closure might capture old userResponse.
            // Use a ref for userResponse if needed, OR just trust we set it in onresult.
            // Actually, we can't read userResponse state reliably here if it just updated.
            // Workaround: We know we just finished speaking.
            // Let's rely on the fact userResponse IS updated.
            // However, inside onend, `userResponse` might be stale.
            // Let's safely start the timer anyway, and check length in the tick?
            // Or better, checking `_setUserResponse` in `onresult` ensures state update.

            // To be safe, we start the timer. If userResponse is empty, submitting does nothing anyway (submitResponse checks trim).
            startAutoSubmitCountdown();
        };

        // Store in ref to stop if needed (though onresult usually handles it)
        (mediaRecorderRef.current as any) = recognition;
        recognition.start();
    };

    const startAutoSubmitCountdown = () => {
        // Clear old
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        // Start at 5
        let count = 5;
        setAutoSubmitCountdown(count);

        countdownIntervalRef.current = setInterval(() => {
            count--;
            if (count <= 0) {
                // Time's up
                clearInterval(countdownIntervalRef.current!);
                setAutoSubmitCountdown(null);
                submitResponse(true); // Pass flag to bypass stale state check if needed?
            } else {
                setAutoSubmitCountdown(count);
            }
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            try {
                (mediaRecorderRef.current as any).stop();
            } catch (e) {
                console.error("Error stopping recognition:", e);
            }
        }
    };

    // Ref to access latest response in timer callback
    const userResponseRef = useRef(userResponse);
    useEffect(() => { userResponseRef.current = userResponse; }, [userResponse]);

    const submitResponse = async (fromTimer = false) => {
        cancelAutoSubmit(); // Stop timer if manual click

        const text = fromTimer ? userResponseRef.current : userResponse;
        if (!text.trim()) return;

        await processText(text);

        // Clearing
        _setUserResponse("");
    };

    const handleAudioEnd = () => {
        setStatus("idle");
        // Auto-start recording as requested
        startRecording();
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
        uploadResumeToS3,
        userResponse,       // Exposed
        setUserResponse,    // Exposed
        submitResponse,      // Exposed
        handleAudioEnd, // Exposed
        autoSubmitCountdown,
        cancelAutoSubmit,
        feedback,
        isEnding
    };
};
