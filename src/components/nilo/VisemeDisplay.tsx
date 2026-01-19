import { useState, useEffect, useRef } from "react";
import { cartoonVisemes } from "./cartoonVisemes";
import { cn } from "@/lib/utils";

// Assets
import cartoonAvatarVideo from "@/assets/nilo/AvatarImages/3.png";
import blinkGif from "@/assets/nilo/AvatarImages/blink.gif";

interface VisemeDisplayProps {
    text?: string; // Kept for compatibility but unused for lip-sync now
    audioSrc?: string | null;
}

export const VisemeDisplay = ({ audioSrc }: VisemeDisplayProps) => {
    const [imageIndex, setImageIndex] = useState(0);
    const [shouldBlink, setShouldBlink] = useState(false);
    const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const talkingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
            }, 4000 + Math.random() * 2000); // Random blink 4-6s
        };

        startRegularBlinking();

        return () => {
            if (blinkTimeoutRef.current) clearInterval(blinkTimeoutRef.current);
            if (talkingIntervalRef.current) clearInterval(talkingIntervalRef.current);
        };
    }, []);

    // Handle Audio Playback & Animation
    useEffect(() => {
        if (audioSrc) {
            if (audioRef.current) {
                audioRef.current.src = `data:audio/mp3;base64,${audioSrc}`;
                audioRef.current.play().catch(e => console.error("Audio playback error:", e));

                // Start talking animation
                if (talkingIntervalRef.current) clearInterval(talkingIntervalRef.current);

                talkingIntervalRef.current = setInterval(() => {
                    // Random mouth shapes 1-21 (assuming 0 is neutral)
                    const randomViseme = Math.floor(Math.random() * 20) + 1;
                    setImageIndex(randomViseme);
                }, 100); // Change mouth every 100ms
            }
        }
    }, [audioSrc]);

    const handleAudioEnded = () => {
        if (talkingIntervalRef.current) clearInterval(talkingIntervalRef.current);
        setImageIndex(0); // Reset to neutral
        triggerBlink();
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <audio
                ref={audioRef}
                className="hidden"
                onEnded={handleAudioEnded}
                onPause={handleAudioEnded}
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
            </div>
        </div>
    );
};
