import { useState, useEffect, useRef } from "react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { cartoonVisemes } from "./cartoonVisemes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Assets
import cartoonAvatarVideo from "@/assets/nilo/AvatarImages/3.png";
import blinkGif from "@/assets/nilo/AvatarImages/blink.gif";

interface VisemeDisplayProps {
    text?: string;
    audioSrc?: string | null;
    onAudioEnd?: () => void;
}

export const VisemeDisplay = ({ text, audioSrc, onAudioEnd }: VisemeDisplayProps) => {
    const [imageIndex, setImageIndex] = useState(0);
    const [shouldBlink, setShouldBlink] = useState(false);
    const [showManualPlay, setShowManualPlay] = useState(false);

    // Mode State: 'azure' (default) or 'fallback' (volume-based)
    const [mode, setMode] = useState<'azure' | 'fallback'>('azure');
    // Track if we've already tried to fallback for this specific text/audio to prevent loops
    const [hasFallenBack, setHasFallenBack] = useState(false);

    // Refs
    // Azure
    const synthesizerRef = useRef<sdk.SpeechSynthesizer | null>(null);

    // Fallback / Volume
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);

    const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Blinking Logic (Common)
    useEffect(() => {
        const triggerBlink = () => {
            setShouldBlink(true);
            setTimeout(() => setShouldBlink(false), 200);
        };

        const startRegularBlinking = () => {
            blinkTimeoutRef.current = setInterval(() => {
                // Don't blink if strictly talking (in either mode, imageIndex > 0 usually means talking)
                // But simplified: just blink randomly
                triggerBlink();
            }, 4000 + Math.random() * 2000);
        };

        startRegularBlinking();

        return () => {
            if (blinkTimeoutRef.current) clearInterval(blinkTimeoutRef.current);
        };
    }, []);

    // 2. Control Logic: Decide Mode & Trigger
    useEffect(() => {
        // cleanup cleanups
        return () => {
            stopAzure();
            stopVolumeAnalysis();
        };
    }, []);

    useEffect(() => {
        if (!text) return;

        // Reset state for new utterance
        setImageIndex(0);
        setShowManualPlay(false);
        setHasFallenBack(false);

        const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
        const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

        if (speechKey && speechRegion && !hasFallenBack) {
            console.log("VisemeDisplay: Attempting Azure TTS...");
            setMode('azure');
            startAzure(text, speechKey, speechRegion);
        } else {
            console.log("VisemeDisplay: Defaulting to Fallback/Volume mode.");
            triggerFallback();
        }

    }, [text, audioSrc]); // Re-run if text changes

    // --- Azure Implementation ---
    const startAzure = (textToSpeak: string, key: string, region: string) => {
        stopVolumeAnalysis(); // Ensure no conflict

        const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
        // We want audio output to default speaker
        const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();

        // Close existing
        if (synthesizerRef.current) {
            try { synthesizerRef.current.close(); } catch (e) { }
        }

        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        synthesizerRef.current = synthesizer;

        synthesizer.visemeReceived = (s, e) => {
            // Azure Viseme Event
            setImageIndex(e.visemeId);
        };

        synthesizer.speakTextAsync(
            textToSpeak,
            (result) => {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    // Success
                    onAudioEnd?.();
                    setImageIndex(0);
                    synthesizer.close();
                    synthesizerRef.current = null;
                } else if (result.reason === sdk.ResultReason.Canceled) {
                    const cancellation = sdk.CancellationDetails.fromResult(result);
                    console.warn("VisemeDisplay: Azure CANCELED.", cancellation.errorDetails);

                    // IF ERROR -> Fallback
                    if (cancellation.reason === sdk.CancellationReason.Error) {
                        toast.error("Azure TTS Failed. Switching to backup audio.");
                        triggerFallback();
                    }
                    synthesizer.close();
                    synthesizerRef.current = null;
                }
            },
            (err) => {
                console.error("VisemeDisplay: Azure Fatal Error", err);
                triggerFallback();
                if (synthesizerRef.current) {
                    synthesizerRef.current.close();
                    synthesizerRef.current = null;
                }
            }
        );
    };

    const stopAzure = () => {
        if (synthesizerRef.current) {
            try { synthesizerRef.current.close(); } catch (e) { }
            synthesizerRef.current = null;
        }
    };

    // --- Fallback / Volume Implementation ---
    const triggerFallback = () => {
        setMode('fallback');
        setHasFallenBack(true);
        // The <audio> element is rendered when mode === 'fallback'
        // We need to trigger its play. 
        // We use a small timeout to let React render the audio element if it wasn't there
        setTimeout(() => {
            if (audioRef.current && audioSrc) {
                audioRef.current.src = `data:audio/mp3;base64,${audioSrc}`;
                const playPromise = audioRef.current.play();

                playPromise
                    .then(() => {
                        // Play started
                        initAudioContext();
                        animateVolume();
                    })
                    .catch(e => {
                        console.warn("Fallback autoplay blocked:", e);
                        setShowManualPlay(true);
                    });
            } else if (!audioSrc) {
                console.warn("Fallback triggered but no audioSrc provided!");
            }
        }, 50);
    };

    const handleManualPlay = () => {
        if (audioRef.current) {
            audioRef.current.play()
                .then(() => {
                    setShowManualPlay(false);
                    initAudioContext();
                    animateVolume();
                })
                .catch(e => console.error("Manual play failed:", e));
        }
    };

    const initAudioContext = () => {
        if (!audioRef.current || audioContextRef.current) return;

        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        analyserRef.current = audioContextRef.current!.createAnalyser();
        analyserRef.current.fftSize = 256;

        try {
            sourceRef.current = audioContextRef.current!.createMediaElementSource(audioRef.current);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current!.destination);
        } catch (e) {
            // Often source already exists error if re-initialized
            console.log("Audio Context Source Attach:", e);
        }
    };

    const animateVolume = () => {
        if (mode !== 'fallback') return; // Stop if we switched back (unlikely)

        if (!analyserRef.current || !audioRef.current || audioRef.current.paused) {
            if (audioRef.current?.paused) setImageIndex(0);
            return; // Stop loop if paused
        }

        const currentTime = Date.now();
        if (currentTime - lastUpdateTimeRef.current >= 50) { // 20fps update for visemes
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const average = sum / bufferLength;

            if (average > 10) {
                // Open mouth based on volume intensity
                // Cartoon visemes 1-21. Let's pick a few "open" ones randomly or strictly
                // Simple random for "talking" feel
                const randomViseme = Math.floor(Math.random() * 15) + 1;
                setImageIndex(randomViseme);
            } else {
                setImageIndex(0);
            }
            lastUpdateTimeRef.current = currentTime;
        }

        animationFrameRef.current = requestAnimationFrame(animateVolume);
    };

    const stopVolumeAnalysis = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
    };

    const handleFallbackEnded = () => {
        stopVolumeAnalysis();
        setImageIndex(0);
        onAudioEnd?.();
    };


    return (
        <div className="w-full h-full flex items-center justify-center p-4">

            {/* Fallback Audio Element - Rendered always or conditional? 
                Better to always have it but control it via refs/mode 
            */}
            <audio
                ref={audioRef}
                className="hidden"
                crossOrigin="anonymous"
                onEnded={handleFallbackEnded}
                onPause={() => setImageIndex(0)}
                onPlay={() => {
                    initAudioContext();
                    animateVolume();
                }}
            />

            <div className="relative w-full max-w-[600px] aspect-square bg-transparent">
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Base layer */}
                    <img
                        src={cartoonAvatarVideo}
                        alt="Base Avatar"
                        className="w-full h-full object-contain relative z-10"
                    />

                    {/* Blink overlay */}
                    <img
                        src={blinkGif}
                        alt="Blinking"
                        className={cn(
                            "absolute top-0 left-0 w-full h-full object-contain z-20 transition-opacity duration-100",
                            shouldBlink ? "opacity-100" : "opacity-0"
                        )}
                    />

                    {/* Viseme overlay */}
                    <img
                        src={cartoonVisemes[imageIndex] || cartoonVisemes[0]}
                        alt="Viseme"
                        className={cn(
                            "absolute top-[47%] left-[49%] -translate-x-1/2 -translate-y-1/2 h-auto z-30 transition-transform duration-100",
                            "w-[30%] sm:w-[28%] md:w-[25%] lg:w-[20%] xl:w-[18%]"
                        )}
                    />

                    {/* Manual Play Button (Only for Fallback Mode when Blocked) */}
                    {mode === 'fallback' && showManualPlay && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-full">
                            <button
                                onClick={handleManualPlay}
                                className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold shadow-lg animate-bounce transition-transform transform hover:scale-105"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Tap to Speak
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
