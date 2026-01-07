import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSession, addMessage, updateSessionStage, getSessionMessages } from '@/services/session';
import { generateResponse } from '@/lib/ai';
import { getMediatorSettings } from '@/services/mediator-settings';
import { z } from 'zod';
import type { Message } from '@/types';

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
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

    const { id } = await params;
    const messages = await getSessionMessages(id);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await auth();
    if (!authSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sessionId } = await params;
    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    // Get the session
    const sessionData = await getSession(sessionId);
    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Save user message
    const userMessage = await addMessage(
      sessionId,
      authSession.user.id,
      'user',
      content,
      sessionData.stage
    );

    // Get all messages for context
    const allMessages = await getSessionMessages(sessionId);

    // Get user's mediator personality settings
    const personality = await getMediatorSettings(authSession.user.id);

    // Generate AI response
    const aiResponse = await generateResponse(
      allMessages.map((m: { id: string; sessionId: string; userId: string | null; role: string; content: string; stage: string; createdAt: Date }) => ({
        id: m.id,
        sessionId: m.sessionId,
        userId: m.userId,
        role: m.role,
        content: m.content,
        stage: m.stage,
        createdAt: m.createdAt,
      })),
      sessionData.stage,
      content,
      personality
    );

    // Save AI response
    const assistantMessage = await addMessage(
      sessionId,
      null,
      'assistant',
      aiResponse.message,
      aiResponse.nextStage || sessionData.stage
    );

    // Update stage if needed
    if (aiResponse.nextStage) {
      await updateSessionStage(sessionId, aiResponse.nextStage);
    }

    return NextResponse.json({
      userMessage,
      assistantMessage,
      nextStage: aiResponse.nextStage,
      safetyAlert: aiResponse.safetyAlert,
    });
  } catch (error) {
    console.error('Send message error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
