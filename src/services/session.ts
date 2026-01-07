import { db, sessions, messages, perspectives } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import type { SessionStage, SessionStatus } from '@/types';

export async function createSession(
  partnershipId: string | null,
  initiatorId: string,
  topic: string
) {
  const [session] = await db
    .insert(sessions)
    .values({
      partnershipId,
      initiatorId,
      topic,
      stage: 'intake',
      status: 'active',
      currentSpeakerId: initiatorId,
    })
    .returning();

  return session;
}

export async function getSession(sessionId: string) {
  return db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: {
      partnership: {
        with: {
          user1: true,
          user2: true,
        },
      },
      initiator: true,
      messages: {
        orderBy: [desc(messages.createdAt)],
        limit: 50,
      },
      perspectives: true,
    },
  });
}

export async function getUserSessions(userId: string) {
  return db.query.sessions.findMany({
    where: eq(sessions.initiatorId, userId),
    with: {
      partnership: {
        with: {
          user1: true,
          user2: true,
        },
      },
    },
    orderBy: [desc(sessions.updatedAt)],
  });
}

export async function addMessage(
  sessionId: string,
  userId: string | null,
  role: 'user' | 'assistant' | 'system',
  content: string,
  stage: SessionStage
) {
  const [message] = await db
    .insert(messages)
    .values({
      sessionId,
      userId,
      role,
      content,
      stage,
    })
    .returning();

  // Update session timestamp
  await db
    .update(sessions)
    .set({ updatedAt: new Date() })
    .where(eq(sessions.id, sessionId));

  return message;
}

export async function updateSessionStage(sessionId: string, stage: SessionStage) {
  await db
    .update(sessions)
    .set({ stage, updatedAt: new Date() })
    .where(eq(sessions.id, sessionId));
}

export async function updateSessionStatus(sessionId: string, status: SessionStatus) {
  await db
    .update(sessions)
    .set({ status, updatedAt: new Date() })
    .where(eq(sessions.id, sessionId));
}

export async function getSessionMessages(sessionId: string) {
  return db.query.messages.findMany({
    where: eq(messages.sessionId, sessionId),
    orderBy: [messages.createdAt],
  });
}

export async function getSessionCounts(userId: string) {
  const userSessions = await db.query.sessions.findMany({
    where: eq(sessions.initiatorId, userId),
  });

  const active = userSessions.filter((s: { status: string }) => s.status === 'active').length;
  const completed = userSessions.filter((s: { status: string }) => s.status === 'completed').length;
  const paused = userSessions.filter((s: { status: string }) => s.status === 'paused').length;

  return { active, completed, paused, total: userSessions.length };
}

export async function savePerspective(
  sessionId: string,
  userId: string,
  data: {
    observation?: string;
    feeling?: string;
    need?: string;
    request?: string;
  }
) {
  const existing = await db.query.perspectives.findFirst({
    where: and(
      eq(perspectives.sessionId, sessionId),
      eq(perspectives.userId, userId)
    ),
  });

  if (existing) {
    const [updated] = await db
      .update(perspectives)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(perspectives.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(perspectives)
    .values({
      sessionId,
      userId,
      ...data,
    })
    .returning();

  return created;
}

export async function getSessionForExport(sessionId: string) {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: {
      partnership: {
        with: {
          user1: true,
          user2: true,
        },
      },
      initiator: true,
      messages: {
        orderBy: [messages.createdAt],
      },
      perspectives: {
        with: {
          user: true,
        },
      },
      agreements: true,
    },
  });

  return session;
}
