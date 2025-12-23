import React, { useState, useEffect } from 'react';
import { RoundLayout } from './components/RoundLayout';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';
import { useGame } from './GameContext';
import { CommunicationBackendService } from '@/communication/service/CommunicationService';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import type { Question } from '@/communication/data/types';

const service = new CommunicationBackendService();

export function ReadingAloudRound() {
    const { addToHistory, nextRound } = useGame();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const { transcript, isRecording, startRecording, stopRecording, resetTranscript, error: speechError } = useSpeechRecognition();
    const [isLoading, setIsLoading] = useState(true);

    const currentQuestion = questions[currentQuestionIndex];

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        try {
            const qs = await service.getQuestionsForSection('C');
            setQuestions(qs);
        } catch (error) {
            console.error('Failed to load questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleSubmit = () => {
        if (!currentQuestion || !transcript) return;

        addToHistory({
            question: currentQuestion.promptText || 'Reading Question',
            answer: transcript,
            score: 0,
            section: 'C'
        });

        if (isRecording) {
            stopRecording();
        }
        resetTranscript();

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                nextRound();
            }
        }, 50);
    };

    if (isLoading) {
        return (
            <RoundLayout title="Reading Aloud" description="Read the sentences clearly" showNavigation={false}>
                <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading questions...</p>
                </div>
            </RoundLayout>
        );
    }

    return (
        <RoundLayout title="Reading Aloud" description="Read the sentence clearly at a normal pace" showNavigation={false}>
            <div className="space-y-6">
                <div className="text-center text-sm text-neutral-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </div>

                <div className="bg-blue-50 p-8 rounded-xl border-2 border-blue-200">
                    <p className="text-xl text-neutral-900 text-center leading-relaxed">
                        {currentQuestion?.promptText}
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    {speechError && (
                        <div className="w-full bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 text-sm">
                            ⚠️ Microphone error: {speechError}. Please allow microphone access.
                        </div>
                    )}

                    <Button
                        onClick={handleToggleRecording}
                        disabled={!!speechError}
                        size="lg"
                        className={`w-48 h-16 text-lg ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isRecording ? (
                            <>
                                <Square className="w-5 h-5 mr-2" />
                                Stop Recording
                            </>
                        ) : (
                            <>
                                <Mic className="w-5 h-5 mr-2" />
                                Record Reading
                            </>
                        )}
                    </Button>
                </div>

                {transcript && (
                    <div className="w-full space-y-4">
                        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                            <p className="text-sm text-neutral-600 mb-1">Status:</p>
                            <p className="text-neutral-900 italic">Recording captured...</p>
                        </div>
                        <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                            Submit & Continue
                        </Button>
                    </div>
                )}
            </div>
        </RoundLayout>
    );
}
