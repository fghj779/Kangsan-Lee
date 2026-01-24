import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function PlayerPage({ params }: { params: { playerId: string } }) {
  const player = await prisma.player.findUnique({
    where: { id: params.playerId },
    include: {
      team: {
        include: {
          league: {
            include: {
              sport: true,
            },
          },
        },
      },
    },
  });

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Player not found</div>
      </div>
    );
  }

  const achievements = (player.achievements as any[]) || [];
  const stats = (player.stats as Record<string, number>) || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-8 text-white">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
              <span className="text-6xl">⭐</span>
            </div>
            <div>
              <h1 className="text-5xl font-display font-bold mb-2">{player.displayName}</h1>
              <p className="text-2xl opacity-90">
                {player.position}
                {player.jerseyNumber && ` • #${player.jerseyNumber}`}
              </p>
              {player.team && (
                <Link href={`/teams/${player.team.id}`} className="text-xl opacity-75 hover:opacity-100">
                  {player.team.name}
                </Link>
              )}
              <p className="mt-2 opacity-75">{player.nationality}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Playstyle Tags */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold mb-4">Playstyle</h2>
          <div className="flex flex-wrap gap-3">
            {player.playstyleTags.map((tag) => (
              <span key={tag} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Narrative */}
        {player.narrative && (
          <div className="bg-white rounded-lg shadow p-8 mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">Why Fans Love {player.firstName}</h2>
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{player.narrative}</p>
          </div>
        )}

        {/* Career Highlights */}
        {achievements.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8 mb-12">
            <h2 className="text-3xl font-display font-bold mb-6">Career Highlights</h2>
            <div className="space-y-4">
              {achievements.map((achievement: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{achievement.title}</div>
                    <div className="text-gray-600">{achievement.year}</div>
                    <div className="text-gray-700">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {Object.keys(stats).length > 0 && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-3xl font-display font-bold mb-6">Career Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-3xl font-bold text-primary">{value}</div>
                  <div className="text-sm text-gray-600 uppercase mt-1">
                    {key.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
