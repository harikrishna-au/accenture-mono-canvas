import React from 'react';
import { Button } from '@/components/ui/button';
import { RoundLayout } from './RoundLayout';

interface RoundInfoProps {
    section: string;
    title: string;
    description: string;
    skillsTested: string[];
    onStart: () => void;
}

export function RoundInfo({ section, title, description, skillsTested, onStart }: RoundInfoProps) {
    return (
        <RoundLayout title={title} description="" showNavigation={false}>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Section Badge */}
                <div className="flex justify-center">
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold text-sm">
                        Section {section}
                    </div>
                </div>

                {/* Task Description */}
                <div className="bg-white p-6 rounded-xl border-2 border-neutral-200 space-y-4">
                    <h3 className="text-lg font-bold text-neutral-900">📋 Task Description</h3>
                    <p className="text-neutral-700 leading-relaxed">{description}</p>
                </div>

                {/* Skills Tested */}
                <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200 space-y-4">
                    <h3 className="text-lg font-bold text-purple-900">🎯 Skills Tested</h3>
                    <div className="flex flex-wrap gap-2">
                        {skillsTested.map((skill, idx) => (
                            <span
                                key={idx}
                                className="bg-purple-200 text-purple-900 px-3 py-1 rounded-full text-sm font-medium"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Start Button */}
                <div className="flex justify-center pt-4">
                    <Button
                        onClick={onStart}
                        size="lg"
                        className="h-14 px-12 text-lg bg-green-600 hover:bg-green-700 rounded-full"
                    >
                        Start This Round →
                    </Button>
                </div>
            </div>
        </RoundLayout>
    );
}
