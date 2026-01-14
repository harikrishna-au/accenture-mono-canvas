import { useState, useEffect, useRef } from 'react';

interface SpeechRecognitionResult {
    transcript: string;
    isRecording: boolean;
    startRecording: () => void;
    stopRecording: () => void;
    resetTranscript: () => void;
    error: string | null;
}

export function useSpeechRecognition(): SpeechRecognitionResult {
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check if browser supports Speech Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('Speech recognition not supported in this browser');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptPiece = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcriptPiece + ' ';
                } else {
                    interimTranscript += transcriptPiece;
                }
            }

            setTranscript(finalTranscript || interimTranscript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            let errorMessage = `Recognition error: ${event.error}`;

            switch (event.error) {
                case 'network':
                    errorMessage = "Network error. Please check your internet connection. Note: Speech recognition requires HTTPS.";
                    break;
                case 'not-allowed':
                case 'service-not-allowed':
                    errorMessage = "Microphone access denied. Please allow microphone permissions in your browser settings.";
                    break;
                case 'no-speech':
                    // Silently stop recording without error
                    setIsRecording(false);
                    return;
                case 'audio-capture':
                    errorMessage = "No microphone found. Ensure your microphone is plugged in and set up correctly.";
                    break;
                case 'aborted':
                    // Silently stop recording without error
                    setIsRecording(false);
                    return;
                default:
                    errorMessage = `Error occurred: ${event.error}`;
            }

            setError(errorMessage);
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startRecording = () => {
        if (!recognitionRef.current) {
            setError('Speech recognition not initialized');
            return;
        }

        setTranscript('');
        setError(null);
        setIsRecording(true);

        const attemptStart = (retryCount = 0) => {
            try {
                if (recognitionRef.current && isRecording) {
                    console.warn("Recognition already started, ignoring start request.");
                    return;
                }
                recognitionRef.current.start();
            } catch (err: any) {
                // If it's an abort or invalid state, it might be due to quick toggling
                // Retry once after a short delay
                if (retryCount < 1) {
                    console.log('Failed to start, retrying...', err);
                    setTimeout(() => attemptStart(retryCount + 1), 150);
                    return;
                }

                if (err.name === 'InvalidStateError' || err.message?.includes('already started')) {
                    console.warn("Ignored InvalidStateError: Recognition was already active.");
                    // Ensure state stays consistent
                    setIsRecording(true);
                } else {
                    console.error('Failed to start recording:', err);
                    // Include the specific error message for debugging
                    setError(`Failed to start recording: ${err.message || err.name || 'Unknown error'}`);
                    setIsRecording(false);
                }
            }
        };

        attemptStart();
    };

    const stopRecording = () => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    const resetTranscript = () => {
        setTranscript('');
    };

    return {
        transcript,
        isRecording,
        startRecording,
        stopRecording,
        resetTranscript,
        error
    };
}
