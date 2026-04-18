// DualTaskChallenge.tsx — Power of Attention & Memory
//
// Per level:
//   3 × [2s blink phase → 6s symmetry check]
//   then recall: tap the 3 blinked circles in order
//
// Scoring: +3 correct, -1 wrong per answer

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { ArrowLeft, Trophy, Play } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type PShape = 'triangle' | 'circle' | 'square' | 'plus';
type PColor  = 'blue' | 'green' | 'purple' | 'red';

interface PCell  { shape: PShape; color: PColor; }
type     PGrid   = PCell[][];

interface RoundData {
  blinkPos:    number;   // 0-15 in 4×4 grid
  patternA:    PGrid;
  patternB:    PGrid;    // flipH(A) if symmetric, random otherwise
  isSymmetric: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PFILLS: Record<PColor, string> = {
  blue: '#1e3a8a', green: '#166534', purple: '#7e22ce', red: '#b91c1c',
};

const TOTAL_LEVELS = 4;
const BLINK_MS     = 2000;
const SYM_SEC      = 6;
const ROUNDS_PER   = 3;                             // rounds per level

// Step mapping:  0,2,4 = blink;  1,3,5 = symmetry;  6 = recall
const isBlink    = (s: number) => s < ROUNDS_PER * 2 && s % 2 === 0;
const isSym      = (s: number) => s < ROUNDS_PER * 2 && s % 2 === 1;
const isRecall   = (s: number) => s === ROUNDS_PER * 2;
const roundOf    = (s: number) => Math.floor(s / 2);

// ── Helpers ───────────────────────────────────────────────────────────────────

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function makePattern(): PGrid {
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => ({
      shape: rnd<PShape>(['triangle', 'circle', 'square', 'plus']),
      color: rnd<PColor>(['blue', 'green', 'purple', 'red']),
    }))
  );
}

function flipH(p: PGrid): PGrid { return p.map(r => [...r].reverse()); }

function makeLevel(): RoundData[] {
  const used = new Set<number>();
  return Array.from({ length: ROUNDS_PER }, (): RoundData => {
    let pos = Math.floor(Math.random() * DOT_POSITIONS.length);
    while (used.has(pos)) pos = Math.floor(Math.random() * 16);
    used.add(pos);
    const pA = makePattern();
    const sym = Math.random() < 0.5;
    return { blinkPos: pos, patternA: pA, patternB: sym ? flipH(pA) : makePattern(), isSymmetric: sym };
  });
}

// ── Shape icon ────────────────────────────────────────────────────────────────

function ShapeIcon({ shape, size, color }: { shape: PShape; size: number; color: string }) {
  switch (shape) {
    case 'triangle': return <svg width={size} height={size} viewBox="0 0 36 36"><polygon points="18,3 34,33 2,33" fill={color}/></svg>;
    case 'circle':   return <svg width={size} height={size} viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill={color}/></svg>;
    case 'square':   return <svg width={size} height={size} viewBox="0 0 36 36"><rect x="3" y="3" width="30" height="30" rx="3" fill={color}/></svg>;
    case 'plus':     return <svg width={size} height={size} viewBox="0 0 36 36"><rect x="14" y="2" width="8" height="32" rx="3" fill={color}/><rect x="2" y="14" width="32" height="8" rx="3" fill={color}/></svg>;
  }
}

// ── Pattern display ───────────────────────────────────────────────────────────

function PatternDisplay({ grid }: { grid: PGrid }) {
  return (
    <div style={{
      display: 'inline-grid', gridTemplateColumns: 'repeat(3, 34px)',
      gap: 3, padding: 6, background: '#fff',
      border: '1.5px solid #e7e5e4', borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {grid.flat().map((cell, i) => (
        <div key={i} style={{
          width: 34, height: 34, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: PFILLS[cell.color] + '18',
        }}>
          <ShapeIcon shape={cell.shape} size={20} color={PFILLS[cell.color]} />
        </div>
      ))}
    </div>
  );
}

// ── Scattered dot positions (fixed, same every time) ─────────────────────────
// 20 dots placed on a 300×160 canvas — look organic/scattered, not grid-like

const DOT_POSITIONS: [number, number][] = [
  [22,  18],  [110, 10],  [210, 22],  [300, 12],  [370, 26],
  [60,  80],  [155, 68],  [255, 78],  [340, 62],  [410, 85],
  [18, 148],  [100,138],  [195,155],  [290,142],  [380,150],
  [75, 210],  [170,202],  [265,218],  [355,208],  [430,215],
];

const DOT_R   = 20;   // radius
const CVS_W   = 460;  // canvas width
const CVS_H   = 256;  // canvas height

// ── Circle grid ───────────────────────────────────────────────────────────────

function CircleGrid({
  blinkPos = -1,
  clickedOrder = [],
  onCircleClick,
  interactive = false,
}: {
  blinkPos?: number;
  clickedOrder?: number[];
  onCircleClick?: (pos: number) => void;
  interactive?: boolean;
}) {
  return (
    <div style={{
      position: 'relative', width: CVS_W, height: CVS_H,
      background: '#e8e8e6', borderRadius: 16,
      boxShadow: '0 3px 16px rgba(0,0,0,0.08)',
      flexShrink: 0,
    }}>
      {DOT_POSITIONS.map(([cx, cy], i) => {
        const isBlit    = i === blinkPos;
        const orderIdx  = clickedOrder.indexOf(i);
        const isClicked = orderIdx !== -1;
        return (
          <div
            key={i}
            onClick={() => interactive && !isClicked && onCircleClick?.(i)}
            style={{
              position: 'absolute',
              left: cx, top: cy,
              width: DOT_R * 2, height: DOT_R * 2,
              borderRadius: '50%',
              background: isBlit ? '#15803d' : isClicked ? '#7c3aed' : '#a8a29e',
              boxShadow: isBlit ? '0 0 18px rgba(21,128,61,0.7)' : 'none',
              transform: isBlit ? 'scale(1.25)' : 'scale(1)',
              transition: 'all 0.2s ease',
              cursor: interactive && !isClicked ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: isBlit ? 2 : 1,
            }}
          >
            {isClicked && (
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
                {orderIdx + 1}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DualTaskChallenge() {
  const navigate = useNavigate();

  // ── Top-level phase ──────────────────────────────────────────────────────
  const [gamePhase, setGamePhase] = useState<'intro' | 'game' | 'end'>('intro');

  // ── Per-game state ───────────────────────────────────────────────────────
  const [score,    setScore]    = useState(0);
  const [levelNum, setLevelNum] = useState(0);
  const [symCorrect, setSymCorrect] = useState(0); // correct sym answers total
  const [recallCorrectCount, setRecallCorrectCount] = useState(0);

  // ── Per-level state ──────────────────────────────────────────────────────
  const [rounds,       setRounds]       = useState<RoundData[]>([]);
  const [step,         setStep]         = useState(0);     // 0-6 within level
  const [symTime,      setSymTime]      = useState(SYM_SEC);
  const [symAnswered,  setSymAnswered]  = useState(false);
  const [symFeedback,  setSymFeedback]  = useState<boolean | null>(null); // null=no feedback
  const [recallClicks, setRecallClicks] = useState<number[]>([]);
  const [recallDone,   setRecallDone]   = useState(false);
  const [recallOk,     setRecallOk]     = useState<boolean | null>(null);

  // ── Start / restart ──────────────────────────────────────────────────────
  const launchLevel = useCallback((lNum: number) => {
    const newRounds = makeLevel();
    setLevelNum(lNum);
    setRounds(newRounds);
    setStep(0);
    setSymTime(SYM_SEC);
    setSymAnswered(false);
    setSymFeedback(null);
    setRecallClicks([]);
    setRecallDone(false);
    setRecallOk(null);
  }, []);

  const startGame = () => {
    setScore(0);
    setSymCorrect(0);
    setRecallCorrectCount(0);
    setGamePhase('game');
    launchLevel(0);
  };

  // ── Blink phase: auto-advance after BLINK_MS ────────────────────────────
  useEffect(() => {
    if (gamePhase !== 'game' || !isBlink(step)) return;
    const t = setTimeout(() => {
      setSymTime(SYM_SEC);
      setSymAnswered(false);
      setSymFeedback(null);
      setStep(s => s + 1);
    }, BLINK_MS);
    return () => clearTimeout(t);
  }, [gamePhase, step, levelNum]);  // levelNum re-fires when level resets

  // ── Symmetry countdown ───────────────────────────────────────────────────
  useEffect(() => {
    if (gamePhase !== 'game' || !isSym(step) || symAnswered) return;
    if (symTime <= 0) return;
    const t = setInterval(() => setSymTime(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [gamePhase, step, symAnswered, symTime]);

  // ── Symmetry timeout → auto wrong ───────────────────────────────────────
  useEffect(() => {
    if (gamePhase !== 'game' || !isSym(step) || symAnswered || symTime > 0) return;
    handleSym(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, step, symAnswered, symTime]);

  const handleSym = useCallback((answer: boolean | null) => {
    if (symAnswered) return;
    setSymAnswered(true);

    const round = rounds[roundOf(step)];
    if (!round) return;
    const correct = answer !== null && answer === round.isSymmetric;
    setScore(s => correct ? s + 3 : answer !== null ? Math.max(0, s - 1) : s);
    if (correct) setSymCorrect(c => c + 1);
    setSymFeedback(correct);

    setTimeout(() => {
      const nextStep = step + 1;
      setStep(nextStep);
      if (isSym(nextStep)) {
        setSymTime(SYM_SEC);
        setSymAnswered(false);
        setSymFeedback(null);
      }
    }, 700);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symAnswered, step, rounds]);

  // ── Recall click ─────────────────────────────────────────────────────────
  const handleRecallClick = (pos: number) => {
    if (!isRecall(step) || recallDone || recallClicks.includes(pos)) return;
    const newClicks = [...recallClicks, pos];
    setRecallClicks(newClicks);

    if (newClicks.length === ROUNDS_PER) {
      setRecallDone(true);
      const blinkSeq = rounds.map(r => r.blinkPos);
      const allOk = newClicks.every((p, i) => p === blinkSeq[i]);
      setRecallOk(allOk);
      setScore(s => allOk ? s + 3 : Math.max(0, s - 1));
      if (allOk) setRecallCorrectCount(c => c + 1);

      setTimeout(() => {
        if (levelNum + 1 < TOTAL_LEVELS) {
          launchLevel(levelNum + 1);
        } else {
          setGamePhase('end');
        }
      }, 1500);
    }
  };

  // ── Intro ─────────────────────────────────────────────────────────────────
  if (gamePhase === 'intro') {
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl"
            style={{ background: 'rgba(5,150,105,0.1)', border: '1.5px solid rgba(5,150,105,0.2)' }}>
            🧩
          </div>
          <h1 className="text-3xl font-serif text-stone-800 mb-1">Grid Challenge</h1>
          <p className="text-[13px] text-stone-400 font-['Inter'] mb-6">Power of Attention & Memory</p>

          <div className="rounded-2xl p-4 mb-4 text-left" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)' }}>
            <div className="text-[10px] font-bold text-stone-400 font-['Inter'] uppercase tracking-wider mb-2">How it works</div>
            <div className="space-y-2 text-sm font-['Inter'] text-stone-500">
              <p>1. A grid of circles is shown — <strong className="text-stone-700">one blinks</strong> for 2 s. Remember it.</p>
              <p>2. Two shape patterns appear for 6 s. Decide: <strong className="text-stone-700">symmetric or not?</strong></p>
              <p>3. Repeat steps 1 & 2 three times per level.</p>
              <p>4. <strong className="text-stone-700">Recall</strong> — tap the 3 circles that blinked, in the order shown.</p>
            </div>
          </div>

          <div className="rounded-2xl p-4 mb-8 text-left" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)' }}>
            <div className="text-[10px] font-bold text-stone-400 font-['Inter'] uppercase tracking-wider mb-3">Rules</div>
            <div className="space-y-2 text-sm font-['Inter'] text-stone-600">
              <div>👁 Highlighted circle appears for 2 s</div>
              <div>⏱ Patterns visible for 6 s</div>
              <div>✅ +3 marks per correct answer</div>
              <div>❌ −1 mark per wrong answer</div>
              <div>🎯 {TOTAL_LEVELS} levels total</div>
            </div>
          </div>

          <button onClick={startGame}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-stone-900 text-white font-['Inter'] font-semibold hover:bg-stone-700 transition-colors active:scale-95">
            <Play className="w-4 h-4" />
            Start
          </button>
        </div>
      </div>
    );
  }

  // ── End ───────────────────────────────────────────────────────────────────
  if (gamePhase === 'end') {
    const totalSym    = TOTAL_LEVELS * ROUNDS_PER;
    const totalRecall = TOTAL_LEVELS;
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <Trophy className="w-14 h-14 mx-auto text-amber-500 mb-4" />
          <h2 className="text-3xl font-serif text-stone-800 mb-2">Complete!</h2>
          <p className="text-stone-400 text-sm font-['Inter'] mb-8">Grid Challenge — {TOTAL_LEVELS} levels</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {([
              [score, 'Score'],
              [`${symCorrect}/${totalSym}`, 'Symmetry'],
              [`${recallCorrectCount}/${totalRecall}`, 'Recall'],
            ] as [string | number, string][]).map(([val, label]) => (
              <div key={label} className="rounded-2xl py-4 px-2"
                style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <div className="text-xl font-bold text-stone-800 font-['Inter']">{val}</div>
                <div className="text-[10px] text-stone-400 font-['Inter'] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-['Inter'] text-sm hover:bg-stone-50 transition-colors">
              ← Dashboard
            </button>
            <button onClick={startGame}
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-['Inter'] text-sm hover:bg-stone-700 transition-colors">
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Game ──────────────────────────────────────────────────────────────────
  if (rounds.length === 0) return null;

  const roundNum    = roundOf(step);
  const currentRound = rounds[Math.min(roundNum, ROUNDS_PER - 1)];
  const timerColor  = symTime <= 2 ? '#ef4444' : symTime <= 4 ? '#f59e0b' : '#059669';

  return (
    <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
      <Header />
      <div className="max-w-sm mx-auto px-4 pt-20 pb-16">

        {/* Nav */}
        <div className="flex items-center justify-between mt-4 mb-4">
          <button onClick={() => setGamePhase('intro')}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm font-['Inter'] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quit
          </button>
          <div className="flex items-center gap-4">
            <div className="text-[11px] text-stone-400 font-['Inter']">
              Level {levelNum + 1}/{TOTAL_LEVELS}
            </div>
            <div className="text-stone-800 font-bold font-['Inter'] text-sm">{score} pts</div>
          </div>
        </div>

        {/* Level progress bar */}
        <div className="h-1.5 bg-stone-100 rounded-full mb-5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${(levelNum / TOTAL_LEVELS) * 100}%`,
              background: 'linear-gradient(90deg, #059669, #10b981)',
            }} />
        </div>

        {/* Round indicator dots */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {Array.from({ length: ROUNDS_PER }, (_, i) => (
            <div key={i} className="flex items-center gap-1">
              {/* Blink dot */}
              <div className="w-2 h-2 rounded-full transition-all duration-200"
                style={{ background: step >= i * 2 ? '#f59e0b' : '#d6d3d1' }} />
              {/* Sym dot */}
              <div className="w-2 h-2 rounded-full transition-all duration-200"
                style={{ background: step > i * 2 ? '#059669' : '#d6d3d1' }} />
              {i < ROUNDS_PER - 1 && <div className="w-4 h-px bg-stone-200" />}
            </div>
          ))}
          {/* Recall dot */}
          <div className="w-4 h-px bg-stone-200" />
          <div className="w-3 h-3 rounded-full transition-all duration-200"
            style={{ background: isRecall(step) ? '#7c3aed' : '#d6d3d1' }} />
        </div>

        {/* ── BLINK PHASE ─────────────────────────────────────────────── */}
        {isBlink(step) && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-[11px] font-bold text-amber-600 font-['Inter'] uppercase tracking-wider mb-1">
                👁 Watch the circle!
              </p>
              <p className="text-xs text-stone-400 font-['Inter']">
                Round {roundNum + 1} of {ROUNDS_PER} — remember this position
              </p>
            </div>
            <CircleGrid blinkPos={currentRound.blinkPos} />
          </div>
        )}

        {/* ── SYMMETRY PHASE ──────────────────────────────────────────── */}
        {isSym(step) && (
          <div className="flex flex-col items-center gap-4">
            {/* Timer bar */}
            <div className="w-full">
              <div className="flex justify-between text-[10px] text-stone-400 font-['Inter'] mb-1">
                <span>Are these patterns symmetric?</span>
                <span style={{ color: timerColor, fontWeight: 700 }}>{symTime}s</span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(symTime / SYM_SEC) * 100}%`, background: timerColor }} />
              </div>
            </div>

            {/* Two patterns */}
            <div className="flex items-center justify-center gap-4">
              <PatternDisplay grid={currentRound.patternA} />
              <div className="text-stone-300 text-2xl leading-none select-none">↔</div>
              <PatternDisplay grid={currentRound.patternB} />
            </div>

            {/* Feedback overlay */}
            {symFeedback !== null && (
              <div className="text-sm font-bold font-['Inter'] text-center"
                style={{ color: symFeedback ? '#059669' : '#ef4444' }}>
                {symFeedback ? '✓ Correct! +3' : '✗ Wrong! −1'}
              </div>
            )}

            {/* YES / NO buttons */}
            {!symAnswered && (
              <div className="grid grid-cols-2 gap-3 w-full">
                <button onClick={() => handleSym(true)}
                  className="py-4 rounded-2xl text-sm font-bold font-['Inter'] transition-all duration-150 active:scale-95"
                  style={{ background: '#fff', border: '1.5px solid rgba(5,150,105,0.3)', color: '#059669', boxShadow: '0 2px 10px rgba(5,150,105,0.08)' }}>
                  ✓ Symmetric
                </button>
                <button onClick={() => handleSym(false)}
                  className="py-4 rounded-2xl text-sm font-bold font-['Inter'] transition-all duration-150 active:scale-95"
                  style={{ background: '#fff', border: '1.5px solid rgba(239,68,68,0.3)', color: '#ef4444', boxShadow: '0 2px 10px rgba(239,68,68,0.08)' }}>
                  ✗ Not Symmetric
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── RECALL PHASE ────────────────────────────────────────────── */}
        {isRecall(step) && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-[11px] font-bold text-violet-600 font-['Inter'] uppercase tracking-wider mb-1">
                🧠 Recall
              </p>
              <p className="text-xs text-stone-400 font-['Inter']">
                Tap the {ROUNDS_PER} circles that blinked — <strong>in the order they appeared</strong>
              </p>
            </div>

            <CircleGrid
              clickedOrder={recallClicks}
              onCircleClick={handleRecallClick}
              interactive={!recallDone}
            />

            {/* Progress */}
            <div className="text-xs text-stone-400 font-['Inter']">
              {recallClicks.length} / {ROUNDS_PER} selected
            </div>

            {/* Recall result */}
            {recallDone && recallOk !== null && (
              <div className="text-sm font-bold font-['Inter'] text-center"
                style={{ color: recallOk ? '#059669' : '#ef4444' }}>
                {recallOk ? '✓ Perfect recall! +3' : '✗ Incorrect order −1'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
