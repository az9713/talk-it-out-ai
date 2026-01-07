import { db, mediatorSettings } from '@/lib/db';
import { eq } from 'drizzle-orm';
import type { MediatorPersonality, MediatorTone, MediatorFormality, MediatorResponseLength } from '@/lib/ai/personality';
import { DEFAULT_PERSONALITY } from '@/lib/ai/personality';

export interface MediatorSettingsInput {
  tone?: MediatorTone;
  formality?: MediatorFormality;
  responseLength?: MediatorResponseLength;
  useEmoji?: boolean;
  useMetaphors?: boolean;
  culturalContext?: string | null;
}

/**
 * Get mediator settings for a user, returns defaults if none exist
 */
export async function getMediatorSettings(userId: string): Promise<MediatorPersonality> {
  const settings = await db.query.mediatorSettings.findFirst({
    where: eq(mediatorSettings.userId, userId),
  });

  if (!settings) {
    return DEFAULT_PERSONALITY;
  }

  return {
    tone: settings.tone as MediatorTone,
    formality: settings.formality as MediatorFormality,
    responseLength: settings.responseLength as MediatorResponseLength,
    useEmoji: settings.useEmoji,
    useMetaphors: settings.useMetaphors,
    culturalContext: settings.culturalContext,
  };
}

/**
 * Get raw mediator settings record (for checking if exists)
 */
export async function getMediatorSettingsRecord(userId: string) {
  return db.query.mediatorSettings.findFirst({
    where: eq(mediatorSettings.userId, userId),
  });
}

/**
 * Create or update mediator settings for a user
 */
export async function updateMediatorSettings(
  userId: string,
  data: MediatorSettingsInput
): Promise<MediatorPersonality> {
  const existing = await getMediatorSettingsRecord(userId);

  if (existing) {
    // Update existing settings
    const [updated] = await db
      .update(mediatorSettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(mediatorSettings.userId, userId))
      .returning();

    return {
      tone: updated.tone as MediatorTone,
      formality: updated.formality as MediatorFormality,
      responseLength: updated.responseLength as MediatorResponseLength,
      useEmoji: updated.useEmoji,
      useMetaphors: updated.useMetaphors,
      culturalContext: updated.culturalContext,
    };
  }

  // Create new settings
  const [created] = await db
    .insert(mediatorSettings)
    .values({
      userId,
      tone: data.tone || DEFAULT_PERSONALITY.tone,
      formality: data.formality || DEFAULT_PERSONALITY.formality,
      responseLength: data.responseLength || DEFAULT_PERSONALITY.responseLength,
      useEmoji: data.useEmoji ?? DEFAULT_PERSONALITY.useEmoji,
      useMetaphors: data.useMetaphors ?? DEFAULT_PERSONALITY.useMetaphors,
      culturalContext: data.culturalContext,
    })
    .returning();

  return {
    tone: created.tone as MediatorTone,
    formality: created.formality as MediatorFormality,
    responseLength: created.responseLength as MediatorResponseLength,
    useEmoji: created.useEmoji,
    useMetaphors: created.useMetaphors,
    culturalContext: created.culturalContext,
  };
}

/**
 * Reset mediator settings to defaults
 */
export async function resetMediatorSettings(userId: string): Promise<MediatorPersonality> {
  const existing = await getMediatorSettingsRecord(userId);

  if (existing) {
    await db
      .delete(mediatorSettings)
      .where(eq(mediatorSettings.userId, userId));
  }

  return DEFAULT_PERSONALITY;
}
