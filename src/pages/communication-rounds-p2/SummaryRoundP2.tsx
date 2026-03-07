import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useGameP2 } from './GameContextP2';
import { useNavigate } from 'react-router-dom';
import { CommunicationBackendService } from '@/communication/service/CommunicationService';
import { CheckCircle, AlertCircle, Trophy } from 'lucide-react';

const service = new CommunicationBackendService();

const SECTION_LABELS: Record<string, string> = {
    READ_SENTENCE: 'Read the Sentence',
    REPEAT_SENTENCE: 'Listen & Repeat',
    QA_SPOKEN: 'Spoken Q&A',
    REARRANGEMENT: 'Sentence Rearrangement',
    STORY_RETELLING: 'Story Retelling',
};

export function SummaryRoundP2() {
    const { gameHistory, totalScore, resetGame } = useGameP2();
    const navigate = useNavigate();
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    useEffect(() => {
        analyze();
    }, []);

    const analyze = async () => {
        try {
            const result = await service.analyzeGame(gameHistory);
            setAnalysisResult(result);
        } catch {
            // handled below
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReturn = () => {
        resetGame();
        navigate('/dashboard');
    };

    if (isAnalyzing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto" />
                    <p className="text-lg font-semibold text-neutral-700">Analyzing your performance...</p>
                    <p className="text-sm text-neutral-400">AI is reviewing your responses across all 5 sections</p>
                </div>
            </div>
        );
    }

    const correct = gameHistory.filter(h => h.score === 1).length;
    const total = gameHistory.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-8 pb-16">

                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-violet-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-neutral-900">Assessment Complete</h1>
                    <p className="text-neutral-500">Pattern 2 — Performance Summary</p>
                </div>

                {/* Quick score */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Sections', value: '5' },
                        { label: 'Attempted', value: `${correct}/${total}` },
                        { label: 'Score', value: `${Math.round((correct / Math.max(total, 1)) * 100)}%` },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-neutral-100">
                            <div className="text-3xl font-black text-violet-700">{s.value}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* AI Score breakdown */}
                {analysisResult && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Fluency', score: analysisResult.fluency_score, color: 'text-blue-700', bg: 'bg-blue-50' },
                                { label: 'Grammar', score: analysisResult.grammar_score, color: 'text-indigo-700', bg: 'bg-indigo-50' },
                                { label: 'Vocabulary', score: analysisResult.vocabulary_score, color: 'text-violet-700', bg: 'bg-violet-50' },
                                { label: 'Pronunciation', score: analysisResult.pronunciation_score, color: 'text-pink-700', bg: 'bg-pink-50' },
                            ].map(item => (
                                <div key={item.label} className={`${item.bg} rounded-2xl p-5 flex flex-col items-center gap-1 shadow-sm`}>
                                    <div className={`text-4xl font-black ${item.color}`}>{item.score ?? '—'}</div>
                                    <div className={`text-xs font-bold uppercase tracking-wider ${item.color} opacity-80`}>{item.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Strengths & Improvements */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
                                <h3 className="font-bold text-green-700 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" /> Strengths
                                </h3>
                                <ul className="space-y-2">
                                    {(analysisResult.strengths || []).map((s: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
                                <h3 className="font-bold text-orange-700 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" /> Areas for Improvement
                                </h3>
                                <ul className="space-y-2">
                                    {(analysisResult.improvements || []).map((s: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Overall feedback */}
                        {analysisResult.overall_feedback && (
                            <div className="bg-neutral-900 text-white p-7 rounded-2xl space-y-2">
                                <h3 className="font-bold text-lg">Overall Feedback</h3>
                                <p className="text-neutral-300 leading-relaxed">{analysisResult.overall_feedback}</p>
                            </div>
                        )}
                    </>
                )}

                {/* Section breakdown from history */}
                <div className="space-y-4">
                    <h3 className="font-bold text-neutral-800 text-lg">Section Breakdown</h3>
                    {Object.entries(SECTION_LABELS).map(([key, label]) => {
                        const items = gameHistory.filter(h => h.section === key);
                        if (items.length === 0) return null;
                        const sectionScore = items.filter(h => h.score === 1).length;
                        return (
                            <div key={key} className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-neutral-800 text-sm">{label}</span>
                                    <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full">
                                        {sectionScore}/{items.length} completed
                                    </span>
                                </div>
                                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-violet-500 rounded-full transition-all"
                                        style={{ width: `${(sectionScore / items.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Return */}
                <div className="flex justify-center pt-4">
                    <Button
                        onClick={handleReturn}
                        className="h-13 px-10 rounded-full bg-neutral-900 hover:bg-neutral-700 text-white font-bold text-base"
                    >
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
