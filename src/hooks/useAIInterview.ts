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

    const processAudio = async (audioBlob: Blob, extension: string = "wav") => {
        if (!sessionId) return;

        setIsProcessing(true);
        setStatus("processing");
        try {
            const formData = new FormData();
            formData.append("file", audioBlob, `recording.${extension}`);


            // We pass session_id as query param for simplicity with UploadFile
            const response = await fetch(`${API_BASE_URL}/api/interview/chat_audio?session_id=${sessionId}`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Unknown Backend Error" }));
                console.error("Audio Processing Error Details:", errorData);
                throw new Error(errorData.detail || "Backend audio processing failed");
            }

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

            // Detect supported mime type
            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/webm')) {
                mimeType = 'audio/webm';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4'; // Safari
            } else if (MediaRecorder.isTypeSupported('audio/aac')) {
                mimeType = 'audio/aac';
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
                mimeType = 'audio/ogg';
            }

            console.log("Using MIME type:", mimeType);

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                // Determine extension based on mimeType
                let extension = 'webm';
                if (mimeType.includes('mp4')) extension = 'mp4';
                else if (mimeType.includes('aac')) extension = 'aac';
                else if (mimeType.includes('ogg')) extension = 'ogg';
                else if (mimeType.includes('wav')) extension = 'wav';

                const audioBlob = new Blob(chunksRef.current, { type: mimeType });

                // Pass extension to processAudio
                await processAudio(audioBlob, extension);
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
        toggleRecording,
        uploadResumeToS3
    };
};
