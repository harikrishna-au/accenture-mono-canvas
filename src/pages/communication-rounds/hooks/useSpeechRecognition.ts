import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionResult {
    transcript: string;
    isRecording: boolean;
    startRecording: () => void;
    stopRecording: () => void;
    resetTranscript: () => void;
    error: string | null;
}

// The Web Speech API streams audio to the browser vendor's servers (e.g. Google
// for Chrome). It intermittently emits a 'network' error even on a perfectly
// healthy connection. We auto-retry these a couple of times before surfacing
// anything to the user, so a transient hiccup doesn't look like "no internet".
const MAX_NETWORK_RETRIES = 2;

export function useSpeechRecognition(): SpeechRecognitionResult {
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const isMounted = useRef(true);
    const networkRetries = useRef(0);
    const startRef = useRef<(isRetry?: boolean) => void>(() => {});

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

    const startRecording = useCallback((isRetry?: unknown) => {
        // A fresh user-initiated start resets the transient-retry counter.
        // (Only our internal auto-retry passes the literal `true`; callers that
        // bind this to onClick pass an event object, which must NOT count as a retry.)
        if (isRetry !== true) {
            networkRetries.current = 0;
        }
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

            // Got speech back — the service is reachable, so reset retry budget.
            if (finalTranscript || interimTranscript) {
                networkRetries.current = 0;
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

            // Transient 'network' errors are usually the speech service hiccuping,
            // not the user's connection. Silently auto-retry a couple of times.
            if (event.error === 'network' && networkRetries.current < MAX_NETWORK_RETRIES) {
                networkRetries.current += 1;
                console.warn(`Speech 'network' error — auto-retry ${networkRetries.current}/${MAX_NETWORK_RETRIES}`);
                try { recognition.stop(); } catch (e) { /* ignore */ }
                recognitionRef.current = null;
                setTimeout(() => {
                    if (isMounted.current) startRef.current(true);
                }, 600);
                return;
            }

            let errorMessage = `Error: ${event.error}`;
            // Map errors...
            switch (event.error) {
                case 'network':
                    errorMessage = "The speech service dropped briefly. Tap Retry to continue — this is usually a temporary hiccup, not your connection.";
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

    // Keep a stable ref to the latest start fn so the auto-retry inside onerror
    // can re-invoke it without a circular dependency.
    startRef.current = startRecording;

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
        networkRetries.current = 0;
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
