import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createGoal,
  getUserGoals,
  getActiveGoals,
  getGoalStats,
  getUncelebratedAchievements,
  type GoalCategory,
} from '@/services/goals';
import { z } from 'zod';

const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum([
    'communication',
    'conflict_resolution',
    'emotional_connection',
    'trust_building',
    'quality_time',
    'boundaries',
    'personal_growth',
    'other',
  ]),
  targetDate: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  sessionsTarget: z.number().min(1).max(100).optional(),
});

// GET /api/goals - Get user's goals
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');

    if (filter === 'active') {
      const goals = await getActiveGoals(session.user.id);
      return NextResponse.json(goals);
    }

    if (filter === 'stats') {
      const stats = await getGoalStats(session.user.id);
      return NextResponse.json(stats);
    }

    if (filter === 'celebrations') {
      const achievements = await getUncelebratedAchievements(session.user.id);
      return NextResponse.json(achievements);
    }

    const goals = await getUserGoals(session.user.id);
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/goals - Create a new goal
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createGoalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { title, description, category, targetDate, sessionsTarget } = validation.data;

    const goal = await createGoal({
      userId: session.user.id,
      title,
      description,
      category: category as GoalCategory,
      targetDate,
      sessionsTarget,
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
