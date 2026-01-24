import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('include_stats') === 'true';

    const sports = await prisma.sport.findMany({
      orderBy: { popularity: 'desc' },
      include: includeStats
        ? {
            _count: {
              select: { leagues: true },
            },
          }
        : undefined,
    });

    const data = includeStats
      ? sports.map((sport: any) => ({
          ...sport,
          leagueCount: sport._count?.leagues || 0,
        }))
      : sports;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching sports:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch sports',
        },
      },
      { status: 500 }
    );
  }
}
