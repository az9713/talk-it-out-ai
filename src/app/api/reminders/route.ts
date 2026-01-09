import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getUserReminders,
  getUpcomingReminders,
  createReminder,
  type ReminderType,
} from '@/services/reminders';
import { z } from 'zod';

const createReminderSchema = z.object({
  sessionId: z.string().min(1),
  type: z.enum(['follow_up', 'agreement_check', 'custom']),
  scheduledFor: z.string().transform((s) => new Date(s)),
  message: z.string().optional(),
});

// GET /api/reminders - Get user's reminders
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';

    const reminders = upcoming
      ? await getUpcomingReminders(session.user.id)
      : await getUserReminders(session.user.id);

    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reminders - Create a new reminder
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createReminderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, type, scheduledFor, message } = validation.data;

    // Validate scheduled time is in the future
    if (scheduledFor <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    const reminder = await createReminder({
      userId: session.user.id,
      sessionId,
      type: type as ReminderType,
      scheduledFor,
      message,
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error('Create reminder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
