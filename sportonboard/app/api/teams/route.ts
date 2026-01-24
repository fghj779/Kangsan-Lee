import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const sportId = searchParams.get('sportId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const where: any = {};

    if (leagueId) {
      where.leagueId = leagueId;
    }

    if (sportId) {
      where.league = {
        sportId,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { popularityScore: 'desc' },
        include: {
          league: {
            include: {
              sport: true,
            },
          },
          _count: {
            select: { players: true },
          },
        },
      }),
      prisma.team.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: teams.map((team: any) => ({
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        city: team.city,
        country: team.country,
        logoUrl: team.logoUrl,
        primaryColor: team.primaryColor,
        league: {
          id: team.league.id,
          name: team.league.name,
          sportName: team.league.sport.name,
        },
        playstyle: team.playstyle,
        successLevel: team.successLevel,
        fanbaseSize: team.fanbaseSize,
        popularityScore: team.popularityScore,
        playerCount: team._count.players,
      })),
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch teams',
        },
      },
      { status: 500 }
    );
  }
}
