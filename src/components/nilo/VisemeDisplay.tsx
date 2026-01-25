import { useState, useEffect, useRef } from "react";
import { cartoonVisemes } from "./cartoonVisemes";
import { cn } from "@/lib/utils";

// Assets
import cartoonAvatarVideo from "@/assets/nilo/AvatarImages/3.png";
import blinkGif from "@/assets/nilo/AvatarImages/blink.gif";

interface VisemeDisplayProps {
    text?: string;
    audioSrc?: string | null;
    onAudioEnd?: () => void;
}


export const VisemeDisplay = ({ audioSrc, onAudioEnd }: VisemeDisplayProps) => {
    const [imageIndex, setImageIndex] = useState(0);
    const [shouldBlink, setShouldBlink] = useState(false);
    const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Web Audio API Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Function to trigger blink
    const triggerBlink = () => {
        setShouldBlink(true);
        setTimeout(() => setShouldBlink(false), 200);
    };

    // Handle blinking
    useEffect(() => {
        const startRegularBlinking = () => {
            blinkTimeoutRef.current = setInterval(() => {
                if (!audioRef.current || audioRef.current.paused) {
                    triggerBlink();
                }
            }, 4000 + Math.random() * 2000);
        };

        startRegularBlinking();

        return () => {
            if (blinkTimeoutRef.current) clearInterval(blinkTimeoutRef.current);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    // Audio Autoplay Error State
    const [audioError, setAudioError] = useState(false);

    // Initialize Audio Context
    const initAudioContext = () => {
        if (!audioRef.current) return;

        if (!audioContextRef.current) {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass();
            analyserRef.current = audioContextRef.current!.createAnalyser();
            analyserRef.current.fftSize = 256; // Smaller size for faster processing

            // Connect audio element
            try {
                sourceRef.current = audioContextRef.current!.createMediaElementSource(audioRef.current);
                sourceRef.current.connect(analyserRef.current);
                analyserRef.current.connect(audioContextRef.current!.destination);
            } catch (e) {
                console.warn("MediaElementSource already connected or error:", e);
            }
        }
    };

    // Animation Loop based on Volume
    const animate = () => {
        if (!analyserRef.current || !audioRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Threshold for "speaking" (adjust as needed)
        if (average > 10 && !audioRef.current.paused) {
            // Change mouth only slightly randomly to reduce jitter
            // Or based on volume intensity (louder = wider?)
            // For cartoon, random frames 1-20 works well but maybe update less frequently?
            // To prevent too fast flickering, we can use a timestamp or frame count.
            // But simplest valid approach:
            const randomViseme = Math.floor(Math.random() * 20) + 1;
            setImageIndex(randomViseme);
        } else {
            setImageIndex(0); // Neutral
        }

        animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Handle Audio Playback
    useEffect(() => {
        if (audioSrc && audioRef.current) {
            audioRef.current.src = `data:audio/mp3;base64,${audioSrc}`;

            const playAudio = async () => {
                try {
                    await audioRef.current!.play();
                    setAudioError(false);
                    initAudioContext();

                    // Resume context if suspended (browser policy)
                    if (audioContextRef.current?.state === 'suspended') {
                        await audioContextRef.current.resume();
                    }

                    animate();
                } catch (e) {
                    console.error("Audio playback error:", e);
                    setAudioError(true);
                }
            };

            playAudio();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioSrc]);

    const retryPlay = async () => {
        if (audioRef.current) {
            try {
                if (audioContextRef.current?.state === 'suspended') {
                    await audioContextRef.current.resume();
                }
                await audioRef.current.play();
                setAudioError(false);
                initAudioContext();
                animate();
            } catch (e) {
                console.error("Retry failed:", e);
            }
        }
    };

    const handleAudioEnded = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setImageIndex(0);
        triggerBlink();
        if (onAudioEnd) {
            onAudioEnd();
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <audio
                ref={audioRef}
                className="hidden"
                crossOrigin="anonymous" // Helpful for some setups
                onEnded={handleAudioEnded}
                onPause={() => setImageIndex(0)}
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
                        alt="Cartoon Viseme"
                        className={cn(
                            "absolute top-[47%] left-[49%] -translate-x-1/2 -translate-y-1/2 h-auto z-30 transition-transform duration-100",
                            "w-[30%] sm:w-[28%] md:w-[25%] lg:w-[20%] xl:w-[18%]"
                        )}
                    />
                </div>

                {audioError && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] rounded-full transition-all">
                        <button
                            onClick={retryPlay}
                            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all animate-bounce-subtle"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            Start Interview Audio
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
