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

export function FillBlankRound() {
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
            const qs = await service.getQuestionsForSection('E');
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
            question: currentQuestion.audioSrc || 'Fill Blank Question',
            answer: transcript,
            score: 0,
            section: 'E'
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
            <RoundLayout title="Fill in the Missing Word" description="Complete the sentence" showNavigation={false}>
                <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading questions...</p>
                </div>
            </RoundLayout>
        );
    }

    return (
        <RoundLayout title="Fill in the Missing Word" description="Listen and repeat the full sentence with the blank filled in" showNavigation={false}>
            <div className="space-y-6">
                <div className="text-center text-sm text-neutral-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </div>

                <div className="space-y-4">
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-orange-900 mb-2">🎧 Listen to the Sentence with a Blank</h3>
                        <p className="text-sm text-neutral-600">Fill in the missing word and repeat the full sentence</p>
                    </div>
                    <AudioPlayer
                        text={currentQuestion?.audioSrc?.replace(/_+/g, ' blank ') || ''}
                        voiceType={currentQuestion?.voiceType || 'male_1'}
                        playOnce={false}
                    />
                </div>

                <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
                    <p className="text-lg text-neutral-800 text-center italic">
                        (Listen to the audio to hear the sentence)
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    {speechError && (
                        <div className="w-full bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 text-sm">
                            ⚠️ {speechError}
                        </div>
                    )}

                    <Button
                        onClick={handleToggleRecording}
                        disabled={!!speechError}
                        size="lg"
                        className={`w-48 h-16 text-lg ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                        {isRecording ? (
                            <>
                                <Square className="w-5 h-5 mr-2" />
                                Stop Recording
                            </>
                        ) : (
                            <>
                                <Mic className="w-5 h-5 mr-2" />
                                Record Full Sentence
                            </>
                        )}
                    </Button>
                </div>

                {transcript && (
                    <div className="w-full space-y-4">
                        <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                            Submit & Continue
                        </Button>
                    </div>
                )}
            </div>
        </RoundLayout>
    );
}
