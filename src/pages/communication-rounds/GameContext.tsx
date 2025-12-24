import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SectionType } from '@/communication/data/types';

interface GameHistoryItem {
    question: string;
    answer: string;
    score: number;
    section: string;
}

interface GameContextType {
    // Game state
    gameHistory: GameHistoryItem[];
    currentRoundIndex: number;
    totalScore: number;

    // Actions
    addToHistory: (item: GameHistoryItem) => void;
    nextRound: () => void;
    previousRound: () => void;
    resetGame: () => void;
    setCurrentRound: (index: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const ROUNDS: SectionType[] = [
    'DEVICE_CHECK',
    'A', // Listening
    'B', // Conversation
    'C', // Reading
    'D', // Repeat
    'E', // Fill Blank
    'F', // Error Correction
    'G', // Monologue
    'WRITTEN',
    'SUMMARY'
];

export function GameProvider({ children }: { children: ReactNode }) {
    const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);

    const addToHistory = (item: GameHistoryItem) => {
        setGameHistory(prev => [...prev, item]);
        setTotalScore(prev => prev + item.score);
    };

    const nextRound = () => {
        if (currentRoundIndex < ROUNDS.length - 1) {
            setCurrentRoundIndex(prev => prev + 1);
        }
    };

    const previousRound = () => {
        if (currentRoundIndex > 0) {
            setCurrentRoundIndex(prev => prev - 1);
        }
    };

    const resetGame = () => {
        setGameHistory([]);
        setCurrentRoundIndex(0);
        setTotalScore(0);
    };

    const setCurrentRound = (index: number) => {
        if (index >= 0 && index < ROUNDS.length) {
            setCurrentRoundIndex(index);
        }
    };

    return (
        <GameContext.Provider
            value={{
                gameHistory,
                currentRoundIndex,
                totalScore,
                addToHistory,
                nextRound,
                previousRound,
                resetGame,
                setCurrentRound
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within GameProvider');
    }
    return context;
}

export { ROUNDS };
export type { GameHistoryItem };
