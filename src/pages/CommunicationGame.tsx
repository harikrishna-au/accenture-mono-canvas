import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Play,
    CheckCircle,
    AlertCircle,
    Mic,
    Send,
    ChevronRight,
    Volume2
} from 'lucide-react';
import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import AudioRecorder from '../communication/components/AudioRecorder';
import { communicationService } from '../communication/service/CommunicationService';
import { SectionType, Question, SECTIONS } from '../communication/data/types';

type GameState = 'INTRO' | 'SECTION_INTRO' | 'PLAYING' | 'FEEDBACK' | 'SUMMARY';

export default function CommunicationGame() {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState<GameState>('INTRO');
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [isBotSpeaking, setIsBotSpeaking] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState<{ score: number; feedback: string } | null>(null);
    const [totalScore, setTotalScore] = useState(0);
    const [writtenText, setWrittenText] = useState('');

    // Monologue specific
    const [prepTimeLeft, setPrepTimeLeft] = useState(0);

    const currentSectionInfo = SECTIONS[currentSectionIndex];

    // Load question when section changes
    useEffect(() => {
        if (gameState === 'SECTION_INTRO') {
            const loadQ = async () => {
                const q = await communicationService.getQuestionForSection(currentSectionInfo.id);
                if (q) setCurrentQuestion(q);
            };
            loadQ();
        }
    }, [gameState, currentSectionIndex, currentSectionInfo]);

    const startSection = () => {
        setGameState('PLAYING');
        setTranscript('');
        setFeedback(null);
        setWrittenText('');

        // Auto-play audio if exists (except for Monologue/Written where specific flow might differ)
        if (currentQuestion?.audioSrc && currentSectionInfo.id !== 'G') {
            playBotAudio();
        }

        // Monologue Timer Logic
        if (currentSectionInfo.id === 'G') {
            setPrepTimeLeft(30);
        }
    };

    const playBotAudio = () => {
        if (!currentQuestion?.audioSrc) return;

        setIsBotSpeaking(true);
        communicationService.speak(currentQuestion.audioSrc, () => {
            // If there's a follow-up question (Listening Comp), play it after a short pause
            if (currentQuestion.followUpQuestion) {
                setTimeout(() => {
                    if (gameState !== 'PLAYING') return; // Safety check
                    communicationService.speak(currentQuestion.followUpQuestion!, () => {
                        setIsBotSpeaking(false);
                    });
                }, 1000); // 1 second pause between passage and question
            } else {
                setIsBotSpeaking(false);
            }
        });
    };

    const stopBotAudio = () => {
        communicationService.stopSpeaking();
        setIsBotSpeaking(false);
    };

    const handleStartRecording = () => {
        stopBotAudio(); // Stop bot if user interrupts
        setIsRecording(true);
        setTranscript('');
    };

    const handleStopRecording = async () => {
        setIsRecording(false);
        // Auto-submit after silence or manual stop
        if (currentQuestion) {
            const result = await communicationService.submitAudioResponse(currentQuestion.id, transcript);
            setFeedback(result);
            setTotalScore(prev => prev + result.score);
            setGameState('FEEDBACK');
        }
    };

    const handleSubmitWritten = async () => {
        if (currentQuestion) {
            const result = await communicationService.submitWrittenResponse(currentQuestion.id, writtenText);
            setFeedback(result);
            setTotalScore(prev => prev + result.score);
            setGameState('FEEDBACK');
        }
    };

    const handleNext = () => {
        if (currentSectionIndex < SECTIONS.length - 1) {
            setCurrentSectionIndex(prev => prev + 1);
            setGameState('SECTION_INTRO');
        } else {
            setGameState('SUMMARY');
        }
    };

    // Monologue Prep Timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (gameState === 'PLAYING' && currentSectionInfo.id === 'G' && prepTimeLeft > 0) {
            timer = setInterval(() => {
                setPrepTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [gameState, currentSectionInfo, prepTimeLeft]);

    // Render Functions
    const renderIntro = () => (
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-8 animate-fade-in-up">
            <div className="p-6 bg-blue-50 rounded-full">
                <Volume2 className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-extrabold text-neutral-900">Communication Assessment</h1>
            <p className="text-xl text-neutral-600">
                Test your verbal and written communication skills across 8 immersive rounds.
                Ensure you are in a quiet environment.
            </p>
            <Button onClick={() => setGameState('SECTION_INTRO')} className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                Start Assessment <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
    );

    const renderSectionIntro = () => (
        <div className="flex flex-col items-center text-center max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="text-sm font-bold text-blue-600 uppercase tracking-widest">Section {currentSectionInfo.id}</div>
            <h2 className="text-3xl font-bold text-neutral-900">{currentSectionInfo.title}</h2>
            <p className="text-lg text-neutral-600 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                {currentSectionInfo.instructions}
            </p>
            <div className="text-sm text-neutral-500 font-medium">
                Testing: <span className="text-neutral-800">{currentSectionInfo.skillTested}</span>
            </div>
            <Button onClick={startSection} className="h-12 px-8 rounded-xl bg-neutral-900 text-white">
                Begin Section
            </Button>
        </div>
    );

    const renderPlaying = () => {
        const isWritten = currentSectionInfo.id === 'WRITTEN';

        return (
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
                {/* Header Logic */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <span className="text-xs font-bold text-blue-600 uppercase">{currentSectionInfo.title}</span>
                        <h3 className="text-xl font-bold text-neutral-900">Question {currentSectionIndex + 1} / {SECTIONS.length}</h3>
                    </div>
                    {currentSectionInfo.id === 'G' && prepTimeLeft > 0 && (
                        <div className="text-orange-600 font-bold bg-orange-50 px-4 py-2 rounded-lg">
                            Prep Time: {prepTimeLeft}s
                        </div>
                    )}
                </div>

                {/* Question Area */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 min-h-[200px] flex flex-col items-center justify-center text-center space-y-6">
                    {currentQuestion?.audioSrc && (
                        <div className={`p-4 rounded-full transition-all ${isBotSpeaking ? 'bg-blue-100 scale-110' : 'bg-neutral-100'}`}>
                            <Volume2 className={`w-8 h-8 ${isBotSpeaking ? 'text-blue-600 animate-pulse' : 'text-neutral-500'}`} />
                        </div>
                    )}

                    {currentQuestion?.promptText && (
                        <p className="text-2xl font-medium text-neutral-800 leading-relaxed">
                            {currentQuestion.promptText}
                        </p>
                    )}

                    {/* Show Follow-up question text ONLY when it's being spoken or after to aid user */}
                    {currentQuestion?.followUpQuestion && !isBotSpeaking && (
                        <p className="text-xl font-medium text-blue-600 animate-fade-in-up">
                            Question: {currentQuestion.followUpQuestion}
                        </p>
                    )}

                    {currentQuestion?.audioSrc && !isBotSpeaking && (
                        <Button variant="outline" size="sm" onClick={playBotAudio} className="gap-2">
                            <Play className="w-4 h-4" /> Replay Audio
                        </Button>
                    )}
                </div>

                {/* Answer Area */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    {isWritten ? (
                        <div className="w-full space-y-4">
                            <Textarea
                                placeholder="Type your email here..."
                                className="min-h-[200px] text-lg p-6 bg-white border-neutral-200 focus:ring-blue-500 rounded-xl resize-none"
                                value={writtenText}
                                onChange={(e) => setWrittenText(e.target.value)}
                            />
                            <div className="flex justify-end text-sm text-neutral-500">
                                Word Count: {writtenText.trim().split(/\s+/).filter(w => w.length > 0).length} (Min: 30)
                            </div>
                            <Button onClick={handleSubmitWritten} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white">
                                Submit Response <Send className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            {currentSectionInfo.id === 'G' && prepTimeLeft > 0 ? (
                                <div className="text-neutral-500">Prepare your speech...</div>
                            ) : (
                                <div className="flex flex-col items-center gap-6 w-full">
                                    <AudioRecorder
                                        isRecording={isRecording}
                                        onStart={handleStartRecording}
                                        onStop={handleStopRecording}
                                        onTranscript={setTranscript}
                                    />

                                    {transcript && (
                                        <div className="w-full bg-neutral-50 p-4 rounded-xl text-left border border-neutral-100">
                                            <span className="text-xs font-bold text-neutral-400 uppercase">Live Transcript</span>
                                            <p className="text-neutral-700 mt-1">{transcript}</p>
                                        </div>
                                    )}

                                    {transcript && !isRecording && (
                                        <Button onClick={() => setGameState('FEEDBACK')} variant="ghost" className="text-neutral-500">
                                            Skip Grading (Debug)
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderFeedback = () => (
        <div className="flex flex-col items-center text-center max-w-md mx-auto space-y-8 animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Section Complete</h2>
                <p className="text-neutral-500">Here's how you performed</p>
            </div>

            <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                    <span className="text-neutral-600 font-medium">Score</span>
                    <span className="text-2xl font-bold text-green-600">{feedback?.score}/100</span>
                </div>
                <p className="text-left text-neutral-700 leading-relaxed bg-neutral-50 p-4 rounded-xl">
                    {feedback?.feedback}
                </p>
            </div>

            <Button onClick={handleNext} className="w-full h-14 rounded-xl bg-neutral-900 text-white text-lg">
                Continue <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
    );

    const renderSummary = () => (
        <div className="flex flex-col items-center text-center max-w-lg mx-auto space-y-8 animate-fade-in-up">
            <h1 className="text-4xl font-extrabold text-neutral-900">Assessment Complete!</h1>
            <div className="p-10 bg-white rounded-3xl shadow-xl border border-neutral-100 w-full">
                <div className="text-sm text-neutral-500 uppercase tracking-widest mb-4">Total Score</div>
                <div className="text-6xl font-black text-blue-600 mb-2">{totalScore}</div>
                <div className="text-neutral-400 font-medium">out of {SECTIONS.length * 100}</div>
            </div>
            <Button onClick={() => navigate('/dashboard')} className="h-14 px-10 text-lg rounded-full bg-neutral-900 text-white">
                Return to Dashboard
            </Button>
        </div>
    );

    return (
        <PageWrapper>
            <div className="min-h-screen bg-neutral-50/50 pb-20">
                <Header />

                <main className="container mx-auto px-4 pt-8">
                    {gameState === 'INTRO' && renderIntro()}
                    {gameState === 'SECTION_INTRO' && renderSectionIntro()}
                    {gameState === 'PLAYING' && renderPlaying()}
                    {gameState === 'FEEDBACK' && renderFeedback()}
                    {gameState === 'SUMMARY' && renderSummary()}
                </main>
            </div>
        </PageWrapper>
    );
}
