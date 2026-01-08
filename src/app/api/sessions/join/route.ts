import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import {
  joinSessionByInvite,
  getSessionByInviteCode,
} from '@/services/session-participants';

const joinSchema = z.object({
  inviteCode: z.string().min(1),
  displayName: z.string().optional(),
});

// POST - Join a session via invite code
export async function POST(request: NextRequest) {
  try {
    const authSession = await auth();

    if (!authSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = joinSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { inviteCode, displayName } = parsed.data;

    const result = await joinSessionByInvite(
      inviteCode,
      authSession.user.id,
      displayName
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
    });
  } catch (error) {
    console.error('Failed to join session:', error);
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    );
  }
}

// GET - Preview session before joining (with invite code as query param)
export async function GET(request: NextRequest) {
  try {
    const authSession = await auth();

    if (!authSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const inviteCode = searchParams.get('code');

    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }

    const session = await getSessionByInviteCode(inviteCode);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Failed to get session preview:', error);
    return NextResponse.json(
      { error: 'Failed to get session preview' },
      { status: 500 }
    );
  }
}
