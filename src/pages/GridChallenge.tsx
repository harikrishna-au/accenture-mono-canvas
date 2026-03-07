import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { ArrowLeft, Clock, Trophy } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Question {
  label: string;
  grid: (string | number)[];    // 9 items — index 8 is the "?" cell
  options: (string | number)[];  // 4 options (will be shuffled at load time)
  answer: string | number;
  hint: string;
}

// ── Shuffle (Fisher-Yates) ─────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Question bank (60 questions) ───────────────────────────────────────────────
const RAW_QUESTIONS: Question[] = [

  // ── Arithmetic sequences ───────────────────────────────────────────────────
  {
    label: 'Complete the number matrix',
    grid:    [1, 2, 3, 4, 5, 6, 7, 8, '?'],
    options: [9, 10, 6, 7],
    answer:  9,
    hint: 'Numbers increase by 1 left-to-right, top-to-bottom.',
  },
  {
    label: 'Complete the pattern',
    grid:    [1, 3, 5, 7, 9, 11, 13, 15, '?'],
    options: [16, 17, 18, 19],
    answer:  17,
    hint: 'Odd numbers — each step +2.',
  },
  {
    label: 'Complete the matrix',
    grid:    [3, 6, 9, 12, 15, 18, 21, 24, '?'],
    options: [25, 26, 27, 28],
    answer:  27,
    hint: 'Multiples of 3.',
  },
  {
    label: 'Complete the pattern',
    grid:    [100, 90, 80, 70, 60, 50, 40, 30, '?'],
    options: [10, 20, 25, 15],
    answer:  20,
    hint: 'Decreasing by 10 each step.',
  },
  {
    label: 'Find the missing number',
    grid:    [5, 10, 15, 20, 25, 30, 35, 40, '?'],
    options: [42, 43, 45, 50],
    answer:  45,
    hint: 'Multiples of 5.',
  },
  {
    label: 'Find the missing number',
    grid:    [2, 4, 6, 8, 10, 12, 14, 16, '?'],
    options: [17, 18, 19, 20],
    answer:  18,
    hint: 'Even numbers — each step +2.',
  },
  {
    label: 'Complete the matrix',
    grid:    [4, 8, 12, 16, 20, 24, 28, 32, '?'],
    options: [34, 36, 38, 40],
    answer:  36,
    hint: 'Multiples of 4.',
  },
  {
    label: 'Find the missing number',
    grid:    [10, 20, 30, 40, 50, 60, 70, 80, '?'],
    options: [85, 88, 90, 95],
    answer:  90,
    hint: 'Multiples of 10.',
  },
  {
    label: 'Find the missing number',
    grid:    [50, 45, 40, 35, 30, 25, 20, 15, '?'],
    options: [5, 8, 10, 12],
    answer:  10,
    hint: 'Decreasing by 5 each step.',
  },
  {
    label: 'Complete the sequence',
    grid:    [2, 5, 8, 11, 14, 17, 20, 23, '?'],
    options: [24, 25, 26, 27],
    answer:  26,
    hint: 'Each number increases by 3.',
  },
  {
    label: 'Find the missing number',
    grid:    [1, 4, 7, 10, 13, 16, 19, 22, '?'],
    options: [23, 24, 25, 26],
    answer:  25,
    hint: 'Each number increases by 3.',
  },
  {
    label: 'Complete the pattern',
    grid:    [64, 56, 48, 40, 32, 24, 16, 8, '?'],
    options: [0, 2, 4, 6],
    answer:  0,
    hint: 'Decreasing by 8 each step.',
  },
  {
    label: 'Find the missing number',
    grid:    [3, 7, 11, 15, 19, 23, 27, 31, '?'],
    options: [33, 34, 35, 36],
    answer:  35,
    hint: 'Each number increases by 4.',
  },
  {
    label: 'Complete the matrix',
    grid:    [1, 6, 11, 16, 21, 26, 31, 36, '?'],
    options: [39, 40, 41, 42],
    answer:  41,
    hint: 'Each number increases by 5.',
  },
  {
    label: 'Find the missing number',
    grid:    [4, 7, 10, 13, 16, 19, 22, 25, '?'],
    options: [26, 27, 28, 30],
    answer:  28,
    hint: 'Arithmetic sequence — common difference 3.',
  },
  {
    label: 'Find the missing number',
    grid:    [7, 14, 21, 28, 35, 42, 49, 56, '?'],
    options: [60, 62, 63, 70],
    answer:  63,
    hint: 'Multiples of 7.',
  },
  {
    label: 'Find the missing number',
    grid:    [11, 22, 33, 44, 55, 66, 77, 88, '?'],
    options: [95, 97, 99, 100],
    answer:  99,
    hint: 'Multiples of 11.',
  },
  {
    label: 'Find the missing number',
    grid:    [8, 16, 24, 32, 40, 48, 56, 64, '?'],
    options: [70, 72, 74, 80],
    answer:  72,
    hint: 'Multiples of 8.',
  },
  {
    label: 'Find the missing number',
    grid:    [9, 18, 27, 36, 45, 54, 63, 72, '?'],
    options: [79, 80, 81, 82],
    answer:  81,
    hint: 'Multiples of 9.',
  },
  {
    label: 'Find the missing number',
    grid:    [6, 12, 18, 24, 30, 36, 42, 48, '?'],
    options: [52, 54, 56, 60],
    answer:  54,
    hint: 'Multiples of 6.',
  },

  // ── Powers & exponential ───────────────────────────────────────────────────
  {
    label: 'Find the missing number',
    grid:    [1, 2, 4, 8, 16, 32, 64, 128, '?'],
    options: [192, 248, 256, 512],
    answer:  256,
    hint: 'Powers of 2 — each doubles.',
  },
  {
    label: 'Find the missing number',
    grid:    [2, 4, 8, 3, 9, 27, 4, 16, '?'],
    options: [32, 48, 64, 20],
    answer:  64,
    hint: 'Each row: base raised to powers 1, 2, 3.',
  },
  {
    label: 'Find the missing number',
    grid:    [1, 3, 9, 2, 6, 18, 3, 9, '?'],
    options: [18, 24, 27, 30],
    answer:  27,
    hint: 'Each row: multiply by 3 each time.',
  },
  {
    label: 'Complete the pattern',
    grid:    [1, 5, 25, 2, 10, 50, 3, 15, '?'],
    options: [45, 60, 75, 90],
    answer:  75,
    hint: 'Each row: multiply by 5 each time.',
  },
  {
    label: 'Find the missing number',
    grid:    [3, 9, 27, 4, 16, 64, 5, 25, '?'],
    options: [100, 115, 125, 150],
    answer:  125,
    hint: 'Each row: base raised to powers 1, 2, 3.',
  },
  {
    label: 'Find the missing number',
    grid:    [2, 4, 16, 3, 9, 81, 4, 16, '?'],
    options: [64, 128, 256, 512],
    answer:  256,
    hint: 'Each row: n, n², n⁴.',
  },
  {
    label: 'Find the missing number',
    grid:    [1, 2, 8, 2, 4, 64, 3, 6, '?'],
    options: [108, 162, 216, 270],
    answer:  216,
    hint: 'Each row: a, 2a, (2a)³ / a².',
  },

  // ── Perfect squares & cubes ────────────────────────────────────────────────
  {
    label: 'Find the missing number',
    grid:    [4, 9, 16, 25, 36, 49, 64, 81, '?'],
    options: [90, 99, 100, 108],
    answer:  100,
    hint: 'Perfect squares: 2², 3², 4²…',
  },
  {
    label: 'Find the missing number',
    grid:    [1, 8, 27, 64, 125, 216, 343, 512, '?'],
    options: [625, 700, 729, 800],
    answer:  729,
    hint: 'Perfect cubes: 1³, 2³, 3³…',
  },
  {
    label: 'Complete the matrix',
    grid:    [1, 4, 9, 16, 25, 36, 49, 64, '?'],
    options: [72, 80, 81, 100],
    answer:  81,
    hint: 'Perfect squares: n² in sequence.',
  },
  {
    label: 'Find the missing number',
    grid:    [121, 144, 169, 196, 225, 256, 289, 324, '?'],
    options: [349, 361, 369, 400],
    answer:  361,
    hint: 'Perfect squares: 11², 12², 13²…',
  },

  // ── Fibonacci & special sequences ─────────────────────────────────────────
  {
    label: 'Find the missing number',
    grid:    [1, 1, 2, 3, 5, 8, 13, 21, '?'],
    options: [29, 33, 34, 36],
    answer:  34,
    hint: 'Fibonacci: each = sum of previous two.',
  },
  {
    label: 'Find the missing number',
    grid:    [0, 1, 1, 2, 3, 5, 8, 13, '?'],
    options: [18, 20, 21, 24],
    answer:  21,
    hint: 'Fibonacci starting from 0.',
  },
  {
    label: 'Find the missing number',
    grid:    [1, 3, 6, 10, 15, 21, 28, 36, '?'],
    options: [42, 44, 45, 48],
    answer:  45,
    hint: 'Triangular numbers — differences increase by 1 each time.',
  },
  {
    label: 'Find the missing number',
    grid:    [2, 6, 12, 20, 30, 42, 56, 72, '?'],
    options: [88, 90, 92, 96],
    answer:  90,
    hint: 'Oblong numbers n×(n+1). Differences: 4, 6, 8, 10…',
  },

  // ── Prime numbers ──────────────────────────────────────────────────────────
  {
    label: 'Complete the matrix',
    grid:    [2, 3, 5, 7, 11, 13, 17, 19, '?'],
    options: [21, 23, 25, 29],
    answer:  23,
    hint: 'Prime numbers in order.',
  },
  {
    label: 'Find the missing prime',
    grid:    [23, 29, 31, 37, 41, 43, 47, 53, '?'],
    options: [57, 59, 61, 63],
    answer:  59,
    hint: 'Consecutive prime numbers.',
  },
  {
    label: 'Find the missing prime',
    grid:    [59, 61, 67, 71, 73, 79, 83, 89, '?'],
    options: [91, 93, 97, 99],
    answer:  97,
    hint: 'Consecutive prime numbers — check divisibility.',
  },

  // ── Row/column arithmetic ──────────────────────────────────────────────────
  {
    label: 'Find the missing number',
    grid:    [1, 2, 3, 2, 4, 6, 3, 6, '?'],
    options: [7, 8, 9, 10],
    answer:  9,
    hint: 'Each row: col 3 = col 1 × col 2.',
  },
  {
    label: 'Find the missing number',
    grid:    [2, 3, 5, 4, 5, 9, 6, 7, '?'],
    options: [11, 12, 13, 14],
    answer:  13,
    hint: 'Each row: col 3 = col 1 + col 2.',
  },
  {
    label: 'Find the missing number',
    grid:    [10, 5, 2, 20, 10, 2, 30, 15, '?'],
    options: [1, 2, 3, 4],
    answer:  2,
    hint: 'Each row: col 3 = col 1 ÷ col 2.',
  },
  {
    label: 'Find the missing number',
    grid:    [5, 3, 15, 6, 4, 24, 7, 5, '?'],
    options: [30, 33, 35, 40],
    answer:  35,
    hint: 'Each row: col 3 = col 1 × col 2.',
  },
  {
    label: 'Find the missing number',
    grid:    [8, 3, 5, 12, 7, 5, 15, 9, '?'],
    options: [4, 5, 6, 7],
    answer:  6,
    hint: 'Each row: col 3 = col 1 − col 2.',
  },
  {
    label: 'Find the missing number',
    grid:    [3, 4, 7, 5, 6, 11, 8, 9, '?'],
    options: [15, 16, 17, 18],
    answer:  17,
    hint: 'Each row: col 3 = col 1 + col 2.',
  },
  {
    label: 'Find the missing number',
    grid:    [6, 2, 3, 12, 4, 3, 18, 6, '?'],
    options: [2, 3, 4, 5],
    answer:  3,
    hint: 'Each row: col 3 = col 1 ÷ col 2.',
  },
  {
    label: 'Find the missing number',
    grid:    [2, 2, 4, 3, 3, 9, 4, 4, '?'],
    options: [8, 12, 16, 20],
    answer:  16,
    hint: 'Each row: col 3 = col 1 × col 2.',
  },
  {
    label: 'Find the missing number',
    grid:    [4, 2, 8, 6, 3, 18, 8, 4, '?'],
    options: [24, 28, 32, 36],
    answer:  32,
    hint: 'Each row: col 3 = col 1 × col 2.',
  },
  {
    label: 'Find the missing number',
    grid:    [15, 5, 3, 24, 8, 3, 35, 7, '?'],
    options: [4, 5, 6, 7],
    answer:  5,
    hint: 'Each row: col 3 = col 1 ÷ col 2.',
  },
  {
    label: 'Find the missing number',
    grid:    [1, 5, 9, 2, 6, 10, 3, 7, '?'],
    options: [8, 10, 11, 12],
    answer:  11,
    hint: 'Each column increases by 1; each row increases by 4.',
  },
  {
    label: 'Find the missing number',
    grid:    [10, 8, 6, 8, 6, 4, 6, 4, '?'],
    options: [0, 1, 2, 3],
    answer:  2,
    hint: 'Each row decreases by 2; diagonal pattern.',
  },
  {
    label: 'Find the missing number',
    grid:    [36, 30, 24, 24, 18, 12, 12, 6, '?'],
    options: [0, 1, 2, 3],
    answer:  0,
    hint: 'Each row decreases by 6; columns decrease by 12.',
  },
  {
    label: 'Find the missing number',
    grid:    [3, 6, 18, 4, 8, 32, 5, 10, '?'],
    options: [40, 45, 50, 55],
    answer:  50,
    hint: 'Each row: col 3 = col 2 × col 1.',
  },

  // ── Shape / symbol patterns ────────────────────────────────────────────────
  {
    label: 'Find the missing shape',
    grid:    ['●', '●●', '●●●', '■', '■■', '■■■', '▲', '▲▲', '?'],
    options: ['▲', '▲▲▲', '●●●', '■■'],
    answer:  '▲▲▲',
    hint: 'Each row: same symbol × 1, 2, 3.',
  },
  {
    label: 'Find the missing symbol',
    grid:    ['▲', '◆', '●', '◆', '●', '▲', '●', '▲', '?'],
    options: ['▲', '●', '◆', '■'],
    answer:  '◆',
    hint: 'Each row and column has ▲ ◆ ● exactly once.',
  },
  {
    label: 'Find the missing symbol',
    grid:    ['■', '●', '▲', '●', '▲', '■', '▲', '■', '?'],
    options: ['▲', '■', '●', '◆'],
    answer:  '●',
    hint: 'Each row and column has ■ ● ▲ exactly once.',
  },
  {
    label: 'Find the missing symbol',
    grid:    ['◆', '●', '■', '■', '◆', '●', '●', '■', '?'],
    options: ['■', '●', '◆', '▲'],
    answer:  '◆',
    hint: 'Each row/column has ◆ ● ■ exactly once.',
  },
  {
    label: 'Find the missing symbol',
    grid:    ['▲', '■', '◆', '◆', '▲', '■', '■', '◆', '?'],
    options: ['▲', '■', '◆', '●'],
    answer:  '▲',
    hint: 'Each row and column has ▲ ■ ◆ exactly once.',
  },
  {
    label: 'Find the missing pattern',
    grid:    ['◆◆', '●●', '▲▲', '◆◆◆', '●●●', '▲▲▲', '◆', '●', '?'],
    options: ['●', '▲▲', '▲', '◆'],
    answer:  '▲',
    hint: 'Row 1: pairs, Row 2: triples, Row 3: singles.',
  },

  // ── Letter sequences ───────────────────────────────────────────────────────
  {
    label: 'Find the missing letter',
    grid:    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', '?'],
    options: ['H', 'I', 'J', 'K'],
    answer:  'I',
    hint: 'Alphabetical order A→Z.',
  },
  {
    label: 'Find the missing letter',
    grid:    ['Z', 'Y', 'X', 'W', 'V', 'U', 'T', 'S', '?'],
    options: ['P', 'Q', 'R', 'S'],
    answer:  'R',
    hint: 'Reverse alphabetical order Z→A.',
  },
  {
    label: 'Find the missing letter',
    grid:    ['A', 'C', 'E', 'G', 'I', 'K', 'M', 'O', '?'],
    options: ['P', 'Q', 'R', 'S'],
    answer:  'Q',
    hint: 'Every other letter — skip one each time.',
  },
  {
    label: 'Find the missing letter',
    grid:    ['B', 'D', 'F', 'H', 'J', 'L', 'N', 'P', '?'],
    options: ['Q', 'R', 'S', 'T'],
    answer:  'R',
    hint: 'Even-alphabet letters, step +2.',
  },
  {
    label: 'Find the missing letter',
    grid:    ['A', 'E', 'I', 'B', 'F', 'J', 'C', 'G', '?'],
    options: ['H', 'I', 'J', 'K'],
    answer:  'K',
    hint: 'Each row starts +1; each column jumps +4.',
  },
  {
    label: 'Find the missing letter',
    grid:    ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', '?'],
    options: ['R', 'S', 'T', 'U'],
    answer:  'R',
    hint: 'Alphabetical sequence continuing from J.',
  },
  {
    label: 'Find the missing letter',
    grid:    ['Z', 'X', 'V', 'T', 'R', 'P', 'N', 'L', '?'],
    options: ['H', 'I', 'J', 'K'],
    answer:  'J',
    hint: 'Reverse alphabet, skipping every other letter (step −2).',
  },
];

// ── Build question pool with shuffled options ──────────────────────────────────
function buildPool(): Question[] {
  return shuffle(RAW_QUESTIONS).map(q => ({
    ...q,
    options: shuffle(q.options),
  }));
}

const TOTAL_QUESTIONS = 12;
const TIME_PER_Q = 20;

// ── Component ──────────────────────────────────────────────────────────────────
export default function GridChallenge() {
  const navigate = useNavigate();
  const [questions] = useState(() => buildPool().slice(0, TOTAL_QUESTIONS));
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [gameOver, setGameOver] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (answered || gameOver) return;
    if (timeLeft <= 0) { handleAnswer(null); return; }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, answered, gameOver]);

  const handleAnswer = (opt: string | number | null) => {
    if (answered) return;
    setAnswered(true);
    setSelected(opt);
    const q = questions[qIdx];
    const correct = opt !== null && String(opt) === String(q.answer);
    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    if (correct) {
      const bonus = newStreak >= 3 ? 30 : 0;
      setScore(prev => prev + 10 + Math.max(0, timeLeft) + bonus);
    }
    setResults(prev => [...prev, correct]);

    setTimeout(() => {
      if (qIdx + 1 >= TOTAL_QUESTIONS) {
        setGameOver(true);
      } else {
        setQIdx(p => p + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(TIME_PER_Q);
      }
    }, 1100);
  };

  if (gameOver) {
    const correctCount = results.filter(Boolean).length;
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <Trophy className="w-14 h-14 mx-auto text-amber-500 mb-4" />
          <h2 className="text-3xl font-serif text-stone-800 mb-2">Complete!</h2>
          <p className="text-stone-500 font-['Inter'] text-sm mb-1">
            {correctCount} / {TOTAL_QUESTIONS} correct
          </p>
          <p className="text-5xl font-bold text-stone-900 font-['Inter'] mt-6 mb-2">{score}</p>
          <p className="text-stone-400 text-xs font-['Inter'] mb-8">points earned</p>

          <div className="flex gap-1 justify-center mb-8 flex-wrap">
            {results.map((r, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                style={{ background: r ? 'rgba(5,150,105,0.15)' : 'rgba(239,68,68,0.12)', color: r ? '#059669' : '#ef4444' }}
              >
                {r ? '✓' : '✗'}
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-['Inter'] text-sm hover:bg-stone-50 transition-colors"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => {
                // Rebuild pool with fresh shuffle on each replay
                window.location.reload();
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

  const q = questions[qIdx];

  return (
    <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
      <Header />
      <div className="max-w-sm mx-auto px-4 pt-20 pb-16">

        {/* Nav */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm font-['Inter'] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 text-sm font-['Inter'] font-medium ${timeLeft <= 8 ? 'text-red-500' : 'text-stone-500'}`}>
              <Clock className="w-4 h-4" />
              {timeLeft}s
            </div>
            <div className="text-stone-700 font-bold font-['Inter'] text-sm">{score} pts</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-stone-400 font-['Inter'] mb-1.5">
            <span>Question {qIdx + 1} / {TOTAL_QUESTIONS}</span>
            {streak >= 2 && <span className="text-amber-500 font-semibold">🔥 {streak} streak</span>}
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(qIdx / TOTAL_QUESTIONS) * 100}%`,
                background: 'linear-gradient(90deg, #7c3aed, #0891b2)',
              }}
            />
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-1 bg-stone-100 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${(timeLeft / TIME_PER_Q) * 100}%`,
              background: timeLeft <= 8 ? '#ef4444' : '#059669',
            }}
          />
        </div>

        <h1 className="text-2xl font-serif text-stone-800 mb-1">Grid Challenge</h1>
        <p className="text-stone-500 text-sm font-['Inter'] mb-5">{q.label}</p>

        {/* 3×3 Grid */}
        <div
          className="grid gap-2 mb-6 mx-auto"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: 290 }}
        >
          {q.grid.map((cell, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl flex items-center justify-center font-bold font-['Inter']"
              style={{
                background: cell === '?' ? '#1c1c1e' : '#fff',
                border: cell === '?' ? '2px solid #1c1c1e' : '1.5px solid rgba(0,0,0,0.08)',
                color: cell === '?' ? '#fff' : '#1c1c1e',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                fontSize: String(cell).length > 5 ? '10px' : String(cell).length > 3 ? '12px' : '15px',
              }}
            >
              {cell}
            </div>
          ))}
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2">
          {q.options.map((opt, i) => {
            const isSelected = selected !== null && String(opt) === String(selected);
            const isCorrect = answered && String(opt) === String(q.answer);
            const isWrong = answered && isSelected && !isCorrect;
            return (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={answered}
                className="py-3.5 rounded-xl text-sm font-bold font-['Inter'] transition-all duration-200 active:scale-95"
                style={{
                  background: isCorrect ? 'rgba(5,150,105,0.12)' : isWrong ? 'rgba(239,68,68,0.1)' : '#fff',
                  border: isCorrect ? '2px solid #059669' : isWrong ? '2px solid #ef4444' : '1.5px solid rgba(0,0,0,0.08)',
                  color: isCorrect ? '#059669' : isWrong ? '#ef4444' : '#1c1c1e',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {isCorrect && <span className="mr-1">✓</span>}
                {isWrong && <span className="mr-1">✗</span>}
                {opt}
              </button>
            );
          })}
        </div>

        {/* Hint after answer */}
        {answered && (
          <div className="mt-3 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-100 text-stone-500 text-xs font-['Inter']">
            💡 {q.hint}
          </div>
        )}
      </div>
    </div>
  );
}
