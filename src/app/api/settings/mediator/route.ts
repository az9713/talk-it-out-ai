import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getMediatorSettings,
  updateMediatorSettings,
  resetMediatorSettings,
} from '@/services/mediator-settings';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  tone: z.enum(['warm', 'professional', 'direct', 'gentle']).optional(),
  formality: z.enum(['casual', 'balanced', 'formal']).optional(),
  responseLength: z.enum(['concise', 'moderate', 'detailed']).optional(),
  useEmoji: z.boolean().optional(),
  useMetaphors: z.boolean().optional(),
  culturalContext: z.string().max(500).nullable().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getMediatorSettings(session.user.id);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get mediator settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const settings = await updateMediatorSettings(session.user.id, parsed.data);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Update mediator settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await resetMediatorSettings(session.user.id);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Reset mediator settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
