import { useState, useEffect } from 'react';
import { P2Layout } from './P2Layout';
import { Button } from '@/components/ui/button';
import { ChevronRight, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { useGameP2 } from './GameContextP2';
import { useP2Questions } from './hooks/useP2Questions';

const PICK_COUNT = 4;

function shuffleArr<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function SentenceRearrangementP2() {
    const { addToHistory, nextRound } = useGameP2();
    const { questions, isLoading, error } = useP2Questions('P2_REARRANGEMENT', PICK_COUNT);
    const [idx, setIdx] = useState(0);
    const [pool, setPool] = useState<string[]>([]);
    const [chosen, setChosen] = useState<string[]>([]);
    const [checked, setChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Derive words from correctAnswer whenever the question changes
    useEffect(() => {
        if (questions[idx]?.correctAnswer) {
            reset(questions[idx].correctAnswer!);
        }
    }, [idx, questions]);

    const reset = (answer: string) => {
        setPool(shuffleArr(answer.split(' ')));
        setChosen([]);
        setChecked(false);
        setIsCorrect(false);
    };

    const pickWord = (word: string, fromPool: boolean) => {
        if (checked) return;
        if (fromPool) {
            setPool(prev => { const i = prev.indexOf(word); return [...prev.slice(0, i), ...prev.slice(i + 1)]; });
            setChosen(prev => [...prev, word]);
        } else {
            setChosen(prev => { const i = prev.indexOf(word); return [...prev.slice(0, i), ...prev.slice(i + 1)]; });
            setPool(prev => [...prev, word]);
        }
    };

    const handleCheck = () => {
        const answer = chosen.join(' ');
        const correct = answer === (questions[idx]?.correctAnswer ?? '');
        setIsCorrect(correct);
        setChecked(true);
        addToHistory({
            question: questions[idx]?.correctAnswer ?? '',
            answer,
            score: correct ? 1 : 0,
            section: 'REARRANGEMENT',
        });
    };

    const handleNext = () => {
        if (idx < questions.length - 1) {
            setIdx(prev => prev + 1);
        } else {
            nextRound();
        }
    };

    if (isLoading) {
        return (
            <P2Layout title="Sentence Rearrangement" description="Loading puzzles..." accent="#d97706">
                <div className="flex flex-col items-center gap-3 py-12">
                    <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
                    <p className="text-neutral-500 text-sm">Fetching puzzles...</p>
                </div>
            </P2Layout>
        );
    }

    if (error || questions.length === 0) {
        return (
            <P2Layout title="Sentence Rearrangement" description="" accent="#d97706">
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="text-red-600 text-sm font-medium">{error ?? 'No puzzles available.'}</p>
                    <Button onClick={nextRound} variant="outline" size="sm">Skip Section</Button>
                </div>
            </P2Layout>
        );
    }

    const correctAnswer = questions[idx]?.correctAnswer ?? '';

    return (
        <P2Layout
            title="Sentence Rearrangement"
            description="Tap the words in the correct order to form a proper sentence"
            accent="#d97706"
        >
            <div className="space-y-6">
                <div className="text-center text-sm font-medium text-neutral-500">
                    Puzzle {idx + 1} of {questions.length}
                </div>

                {/* Answer area */}
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Your Sentence</p>
                    <div
                        className="min-h-[56px] bg-amber-50 border-2 border-amber-300 rounded-xl p-3 flex flex-wrap gap-2 items-center"
                        style={{ borderStyle: chosen.length === 0 ? 'dashed' : 'solid' }}
                    >
                        {chosen.length === 0 && (
                            <span className="text-amber-400 text-sm italic select-none">Tap words below to add them here...</span>
                        )}
                        {chosen.map((word, i) => (
                            <button
                                key={`chosen-${i}`}
                                onClick={() => pickWord(word, false)}
                                disabled={checked}
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-default"
                            >
                                {word}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Word pool */}
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Available Words</p>
                    <div className="flex flex-wrap gap-2 min-h-[48px]">
                        {pool.map((word, i) => (
                            <button
                                key={`pool-${i}`}
                                onClick={() => pickWord(word, true)}
                                disabled={checked}
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-neutral-100 text-neutral-800 border border-neutral-300 hover:bg-amber-50 hover:border-amber-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-default"
                            >
                                {word}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feedback */}
                {checked && (
                    <div className={`p-4 rounded-xl border-2 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                        {isCorrect ? (
                            <p className="text-green-800 font-semibold text-center">Correct!</p>
                        ) : (
                            <div className="space-y-1 text-center">
                                <p className="text-red-700 font-semibold">Not quite.</p>
                                <p className="text-sm text-neutral-600">
                                    Correct: <span className="font-medium text-neutral-900">{correctAnswer}</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    {!checked ? (
                        <>
                            <Button onClick={() => reset(correctAnswer)} variant="outline" size="lg" className="h-12 px-5">
                                <RotateCcw className="w-4 h-4 mr-2" />Reset
                            </Button>
                            <Button
                                onClick={handleCheck}
                                disabled={chosen.length === 0 || pool.length > 0}
                                size="lg"
                                className="flex-1 h-12 bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                            >
                                Check Answer
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleNext} size="lg" className="w-full h-12 bg-amber-600 hover:bg-amber-700">
                            {idx < questions.length - 1
                                ? <><ChevronRight className="w-5 h-5 mr-2" />Next Puzzle</>
                                : 'Finish Section'}
                        </Button>
                    )}
                </div>

                {!checked && pool.length > 0 && chosen.length > 0 && (
                    <p className="text-center text-xs text-neutral-400">Use all words before checking.</p>
                )}
            </div>
        </P2Layout>
    );
}
