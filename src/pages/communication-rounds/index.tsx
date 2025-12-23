import React from 'react';
import { GameProvider, useGame } from './GameContext';
import { DeviceCheckRound } from './DeviceCheckRound';
import { ConversationRound } from './ConversationRound';
import { ListeningComprehensionRound } from './ListeningComprehensionRound';
import { ReadingAloudRound } from './ReadingAloudRound';
import { RepeatRound } from './RepeatRound';
import { FillBlankRound } from './FillBlankRound';
import { ErrorCorrectionRound } from './ErrorCorrectionRound';
import { SpeakingTopicRound } from './SpeakingTopicRound';
import { WrittenRound } from './WrittenRound';
import { SummaryRound } from './SummaryRound';
import PageWrapper from '@/components/PageWrapper';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import { RoundLayout } from './components/RoundLayout';
import { useGame as useGameHook } from './GameContext';

// Correct Accenture Assessment Round Order
const ROUND_COMPONENTS = [
    DeviceCheckRound,              // 0: Microphone test
    ConversationRound,             // 1: Section A (6 questions)
    ListeningComprehensionRound,   // 2: Section B (6 questions)
    ReadingAloudRound,             // 3: Section C (8 questions)
    RepeatRound,                   // 4: Section D (8 questions)
    FillBlankRound,                // 5: Section E (5 questions)
    ErrorCorrectionRound,          // 6: Section F (5 questions)
    SpeakingTopicRound,            // 7: Section G (3 questions)
    WrittenRound,                  // 8: Written email
    SummaryRound                   // 9: Final analysis
];

function RoundRouter() {
    const { currentRoundIndex } = useGame();
    const CurrentRound = ROUND_COMPONENTS[currentRoundIndex] || DeviceCheckRound;

    return <CurrentRound />;
}

export function CommunicationRounds() {
    return (
        <GameProvider>
            <PageWrapper>
                <SEO title="Communication Assessment" />
                <Header />
                <RoundRouter />
            </PageWrapper>
        </GameProvider>
    );
}
