'use client';

import { useState, useEffect } from 'react';

export default function BasketballShotClockViz() {
  const [shotClock, setShotClock] = useState(24);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ user: 0, opponent: 0 });
  const [message, setMessage] = useState('Click anywhere on the court to shoot!');

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setShotClock((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setMessage('⏰ SHOT CLOCK VIOLATION! Ball turned over.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleShot = (isThreePointer: boolean) => {
    if (shotClock === 0) return;

    const made = Math.random() > 0.4; // 60% chance
    const points = isThreePointer ? 3 : 2;

    if (made) {
      setScore((prev) => ({ ...prev, user: prev.user + points }));
      setMessage(`🏀 ${points}-POINTER MADE! +${points} points`);
    } else {
      setMessage('❌ MISS! Possession changes.');
    }

    setShotClock(24);
    setIsRunning(false);
  };

  const startPossession = () => {
    setShotClock(24);
    setIsRunning(true);
    setMessage('Possession started! Take your shot within 24 seconds.');
  };

  const courtWidth = 500;
  const courtHeight = 400;
  const threePointLine = 150;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-4">Basketball: Shot Clock & 3-Point Line</h3>
        <p className="text-gray-600 mb-4">
          Start a possession and click inside (2 pts) or outside (3 pts) the three-point line to shoot. You have 24
          seconds!
        </p>

        {/* Scoreboard */}
        <div className="flex justify-between mb-4">
          <div className="bg-blue-100 px-6 py-3 rounded-lg">
            <div className="text-sm text-gray-600">Your Score</div>
            <div className="text-3xl font-bold text-blue-600">{score.user}</div>
          </div>

          <div
            className={`px-8 py-3 rounded-lg ${shotClock <= 5 && isRunning ? 'bg-red-100 animate-pulse' : 'bg-gray-100'}`}
          >
            <div className="text-sm text-gray-600">Shot Clock</div>
            <div className={`text-4xl font-bold ${shotClock <= 5 ? 'text-red-600' : 'text-gray-800'}`}>
              {shotClock}
            </div>
          </div>

          <div className="bg-gray-100 px-6 py-3 rounded-lg">
            <div className="text-sm text-gray-600">Opponent</div>
            <div className="text-3xl font-bold text-gray-600">{score.opponent}</div>
          </div>
        </div>

        {/* Court */}
        <svg
          width={courtWidth}
          height={courtHeight}
          className="border-2 border-orange-800 bg-orange-50 rounded mx-auto"
        >
          {/* Court floor */}
          <rect x="0" y="0" width={courtWidth} height={courtHeight} fill="#d97706" opacity="0.2" />

          {/* Three-point line (simplified arc) */}
          <path
            d={`M 50,0 L 50,${courtHeight} M ${threePointLine},0 Q ${threePointLine + 50},${courtHeight / 2} ${threePointLine},${courtHeight} Z`}
            fill="none"
            stroke="#dc2626"
            strokeWidth="3"
            strokeDasharray="8,4"
          />

          {/* Basket */}
          <circle cx="50" cy={courtHeight / 2} r="10" fill="#f59e0b" stroke="#000" strokeWidth="2" />
          <rect x="30" y={courtHeight / 2 - 30} width="40" height="60" fill="none" stroke="#000" strokeWidth="2" />

          {/* Labels */}
          <text x="250" y="50" fontSize="14" fontWeight="bold" fill="#dc2626" textAnchor="middle">
            ← 3-Point Line
          </text>
          <text x="80" y={courtHeight / 2 - 50} fontSize="12" fill="#000" textAnchor="middle">
            2-PT AREA
          </text>
          <text x="300" y={courtHeight / 2} fontSize="12" fill="#dc2626" textAnchor="middle">
            3-PT AREA
          </text>

          {/* Clickable areas */}
          <rect
            x="50"
            y="0"
            width={threePointLine - 50}
            height={courtHeight}
            fill="rgba(59, 130, 246, 0.1)"
            cursor={isRunning ? 'pointer' : 'not-allowed'}
            onClick={() => isRunning && handleShot(false)}
          />
          <rect
            x={threePointLine}
            y="0"
            width={courtWidth - threePointLine}
            height={courtHeight}
            fill="rgba(220, 38, 38, 0.1)"
            cursor={isRunning ? 'pointer' : 'not-allowed'}
            onClick={() => isRunning && handleShot(true)}
          />
        </svg>

        {/* Message */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-center font-semibold">{message}</p>
        </div>

        {/* Controls */}
        <div className="mt-4 flex gap-4">
          <button
            onClick={startPossession}
            disabled={isRunning}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
              isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isRunning ? 'Possession Active...' : 'Start Possession'}
          </button>
          <button
            onClick={() => {
              setScore({ user: 0, opponent: 0 });
              setShotClock(24);
              setIsRunning(false);
              setMessage('Click anywhere on the court to shoot!');
            }}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
}
