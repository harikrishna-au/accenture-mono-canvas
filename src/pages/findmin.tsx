import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Balloon {
  id: number;
  equation: string;
  answer: number;
  color: string;
  top: string;
  left: string;
}

const BalloonMathGame: React.FC = () => {
  const navigate = useNavigate();
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const TOTAL_ROUNDS = 25;
  const TIME_PER_ROUND = 10;

  const operators = ['+', '-', '*', '/', '%'];
  
  const generateEquation = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let equation = `${num1} ${operator} ${num2}`;
    let answer: number;
    
    switch(operator) {
      case '+': answer = num1 + num2; break;
      case '-': answer = num1 - num2; break;
      case '*': answer = num1 * num2; break;
      case '/': answer = Math.floor(num1 / num2); break;
      case '%': answer = num1 % num2; break;
      default: answer = 0;
    }
    
    return { equation, answer };
  };

  const getBalloonPosition = (row: number, col: number) => {
    // Equal distance from corners: 30% from edges
    const positions = {
      1: { 1: { top: '30%', left: '30%' }, 2: { top: '30%', left: '70%' } },
      2: { 1: { top: '70%', left: '30%' }, 2: { top: '70%', left: '70%' } }
    };
    
    return positions[row as 1 | 2][col as 1 | 2];
  };

  const generateBalloons = () => {
    const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400'];
    const newBalloons: Balloon[] = [];
    
    const positions = [
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 2, col: 1 },
      { row: 2, col: 2 }
    ];
    
    const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);
    
    for (let idx = 0; idx < 4; idx++) {
      const { equation, answer } = generateEquation();
      const { row, col } = shuffledPositions[idx];
      const position = getBalloonPosition(row, col);
      
      newBalloons.push({
        id: idx,
        equation,
        answer,
        color: colors[idx],
        top: position.top,
        left: position.left
      });
    }
    
    setBalloons(newBalloons);
  };

  const startGame = () => {
    setStarted(true);
    setRound(1);
    setScore(0);
    setTimeLeft(TIME_PER_ROUND);
    setGameOver(false);
    generateBalloons();
  };

  useEffect(() => {
    if (started && !gameOver && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (started && !gameOver && timeLeft === 0) {
      nextRound(false);
    }
  }, [timeLeft, started, gameOver]);

  const handleBalloonClick = (clickedBalloon: Balloon) => {
    const smallestAnswer = Math.min(...balloons.map(b => b.answer));
    
    if (clickedBalloon.answer === smallestAnswer) {
      setScore(score + 1);
      nextRound(true);
    } else {
      nextRound(false);
    }
  };

  const nextRound = (answered: boolean) => {
    if (round >= TOTAL_ROUNDS) {
      setGameOver(true);
    } else {
      setRound(round + 1);
      setTimeLeft(TIME_PER_ROUND);
      generateBalloons();
    }
  };

  if (!started) {
    return (
      <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-300 to-sky-100">
        <button
          onClick={() => navigate('/dashboard')}
          className="absolute top-8 right-8 w-12 h-12 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center text-2xl font-bold transition transform hover:scale-110 z-50"
        >
          ×
        </button>
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl">
          <h1 className="text-5xl font-bold text-blue-600 mb-6">🎈 Balloon Math Challenge</h1>
          <p className="text-xl text-gray-700 mb-8">Click the balloon with the smallest answer!</p>
          <div className="text-lg text-gray-600 mb-8 space-y-2">
            <p>• 25 rounds total</p>
            <p>• 10 seconds per round</p>
            <p>• Find the smallest answer each time</p>
          </div>
          <button 
            onClick={startGame}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl px-12 py-4 rounded-full transition transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-300 to-purple-100">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl">
          <h1 className="text-5xl font-bold text-purple-600 mb-6">🎉 Game Over!</h1>
          <div className="mb-8">
            <div className="text-2xl text-gray-600 mb-2">Total Rounds</div>
            <div className="text-4xl font-bold text-gray-800 mb-6">{TOTAL_ROUNDS}</div>
            <div className="text-2xl text-gray-600 mb-2">Your Score</div>
            <div className="text-6xl font-bold text-purple-600 mb-4">{score}</div>
          </div>
          <p className="text-xl text-gray-700 mb-8">
            {score >= 20 ? '🌟 Amazing!' : score >= 15 ? '👏 Great job!' : score >= 10 ? '👍 Good effort!' : '💪 Keep practicing!'}
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-black hover:bg-gray-800 text-white font-bold text-2xl px-12 py-4 rounded-full transition transform hover:scale-105"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-sky-300 to-sky-100 overflow-hidden">
      <div className={`absolute top-8 right-8 text-4xl font-bold ${timeLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-white'} bg-black bg-opacity-30 px-6 py-3 rounded-full z-50`}>
        ⏱️ {timeLeft}s
      </div>

      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-2xl font-semibold text-white bg-black bg-opacity-30 px-8 py-3 rounded-full z-40">
        Click the SMALLEST answer!
      </div>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white bg-opacity-20 rounded-3xl shadow-2xl border-2 border-white border-opacity-30">
        {balloons.map((balloon) => (
          <div
            key={balloon.id}
            onClick={() => handleBalloonClick(balloon)}
            className="balloon"
            style={{
              top: balloon.top,
              left: balloon.left
            }}
          >
            <div className={`${balloon.color} balloon-body`}>
              <div className="text-center">
                <div className="text-2xl font-bold text-white drop-shadow-lg">
                  {balloon.equation}
                </div>
              </div>
              <div className="balloon-string"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BalloonMathGame;
