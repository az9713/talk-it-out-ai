import { db } from '@/lib/db';
import { sessionPreparations, sessions } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';

export interface PreparationInput {
  situation?: string;
  initialFeelings?: string[];
  desiredOutcome?: string;
  identifiedNeeds?: string[];
  draftOpening?: string;
  concerns?: string;
  shareWithMediator?: boolean;
}

export interface SessionPreparation {
  id: string;
  userId: string;
  sessionId: string | null;
  situation: string | null;
  initialFeelings: string[] | null;
  desiredOutcome: string | null;
  identifiedNeeds: string[] | null;
  draftOpening: string | null;
  suggestedOpening: string | null;
  concerns: string | null;
  isComplete: boolean;
  shareWithMediator: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create a new preparation
export async function createPreparation(userId: string): Promise<SessionPreparation> {
  const [prep] = await db
    .insert(sessionPreparations)
    .values({
      userId,
    })
    .returning();

  return {
    ...prep,
    initialFeelings: null,
    identifiedNeeds: null,
  };
}

// Get a preparation by ID
export async function getPreparation(
  prepId: string,
  userId: string
): Promise<SessionPreparation | null> {
  const prep = await db.query.sessionPreparations.findFirst({
    where: and(
      eq(sessionPreparations.id, prepId),
      eq(sessionPreparations.userId, userId)
    ),
  });

  if (!prep) return null;

  return {
    ...prep,
    initialFeelings: prep.initialFeelings ? JSON.parse(prep.initialFeelings) : null,
    identifiedNeeds: prep.identifiedNeeds ? JSON.parse(prep.identifiedNeeds) : null,
  };
}

// Update a preparation
export async function updatePreparation(
  prepId: string,
  userId: string,
  data: PreparationInput
): Promise<SessionPreparation | null> {
  const [updated] = await db
    .update(sessionPreparations)
    .set({
      situation: data.situation,
      initialFeelings: data.initialFeelings ? JSON.stringify(data.initialFeelings) : undefined,
      desiredOutcome: data.desiredOutcome,
      identifiedNeeds: data.identifiedNeeds ? JSON.stringify(data.identifiedNeeds) : undefined,
      draftOpening: data.draftOpening,
      concerns: data.concerns,
      shareWithMediator: data.shareWithMediator,
      updatedAt: new Date(),
    })
    .where(and(eq(sessionPreparations.id, prepId), eq(sessionPreparations.userId, userId)))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    initialFeelings: updated.initialFeelings ? JSON.parse(updated.initialFeelings) : null,
    identifiedNeeds: updated.identifiedNeeds ? JSON.parse(updated.identifiedNeeds) : null,
  };
}

// Mark preparation as complete
export async function completePreparation(
  prepId: string,
  userId: string
): Promise<SessionPreparation | null> {
  const [updated] = await db
    .update(sessionPreparations)
    .set({
      isComplete: true,
      updatedAt: new Date(),
    })
    .where(and(eq(sessionPreparations.id, prepId), eq(sessionPreparations.userId, userId)))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    initialFeelings: updated.initialFeelings ? JSON.parse(updated.initialFeelings) : null,
    identifiedNeeds: updated.identifiedNeeds ? JSON.parse(updated.identifiedNeeds) : null,
  };
}

// Link preparation to a session
export async function linkPreparationToSession(
  prepId: string,
  sessionId: string,
  userId: string
): Promise<void> {
  await db
    .update(sessionPreparations)
    .set({
      sessionId,
      updatedAt: new Date(),
    })
    .where(and(eq(sessionPreparations.id, prepId), eq(sessionPreparations.userId, userId)));
}

// Get user's incomplete preparations
export async function getIncompletePreparations(
  userId: string
): Promise<SessionPreparation[]> {
  const preps = await db.query.sessionPreparations.findMany({
    where: and(
      eq(sessionPreparations.userId, userId),
      eq(sessionPreparations.isComplete, false)
    ),
    orderBy: [desc(sessionPreparations.updatedAt)],
  });

  return preps.map((p: typeof preps[number]) => ({
    ...p,
    initialFeelings: p.initialFeelings ? JSON.parse(p.initialFeelings) : null,
    identifiedNeeds: p.identifiedNeeds ? JSON.parse(p.identifiedNeeds) : null,
  }));
}

// Get preparation for a session
export async function getPreparationForSession(
  sessionId: string,
  userId: string
): Promise<SessionPreparation | null> {
  const prep = await db.query.sessionPreparations.findFirst({
    where: and(
      eq(sessionPreparations.sessionId, sessionId),
      eq(sessionPreparations.userId, userId)
    ),
  });

  if (!prep) return null;

  return {
    ...prep,
    initialFeelings: prep.initialFeelings ? JSON.parse(prep.initialFeelings) : null,
    identifiedNeeds: prep.identifiedNeeds ? JSON.parse(prep.identifiedNeeds) : null,
  };
}

// Generate AI-suggested opening based on preparation
export async function generateSuggestedOpening(
  prepId: string,
  userId: string
): Promise<string | null> {
  const prep = await getPreparation(prepId, userId);
  if (!prep) return null;

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = `You are a communication coach helping someone prepare for a difficult conversation using Nonviolent Communication (NVC) principles.

Based on the following preparation notes, suggest a thoughtful, empathetic opening statement they could use to start the conversation. The opening should:
1. Be genuine and from the heart
2. Focus on the speaker's own experience (using "I" statements)
3. Be non-blaming and non-accusatory
4. Set a collaborative tone
5. Be 2-3 sentences maximum

Preparation notes:
- Situation: ${prep.situation || 'Not specified'}
- How they're feeling: ${prep.initialFeelings?.join(', ') || 'Not specified'}
- What they hope to achieve: ${prep.desiredOutcome || 'Not specified'}
- Their underlying needs: ${prep.identifiedNeeds?.join(', ') || 'Not specified'}
- Their concerns: ${prep.concerns || 'Not specified'}
- Their draft opening: ${prep.draftOpening || 'Not provided'}

Please provide just the suggested opening statement, nothing else.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const suggestedOpening =
      response.content[0].type === 'text' ? response.content[0].text.trim() : null;

    if (suggestedOpening) {
      // Save the suggested opening
      await db
        .update(sessionPreparations)
        .set({
          suggestedOpening,
          updatedAt: new Date(),
        })
        .where(eq(sessionPreparations.id, prepId));
    }

    return suggestedOpening;
  } catch (error) {
    console.error('Error generating suggested opening:', error);
    return null;
  }
}

// Delete a preparation
export async function deletePreparation(prepId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(sessionPreparations)
    .where(and(eq(sessionPreparations.id, prepId), eq(sessionPreparations.userId, userId)));

  return true;
}

// Common feelings for UI
export const COMMON_FEELINGS = [
  'anxious',
  'nervous',
  'frustrated',
  'hurt',
  'sad',
  'angry',
  'confused',
  'hopeful',
  'determined',
  'scared',
  'overwhelmed',
  'disappointed',
];

// Common needs for UI
export const COMMON_NEEDS = [
  'understanding',
  'respect',
  'connection',
  'support',
  'honesty',
  'trust',
  'appreciation',
  'autonomy',
  'fairness',
  'safety',
  'clarity',
  'peace',
];
