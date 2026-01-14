import { useState, useEffect, useRef, useCallback } from 'react';

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
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            // Cleanup on unmount
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore
                }
                recognitionRef.current = null; // Ensure ref is cleared on unmount
            }
        };
    }, []);

    const startRecording = useCallback(() => {
        // Check browser support dynamically or cached
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition not supported in this browser. Please use Chrome or Safari.');
            return;
        }

        // If a recognition instance is already active, stop it first to ensure a fresh start
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Ignore errors if already stopped or not started
            }
            recognitionRef.current = null;
        }

        // Always create a fresh instance to avoid stale state in long-running sessions
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            if (!isMounted.current) return;

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
            if (!isMounted.current) return;
            console.warn('Speech recognition error event:', event.error);

            if (event.error === 'no-speech') {
                return;
            }

            if (event.error === 'aborted') {
                setIsRecording(false);
                recognitionRef.current = null; // Clear ref on explicit abort
                return;
            }

            let errorMessage = `Error: ${event.error}`;
            // Map errors...
            switch (event.error) {
                case 'network':
                    errorMessage = "Network connection failed. Please check your internet.";
                    break;
                case 'not-allowed':
                case 'service-not-allowed':
                    errorMessage = "Microphone access denied. Please verify browser permissions.";
                    break;
                case 'audio-capture':
                    errorMessage = "No microphone detected.";
                    break;
            }

            setError(errorMessage);
            setIsRecording(false);
            recognitionRef.current = null; // Clear ref on error
        };

        recognition.onend = () => {
            if (isMounted.current) {
                setIsRecording(false);
                // Don't nullify ref immediately if we want to restart? 
                // Actually for fresh-instance strategy, we should nullify.
                // But if it ended due to silence and we wanted continuous... 
                // For now, let's treat onend as 'stopped'.
                recognitionRef.current = null; // Clear ref when recognition session ends
            }
        };

        recognitionRef.current = recognition;
        setError(null);
        setTranscript('');

        try {
            recognition.start();
            setIsRecording(true);
        } catch (err: any) {
            console.error('Failed to start recording:', err);
            setError('Could not start recording. Please try again.');
            setIsRecording(false);
            recognitionRef.current = null;
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (err) {
                // Ignore
            }
            // We rely on onend to set isRecording(false), but force it just in case
            // actually onend is reliable enough, but strictly:
            // recognitionRef.current = null; // Wait for onend to cleanup
        }
        setIsRecording(false);
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setError(null);
    }, []);

    return {
        transcript,
        isRecording,
        startRecording,
        stopRecording,
        resetTranscript,
        error
    };
}
