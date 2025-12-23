import React, { useState, useEffect } from 'react';
import { RoundLayout } from './components/RoundLayout';
import { AudioPlayer } from './components/AudioPlayer';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';
import { useGame } from './GameContext';
import { CommunicationBackendService } from '@/communication/service/CommunicationService';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import type { Question } from '@/communication/data/types';

const service = new CommunicationBackendService();

export function ListeningComprehensionRound() {
    const { addToHistory, nextRound } = useGame();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentSubQuestionIndex, setCurrentSubQuestionIndex] = useState(0);
    const [contextPlayed, setContextPlayed] = useState(false);
    const { transcript, isRecording, startRecording, stopRecording, resetTranscript, error: speechError } = useSpeechRecognition();
    const [isLoading, setIsLoading] = useState(true);

    const currentQuestion = questions[currentQuestionIndex];

    // Handle both formats: with subQuestions array OR direct audioSrc
    const currentSubQuestion = currentQuestion?.subQuestions?.[currentSubQuestionIndex] ||
        (currentQuestion && !currentQuestion.subQuestions ? {
            id: currentQuestion.id,
            section: currentQuestion.section,
            audioSrc: currentQuestion.audioSrc,
            text: currentQuestion.audioSrc,
            correctAnswer: currentQuestion.correctAnswer
        } : null);

    const totalSubQuestions = currentQuestion?.subQuestions?.length || 1;

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        try {
            const qs = await service.getQuestionsForSection('B');
            setQuestions(qs);
        } catch (error) {
            console.error('Failed to load questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleContextPlayComplete = () => {
        setContextPlayed(true);
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleSubmit = () => {
        if (!currentSubQuestion || !transcript) return;

        // Store the answer
        addToHistory({
            question: currentSubQuestion.audioSrc || currentSubQuestion.text || 'Listening Question',
            answer: transcript,
            score: 0,
            section: 'B'
        });

        // Stop recording and clear transcript
        if (isRecording) {
            stopRecording();
        }
        resetTranscript();

        // Move to next question with slight delay to ensure state clears
        setTimeout(() => {
            const hasMoreSubQuestions = currentQuestion?.subQuestions &&
                currentSubQuestionIndex < currentQuestion.subQuestions.length - 1;

            if (hasMoreSubQuestions) {
                setCurrentSubQuestionIndex(prev => prev + 1);
            } else if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setCurrentSubQuestionIndex(0);
                setContextPlayed(false);
            } else {
                nextRound();
            }
        }, 50);
    };

    if (isLoading) {
        return (
            <RoundLayout title="Listening Comprehension" description="Listen carefully and answer questions" showNavigation={false}>
                <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading questions...</p>
                </div>
            </RoundLayout>
        );
    }

    return (
        <RoundLayout title="Listening Comprehension" description="Listen to the passage and answer questions" showNavigation={false}>
            <div className="space-y-6">
                {!contextPlayed && currentQuestion?.contextAudioSrc && (
                    <div className="space-y-4">
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-purple-900 mb-2">📖 Listen to the Context</h3>
                            <p className="text-sm text-neutral-600">{currentQuestion.promptText}</p>
                        </div>
                        <AudioPlayer
                            text={currentQuestion.contextAudioSrc}
                            voiceType="female_1"
                            playOnce={true}
                            onPlayComplete={handleContextPlayComplete}
                        />
                    </div>
                )}

                {contextPlayed && currentSubQuestion && (
                    <>
                        <div className="text-center text-sm text-neutral-600">
                            Question {currentSubQuestionIndex + 1} of {currentQuestion?.subQuestions?.length || 0}
                        </div>

                        <div className="space-y-4">
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-purple-900 mb-2">🎧 Listen to the Question</h3>
                            </div>
                            <AudioPlayer
                                text={currentSubQuestion.audioSrc || currentSubQuestion.text || ''}
                                voiceType="female_1"
                                playOnce={false}
                            />
                        </div>

                        <div className="bg-purple-50 p-6 rounded-xl">
                            <p className="text-lg text-neutral-800 text-center">
                                {currentSubQuestion.audioSrc || currentSubQuestion.text}
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
                                className={`w-48 h-16 text-lg ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                            >
                                {isRecording ? (
                                    <>
                                        <Square className="w-5 h-5 mr-2" />
                                        Stop Recording
                                    </>
                                ) : (
                                    <>
                                        <Mic className="w-5 h-5 mr-2" />
                                        Record Answer
                                    </>
                                )}
                            </Button>
                        </div>

                        {transcript && (
                            <div className="w-full space-y-4">
                                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                                    <p className="text-sm text-neutral-600 mb-1">Your answer:</p>
                                    <p className="text-neutral-900">{transcript}</p>
                                </div>
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
