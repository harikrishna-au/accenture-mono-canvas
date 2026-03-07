import { useState } from 'react';
import { P2Layout } from './P2Layout';
import { AudioPlayer } from '../communication-rounds/components/AudioPlayer';
import { Button } from '@/components/ui/button';
import { Mic, Square, BookOpen, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { useGameP2 } from './GameContextP2';
import { useSpeechRecognition } from '../communication-rounds/hooks/useSpeechRecognition';
import { useP2Questions } from './hooks/useP2Questions';

type Phase = 'listen' | 'retell' | 'done';

export function StoryRetellingP2() {
    const { addToHistory, nextRound } = useGameP2();
    // Fetch 1 random story per session
    const { questions, isLoading, error } = useP2Questions('P2_STORY_RETELLING', 1);
    const [phase, setPhase] = useState<Phase>('listen');
    const { transcript, isRecording, startRecording, stopRecording, error: speechError } = useSpeechRecognition();

    const handleStop = () => {
        stopRecording();
        setPhase('done');
    };

    const handleSubmit = () => {
        addToHistory({
            question: questions[0]?.audioSrc ?? '',
            answer: transcript || '(no response)',
            score: transcript ? 1 : 0,
            section: 'STORY_RETELLING',
        });
        nextRound();
    };

    if (isLoading) {
        return (
            <P2Layout title="Story Retelling" description="Loading story..." accent="#7c3aed">
                <div className="flex flex-col items-center gap-3 py-12">
                    <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
                    <p className="text-neutral-500 text-sm">Fetching story...</p>
                </div>
            </P2Layout>
        );
    }

    if (error || questions.length === 0) {
        return (
            <P2Layout title="Story Retelling" description="" accent="#7c3aed">
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="text-red-600 text-sm font-medium">{error ?? 'No story available.'}</p>
                    <Button onClick={nextRound} variant="outline" size="sm">Skip Section</Button>
                </div>
            </P2Layout>
        );
    }

    const story = questions[0];
    const storyText = story.audioSrc ?? '';
    const storyTitle = story.promptText ?? 'Short Story';

    return (
        <P2Layout
            title="Story Retelling"
            description="Listen to the story carefully, then retell it in your own words"
            accent="#7c3aed"
        >
            <div className="space-y-6">

                {/* Step 1 — Listen */}
                <div
                    className={`rounded-xl border-2 p-6 space-y-4 transition-opacity ${phase !== 'listen' ? 'opacity-50' : ''}`}
                    style={{ background: 'rgba(124,58,237,0.04)', borderColor: 'rgba(124,58,237,0.25)' }}
                >
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-violet-600" />
                        <p className="text-sm font-bold text-violet-700 uppercase tracking-widest">
                            Step 1 — Listen to the Story
                        </p>
                    </div>
                    <p className="text-xs text-neutral-500 font-medium italic">"{storyTitle}"</p>
                    <AudioPlayer
                        text={storyText}
                        voiceType={story.voiceType ?? 'female_1'}
                        audioUrl={story.audioUrl}
                        playOnce={true}
                        onPlayComplete={() => setPhase('retell')}
                    />
                    {phase === 'listen' && (
                        <p className="text-xs text-center text-neutral-400">
                            Listen carefully — you will retell this story after the audio ends.
                        </p>
                    )}
                </div>

                {/* Step 2 — Retell */}
                {(phase === 'retell' || phase === 'done') && (
                    <div
                        className="rounded-xl border-2 p-6 space-y-4"
                        style={{ background: 'rgba(124,58,237,0.04)', borderColor: 'rgba(124,58,237,0.25)' }}
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-violet-600" />
                            <p className="text-sm font-bold text-violet-700 uppercase tracking-widest">
                                Step 2 — Retell the Story
                            </p>
                        </div>
                        <p className="text-sm text-neutral-600">
                            Retell the story in your own words. Cover who the story is about, what happened, and the outcome.
                        </p>

                        {speechError && (
                            <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-700 text-sm">
                                {speechError}
                            </div>
                        )}

                        {phase === 'retell' && (
                            <div className="flex justify-center">
                                <Button
                                    onClick={isRecording ? handleStop : startRecording}
                                    disabled={!!speechError}
                                    size="lg"
                                    className={`w-52 h-14 text-base ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'}`}
                                >
                                    {isRecording
                                        ? <><Square className="w-5 h-5 mr-2" />Stop Retelling</>
                                        : <><Mic className="w-5 h-5 mr-2" />Start Retelling</>}
                                </Button>
                            </div>
                        )}

                        {phase === 'done' && (
                            <div className="space-y-4">
                                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                                    <p className="text-sm text-neutral-500 mb-1">Your retelling:</p>
                                    <p className="text-neutral-800 italic leading-relaxed">
                                        {transcript || '(no speech detected)'}
                                    </p>
                                </div>
                                <Button onClick={handleSubmit} size="lg" className="w-full h-12 bg-violet-600 hover:bg-violet-700">
                                    Finish &amp; Continue to Summary
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </P2Layout>
    );
}
