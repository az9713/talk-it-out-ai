import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  triggerSessionEvent,
  PUSHER_EVENTS,
  type TypingPayload,
} from '@/lib/pusher/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await auth();

    if (!authSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sessionId } = await params;
    const body = await request.json();
    const { isTyping } = body;

    if (typeof isTyping !== 'boolean') {
      return NextResponse.json(
        { error: 'isTyping must be a boolean' },
        { status: 400 }
      );
    }

    // Verify the session exists and user has access
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: {
        partnership: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if user is the initiator or part of the partnership
    const isInitiator = session.initiatorId === authSession.user.id;
    const isPartner =
      session.partnership?.user1Id === authSession.user.id ||
      session.partnership?.user2Id === authSession.user.id;

    if (!isInitiator && !isPartner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Trigger typing event
    const payload: TypingPayload = {
      userId: authSession.user.id,
      userName: authSession.user.name || 'User',
      isTyping,
    };

    const event = isTyping ? PUSHER_EVENTS.TYPING_START : PUSHER_EVENTS.TYPING_STOP;
    await triggerSessionEvent(sessionId, event, payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send typing indicator:', error);
    return NextResponse.json(
      { error: 'Failed to send typing indicator' },
      { status: 500 }
    );
  }
}
