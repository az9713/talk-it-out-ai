import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getExercise, recordCompletion, seedExercises } from '@/services/calming';
import { z } from 'zod';

const completionSchema = z.object({
  sessionId: z.string().optional(),
  moodBefore: z.number().min(1).max(5).optional(),
  moodAfter: z.number().min(1).max(5).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Seed exercises if needed
    await seedExercises();

    const { id } = await params;
    const exercise = await getExercise(id);

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return NextResponse.json({ error: 'Failed to fetch exercise' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = completionSchema.parse(body);

    const completion = await recordCompletion(session.user.id, {
      exerciseId: id,
      ...validatedData,
    });

    return NextResponse.json({
      success: true,
      completion,
      message: 'Exercise completed!',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error recording completion:', error);
    return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 });
  }
}
