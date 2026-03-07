import { useState, useEffect } from "react";
import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  RotateCw,
  ArrowLeftRight,
  ShieldCheck,
  AlertCircle,
  Play,
  RotateCcw,
  Check,
  ArrowRight,
  Youtube,
  Trophy,
  LogOut,
  Lock,
  Gamepad2,
  Crosshair,
  Grid3X3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createShape } from "@/puzzle/matrix/createShape";
import { generateLevel } from "@/puzzle/matrix/utils";
import { TileState, EvaluationResult } from "@/puzzle/matrix/types";
import { evaluateBoard } from "@/puzzle/matrix/validation";
import { FlowTile } from "@/components/matrix/FlowTile";
import Header from "@/components/Header";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useRazorpay } from "@/hooks/useRazorpay";
import PaymentPopup from "@/components/PaymentPopup";

const createTileId = (row: number, col: number) => `${String.fromCharCode(65 + row)}${col + 1}`;

const buildBoard = (level: number) =>
  generateLevel(level).map((config) => ({
    id: createTileId(config.row, config.col),
    row: config.row,
    col: config.col,
    shape: createShape(config.type, config.rotation, config.flipped),
    isStart: config.isStart,
    isEnd: config.isEnd,
    ports: config.ports,
  }));

export default function FindMin() {
  const [level, setLevel] = useState(1);
  const [levelsWon, setLevelsWon] = useState(0);
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [validation, setValidation] = useState<EvaluationResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(240); // 4:00 in seconds
  const [gameComplete, setGameComplete] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const { isPremium } = usePremiumStatus();
  // const { initiatePayment, isLoading: isPaymentLoading } = useRazorpay();

  // Premium Modes State
  const [gameMode, setGameMode] = useState<'arcade' | 'practice'>('arcade');
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  // Premium users go straight into arcade mode — no blocking popup

  const handleModeSelect = (mode: 'arcade' | 'practice') => {
    setGameMode(mode);
    setShowModeSelect(false);
    if (mode === 'practice') {
      setShowLevelSelect(true);
    }
    // If arcade, just let it render the default game view (Level 1)
  };

  const handleLevelSelect = (levelIdx: number) => {
    setLevel(levelIdx + 1);
    setShowLevelSelect(false);
    setGameComplete(false);
    setValidation(null);
    setSelectedIndex(null);
    setTimeLeft(240);
  };

  useEffect(() => {
    setTiles(buildBoard(level));
  }, [level]);

  // Timer logic
  useEffect(() => {
    if (gameComplete || showLockModal) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up logic handled in separate effect or here
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameComplete, showLockModal]);

  // Handle Timeout
  useEffect(() => {
    if (timeLeft === 0 && !gameComplete && !showLockModal) {
      handleLevelComplete(false);
    }
  }, [timeLeft, gameComplete, showLockModal]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleRotate = () => {
    if (selectedIndex === null) return;
    setTiles((prev) => {
      const next = [...prev];
      const tile = next[selectedIndex];
      tile.shape = tile.shape.rotateClockwise();
      return next;
    });
    setValidation(null);
  };

  const handleFlip = () => {
    if (selectedIndex === null) return;
    setTiles((prev) => {
      const next = [...prev];
      const tile = next[selectedIndex];
      tile.shape = tile.shape.toggleFlip();
      return next;
    });
    setValidation(null);
  };

  const switchPath = () => {
    if (selectedIndex === null) return;
    setTiles((prev) => {
      const next = [...prev];
      const tile = next[selectedIndex];
      tile.shape = tile.shape.cycleConfiguration();
      return next;
    });
    setValidation(null);
  };

  const handleFlipOrSwitch = () => {
    if (selectedIndex === null) return;
    const tile = tiles[selectedIndex];
    if (tile.shape.type === "tee" || tile.shape.type === "cross") {
      switchPath();
    } else {
      handleFlip();
    }
  };

  const handleLevelComplete = (won: boolean) => {
    if (won) {
      setLevelsWon(prev => prev + 1);
    }

    // CHECK PREMIUM STATUS (Arcade Gate Only)
    if (gameMode === 'arcade' && won && level === 3 && !isPremium) {
      setTimeout(() => {
        setShowLockModal(true);
      }, 1000);
      return;
    }

    // Practice Mode Logic
    if (gameMode === 'practice') {
      if (won) {
        // Show validation success for a moment then go back
        setTimeout(() => {
          setShowLevelSelect(true);
        }, 1000);
      } else {
        // Time up
        setShowLevelSelect(true);
      }
      return;
    }

    if (level < 6) {
      setTimeout(() => {
        setLevel(l => l + 1);
        setValidation(null);
        setSelectedIndex(null);
        setTimeLeft(240);
      }, won ? 1000 : 0); // Delay if won to show success message
    } else {
      setGameComplete(true);
      localStorage.setItem('score_matrix', timeLeft.toString());
      localStorage.setItem('completed_matrix', 'true');
    }
  };

  const handleValidate = () => {
    const result = evaluateBoard(tiles);
    setValidation(result);
    if (result.solved) {
      handleLevelComplete(true);
    }
  };

  const handleNextLevel = () => {
    // Deprecated in favor of auto-advance, but kept for safety if needed
    if (level < 6) {
      setLevel(l => l + 1);
      setValidation(null);
      setSelectedIndex(null);
      setTimeLeft(240);
    }
  };

  const handleReset = () => {
    setTiles(buildBoard(level));
    setSelectedIndex(null);
    setValidation(null);
    setTimeLeft(240);
  };

  const selectedTile = selectedIndex !== null ? tiles[selectedIndex] : null;

  if (gameComplete) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-50 p-4 font-sans text-neutral-900 text-center overflow-y-auto">
        <div className="bg-white p-12 rounded-3xl shadow-2xl space-y-6 max-w-lg">
          <Trophy className="h-24 w-24 text-yellow-500 mx-auto animate-bounce" />
          <h1 className="text-4xl font-extrabold text-neutral-900">Assessment Complete!</h1>
          <p className="text-xl text-neutral-600">
            {levelsWon >= 3 && "Outstanding! Your spatial reasoning is top-notch. You can visualize complex patterns easily."}
            {levelsWon === 2 && "Great job! You have a solid grasp of logic. Practice rotating shapes mentally to improve speed."}
            {levelsWon === 1 && "Good start! Focus on tracing the path from Start to End before moving tiles."}
            {levelsWon === 0 && "Keep practicing! Try breaking the path down into smaller segments and solving them one by one."}
          </p>
          <Button onClick={() => window.location.href = "/"} className="w-full h-14 text-lg bg-neutral-900 text-white">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Mode Selection Screen
  if (showModeSelect) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-50 text-neutral-900 overflow-auto pt-24 pb-10">
        <Header />
        <div className="max-w-4xl w-full p-4 space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Select Game Mode</h1>
            <p className="text-xl text-neutral-500">Choose how you want to challenge yourself.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Arcade Mode */}
            <div
              onClick={() => handleModeSelect('arcade')}
              className="bg-white hover:bg-neutral-100 border-2 border-neutral-200 hover:border-black rounded-3xl p-8 cursor-pointer transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Gamepad2 className="w-32 h-32" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900">Arcade Mode</h3>
                  <p className="text-neutral-500 mt-2">The classic experience. Play through all levels sequentially. Prove your consistency.</p>
                </div>
                <div className="pt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neutral-400 group-hover:text-neutral-900 transition-colors">
                  Start Game <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Practice Mode */}
            <div
              onClick={() => handleModeSelect('practice')}
              className="bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border-2 border-indigo-200 hover:border-indigo-500 rounded-3xl p-8 cursor-pointer transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-indigo-600">
                <Crosshair className="w-32 h-32" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Crosshair className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-neutral-900">Practice Mode</h3>
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full border border-indigo-200">PREMIUM</span>
                  </div>
                  <p className="text-neutral-600 mt-2">Target specific levels. Master difficult patterns without restarting from the beginning.</p>
                </div>
                <div className="pt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-600 group-hover:text-indigo-800 transition-colors">
                  Select Level <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Level Selection Screen
  if (showLevelSelect) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-50 text-neutral-900 overflow-auto pt-24 pb-10">
        <Header />
        <div className="max-w-4xl w-full p-4 space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Select Level</h1>
              <p className="text-neutral-500">Pick a challenge to master.</p>
            </div>
            <Button variant="outline" onClick={() => setShowModeSelect(true)}>Back to Modes</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                onClick={() => handleLevelSelect(idx)}
                className="bg-white border-2 border-neutral-100 hover:border-black hover:shadow-xl rounded-2xl p-6 cursor-pointer transition-all duration-200 group flex flex-col items-center gap-4 py-12"
              >
                <div className="w-16 h-16 rounded-full bg-neutral-100 group-hover:bg-black group-hover:text-white flex items-center justify-center text-2xl font-bold transition-colors duration-200">
                  {idx + 1}
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">Level {idx + 1}</div>
                  <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider mt-1">
                    {idx < 3 ? 'Standard' : 'Advanced'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-50 p-4 pt-24 pb-10 font-sans text-neutral-900 overflow-y-auto">
      <Header />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Matrix Flow</h1>
        <a
          href="https://www.youtube.com/@HARIKRISHNA-AU"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
        >
          <Youtube className="w-6 h-6" />
          <span className="font-semibold">@HARIKRISHNA-AU</span>
        </a>
      </div>

      {/* Game Board */}
      <div className="relative mb-8">
        <div
          className="grid gap-px bg-white border-4 border-white rounded-xl overflow-hidden shadow-2xl"
          style={{
            gridTemplateColumns: `repeat(${Math.sqrt(tiles.length) || 3}, minmax(0, 1fr))`
          }}
        >
          {tiles.map((tile, index) => (
            <FlowTile
              key={tile.id}
              tile={tile}
              matrix={tile.shape.getMatrix()}
              selected={selectedIndex === index}
              onSelect={() => setSelectedIndex(index)}
            />
          ))}
        </div>

        {/* Start/End Icons (Decorative based on image) */}
        <div className="absolute top-8 -left-12 text-neutral-800">
          {/* Start Icon Placeholder */}
          <div className="h-8 w-8 bg-neutral-800 rounded-full flex items-center justify-center text-white font-bold text-xs">S</div>
        </div>
        <div className="absolute bottom-8 -right-12 text-neutral-800">
          {/* End Icon Placeholder */}
          <div className="h-8 w-8 bg-neutral-800 rounded-full flex items-center justify-center text-white font-bold text-xs">E</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center gap-4">
        {/* Timer */}
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-neutral-300 bg-white text-xs font-bold text-neutral-600">
          {formatTime(timeLeft)}
          {/* Simple progress ring overlay could go here */}
          <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
            <path
              className="text-neutral-800"
              strokeDasharray={`${(timeLeft / 240) * 100}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
          </svg>
        </div>

        {/* Rotate Button */}
        <Button
          onClick={handleRotate}
          disabled={selectedIndex === null}
          className="h-12 w-12 rounded-lg bg-neutral-600 p-0 text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          <RotateCw className="h-6 w-6" />
        </Button>

        {/* Flip/Switch Button */}
        <Button
          onClick={handleFlipOrSwitch}
          disabled={selectedIndex === null}
          className="h-12 w-12 rounded-lg bg-neutral-600 p-0 text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          <ArrowLeftRight className="h-6 w-6" />
        </Button>

        {/* Validate Button */}
        <Button
          onClick={handleValidate}
          className="h-12 w-12 rounded-lg bg-neutral-600 p-0 text-white hover:bg-neutral-700"
        >
          <Check className="h-6 w-6" />
        </Button>

        {/* Back to Levels (Practice Mode Only) */}
        {gameMode === 'practice' && (
          <Button
            onClick={() => {
              setShowLevelSelect(true);
              setGameComplete(false); // Ensure we don't show completion screen
            }}
            className="h-12 w-12 rounded-lg bg-indigo-500 p-0 text-white hover:bg-indigo-600"
            title="Back to Levels"
          >
            <Grid3X3 className="h-6 w-6" />
          </Button>
        )}

        {/* Exit Button */}
        <Button
          onClick={() => window.location.href = "/dashboard"}
          className="h-12 w-12 rounded-lg bg-red-500 p-0 text-white hover:bg-red-600"
        >
          <LogOut className="h-6 w-6" />
        </Button>
      </div>

      {/* Validation Message (Overlay or Toast) */}
      {validation && (
        <div className="mt-6 text-center h-8"> {/* Fixed height to prevent layout shift */}
          {validation.solved ? (
            <div className="flex flex-col items-center gap-4">
              <div className="text-emerald-600 font-bold text-lg flex items-center gap-2">
                <ShieldCheck className="h-6 w-6" />
                Level {level} Solved!
              </div>
              {/* Auto-advancing, no button needed */}
            </div>
          ) : (
            <div className="text-rose-600 font-bold text-sm">
              {validation.errors[0]}
            </div>
          )}
          {!validation.solved && (
            <Button onClick={handleReset} variant="link" className="mt-2 text-neutral-500">
              Reset Level
            </Button>
          )}
        </div>
      )}

      {/* PREMIUM LOCK MODAL */}
      {showLockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative animate-in zoom-in-95 duration-200 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-neutral-900">Level 4 Locked</h2>
              <p className="text-neutral-600 mt-2">
                You've mastered the basics! Subscribe to <strong>Premium</strong> to unlock Levels 4-6 and challenge yourself with advanced puzzles.
              </p>
            </div>
            <Button
              onClick={() => setShowPaymentPopup(true)} // Changed to use ShowPopup
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-200"
            >
              Unlock All Levels
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/dashboard"}
              className="text-neutral-400 hover:text-neutral-600"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      )}
      <PaymentPopup isOpen={showPaymentPopup} onClose={() => setShowPaymentPopup(false)} />

    </div>
  );
}
