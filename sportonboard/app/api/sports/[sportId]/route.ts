import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { sportId: string } }) {
  try {
    const sport = await prisma.sport.findUnique({
      where: { id: params.sportId },
      include: {
        leagues: {
          orderBy: { tier: 'asc' },
          take: 10,
        },
        rules: {
          orderBy: { difficulty: 'asc' },
          take: 5,
        },
      },
    });

    if (!sport) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Sport not found',
          },
        },
        { status: 404 }
      );
    }

    // Get top teams
    const topTeams = await prisma.team.findMany({
      where: {
        league: {
          sportId: params.sportId,
        },
      },
      orderBy: { popularityScore: 'desc' },
      take: 6,
      include: {
        league: true,
      },
    });

    // Get top players
    const topPlayers = await prisma.player.findMany({
      where: {
        team: {
          league: {
            sportId: params.sportId,
          },
        },
      },
      orderBy: { popularityScore: 'desc' },
      take: 6,
      include: {
        team: {
          include: {
            league: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...sport,
        topTeams: topTeams.map((t) => ({
          id: t.id,
          name: t.name,
          shortName: t.shortName,
          logoUrl: t.logoUrl,
          leagueName: t.league.name,
          popularityScore: t.popularityScore,
        })),
        topPlayers: topPlayers.map((p) => ({
          id: p.id,
          displayName: p.displayName,
          position: p.position,
          imageUrl: p.imageUrl,
          teamName: p.team?.name,
          popularityScore: p.popularityScore,
        })),
        rules: sport.rules.map((r) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          difficulty: r.difficulty,
          visualizationType: r.visualizationType,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching sport:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch sport',
        },
      },
      { status: 500 }
    );
  }
}
