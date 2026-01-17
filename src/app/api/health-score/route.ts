import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getCurrentHealthScore,
  getHealthScoreHistory,
  calculateHealthScore,
  getHealthInsights,
} from '@/services/health-score';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'history') {
      const months = parseInt(searchParams.get('months') || '6');
      const history = await getHealthScoreHistory(session.user.id, months);
      return NextResponse.json(history);
    }

    // Get current score
    let score = await getCurrentHealthScore(session.user.id);

    // If no score exists or it's older than a week, calculate new one
    if (!score || isScoreStale(score.calculatedAt)) {
      score = await calculateHealthScore(session.user.id);
    }

    const insights = score ? getHealthInsights(score) : [];

    return NextResponse.json({
      score,
      insights,
    });
  } catch (error) {
    console.error('Error fetching health score:', error);
    return NextResponse.json({ error: 'Failed to fetch health score' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Force recalculation
    const score = await calculateHealthScore(session.user.id);
    const insights = getHealthInsights(score);

    return NextResponse.json({
      score,
      insights,
      message: 'Health score recalculated',
    });
  } catch (error) {
    console.error('Error calculating health score:', error);
    return NextResponse.json({ error: 'Failed to calculate health score' }, { status: 500 });
  }
}

// Check if score is older than 7 days
function isScoreStale(calculatedAt: Date): boolean {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return calculatedAt < weekAgo;
}
