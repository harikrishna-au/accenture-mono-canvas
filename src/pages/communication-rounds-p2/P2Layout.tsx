import React, { ReactNode } from 'react';
import { useGameP2, P2_TOTAL_ROUNDS } from './GameContextP2';

interface P2LayoutProps {
    title: string;
    description: string;
    children: ReactNode;
    accent?: string; // hex color
}

export function P2Layout({ title, description, children, accent = '#7c3aed' }: P2LayoutProps) {
    const { currentRoundIndex } = useGameP2();
    const displayRound = currentRoundIndex + 1;
    const totalDisplay = P2_TOTAL_ROUNDS - 1; // exclude summary from "X of Y"

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="text-sm font-bold uppercase tracking-widest" style={{ color: accent }}>
                        Round {displayRound} of {totalDisplay}
                    </div>
                    <h1 className="text-3xl font-extrabold text-neutral-900">{title}</h1>
                    <p className="text-neutral-600">{description}</p>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${((currentRoundIndex) / (P2_TOTAL_ROUNDS - 1)) * 100}%`,
                            background: `linear-gradient(90deg, ${accent}, ${accent}99)`,
                        }}
                    />
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
