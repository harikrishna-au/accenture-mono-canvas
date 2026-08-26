import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { ArrowLeft, Trophy, Play } from 'lucide-react';
import { useRecordOnFinish } from "@/hooks/useActivityResults";

// ── BART — Balloon Analogue Risk Task ─────────────────────────────────────────
// 15 balloons. Each has a hidden random explosion threshold (8–80 pumps).
// Every pump earns 10 pts IF you collect. If you pump past threshold → pop → 0.
// Measures risk propensity. Optimal play: ~40-50 pumps per balloon.

const TOTAL_BALLOONS = 15;
const PTS_PER_PUMP   = 10;
const MIN_THRESH     = 8;
const MAX_THRESH     = 80;

function randomThreshold() {
  return MIN_THRESH + Math.floor(Math.random() * (MAX_THRESH - MIN_THRESH + 1));
}

type BalloonState = 'active' | 'collected' | 'popped';

export default function BARTGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'end'>('intro');
  const [balloonNum, setBalloonNum] = useState(1);
  const [pumps, setPumps] = useState(0);
  const [threshold, setThreshold] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [bankedThis, setBankedThis] = useState(0);
  const [state, setState] = useState<BalloonState>('active');
  const [history, setHistory] = useState<Array<{ pumps: number; state: BalloonState; earned: number }>>([]);
  const [isPumping, setIsPumping] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setInterval>>();

  useRecordOnFinish("/game/bart", phase === 'end', () => ({
    score: totalScore,
    label: "pts",
  }));

  const startGame = () => {
    setTotalScore(0);
    setBalloonNum(1);
    setPumps(0);
    setBankedThis(0);
    setState('active');
    setHistory([]);
    setThreshold(randomThreshold());
    setPhase('playing');
  };

  const pump = () => {
    if (state !== 'active') return;
    const newPumps = pumps + 1;
    if (newPumps > threshold) {
      setPumps(newPumps);
      setState('popped');
      setHistory(prev => [...prev, { pumps: newPumps, state: 'popped', earned: 0 }]);
    } else {
      setPumps(newPumps);
      setBankedThis(newPumps * PTS_PER_PUMP);
    }
  };

  const collect = () => {
    if (state !== 'active' || pumps === 0) return;
    const earned = pumps * PTS_PER_PUMP;
    setTotalScore(prev => prev + earned);
    setState('collected');
    setHistory(prev => [...prev, { pumps, state: 'collected', earned }]);
  };

  const nextBalloon = () => {
    if (balloonNum >= TOTAL_BALLOONS) {
      setPhase('end');
      return;
    }
    setBalloonNum(prev => prev + 1);
    setPumps(0);
    setBankedThis(0);
    setState('active');
    setThreshold(randomThreshold());
  };

  // Hold-to-pump support
  const startHold = () => {
    pump();
    holdTimer.current = setInterval(pump, 160);
    setIsPumping(true);
  };
  const stopHold = () => {
    clearInterval(holdTimer.current);
    setIsPumping(false);
  };
  useEffect(() => () => clearInterval(holdTimer.current), []);

  // Balloon visual size: grows with pumps (min 80px, max 200px)
  const balloonSize = Math.min(200, 80 + pumps * 1.6);
  const balloonColor = state === 'popped' ? '#ef4444' : state === 'collected' ? '#059669' : pumps < 20 ? '#0891b2' : pumps < 45 ? '#7c3aed' : '#e11d48';
  const dangerPct = Math.round((pumps / MAX_THRESH) * 100);

  if (phase === 'intro') {
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <div className="text-5xl mb-4">🎈</div>
          <h1 className="text-3xl font-serif text-stone-800 mb-3">BART</h1>
          <p className="text-stone-500 text-sm font-['Inter'] font-light mb-1">Balloon Analogue Risk Task</p>
          <p className="text-stone-500 text-sm font-['Inter'] leading-relaxed mb-6 max-w-[270px] mx-auto mt-3">
            Pump the balloon to earn points. <strong className="text-stone-700">Collect</strong> to bank them safely —
            but if it <strong className="text-red-500">pops</strong>, you lose everything on that balloon.
          </p>
          <div className="rounded-2xl p-4 mb-8 text-left" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)' }}>
            <div className="text-xs font-bold text-stone-400 font-['Inter'] uppercase tracking-wider mb-3">Rules</div>
            <div className="space-y-2 text-sm font-['Inter'] text-stone-600">
              <div>🎈 15 balloons total</div>
              <div>💰 +{PTS_PER_PUMP} pts per pump (if collected)</div>
              <div>💥 Pop = 0 pts for that balloon</div>
              <div>⚡ Each balloon has a random pop point</div>
              <div>🎯 Optimal strategy: moderate risk</div>
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

  if (phase === 'end') {
    const avgPumps = history.length > 0 ? Math.round(history.filter(h => h.state === 'collected').reduce((a, b) => a + b.pumps, 0) / Math.max(1, history.filter(h => h.state === 'collected').length)) : 0;
    const poppedCount = history.filter(h => h.state === 'popped').length;
    const riskProfile = avgPumps < 20 ? 'Conservative 🛡️' : avgPumps < 45 ? 'Balanced ⚖️' : 'Risk-Taker 🔥';
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <Trophy className="w-14 h-14 mx-auto text-amber-500 mb-4" />
          <h2 className="text-3xl font-serif text-stone-800 mb-6">All 15 Balloons Done!</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              [totalScore, 'Total Score'],
              [riskProfile, 'Risk Profile'],
            ].map(([val, label]) => (
              <div key={String(label)} className="rounded-2xl py-4 px-3 col-span-1" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <div className="text-xl font-bold text-stone-800 font-['Inter']">{val}</div>
                <div className="text-[10px] text-stone-400 font-['Inter'] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              [poppedCount, '💥 Popped'],
              [TOTAL_BALLOONS - poppedCount, '✅ Banked'],
              [avgPumps, 'Avg Pumps'],
            ].map(([val, label]) => (
              <div key={String(label)} className="rounded-2xl py-3 px-2" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)' }}>
                <div className="text-lg font-bold text-stone-800 font-['Inter']">{val}</div>
                <div className="text-[9px] text-stone-400 font-['Inter'] mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Balloon history */}
          <div className="flex gap-1 flex-wrap justify-center mb-6">
            {history.map((h, i) => (
              <div
                key={i}
                title={`${h.pumps} pumps, +${h.earned}pts`}
                className="text-base"
              >
                {h.state === 'popped' ? '💥' : '🎈'}
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

  return (
    <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
      <Header />
      <div className="max-w-sm mx-auto px-4 pt-20 pb-16">

        {/* Nav */}
        <div className="flex items-center justify-between mt-4 mb-4">
          <button onClick={() => setPhase('intro')} className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm font-['Inter'] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quit
          </button>
          <div className="flex items-center gap-4">
            <div className="text-stone-500 text-sm font-['Inter']">🎈 {balloonNum} / {TOTAL_BALLOONS}</div>
            <div className="text-stone-800 font-bold font-['Inter'] text-sm">{totalScore} pts</div>
          </div>
        </div>

        {/* History dots */}
        <div className="flex gap-1 mb-5">
          {Array.from({ length: TOTAL_BALLOONS }).map((_, i) => {
            const h = history[i];
            return (
              <div
                key={i}
                className="flex-1 h-1.5 rounded-full"
                style={{
                  background: h ? (h.state === 'popped' ? '#ef4444' : '#059669') : i === balloonNum - 1 ? '#d97706' : '#e5e3df',
                }}
              />
            );
          })}
        </div>

        {/* Balloon */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative flex items-center justify-center" style={{ height: 220 }}>
            {/* Shadow */}
            <div
              className="absolute bottom-0 rounded-full opacity-20"
              style={{
                width: balloonSize * 0.6,
                height: 12,
                background: '#000',
                filter: 'blur(6px)',
                transform: 'translateY(8px)',
              }}
            />
            {/* Balloon body */}
            <div
              className="rounded-full flex items-center justify-center transition-all duration-150 select-none"
              style={{
                width: balloonSize,
                height: balloonSize,
                background: state === 'popped'
                  ? 'rgba(239,68,68,0.15)'
                  : `radial-gradient(ellipse at 35% 30%, ${balloonColor}dd, ${balloonColor})`,
                boxShadow: state === 'active'
                  ? `0 8px 32px ${balloonColor}55, inset 0 4px 12px rgba(255,255,255,0.35)`
                  : 'none',
                border: `2px solid ${balloonColor}44`,
                transition: 'width 0.1s, height 0.1s',
              }}
            >
              {state === 'popped' && <span className="text-4xl">💥</span>}
              {state === 'collected' && <span className="text-4xl">✅</span>}
            </div>
          </div>

          {/* String */}
          {state === 'active' && (
            <div className="w-px h-8 bg-stone-300 mt-0" />
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            [pumps, 'Pumps'],
            [`${bankedThis}`, 'Pending pts'],
            [`${dangerPct}%`, 'Risk'],
          ].map(([val, label]) => (
            <div key={String(label)} className="rounded-xl py-2.5 text-center" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)' }}>
              <div className="text-lg font-bold font-['Inter'] text-stone-800">{val}</div>
              <div className="text-[9px] text-stone-400 font-['Inter']">{label}</div>
            </div>
          ))}
        </div>

        {/* Danger bar */}
        <div className="mb-5">
          <div className="flex justify-between text-[10px] text-stone-400 font-['Inter'] mb-1">
            <span>Safe</span>
            <span>Danger</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${dangerPct}%`,
                background: dangerPct < 30 ? '#059669' : dangerPct < 60 ? '#d97706' : '#ef4444',
              }}
            />
          </div>
        </div>

        {/* Action buttons */}
        {state === 'active' ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onMouseDown={startHold}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={startHold}
              onTouchEnd={stopHold}
              className="py-4 rounded-2xl font-['Inter'] font-bold text-sm transition-all active:scale-95 select-none"
              style={{
                background: isPumping ? '#1c1c1e' : 'rgba(8,145,178,0.1)',
                color: isPumping ? '#fff' : '#0891b2',
                border: `2px solid ${isPumping ? '#1c1c1e' : 'rgba(8,145,178,0.25)'}`,
                boxShadow: isPumping ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 10px rgba(8,145,178,0.1)',
              }}
            >
              🎈 Pump
            </button>
            <button
              onClick={collect}
              disabled={pumps === 0}
              className="py-4 rounded-2xl font-['Inter'] font-bold text-sm transition-all active:scale-95"
              style={{
                background: pumps > 0 ? 'rgba(5,150,105,0.12)' : '#f5f5f3',
                color: pumps > 0 ? '#059669' : '#c1beb8',
                border: `2px solid ${pumps > 0 ? 'rgba(5,150,105,0.3)' : 'rgba(0,0,0,0.06)'}`,
              }}
            >
              ✅ Collect
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div
              className="text-sm font-bold font-['Inter'] mb-4"
              style={{ color: state === 'popped' ? '#ef4444' : '#059669' }}
            >
              {state === 'popped'
                ? `💥 Balloon popped after ${pumps} pumps! +0 pts`
                : `✅ Collected ${pumps} pumps = +${pumps * PTS_PER_PUMP} pts!`}
            </div>
            <button
              onClick={nextBalloon}
              className="px-8 py-3 rounded-xl bg-stone-900 text-white font-['Inter'] font-semibold hover:bg-stone-700 transition-colors active:scale-95"
            >
              {balloonNum < TOTAL_BALLOONS ? `Next Balloon →` : 'See Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
