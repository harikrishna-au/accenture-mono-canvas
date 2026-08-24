import { GameProviderP2, useGameP2 } from './GameContextP2';
import { DeviceCheckP2 } from './DeviceCheckP2';
import { ReadSentenceP2 } from './ReadSentenceP2';
import { RepeatSentenceP2 } from './RepeatSentenceP2';
import { QASpokenP2 } from './QASpokenP2';
import { SentenceRearrangementP2 } from './SentenceRearrangementP2';
import { StoryRetellingP2 } from './StoryRetellingP2';
import { SummaryRoundP2 } from './SummaryRoundP2';
import PageWrapper from '@/components/PageWrapper';
import SEO from '@/components/SEO';
import Header from '@/components/Header';

// Round order matches GameContextP2 constants:
// 0: DeviceCheck, 1: ReadSentence, 2: RepeatSentence, 3: QASpoken,
// 4: SentenceRearrangement, 5: StoryRetelling, 6: Summary
const ROUND_COMPONENTS = [
    DeviceCheckP2,
    ReadSentenceP2,
    RepeatSentenceP2,
    QASpokenP2,
    SentenceRearrangementP2,
    StoryRetellingP2,
    SummaryRoundP2,
];

function RoundRouterP2() {
    const { currentRoundIndex } = useGameP2();
    const CurrentRound = ROUND_COMPONENTS[currentRoundIndex] ?? DeviceCheckP2;
    return <CurrentRound />;
}

export function CommunicationRoundsP2() {
    return (
        <GameProviderP2>
            <PageWrapper>
                <SEO title="Communication Assessment — Cognizant" />
                <Header />
                <RoundRouterP2 />
            </PageWrapper>
        </GameProviderP2>
    );
}
