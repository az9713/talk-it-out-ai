import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOrCreateUserPreferences, updateUserPreferences } from '@/services/reminders';
import { z } from 'zod';

const updatePreferencesSchema = z.object({
  emailReminders: z.boolean().optional(),
  reminderFrequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'custom']).optional(),
  defaultFollowUpDays: z.number().min(1).max(90).optional(),
  agreementCheckDays: z.number().min(1).max(30).optional(),
  emailDigest: z.boolean().optional(),
  quietHoursStart: z.number().min(0).max(23).nullable().optional(),
  quietHoursEnd: z.number().min(0).max(23).nullable().optional(),
  timezone: z.string().nullable().optional(),
});

// GET /api/settings/preferences - Get user preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await getOrCreateUserPreferences(session.user.id);
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/settings/preferences - Update user preferences
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updatePreferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const preferences = await updateUserPreferences(session.user.id, validation.data);
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
