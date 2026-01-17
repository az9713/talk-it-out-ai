import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getExercises,
  getRecommendedExercise,
  getUserCompletions,
  getCompletionStats,
  seedExercises,
} from '@/services/calming';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Seed exercises if needed
    await seedExercises();

    if (type === 'recommended') {
      const exercise = await getRecommendedExercise(session.user.id);
      return NextResponse.json(exercise);
    }

    if (type === 'history') {
      const days = parseInt(searchParams.get('days') || '30');
      const completions = await getUserCompletions(session.user.id, days);
      return NextResponse.json(completions);
    }

    if (type === 'stats') {
      const days = parseInt(searchParams.get('days') || '30');
      const stats = await getCompletionStats(session.user.id, days);
      return NextResponse.json(stats);
    }

    // Default: list all exercises
    const exerciseType = searchParams.get('exerciseType') || undefined;
    const exercises = await getExercises(exerciseType);
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching calming exercises:', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}
