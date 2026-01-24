import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { playerId: string } }) {
  try {
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
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Player not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...player,
        team: player.team
          ? {
              id: player.team.id,
              name: player.team.name,
              logoUrl: player.team.logoUrl,
              league: {
                id: player.team.league.id,
                name: player.team.league.name,
                sportName: player.team.league.sport.name,
              },
            }
          : null,
        similarPlayers: [], // TODO: Implement similarity
      },
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch player',
        },
      },
      { status: 500 }
    );
  }
}
