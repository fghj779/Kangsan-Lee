import { NextResponse } from 'next/server';
import { getTeamRecommendations } from '@/lib/recommender';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = request.headers.get('x-session-id');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Session ID required',
          },
        },
        { status: 401 }
      );
    }

    // Find user by session ID
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { sessionId },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_SESSION',
            message: 'Invalid session',
          },
        },
        { status: 401 }
      );
    }

    const recommendations = await getTeamRecommendations(user.id, limit);

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to get recommendations',
        },
      },
      { status: 500 }
    );
  }
}
