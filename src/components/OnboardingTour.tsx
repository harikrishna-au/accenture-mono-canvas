import React, { useState, useEffect, useRef } from 'react';
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
        description: "This is a practice environment designed to help you eliminate fear before your real Accenture exams. Practice repeatedly to build confidence.",
        position: 'center'
    },
    {
        targetId: 'onboarding-tr-group',
        title: "Technical Round (TR) Practice",
        description: "Accenture's TR includes 3 distinct logic puzzles. We have replicated these exact games here so you can master the logic before the exam.",
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
        title: "Why Harry The Blaze?",
        description: "We built this platform to bridge the gap between preparation and performance. Many candidates fail not because of ability, but fear of the unknown. We're here to fix that.",
        position: 'center'
    },
    {
        title: "What is the Benefit?",
        description: "By practicing with realistic simulations of Accenture's Cognitive and Communication rounds, you'll walk into your exam knowing exactly what to expect, giving you a massive confident edge.",
        position: 'center'
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
    const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
    const overlayRef = useRef<HTMLDivElement>(null);

    // Reset step when opened
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);




    const updateSpotlight = () => {
        const step = steps[currentStep];

        if (step.position === 'center' || !step.targetId) {
            setSpotlightStyle({
                position: 'fixed',
                top: '50%',
                left: '50%',
                width: '0px',
                height: '0px',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.8)',
                borderRadius: '50%',
                transition: 'all 0.6s ease-out'
            });
            return;
        }

        const element = document.getElementById(step.targetId);
        if (element) {
            let rect = element.getBoundingClientRect();

            // Handle display:contents or zero-size containers (like our TR group)
            // If the container has no size but has children, calculate the union box of all children
            if ((rect.width === 0 || rect.height === 0) && element.children.length > 0) {
                let minTop = Infinity;
                let minLeft = Infinity;
                let maxBottom = -Infinity;
                let maxRight = -Infinity;

                Array.from(element.children).forEach(child => {
                    const childRect = child.getBoundingClientRect();
                    // Skip hidden/zero-size children if any
                    if (childRect.width === 0 && childRect.height === 0) return;

                    if (childRect.top < minTop) minTop = childRect.top;
                    if (childRect.left < minLeft) minLeft = childRect.left;
                    if (childRect.bottom > maxBottom) maxBottom = childRect.bottom;
                    if (childRect.right > maxRight) maxRight = childRect.right;
                });

                if (minTop !== Infinity) {
                    rect = new DOMRect(minLeft, minTop, maxRight - minLeft, maxBottom - minTop);
                }
            }

            // Scroll to element (use scrollIntoView on the first child if wrapper is display:contents)
            if (element.style.display === 'contents' && element.children.length > 0) {
                element.children[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            setSpotlightStyle({
                position: 'fixed',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.8)',
                borderRadius: '12px',
                pointerEvents: 'none', // Allow clicks through? No, wait tour blocks clicks usually
                transition: 'all 0.6s ease-out'
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            // Wait for scroll/render?
            setTimeout(updateSpotlight, 100);
            window.addEventListener('resize', updateSpotlight);
            return () => window.removeEventListener('resize', updateSpotlight);
        }
    }, [currentStep, isOpen]);

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
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Spotlight Hole */}
            <div style={spotlightStyle} className="z-10 absolute shadow-strong" />

            {/* Content Card */}
            <div className="absolute z-20 w-full h-full pointer-events-none flex flex-col items-center justify-center">

                {/* 
                   We need to position the text card. 
                   If center -> Center. 
                   If target -> Top or Bottom of target? 
                   For simplicity in this V1, let's keep the Text Card ALWAYS CENTERED or Fixed Bottom?
                   User said "overlay with some transculent screne".
                   Let's stick the card in the center-bottom or visually separate from the hole if possible.
                   Actually, centered card works fine for Context.
                   But for specific elements, we want it near.
                   Let's use a fixed position for the text card to be consistent and readable on mobile.
                   Bottom sheet style is safest for mobile.
                */}

                <div
                    className={`
                        pointer-events-auto
                        absolute 
                        ${step.position === 'center' ? 'top-1/2 -translate-y-1/2' : 'bottom-10 md:bottom-20'}
                        left-1/2 -translate-x-1/2
                        max-w-md w-[90%] 
                        bg-white rounded-2xl shadow-2xl p-6 
                        border-2 border-neutral-100
                        animate-in zoom-in-95 fade-in slide-in-from-bottom-5 duration-300
                    `}
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
