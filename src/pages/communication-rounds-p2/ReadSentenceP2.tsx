import { useState } from 'react';
import { P2Layout } from './P2Layout';
import { Button } from '@/components/ui/button';
import { Mic, Square, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useGameP2 } from './GameContextP2';
import { useSpeechRecognition } from '../communication-rounds/hooks/useSpeechRecognition';
import { useP2Questions } from './hooks/useP2Questions';

const PICK_COUNT = 5;

export function ReadSentenceP2() {
    const { addToHistory, nextRound } = useGameP2();
    const { questions, isLoading, error } = useP2Questions('P2_READ_SENTENCE', PICK_COUNT);
    const [idx, setIdx] = useState(0);
    const [recorded, setRecorded] = useState(false);
    const { transcript, isRecording, startRecording, stopRecording, resetTranscript, error: speechError } = useSpeechRecognition();

    const handleStop = () => {
        stopRecording();
        setRecorded(true);
    };

    const handleNext = () => {
        addToHistory({
            question: questions[idx]?.promptText ?? '',
            answer: transcript || '(no response)',
            score: transcript ? 1 : 0,
            section: 'READ_SENTENCE',
        });
        resetTranscript();
        setRecorded(false);

        if (idx < questions.length - 1) {
            setIdx(prev => prev + 1);
        } else {
            nextRound();
        }
    };

    if (isLoading) {
        return (
            <P2Layout title="Read the Sentence" description="Loading questions..." accent="#0891b2">
                <div className="flex flex-col items-center gap-3 py-12">
                    <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
                    <p className="text-neutral-500 text-sm">Fetching questions...</p>
                </div>
            </P2Layout>
        );
    }

    if (error || questions.length === 0) {
        return (
            <P2Layout title="Read the Sentence" description="" accent="#0891b2">
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="text-red-600 text-sm font-medium">{error ?? 'No questions available.'}</p>
                    <Button onClick={nextRound} variant="outline" size="sm">Skip Section</Button>
                </div>
            </P2Layout>
        );
    }

    const sentence = questions[idx]?.promptText ?? '';

    return (
        <P2Layout
            title="Read the Sentence"
            description="Read each sentence aloud clearly at a natural pace"
            accent="#0891b2"
        >
            <div className="space-y-6">
                <div className="text-center text-sm font-medium text-neutral-500">
                    Sentence {idx + 1} of {questions.length}
                </div>

                <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-8">
                    <p className="text-xl text-neutral-900 text-center leading-relaxed font-medium">
                        {sentence}
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    {speechError && (
                        <div className="w-full bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 text-sm">
                            Microphone error: {speechError}
                        </div>
                    )}

                    {!recorded ? (
                        <Button
                            onClick={isRecording ? handleStop : startRecording}
                            disabled={!!speechError}
                            size="lg"
                            className={`w-52 h-14 text-base ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                        >
                            {isRecording
                                ? <><Square className="w-5 h-5 mr-2" />Stop Recording</>
                                : <><Mic className="w-5 h-5 mr-2" />Start Recording</>}
                        </Button>
                    ) : (
                        <div className="w-full space-y-4">
                            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                                <p className="text-sm text-neutral-500 mb-1">Captured:</p>
                                <p className="text-neutral-800 italic">{transcript || '(no speech detected)'}</p>
                            </div>
                            <Button onClick={handleNext} size="lg" className="w-full h-12 bg-cyan-600 hover:bg-cyan-700">
                                {idx < questions.length - 1
                                    ? <><ChevronRight className="w-5 h-5 mr-2" />Next Sentence</>
                                    : 'Finish Section'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </P2Layout>
    );
}
