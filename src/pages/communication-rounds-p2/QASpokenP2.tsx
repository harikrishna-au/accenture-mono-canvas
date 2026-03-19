import { useState, useEffect, useRef } from 'react';
import { P2Layout } from './P2Layout';
import { AudioPlayer } from '../communication-rounds/components/AudioPlayer';
import { Button } from '@/components/ui/button';
import { Mic, Square, ChevronRight, Eye, EyeOff, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useGameP2 } from './GameContextP2';
import { useSpeechRecognition } from '../communication-rounds/hooks/useSpeechRecognition';
import { useP2Questions } from './hooks/useP2Questions';

const PICK_COUNT = 3;
const PARA_TIME = 45; // seconds paragraph is visible

const JUMBLED_POOL = [
    "Good communication skills help you express ideas clearly and confidently",
    "Practice speaking every day to improve your fluency and pronunciation",
    "Listening carefully is as important as speaking well in any conversation",
];

function shuffleArr<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickRandom<T>(arr: T[], n: number): T[] {
    return shuffleArr([...arr]).slice(0, n);
}

type Phase = 'para' | 'qa_listen' | 'qa_answer' | 'qa_done' | 'jumbled';

export function QASpokenP2() {
    const { addToHistory, nextRound } = useGameP2();
    const { questions, isLoading, error } = useP2Questions('P2_QA_SPOKEN', PICK_COUNT);

    const [phase, setPhase] = useState<Phase>('para');
    const [paraLeft, setParaLeft] = useState(PARA_TIME);
    const [qaIdx, setQaIdx] = useState(0);

    // Jumbled sentence state
    const [jSentences] = useState(() => pickRandom(JUMBLED_POOL, 2));
    const [jIdx, setJIdx] = useState(0);
    const [jPool, setJPool] = useState<string[]>([]);
    const [jChosen, setJChosen] = useState<string[]>([]);
    const [jChecked, setJChecked] = useState(false);
    const [jCorrect, setJCorrect] = useState(false);

    const paraTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const { transcript, isRecording, startRecording, stopRecording, resetTranscript, error: speechError } = useSpeechRecognition();

    // Paragraph countdown
    useEffect(() => {
        if (phase !== 'para') return;
        setParaLeft(PARA_TIME);
        paraTimerRef.current = setInterval(() => {
            setParaLeft(prev => {
                if (prev <= 1) {
                    clearInterval(paraTimerRef.current!);
                    setPhase('qa_listen');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (paraTimerRef.current) clearInterval(paraTimerRef.current); };
    }, []);

    // Init jumbled sentence when entering jumbled phase or changing sentence
    useEffect(() => {
        if (phase === 'jumbled') initJumbled(jIdx);
    }, [phase, jIdx]);

    const initJumbled = (i: number) => {
        setJPool(shuffleArr(jSentences[i].split(' ')));
        setJChosen([]);
        setJChecked(false);
        setJCorrect(false);
    };

    const skipPara = () => {
        if (paraTimerRef.current) clearInterval(paraTimerRef.current);
        setPhase('qa_listen');
    };

    const handleQaStop = () => { stopRecording(); setPhase('qa_done'); };

    const handleQaNext = () => {
        addToHistory({
            question: questions[qaIdx]?.audioSrc ?? '',
            answer: transcript || '(no response)',
            score: transcript ? 1 : 0,
            section: 'QA_SPOKEN',
        });
        resetTranscript();
        if (qaIdx < questions.length - 1) {
            setQaIdx(prev => prev + 1);
            setPhase('qa_listen');
        } else {
            setPhase('jumbled');
        }
    };

    const pickJWord = (word: string, fromPool: boolean) => {
        if (jChecked) return;
        if (fromPool) {
            setJPool(prev => { const i = prev.indexOf(word); return [...prev.slice(0, i), ...prev.slice(i + 1)]; });
            setJChosen(prev => [...prev, word]);
        } else {
            setJChosen(prev => { const i = prev.indexOf(word); return [...prev.slice(0, i), ...prev.slice(i + 1)]; });
            setJPool(prev => [...prev, word]);
        }
    };

    const handleJCheck = () => {
        const correct = jChosen.join(' ') === jSentences[jIdx];
        setJCorrect(correct);
        setJChecked(true);
    };

    const handleJNext = () => {
        if (jIdx < jSentences.length - 1) setJIdx(prev => prev + 1);
        else nextRound();
    };

    if (isLoading) return (
        <P2Layout title="Spoken Q&A" description="Loading questions..." accent="#e11d48">
            <div className="flex flex-col items-center gap-3 py-12">
                <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
                <p className="text-neutral-500 text-sm">Fetching questions...</p>
            </div>
        </P2Layout>
    );

    if (error || questions.length === 0) return (
        <P2Layout title="Spoken Q&A" description="" accent="#e11d48">
            <div className="flex flex-col items-center gap-3 py-12 text-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-red-600 text-sm font-medium">{error ?? 'No questions available.'}</p>
                <Button onClick={nextRound} variant="outline" size="sm">Skip Section</Button>
            </div>
        </P2Layout>
    );

    const paragraph = questions[0]?.promptText ||
        'Read this paragraph carefully before it disappears. Pay attention to the speaker\'s tone, the main idea, and the key details mentioned. You will be asked questions about this passage once the paragraph is hidden.';

    /* ── Phase: Paragraph reading ── */
    if (phase === 'para') {
        const pct = (paraLeft / PARA_TIME) * 100;
        const color = paraLeft > 20 ? '#e11d48' : '#d97706';
        return (
            <P2Layout title="Spoken Q&A" description="Read carefully — the paragraph disappears soon" accent="#e11d48">
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-rose-500" />
                            <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">Read Now</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-500">Disappears in</span>
                            <span className="text-sm font-bold tabular-nums" style={{ color }}>{paraLeft}s</span>
                        </div>
                    </div>

                    <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-5">
                        <p className="text-neutral-800 text-sm leading-loose">{paragraph}</p>
                    </div>

                    <p className="text-center text-xs text-neutral-400">
                        Questions about this passage will be asked after the paragraph disappears.
                    </p>

                    <Button onClick={skipPara} variant="outline" size="sm" className="w-full">
                        I'm ready — hide paragraph now
                    </Button>
                </div>
            </P2Layout>
        );
    }

    /* ── Phases: Q&A ── */
    if (phase === 'qa_listen' || phase === 'qa_answer' || phase === 'qa_done') {
        const q = questions[qaIdx];
        return (
            <P2Layout
                title="Spoken Q&A"
                description="Listen to the question, then answer it verbally"
                accent="#e11d48"
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="text-xs text-neutral-400 italic">Paragraph hidden</span>
                        </div>
                        <span className="text-sm font-medium text-neutral-500">
                            Question {qaIdx + 1} of {questions.length}
                        </span>
                    </div>

                    {/* Audio question */}
                    <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-6 space-y-4">
                        <p className="text-center text-sm font-bold text-rose-700 uppercase tracking-widest">
                            Listen to the Question
                        </p>
                        <AudioPlayer
                            text={q.audioSrc ?? ''}
                            voiceType={q.voiceType ?? 'female_1'}
                            audioUrl={q.audioUrl}
                            playOnce={true}
                            onPlayComplete={() => setPhase('qa_answer')}
                        />
                    </div>

                    {/* Answer */}
                    {(phase === 'qa_answer' || phase === 'qa_done') && (
                        <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-6 space-y-4">
                            <p className="text-center text-sm font-bold text-rose-700 uppercase tracking-widest">
                                Your Answer
                            </p>
                            {speechError && (
                                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-700 text-sm">{speechError}</div>
                            )}
                            {phase === 'qa_answer' && (
                                <div className="flex justify-center">
                                    <Button
                                        onClick={isRecording ? handleQaStop : startRecording}
                                        disabled={!!speechError} size="lg"
                                        className={`w-52 h-14 text-base ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                                    >
                                        {isRecording
                                            ? <><Square className="w-5 h-5 mr-2" />Stop Recording</>
                                            : <><Mic className="w-5 h-5 mr-2" />Answer Now</>}
                                    </Button>
                                </div>
                            )}
                            {phase === 'qa_done' && (
                                <div className="space-y-4">
                                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                                        <p className="text-sm text-neutral-500 mb-1">Your response:</p>
                                        <p className="text-neutral-800 italic">{transcript || '(no speech detected)'}</p>
                                    </div>
                                    <Button onClick={handleQaNext} size="lg" className="w-full h-12 bg-rose-600 hover:bg-rose-700">
                                        {qaIdx < questions.length - 1
                                            ? <><ChevronRight className="w-5 h-5 mr-2" />Next Question</>
                                            : 'Continue to Sentence Task →'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </P2Layout>
        );
    }

    /* ── Phase: Jumbled sentences ── */
    return (
        <P2Layout
            title="Rearrange the Sentence"
            description="Tap the words in the correct order to form a proper sentence"
            accent="#e11d48"
        >
            <div className="space-y-6">
                <div className="text-center text-sm font-medium text-neutral-500">
                    Sentence {jIdx + 1} of {jSentences.length}
                </div>

                {/* Answer area */}
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2">Your Sentence</p>
                    <div
                        className="min-h-[56px] bg-rose-50 border-2 border-rose-300 rounded-xl p-3 flex flex-wrap gap-2 items-center"
                        style={{ borderStyle: jChosen.length === 0 ? 'dashed' : 'solid' }}
                    >
                        {jChosen.length === 0 && (
                            <span className="text-rose-400 text-sm italic select-none">Tap words below to add them here…</span>
                        )}
                        {jChosen.map((word, i) => (
                            <button key={i} onClick={() => pickJWord(word, false)} disabled={jChecked}
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-transform disabled:opacity-70">
                                {word}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Word pool */}
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Available Words</p>
                    <div className="flex flex-wrap gap-2 min-h-[48px]">
                        {jPool.map((word, i) => (
                            <button key={i} onClick={() => pickJWord(word, true)} disabled={jChecked}
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-neutral-100 text-neutral-800 border border-neutral-300 hover:bg-rose-50 hover:border-rose-300 active:scale-95 transition-all disabled:opacity-50">
                                {word}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feedback */}
                {jChecked && (
                    <div className={`p-4 rounded-xl border-2 text-center ${jCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                        {jCorrect
                            ? <p className="text-green-800 font-semibold">Correct!</p>
                            : <div><p className="text-red-700 font-semibold">Not quite.</p><p className="text-sm text-neutral-600 mt-1">Correct: <span className="font-medium text-neutral-900">{jSentences[jIdx]}</span></p></div>
                        }
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    {!jChecked ? (
                        <>
                            <Button onClick={() => initJumbled(jIdx)} variant="outline" size="lg" className="h-12 px-5">
                                <RotateCcw className="w-4 h-4 mr-2" />Reset
                            </Button>
                            <Button onClick={handleJCheck} disabled={jChosen.length === 0 || jPool.length > 0}
                                size="lg" className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 disabled:opacity-50">
                                Check Answer
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleJNext} size="lg" className="w-full h-12 bg-rose-600 hover:bg-rose-700">
                            {jIdx < jSentences.length - 1
                                ? <><ChevronRight className="w-5 h-5 mr-2" />Next Sentence</>
                                : 'Finish Section'}
                        </Button>
                    )}
                </div>
                {!jChecked && jPool.length > 0 && jChosen.length > 0 && (
                    <p className="text-center text-xs text-neutral-400">Use all the words before checking.</p>
                )}
            </div>
        </P2Layout>
    );
}
