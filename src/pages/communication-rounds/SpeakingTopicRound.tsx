import React, { useState, useEffect } from 'react';
import { RoundLayout } from './components/RoundLayout';
import { RoundLoadError } from './components/RoundLoadError';
import { Button } from '@/components/ui/button';
import { Mic, Square, Clock } from 'lucide-react';
import { useGame } from './GameContext';
import { CommunicationBackendService } from '@/communication/service/CommunicationService';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import type { Question } from '@/communication/data/types';

const service = new CommunicationBackendService();

export function SpeakingTopicRound() {
    const { addToHistory, nextRound } = useGame();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const { transcript, isRecording, startRecording, stopRecording, resetTranscript, error: speechError } = useSpeechRecognition();
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [isPreparing, setIsPreparing] = useState(true);
    const [prepTimeLeft, setPrepTimeLeft] = useState(25);
    const [speakTimeLeft, setSpeakTimeLeft] = useState(45);

    const currentQuestion = questions[currentQuestionIndex];

    useEffect(() => {
        loadQuestions();
    }, []);

    useEffect(() => {
        if (isPreparing && prepTimeLeft > 0) {
            const timer = setTimeout(() => setPrepTimeLeft(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isPreparing && prepTimeLeft === 0) {
            setIsPreparing(false);
        }
    }, [isPreparing, prepTimeLeft]);

    useEffect(() => {
        if (!isPreparing && isRecording && speakTimeLeft > 0) {
            const timer = setTimeout(() => setSpeakTimeLeft(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else if (!isPreparing && speakTimeLeft === 0 && isRecording) {
            stopRecording();
        }
    }, [isPreparing, isRecording, speakTimeLeft]);

    const loadQuestions = async () => {
        setIsLoading(true);
        setLoadError(false);
        try {
            const qs = await service.getQuestionsForSection('G');
            if (!qs || qs.length === 0) {
                setLoadError(true);
            } else {
                // Shuffle questions to ensure variety
                const shuffled = [...qs].sort(() => 0.5 - Math.random());
                setQuestions(shuffled.slice(0, 1)); // Limit to 1 random question
            }
        } catch (error) {
            console.error('Failed to load questions:', error);
            setLoadError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartSpeaking = () => {
        startRecording();
    };

    const handleStopSpeaking = () => {
        stopRecording();
    };

    const handleSubmit = () => {
        if (!currentQuestion || !transcript) return;

        addToHistory({
            question: currentQuestion.promptText || 'Speaking Topic',
            answer: transcript,
            score: 0,
            section: 'G'
        });

        if (isRecording) {
            stopRecording();
        }
        resetTranscript();

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setIsPreparing(true);
                setPrepTimeLeft(25);
                setSpeakTimeLeft(45);
            } else {
                nextRound();
            }
        }, 50);
    };

    if (isLoading) {
        return (
            <RoundLayout title="Speaking on a Topic" description="Speak for 45 seconds" showNavigation={false}>
                <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading questions...</p>
                </div>
            </RoundLayout>
        );
    }

    if (loadError || !currentQuestion) {
        return (
            <RoundLayout title="Speaking on a Topic" description="Speak for 45 seconds" showNavigation={false}>
                <RoundLoadError onRetry={loadQuestions} />
            </RoundLayout>
        );
    }

    return (
        <RoundLayout title="Speaking on a Topic" description="Prepare for 25 seconds, then speak for 45 seconds" showNavigation={false}>
            <div className="space-y-6">
                <div className="text-center text-sm text-neutral-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </div>

                <div className="bg-indigo-50 p-8 rounded-xl border-2 border-indigo-200">
                    <h3 className="text-xl font-bold text-indigo-900 mb-4 text-center">📝 Your Topic</h3>
                    <p className="text-lg text-neutral-800 text-center leading-relaxed">
                        {currentQuestion?.promptText}
                    </p>
                </div>

                {isPreparing && (
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 text-orange-600">
                            <Clock className="w-6 h-6" />
                            <span className="text-3xl font-bold">{prepTimeLeft}s</span>
                        </div>
                        <p className="text-neutral-600">Preparation time remaining...</p>
                    </div>
                )}

                {!isPreparing && (
                    <>
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-2 text-indigo-600">
                                <Clock className="w-6 h-6" />
                                <span className="text-3xl font-bold">{speakTimeLeft}s</span>
                            </div>
                            <p className="text-neutral-600">Speaking time remaining</p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            {speechError && (
                                <div className="w-full bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 text-sm">
                                    ⚠️ {speechError}
                                </div>
                            )}

                            {!isRecording && speakTimeLeft === 45 && (
                                <Button
                                    onClick={handleStartSpeaking}
                                    disabled={!!speechError}
                                    size="lg"
                                    className="w-48 h-16 text-lg bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <Mic className="w-5 h-5 mr-2" />
                                    Start Speaking
                                </Button>
                            )}

                            {isRecording && (
                                <Button
                                    onClick={handleStopSpeaking}
                                    size="lg"
                                    className="w-48 h-16 text-lg bg-red-600 hover:bg-red-700"
                                >
                                    <Square className="w-5 h-5 mr-2" />
                                    Stop Speaking
                                </Button>
                            )}
                        </div>

                        {transcript && !isRecording && (
                            <div className="w-full space-y-4">
                                <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                                    Submit & Continue
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </RoundLayout>
    );
}
