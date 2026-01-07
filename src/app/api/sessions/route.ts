import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSession, getUserSessions } from '@/services/session';
import { generateWelcome } from '@/lib/ai';
import { addMessage } from '@/services/session';
import { getTemplate, incrementTemplateUsage } from '@/services/templates';
import { getMediatorSettings } from '@/services/mediator-settings';
import { z } from 'zod';

const createSessionSchema = z.object({
  partnershipId: z.string().uuid().optional(),
  topic: z.string().min(1).max(500).optional(),
  templateId: z.string().uuid().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await getUserSessions(session.user.id);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authSession = await auth();
    if (!authSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { partnershipId, topic, templateId } = parsed.data;

    // Get template if provided
    let sessionTopic = topic || 'New Session';
    let templateContext: string | null = null;

    if (templateId) {
      const template = await getTemplate(templateId);
      if (template) {
        sessionTopic = template.name;
        templateContext = template.promptContext;
        // Increment usage count
        await incrementTemplateUsage(templateId);
      }
    }

    // Create the session
    const newSession = await createSession(
      partnershipId || null,
      authSession.user.id,
      sessionTopic
    );

    // Get user's mediator personality settings
    const personality = await getMediatorSettings(authSession.user.id);

    // Generate and save welcome message (with template context and personality)
    const welcomeMessage = await generateWelcome(templateContext || undefined, personality);
    await addMessage(newSession.id, null, 'assistant', welcomeMessage, 'intake');

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
