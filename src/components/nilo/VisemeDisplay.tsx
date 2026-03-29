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

    // Refs
    const synthesizerRef = useRef<sdk.SpeechSynthesizer | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);
    const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Blinking Logic
    useEffect(() => {
        const triggerBlink = () => {
            setShouldBlink(true);
            setTimeout(() => setShouldBlink(false), 200);
        };
        const startRegularBlinking = () => {
            blinkTimeoutRef.current = setInterval(() => {
                triggerBlink();
            }, 4000 + Math.random() * 2000);
        };
        startRegularBlinking();
        return () => {
            if (blinkTimeoutRef.current) clearInterval(blinkTimeoutRef.current);
        };
    }, []);

    // 2. Main Effect: Play Audio & Try Visemes
    useEffect(() => {
        if (!audioSrc) return;

        setImageIndex(0);
        setShowManualPlay(false);

        // A. Setup Audio Element (Primary Audio Source)
        if (audioRef.current) {
            audioRef.current.src = `data:audio/mp3;base64,${audioSrc}`;
            try {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            // Init Analyzer for "Volume-Based" movement (Fallback Visuals)
                            initAudioContext();
                            animateVolume();

                            // B. Try Azure for "Better Visuals" (Parallel)
                            // If Azure works, it will override the volume-based animation
                            if (text) startAzureVisemesOnly(text);
                        })
                        .catch(e => {
                            console.warn("VisemeDisplay: Autoplay blocked.", e);
                            setShowManualPlay(true);
                        });
                }
            } catch (e) {
                console.error("Audio Play Error:", e);
                setShowManualPlay(true);
            }
        }
    }, [audioSrc, text]);


    // --- Azure Logic (Visuals ONLY) ---
    // We do NOT use Azure for audio output anymore. We only ask for "Visemes" (lip shapes).
    // This removes the dependency on Azure for hearing sound.
    const startAzureVisemesOnly = (textToSpeak: string) => {
        const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
        const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

        if (!speechKey || !speechRegion) return;

        try {
            const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
            // MUTE Azure Audio (Simulated by null output or synthesized to stream)
            // Ideally we just want the events. 
            // Setting output to null isn't officially supported to "mute", but we can ignore the audio.
            // Using a "PullStream" to capture audio prevents it from playing on speakers.
            const audioConfig = sdk.AudioConfig.fromStreamOutput(sdk.AudioOutputStream.createPullStream());

            if (synthesizerRef.current) {
                try { synthesizerRef.current.close(); } catch (e) { }
            }

            const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
            synthesizerRef.current = synthesizer;

            synthesizer.visemeReceived = (s, e) => {
                if (e.visemeId > 0) {
                    // Override volume animation with precise viseme
                    // However, timing might be off relative to our MP3 playback.
                    // A safer bet for "Hybrid" is: If Azure is connected, we use it.
                    // But syncing two independent streams (MP3 vs Azure TTS) is hard.
                    // 
                    // STRATEGY CHANGE: 
                    // Since Azure is failing/hanging for you, let's stick to 100% Volume Analysis for now.
                    // It is robust. The code below is disabled to ensure STABILITY.
                    // Uncomment to try Azure mixing again later.
                    // setImageIndex(e.visemeId); 
                }
            };

            // Intentionally NOT calling speakTextAsync to avoid network hang risk unless trusted.
            // For now, we rely on the MP3 playback we know works.
        } catch (e) {
            console.warn("Azure Init Error:", e);
        }
    };


    // --- Volume Analysis Implementation ---
    const initAudioContext = () => {
        if (!audioRef.current) return;

        if (!audioContextRef.current) {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass();
            analyserRef.current = audioContextRef.current!.createAnalyser();
            analyserRef.current.fftSize = 256;
        }

        if (!sourceRef.current && audioContextRef.current && analyserRef.current) {
            try {
                sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
                sourceRef.current.connect(analyserRef.current);
                analyserRef.current.connect(audioContextRef.current.destination);
            } catch (e) {
                console.warn("Source attach error:", e);
            }
        }

        // Resume if suspended
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const animateVolume = () => {
        if (!analyserRef.current || !audioRef.current || audioRef.current.paused) {
            if (audioRef.current?.paused) setImageIndex(0);
            return;
        }

        const currentTime = Date.now();
        if (currentTime - lastUpdateTimeRef.current >= 50) {
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const average = sum / bufferLength;

            if (average > 10) {
                const randomViseme = Math.floor(Math.random() * 15) + 1;
                setImageIndex(randomViseme);
            } else {
                setImageIndex(0);
            }
            lastUpdateTimeRef.current = currentTime;
        }

        animationFrameRef.current = requestAnimationFrame(animateVolume);
    };

    const handleManualPlay = () => {
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }
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

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <audio
                ref={audioRef}
                className="hidden"
                crossOrigin="anonymous"
                onEnded={() => {
                    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                    setImageIndex(0);
                    onAudioEnd?.();
                }}
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

                    {/* Manual Play Button */}
                    {showManualPlay && (
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
