
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, DoorOpen, User, UserCheck, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from "@/components/Header";

// Grid Types
type CellType = 'EMPTY' | 'KEY' | 'GOAL' | 'START';

interface Position {
    row: number;
    col: number;
}

// Level Configurations
// Maps are now just for placing Items. Walls are defined by the Valid Edges (Connections).
const LEVEL_1_MAP: CellType[][] = [
    ['START', 'EMPTY', 'EMPTY', 'EMPTY', 'GOAL'],
    ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
    ['KEY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
    ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
    ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
];
// Define valid connections between cells. Any adjacent pair NOT in this set is a wall.
// Format: "r1,c1|r2,c2" where r1,c1 is the smaller coordinate (lexicographically or just consistent)
const LEVEL_1_EDGES = new Set([
    '0,0|0,1', '0,1|0,2', '0,2|1,2',
    '1,2|2,2', '2,2|2,1', '2,1|2,0', // Path to Key
    '2,2|2,3', '2,3|2,4', '2,4|1,4', '1,4|0,4' // Path to Goal
]);

const LEVEL_2_MAP: CellType[][] = [
    ['START', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'KEY'],
    ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
    ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
    ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
    ['KEY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'GOAL'],
    ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
];
const LEVEL_2_EDGES = new Set([
    '0,0|0,1', '0,1|0,2', '0,2|1,2',
    '1,2|1,3', '1,3|1,4', '1,4|2,4',
    '1,4|0,4', '0,4|0,5', // Path to Key 2 (0,5)
    '2,4|2,3', '2,3|2,2', '2,2|2,1', '2,1|3,1',
    '3,1|3,0', '3,0|4,0', // Key 1 (4,0)
    '4,0|4,1', '4,1|4,2', '4,2|4,3', '4,3|4,4', '4,4|4,5' // Goal
]);

const LEVEL_3_MAP: CellType[][] = [
    ['START', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
    ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
    ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
    ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
    ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'KEY', 'EMPTY', 'EMPTY'],
    ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
    ['GOAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
];
const LEVEL_3_EDGES = new Set([
    '0,0|0,1', '0,1|0,2', '0,2|1,2',
    '1,2|1,1', '1,1|1,0', '1,0|2,0',
    '2,0|2,1', '2,1|2,2', '2,2|2,3', '2,3|2,4', '2,4|3,4',
    '3,4|3,5', '3,5|3,6', '3,6|4,6',
    '4,6|4,5', '4,5|4,4', // Key
    '4,4|5,4', '5,4|5,3', '5,3|5,2', '5,2|6,2',
    '6,2|6,1', '6,1|6,0' // Goal
]);

const LEVELS = [
    { map: LEVEL_1_MAP, edges: LEVEL_1_EDGES },
    { map: LEVEL_2_MAP, edges: LEVEL_2_EDGES },
    { map: LEVEL_3_MAP, edges: LEVEL_3_EDGES }
];
const TIME_LIMIT = 300; // 5 minutes in seconds

const HiddenMaze = () => {
    const navigate = useNavigate();

    // Game State
    const [level, setLevel] = useState(1);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [isGameActive, setIsGameActive] = useState(true);
    const [gameFinished, setGameFinished] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);

    // Level State
    const [playerPos, setPlayerPos] = useState<Position>({ row: 0, col: 0 });
    const [collectedKeys, setCollectedKeys] = useState<Set<string>>(new Set());
    const [revealed, setRevealed] = useState<Set<string>>(new Set(['0,0']));
    const [shake, setShake] = useState(false);
    const [hitWall, setHitWall] = useState(false);
    const [wrongTile, setWrongTile] = useState<string | null>(null);
    const [wrongEdge, setWrongEdge] = useState<string | null>(null);

    const currentLevel = LEVELS[level - 1];
    const currentMap = currentLevel.map;
    const currentEdges = currentLevel.edges;
    const gridSize = currentMap.length;

    // Calculate total keys for the current level
    const totalKeys = React.useMemo(() => {
        let count = 0;
        currentMap.forEach(row => row.forEach(cell => {
            if (cell === 'KEY') count++;
        }));
        return count;
    }, [currentMap]);

    // Timer Logic
    useEffect(() => {
        if (!isGameActive || gameFinished) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Time's up! Fail forward to next level
                    handleLevelComplete(false);
                    return TIME_LIMIT;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isGameActive, gameFinished, level]);

    const handleLevelComplete = (won: boolean) => {
        if (level < 3) {
            // Next Level
            setLevel(prev => prev + 1);
            resetLevelState();
        } else {
            // Game Over
            setGameFinished(true);
            localStorage.setItem('completed_maze', 'true');
            setIsGameActive(false);
        }
    };

    const resetLevelState = () => {
        setPlayerPos({ row: 0, col: 0 });
        setCollectedKeys(new Set());
        setRevealed(new Set(['0,0']));
        setTimeLeft(TIME_LIMIT);
        setShake(false);
        setHitWall(false);
        setWrongTile(null);
        setWrongEdge(null);
    };

    const resetOnDeath = useCallback((badTile: string, edgeClass: string) => {
        setPlayerPos({ row: 0, col: 0 });
        setCollectedKeys(new Set()); // Reset keys on death
        setRevealed(new Set(['0,0'])); // Reset path on death
        setShake(true);
        setHitWall(true);
        setWrongTile(badTile);
        setWrongEdge(edgeClass);

        setTimeout(() => {
            setShake(false);
            setHitWall(false);
            setWrongTile(null);
            setWrongEdge(null);
        }, 500);
    }, []);

    const handleMove = useCallback((dRow: number, dCol: number) => {
        if (!isGameActive || gameFinished) return;

        const newRow = playerPos.row + dRow;
        const newCol = playerPos.col + dCol;

        // Check Bounds
        if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize) {
            return;
        }

        const cellType = currentMap[newRow][newCol];
        const posKey = `${newRow},${newCol}`;
        const currentPosKey = `${playerPos.row},${playerPos.col}`;

        // Reveal the tile regardless of what it is (so user sees they stepped there)
        setRevealed(prev => {
            const next = new Set(prev);
            next.add(posKey);
            return next;
        });

        // Check Valid Edge (Invisible Wall)
        // Normalize edge key: smaller coordinate first
        const edge1 = `${currentPosKey}|${posKey}`;
        const edge2 = `${posKey}|${currentPosKey}`;

        if (!currentEdges.has(edge1) && !currentEdges.has(edge2)) {
            // Determine which edge was hit relative to the NEW tile
            let edgeClass = '';
            if (dRow === -1) edgeClass = 'border-b-8 border-red-600'; // Moved Up -> Hit Bottom
            if (dRow === 1) edgeClass = 'border-t-8 border-red-600';  // Moved Down -> Hit Top
            if (dCol === -1) edgeClass = 'border-r-8 border-red-600'; // Moved Left -> Hit Right
            if (dCol === 1) edgeClass = 'border-l-8 border-red-600';  // Moved Right -> Hit Left

            resetOnDeath(posKey, edgeClass);
            return;
        }

        // Valid Move
        setPlayerPos({ row: newRow, col: newCol });

        // Handle Cell Events
        if (cellType === 'KEY') {
            setCollectedKeys(prev => {
                const next = new Set(prev);
                next.add(posKey);
                return next;
            });
        } else if (cellType === 'GOAL') {
            // Check if all keys are collected (we need to check state + current move if it was a key, but goal is distinct)
            // Since setCollectedKeys is async, we can't rely on it immediately if the GOAL was also a KEY (unlikely).
            // But here GOAL is distinct.
            // We need to check if collectedKeys.size === totalKeys.
            // However, collectedKeys might not be updated yet if we just stepped on a key? 
            // No, KEY and GOAL are different cells.

            // We need to access the current state of collectedKeys.
            // Since we are inside the callback, `collectedKeys` is from the closure.
            // We need to add `collectedKeys` to dependency array.
            if (collectedKeys.size === totalKeys) {
                handleLevelComplete(true);
            }
        }

    }, [playerPos, isGameActive, gameFinished, collectedKeys, totalKeys, currentMap, currentEdges, gridSize, resetOnDeath]);

    // Click to Move Logic
    const handleCellClick = (row: number, col: number) => {
        const dRow = row - playerPos.row;
        const dCol = col - playerPos.col;

        if (Math.abs(dRow) + Math.abs(dCol) === 1) {
            handleMove(dRow, dCol);
        }
    };

    // Keyboard Controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': handleMove(-1, 0); break;
                case 'ArrowDown': handleMove(1, 0); break;
                case 'ArrowLeft': handleMove(0, -1); break;
                case 'ArrowRight': handleMove(0, 1); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleMove]);

    // Format Time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')} `;
    };

    const handleStartClick = () => {
        setShowInstructions(false);
    };

    // Instructions Screen
    if (showInstructions) {
        return (
            <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-white text-neutral-900 overflow-hidden pt-20">
                <Header />
                <div className="max-w-2xl w-full bg-neutral-100 p-8 rounded-2xl shadow-xl border-2 border-neutral-200">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-6 text-center">Hidden Maze Instructions</h2>

                    <div className="space-y-6 text-lg text-neutral-700">
                        <p>
                            Navigate through the invisible maze to reach the <span className="font-bold text-emerald-600">Goal</span>.
                        </p>

                        <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-4">
                            <h3 className="font-bold text-neutral-900">How to Play:</h3>
                            <ul className="space-y-3 list-disc list-inside">
                                <li>Use <strong>Arrow Keys</strong> or <strong>Click</strong> adjacent tiles to move.</li>
                                <li>The path is <strong>hidden</strong>. Memorize your steps!</li>
                                <li>If you hit a wall, you will be <strong>reset</strong> to the start.</li>
                                <li>Collect <strong>all Keys</strong> <Key className="inline w-5 h-5 text-yellow-500" /> to unlock the Goal.</li>
                            </ul>
                        </div>

                        <div className="flex justify-between items-center text-sm text-neutral-500 pt-4 border-t border-neutral-200">

                            <span>• 5 Minutes Total</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Button
                            onClick={handleStartClick}
                            className="w-full h-14 text-lg bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl"
                        >
                            Start Assessment
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameFinished) {
        return (
            <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-white text-neutral-900 overflow-hidden">
                <div className="text-center space-y-6 max-w-md mx-4 bg-neutral-100 p-8 rounded-2xl shadow-xl border-2 border-neutral-200">
                    <UserCheck className="w-24 h-24 text-neutral-900 mx-auto" />
                    <h2 className="text-3xl font-bold text-neutral-900">Assessment Complete</h2>
                    <p className="text-xl text-neutral-600">
                        Practice hard for the exam!
                    </p>
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="w-full h-14 text-lg bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl"
                    >
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }
    return (
        <div className={`fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-white text-neutral-900 overflow-hidden pt-20 transition-transform ${shake ? 'translate-x-[-10px]' : ''}`}>
            <Header />

            {/* Header Info */}
            <div className="mb-8 flex items-center gap-8 text-xl font-bold text-neutral-600">

                <div className={`flex items-center gap-2 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : ''}`}>
                    <Timer className="w-6 h-6" />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            </div>

            {/* Grid Container */}
            <div
                className="grid gap-0.5 bg-neutral-200 p-2 rounded-xl shadow-xl border-4 border-neutral-100"
                style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
                {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
                    const row = Math.floor(idx / gridSize);
                    const col = idx % gridSize;
                    const isPlayer = playerPos.row === row && playerPos.col === col;
                    const isRevealed = revealed.has(`${row},${col}`);
                    const type = currentMap[row][col];
                    const isWrong = wrongTile === `${row},${col}`;
                    const isKeyCollected = collectedKeys.has(`${row},${col}`);
                    const allKeysCollected = collectedKeys.size === totalKeys;

                    // Determine visual state
                    let content = null;
                    let bgColor = "bg-neutral-100"; // Default Empty/Hidden
                    let borderClass = "";

                    // Visited cells become dark
                    if (isRevealed) {
                        bgColor = "bg-black";
                    }

                    // Wrong tile gets a specific red border
                    if (isWrong && wrongEdge) {
                        borderClass = wrongEdge;
                    }

                    // Player Avatar
                    if (isPlayer) {
                        bgColor = "bg-neutral-800";

                        // Check available moves (bounds only)
                        const canMoveUp = row > 0;
                        const canMoveDown = row < gridSize - 1;
                        const canMoveLeft = col > 0;
                        const canMoveRight = col < gridSize - 1;

                        content = (
                            <div className="relative w-full h-full flex items-center justify-center">
                                {allKeysCollected ? (
                                    <UserCheck className="w-10 h-10 text-white z-10 relative" />
                                ) : (
                                    <User className="w-10 h-10 text-white z-10 relative" />
                                )}
                            </div>
                        );
                    }
                    else if (type === 'KEY') {
                        if (!isKeyCollected) {
                            content = <Key className={`w-8 h-8 ${isRevealed ? 'text-yellow-400' : 'text-neutral-900'}`} />;
                        }
                    }
                    else if (type === 'GOAL') {
                        content = <DoorOpen className={`w-10 h-10 ${isRevealed ? (allKeysCollected ? 'text-emerald-400' : 'text-neutral-500') : 'text-neutral-900'}`} />;
                    }

                    // Interactive State & Arrows
                    const isAdjacent = Math.abs(row - playerPos.row) + Math.abs(col - playerPos.col) === 1;

                    // Determine arrow direction if adjacent
                    let arrowContent = null;
                    if (isAdjacent) {
                        if (row < playerPos.row) arrowContent = <ArrowUp className="w-6 h-6 text-neutral-400" />; // Up
                        if (row > playerPos.row) arrowContent = <ArrowDown className="w-6 h-6 text-neutral-400" />; // Down
                        if (col < playerPos.col) arrowContent = <ArrowLeft className="w-6 h-6 text-neutral-400" />; // Left
                        if (col > playerPos.col) arrowContent = <ArrowRight className="w-6 h-6 text-neutral-400" />; // Right
                    }

                    return (
                        <div
                            key={`${row}-${col}`}
                            onClick={() => handleCellClick(row, col)}
                            className={`
                                w-20 h-20 flex items-center justify-center rounded-xl transition-colors duration-300 relative
                                ${bgColor} ${borderClass}
                                ${isAdjacent ? 'cursor-pointer hover:bg-neutral-200' : ''}
                                ${isPlayer ? 'ring-4 ring-neutral-300 z-10' : ''}
                            `}
                        >
                            {content}
                            {isAdjacent && !content && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-50">
                                    {arrowContent}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default HiddenMaze;
