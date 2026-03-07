import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface GameHistoryItemP2 {
    question: string;
    answer: string;
    score: number;       // 1 = correct / 0 = attempted
    section: string;
}

interface GameContextP2Type {
    gameHistory: GameHistoryItemP2[];
    currentRoundIndex: number;
    totalScore: number;
    addToHistory: (item: GameHistoryItemP2) => void;
    nextRound: () => void;
    resetGame: () => void;
}

export const P2_TOTAL_ROUNDS = 7;
// 0: DeviceCheck, 1: ReadSentence, 2: RepeatSentence, 3: QASpoken,
// 4: SentenceRearrangement, 5: StoryRetelling, 6: Summary

const GameContextP2 = createContext<GameContextP2Type | undefined>(undefined);

export function GameProviderP2({ children }: { children: ReactNode }) {
    const [gameHistory, setGameHistory] = useState<GameHistoryItemP2[]>([]);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);

    const addToHistory = (item: GameHistoryItemP2) => {
        setGameHistory(prev => [...prev, item]);
        setTotalScore(prev => prev + item.score);
    };

    const nextRound = () => {
        setCurrentRoundIndex(prev => Math.min(prev + 1, P2_TOTAL_ROUNDS - 1));
    };

    const resetGame = () => {
        setGameHistory([]);
        setCurrentRoundIndex(0);
        setTotalScore(0);
    };

    return (
        <GameContextP2.Provider value={{ gameHistory, currentRoundIndex, totalScore, addToHistory, nextRound, resetGame }}>
            {children}
        </GameContextP2.Provider>
    );
}

export function useGameP2() {
    const ctx = useContext(GameContextP2);
    if (!ctx) throw new Error('useGameP2 must be used within GameProviderP2');
    return ctx;
}
