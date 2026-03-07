import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { ArrowLeft, Clock, Trophy, CheckCircle, Info } from 'lucide-react';

type Shape = 0 | 1 | 2 | 3;
type Cell = Shape | null;
type Grid = Cell[][];

const SHAPES = ['●', '■', '▲', '◆'];
const SHAPE_LABELS = ['Circle', 'Square', 'Triangle', 'Diamond'];
const SHAPE_COLORS = ['#7c3aed', '#0891b2', '#059669', '#d97706'];
const SHAPE_BG = ['rgba(124,58,237,0.1)', 'rgba(8,145,178,0.1)', 'rgba(5,150,105,0.1)', 'rgba(217,119,6,0.1)'];
const SHAPE_BORDER = ['rgba(124,58,237,0.25)', 'rgba(8,145,178,0.25)', 'rgba(5,150,105,0.25)', 'rgba(217,119,6,0.25)'];

interface Puzzle {
  grid: Grid;
  solution: Shape[][];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// All solutions verified: each row & col contains [0,1,2,3] exactly once
const PUZZLES: Puzzle[] = [
  {
    difficulty: 'Easy',
    grid: [
      [0, null, 2, null],
      [null, 0, null, 2],
      [2, null, 0, null],
      [null, 2, null, 0],
    ],
    solution: [[0,1,2,3],[1,0,3,2],[2,3,0,1],[3,2,1,0]],
  },
  {
    difficulty: 'Easy',
    grid: [
      [null, 1, null, 3],
      [2, null, 0, null],
      [null, 2, null, 0],
      [1, null, 3, null],
    ],
    solution: [[0,1,2,3],[2,3,0,1],[3,2,1,0],[1,0,3,2]],
  },
  {
    difficulty: 'Medium',
    grid: [
      [null, null, 2, 3],
      [3, 2, null, null],
      [null, null, 3, 2],
      [2, 3, null, null],
    ],
    solution: [[0,1,2,3],[3,2,1,0],[1,0,3,2],[2,3,0,1]],
  },
  {
    difficulty: 'Medium',
    grid: [
      [null, 0, null, null],
      [null, null, 2, null],
      [null, 2, null, 0],
      [2, null, 0, null],
    ],
    solution: [[1,0,3,2],[0,1,2,3],[3,2,1,0],[2,3,0,1]],
  },
  {
    difficulty: 'Hard',
    grid: [
      [null, 3, null, null],
      [null, null, 2, null],
      [null, 2, null, null],
      [null, 0, null, 2],
    ],
    solution: [[2,3,0,1],[0,1,2,3],[3,2,1,0],[1,0,3,2]],
  },
];

export default function GeoSudo() {
  const navigate = useNavigate();
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [userGrid, setUserGrid] = useState<Grid>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [showTip, setShowTip] = useState(true);

  const initPuzzle = useCallback((idx: number) => {
    const p = PUZZLES[idx];
    setUserGrid(p.grid.map(row => [...row]));
    setSelected(null);
    setErrors(new Set());
    setSolved(false);
  }, []);

  useEffect(() => { initPuzzle(0); }, []);

  useEffect(() => {
    if (gameOver || solved) return;
    if (timeLeft <= 0) { setGameOver(true); return; }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, gameOver, solved]);

  const isFixed = (r: number, c: number) => PUZZLES[puzzleIdx].grid[r][c] !== null;

  const detectErrors = (grid: Grid): Set<string> => {
    const errs = new Set<string>();
    for (let i = 0; i < 4; i++) {
      const rowVals = grid[i].map((v, c) => ({ v, c })).filter(x => x.v !== null);
      const rowSeen = new Map<number, number[]>();
      rowVals.forEach(({ v, c }) => {
        if (!rowSeen.has(v!)) rowSeen.set(v!, []);
        rowSeen.get(v!)!.push(c);
      });
      rowSeen.forEach((cols) => {
        if (cols.length > 1) cols.forEach(c => errs.add(`${i},${c}`));
      });

      const colVals = grid.map((row, r) => ({ v: row[i], r })).filter(x => x.v !== null);
      const colSeen = new Map<number, number[]>();
      colVals.forEach(({ v, r }) => {
        if (!colSeen.has(v!)) colSeen.set(v!, []);
        colSeen.get(v!)!.push(r);
      });
      colSeen.forEach((rows) => {
        if (rows.length > 1) rows.forEach(r => errs.add(`${r},${i}`));
      });
    }
    return errs;
  };

  const placeShape = (shape: Shape) => {
    if (!selected) return;
    const [r, c] = selected;
    if (isFixed(r, c)) return;

    const newGrid = userGrid.map(row => [...row]);
    newGrid[r][c] = shape;
    setUserGrid(newGrid);
    setSelected(null);

    const errs = detectErrors(newGrid);
    setErrors(errs);

    const complete = newGrid.every(row => row.every(cell => cell !== null));
    if (complete && errs.size === 0) {
      const puzzle = PUZZLES[puzzleIdx];
      const correct = newGrid.every((row, ri) => row.every((cell, ci) => cell === puzzle.solution[ri][ci]));
      if (correct) {
        const pts = Math.max(50, 100 + timeLeft);
        setScore(prev => prev + pts);
        setPuzzlesSolved(prev => prev + 1);
        setSolved(true);
        setTimeout(() => {
          if (puzzleIdx < PUZZLES.length - 1) {
            const next = puzzleIdx + 1;
            setPuzzleIdx(next);
            initPuzzle(next);
          } else {
            setGameOver(true);
          }
        }, 1200);
      }
    }
  };

  const clearCell = () => {
    if (!selected) return;
    const [r, c] = selected;
    if (isFixed(r, c)) return;
    const newGrid = userGrid.map(row => [...row]);
    newGrid[r][c] = null;
    setUserGrid(newGrid);
    setErrors(detectErrors(newGrid));
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (gameOver) {
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <Trophy className="w-14 h-14 mx-auto text-amber-500 mb-4" />
          <h2 className="text-3xl font-serif text-stone-800 mb-2">Game Over</h2>
          <p className="text-stone-500 font-['Inter'] text-sm mb-1">
            Puzzles solved: <strong className="text-stone-700">{puzzlesSolved}</strong> / {PUZZLES.length}
          </p>
          <p className="text-5xl font-bold text-stone-900 font-['Inter'] mt-6 mb-8">{score}</p>
          <p className="text-stone-400 text-xs font-['Inter'] mb-8">points earned</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-['Inter'] text-sm hover:bg-stone-50 transition-colors"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => {
                setPuzzleIdx(0); initPuzzle(0); setTimeLeft(120);
                setScore(0); setPuzzlesSolved(0); setGameOver(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-['Inter'] text-sm hover:bg-stone-700 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const puzzle = PUZZLES[puzzleIdx];

  return (
    <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
      <Header />
      <div className="max-w-sm mx-auto px-4 pt-20 pb-16">
        {/* Nav bar */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm font-['Inter'] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 text-sm font-['Inter'] font-medium ${timeLeft <= 30 ? 'text-red-500' : 'text-stone-500'}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
            <div className="text-stone-700 font-bold font-['Inter'] text-sm">{score} pts</div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl font-serif text-stone-800">Geo-Sudo</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-['Inter']"
              style={{
                background: puzzle.difficulty === 'Hard' ? 'rgba(239,68,68,0.1)' : puzzle.difficulty === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(5,150,105,0.1)',
                color: puzzle.difficulty === 'Hard' ? '#ef4444' : puzzle.difficulty === 'Medium' ? '#d97706' : '#059669',
              }}>
              {puzzle.difficulty}
            </span>
          </div>
          <p className="text-stone-400 text-xs font-['Inter']">
            Puzzle {puzzleIdx + 1} of {PUZZLES.length} · Each row &amp; column needs all 4 shapes
          </p>
        </div>

        {showTip && (
          <div className="flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5 mb-4 text-violet-600 text-xs font-['Inter']">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Tap a blank cell, then pick a shape below. Gray cells are fixed.</span>
            <button onClick={() => setShowTip(false)} className="ml-auto text-violet-400 hover:text-violet-600">✕</button>
          </div>
        )}

        {solved && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 mb-4 text-emerald-700 text-xs font-['Inter']">
            <CheckCircle className="w-3.5 h-3.5" />
            Solved! Loading next puzzle…
          </div>
        )}

        {/* 4×4 Grid */}
        <div
          className="grid gap-2 mb-6"
          style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
        >
          {userGrid.map((row, r) =>
            row.map((cell, c) => {
              const fixed = isFixed(r, c);
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const hasError = errors.has(`${r},${c}`);
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => { if (!fixed && !solved) setSelected(isSelected ? null : [r, c]); }}
                  className="aspect-square rounded-xl flex items-center justify-center text-xl transition-all duration-150 select-none"
                  style={{
                    background: isSelected ? '#1c1c1e' : fixed ? '#f1f0ed' : '#ffffff',
                    border: hasError
                      ? '2px solid #ef4444'
                      : isSelected
                        ? '2px solid #1c1c1e'
                        : '1.5px solid rgba(0,0,0,0.08)',
                    cursor: fixed ? 'default' : 'pointer',
                    boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {cell !== null && (
                    <span style={{ color: isSelected ? '#fff' : SHAPE_COLORS[cell], fontWeight: 700 }}>
                      {SHAPES[cell]}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Shape palette */}
        <div className="mb-4">
          <p className="text-stone-400 text-xs font-['Inter'] mb-2 text-center">
            {selected ? 'Pick a shape to place' : 'Tap a cell to select it'}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {SHAPES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => selected && placeShape(idx as Shape)}
                disabled={!selected}
                className="py-3 rounded-xl text-xl font-bold transition-all duration-150 active:scale-95"
                style={{
                  background: selected ? SHAPE_BG[idx] : '#f5f5f3',
                  border: `1.5px solid ${selected ? SHAPE_BORDER[idx] : 'rgba(0,0,0,0.06)'}`,
                  color: selected ? SHAPE_COLORS[idx] : '#c1beb8',
                  cursor: selected ? 'pointer' : 'default',
                  transform: selected ? 'scale(1)' : 'scale(0.97)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
          {selected && (
            <button
              onClick={clearCell}
              className="w-full mt-2 py-2 rounded-xl text-xs font-['Inter'] text-stone-400 hover:text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              Clear cell
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 justify-center">
          {SHAPES.map((s, idx) => (
            <div key={idx} className="flex items-center gap-1 text-[11px] font-['Inter'] text-stone-400">
              <span style={{ color: SHAPE_COLORS[idx] }}>{s}</span>
              <span>{SHAPE_LABELS[idx]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
