import { db } from '@/lib/db';
import { sessions, sessionParticipants, users } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';

// Generate a random invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface Participant {
  id: string;
  sessionId: string;
  userId: string;
  role: 'initiator' | 'partner';
  displayName: string | null;
  joinedAt: Date;
  lastSeenAt: Date | null;
  isActive: boolean;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface SessionWithParticipants {
  id: string;
  topic: string;
  sessionMode: 'solo' | 'collaborative';
  inviteCode: string | null;
  inviteExpiresAt: Date | null;
  participants: Participant[];
}

// Add a participant to a session
export async function addParticipant(
  sessionId: string,
  userId: string,
  role: 'initiator' | 'partner',
  displayName?: string
): Promise<Participant> {
  const [participant] = await db
    .insert(sessionParticipants)
    .values({
      sessionId,
      userId,
      role,
      displayName: displayName || null,
      joinedAt: new Date(),
      isActive: true,
    })
    .returning();

  return participant as Participant;
}

// Get all participants for a session
export async function getSessionParticipants(sessionId: string): Promise<Participant[]> {
  const participants = await db.query.sessionParticipants.findMany({
    where: eq(sessionParticipants.sessionId, sessionId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: [asc(sessionParticipants.joinedAt)],
  });

  return participants as Participant[];
}

// Check if a user is a participant in a session
export async function isParticipant(sessionId: string, userId: string): Promise<boolean> {
  const participant = await db.query.sessionParticipants.findFirst({
    where: and(
      eq(sessionParticipants.sessionId, sessionId),
      eq(sessionParticipants.userId, userId)
    ),
  });

  return !!participant;
}

// Update last seen timestamp for a participant
export async function updateLastSeen(sessionId: string, userId: string): Promise<void> {
  await db
    .update(sessionParticipants)
    .set({ lastSeenAt: new Date() })
    .where(
      and(
        eq(sessionParticipants.sessionId, sessionId),
        eq(sessionParticipants.userId, userId)
      )
    );
}

// Generate an invite for a session
export async function generateSessionInvite(
  sessionId: string,
  expiresInHours: number = 24
): Promise<{ inviteCode: string; inviteUrl: string; expiresAt: Date }> {
  const inviteCode = generateInviteCode();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  await db
    .update(sessions)
    .set({
      sessionMode: 'collaborative',
      inviteCode,
      inviteExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));

  // Construct the invite URL
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const inviteUrl = `${baseUrl}/dashboard/sessions/join?code=${inviteCode}`;

  return { inviteCode, inviteUrl, expiresAt };
}

// Join a session via invite code
export async function joinSessionByInvite(
  inviteCode: string,
  userId: string,
  displayName?: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  // Find the session with this invite code
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.inviteCode, inviteCode),
    with: {
      participants: true,
      initiator: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!session) {
    return { success: false, error: 'Invalid invite code' };
  }

  // Check if invite has expired
  if (session.inviteExpiresAt && new Date() > session.inviteExpiresAt) {
    return { success: false, error: 'This invite has expired' };
  }

  // Check if session is still active
  if (session.status !== 'active') {
    return { success: false, error: 'This session is no longer active' };
  }

  // Check if user is already a participant
  const existingParticipant = session.participants?.find(
    (p: { userId: string }) => p.userId === userId
  );
  if (existingParticipant) {
    return { success: true, sessionId: session.id }; // Already joined
  }

  // Check if user is the initiator
  if (session.initiatorId === userId) {
    return { success: false, error: 'You are already the initiator of this session' };
  }

  // Check participant limit (max 2 for now)
  if (session.participants && session.participants.length >= 2) {
    return { success: false, error: 'This session already has the maximum number of participants' };
  }

  // Add the user as a participant
  await addParticipant(session.id, userId, 'partner', displayName);

  return { success: true, sessionId: session.id };
}

// Get session by invite code (for preview before joining)
export async function getSessionByInviteCode(
  inviteCode: string
): Promise<{
  id: string;
  topic: string;
  initiatorName: string;
  status: string;
  createdAt: Date;
} | null> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.inviteCode, inviteCode),
    with: {
      initiator: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check if invite has expired
  if (session.inviteExpiresAt && new Date() > session.inviteExpiresAt) {
    return null;
  }

  return {
    id: session.id,
    topic: session.topic,
    initiatorName: session.initiator?.name || 'Anonymous',
    status: session.status,
    createdAt: session.createdAt,
  };
}

// Remove a participant from a session (leave session)
export async function removeParticipant(
  sessionId: string,
  userId: string
): Promise<void> {
  await db
    .update(sessionParticipants)
    .set({ isActive: false })
    .where(
      and(
        eq(sessionParticipants.sessionId, sessionId),
        eq(sessionParticipants.userId, userId)
      )
    );
}

// Revoke invite code for a session
export async function revokeSessionInvite(sessionId: string): Promise<void> {
  await db
    .update(sessions)
    .set({
      inviteCode: null,
      inviteExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));
}
