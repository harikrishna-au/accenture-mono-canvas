import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { ArrowLeft, Trophy, Play } from 'lucide-react';
import { useRecordOnFinish } from "@/hooks/useActivityResults";

type Phase = 'intro' | 'showing' | 'recall' | 'feedback' | 'end';

const SHOW_MS = 600;  // how long each digit flashes
const GAP_MS  = 150;  // gap between digits

function generateSequence(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * 10));
}

export default function DigitChallenge() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('intro');
  const [level, setLevel] = useState(3);            // sequence length
  const [sequence, setSequence] = useState<number[]>([]);
  const [displayDigit, setDisplayDigit] = useState<number | null>(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [roundResult, setRoundResult] = useState<'correct' | 'wrong' | null>(null);
  const [maxLevel, setMaxLevel] = useState(3);
  const inputRef = useRef<HTMLInputElement>(null);

  useRecordOnFinish("/game/digit", phase === 'end', () => ({
    score: maxLevel,
    label: "digit span",
  }));

  const startRound = (len: number) => {
    const seq = generateSequence(len);
    setSequence(seq);
    setUserInput('');
    setRoundResult(null);
    setDisplayDigit(null);
    setPhase('showing');

    // Flash digits one by one
    let i = 0;
    const showNext = () => {
      if (i < seq.length) {
        setDisplayDigit(seq[i]);
        i++;
        setTimeout(() => {
          setDisplayDigit(null);
          setTimeout(() => showNext(), GAP_MS);
        }, SHOW_MS);
      } else {
        setPhase('recall');
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };
    setTimeout(() => showNext(), 500);
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setLevel(3);
    setMaxLevel(3);
    startRound(3);
  };

  const submitAnswer = () => {
    const userSeq = userInput.split('').map(Number);
    const correct = userSeq.length === sequence.length && userSeq.every((d, i) => d === sequence[i]);
    setRoundResult(correct ? 'correct' : 'wrong');
    setPhase('feedback');

    if (correct) {
      const pts = level * 20;
      setScore(prev => prev + pts);
      const newLevel = level + 1;
      setLevel(newLevel);
      setMaxLevel(prev => Math.max(prev, newLevel));
      setTimeout(() => startRound(newLevel), 1200);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => setPhase('end'), 1200);
      } else {
        // Retry same level
        setTimeout(() => startRound(level), 1500);
      }
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submitAnswer();
  };

  if (phase === 'intro') {
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl"
            style={{ background: 'rgba(217,119,6,0.1)', border: '1.5px solid rgba(217,119,6,0.2)' }}>
            🧠
          </div>
          <h1 className="text-3xl font-serif text-stone-800 mb-3">Digit Challenge</h1>
          <p className="text-stone-500 text-sm font-['Inter'] leading-relaxed mb-6 max-w-[270px] mx-auto">
            Digits flash one at a time. Memorise them, then type the full sequence in order.
          </p>
          <div className="rounded-2xl p-4 mb-8 text-left" style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)' }}>
            <div className="text-xs font-bold text-stone-400 font-['Inter'] uppercase tracking-wider mb-3">How it works</div>
            <div className="space-y-2 text-sm font-['Inter'] text-stone-600">
              <div>👁 Digits flash for 0.6s each</div>
              <div>⌨️ Type them back after the sequence</div>
              <div>📈 Correct → +1 digit next round</div>
              <div>❤️ 3 lives — wrong answer costs 1</div>
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
    return (
      <div style={{ background: '#fcfcf9', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-sm mx-auto px-4 pt-28 pb-12 text-center">
          <Trophy className="w-14 h-14 mx-auto text-amber-500 mb-4" />
          <h2 className="text-3xl font-serif text-stone-800 mb-2">Out of Lives!</h2>
          <p className="text-stone-500 text-sm font-['Inter'] mb-6">Digit span reached: <strong className="text-stone-700">{maxLevel}</strong></p>
          <p className="text-5xl font-bold text-stone-900 font-['Inter'] mt-2 mb-2">{score}</p>
          <p className="text-stone-400 text-xs font-['Inter'] mb-8">points earned</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-['Inter'] text-sm hover:bg-stone-50 transition-colors">
              ← Dashboard
            </button>
            <button onClick={startGame} className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-['Inter'] text-sm hover:bg-stone-700 transition-colors">
              Try Again
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
        <div className="flex items-center justify-between mt-4 mb-6">
          <button onClick={() => setPhase('intro')} className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm font-['Inter'] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quit
          </button>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className="text-base">{i < lives ? '❤️' : '🩶'}</span>
              ))}
            </div>
            <div className="text-stone-800 font-bold font-['Inter'] text-sm">{score} pts</div>
          </div>
        </div>

        {/* Level indicator */}
        <div className="text-center mb-8">
          <div className="text-xs text-stone-400 font-['Inter'] uppercase tracking-widest mb-1">Sequence Length</div>
          <div className="text-6xl font-bold font-['Inter'] text-stone-800">{level}</div>
          <div className="text-xs text-stone-400 font-['Inter'] mt-1">Best: {maxLevel}</div>
        </div>

        {/* Showing phase */}
        {phase === 'showing' && (
          <div className="flex flex-col items-center">
            <div className="text-xs text-stone-400 font-['Inter'] uppercase tracking-widest mb-6">Watch the digits</div>
            <div
              className="w-40 h-40 rounded-3xl flex items-center justify-center"
              style={{
                background: displayDigit !== null ? 'rgba(217,119,6,0.1)' : '#f5f5f3',
                border: `2px solid ${displayDigit !== null ? 'rgba(217,119,6,0.4)' : 'rgba(0,0,0,0.06)'}`,
                transition: 'background 0.1s, border-color 0.1s',
              }}
            >
              {displayDigit !== null ? (
                <span className="text-8xl font-bold font-['Inter'] text-amber-600">{displayDigit}</span>
              ) : (
                <span className="text-stone-200 text-4xl">···</span>
              )}
            </div>
            <div className="mt-4 flex gap-1.5">
              {sequence.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-colors duration-150"
                  style={{ background: i < (sequence.length - (phase === 'showing' ? 0 : 0)) ? 'rgba(217,119,6,0.4)' : '#e5e3df' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recall phase */}
        {(phase === 'recall' || phase === 'feedback') && (
          <div className="flex flex-col items-center gap-5">
            <div className="text-xs text-stone-400 font-['Inter'] uppercase tracking-widest">Type the sequence</div>

            <div className="flex gap-1.5 flex-wrap justify-center">
              {Array.from({ length: level }).map((_, i) => {
                const typed = userInput[i];
                const revealed = phase === 'feedback';
                const correct = revealed && Number(typed) === sequence[i];
                const wrong = revealed && typed !== undefined && Number(typed) !== sequence[i];
                return (
                  <div
                    key={i}
                    className="w-10 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-['Inter'] border-2 transition-all"
                    style={{
                      background: wrong ? 'rgba(239,68,68,0.1)' : correct ? 'rgba(5,150,105,0.1)' : '#fff',
                      borderColor: wrong ? '#ef4444' : correct ? '#059669' : typed ? '#d97706' : 'rgba(0,0,0,0.1)',
                      color: wrong ? '#ef4444' : correct ? '#059669' : '#1c1c1e',
                    }}
                  >
                    {typed ?? ''}
                    {revealed && !typed && <span className="text-stone-300">{sequence[i]}</span>}
                  </div>
                );
              })}
            </div>

            {phase === 'feedback' && (
              <div
                className="text-sm font-bold font-['Inter'] text-center"
                style={{ color: roundResult === 'correct' ? '#059669' : '#ef4444' }}
              >
                {roundResult === 'correct'
                  ? `✓ Perfect! +${level * 20} pts`
                  : `✗ Sequence was: ${sequence.join('')}`}
              </div>
            )}

            {phase === 'recall' && (
              <>
                <input
                  ref={inputRef}
                  type="tel"
                  maxLength={level}
                  value={userInput}
                  onChange={e => setUserInput(e.target.value.replace(/\D/g, '').slice(0, level))}
                  onKeyDown={handleKey}
                  placeholder={`${level} digits`}
                  className="w-full max-w-[200px] text-center text-xl font-bold font-['Inter'] py-3 px-4 rounded-xl border-2 border-stone-200 focus:border-amber-400 focus:outline-none bg-white transition-colors"
                  autoComplete="off"
                />
                <button
                  onClick={submitAnswer}
                  disabled={userInput.length !== level}
                  className="px-8 py-3 rounded-xl font-['Inter'] font-semibold text-sm transition-all active:scale-95"
                  style={{
                    background: userInput.length === level ? '#1c1c1e' : '#f0ede8',
                    color: userInput.length === level ? '#fff' : '#c1beb8',
                    cursor: userInput.length === level ? 'pointer' : 'not-allowed',
                  }}
                >
                  Submit
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
