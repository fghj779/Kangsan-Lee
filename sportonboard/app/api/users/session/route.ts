import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, timezone, region } = body;

    if (sessionId) {
      // Find existing user
      const user = await prisma.user.findUnique({
        where: { sessionId },
        include: { preferences: true },
      });

      if (user) {
        return NextResponse.json({
          success: true,
          data: {
            userId: user.id,
            sessionId: user.sessionId,
            isAnonymous: user.isAnonymous,
            hasCompletedQuiz: user.hasCompletedQuiz,
            onboardingStep: user.onboardingStep,
          },
        });
      }
    }

    // Create new user
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const user = await prisma.user.create({
      data: {
        sessionId: newSessionId,
        isAnonymous: true,
        timezone,
        region,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        sessionId: user.sessionId!,
        isAnonymous: user.isAnonymous,
        hasCompletedQuiz: user.hasCompletedQuiz,
        onboardingStep: user.onboardingStep,
      },
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to create session',
        },
      },
      { status: 500 }
    );
  }
}
