import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { teamId: string } }) {
  try {
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
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Team not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...team,
        league: {
          id: team.league.id,
          name: team.league.name,
          sport: {
            id: team.league.sport.id,
            name: team.league.sport.name,
            displayName: team.league.sport.displayName,
          },
        },
        players: team.players.map((p) => ({
          id: p.id,
          displayName: p.displayName,
          position: p.position,
          jerseyNumber: p.jerseyNumber,
          imageUrl: p.imageUrl,
          playstyleTags: p.playstyleTags,
        })),
        similarTeams: [], // TODO: Implement similarity lookup
      },
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch team',
        },
      },
      { status: 500 }
    );
  }
}
