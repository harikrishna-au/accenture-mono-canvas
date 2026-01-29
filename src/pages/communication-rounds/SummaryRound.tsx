import React, { useState, useEffect } from 'react';
import { RoundLayout } from './components/RoundLayout';
import { Button } from '@/components/ui/button';
import { useGame } from './GameContext';
import { useNavigate } from 'react-router-dom';
import { CommunicationBackendService } from '@/communication/service/CommunicationService';
import { CheckCircle, AlertCircle } from 'lucide-react';

const service = new CommunicationBackendService();

export function SummaryRound() {
    const { gameHistory, resetGame } = useGame();
    const navigate = useNavigate();
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    useEffect(() => {
        analyzeGame();
    }, []);

    const analyzeGame = async () => {
        try {
            const result = await service.analyzeGame(gameHistory);
            setAnalysisResult(result);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReturnToDashboard = () => {
        resetGame();
        navigate('/dashboard/Accenture');
    };

    if (isAnalyzing) {
        return (
            <RoundLayout
                title="Analyzing Performance"
                description="Please wait while we analyze your responses"
                showNavigation={false}
            >
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-neutral-600">Analyzing your vocabulary, grammar, and fluency with AI...</p>
                </div>
            </RoundLayout>
        );
    }

    if (!analysisResult) {
        return (
            <RoundLayout
                title="Assessment Complete"
                description="Unable to generate analysis"
                showNavigation={false}
            >
                <div className="text-center space-y-4">
                    <p className="text-red-500">Could not generate detailed analysis.</p>
                    <Button onClick={handleReturnToDashboard} className="bg-neutral-900">
                        Return to Dashboard
                    </Button>
                </div>
            </RoundLayout>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold text-neutral-900">Performance Analysis</h1>
                    <p className="text-xl text-neutral-600">Here is your detailed breakdown</p>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Fluency', score: analysisResult.fluency_score, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Grammar', score: analysisResult.grammar_score, color: 'bg-indigo-50 text-indigo-700' },
                        { label: 'Vocabulary', score: analysisResult.vocabulary_score, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Pronunciation', score: analysisResult.pronunciation_score, color: 'bg-pink-50 text-pink-700' },
                    ].map((item) => (
                        <div key={item.label} className={`p-6 rounded-2xl ${item.color} flex flex-col items-center justify-center space-y-2`}>
                            <div className="text-4xl font-black">{item.score}</div>
                            <div className="text-sm font-bold uppercase tracking-wider opacity-80">{item.label}</div>
                        </div>
                    ))}
                </div>

                {/* Feedback Section */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 space-y-6">
                        <h3 className="text-xl font-bold text-green-700 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6" /> Strengths
                        </h3>
                        <ul className="space-y-3">
                            {analysisResult.strengths?.map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-neutral-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2.5" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 space-y-6">
                        <h3 className="text-xl font-bold text-orange-700 flex items-center gap-2">
                            <AlertCircle className="w-6 h-6" /> Areas for Improvement
                        </h3>
                        <ul className="space-y-3">
                            {analysisResult.improvements?.map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-neutral-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Overall Summary */}
                <div className="bg-neutral-900 text-white p-8 rounded-3xl shadow-lg space-y-4">
                    <h3 className="text-xl font-bold">Overall Feedback</h3>
                    <p className="text-lg text-neutral-300 leading-relaxed">
                        {analysisResult.overall_feedback}
                    </p>
                </div>

                {/* Section-wise Analysis */}
                {analysisResult.section_feedback && analysisResult.section_feedback.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-neutral-900">Section Breakdown</h3>
                        <div className="grid gap-6">
                            {analysisResult.section_feedback.map((sec: any, idx: number) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col gap-2">
                                    <div className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                                        {sec.section}
                                    </div>
                                    <p className="text-neutral-700 leading-relaxed">
                                        {sec.feedback}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Return Button */}
                <div className="flex justify-center pt-8">
                    <Button
                        onClick={handleReturnToDashboard}
                        className="h-14 px-12 text-lg rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-900 font-bold transition-all"
                    >
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
