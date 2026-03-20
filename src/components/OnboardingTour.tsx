import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TourStep {
    targetId?: string;
    title: string;
    description: string;
    position: 'center' | 'target';
}

const JOURNEY_STEPS: TourStep[] = [
    {
        title: "Welcome to Harry The Blaze",
        description: "This is a practice environment designed to help you eliminate fear before your real placement assessments. Practice repeatedly to build confidence.",
        position: 'center'
    },
    {
        targetId: 'onboarding-tr-group',
        title: "Technical Round (TR) Practice",
        description: "The Technical Round includes 3 distinct cognitive puzzles. We have built these games from scratch so you can master the logic before your real assessment.",
        position: 'target'
    },
    {
        targetId: 'onboarding-comm-card',
        title: "Communication Round",
        description: "For those who clear the TR, we offer a complete simulation of the Communication Round. Practice answering, listening, and repeating to get instant AI feedback.",
        position: 'target'
    },
    {
        targetId: 'onboarding-premium-card',
        title: "Unlock Your Full Potential",
        description: "Premium members get access to extra levels, advanced feedback, and the full Communication Round experience. Good luck!",
        position: 'target'
    }
];

const LANDING_STEPS: TourStep[] = [
    {
        title: "Welcome to Harry The Blaze",
        description: "Six focused tools to prepare you for every stage of top MNC hiring — from cognitive puzzles to job matching. Let's take a quick tour.",
        position: 'center'
    },
    {
        targetId: 'onboarding-tr-group',
        title: "Cognitive Puzzles",
        description: "Practice the exact logic games used in Accenture & other MNC assessments — Matrix Flow, Balloon Math, and Hidden Maze. Repeat until you're fearless.",
        position: 'target'
    },
    {
        targetId: 'onboarding-comm-card',
        title: "Communication Round",
        description: "Full simulation of the spoken communication round. Practice QA, sentence repeating, story retelling, and more — with instant AI feedback.",
        position: 'target'
    },
    {
        targetId: 'onboarding-ai-card',
        title: "AI Mock Interview",
        description: "Face a real-time AI interviewer that asks questions and evaluates your answers on confidence, clarity, and relevance. Great for HR prep.",
        position: 'target'
    },
    {
        targetId: 'onboarding-connect-card',
        title: "1:1 Connect",
        description: "Book a session with someone who just cracked the same process — last month. Real guidance, zero guesswork.",
        position: 'target'
    },
    {
        targetId: 'onboarding-premium-card',
        title: "Forge — Resume Builder",
        description: "Upload your PDF or DOCX and let AI extract everything. Edit, refine, and export as a clean LaTeX resume. Free to use.",
        position: 'target'
    },
    {
        targetId: 'onboarding-radar-card',
        title: "Radar — Job Match",
        description: "Radar scans your skills against real job openings and ranks them by match score. See exactly what you're missing and where to apply first.",
        position: 'target'
    }
];

interface OnboardingTourProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'landing' | 'journey';
}

export const OnboardingTour = ({ isOpen, onClose, mode = 'journey' }: OnboardingTourProps) => {
    const steps = mode === 'landing' ? LANDING_STEPS : JOURNEY_STEPS;
    // Internal step state remains
    const [currentStep, setCurrentStep] = useState(0);

    // Reset step when opened
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);





    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleClose = () => {
        onClose();
        localStorage.setItem('has_seen_tour_v1', 'true');
    };

    if (!isOpen) return null;

    const step = steps[currentStep];

    if (!step) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden bg-black/20 backdrop-blur-[2px]">
            {/* Content Card */}
            <div className="absolute z-20 w-full h-full pointer-events-none flex flex-col items-center justify-center">
                <div
                    className="pointer-events-auto max-w-md w-[90%] bg-white rounded-2xl shadow-2xl p-6 border border-neutral-100 animate-in zoom-in-95 fade-in slide-in-from-bottom-5 duration-300"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-neutral-900">{step.title}</h3>
                        <button onClick={handleClose} className="text-neutral-400 hover:text-neutral-900 p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-neutral-600 mb-6 leading-relaxed">
                        {step.description}
                    </p>

                    <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-1">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-emerald-500' : 'w-1.5 bg-neutral-200'}`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <Button variant="ghost" onClick={handleBack} className="text-neutral-500">
                                    Back
                                </Button>
                            )}
                            <Button onClick={handleNext} className="bg-neutral-900 text-white hover:bg-neutral-800">
                                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
