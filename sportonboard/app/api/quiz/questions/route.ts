import { NextResponse } from 'next/server';
import { quizQuestions } from '@/lib/quiz';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: quizQuestions,
    });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch quiz questions',
        },
      },
      { status: 500 }
    );
  }
}
