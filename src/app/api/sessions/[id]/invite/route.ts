import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  generateSessionInvite,
  revokeSessionInvite,
  getSessionParticipants,
} from '@/services/session-participants';

// POST - Generate invite link for session
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

    // Verify the session exists and user is the initiator
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.initiatorId !== authSession.user.id) {
      return NextResponse.json(
        { error: 'Only the session initiator can generate invites' },
        { status: 403 }
      );
    }

    if (session.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot invite to an inactive session' },
        { status: 400 }
      );
    }

    // Check if there's already a partner
    const participants = await getSessionParticipants(sessionId);
    if (participants.length >= 2) {
      return NextResponse.json(
        { error: 'Session already has a partner' },
        { status: 400 }
      );
    }

    // Generate or refresh invite
    const invite = await generateSessionInvite(sessionId);

    return NextResponse.json(invite);
  } catch (error) {
    console.error('Failed to generate invite:', error);
    return NextResponse.json(
      { error: 'Failed to generate invite' },
      { status: 500 }
    );
  }
}

// GET - Get current invite status
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

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Only initiator can view invite details
    if (session.initiatorId !== authSession.user.id) {
      return NextResponse.json(
        { error: 'Only the session initiator can view invites' },
        { status: 403 }
      );
    }

    if (!session.inviteCode) {
      return NextResponse.json({ hasInvite: false });
    }

    const isExpired = session.inviteExpiresAt && new Date() > session.inviteExpiresAt;

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/dashboard/sessions/join?code=${session.inviteCode}`;

    return NextResponse.json({
      hasInvite: !isExpired,
      inviteCode: isExpired ? null : session.inviteCode,
      inviteUrl: isExpired ? null : inviteUrl,
      expiresAt: session.inviteExpiresAt,
      isExpired,
    });
  } catch (error) {
    console.error('Failed to get invite status:', error);
    return NextResponse.json(
      { error: 'Failed to get invite status' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke invite
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await auth();

    if (!authSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sessionId } = await params;

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.initiatorId !== authSession.user.id) {
      return NextResponse.json(
        { error: 'Only the session initiator can revoke invites' },
        { status: 403 }
      );
    }

    await revokeSessionInvite(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to revoke invite:', error);
    return NextResponse.json(
      { error: 'Failed to revoke invite' },
      { status: 500 }
    );
  }
}
