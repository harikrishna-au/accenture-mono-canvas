import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { ArrowLeft, Trophy, Play } from 'lucide-react';
import { useRecordOnFinish } from "@/hooks/useActivityResults";

interface Target {
  id: number;
  x: number;    // percent
  y: number;    // percent
  size: number; // px
  color: string;
  born: number; // timestamp
  ttl: number;  // ms
}

const COLORS = ['#7c3aed', '#0891b2', '#059669', '#d97706', '#e11d48'];
const GAME_DURATION = 45; // seconds
const BASE_TTL = 1800;    // ms each target lives

let nextId = 0;

function makeTarget(elapsed: number): Target {
  const speed = Math.min(elapsed / GAME_DURATION, 0.8);
  return {
    id: nextId++,
    x: 5 + Math.random() * 82,
    y: 5 + Math.random() * 75,
    size: Math.round(44 - speed * 16), // 44→28px as game speeds up
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    born: Date.now(),
    ttl: BASE_TTL - speed * 700,
  };
}

export default function MotionChallenge() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'end'>('intro');
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [combo, setCombo] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);
  const startTime = useRef<number>(0);
  const spawnTimer = useRef<ReturnType<typeof setInterval>>();
  const expireTimer = useRef<ReturnType<typeof setInterval>>();
  const countdownTimer = useRef<ReturnType<typeof setInterval>>();

  useRecordOnFinish("/game/motion", phase === 'end', () => ({
    score: hits,
    total: hits + misses,
    label: "hits",
  }));

  const stopAll = () => {
    clearInterval(spawnTimer.current);
    clearInterval(expireTimer.current);
    clearInterval(countdownTimer.current);
  };

  const startGame = useCallback(() => {
    setTargets([]);
    setScore(0);
    setHits(0);
    setMisses(0);
    setCombo(0);
    setTimeLeft(GAME_DURATION);
    startTime.current = Date.now();
    setPhase('playing');

    // Spawn targets
    spawnTimer.current = setInterval(() => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      setTargets(prev => {
        const alive = prev.filter(t => Date.now() - t.born < t.ttl);
        if (alive.length < 5) {
          return [...alive, makeTarget(elapsed)];
        }
        return alive;
      });
    }, 350);

    // Expire targets
    expireTimer.current = setInterval(() => {
      const now = Date.now();
      setTargets(prev => {
        const expired = prev.filter(t => now - t.born >= t.ttl);
        if (expired.length > 0) {
          setMisses(m => m + expired.length);
          setCombo(0);
          setScore(s => Math.max(0, s - expired.length * 3));
        }
        return prev.filter(t => now - t.born < t.ttl);
      });
    }, 200);

    // Countdown
    countdownTimer.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopAll();
          setPhase('end');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => stopAll(), []);

  const hitTarget = (id: number) => {
    setTargets(prev => prev.filter(t => t.id !== id));
    setHits(h => h + 1);
    setCombo(c => c + 1);
    setScore(prev => {
      const comboBonus = Math.min(combo, 10);
      return prev + 10 + comboBonus * 2;
    });
  };

  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;

  if (phase === 'intro') {
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl"
            style={{ background: 'rgba(8,145,178,0.1)', border: '1.5px solid rgba(8,145,178,0.2)' }}>
            🎯
          </div>
          <h1 className="text-3xl font-serif text-stone-800 mb-3">Motion Challenge</h1>
          <p className="text-stone-500 text-sm font-['Inter'] leading-relaxed mb-8 max-w-[260px] mx-auto">
            Tap the coloured circles before they vanish. Speed and accuracy both matter.
            Missing targets costs points!
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8 text-center">
            {[['45s', 'Duration'], ['−3pts', 'Per miss'], ['+10pts', 'Per hit']].map(([val, label]) => (
              <div key={label} className="rounded-xl py-3 px-2" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)' }}>
                <div className="text-lg font-bold text-stone-800 font-['Inter']">{val}</div>
                <div className="text-[10px] text-stone-400 font-['Inter']">{label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-stone-900 text-white font-['Inter'] font-semibold hover:bg-stone-700 transition-colors active:scale-95"
          >
            <Play className="w-4 h-4" />
            Start Game
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'end') {
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <Trophy className="w-14 h-14 mx-auto text-amber-500 mb-4" />
          <h2 className="text-3xl font-serif text-stone-800 mb-6">Time's up!</h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              [score, 'Score'],
              [hits, 'Hits'],
              [`${accuracy}%`, 'Accuracy'],
            ].map(([val, label]) => (
              <div key={String(label)} className="rounded-2xl py-4 px-2" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <div className="text-2xl font-bold text-stone-800 font-['Inter']">{val}</div>
                <div className="text-[10px] text-stone-400 font-['Inter'] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-['Inter'] text-sm hover:bg-stone-50 transition-colors">
              ← Dashboard
            </button>
            <button onClick={() => { setPhase('intro'); }} className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-['Inter'] text-sm hover:bg-stone-700 transition-colors">
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing phase
  return (
    <div style={{ background: '#fcfcf9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div className="max-w-lg mx-auto w-full px-4 pt-20 pb-4 flex flex-col flex-1">

        {/* HUD */}
        <div className="flex items-center justify-between mt-4 mb-3">
          <button onClick={() => { stopAll(); setPhase('intro'); }} className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm font-['Inter'] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quit
          </button>
          <div className="flex items-center gap-4">
            {combo >= 3 && (
              <span className="text-amber-500 font-bold text-xs font-['Inter'] animate-pulse">🔥 ×{combo}</span>
            )}
            <div className={`text-sm font-['Inter'] font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-stone-500'}`}>
              ⏱ {timeLeft}s
            </div>
            <div className="text-stone-800 font-bold font-['Inter'] text-sm">{score} pts</div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-1.5 bg-stone-100 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${(timeLeft / GAME_DURATION) * 100}%`,
              background: timeLeft <= 10 ? '#ef4444' : 'linear-gradient(90deg, #0891b2, #7c3aed)',
            }}
          />
        </div>

        {/* Play area */}
        <div
          ref={areaRef}
          className="flex-1 relative rounded-2xl overflow-hidden select-none"
          style={{
            background: '#ffffff',
            border: '1.5px solid rgba(0,0,0,0.07)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            minHeight: 340,
          }}
        >
          {targets.map(t => {
            const age = Date.now() - t.born;
            const opacity = Math.max(0.2, 1 - (age / t.ttl) * 0.6);
            return (
              <button
                key={t.id}
                onClick={() => hitTarget(t.id)}
                className="absolute rounded-full flex items-center justify-center transition-all duration-100 active:scale-75"
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  width: t.size,
                  height: t.size,
                  transform: 'translate(-50%, -50%)',
                  background: t.color,
                  opacity,
                  boxShadow: `0 0 ${t.size / 2}px ${t.color}55`,
                  border: `2px solid ${t.color}88`,
                }}
              />
            );
          })}

          {targets.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-sm font-['Inter']">
              Get ready…
            </div>
          )}
        </div>

        <div className="flex justify-between text-xs text-stone-400 font-['Inter'] mt-2">
          <span>Hits: <strong className="text-emerald-600">{hits}</strong></span>
          <span>Missed: <strong className="text-red-400">{misses}</strong></span>
        </div>
      </div>
    </div>
  );
}
