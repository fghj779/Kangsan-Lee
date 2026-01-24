import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, entityType, entityId, type, dwellTime, metadata } = body;

    if (!userId || !entityType || !entityId || !type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
          },
        },
        { status: 400 }
      );
    }

    // Determine weight based on interaction type
    const weights: Record<string, number> = {
      view: dwellTime && dwellTime > 30 ? 1.5 : 1.0,
      like: 2.0,
      follow: 3.0,
      share: 2.5,
      click: 0.5,
    };

    const weight = weights[type] || 1.0;

    // Create interaction with appropriate foreign key
    const interactionData: any = {
      userId,
      entityType,
      entityId,
      type,
      dwellTime,
      metadata: metadata || {},
      weight,
    };

    // Set the appropriate FK based on entityType
    if (entityType === 'sport') interactionData.sportId = entityId;
    if (entityType === 'league') interactionData.leagueId = entityId;
    if (entityType === 'team') interactionData.teamId = entityId;
    if (entityType === 'player') interactionData.playerId = entityId;
    if (entityType === 'rule') interactionData.ruleId = entityId;

    const interaction = await prisma.interaction.create({
      data: interactionData,
    });

    // Update user last active
    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: {
        interactionId: interaction.id,
        recorded: true,
      },
    });
  } catch (error) {
    console.error('Error creating interaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to record interaction',
        },
      },
      { status: 500 }
    );
  }
}
