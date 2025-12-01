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
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createShape } from "@/puzzle/matrix/createShape";
import { generateLevel } from "@/puzzle/matrix/utils";
import { TileState, EvaluationResult } from "@/puzzle/matrix/types";
import { evaluateBoard } from "@/puzzle/matrix/validation";
import { FlowTile } from "@/components/matrix/FlowTile";
import Header from "@/components/Header";

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
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [validation, setValidation] = useState<EvaluationResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(240); // 4:00 in seconds
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    setTiles(buildBoard(level));
  }, [level]);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleValidate = () => {
    const result = evaluateBoard(tiles);
    setValidation(result);
    if (result.solved) {
      if (level < 3) {
        // Auto-advance after a short delay
        setTimeout(() => {
          setLevel(l => l + 1);
          setValidation(null);
          setSelectedIndex(null);
          setTimeLeft(240); // Reset timer for next level
        }, 1000);
      } else {
        setGameComplete(true);
        localStorage.setItem('completed_matrix', 'true');
      }
    }
  };

  const handleNextLevel = () => {
    // Deprecated in favor of auto-advance, but kept for safety if needed
    if (level < 3) {
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
      <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-neutral-50 p-4 font-sans text-neutral-900 text-center overflow-hidden">
        <div className="bg-white p-12 rounded-3xl shadow-2xl space-y-6 max-w-lg">
          <Trophy className="h-24 w-24 text-yellow-500 mx-auto animate-bounce" />
          <h1 className="text-4xl font-extrabold text-neutral-900">Assessment Complete!</h1>
          <p className="text-xl text-neutral-600">
            You have successfully solved all 3 levels of the Matrix Flow Puzzle.
          </p>
          <Button onClick={() => window.location.href = "/"} className="w-full h-14 text-lg bg-neutral-900 text-white">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-neutral-50 p-4 pt-20 font-sans text-neutral-900 overflow-hidden">
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
        <div className="grid grid-cols-3 gap-px bg-white border-4 border-white rounded-xl overflow-hidden shadow-2xl">
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

    </div>
  );
}
