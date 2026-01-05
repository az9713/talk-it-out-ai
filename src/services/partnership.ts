import { db, partnerships, users } from '@/lib/db';
import { eq, or, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function createPartnership(userId: string) {
  const inviteCode = nanoid(10);

  const [partnership] = await db
    .insert(partnerships)
    .values({
      user1Id: userId,
      inviteCode,
      status: 'pending',
    })
    .returning();

  return partnership;
}

export async function acceptInvite(inviteCode: string, userId: string) {
  // Find the partnership by invite code
  const partnership = await db.query.partnerships.findFirst({
    where: and(
      eq(partnerships.inviteCode, inviteCode),
      eq(partnerships.status, 'pending')
    ),
  });

  if (!partnership) {
    throw new Error('Invalid or expired invite code');
  }

  if (partnership.user1Id === userId) {
    throw new Error('You cannot accept your own invite');
  }

  // Update the partnership
  const [updated] = await db
    .update(partnerships)
    .set({
      user2Id: userId,
      status: 'active',
      updatedAt: new Date(),
    })
    .where(eq(partnerships.id, partnership.id))
    .returning();

  return updated;
}

export async function getUserPartnerships(userId: string) {
  return db.query.partnerships.findMany({
    where: or(
      eq(partnerships.user1Id, userId),
      eq(partnerships.user2Id, userId)
    ),
    with: {
      user1: true,
      user2: true,
    },
  });
}

export async function getPartnership(partnershipId: string) {
  return db.query.partnerships.findFirst({
    where: eq(partnerships.id, partnershipId),
    with: {
      user1: true,
      user2: true,
    },
  });
}

export async function endPartnership(partnershipId: string, userId: string) {
  const partnership = await getPartnership(partnershipId);

  if (!partnership) {
    throw new Error('Partnership not found');
  }

  if (partnership.user1Id !== userId && partnership.user2Id !== userId) {
    throw new Error('Not authorized');
  }

  const [updated] = await db
    .update(partnerships)
    .set({
      status: 'ended',
      updatedAt: new Date(),
    })
    .where(eq(partnerships.id, partnershipId))
    .returning();

  return updated;
}

export async function getPartner(partnershipId: string, userId: string) {
  const partnership = await getPartnership(partnershipId);

  if (!partnership) return null;

  if (partnership.user1Id === userId) {
    return partnership.user2;
  }
  if (partnership.user2Id === userId) {
    return partnership.user1;
  }

  return null;
}
