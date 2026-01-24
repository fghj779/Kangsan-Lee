'use client';

import { useEffect, useRef, useState } from 'react';

type Pitch = { x: number; y: number; isStrike: boolean };

export default function BaseballStrikeZoneViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [strikes, setStrikes] = useState(0);
  const [balls, setBalls] = useState(0);

  const canvasWidth = 400;
  const canvasHeight = 500;

  // Strike zone dimensions (approximate)
  const strikeZone = {
    x: 150,
    y: 150,
    width: 100,
    height: 200,
  };

  const isInStrikeZone = (x: number, y: number) => {
    return (
      x >= strikeZone.x &&
      x <= strikeZone.x + strikeZone.width &&
      y >= strikeZone.y &&
      y <= strikeZone.y + strikeZone.height
    );
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const isStrike = isInStrikeZone(x, y);
    setPitches([...pitches, { x, y, isStrike }]);

    if (isStrike) {
      setStrikes((s) => Math.min(s + 1, 3));
    } else {
      setBalls((b) => Math.min(b + 1, 4));
    }
  };

  const reset = () => {
    setPitches([]);
    setStrikes(0);
    setBalls(0);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw home plate
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(200, 420);
    ctx.lineTo(170, 390);
    ctx.lineTo(170, 370);
    ctx.lineTo(230, 370);
    ctx.lineTo(230, 390);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw strike zone
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(strikeZone.x, strikeZone.y, strikeZone.width, strikeZone.height);

    // Draw strike zone fill
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fillRect(strikeZone.x, strikeZone.y, strikeZone.width, strikeZone.height);

    // Draw strike zone grid
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    for (let i = 1; i < 3; i++) {
      const y = strikeZone.y + (strikeZone.height / 3) * i;
      ctx.beginPath();
      ctx.moveTo(strikeZone.x, y);
      ctx.lineTo(strikeZone.x + strikeZone.width, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw pitches
    pitches.forEach((pitch) => {
      ctx.beginPath();
      ctx.arc(pitch.x, pitch.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = pitch.isStrike ? '#10b981' : '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw labels
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STRIKE ZONE', 200, 130);
  }, [pitches]);

  const gameOver = strikes >= 3 || balls >= 4;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-4">Baseball Strike Zone</h3>
        <p className="text-gray-600 mb-4">
          Click on the canvas to throw pitches. Pitches inside the blue zone are strikes, outside are balls.
        </p>

        <div className="flex gap-6 mb-4">
          <div className="bg-green-100 px-4 py-2 rounded-lg">
            <span className="font-bold">Strikes: </span>
            <span className="text-2xl font-bold text-green-600">{strikes}</span>
          </div>
          <div className="bg-red-100 px-4 py-2 rounded-lg">
            <span className="font-bold">Balls: </span>
            <span className="text-2xl font-bold text-red-600">{balls}</span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="border-2 border-gray-300 rounded cursor-crosshair bg-gray-50 mx-auto"
          onClick={handleCanvasClick}
          style={{ display: 'block' }}
        />

        {gameOver && (
          <div className={`mt-4 p-4 rounded-lg ${strikes >= 3 ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="text-lg font-bold text-center">
              {strikes >= 3 ? '⚾ STRIKEOUT!' : '🚶 WALK!'}
            </p>
          </div>
        )}

        <button
          onClick={reset}
          className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Reset At-Bat
        </button>
      </div>
    </div>
  );
}
