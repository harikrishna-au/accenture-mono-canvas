import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageWrapper from '@/components/PageWrapper';
import Header from "@/components/Header";

interface Balloon {
    id: number;
    equation: string;
    answer: number;
    color: string;
    top: string;
    left: string;
}

const BalloonMathGame: React.FC = () => {
    const navigate = useNavigate();
    const [balloons, setBalloons] = useState<Balloon[]>([]);
    const [round, setRound] = useState(1);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [gameOver, setGameOver] = useState(false);
    const [started, setStarted] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    const TOTAL_ROUNDS = 25;
    const TIME_PER_ROUND = 10;

    const operators = ['+', '-', '*', '/', '%'];

    const generateEquation = () => {
        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operator = operators[Math.floor(Math.random() * operators.length)];

        let equation = `${num1} ${operator} ${num2} `;
        let answer: number;

        switch (operator) {
            case '+': answer = num1 + num2; break;
            case '-': answer = num1 - num2; break;
            case '*': answer = num1 * num2; break;
            case '/': answer = Math.floor(num1 / num2); break;
            case '%': answer = num1 % num2; break;
            default: answer = 0;
        }

        return { equation, answer };
    };

    const getBalloonPosition = (row: number, col: number) => {
        // Equal distance from corners: 30% from edges
        const positions = {
            1: { 1: { top: '30%', left: '30%' }, 2: { top: '30%', left: '70%' } },
            2: { 1: { top: '70%', left: '30%' }, 2: { top: '70%', left: '70%' } }
        };

        return positions[row as 1 | 2][col as 1 | 2];
    };

    const generateBalloons = () => {
        // Restore colorful balloons
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
        const newBalloons: Balloon[] = [];

        const positions = [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 2, col: 1 },
            { row: 2, col: 2 }
        ];

        const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);

        for (let idx = 0; idx < 4; idx++) {
            const { equation, answer } = generateEquation();
            const { row, col } = shuffledPositions[idx];
            const position = getBalloonPosition(row, col);

            newBalloons.push({
                id: idx,
                equation,
                answer,
                color: colors[idx],
                top: position.top,
                left: position.left
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
        generateBalloons();
    };

    useEffect(() => {
        if (started && !gameOver && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (started && !gameOver && timeLeft === 0) {
            nextRound(false);
        }
    }, [timeLeft, started, gameOver]);

    const handleBalloonClick = (clickedBalloon: Balloon) => {
        const smallestAnswer = Math.min(...balloons.map(b => b.answer));

        if (clickedBalloon.answer === smallestAnswer) {
            setScore(score + 1);
            nextRound(true);
        } else {
            nextRound(false);
        }
    };

    const nextRound = (answered: boolean) => {
        if (round >= TOTAL_ROUNDS) {
            setGameOver(true);
            localStorage.setItem('completed_balloon', 'true');
        } else {
            setRound(round + 1);
            setTimeLeft(TIME_PER_ROUND);
            generateBalloons();
        }
    };

    // Start Screen
    if (!started && !showInstructions) {
        return (
            <PageWrapper>
                <div className="flex min-h-screen flex-col items-center justify-center bg-white text-neutral-900 p-4">
                    <div className="text-center space-y-6 max-w-md mx-4 bg-neutral-100 p-12 rounded-2xl shadow-xl border-2 border-neutral-200">
                        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Balloon Math</h1>
                        <p className="text-xl text-neutral-600 mb-8">
                            Test your mental math skills by finding the smallest number.
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
                                In each round, you will see 4 balloons with math equations.
                                Your goal is to click the balloon with the <strong>smallest answer</strong>.
                            </p>

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
                                        <span>Division (e.g., 15 / 3 = 5)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono bg-neutral-200 px-2 py-1 rounded">%</span>
                                        <span>Modulo/Remainder (e.g., 10 % 3 = 1)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm text-neutral-500 pt-4 border-t border-neutral-200">
                                <span>• 25 Rounds</span>
                                <span>• 10 Seconds per round</span>
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
                            <div className="text-6xl font-bold text-neutral-900">{score} / {TOTAL_ROUNDS}</div>
                        </div>

                        <p className="text-xl text-neutral-600">
                            {score >= 17 ? 'Excellent work!' : 'Keep practicing for exam !'}
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
        <div className="fixed inset-0 w-screen h-screen bg-white overflow-hidden pt-20"> {/* Added pt-20 */}
            <Header /> {/* Added Header component */}
            {/* Header */}
            <div className="absolute top-8 left-0 right-0 flex justify-end items-center px-8 z-50">
                <div className={`text-4xl font-bold ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-neutral-900'} `}>
                    {timeLeft}s
                </div>
            </div>

            {/* Instruction Hint */}
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-neutral-400 font-medium z-40">
                Select the smallest answer
            </div>

            {/* Game Area */}
            <div className="absolute inset-0 top-32">
                {balloons.map((balloon) => (
                    <div
                        key={balloon.id}
                        onClick={() => handleBalloonClick(balloon)}
                        className="absolute cursor-pointer transition-transform hover:scale-110 active:scale-95 balloon"
                        style={{
                            top: balloon.top,
                            left: balloon.left,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        {/* Balloon Body */}
                        <div className={`${balloon.color} w-32 h-40 rounded-full flex items-center justify-center shadow-xl relative animate-wiggle`}>
                            <div className="text-center z-10">
                                <div className="text-2xl font-bold text-white drop-shadow-md">
                                    {balloon.equation}
                                </div>
                            </div>
                            {/* Shine effect */}
                            <div className="absolute top-4 right-6 w-4 h-8 bg-white opacity-20 rounded-full transform rotate-45"></div>
                            {/* String */}
                            <div className="absolute -bottom-12 left-1/2 w-0.5 h-12 bg-neutral-300 origin-top transform -translate-x-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BalloonMathGame;