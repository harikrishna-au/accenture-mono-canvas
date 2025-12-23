import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { useGame } from '../GameContext';

interface RoundLayoutProps {
    title: string;
    description: string;
    children: ReactNode;
    onNext?: () => void;
    onPrevious?: () => void;
    showNavigation?: boolean;
    isLastRound?: boolean;
}

export function RoundLayout({
    title,
    description,
    children,
    onNext,
    onPrevious,
    showNavigation = true,
    isLastRound = false
}: RoundLayoutProps) {
    const { currentRoundIndex, nextRound } = useGame();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                        Round {currentRoundIndex + 1} of 10
                    </div>
                    <h1 className="text-3xl font-extrabold text-neutral-900">{title}</h1>
                    <p className="text-neutral-600">{description}</p>
                </div>

                {/* Main Content */}
                <Card className="p-8 bg-white shadow-lg">
                    {children}
                </Card>

                {/* Navigation */}
                <div className="flex justify-end items-center">
                    {showNavigation && (
                        <Button
                            onClick={onNext}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            {isLastRound ? 'Finish' : 'Next Round'}
                            {!isLastRound && <ChevronRight className="w-4 h-4" />}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
