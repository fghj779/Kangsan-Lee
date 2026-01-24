import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function TeamPage({ params }: { params: { teamId: string } }) {
  const team = await prisma.team.findUnique({
    where: { id: params.teamId },
    include: {
      league: {
        include: {
          sport: true,
        },
      },
      players: {
        orderBy: { popularityScore: 'desc' },
        take: 10,
      },
    },
  });

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Team not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="py-16 px-4"
        style={{
          backgroundColor: team.primaryColor || '#3b82f6',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6 text-white">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl">🏆</span>
            </div>
            <div>
              <h1 className="text-5xl font-display font-bold mb-2">{team.name}</h1>
              <p className="text-xl opacity-90">
                {team.league.sport.displayName} • {team.league.name}
              </p>
              <p className="opacity-75">
                {team.city}, {team.country}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Success Level</div>
            <div className="text-2xl font-bold capitalize">{team.successLevel}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Win Rate</div>
            <div className="text-2xl font-bold">{((team.winRate || 0.5) * 100).toFixed(0)}%</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Fanbase Size</div>
            <div className="text-2xl font-bold capitalize">{team.fanbaseSize}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Popularity</div>
            <div className="text-2xl font-bold">{team.popularityScore}/100</div>
          </div>
        </div>

        {/* Story */}
        {team.story && (
          <div className="bg-white rounded-lg shadow p-8 mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">The Story</h2>
            <p className="text-gray-700 text-lg leading-relaxed">{team.story}</p>
          </div>
        )}

        {/* Playstyle */}
        <div className="bg-white rounded-lg shadow p-8 mb-12">
          <h2 className="text-2xl font-display font-bold mb-4">Playstyle</h2>
          <div className="flex flex-wrap gap-3">
            {team.playstyle.map((tag) => (
              <span key={tag} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Players */}
        {team.players.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8 mb-12">
            <h2 className="text-2xl font-display font-bold mb-6">Key Players</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.players.map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="border rounded-lg p-4 hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{player.displayName}</h3>
                      <p className="text-gray-600">{player.position}</p>
                      {player.jerseyNumber && (
                        <p className="text-sm text-gray-500">#{player.jerseyNumber}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Culture */}
        {team.culture && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-display font-bold mb-4">Fan Culture</h2>
            <p className="text-gray-700 text-lg leading-relaxed">{team.culture}</p>
          </div>
        )}
      </div>
    </div>
  );
}
