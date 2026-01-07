import { db, sessionTemplates } from '@/lib/db';
import { eq, or, isNull, desc, sql } from 'drizzle-orm';

export type TemplateCategory =
  | 'household'
  | 'finances'
  | 'communication'
  | 'parenting'
  | 'work'
  | 'boundaries'
  | 'intimacy'
  | 'other';

export interface CreateTemplateInput {
  name: string;
  description?: string;
  category: TemplateCategory;
  promptContext: string;
  suggestedOpening?: string;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  category?: TemplateCategory;
  promptContext?: string;
  suggestedOpening?: string;
}

// Get all system templates
export async function getSystemTemplates() {
  return db.query.sessionTemplates.findMany({
    where: eq(sessionTemplates.isSystem, true),
    orderBy: [desc(sessionTemplates.usageCount)],
  });
}

// Get templates for a user (system + user's own)
export async function getTemplatesForUser(userId: string) {
  return db.query.sessionTemplates.findMany({
    where: or(
      eq(sessionTemplates.isSystem, true),
      eq(sessionTemplates.userId, userId)
    ),
    orderBy: [desc(sessionTemplates.usageCount)],
  });
}

// Get user's own templates (not system templates)
export async function getUserTemplates(userId: string) {
  return db.query.sessionTemplates.findMany({
    where: eq(sessionTemplates.userId, userId),
    orderBy: [desc(sessionTemplates.updatedAt)],
  });
}

// Get a single template
export async function getTemplate(templateId: string) {
  return db.query.sessionTemplates.findFirst({
    where: eq(sessionTemplates.id, templateId),
  });
}

// Create a new user template
export async function createTemplate(userId: string, data: CreateTemplateInput) {
  const [template] = await db
    .insert(sessionTemplates)
    .values({
      userId,
      name: data.name,
      description: data.description,
      category: data.category,
      promptContext: data.promptContext,
      suggestedOpening: data.suggestedOpening,
      isSystem: false,
    })
    .returning();

  return template;
}

// Update a template
export async function updateTemplate(templateId: string, userId: string, data: UpdateTemplateInput) {
  // Only allow updating user's own templates (not system templates)
  const [updated] = await db
    .update(sessionTemplates)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      sql`${sessionTemplates.id} = ${templateId} AND ${sessionTemplates.userId} = ${userId} AND ${sessionTemplates.isSystem} = false`
    )
    .returning();

  return updated;
}

// Delete a template
export async function deleteTemplate(templateId: string, userId: string) {
  // Only allow deleting user's own templates (not system templates)
  const [deleted] = await db
    .delete(sessionTemplates)
    .where(
      sql`${sessionTemplates.id} = ${templateId} AND ${sessionTemplates.userId} = ${userId} AND ${sessionTemplates.isSystem} = false`
    )
    .returning();

  return deleted;
}

// Increment usage count when a template is used
export async function incrementTemplateUsage(templateId: string) {
  await db
    .update(sessionTemplates)
    .set({
      usageCount: sql`${sessionTemplates.usageCount} + 1`,
    })
    .where(eq(sessionTemplates.id, templateId));
}

// Get templates by category
export async function getTemplatesByCategory(category: TemplateCategory, userId?: string) {
  if (userId) {
    return db.query.sessionTemplates.findMany({
      where: sql`${sessionTemplates.category} = ${category} AND (${sessionTemplates.isSystem} = true OR ${sessionTemplates.userId} = ${userId})`,
      orderBy: [desc(sessionTemplates.usageCount)],
    });
  }

  return db.query.sessionTemplates.findMany({
    where: sql`${sessionTemplates.category} = ${category} AND ${sessionTemplates.isSystem} = true`,
    orderBy: [desc(sessionTemplates.usageCount)],
  });
}
