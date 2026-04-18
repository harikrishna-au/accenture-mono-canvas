import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { ArrowLeft, Trophy, Play } from 'lucide-react';

// ── Symbols ─────────────────────────────────────────────────────────────────

type SymbolKey = 'triangle' | 'square' | 'circle' | 'cross' | 'plus';

const ALL_SYMBOLS: SymbolKey[] = ['triangle', 'square', 'circle', 'cross', 'plus'];

function ShapeIcon({ sym, size = 36, color = '#4ade80' }: { sym: SymbolKey; size?: number; color?: string }) {
  const s = size;
  const c = color;
  switch (sym) {
    case 'triangle':
      return (
        <svg width={s} height={s} viewBox="0 0 36 36">
          <polygon points="18,4 34,32 2,32" fill={c} />
        </svg>
      );
    case 'square':
      return (
        <svg width={s} height={s} viewBox="0 0 36 36">
          <rect x="3" y="3" width="30" height="30" rx="2" fill={c} />
        </svg>
      );
    case 'circle':
      return (
        <svg width={s} height={s} viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill={c} />
        </svg>
      );
    case 'cross':
      return (
        <svg width={s} height={s} viewBox="0 0 36 36">
          <line x1="5" y1="5" x2="31" y2="31" stroke={c} strokeWidth="6" strokeLinecap="round" />
          <line x1="31" y1="5" x2="5" y2="31" stroke={c} strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    case 'plus':
      return (
        <svg width={s} height={s} viewBox="0 0 36 36">
          <line x1="18" y1="3" x2="18" y2="33" stroke={c} strokeWidth="7" strokeLinecap="round" />
          <line x1="3" y1="18" x2="33" y2="18" stroke={c} strokeWidth="7" strokeLinecap="round" />
        </svg>
      );
  }
}

// ── Game logic ───────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Returns all permutations of [1..n] as strings (used to generate distractors) */
function randomPermString(n: number, exclude: string): string {
  while (true) {
    const arr = shuffle(Array.from({ length: n }, (_, i) => i + 1));
    const s = arr.join('');
    if (s !== exclude) return s;
  }
}

interface Round {
  input: SymbolKey[];   // top row
  output: SymbolKey[];  // bottom row
  correctCode: string;  // e.g. "53142"
  options: string[];    // 4 shuffled options including correctCode
}

function makeRound(): Round {
  const input = shuffle(ALL_SYMBOLS);
  // Ensure output is always a different permutation
  let output = shuffle(ALL_SYMBOLS);
  while (output.join() === input.join()) output = shuffle(ALL_SYMBOLS);

  // For each symbol in output, find its 1-indexed position in input
  const correctCode = output.map(sym => input.indexOf(sym) + 1).join('');

  // 3 distractors
  const distractors: string[] = [];
  while (distractors.length < 3) {
    const d = randomPermString(5, correctCode);
    if (!distractors.includes(d)) distractors.push(d);
  }

  const options = shuffle([correctCode, ...distractors]);
  return { input, output, correctCode, options };
}

// ── Constants ────────────────────────────────────────────────────────────────

const TOTAL_ROUNDS = 15;
const TIME_LIMIT = 20;

// ── Component ────────────────────────────────────────────────────────────────

export default function SwithChallenge() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'end'>('intro');
  const [round, setRound] = useState<Round | null>(null);
  const [roundNum, setRoundNum] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [answered, setAnswered] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextRound = useCallback((num: number) => {
    if (num >= TOTAL_ROUNDS) { setPhase('end'); return; }
    setRound(makeRound());
    setRoundNum(num);
    setAnswered(false);
    setChosen(null);
    setTimeLeft(TIME_LIMIT);
  }, []);

  const startGame = () => {
    setScore(0);
    setCorrect(0);
    setPhase('playing');
    nextRound(0);
  };

  // Countdown
  useEffect(() => {
    if (phase !== 'playing' || answered) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setAnswered(true);
          setTimeout(() => nextRound(roundNum + 1), 900);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase, answered, roundNum, nextRound]);

  const handleChoice = (opt: string) => {
    if (!round || answered) return;
    clearInterval(timerRef.current!);
    setAnswered(true);
    setChosen(opt);
    const isCorrect = opt === round.correctCode;
    if (isCorrect) {
      setScore(s => s + 3);
      setCorrect(c => c + 1);
    } else {
      setScore(s => Math.max(0, s - 1));
    }
    setTimeout(() => nextRound(roundNum + 1), 900);
  };

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl"
            style={{ background: 'rgba(234,179,8,0.1)', border: '1.5px solid rgba(234,179,8,0.2)' }}
          >
            🔁
          </div>
          <h1 className="text-3xl font-serif text-stone-800 mb-3">Swith Challenge</h1>
          <p className="text-[13px] text-stone-500 font-['Inter'] leading-relaxed mb-1">Power of Logical Thinking</p>
          <p className="text-stone-400 text-[12px] font-['Inter'] leading-relaxed mb-6 max-w-[280px] mx-auto">
            Symbols are shown in a top row (input) and a bottom row (output). Find the number code that maps each output symbol back to its position in the input.
          </p>

          {/* Practice example */}
          <div className="rounded-2xl p-4 mb-6 text-left" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)' }}>
            <div className="text-[10px] font-bold text-stone-400 font-['Inter'] uppercase tracking-wider mb-3">Example</div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-stone-400 font-['Inter']">Input</span>
              <div className="flex gap-1">
                {(['circle', 'square', 'triangle', 'plus'] as SymbolKey[]).map((s, i) => (
                  <div key={i} className="w-9 h-9 rounded-lg bg-white border border-stone-100 flex items-center justify-center shadow-sm">
                    <ShapeIcon sym={s} size={22} color="#4ade80" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-stone-400 font-['Inter']">Output</span>
              <div className="flex gap-1">
                {(['triangle', 'square', 'plus', 'circle'] as SymbolKey[]).map((s, i) => (
                  <div key={i} className="w-9 h-9 rounded-lg bg-white border border-stone-100 flex items-center justify-center shadow-sm">
                    <ShapeIcon sym={s} size={22} color="#4ade80" />
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center text-sm font-bold font-['Inter'] text-stone-700">
              Answer: <span style={{ color: '#ca8a04' }}>3241</span>
            </div>
            <p className="text-[11px] text-stone-400 font-['Inter'] text-center mt-1">
              Triangle→pos 3, Square→pos 2, Plus→pos 4, Circle→pos 1
            </p>
          </div>

          <div className="rounded-2xl p-4 mb-8 text-left" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)' }}>
            <div className="text-xs font-bold text-stone-400 font-['Inter'] uppercase tracking-wider mb-3">Rules</div>
            <div className="space-y-2 text-sm font-['Inter'] text-stone-600">
              <div>⏱ 20 seconds per question</div>
              <div>✅ +3 marks for each correct answer</div>
              <div>❌ −1 mark for each wrong answer</div>
              <div>🎯 {TOTAL_ROUNDS} questions total</div>
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

  // ── End ────────────────────────────────────────────────────────────────────
  if (phase === 'end') {
    const accuracy = Math.round((correct / TOTAL_ROUNDS) * 100);
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <Trophy className="w-14 h-14 mx-auto text-amber-500 mb-4" />
          <h2 className="text-3xl font-serif text-stone-800 mb-2">Complete!</h2>
          <p className="text-stone-400 text-sm font-['Inter'] mb-8">Swith Challenge — {TOTAL_ROUNDS} questions</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {([
              [score, 'Score'],
              [`${accuracy}%`, 'Accuracy'],
              [`${correct}/${TOTAL_ROUNDS}`, 'Correct'],
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

  // ── Playing ────────────────────────────────────────────────────────────────
  if (!round) return null;

  const timerFraction = timeLeft / TIME_LIMIT;
  const timerColor = timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#ca8a04';

  return (
    <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
      <Header />
      <div className="max-w-sm mx-auto px-4 pt-20 pb-16">

        {/* Nav bar */}
        <div className="flex items-center justify-between mt-4 mb-5">
          <button
            onClick={() => setPhase('intro')}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm font-['Inter'] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quit
          </button>
          <div className="flex items-center gap-4">
            <div className={`text-sm font-['Inter'] font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-stone-500'}`}>
              ⏱ {timeLeft}s
            </div>
            <div className="text-stone-800 font-bold font-['Inter'] text-sm">{score} pts</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-stone-100 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(roundNum / TOTAL_ROUNDS) * 100}%`, background: 'linear-gradient(90deg, #ca8a04, #eab308)' }}
          />
        </div>

        {/* Question counter */}
        <div className="text-center text-[11px] text-stone-400 font-['Inter'] mb-5">
          Question {roundNum + 1} / {TOTAL_ROUNDS}
        </div>

        {/* Input row */}
        <div className="mb-2">
          <div className="text-[10px] font-bold text-stone-400 font-['Inter'] uppercase tracking-wider text-center mb-2">Input</div>
          <div className="flex justify-center gap-2">
            {round.input.map((sym, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-stone-100 flex items-center justify-center shadow-sm">
                  <ShapeIcon sym={sym} size={28} color="#4ade80" />
                </div>
                <span className="text-[10px] text-stone-300 font-['Inter'] font-semibold">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow indicators */}
        <div className="flex justify-center gap-6 my-3">
          <div className="text-2xl text-yellow-500 leading-none select-none">↑↓</div>
        </div>

        {/* Output row */}
        <div className="mb-6">
          <div className="text-[10px] font-bold text-stone-400 font-['Inter'] uppercase tracking-wider text-center mb-2">Output</div>
          <div className="flex justify-center gap-2">
            {round.output.map((sym, i) => (
              <div key={i} className="w-12 h-12 rounded-xl bg-white border border-stone-100 flex items-center justify-center shadow-sm">
                <ShapeIcon sym={sym} size={28} color="#4ade80" />
              </div>
            ))}
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-1.5 bg-stone-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${timerFraction * 100}%`, background: timerColor }}
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {round.options.map((opt) => {
            const isCorrect = opt === round.correctCode;
            const isChosen = opt === chosen;
            let bg = '#fff';
            let borderColor = 'rgba(202,138,4,0.25)';
            let textColor = '#1c1c1e';

            if (answered) {
              if (isCorrect) { bg = 'rgba(5,150,105,0.1)'; borderColor = '#059669'; textColor = '#059669'; }
              else if (isChosen && !isCorrect) { bg = 'rgba(239,68,68,0.08)'; borderColor = '#ef4444'; textColor = '#ef4444'; }
            }

            return (
              <button
                key={opt}
                onClick={() => handleChoice(opt)}
                disabled={answered}
                className="py-4 rounded-2xl text-lg font-bold font-['Inter'] tracking-widest transition-all duration-150 active:scale-95 shadow-sm"
                style={{
                  background: bg,
                  border: `1.5px solid ${borderColor}`,
                  color: textColor,
                  boxShadow: answered ? 'none' : '0 2px 10px rgba(202,138,4,0.08)',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {answered && (
          <div
            className="text-center text-sm font-bold font-['Inter'] mt-4"
            style={{ color: chosen === round.correctCode ? '#059669' : chosen ? '#ef4444' : '#d97706' }}
          >
            {chosen === round.correctCode
              ? '✓ Correct! +3'
              : chosen
              ? `✗ Wrong — answer was ${round.correctCode}`
              : `⏱ Time's up — answer was ${round.correctCode}`}
          </div>
        )}
      </div>
    </div>
  );
}
