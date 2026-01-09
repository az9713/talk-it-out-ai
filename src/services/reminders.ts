import { db } from '@/lib/db';
import { reminders, userPreferences, sessions, users } from '@/lib/db/schema';
import { eq, and, lte, asc } from 'drizzle-orm';
import { sendEmail, generateReminderEmail } from '@/lib/email';

export type ReminderType = 'follow_up' | 'agreement_check' | 'custom';
export type ReminderStatus = 'pending' | 'sent' | 'cancelled' | 'failed';

export interface Reminder {
  id: string;
  userId: string;
  sessionId: string;
  type: ReminderType;
  status: ReminderStatus;
  scheduledFor: Date;
  sentAt: Date | null;
  message: string | null;
  createdAt: Date;
}

export interface CreateReminderInput {
  userId: string;
  sessionId: string;
  type: ReminderType;
  scheduledFor: Date;
  message?: string;
}

// Create a new reminder
export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  const [reminder] = await db
    .insert(reminders)
    .values({
      userId: input.userId,
      sessionId: input.sessionId,
      type: input.type,
      scheduledFor: input.scheduledFor,
      message: input.message || null,
      status: 'pending',
    })
    .returning();

  return reminder as Reminder;
}

// Get all reminders for a user
export async function getUserReminders(userId: string): Promise<Reminder[]> {
  const result = await db.query.reminders.findMany({
    where: eq(reminders.userId, userId),
    orderBy: [asc(reminders.scheduledFor)],
  });

  return result as Reminder[];
}

// Get reminders for a specific session
export async function getSessionReminders(sessionId: string): Promise<Reminder[]> {
  const result = await db.query.reminders.findMany({
    where: eq(reminders.sessionId, sessionId),
    orderBy: [asc(reminders.scheduledFor)],
  });

  return result as Reminder[];
}

// Get upcoming reminders (pending and scheduled for future)
export async function getUpcomingReminders(userId: string): Promise<Reminder[]> {
  const result = await db.query.reminders.findMany({
    where: and(
      eq(reminders.userId, userId),
      eq(reminders.status, 'pending')
    ),
    orderBy: [asc(reminders.scheduledFor)],
  });

  return result as Reminder[];
}

// Cancel a reminder
export async function cancelReminder(reminderId: string, userId: string): Promise<boolean> {
  const [updated] = await db
    .update(reminders)
    .set({ status: 'cancelled' })
    .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)))
    .returning();

  return !!updated;
}

// Delete a reminder
export async function deleteReminder(reminderId: string, userId: string): Promise<boolean> {
  const [deleted] = await db
    .delete(reminders)
    .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)))
    .returning();

  return !!deleted;
}

// Get pending reminders that are due to be sent
export async function getDueReminders(): Promise<Array<Reminder & { user: { email: string; name: string | null }; session: { topic: string } }>> {
  const now = new Date();

  const result = await db.query.reminders.findMany({
    where: and(
      eq(reminders.status, 'pending'),
      lte(reminders.scheduledFor, now)
    ),
    with: {
      user: {
        columns: {
          email: true,
          name: true,
        },
      },
      session: {
        columns: {
          topic: true,
        },
      },
    },
    orderBy: [asc(reminders.scheduledFor)],
    limit: 100, // Process in batches
  });

  return result as Array<Reminder & { user: { email: string; name: string | null }; session: { topic: string } }>;
}

// Process and send due reminders
export async function processScheduledReminders(): Promise<{ processed: number; sent: number; failed: number }> {
  const dueReminders = await getDueReminders();

  let sent = 0;
  let failed = 0;

  for (const reminder of dueReminders) {
    try {
      // Check if user has email reminders enabled
      const prefs = await getUserPreferences(reminder.userId);
      if (prefs && !prefs.emailReminders) {
        // User has disabled reminders, mark as cancelled
        await db
          .update(reminders)
          .set({ status: 'cancelled' })
          .where(eq(reminders.id, reminder.id));
        continue;
      }

      // Generate and send email
      const emailData = generateReminderEmail({
        userName: reminder.user.name || 'there',
        sessionTopic: reminder.session.topic,
        sessionId: reminder.sessionId,
        reminderType: reminder.type,
        customMessage: reminder.message || undefined,
      });

      const result = await sendEmail({
        to: reminder.user.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });

      if (result.success) {
        await db
          .update(reminders)
          .set({ status: 'sent', sentAt: new Date() })
          .where(eq(reminders.id, reminder.id));
        sent++;
      } else {
        await db
          .update(reminders)
          .set({ status: 'failed', metadata: JSON.stringify({ error: result.error }) })
          .where(eq(reminders.id, reminder.id));
        failed++;
      }
    } catch (error) {
      console.error(`[Reminders] Failed to process reminder ${reminder.id}:`, error);
      await db
        .update(reminders)
        .set({ status: 'failed', metadata: JSON.stringify({ error: String(error) }) })
        .where(eq(reminders.id, reminder.id));
      failed++;
    }
  }

  return { processed: dueReminders.length, sent, failed };
}

// Schedule default reminders after session completion
export async function scheduleDefaultReminders(sessionId: string, userId: string): Promise<Reminder[]> {
  const prefs = await getUserPreferences(userId);
  const createdReminders: Reminder[] = [];

  const followUpDays = prefs?.defaultFollowUpDays || 7;
  const agreementCheckDays = prefs?.agreementCheckDays || 3;

  const now = new Date();

  // Schedule agreement check reminder
  const agreementCheckDate = new Date(now);
  agreementCheckDate.setDate(agreementCheckDate.getDate() + agreementCheckDays);

  const agreementReminder = await createReminder({
    userId,
    sessionId,
    type: 'agreement_check',
    scheduledFor: agreementCheckDate,
  });
  createdReminders.push(agreementReminder);

  // Schedule follow-up reminder
  const followUpDate = new Date(now);
  followUpDate.setDate(followUpDate.getDate() + followUpDays);

  const followUpReminder = await createReminder({
    userId,
    sessionId,
    type: 'follow_up',
    scheduledFor: followUpDate,
  });
  createdReminders.push(followUpReminder);

  return createdReminders;
}

// User preferences functions
export interface UserPreferencesData {
  id: string;
  userId: string;
  emailReminders: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  defaultFollowUpDays: number;
  agreementCheckDays: number;
  emailDigest: boolean;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  timezone: string | null;
}

export async function getUserPreferences(userId: string): Promise<UserPreferencesData | null> {
  const result = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });

  return result as UserPreferencesData | null;
}

export async function updateUserPreferences(
  userId: string,
  data: Partial<Omit<UserPreferencesData, 'id' | 'userId'>>
): Promise<UserPreferencesData> {
  const existing = await getUserPreferences(userId);

  if (existing) {
    const [updated] = await db
      .update(userPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning();

    return updated as UserPreferencesData;
  }

  // Create new preferences
  const [created] = await db
    .insert(userPreferences)
    .values({
      userId,
      ...data,
    })
    .returning();

  return created as UserPreferencesData;
}

export async function getOrCreateUserPreferences(userId: string): Promise<UserPreferencesData> {
  const existing = await getUserPreferences(userId);
  if (existing) return existing;

  const [created] = await db
    .insert(userPreferences)
    .values({ userId })
    .returning();

  return created as UserPreferencesData;
}
