'use client';

import { useState } from 'react';

type Position = { x: number; y: number };

export default function SoccerOffsideViz() {
  const [ball, setBall] = useState<Position>({ x: 300, y: 200 });
  const [attacker, setAttacker] = useState<Position>({ x: 450, y: 200 });
  const [defender1, setDefender1] = useState<Position>({ x: 500, y: 150 });
  const [defender2, setDefender2] = useState<Position>({ x: 500, y: 250 });
  const [dragging, setDragging] = useState<string | null>(null);

  const fieldWidth = 600;
  const fieldHeight = 400;
  const goalLine = 550;

  // Check if attacker is offside
  const isOffside = () => {
    if (attacker.x < ball.x) return false; // Behind the ball
    const secondLastDefender = Math.min(defender1.x, defender2.x);
    return attacker.x > secondLastDefender && attacker.x > goalLine - 50;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = Math.max(50, Math.min(fieldWidth - 50, e.clientX - rect.left));
    const y = Math.max(50, Math.min(fieldHeight - 50, e.clientY - rect.top));

    if (dragging === 'ball') setBall({ x, y });
    if (dragging === 'attacker') setAttacker({ x, y });
    if (dragging === 'defender1') setDefender1({ x, y });
    if (dragging === 'defender2') setDefender2({ x, y });
  };

  const offside = isOffside();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-4">Soccer Offside Rule</h3>
        <p className="text-gray-600 mb-4">
          Drag the players and ball to see when offside occurs. An attacker is offside if they are closer to the goal
          than the ball and the second-last defender when the ball is played.
        </p>

        <svg
          width={fieldWidth}
          height={fieldHeight}
          className="border-2 border-green-800 bg-green-100 rounded cursor-move"
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDragging(null)}
          onMouseLeave={() => setDragging(null)}
        >
          {/* Field markings */}
          <rect x="0" y="0" width={fieldWidth} height={fieldHeight} fill="#2d5016" opacity="0.3" />

          {/* Halfway line */}
          <line x1="300" y1="0" x2="300" y2={fieldHeight} stroke="white" strokeWidth="2" />

          {/* Goal line */}
          <line x1={goalLine} y1="0" x2={goalLine} y2={fieldHeight} stroke="white" strokeWidth="3" />

          {/* Goal */}
          <rect x={goalLine} y="150" width="40" height="100" fill="none" stroke="white" strokeWidth="3" />

          {/* Offside line indicator */}
          {offside && (
            <line
              x1={Math.min(defender1.x, defender2.x)}
              y1="0"
              x2={Math.min(defender1.x, defender2.x)}
              y2={fieldHeight}
              stroke="red"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}

          {/* Ball */}
          <circle
            cx={ball.x}
            cy={ball.y}
            r="8"
            fill="white"
            stroke="black"
            strokeWidth="2"
            cursor="grab"
            onMouseDown={() => setDragging('ball')}
          />
          <text x={ball.x} y={ball.y - 15} fontSize="12" fill="black" textAnchor="middle">
            ⚽ Ball
          </text>

          {/* Attacker */}
          <circle
            cx={attacker.x}
            cy={attacker.y}
            r="15"
            fill={offside ? '#ef4444' : '#3b82f6'}
            stroke="white"
            strokeWidth="2"
            cursor="grab"
            onMouseDown={() => setDragging('attacker')}
          />
          <text x={attacker.x} y={attacker.y + 5} fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">
            A
          </text>
          <text x={attacker.x} y={attacker.y - 25} fontSize="12" fill="black" textAnchor="middle">
            Attacker
          </text>

          {/* Defenders */}
          <circle
            cx={defender1.x}
            cy={defender1.y}
            r="15"
            fill="#10b981"
            stroke="white"
            strokeWidth="2"
            cursor="grab"
            onMouseDown={() => setDragging('defender1')}
          />
          <text x={defender1.x} y={defender1.y + 5} fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">
            D1
          </text>

          <circle
            cx={defender2.x}
            cy={defender2.y}
            r="15"
            fill="#10b981"
            stroke="white"
            strokeWidth="2"
            cursor="grab"
            onMouseDown={() => setDragging('defender2')}
          />
          <text x={defender2.x} y={defender2.y + 5} fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">
            D2
          </text>
        </svg>

        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: offside ? '#fee2e2' : '#dcfce7' }}>
          <p className="text-lg font-bold" style={{ color: offside ? '#dc2626' : '#059669' }}>
            {offside ? '❌ OFFSIDE!' : '✅ ONSIDE'}
          </p>
          <p className="text-sm mt-2 text-gray-700">
            {offside
              ? 'The attacker is ahead of both the ball and the second-last defender.'
              : 'The attacker is either behind the ball or behind the second-last defender.'}
          </p>
        </div>
      </div>
    </div>
  );
}
