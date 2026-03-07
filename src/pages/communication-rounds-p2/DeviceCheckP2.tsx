import { useState } from 'react';
import { P2Layout } from './P2Layout';
import { AudioPlayer } from '../communication-rounds/components/AudioPlayer';
import { Button } from '@/components/ui/button';
import { Mic, Square, Volume2, CheckCircle } from 'lucide-react';
import { useGameP2 } from './GameContextP2';
import { useSpeechRecognition } from '../communication-rounds/hooks/useSpeechRecognition';

export function DeviceCheckP2() {
    const { nextRound } = useGameP2();
    const [step, setStep] = useState<'speaker' | 'microphone' | 'complete'>('speaker');
    const [speakerTested, setSpeakerTested] = useState(false);
    const { transcript, isRecording, startRecording, stopRecording, error: speechError } = useSpeechRecognition();

    return (
        <P2Layout
            title="Device Compatibility Check"
            description="Let's test your speakers and microphone before we begin"
            accent="#7c3aed"
        >
            <div className="space-y-6">
                {step === 'speaker' && (
                    <div className="space-y-6">
                        <div className="bg-violet-50 p-6 rounded-xl border-2 border-violet-200">
                            <div className="flex items-center gap-3 mb-3">
                                <Volume2 className="w-7 h-7 text-violet-600" />
                                <h3 className="text-lg font-bold text-violet-900">Step 1 — Speaker Test</h3>
                            </div>
                            <p className="text-neutral-700 text-sm">
                                Click "Play Audio". If you can hear the message, click "I Can Hear It".
                            </p>
                        </div>
                        <AudioPlayer
                            text="Hello! Welcome to the Pattern 2 Communication Assessment. If you can hear this clearly, your speakers are working."
                            voiceType="female_1"
                            playOnce={false}
                            onPlayComplete={() => setSpeakerTested(true)}
                        />
                        {speakerTested && (
                            <div className="flex justify-center">
                                <Button onClick={() => setStep('microphone')} size="lg" className="h-12 px-8 bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    I Can Hear It — Continue
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {step === 'microphone' && (
                    <div className="space-y-6">
                        <div className="bg-violet-50 p-6 rounded-xl border-2 border-violet-200">
                            <div className="flex items-center gap-3 mb-3">
                                <Mic className="w-7 h-7 text-violet-600" />
                                <h3 className="text-lg font-bold text-violet-900">Step 2 — Microphone Test</h3>
                            </div>
                            <p className="text-neutral-700 text-sm mb-3">Record yourself saying:</p>
                            <p className="text-base font-semibold text-violet-900 italic">
                                "Testing my microphone for the communication assessment."
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            {speechError && (
                                <div className="w-full bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 text-sm">
                                    Microphone access denied. Please allow microphone access in your browser settings.
                                </div>
                            )}
                            <Button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={!!speechError}
                                size="lg"
                                className={`w-52 h-14 text-base ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'}`}
                            >
                                {isRecording ? <><Square className="w-5 h-5 mr-2" />Stop Recording</> : <><Mic className="w-5 h-5 mr-2" />Start Recording</>}
                            </Button>
                        </div>
                        {transcript && (
                            <div className="space-y-4">
                                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                                    <p className="text-sm text-neutral-500 mb-1">Your recording:</p>
                                    <p className="text-neutral-900">{transcript}</p>
                                </div>
                                <div className="flex justify-center">
                                    <Button onClick={() => setStep('complete')} size="lg" className="h-12 px-8 bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Microphone Works — Continue
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {step === 'complete' && (
                    <div className="bg-green-50 p-8 rounded-xl border-2 border-green-200 text-center space-y-4">
                        <CheckCircle className="w-14 h-14 text-green-600 mx-auto" />
                        <h3 className="text-2xl font-bold text-green-900">All Set!</h3>
                        <p className="text-neutral-700">Your audio devices are working. Let the assessment begin.</p>
                        <Button onClick={nextRound} size="lg" className="h-12 px-8 bg-violet-600 hover:bg-violet-700 mt-2">
                            Begin Assessment
                        </Button>
                    </div>
                )}
            </div>
        </P2Layout>
    );
}
