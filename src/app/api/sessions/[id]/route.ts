import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSession } from '@/services/session';
import { isParticipant } from '@/services/session-participants';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await auth();
    if (!authSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sessionId } = await params;
    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if user is the initiator or a participant
    const isInitiator = session.initiatorId === authSession.user.id;
    const hasAccess = isInitiator || await isParticipant(sessionId, authSession.user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      id: session.id,
      topic: session.topic,
      stage: session.stage,
      status: session.status,
      sessionMode: session.sessionMode || 'solo',
      initiatorId: session.initiatorId,
      partnershipId: session.partnershipId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
