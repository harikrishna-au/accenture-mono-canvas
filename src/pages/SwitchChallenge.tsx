import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { ArrowLeft, Trophy, Play } from 'lucide-react';
import { useRecordOnFinish } from "@/hooks/useActivityResults";

// ── Task definitions ───────────────────────────────────────────────────────────
type TaskType = 'number' | 'letter';

interface Trial {
  task: TaskType;
  stimulus: string;
  leftLabel: string;
  rightLabel: string;
  correctSide: 'left' | 'right';
}

const NUMBERS = ['1','2','3','4','5','6','7','8','9'];
const LETTERS = ['A','E','I','O','U','B','C','D','F','G','H','J','K','L','M','N','P','R','S','T'];
const VOWELS = new Set(['A','E','I','O','U']);

function makeTrial(task: TaskType): Trial {
  if (task === 'number') {
    const n = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    const isOdd = parseInt(n) % 2 !== 0;
    return {
      task,
      stimulus: n,
      leftLabel: 'ODD',
      rightLabel: 'EVEN',
      correctSide: isOdd ? 'left' : 'right',
    };
  } else {
    const l = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    const isVowel = VOWELS.has(l);
    return {
      task,
      stimulus: l,
      leftLabel: 'VOWEL',
      rightLabel: 'CONSONANT',
      correctSide: isVowel ? 'left' : 'right',
    };
  }
}

function nextTask(prev: TaskType, trialNum: number): TaskType {
  // Switch task every 3 trials
  if (trialNum % 3 === 0) return prev === 'number' ? 'letter' : 'number';
  return prev;
}

const TOTAL_TRIALS = 30;
const TIME_LIMIT = 8; // seconds per trial

export default function SwitchChallenge() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'end'>('intro');
  const [trial, setTrial] = useState<Trial | null>(null);
  const [trialNum, setTrialNum] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [answered, setAnswered] = useState(false);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [streak, setStreak] = useState(0);
  const [taskHistory, setTaskHistory] = useState<TaskType[]>([]);
  const currentTask_ref = React.useRef<TaskType>('number');

  useRecordOnFinish("/game/switch", phase === 'end', () => ({
    score: correct,
    total: TOTAL_TRIALS,
    label: "correct",
  }));

  const nextTrial = useCallback((num: number) => {
    if (num >= TOTAL_TRIALS) { setPhase('end'); return; }
    const task = nextTask(currentTask_ref.current, num);
    currentTask_ref.current = task;
    setTaskHistory(prev => [...prev, task]);
    setTrial(makeTrial(task));
    setTrialNum(num);
    setAnswered(false);
    setLastResult(null);
    setTimeLeft(TIME_LIMIT);
  }, []);

  const startGame = () => {
    setScore(0);
    setCorrect(0);
    setStreak(0);
    setTaskHistory([]);
    currentTask_ref.current = 'number';
    setPhase('playing');
    nextTrial(0);
  };

  useEffect(() => {
    if (phase !== 'playing' || answered || !trial) return;
    if (timeLeft <= 0) {
      setAnswered(true);
      setLastResult('timeout');
      setStreak(0);
      setTimeout(() => nextTrial(trialNum + 1), 800);
      return;
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, phase, answered, trial, trialNum, nextTrial]);

  const handleChoice = (side: 'left' | 'right') => {
    if (!trial || answered) return;
    setAnswered(true);
    const isCorrect = side === trial.correctSide;
    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);
    setLastResult(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      const bonus = newStreak >= 5 ? 5 : 0;
      setScore(prev => prev + 10 + timeLeft + bonus);
      setCorrect(prev => prev + 1);
    }
    setTimeout(() => nextTrial(trialNum + 1), 700);
  };

  if (phase === 'intro') {
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl"
            style={{ background: 'rgba(5,150,105,0.1)', border: '1.5px solid rgba(5,150,105,0.2)' }}>
            🔀
          </div>
          <h1 className="text-3xl font-serif text-stone-800 mb-3">Switch Challenge</h1>
          <p className="text-stone-500 text-sm font-['Inter'] leading-relaxed mb-6 max-w-[270px] mx-auto">
            Two tasks alternate. For <strong className="text-violet-600">numbers</strong>: press Odd or Even.
            For <strong className="text-cyan-600">letters</strong>: press Vowel or Consonant.
          </p>
          <div className="rounded-2xl p-4 mb-8 text-left" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)' }}>
            <div className="text-xs font-bold text-stone-400 font-['Inter'] uppercase tracking-wider mb-3">Rules</div>
            <div className="space-y-2 text-sm font-['Inter'] text-stone-600">
              <div>🔢 Number task: <strong>ODD</strong> (left) or <strong>EVEN</strong> (right)</div>
              <div>🔤 Letter task: <strong>VOWEL</strong> (left) or <strong>CONSONANT</strong> (right)</div>
              <div>⚡ Task switches every 3 trials</div>
              <div>⏱ 8 seconds per trial</div>
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
    const accuracy = Math.round((correct / TOTAL_TRIALS) * 100);
    // Count switches
    let switches = 0;
    for (let i = 1; i < taskHistory.length; i++) {
      if (taskHistory[i] !== taskHistory[i - 1]) switches++;
    }
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <Trophy className="w-14 h-14 mx-auto text-amber-500 mb-4" />
          <h2 className="text-3xl font-serif text-stone-800 mb-6">Complete!</h2>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              [score, 'Score'],
              [`${accuracy}%`, 'Accuracy'],
              [switches, 'Switches'],
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
            <button onClick={startGame} className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-['Inter'] text-sm hover:bg-stone-700 transition-colors">
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!trial) return null;

  const isSwitch = trialNum > 0 && taskHistory.length >= 2 && taskHistory[taskHistory.length - 1] !== taskHistory[taskHistory.length - 2];
  const taskColor = trial.task === 'number' ? '#7c3aed' : '#0891b2';
  const taskBg = trial.task === 'number' ? 'rgba(124,58,237,0.08)' : 'rgba(8,145,178,0.08)';

  return (
    <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
      <Header />
      <div className="max-w-sm mx-auto px-4 pt-20 pb-16">

        {/* Nav */}
        <div className="flex items-center justify-between mt-4 mb-5">
          <button onClick={() => setPhase('intro')} className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm font-['Inter'] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quit
          </button>
          <div className="flex items-center gap-4">
            {streak >= 3 && <span className="text-amber-500 font-bold text-xs font-['Inter']">🔥 {streak}</span>}
            <div className={`text-sm font-['Inter'] font-bold ${timeLeft <= 3 ? 'text-red-500' : 'text-stone-500'}`}>⏱ {timeLeft}s</div>
            <div className="text-stone-800 font-bold font-['Inter'] text-sm">{score} pts</div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-stone-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(trialNum / TOTAL_TRIALS) * 100}%`, background: `linear-gradient(90deg, ${taskColor}, ${taskColor}aa)` }}
          />
        </div>

        {/* Task badge */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold font-['Inter'] uppercase tracking-wider"
            style={{ background: taskBg, color: taskColor, border: `1px solid ${taskColor}33` }}
          >
            {trial.task === 'number' ? '🔢' : '🔤'}
            {trial.task === 'number' ? 'Number Task' : 'Letter Task'}
          </div>
          {isSwitch && (
            <span className="text-[10px] font-bold text-orange-500 font-['Inter'] animate-pulse uppercase tracking-wider">
              ⚡ SWITCH!
            </span>
          )}
        </div>

        {/* Stimulus */}
        <div
          className="rounded-3xl flex items-center justify-center mb-6 mx-auto"
          style={{
            width: 160,
            height: 160,
            background: taskBg,
            border: `2px solid ${taskColor}44`,
            boxShadow: `0 8px 32px ${taskColor}22`,
          }}
        >
          <span
            className="font-bold font-['Inter'] select-none"
            style={{ fontSize: 80, color: taskColor, lineHeight: 1 }}
          >
            {trial.stimulus}
          </span>
        </div>

        {/* Timer bar */}
        <div className="h-1.5 bg-stone-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${(timeLeft / TIME_LIMIT) * 100}%`,
              background: timeLeft <= 3 ? '#ef4444' : taskColor,
            }}
          />
        </div>

        {/* Feedback flash */}
        {answered && (
          <div
            className="text-center text-sm font-bold font-['Inter'] mb-4"
            style={{ color: lastResult === 'correct' ? '#059669' : lastResult === 'wrong' ? '#ef4444' : '#d97706' }}
          >
            {lastResult === 'correct' ? '✓ Correct!' : lastResult === 'wrong' ? '✗ Wrong' : '⏱ Too slow!'}
          </div>
        )}

        {/* Choice buttons */}
        <div className="grid grid-cols-2 gap-4">
          {(['left', 'right'] as const).map(side => {
            const label = side === 'left' ? trial.leftLabel : trial.rightLabel;
            const isCorrectSide = trial.correctSide === side;
            const wasChosen = answered && lastResult !== 'timeout' && (isCorrectSide ? lastResult === 'correct' : lastResult === 'wrong');
            return (
              <button
                key={side}
                onClick={() => handleChoice(side)}
                disabled={answered}
                className="py-5 rounded-2xl text-base font-bold font-['Inter'] tracking-wider transition-all duration-150 active:scale-95"
                style={{
                  background: answered && isCorrectSide
                    ? 'rgba(5,150,105,0.15)'
                    : answered && wasChosen && !isCorrectSide
                      ? 'rgba(239,68,68,0.1)'
                      : '#fff',
                  border: answered && isCorrectSide
                    ? '2px solid #059669'
                    : answered && wasChosen && !isCorrectSide
                      ? '2px solid #ef4444'
                      : `1.5px solid ${taskColor}33`,
                  color: answered && isCorrectSide
                    ? '#059669'
                    : answered && wasChosen && !isCorrectSide
                      ? '#ef4444'
                      : taskColor,
                  boxShadow: answered ? 'none' : `0 2px 12px ${taskColor}18`,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="text-center mt-4 text-xs text-stone-400 font-['Inter']">
          Trial {trialNum + 1} / {TOTAL_TRIALS}
        </div>
      </div>
    </div>
  );
}
