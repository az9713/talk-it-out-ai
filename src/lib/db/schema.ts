import { pgTable, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const sessionStageEnum = pgEnum('session_stage', [
  'intake',
  'person_a_observation',
  'person_a_feeling',
  'person_a_need',
  'person_a_request',
  'reflection_a',
  'person_b_observation',
  'person_b_feeling',
  'person_b_need',
  'person_b_request',
  'reflection_b',
  'common_ground',
  'agreement',
  'complete',
]);

export const sessionStatusEnum = pgEnum('session_status', [
  'active',
  'paused',
  'completed',
  'abandoned',
]);

export const messageRoleEnum = pgEnum('message_role', [
  'user',
  'assistant',
  'system',
]);

export const partnershipStatusEnum = pgEnum('partnership_status', [
  'pending',
  'active',
  'ended',
]);

// Users table (for NextAuth)
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// NextAuth accounts table
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: timestamp('expires_at', { mode: 'date' }),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

// Partnerships table
export const partnerships = pgTable('partnerships', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user1Id: text('user1_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  user2Id: text('user2_id').references(() => users.id, { onDelete: 'set null' }),
  inviteCode: text('invite_code').notNull().unique(),
  status: partnershipStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Sessions table (conflict resolution sessions)
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  partnershipId: text('partnership_id').references(() => partnerships.id, { onDelete: 'cascade' }),
  initiatorId: text('initiator_id').notNull().references(() => users.id),
  topic: text('topic').notNull(),
  stage: sessionStageEnum('stage').default('intake').notNull(),
  status: sessionStatusEnum('status').default('active').notNull(),
  currentSpeakerId: text('current_speaker_id').references(() => users.id),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id),
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  stage: sessionStageEnum('stage').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Perspectives table (NVC components for each person)
export const perspectives = pgTable('perspectives', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  observation: text('observation'),
  feeling: text('feeling'),
  need: text('need'),
  request: text('request'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Agreements table
export const agreements = pgTable('agreements', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  agreedByUser1: boolean('agreed_by_user1').default(false).notNull(),
  agreedByUser2: boolean('agreed_by_user2').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  partnerships1: many(partnerships, { relationName: 'user1' }),
  partnerships2: many(partnerships, { relationName: 'user2' }),
  initiatedSessions: many(sessions, { relationName: 'initiator' }),
  perspectives: many(perspectives),
  messages: many(messages),
}));

export const partnershipsRelations = relations(partnerships, ({ one, many }) => ({
  user1: one(users, { fields: [partnerships.user1Id], references: [users.id], relationName: 'user1' }),
  user2: one(users, { fields: [partnerships.user2Id], references: [users.id], relationName: 'user2' }),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  partnership: one(partnerships, { fields: [sessions.partnershipId], references: [partnerships.id] }),
  initiator: one(users, { fields: [sessions.initiatorId], references: [users.id], relationName: 'initiator' }),
  currentSpeaker: one(users, { fields: [sessions.currentSpeakerId], references: [users.id] }),
  messages: many(messages),
  perspectives: many(perspectives),
  agreements: many(agreements),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(sessions, { fields: [messages.sessionId], references: [sessions.id] }),
  user: one(users, { fields: [messages.userId], references: [users.id] }),
}));

export const perspectivesRelations = relations(perspectives, ({ one }) => ({
  session: one(sessions, { fields: [perspectives.sessionId], references: [sessions.id] }),
  user: one(users, { fields: [perspectives.userId], references: [users.id] }),
}));

export const agreementsRelations = relations(agreements, ({ one }) => ({
  session: one(sessions, { fields: [agreements.sessionId], references: [sessions.id] }),
}));
