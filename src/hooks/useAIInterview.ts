import { useState, useRef, useEffect } from "react";

const INTERVIEW_DURATION_SECONDS = 15 * 60; // 15 minutes

// API BASE URL - Adjust based on environment or Vite proxy
// API BASE URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "/api";

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

    const startInterview = async (resume: string | File, userId?: string | null) => {

        setIsResumeSubmitting(true);

        try {
            const formData = new FormData();

            if (typeof resume === 'string') {
                if (!resume.trim()) {
                    setIsResumeSubmitting(false); // Make sure to stop loading
                    return;
                }
                setResumeText(resume);
                formData.append("resume_text", resume);
            } else {
                formData.append("resume_file", resume);
            }

            if (userId) {
                formData.append("user_id", userId);
            }

            const response = await fetch(`${API_BASE_URL}/interview/start`, {
                method: "POST",
                // Content-Type header not set for FormData, browser sets it with boundary
                body: formData
            });

            if (response.status === 403) {
                alert("You have reached your 2-interview limit!");
                setIsResumeSubmitting(false); // Make sure to stop loading
                return;
            }

            if (!response.ok) throw new Error("Failed to start session");

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
            alert("Failed to start AI session. Please try again.");
        } finally {
            setIsResumeSubmitting(false);
        }
    };

    const endInterview = async () => {
        if (timerRef.current) clearInterval(timerRef.current);

        if (sessionId) {
            try {
                await fetch(`${API_BASE_URL}/interview/end`, {
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

    const processAudio = async (audioBlob: Blob) => {
        if (!sessionId) return;

        setIsProcessing(true);
        setStatus("processing");
        try {
            const formData = new FormData();
            formData.append("file", audioBlob, "recording.wav");


            // We pass session_id as query param for simplicity with UploadFile
            const response = await fetch(`${API_BASE_URL}/interview/chat_audio?session_id=${sessionId}`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error("Backend audio processing failed");

            const data = await response.json();

            setTextToSpeak(data.ai_message); // Fallback / Debug

            if (data.audio_content) {
                setAudioSrc(data.audio_content);
                setStatus("speaking");
            } else {
                setStatus("idle");
            }

        } catch (error) {
            console.error("Error processing audio:", error);
            setStatus("idle");
        } finally {
            setIsProcessing(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                await processAudio(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setStatus("listening");
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please ensure permissions are granted.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (mediaRecorderRef.current.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
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
        toggleRecording
    };
};
