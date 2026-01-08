import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  getSessionParticipants,
  isParticipant,
  updateLastSeen,
} from '@/services/session-participants';

// GET - Get all participants for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await auth();

    if (!authSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sessionId } = await params;

    // Verify the session exists
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if user is initiator or participant
    const isInitiator = session.initiatorId === authSession.user.id;
    const isUserParticipant = await isParticipant(sessionId, authSession.user.id);

    if (!isInitiator && !isUserParticipant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const participants = await getSessionParticipants(sessionId);

    // Update last seen for current user
    if (isUserParticipant) {
      await updateLastSeen(sessionId, authSession.user.id);
    }

    return NextResponse.json({
      participants,
      sessionMode: session.sessionMode,
      isCollaborative: session.sessionMode === 'collaborative',
    });
  } catch (error) {
    console.error('Failed to get participants:', error);
    return NextResponse.json(
      { error: 'Failed to get participants' },
      { status: 500 }
    );
  }
}
