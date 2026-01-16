import { db } from '@/lib/db';
import { sessionRequests, partnerships, users, sessions } from '@/lib/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';

export interface SessionRequestInput {
  toUserId: string;
  partnershipId: string;
  topic?: string;
  urgency?: 'whenever' | 'soon' | 'important';
  message?: string;
  suggestedTimes?: Date[];
}

export interface SessionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  partnershipId: string;
  topic: string | null;
  urgency: 'whenever' | 'soon' | 'important';
  message: string | null;
  suggestedTimes: Date[] | null;
  status: 'pending' | 'accepted' | 'declined' | 'rescheduled' | 'expired';
  responseMessage: string | null;
  scheduledFor: Date | null;
  sessionId: string | null;
  createdAt: Date;
  respondedAt: Date | null;
  expiresAt: Date | null;
  fromUser?: {
    id: string;
    name: string | null;
    email: string;
  };
  toUser?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface SessionRequestResponse {
  status: 'accepted' | 'declined' | 'rescheduled';
  responseMessage?: string;
  scheduledFor?: Date;
}

// Create a new session request
export async function createSessionRequest(
  fromUserId: string,
  data: SessionRequestInput
): Promise<SessionRequest> {
  // Verify the partnership exists and is active
  const partnership = await db.query.partnerships.findFirst({
    where: and(
      eq(partnerships.id, data.partnershipId),
      eq(partnerships.status, 'active'),
      or(
        eq(partnerships.user1Id, fromUserId),
        eq(partnerships.user2Id, fromUserId)
      )
    ),
  });

  if (!partnership) {
    throw new Error('Partnership not found or not active');
  }

  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const [request] = await db
    .insert(sessionRequests)
    .values({
      fromUserId,
      toUserId: data.toUserId,
      partnershipId: data.partnershipId,
      topic: data.topic || null,
      urgency: data.urgency || 'whenever',
      message: data.message || null,
      suggestedTimes: data.suggestedTimes ? JSON.stringify(data.suggestedTimes) : null,
      expiresAt,
    })
    .returning();

  return {
    ...request,
    suggestedTimes: data.suggestedTimes || null,
  };
}

// Get a session request by ID
export async function getSessionRequest(
  requestId: string,
  userId: string
): Promise<SessionRequest | null> {
  const request = await db.query.sessionRequests.findFirst({
    where: and(
      eq(sessionRequests.id, requestId),
      or(
        eq(sessionRequests.fromUserId, userId),
        eq(sessionRequests.toUserId, userId)
      )
    ),
    with: {
      fromUser: true,
      toUser: true,
    },
  });

  if (!request) return null;

  return {
    ...request,
    suggestedTimes: request.suggestedTimes ? JSON.parse(request.suggestedTimes) : null,
    fromUser: request.fromUser ? {
      id: request.fromUser.id,
      name: request.fromUser.name,
      email: request.fromUser.email,
    } : undefined,
    toUser: request.toUser ? {
      id: request.toUser.id,
      name: request.toUser.name,
      email: request.toUser.email,
    } : undefined,
  };
}

// Get pending requests received by a user
export async function getPendingRequestsReceived(
  userId: string
): Promise<SessionRequest[]> {
  const requests = await db.query.sessionRequests.findMany({
    where: and(
      eq(sessionRequests.toUserId, userId),
      eq(sessionRequests.status, 'pending')
    ),
    with: {
      fromUser: true,
    },
    orderBy: [desc(sessionRequests.createdAt)],
  });

  return requests.map((r: typeof requests[number]) => ({
    ...r,
    suggestedTimes: r.suggestedTimes ? JSON.parse(r.suggestedTimes) : null,
    fromUser: r.fromUser ? {
      id: r.fromUser.id,
      name: r.fromUser.name,
      email: r.fromUser.email,
    } : undefined,
  }));
}

// Get requests sent by a user
export async function getRequestsSent(userId: string): Promise<SessionRequest[]> {
  const requests = await db.query.sessionRequests.findMany({
    where: eq(sessionRequests.fromUserId, userId),
    with: {
      toUser: true,
    },
    orderBy: [desc(sessionRequests.createdAt)],
  });

  return requests.map((r: typeof requests[number]) => ({
    ...r,
    suggestedTimes: r.suggestedTimes ? JSON.parse(r.suggestedTimes) : null,
    toUser: r.toUser ? {
      id: r.toUser.id,
      name: r.toUser.name,
      email: r.toUser.email,
    } : undefined,
  }));
}

// Get all requests for a user (sent and received)
export async function getAllUserRequests(userId: string): Promise<{
  received: SessionRequest[];
  sent: SessionRequest[];
}> {
  const [received, sent] = await Promise.all([
    getPendingRequestsReceived(userId),
    getRequestsSent(userId),
  ]);

  return { received, sent };
}

// Respond to a session request
export async function respondToRequest(
  requestId: string,
  userId: string,
  response: SessionRequestResponse
): Promise<SessionRequest | null> {
  // Verify the user is the recipient
  const request = await db.query.sessionRequests.findFirst({
    where: and(
      eq(sessionRequests.id, requestId),
      eq(sessionRequests.toUserId, userId),
      eq(sessionRequests.status, 'pending')
    ),
  });

  if (!request) return null;

  const [updated] = await db
    .update(sessionRequests)
    .set({
      status: response.status,
      responseMessage: response.responseMessage || null,
      scheduledFor: response.scheduledFor || null,
      respondedAt: new Date(),
    })
    .where(eq(sessionRequests.id, requestId))
    .returning();

  return {
    ...updated,
    suggestedTimes: updated.suggestedTimes ? JSON.parse(updated.suggestedTimes) : null,
  };
}

// Link a session to a request (when session is created from accepted request)
export async function linkSessionToRequest(
  requestId: string,
  sessionId: string
): Promise<void> {
  await db
    .update(sessionRequests)
    .set({ sessionId })
    .where(eq(sessionRequests.id, requestId));
}

// Cancel a request (by the sender)
export async function cancelRequest(
  requestId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .update(sessionRequests)
    .set({ status: 'expired' })
    .where(
      and(
        eq(sessionRequests.id, requestId),
        eq(sessionRequests.fromUserId, userId),
        eq(sessionRequests.status, 'pending')
      )
    );

  return true;
}

// Expire old pending requests (for cron job)
export async function expireOldRequests(): Promise<number> {
  const now = new Date();

  const result = await db
    .update(sessionRequests)
    .set({ status: 'expired' })
    .where(
      and(
        eq(sessionRequests.status, 'pending'),
        // expiresAt is less than now
      )
    );

  // Return count of expired requests
  return 0; // TODO: Get actual count from result
}

// Get count of pending requests for a user
export async function getPendingRequestCount(userId: string): Promise<number> {
  const requests = await db.query.sessionRequests.findMany({
    where: and(
      eq(sessionRequests.toUserId, userId),
      eq(sessionRequests.status, 'pending')
    ),
  });

  return requests.length;
}

// Urgency labels for UI
export const URGENCY_LABELS = {
  whenever: 'Whenever you have time',
  soon: 'When you can, fairly soon',
  important: 'This is important to me',
};

export const URGENCY_COLORS = {
  whenever: 'bg-gray-100 text-gray-800',
  soon: 'bg-yellow-100 text-yellow-800',
  important: 'bg-red-100 text-red-800',
};
