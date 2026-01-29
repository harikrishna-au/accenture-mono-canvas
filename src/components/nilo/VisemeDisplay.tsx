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
    audioSrc?: string | null; // Kept for interface compatibility
    onAudioEnd?: () => void;
}

export const VisemeDisplay = ({ text, audioSrc, onAudioEnd }: VisemeDisplayProps) => {
    const [imageIndex, setImageIndex] = useState(0);
    const [shouldBlink, setShouldBlink] = useState(false);
    const [showManualPlay, setShowManualPlay] = useState(false); // State for manual play button
    const synthesizerRef = useRef<sdk.SpeechSynthesizer | null>(null);
    const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null); // For fallback

    // Debugging
    useEffect(() => {
        console.log("VisemeDisplay mounted/updated. Text:", text ? text.substring(0, 20) + "..." : "Empty");
        setShowManualPlay(false); // Reset on new text
    }, [text]);

    // Blinking Logic (Preserved from original theme)
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

    const handleManualPlay = () => {
        if (audioRef.current) {
            audioRef.current.play()
                .then(() => setShowManualPlay(false))
                .catch(e => console.error("Manual play failed:", e));
        }
    };

    // Azure Speech Logic
    useEffect(() => {
        if (text) {
            handleVisemes(text);
        }

        return () => {
            if (synthesizerRef.current) {
                synthesizerRef.current.close();
                synthesizerRef.current = null;
            }
        };
    }, [text]);

    const handleVisemes = (textToSpeak: string) => {
        const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
        const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

        console.log("Initializing Azure Speech. Key Present:", !!speechKey, "Region Present:", !!speechRegion);

        if (!speechKey || !speechRegion) {
            console.error("Azure Speech credentials missing. Trying fallback audio.");
            // Fallback: Play the backend provided audio if available
            if (audioSrc && audioRef.current) {
                console.log("Playing fallback audioSrc...");
                audioRef.current.src = `data:audio/mp3;base64,${audioSrc}`;
                audioRef.current.onended = onAudioEnd || null;
                audioRef.current.play().catch(e => {
                    console.error("Fallback play error:", e);
                    setShowManualPlay(true); // Show button if blocked
                });
            } else {
                console.warn("No fallback audioSrc available.");
            }
            return;
        }

        const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
        const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();

        // Cancel previous if any
        if (synthesizerRef.current) {
            try { synthesizerRef.current.close(); } catch (e) { }
        }

        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        synthesizerRef.current = synthesizer;

        synthesizer.visemeReceived = (s, e) => {
            // Direct update for real-time sync
            setImageIndex(e.visemeId);
        };

        console.log("VisemeDisplay: Starting Azure Synthesis for:", textToSpeak.substring(0, 20) + "...");
        synthesizer.speakTextAsync(
            textToSpeak,
            (result) => {
                console.log("VisemeDisplay: Synthesis Result Reason:", result.reason);
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    console.log("VisemeDisplay: Audio synthesis completed successfully.");
                    onAudioEnd?.();
                } else if (result.reason === sdk.ResultReason.Canceled) {
                    const cancellation = sdk.CancellationDetails.fromResult(result);
                    console.error("VisemeDisplay: CANCELED. Reason=" + cancellation.reason);
                    if (cancellation.reason === sdk.CancellationReason.Error) {
                        console.error("VisemeDisplay: Azure Authentication Failed or Network Error. Check your KEYS.");
                        console.error("VisemeDisplay: ErrorDetails=" + cancellation.errorDetails);

                        // Check for Auth failure patterns
                        if (cancellation.errorDetails.includes("1006") || cancellation.errorDetails.includes("401")) {
                            console.warn("!!! YOUR AZURE CREDENTIALS APPEAR INVALID !!!");
                        }

                        // Trigger fallback if Azure fails
                        if (audioSrc && audioRef.current) {
                            console.log("VisemeDisplay: Switching to fallback audio due to Azure error.");
                            audioRef.current.src = `data:audio/mp3;base64,${audioSrc}`;
                            audioRef.current.onended = onAudioEnd || null;
                            audioRef.current.play().catch(e => {
                                console.error("Fallback autoplay blocked:", e);
                                setShowManualPlay(true);
                            });
                        }
                    }
                }
                synthesizer.close();
                synthesizerRef.current = null;
                setImageIndex(0); // Reset to neutral after speech
            },
            (err) => {
                console.error("VisemeDisplay: Azure TTS Fatal Error:", err);
                synthesizer.close();
                synthesizerRef.current = null;
            }
        );
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <audio ref={audioRef} className="hidden" />
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

                    {/* Viseme overlay - Original Positioning */}
                    <img
                        src={cartoonVisemes[imageIndex] || cartoonVisemes[0]}
                        alt="Viseme"
                        className={cn(
                            "absolute top-[47%] left-[49%] -translate-x-1/2 -translate-y-1/2 h-auto z-30 transition-transform duration-100",
                            "w-[30%] sm:w-[28%] md:w-[25%] lg:w-[20%] xl:w-[18%]"
                        )}
                    />

                    {/* Manual Play Button Overlay */}
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
