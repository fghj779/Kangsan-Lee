import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { quizToPreferenceVector } from '@/lib/quiz';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, responses } = body;

    if (!userId || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
          },
        },
        { status: 400 }
      );
    }

    // Save quiz responses
    await prisma.quizResponse.createMany({
      data: responses.map((r: any) => ({
        userId,
        questionId: r.questionId,
        answers: r.answers,
      })),
    });

    // Generate preference vector
    const preferenceVector = quizToPreferenceVector(responses);

    // Extract preferred sports and region
    const sportsResponse = responses.find((r: any) => r.questionId === 'sports_interest');
    const regionResponse = responses.find((r: any) => r.questionId === 'region_timezone');
    const paceResponse = responses.find((r: any) => r.questionId === 'preferred_pace');
    const personalityResponse = responses.find((r: any) => r.questionId === 'team_personality');
    const styleResponse = responses.find((r: any) => r.questionId === 'playstyle_preference');
    const excitementResponse = responses.find((r: any) => r.questionId === 'excitement_factors');

    // Upsert user preferences
    await prisma.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        preferredSports: sportsResponse?.answers || [],
        timezone: regionResponse?.answers,
        regionPreference: regionResponse?.answers ? [regionResponse.answers] : [],
        preferredPace: paceResponse?.answers,
        teamPersonality: personalityResponse?.answers,
        preferredStyle: styleResponse?.answers,
        excitementFactors: excitementResponse?.answers || [],
        preferenceVector: preferenceVector as any,
      },
      update: {
        preferredSports: sportsResponse?.answers || [],
        timezone: regionResponse?.answers,
        regionPreference: regionResponse?.answers ? [regionResponse.answers] : [],
        preferredPace: paceResponse?.answers,
        teamPersonality: personalityResponse?.answers,
        preferredStyle: styleResponse?.answers,
        excitementFactors: excitementResponse?.answers || [],
        preferenceVector: preferenceVector as any,
      },
    });

    // Update user onboarding status
    await prisma.user.update({
      where: { id: userId },
      data: {
        hasCompletedQuiz: true,
        onboardingStep: 2,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        quizCompleted: true,
        preferencesUpdated: true,
        recommendationsGenerated: true,
      },
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to submit quiz',
        },
      },
      { status: 500 }
    );
  }
}
