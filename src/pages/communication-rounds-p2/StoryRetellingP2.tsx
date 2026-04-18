import { useState, useEffect, useRef } from 'react';
import { P2Layout } from './P2Layout';
import { Button } from '@/components/ui/button';
import { Mic, Square, ChevronRight, MessageSquare } from 'lucide-react';
import { useGameP2 } from './GameContextP2';
import { useSpeechRecognition } from '../communication-rounds/hooks/useSpeechRecognition';

const PERSONAL_QUESTIONS = [
    "What is your favourite food and why do you enjoy it?",
    "Describe the city or town where you are currently staying.",
    "Tell me about your hometown — what makes it special to you?",
    "What do you like to do in your free time or on weekends?",
    "Describe your daily routine from morning to evening.",
    "Who is the most influential person in your life and why?",
    "Tell me about a memorable trip or journey you have taken.",
    "What are your hobbies and how did you develop them?",
    "Describe your family and the role they play in your life.",
    "What kind of food do you enjoy cooking or eating at home?",
];

function pickRandom<T>(arr: T[], n: number): T[] {
    return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

const TOTAL_QUESTIONS = 3;
const TIME_PER_QUESTION = 60;

type Phase = 'ready' | 'recording' | 'done_q';

export function StoryRetellingP2() {
    const { addToHistory, nextRound } = useGameP2();
    const [questions] = useState(() => pickRandom(PERSONAL_QUESTIONS, TOTAL_QUESTIONS));
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState<Phase>('ready');
    const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const { transcript, isRecording, startRecording, stopRecording, resetTranscript, error: speechError } = useSpeechRecognition();

    const clearTimer = () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };

    useEffect(() => {
        if (phase === 'recording') {
            setTimeLeft(TIME_PER_QUESTION);
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) { clearTimer(); handleStop(); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearTimer();
    }, [phase, idx]);

    const handleStart = () => {
        setPhase('recording');
        startRecording();
    };

    const handleStop = () => {
        clearTimer();
        stopRecording();
        setPhase('done_q');
    };

    const handleNext = () => {
        addToHistory({
            question: questions[idx],
            answer: transcript || '(no response)',
            score: transcript ? 1 : 0,
            section: 'STORY_RETELLING',
        });
        resetTranscript();
        setPhase('ready');
        if (idx < questions.length - 1) setIdx(prev => prev + 1);
        else nextRound();
    };

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timerStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    const timerPct = (timeLeft / TIME_PER_QUESTION) * 100;
    const timerColor = timeLeft > 30 ? '#7c3aed' : timeLeft > 15 ? '#d97706' : '#e11d48';

    return (
        <P2Layout
            title="Personal Questions"
            description="Answer each question by speaking — you have 1 minute per question"
            accent="#7c3aed"
        >
            <div className="space-y-6">
                <div className="text-center text-sm font-medium text-neutral-500">
                    Question {idx + 1} of {TOTAL_QUESTIONS}
                </div>

                {/* Question card */}
                <div className="rounded-xl border-2 p-6 space-y-3" style={{ background: 'rgba(124,58,237,0.04)', borderColor: 'rgba(124,58,237,0.25)' }}>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-violet-600" />
                        <p className="text-xs font-bold text-violet-700 uppercase tracking-widest">Question</p>
                    </div>
                    <p className="text-neutral-800 text-base font-medium leading-relaxed">{questions[idx]}</p>
                </div>

                {/* Timer */}
                {phase === 'recording' && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Time Left</span>
                            <span className="text-lg font-bold tabular-nums" style={{ color: timerColor }}>{timerStr}</span>
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPct}%`, background: timerColor }} />
                        </div>
                    </div>
                )}

                {speechError && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-700 text-sm">{speechError}</div>
                )}

                {phase === 'ready' && (
                    <Button onClick={handleStart} disabled={!!speechError} size="lg"
                        className="w-full h-14 text-base bg-violet-600 hover:bg-violet-700">
                        <Mic className="w-5 h-5 mr-2" /> Start Speaking
                    </Button>
                )}

                {phase === 'recording' && (
                    <Button onClick={handleStop} size="lg"
                        className="w-full h-14 text-base bg-red-600 hover:bg-red-700">
                        <Square className="w-5 h-5 mr-2" /> Stop Recording
                    </Button>
                )}

                {phase === 'done_q' && (
                    <div className="space-y-4">
                        <div className="bg-white border border-neutral-200 rounded-xl p-4">
                            <p className="text-xs text-neutral-400 mb-1 font-medium uppercase tracking-wide">Your Response</p>
                            <p className="text-neutral-800 italic leading-relaxed">{transcript || '(no speech detected)'}</p>
                        </div>
                        <Button onClick={handleNext} size="lg" className="w-full h-12 bg-violet-600 hover:bg-violet-700">
                            {idx < questions.length - 1
                                ? <><ChevronRight className="w-5 h-5 mr-2" />Next Question</>
                                : 'Finish Section'}
                        </Button>
                    </div>
                )}
            </div>
        </P2Layout>
    );
}
