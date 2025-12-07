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
        <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-6">
                {/* Recording Status / Start Button */}
                <div className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-50' : 'bg-neutral-100'}`}>
                    {isRecording && (
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-20 animate-ping"></span>
                    )}

                    <Button
                        onClick={isRecording ? undefined : onStart}
                        disabled={isRecording || disabled}
                        variant="ghost"
                        title={isRecording ? "Recording in progress..." : "Start Recording"}
                        className={`relative z-10 w-16 h-16 rounded-full p-0 flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white cursor-default' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}
                    >
                        <Mic className={`w-7 h-7 ${isRecording ? 'animate-pulse' : ''}`} />
                    </Button>
                </div>

                {/* Dedicated Stop Button - Slides in when recording */}
                {isRecording && (
                    <div className="flex flex-col items-center gap-2 animate-fade-in">
                        <Button
                            onClick={onStop}
                            className="w-16 h-16 rounded-full bg-white border-2 border-neutral-200 text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                            title="Stop and Submit"
                        >
                            <Square className="w-6 h-6 fill-neutral-900" />
                        </Button>
                    </div>
                )}
            </div>

            <p className="text-sm font-medium text-neutral-500 min-h-[20px] text-center">
                {isRecording ? 'Listening... Tap Stop to submit.' : disabled ? 'Initializing...' : 'Tap the microphone to start'}
            </p>
        </div>
    );
}
