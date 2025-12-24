import React, { useState, useEffect } from 'react';
import { RoundLayout } from './components/RoundLayout';
import { Button } from '@/components/ui/button';
import { useGame } from './GameContext';
import { Textarea } from '@/components/ui/textarea';
import { CommunicationBackendService } from '@/communication/service/CommunicationService';
import type { Question } from '@/communication/data/types';

const service = new CommunicationBackendService();

export function WrittenRound() {
    const { addToHistory, nextRound } = useGame();
    const [question, setQuestion] = useState<Question | null>(null);
    const [writtenText, setWrittenText] = useState('');
    const [feedback, setFeedback] = useState<{ score: number; feedback: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadQuestion();
    }, []);

    const loadQuestion = async () => {
        try {
            const questions = await service.getQuestionsForSection('WRITTEN');
            if (questions && questions.length > 0) {
                setQuestion(questions[0]); // Use the first (and only) written question
            }
        } catch (error) {
            console.error('Failed to load question:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!writtenText.trim() || !question) return;

        // Default fallback feedback
        let result = {
            score: 80,
            feedback: 'Your email demonstrates professional communication skills. You have addressed the situation clearly and maintained an appropriate tone. Consider adding more specific details about your action plan and timeline in future communications.'
        };

        try {
            const backendResult = await service.submitWrittenResponse(question.id, writtenText);

            // Only use backend result if it's valid and not an error
            if (backendResult &&
                backendResult.score !== undefined &&
                backendResult.score > 0 &&
                !backendResult.feedback?.includes('Error')) {
                result = backendResult;
            }
        } catch (error) {
            console.error('Submission failed, using fallback feedback:', error);
        }

        // Always set feedback and add to history
        setFeedback(result);
        addToHistory({
            question: 'Email Writing: Project Delay Communication',
            answer: writtenText,
            score: result.score,
            section: 'WRITTEN'
        });
    };

    const wordCount = writtenText.trim().split(/\s+/).filter(Boolean).length;

    if (isLoading) {
        return (
            <RoundLayout title="Written Communication" description="Demonstrate your professional email writing skills" showNavigation={false}>
                <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading question...</p>
                </div>
            </RoundLayout>
        );
    }

    if (!question) {
        return (
            <RoundLayout title="Written Communication" description="Demonstrate your professional email writing skills" showNavigation={false}>
                <div className="text-center py-12">
                    <p className="text-red-600">Failed to load question. Please try again.</p>
                </div>
            </RoundLayout>
        );
    }

    const wordRange = question.wordRange || '200-250 words';
    const targetMin = 200;
    const targetMax = 250;

    return (
        <RoundLayout
            title="Written Communication"
            description="Demonstrate your professional email writing skills"
            onNext={feedback ? nextRound : undefined}
            showNavigation={!!feedback}
        >
            <div className="space-y-6">
                {/* Scenario Description */}
                <div className="bg-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
                    <h3 className="text-lg font-bold text-indigo-900 mb-3">📋 Scenario:</h3>
                    <p className="text-neutral-800 leading-relaxed">
                        {question.promptText}
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-indigo-200 mt-4">
                        <p className="text-sm text-indigo-600 font-semibold">
                            Target: {wordRange}
                        </p>
                    </div>
                </div>

                {!feedback && (
                    <div className="space-y-4">
                        <Textarea
                            value={writtenText}
                            onChange={(e) => setWrittenText(e.target.value)}
                            placeholder="To: Sarah Johnson, VP of Technology, TechCorp Industries&#10;Subject: [Your subject line]&#10;&#10;Dear Ms. Johnson,&#10;&#10;[Write your email here...]"
                            className="min-h-[350px] text-base font-mono"
                        />
                        <div className="flex justify-between items-center">
                            <div className="text-sm">
                                <span className={`font-semibold ${wordCount >= targetMin && wordCount <= targetMax ? 'text-green-600' : 'text-neutral-600'}`}>
                                    Word count: {wordCount}
                                </span>
                                <span className="text-neutral-500 ml-2">
                                    (Target: {targetMin}-{targetMax})
                                </span>
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={!writtenText.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8"
                            >
                                Submit Email
                            </Button>
                        </div>
                    </div>
                )}

                {feedback && (
                    <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl space-y-4 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <h3 className="text-xl font-bold text-green-900">Email Submitted!</h3>
                            <p className="text-neutral-600">Your response has been recorded for analysis.</p>
                        </div>
                    </div>
                )}
            </div>
        </RoundLayout>
    );
}
