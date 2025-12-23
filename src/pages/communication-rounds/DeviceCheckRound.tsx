import React, { useState } from 'react';
import { RoundLayout } from './components/RoundLayout';
import { AudioPlayer } from './components/AudioPlayer';
import { Button } from '@/components/ui/button';
import { Mic, Square, Volume2, CheckCircle } from 'lucide-react';
import { useGame } from './GameContext';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

export function DeviceCheckRound() {
    const { nextRound } = useGame();
    const [step, setStep] = useState<'speaker' | 'microphone' | 'complete'>('speaker');
    const [speakerTested, setSpeakerTested] = useState(false);
    const { transcript, isRecording, startRecording, stopRecording, resetTranscript, error: speechError } = useSpeechRecognition();

    const handleSpeakerTest = () => {
        setSpeakerTested(true);
    };

    const handleConfirmSpeaker = () => {
        setStep('microphone');
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleMicrophoneConfirm = () => {
        setStep('complete');
    };

    const handleNext = () => {
        nextRound();
    };

    return (
        <RoundLayout
            title="Device Compatibility Check"
            description="Let's test your speakers and microphone"
            onNext={step === 'complete' ? handleNext : undefined}
            showNavigation={step === 'complete'}
        >
            <div className="space-y-6">
                {/* Speaker Test */}
                {step === 'speaker' && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Volume2 className="w-8 h-8 text-blue-600" />
                                <h3 className="text-xl font-bold text-blue-900">Step 1: Speaker Test</h3>
                            </div>
                            <p className="text-neutral-700 mb-4">
                                Click the "Play Audio" button below. If you can hear the audio clearly, click "I Can Hear It".
                            </p>
                        </div>

                        <AudioPlayer
                            text="Hello! This is a speaker test. If you can hear this message clearly, your speakers are working properly."
                            voiceType="female_1"
                            playOnce={false}
                            onPlayComplete={handleSpeakerTest}
                        />

                        {speakerTested && (
                            <div className="flex justify-center">
                                <Button
                                    onClick={handleConfirmSpeaker}
                                    size="lg"
                                    className="h-14 px-8 bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    I Can Hear It - Continue
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Microphone Test */}
                {step === 'microphone' && (
                    <div className="space-y-6">
                        <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Mic className="w-8 h-8 text-purple-600" />
                                <h3 className="text-xl font-bold text-purple-900">Step 2: Microphone Test</h3>
                            </div>
                            <p className="text-neutral-700 mb-2">
                                Click "Start Recording" and say the following sentence:
                            </p>
                            <p className="text-lg font-semibold text-purple-900 italic">
                                "Testing my microphone for the communication assessment."
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            {speechError && (
                                <div className="w-full bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 text-sm">
                                    ⚠️ Microphone error: {speechError}. Please allow microphone access in your browser settings.
                                </div>
                            )}

                            <Button
                                onClick={handleToggleRecording}
                                disabled={!!speechError}
                                size="lg"
                                className={`w-56 h-16 text-lg ${isRecording
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                    }`}
                            >
                                {isRecording ? (
                                    <>
                                        <Square className="w-5 h-5 mr-2" />
                                        Stop Recording
                                    </>
                                ) : (
                                    <>
                                        <Mic className="w-5 h-5 mr-2" />
                                        Start Recording
                                    </>
                                )}
                            </Button>
                        </div>

                        {transcript && (
                            <div className="w-full space-y-4">
                                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                                    <p className="text-sm text-neutral-600 mb-1">Your recording:</p>
                                    <p className="text-neutral-900">{transcript}</p>
                                </div>
                                <div className="flex justify-center">
                                    <Button
                                        onClick={handleMicrophoneConfirm}
                                        size="lg"
                                        className="h-14 px-8 bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Microphone Works - Continue
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Complete */}
                {step === 'complete' && (
                    <div className="bg-green-50 p-8 rounded-xl border-2 border-green-200 text-center space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle className="w-16 h-16 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-900">All Set!</h3>
                        <p className="text-lg text-neutral-700">
                            Your speakers and microphone are working properly.
                        </p>
                        <p className="text-neutral-600">
                            Click "Next Round" to begin the assessment.
                        </p>
                    </div>
                )}
            </div>
        </RoundLayout>
    );
}
