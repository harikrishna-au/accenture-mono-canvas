import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Volume2, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
    text: string;
    voiceType?: string;
    onPlayComplete?: () => void;
    playOnce?: boolean;
}

export function AudioPlayer({ text, voiceType = 'male_1', onPlayComplete, playOnce = true }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [useFallback, setUseFallback] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const fetchAudio = async () => {
        setIsLoading(true);

        try {
            // Use environment variable for backend URL
            const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');
            const response = await fetch(`${backendUrl}/api/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice_type: voiceType })
            });

            if (response.ok) {
                const blob = await response.blob();
                console.log("TTS Audio Blob received:", blob.type, blob.size, "bytes");
                if (blob.size < 100) {
                    console.warn("TTS Audio Blob is suspiciously small, likely text error response masquerading as 200 OK");
                }
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setUseFallback(false);
            } else {
                console.warn('Backend TTS failed, using browser fallback');
                setUseFallback(true);
            }
        } catch (error) {
            console.warn('Cannot connect to TTS service, using browser fallback:', error);
            setUseFallback(true);
        } finally {
            setIsLoading(false);
        }
    };

    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            const available = window.speechSynthesis.getVoices();
            setVoices(available);
        };

        loadVoices();

        // Safari loads voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    useEffect(() => {
        // Reset state when text changes (new question)
        setHasPlayed(false);
        setIsPlaying(false);
        setAudioUrl(null);
        setUseFallback(false);

        if (text) {
            fetchAudio();
        }

        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [text, voiceType]);

    const playWithBrowserTTS = () => {
        if (!window.speechSynthesis) {
            console.error('Browser does not support speech synthesis');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to match voice type
        // Use loaded voices from state, or fallback to direct call if state empty
        const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();

        if (voiceType.includes('female')) {
            const femaleVoice = availableVoices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google US English'));
            if (femaleVoice) utterance.voice = femaleVoice;
        } else {
            const maleVoice = availableVoices.find(v => v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Alex') || v.name.includes('Google UK English Male'));
            if (maleVoice) utterance.voice = maleVoice;
        }

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => {
            setIsPlaying(false);
            if (playOnce) {
                setHasPlayed(true);
            }
            onPlayComplete?.();
        };

        window.speechSynthesis.speak(utterance);
    };

    const handlePlay = () => {
        if (playOnce && hasPlayed) return;

        if (useFallback || !audioUrl) {
            // Use browser's built-in speech synthesis
            playWithBrowserTTS();
        } else {
            // Use backend audio
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onplay = () => setIsPlaying(true);
            audio.onended = () => {
                setIsPlaying(false);
                if (playOnce) {
                    setHasPlayed(true);
                }
                onPlayComplete?.();
            };

            audio.play().catch(e => {
                console.error("Audio playback interrupted/failed:", e);
                setIsPlaying(false);
                // Try fallback if play fails (e.g., format not supported)
                playWithBrowserTTS();
            });
        }
    };

    // Button is only disabled when playing or already played (if playOnce is true)
    // NOT disabled when loading - it will use fallback if backend fails
    const isDisabled = isPlaying || (playOnce && hasPlayed);

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Play Button */}
            <Button
                onClick={handlePlay}
                disabled={isDisabled}
                size="lg"
                className={`h-16 px-8 rounded-full ${isPlaying
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : (playOnce && hasPlayed)
                        ? 'bg-neutral-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                        Loading Audio...
                    </>
                ) : isPlaying ? (
                    <>
                        <Volume2 className="w-6 h-6 mr-2 animate-pulse" />
                        Playing...
                    </>
                ) : (playOnce && hasPlayed) ? (
                    <>
                        <Play className="w-6 h-6 mr-2 opacity-50" />
                        Played
                    </>
                ) : (
                    <>
                        <Play className="w-6 h-6 mr-2" />
                        Play Audio
                    </>
                )}
            </Button>

            {/* Info message if using fallback */}
            {useFallback && !isPlaying && !hasPlayed && (
                <p className="text-xs text-neutral-500">
                    Using browser voice (backend unavailable)
                </p>
            )}
        </div>
    );
}
