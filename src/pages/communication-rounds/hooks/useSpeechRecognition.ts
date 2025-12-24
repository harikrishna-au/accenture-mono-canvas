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
                    errorMessage = "No speech detected. Please try again and speak clearly.";
                    break;
                case 'audio-capture':
                    errorMessage = "No microphone found. Ensure your microphone is plugged in and set up correctly.";
                    break;
                case 'aborted':
                    errorMessage = "Speech recognition stopped. Please click Record to try again.";
                    break;
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

        try {
            recognitionRef.current.start();
        } catch (err) {
            console.error('Failed to start recording:', err);
            setError('Failed to start recording');
            setIsRecording(false);
        }
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
