import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getGoalWithMilestones,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  markGoalCelebrationShown,
  markMilestoneCelebrationShown,
  type GoalCategory,
  type GoalStatus,
} from '@/services/goals';
import { z } from 'zod';

const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
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
  ]).optional(),
  status: z.enum(['active', 'completed', 'paused', 'abandoned']).optional(),
  targetDate: z.string().nullable().optional().transform((s) => (s ? new Date(s) : null)),
  progress: z.number().min(0).max(100).optional(),
  sessionsTarget: z.number().min(1).max(100).nullable().optional(),
  celebrationShown: z.boolean().optional(),
});

// GET /api/goals/[id] - Get a single goal with milestones
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId } = await params;
    const goal = await getGoalWithMilestones(goalId, session.user.id);

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Get goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/goals/[id] - Update a goal
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId } = await params;
    const body = await request.json();
    const validation = updateGoalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const goal = await updateGoal(goalId, session.user.id, {
      ...validation.data,
      category: validation.data.category as GoalCategory | undefined,
      status: validation.data.status as GoalStatus | undefined,
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Update goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/goals/[id] - Update goal progress or mark celebration shown
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId } = await params;
    const body = await request.json();

    // Handle celebration acknowledgment
    if (body.action === 'acknowledge_celebration') {
      if (body.milestoneId) {
        await markMilestoneCelebrationShown(body.milestoneId, session.user.id);
      } else {
        await markGoalCelebrationShown(goalId, session.user.id);
      }
      return NextResponse.json({ success: true });
    }

    // Handle progress update
    if (body.progress !== undefined) {
      const goal = await updateGoalProgress(goalId, session.user.id, body.progress);
      if (!goal) {
        return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
      }
      return NextResponse.json(goal);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Patch goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/goals/[id] - Delete a goal
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId } = await params;
    const deleted = await deleteGoal(goalId, session.user.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
