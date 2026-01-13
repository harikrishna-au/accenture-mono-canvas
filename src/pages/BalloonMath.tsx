import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageWrapper from '@/components/PageWrapper';
import Header from "@/components/Header";
import { LogOut, Flag } from "lucide-react";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

interface Balloon {
    id: number;
    equation: string;
    answer: number;
    color: string;
    top: string;
    left: string;
    popped: boolean; // Track if the bubble has been popped
}

const BalloonMathGame: React.FC = () => {
    const navigate = useNavigate();
    const { isPremium } = usePremiumStatus();
    const [balloons, setBalloons] = useState<Balloon[]>([]);
    const [round, setRound] = useState(1);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15); // Standard time for the round
    const [gameOver, setGameOver] = useState(false);
    const [started, setStarted] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [roundPerfect, setRoundPerfect] = useState(true);

    const FREE_ROUNDS = 25;
    const TIME_PER_ROUND = 15; // Increased time slightly to keep it snappy for 3 bubbles if needed, or keep 10.
    const BUBBLE_COUNT = 3;

    const generateEquation = () => {
        // 30% chance for Decimal Multiplication, 70% for Integer Math
        const type = Math.random() > 0.7 ? 'decimal' : 'integer';

        if (type === 'decimal') {
            // Generate 0.1 to 0.9
            const decimal = Number((Math.random() * 0.9 + 0.1).toFixed(1));
            const int = Math.floor(Math.random() * 9) + 2; // 2 to 10

            return {
                equation: `${decimal} * ${int}`,
                answer: Number((decimal * int).toFixed(2))
            };
        } else {
            // Standard Integer Math
            const operators = ['+', '-', '*', '/', '%'];
            const operator = operators[Math.floor(Math.random() * operators.length)];

            let num1 = Math.floor(Math.random() * 20) + 1;
            let num2 = Math.floor(Math.random() * 10) + 1;

            // Special handling to ensure clean integer results/valid math
            if (operator === '/') {
                // Ensure num1 is a multiple of num2 to avoid fractions like 3/4
                let answer = Math.floor(Math.random() * 10) + 1; // Decide answer first (1-10)
                num2 = Math.floor(Math.random() * 5) + 2;    // Divisor (2-6)
                num1 = answer * num2;                        // Dividend
            } else if (operator === '%') {
                // Ensure meaningful modulo
                num2 = Math.floor(Math.random() * 5) + 2;
                num1 = Math.floor(Math.random() * 20) + num2;
            }

            let answer = 0;
            switch (operator) {
                case '+': answer = num1 + num2; break;
                case '-': answer = num1 - num2; break;
                case '*': answer = num1 * num2; break;
                case '/': answer = num1 / num2; break;
                case '%': answer = num1 % num2; break;
            }

            return {
                equation: `${num1} ${operator} ${num2}`,
                answer
            };
        }
    };

    const getBalloonPosition = (idx: number) => {
        // Fixed positions for 3 bubbles to ensure good spacing
        // Triangle formation or random disperse
        const positions = [
            { top: '30%', left: '50%' }, // Top Center
            { top: '60%', left: '30%' }, // Bottom Left
            { top: '60%', left: '70%' }, // Bottom Right
        ];
        return positions[idx];
    };

    const generateBalloons = () => {
        const newBalloons: Balloon[] = [];
        const usedAnswers = new Set<number>();

        for (let idx = 0; idx < BUBBLE_COUNT; idx++) {
            let equationData = generateEquation();

            // Ensure unique answers to avoid ambiguity in ordering
            let attempts = 0;
            while (usedAnswers.has(equationData.answer) && attempts < 10) {
                equationData = generateEquation();
                attempts++;
            }
            usedAnswers.add(equationData.answer);

            const position = getBalloonPosition(idx);

            newBalloons.push({
                id: idx,
                equation: equationData.equation,
                answer: equationData.answer,
                color: 'bg-white/80', // Glassy white look
                top: position.top,
                left: position.left,
                popped: false
            });
        }
        setBalloons(newBalloons);
    };

    const handleStartClick = () => {
        setShowInstructions(true);
    };

    const startGame = () => {
        setShowInstructions(false);
        setStarted(true);
        setRound(1);
        setScore(0);
        setTimeLeft(TIME_PER_ROUND);
        setGameOver(false);
        setRoundPerfect(true);
        generateBalloons();
    };

    useEffect(() => {
        if (started && !gameOver && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (started && !gameOver && timeLeft === 0) {
            nextRound(false); // Time run out -> fail round
        }
    }, [timeLeft, started, gameOver]);

    const handleBalloonClick = (clickedBalloon: Balloon) => {
        if (clickedBalloon.popped) return;

        // Find the smallest answer among currently unpopped balloons
        const unpoppedBalloons = balloons.filter(b => !b.popped);
        const smallestAnswer = Math.min(...unpoppedBalloons.map(b => b.answer));

        const isCorrect = clickedBalloon.answer === smallestAnswer;

        // If incorrect, mark round as not perfect
        if (!isCorrect) {
            setRoundPerfect(false);
        }

        // Pop the balloon regardless of correctness
        const updatedBalloons = balloons.map(b =>
            b.id === clickedBalloon.id ? { ...b, popped: true } : b
        );
        setBalloons(updatedBalloons);

        // Check if all popped
        if (updatedBalloons.every(b => b.popped)) {
            if (roundPerfect && isCorrect) {
                setScore(prev => prev + 1);
            }
            // Small delay before next round to show empty state/success
            setTimeout(() => nextRound(true), 200);
        }
    };

    const nextRound = (success: boolean) => {
        const maxRounds = isPremium ? Infinity : FREE_ROUNDS;

        if (round >= maxRounds) {
            finishGame();
        } else {
            setRound(prev => prev + 1);
            setTimeLeft(TIME_PER_ROUND);
            setRoundPerfect(true);
            generateBalloons();
        }
    };

    const finishGame = () => {
        setGameOver(true);
        localStorage.setItem('score_balloon', score.toString());
        localStorage.setItem('completed_balloon', 'true');
    };

    // Start Screen
    if (!started && !showInstructions) {
        return (
            <PageWrapper>
                <div className="flex min-h-screen flex-col items-center justify-center bg-white text-neutral-900 p-4">
                    <div className="text-center space-y-6 max-w-md mx-4 bg-neutral-100 p-12 rounded-2xl shadow-xl border-2 border-neutral-200">
                        <div className="mb-4 flex justify-center space-x-2">
                            <div className="w-12 h-12 bg-white rounded-full shadow-inner flex items-center justify-center text-sm font-bold text-neutral-400">1</div>
                            <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center text-base font-bold text-neutral-500 -mt-4">2</div>
                            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-xl font-bold text-neutral-800">3</div>
                        </div>
                        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Bubble Order</h1>
                        <p className="text-xl text-neutral-600 mb-8">
                            Pop the bubbles in <strong>ascending order</strong> (Lowest to Highest).
                        </p>
                        <Button
                            onClick={handleStartClick}
                            className="w-full h-14 text-lg bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl"
                        >
                            Start Assessment
                        </Button>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    // Instructions Screen
    if (!started && showInstructions) {
        return (
            <PageWrapper>
                <div className="flex min-h-screen flex-col items-center justify-center bg-white text-neutral-900 p-4">
                    <div className="max-w-2xl w-full bg-neutral-100 p-8 rounded-2xl shadow-xl border-2 border-neutral-200">
                        <h2 className="text-3xl font-bold text-neutral-900 mb-6 text-center">Instructions</h2>

                        <div className="space-y-6 text-lg text-neutral-700">
                            <p>
                                In each round, you will see 3 bubbles with math equations.
                                Your goal is to click them in order from the <strong>LOWEST</strong> answer to the <strong>HIGHEST</strong> answer.
                            </p>

                            <div className="flex justify-center gap-8 py-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white rounded-full border border-neutral-200 flex items-center justify-center font-bold text-neutral-400 mb-2 shadow-sm">2</div>
                                    <span className="text-sm font-bold text-neutral-500">1st Click</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white rounded-full border border-neutral-200 flex items-center justify-center font-bold text-neutral-600 mb-2 shadow-md">5</div>
                                    <span className="text-sm font-bold text-neutral-500">2nd Click</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white rounded-full border border-neutral-200 flex items-center justify-center font-bold text-neutral-900 mb-2 shadow-lg">9</div>
                                    <span className="text-sm font-bold text-neutral-500">3rd Click</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-4">
                                <h3 className="font-bold text-neutral-900">Operations Guide:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono bg-neutral-200 px-2 py-1 rounded">+</span>
                                        <span>Addition (e.g., 5 + 3 = 8)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono bg-neutral-200 px-2 py-1 rounded">-</span>
                                        <span>Subtraction (e.g., 10 - 4 = 6)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono bg-neutral-200 px-2 py-1 rounded">*</span>
                                        <span>Multiplication (e.g., 4 * 2 = 8)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono bg-neutral-200 px-2 py-1 rounded">/</span>
                                        <span>Division (e.g., 12 / 3 = 4)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm text-neutral-500 pt-4 border-t border-neutral-200">
                                <span>• {isPremium ? "Unlimited Rounds" : `${FREE_ROUNDS} Rounds`}</span>
                                <span>• {TIME_PER_ROUND} Seconds per round</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Button
                                onClick={startGame}
                                className="w-full h-14 text-lg bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl"
                            >
                                I Understand, Begin
                            </Button>
                        </div>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    // Game Over Screen
    if (gameOver) {
        return (
            <PageWrapper>
                <div className="flex min-h-screen flex-col items-center justify-center bg-white text-neutral-900 p-4">
                    <div className="text-center space-y-6 max-w-md mx-4 bg-neutral-100 p-8 rounded-2xl shadow-xl border-2 border-neutral-200">
                        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Assessment Complete</h1>

                        <div className="py-6">
                            <div className="text-neutral-600 mb-1">Your Score</div>
                            <div className="text-6xl font-bold text-neutral-900">{score} / {round}</div>
                        </div>

                        <p className="text-xl text-neutral-600">
                            {score >= 20 ? "Excellent sorting skills! You are precise and fast." :
                                score >= 10 ? "Good job! Keep practicing to improve your speed." :
                                    "Keep practicing! Focus on identifying the smallest numbers first."}
                        </p>

                        <Button
                            onClick={() => navigate('/dashboard')}
                            className="w-full h-14 text-lg bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl"
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    // Active Game Screen
    return (
        <div className="min-h-screen w-full bg-white relative overflow-hidden flex flex-col pt-16">
            <Header />

            <div className="flex-1 relative w-full max-w-4xl mx-auto">
                {/* Round Indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-neutral-100 px-4 py-1 rounded-full text-sm font-medium text-neutral-500 z-10">
                    Section {round} {isPremium ? "(Infinite)" : `of ${FREE_ROUNDS}`}
                </div>

                {/* Instruction Hint */}
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-neutral-500 text-center z-40 w-full px-4">
                    <p className="text-sm uppercase tracking-widest font-bold text-neutral-400 mb-1">Target</p>
                    <p className="font-medium text-lg text-neutral-800">Select the bubbles in order from <span className="font-bold underline decoration-2 decoration-blue-500">LOWEST</span> to <span className="font-bold underline decoration-2 decoration-red-500">HIGHEST</span> value</p>
                </div>

                {/* Premium End Button */}
                {isPremium && (
                    <div className="absolute top-4 right-4 z-50">
                        <Button
                            onClick={finishGame}
                            variant="destructive"
                            size="sm"
                            className="gap-2 shadow-md hover:scale-105 transition-transform"
                        >
                            <Flag className="w-4 h-4" />
                            Finish Now
                        </Button>
                    </div>
                )}

                {/* Game Area */}
                <div className="absolute inset-0 top-32">
                    {balloons.map((balloon) => !balloon.popped && (
                        <div
                            key={balloon.id}
                            onClick={() => handleBalloonClick(balloon)}
                            className="absolute cursor-pointer transition-transform hover:scale-105 active:scale-95"
                            style={{
                                top: balloon.top,
                                left: balloon.left,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {/* Bubble Body */}
                            <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-[inset_0_-8px_12px_rgba(0,0,0,0.1),0_8px_24px_rgba(0,0,0,0.05)] border border-neutral-100 bg-gradient-to-br from-white to-neutral-50 backdrop-blur-sm relative animate-float`}>
                                <div className="text-2xl font-bold text-neutral-700 font-mono tracking-tight">
                                    {balloon.equation}
                                </div>
                                {/* Shine effect */}
                                <div className="absolute top-6 right-8 w-6 h-3 bg-white opacity-80 rounded-full transform rotate-[-45deg] blur-[1px]"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Timer at Bottom */}
            <div className="w-full pb-12 flex justify-center items-center z-50">
                <div className="relative flex items-center justify-center w-20 h-20">
                    {/* Circular Progress Timer (Simplified visual) */}
                    <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e5e5" strokeWidth="8" />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={timeLeft <= 3 ? "#ef4444" : "#171717"}
                            strokeWidth="8"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * timeLeft) / TIME_PER_ROUND}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <div className={`text-2xl font-black ${timeLeft <= 3 ? 'text-red-600' : 'text-neutral-900'}`}>
                        {timeLeft}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BalloonMathGame;