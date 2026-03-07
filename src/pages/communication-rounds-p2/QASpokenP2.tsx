import { useState } from 'react';
import { P2Layout } from './P2Layout';
import { AudioPlayer } from '../communication-rounds/components/AudioPlayer';
import { Button } from '@/components/ui/button';
import { Mic, Square, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useGameP2 } from './GameContextP2';
import { useSpeechRecognition } from '../communication-rounds/hooks/useSpeechRecognition';
import { useP2Questions } from './hooks/useP2Questions';

const PICK_COUNT = 4;

type Phase = 'listen' | 'answer' | 'done';

export function QASpokenP2() {
    const { addToHistory, nextRound } = useGameP2();
    const { questions, isLoading, error } = useP2Questions('P2_QA_SPOKEN', PICK_COUNT);
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState<Phase>('listen');
    const { transcript, isRecording, startRecording, stopRecording, resetTranscript, error: speechError } = useSpeechRecognition();

    const handleStop = () => {
        stopRecording();
        setPhase('done');
    };

    const handleNext = () => {
        addToHistory({
            question: questions[idx]?.audioSrc ?? '',
            answer: transcript || '(no response)',
            score: transcript ? 1 : 0,
            section: 'QA_SPOKEN',
        });
        resetTranscript();
        setPhase('listen');

        if (idx < questions.length - 1) {
            setIdx(prev => prev + 1);
        } else {
            nextRound();
        }
    };

    if (isLoading) {
        return (
            <P2Layout title="Spoken Q&A" description="Loading questions..." accent="#e11d48">
                <div className="flex flex-col items-center gap-3 py-12">
                    <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
                    <p className="text-neutral-500 text-sm">Fetching questions...</p>
                </div>
            </P2Layout>
        );
    }

    if (error || questions.length === 0) {
        return (
            <P2Layout title="Spoken Q&A" description="" accent="#e11d48">
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="text-red-600 text-sm font-medium">{error ?? 'No questions available.'}</p>
                    <Button onClick={nextRound} variant="outline" size="sm">Skip Section</Button>
                </div>
            </P2Layout>
        );
    }

    const q = questions[idx];

    return (
        <P2Layout
            title="Spoken Q&A"
            description="Listen to the question, then answer it verbally in complete sentences"
            accent="#e11d48"
        >
            <div className="space-y-6">
                <div className="text-center text-sm font-medium text-neutral-500">
                    Question {idx + 1} of {questions.length}
                </div>

                {/* Question */}
                <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-6 space-y-4">
                    <p className="text-center text-sm font-bold text-rose-700 uppercase tracking-widest">
                        Listen to the Question
                    </p>
                    <AudioPlayer
                        text={q.audioSrc ?? ''}
                        voiceType={q.voiceType ?? 'female_1'}
                        audioUrl={q.audioUrl}
                        playOnce={true}
                        onPlayComplete={() => setPhase('answer')}
                    />
                </div>

                {/* Answer phase */}
                {(phase === 'answer' || phase === 'done') && (
                    <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-6 space-y-4">
                        <p className="text-center text-sm font-bold text-rose-700 uppercase tracking-widest">
                            Your Answer
                        </p>
                        <p className="text-center text-xs text-neutral-500">
                            Speak for at least 30–60 seconds with specific examples.
                        </p>

                        {speechError && (
                            <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-700 text-sm">
                                {speechError}
                            </div>
                        )}

                        {phase === 'answer' && (
                            <div className="flex justify-center">
                                <Button
                                    onClick={isRecording ? handleStop : startRecording}
                                    disabled={!!speechError}
                                    size="lg"
                                    className={`w-52 h-14 text-base ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                                >
                                    {isRecording
                                        ? <><Square className="w-5 h-5 mr-2" />Stop Recording</>
                                        : <><Mic className="w-5 h-5 mr-2" />Answer Now</>}
                                </Button>
                            </div>
                        )}

                        {phase === 'done' && (
                            <div className="space-y-4">
                                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                                    <p className="text-sm text-neutral-500 mb-1">Your response:</p>
                                    <p className="text-neutral-800 italic">{transcript || '(no speech detected)'}</p>
                                </div>
                                <Button onClick={handleNext} size="lg" className="w-full h-12 bg-rose-600 hover:bg-rose-700">
                                    {idx < questions.length - 1
                                        ? <><ChevronRight className="w-5 h-5 mr-2" />Next Question</>
                                        : 'Finish Section'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </P2Layout>
    );
}
