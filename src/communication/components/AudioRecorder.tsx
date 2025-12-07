import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioRecorderProps {
    isRecording: boolean;
    onStart: () => void;
    onStop: () => void;
    onTranscript: (text: string) => void;
    disabled?: boolean;
}

export default function AudioRecorder({ isRecording, onStart, onStop, onTranscript, disabled }: AudioRecorderProps) {
    const recognitionRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                let fullTranscript = '';

                // Iterate over ALL results to rebuild the complete transcript
                for (let i = 0; i < event.results.length; ++i) {
                    fullTranscript += event.results[i][0].transcript;
                }

                onTranscript(fullTranscript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    setError('Microphone access denied.');
                } else {
                    // specific error handling could go here
                }
                // Don't auto-stop on simple no-speech errors to allow user to try again
            };
        } else {
            setError('Browser not supported.');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        if (isRecording && recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setError(null);
            } catch (e) {
                // Recognition already started
            }
        } else if (!isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, [isRecording]);

    if (error) {
        return <div className="text-red-500 text-sm">{error}</div>;
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-neutral-100'}`}>
                {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
                )}
                <Button
                    onClick={isRecording ? onStop : onStart}
                    disabled={disabled}
                    variant="ghost"
                    className={`w-16 h-16 rounded-full p-0 flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}
                >
                    {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
                </Button>
            </div>
            <p className="text-sm font-medium text-neutral-500">
                {isRecording ? 'Tap to Stop & Submit' : disabled ? 'Wait...' : 'Tap to Speak'}
            </p>
        </div>
    );
}
