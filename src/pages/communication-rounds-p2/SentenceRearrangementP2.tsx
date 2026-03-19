import { useState, useEffect } from 'react';
import { P2Layout } from './P2Layout';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { useGameP2 } from './GameContextP2';
import { useP2Questions } from './hooks/useP2Questions';

const PICK_COUNT = 4;

export function SentenceRearrangementP2() {
    const { addToHistory, nextRound } = useGameP2();
    const { questions, isLoading, error } = useP2Questions('P2_REARRANGEMENT', PICK_COUNT);
    const [idx, setIdx] = useState(0);
    const [answer, setAnswer] = useState('');
    const [checked, setChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        setAnswer('');
        setChecked(false);
        setIsCorrect(false);
    }, [idx]);

    const handleCheck = () => {
        const correct = answer.trim().toLowerCase() === (questions[idx]?.correctAnswer ?? '').toLowerCase();
        setIsCorrect(correct);
        setChecked(true);
        addToHistory({
            question: questions[idx]?.promptText ?? '',
            answer: answer.trim(),
            score: correct ? 1 : 0,
            section: 'REARRANGEMENT',
        });
    };

    const handleNext = () => {
        if (idx < questions.length - 1) setIdx(prev => prev + 1);
        else nextRound();
    };

    if (isLoading) return (
        <P2Layout title="Fill in the Blank" description="Loading questions..." accent="#d97706">
            <div className="flex flex-col items-center gap-3 py-12">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
                <p className="text-neutral-500 text-sm">Fetching questions...</p>
            </div>
        </P2Layout>
    );

    if (error || questions.length === 0) return (
        <P2Layout title="Fill in the Blank" description="" accent="#d97706">
            <div className="flex flex-col items-center gap-3 py-12 text-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-red-600 text-sm font-medium">{error ?? 'No questions available.'}</p>
                <Button onClick={nextRound} variant="outline" size="sm">Skip Section</Button>
            </div>
        </P2Layout>
    );

    const q = questions[idx];
    const sentence = q.promptText ?? '';
    const correctWord = q.correctAnswer ?? '';

    /* Render sentence with _____ replaced by the blank/answer */
    const renderSentence = () => {
        const parts = sentence.split('_____');
        if (parts.length <= 1) return <span>{sentence || '(No sentence found)'}</span>;
        return (
            <span>
                {parts.map((part, i) => (
                    <span key={i}>
                        {part}
                        {i < parts.length - 1 && (
                            <span className="inline-block min-w-[90px] border-b-2 border-amber-500 mx-1 px-2 text-center font-bold"
                                style={{ color: checked ? (isCorrect ? '#15803d' : '#b45309') : '#d97706' }}>
                                {checked ? (isCorrect ? answer : correctWord) : (answer || '___')}
                            </span>
                        )}
                    </span>
                ))}
            </span>
        );
    };

    return (
        <P2Layout
            title="Fill in the Blank"
            description="Type the missing word to complete the sentence"
            accent="#d97706"
        >
            <div className="space-y-6">
                <div className="text-center text-sm font-medium text-neutral-500">
                    Question {idx + 1} of {questions.length}
                </div>

                {/* Sentence */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                    <p className="text-neutral-800 text-base leading-relaxed font-medium text-center">
                        {renderSentence()}
                    </p>
                </div>

                {/* Input */}
                {!checked && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-amber-600">
                            Your Answer
                        </label>
                        <input
                            type="text"
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && answer.trim()) handleCheck(); }}
                            placeholder="Type the missing word…"
                            autoFocus
                            className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl text-neutral-900 text-base placeholder:text-neutral-300 focus:outline-none focus:border-amber-400 font-['Inter'] transition-all"
                        />
                        <p className="text-xs text-neutral-400">Press Enter or tap Check to submit</p>
                    </div>
                )}

                {/* Feedback */}
                {checked && (
                    <div className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                        {isCorrect
                            ? <><Check className="w-5 h-5 text-green-600 shrink-0" /><p className="text-green-800 font-semibold">Correct!</p></>
                            : <><X className="w-5 h-5 text-red-500 shrink-0" /><div><p className="text-red-700 font-semibold">Not quite.</p><p className="text-sm text-neutral-600 mt-0.5">Answer: <span className="font-bold text-neutral-900">"{correctWord}"</span></p></div></>
                        }
                    </div>
                )}

                {/* Actions */}
                {!checked ? (
                    <Button onClick={handleCheck} disabled={!answer.trim()} size="lg"
                        className="w-full h-12 bg-amber-600 hover:bg-amber-700 disabled:opacity-50">
                        Check Answer
                    </Button>
                ) : (
                    <Button onClick={handleNext} size="lg" className="w-full h-12 bg-amber-600 hover:bg-amber-700">
                        {idx < questions.length - 1
                            ? <><ChevronRight className="w-5 h-5 mr-2" />Next Question</>
                            : 'Finish Section'}
                    </Button>
                )}
            </div>
        </P2Layout>
    );
}
