'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type TeamRecommendation = {
  team: {
    id: string;
    name: string;
    shortName: string;
    logoUrl: string | null;
    league: { name: string; sportName: string };
    playstyle: string[];
  };
  score: number;
  reasons: Array<{ type: string; message: string; weight: number }>;
  rank: number;
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<TeamRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');

    if (!sessionId) {
      window.location.href = '/onboarding';
      return;
    }

    fetch('/api/recommendations/teams', {
      headers: {
        'X-Session-ID': sessionId,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRecommendations(data.data);
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Generating your recommendations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">Your Perfect Teams Await!</h1>
          <p className="text-xl text-gray-600">
            Based on your preferences, here are teams we think you'll love.
          </p>
        </div>

        <div className="space-y-6">
          {recommendations.map((rec) => (
            <div key={rec.team.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-start gap-6">
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {rec.rank}
                  </div>
                </div>

                {/* Team Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {rec.team.logoUrl && (
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        🏆
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold">{rec.team.name}</h3>
                      <p className="text-gray-600">
                        {rec.team.league.sportName} • {rec.team.league.name}
                      </p>
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${rec.score}%` }}
                        />
                      </div>
                      <span className="font-bold text-green-600">{rec.score}% Match</span>
                    </div>
                  </div>

                  {/* Reasons */}
                  <div className="space-y-2 mb-4">
                    {rec.reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{reason.message}</span>
                      </div>
                    ))}
                  </div>

                  {/* Playstyle Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rec.team.playstyle.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action */}
                  <Link
                    href={`/teams/${rec.team.id}`}
                    className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
                  >
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* More Teams */}
        <div className="text-center mt-12">
          <Link
            href="/teams"
            className="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Explore All Teams
          </Link>
        </div>
      </div>
    </div>
  );
}
