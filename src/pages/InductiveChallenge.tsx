import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { ArrowLeft, Trophy, Play, ArrowDown, CheckCircle } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Shape = 'triangle' | 'circle' | 'square' | 'plus';
type Color = 'blue' | 'green' | 'purple' | 'red';

interface Cell { shape: Shape; color: Color; }
type Grid = Cell[][];

// ── Color / shape maps ────────────────────────────────────────────────────────

const SHAPES: Shape[] = ['triangle', 'circle', 'square', 'plus'];
const COLORS: Color[] = ['blue', 'green', 'purple', 'red'];

const COLOR_FILL: Record<Color, string> = {
  blue:   '#1e3a8a',
  green:  '#166534',
  purple: '#7e22ce',
  red:    '#b91c1c',
};

// ── Shape renderer ─────────────────────────────────────────────────────────────

function ShapeIcon({ shape, size, color }: { shape: Shape; size: number; color: string }) {
  const s = size;
  switch (shape) {
    case 'triangle':
      return (
        <svg width={s} height={s} viewBox="0 0 36 36">
          <polygon points="18,3 34,33 2,33" fill={color} />
        </svg>
      );
    case 'circle':
      return (
        <svg width={s} height={s} viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill={color} />
        </svg>
      );
    case 'square':
      return (
        <svg width={s} height={s} viewBox="0 0 36 36">
          <rect x="3" y="3" width="30" height="30" rx="3" fill={color} />
        </svg>
      );
    case 'plus':
      return (
        <svg width={s} height={s} viewBox="0 0 36 36">
          <rect x="14" y="2"  width="8" height="32" rx="3" fill={color} />
          <rect x="2"  y="14" width="32" height="8" rx="3" fill={color} />
        </svg>
      );
  }
}

// ── Grid display ───────────────────────────────────────────────────────────────

function GridDisplay({
  grid, cellSize = 30, selected = false, correct = false, wrong = false,
  onClick, label,
}: {
  grid: Grid;
  cellSize?: number;
  selected?: boolean;
  correct?: boolean;
  wrong?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  let borderColor = '#e7e5e4';
  if (correct) borderColor = '#059669';
  else if (wrong) borderColor = '#ef4444';
  else if (selected) borderColor = '#d97706';

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded-xl overflow-hidden cursor-pointer transition-all duration-150"
        style={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(3, ${cellSize}px)`,
          gap: 2,
          padding: 4,
          background: '#fff',
          border: `2px solid ${borderColor}`,
          boxShadow: selected
            ? '0 0 0 3px rgba(217,119,6,0.18)'
            : correct
            ? '0 0 0 3px rgba(5,150,105,0.18)'
            : wrong
            ? '0 0 0 3px rgba(239,68,68,0.18)'
            : '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.15s ease',
        }}
        onClick={onClick}
      >
        {grid.flat().map((cell, i) => (
          <div
            key={i}
            className="flex items-center justify-center bg-white"
            style={{ width: cellSize, height: cellSize, borderRadius: 4 }}
          >
            <ShapeIcon shape={cell.shape} size={Math.round(cellSize * 0.6)} color={COLOR_FILL[cell.color]} />
          </div>
        ))}
      </div>
      {label && (
        <div className="text-[11px] font-bold font-['Inter'] text-stone-400">{label}</div>
      )}
    </div>
  );
}

// ── Transformations ───────────────────────────────────────────────────────────

type TransformName = 'rotCW' | 'rotCCW' | 'rot180' | 'flipH' | 'flipV';

const TRANSFORMS: Record<TransformName, (g: Grid) => Grid> = {
  rotCW: (g) =>
    Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 3 }, (_, c) => g[2 - c][r])
    ) as Grid,
  rotCCW: (g) =>
    Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 3 }, (_, c) => g[c][2 - r])
    ) as Grid,
  rot180: (g) =>
    Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 3 }, (_, c) => g[2 - r][2 - c])
    ) as Grid,
  flipH: (g) => g.map(row => [...row].reverse()) as Grid,
  flipV: (g) => [...g].reverse() as Grid,
};

const TRANSFORM_NAMES = Object.keys(TRANSFORMS) as TransformName[];

// ── Grid helpers ──────────────────────────────────────────────────────────────

function randomCell(): Cell {
  return {
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

function randomGrid(): Grid {
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, randomCell)
  ) as Grid;
}

function gridsEqual(a: Grid, b: Grid): boolean {
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (a[r][c].shape !== b[r][c].shape || a[r][c].color !== b[r][c].color) return false;
  return true;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Question type ──────────────────────────────────────────────────────────────

interface Question {
  gridA: Grid;
  gridB: Grid;
  options: Grid[];            // 4 options
  correctIndices: [number, number]; // indices in options that form the correct pair
}

function makeQuestion(): Question {
  const tName = TRANSFORM_NAMES[Math.floor(Math.random() * TRANSFORM_NAMES.length)];
  const T = TRANSFORMS[tName];

  // Rule pair
  const gridA = randomGrid();
  const gridB = T(gridA);

  // Correct answer pair C → T(C)
  let gridC = randomGrid();
  let attempts = 0;
  while (gridsEqual(gridC, gridA)) {
    gridC = randomGrid();
    if (++attempts > 50) break;
  }
  const gridTC = T(gridC);

  // Wrong option D
  let gridD = randomGrid();
  attempts = 0;
  while (
    gridsEqual(gridD, gridA) || gridsEqual(gridD, gridC) || gridsEqual(gridD, gridTC)
  ) {
    gridD = randomGrid();
    if (++attempts > 100) break;
  }

  // Wrong option E — ensure T(E) ≠ gridD (otherwise D,E would be a correct pair via T)
  let gridE = randomGrid();
  attempts = 0;
  while (
    gridsEqual(gridE, gridA) || gridsEqual(gridE, gridC) || gridsEqual(gridE, gridTC) ||
    gridsEqual(gridE, gridD) || gridsEqual(T(gridD), gridE) || gridsEqual(T(gridE), gridD)
  ) {
    gridE = randomGrid();
    if (++attempts > 200) break;
  }

  // Shuffle options; track where C and T(C) end up
  // Use index tracking instead of reference to avoid issues
  const rawOptions = [gridC, gridTC, gridD, gridE];
  const indices = shuffle([0, 1, 2, 3]);
  const options = indices.map(i => rawOptions[i]);

  const posC  = indices.indexOf(0);
  const posTC = indices.indexOf(1);

  return { gridA, gridB, options, correctIndices: [posC, posTC] };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TOTAL_LEVELS = 12;
const TIME_LIMIT = 30;

// ── Main component ─────────────────────────────────────────────────────────────

export default function InductiveChallenge() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'end'>('intro');
  const [question, setQuestion] = useState<Question | null>(null);
  const [levelNum, setLevelNum] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selected, setSelected] = useState<number[]>([]);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextLevel = useCallback((num: number) => {
    if (num >= TOTAL_LEVELS) { setPhase('end'); return; }
    setQuestion(makeQuestion());
    setLevelNum(num);
    setSelected([]);
    setAnswered(false);
    setLastCorrect(null);
    setTimeLeft(TIME_LIMIT);
  }, []);

  const startGame = () => {
    setScore(0);
    setCorrectCount(0);
    setPhase('playing');
    nextLevel(0);
  };

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || answered) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setAnswered(true);
          setLastCorrect(false);
          setTimeout(() => nextLevel(levelNum + 1), 1200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase, answered, levelNum, nextLevel]);

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(prev => {
      if (prev.includes(idx)) return prev.filter(i => i !== idx);
      if (prev.length >= 2) return [prev[1], idx];
      return [...prev, idx];
    });
  };

  const handleSubmit = () => {
    if (!question || selected.length !== 2 || answered) return;
    clearInterval(timerRef.current!);
    setAnswered(true);

    const [ci1, ci2] = question.correctIndices;
    const isCorrect =
      (selected.includes(ci1) && selected.includes(ci2));

    setLastCorrect(isCorrect);
    if (isCorrect) {
      setScore(s => s + 3);
      setCorrectCount(c => c + 1);
    } else {
      setScore(s => Math.max(0, s - 1));
    }
    setTimeout(() => nextLevel(levelNum + 1), 1400);
  };

  // ── Intro ─────────────────────────────────────────────────────────────────

  if (phase === 'intro') {
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1.5px solid rgba(124,58,237,0.2)' }}
          >
            🔍
          </div>
          <h1 className="text-3xl font-serif text-stone-800 mb-1">Inductive Challenge</h1>
          <p className="text-[13px] text-stone-400 font-['Inter'] mb-6">Recognition</p>

          <div className="rounded-2xl p-4 mb-5 text-left" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)' }}>
            <div className="text-[10px] font-bold text-stone-400 font-['Inter'] uppercase tracking-wider mb-2">How it works</div>
            <p className="text-sm font-['Inter'] text-stone-600 leading-relaxed">
              Two grids on the left show a pattern change following a hidden rule.
              Four grids on the right are shown. Find the <strong>two grids</strong> that follow the same rule.
            </p>
          </div>

          <div className="rounded-2xl p-4 mb-8 text-left" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)' }}>
            <div className="text-[10px] font-bold text-stone-400 font-['Inter'] uppercase tracking-wider mb-3">Rules</div>
            <div className="space-y-2 text-sm font-['Inter'] text-stone-600">
              <div>⏱ 30 seconds per level</div>
              <div>✅ +3 marks for correct answer</div>
              <div>❌ −1 mark for wrong answer</div>
              <div>🎯 {TOTAL_LEVELS} levels total</div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-stone-900 text-white font-['Inter'] font-semibold hover:bg-stone-700 transition-colors active:scale-95"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        </div>
      </div>
    );
  }

  // ── End ───────────────────────────────────────────────────────────────────

  if (phase === 'end') {
    const accuracy = Math.round((correctCount / TOTAL_LEVELS) * 100);
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <Trophy className="w-14 h-14 mx-auto text-amber-500 mb-4" />
          <h2 className="text-3xl font-serif text-stone-800 mb-2">Complete!</h2>
          <p className="text-stone-400 text-sm font-['Inter'] mb-8">Inductive Challenge — {TOTAL_LEVELS} levels</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {([
              [score, 'Score'],
              [`${accuracy}%`, 'Accuracy'],
              [`${correctCount}/${TOTAL_LEVELS}`, 'Correct'],
            ] as [string | number, string][]).map(([val, label]) => (
              <div key={label} className="rounded-2xl py-4 px-2" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <div className="text-2xl font-bold text-stone-800 font-['Inter']">{val}</div>
                <div className="text-[10px] text-stone-400 font-['Inter'] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-['Inter'] text-sm hover:bg-stone-50 transition-colors">
              ← Dashboard
            </button>
            <button onClick={startGame} className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-['Inter'] text-sm hover:bg-stone-700 transition-colors">
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────

  if (!question) return null;

  const timerFraction = timeLeft / TIME_LIMIT;
  const timerColor = timeLeft <= 6 ? '#ef4444' : timeLeft <= 12 ? '#f59e0b' : '#7c3aed';
  const [ci1, ci2] = question.correctIndices;

  return (
    <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
      <Header />
      <div className="max-w-sm mx-auto px-4 pt-20 pb-16">

        {/* Nav */}
        <div className="flex items-center justify-between mt-4 mb-4">
          <button
            onClick={() => setPhase('intro')}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm font-['Inter'] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quit
          </button>
          <div className="flex items-center gap-4">
            <div className={`text-sm font-['Inter'] font-bold ${timeLeft <= 6 ? 'text-red-500 animate-pulse' : 'text-stone-500'}`}>
              ⏱ {timeLeft}s
            </div>
            <div className="text-stone-800 font-bold font-['Inter'] text-sm">{score} pts</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-stone-100 rounded-full mb-1 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(levelNum / TOTAL_LEVELS) * 100}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }}
          />
        </div>
        <div className="text-right text-[10px] text-stone-400 font-['Inter'] mb-4">
          Level {levelNum + 1} / {TOTAL_LEVELS}
        </div>

        {/* Timer bar */}
        <div className="h-1.5 bg-stone-100 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${timerFraction * 100}%`, background: timerColor }}
          />
        </div>

        {/* Rule pair — horizontal: A → B */}
        <div className="mb-5">
          <div className="text-[9px] font-bold text-stone-400 font-['Inter'] uppercase tracking-wider text-center mb-3">
            These two grids follow a rule
          </div>
          <div className="flex items-center justify-center gap-4">
            <GridDisplay grid={question.gridA} cellSize={40} />
            <div className="flex flex-col items-center gap-0.5">
              <div className="h-px w-5 bg-stone-300" />
              <div className="text-stone-400 text-lg leading-none">→</div>
              <div className="h-px w-5 bg-stone-300" />
            </div>
            <GridDisplay grid={question.gridB} cellSize={40} />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-stone-200 mb-5" />

        {/* Answer options */}
        <div>
          <div className="text-[9px] font-bold text-stone-400 font-['Inter'] uppercase tracking-wider text-center mb-3">
            Which two grids follow the same rule?
          </div>
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((grid, idx) => {
              const isSelected = selected.includes(idx);
              const isCorrectOption = answered && (idx === ci1 || idx === ci2);
              const isWrongSelected = answered && isSelected && !isCorrectOption;

              return (
                <GridDisplay
                  key={idx}
                  grid={grid}
                  cellSize={38}
                  selected={!answered && isSelected}
                  correct={isCorrectOption}
                  wrong={isWrongSelected}
                  onClick={() => handleSelect(idx)}
                  label={String(idx + 1)}
                />
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        {answered && (
          <div
            className="text-center text-sm font-bold font-['Inter'] mt-5"
            style={{ color: lastCorrect ? '#059669' : '#ef4444' }}
          >
            {lastCorrect
              ? '✓ Correct! +3 points'
              : timeLeft === 0
              ? `⏱ Time's up! −0 points`
              : `✗ Wrong! Correct: grids ${ci1 + 1} & ${ci2 + 1}`}
          </div>
        )}

        {/* Submit button */}
        {!answered && selected.length === 2 && (
          <button
            onClick={handleSubmit}
            className="w-full mt-5 py-3 rounded-xl bg-stone-900 text-white font-['Inter'] font-semibold text-sm hover:bg-stone-700 transition-colors active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Confirm Selection
          </button>
        )}

        {!answered && selected.length < 2 && (
          <p className="text-center text-[11px] text-stone-400 font-['Inter'] mt-4">
            {selected.length === 0 ? 'Select 2 grids from the right panel' : 'Select 1 more grid'}
          </p>
        )}
      </div>
    </div>
  );
}
