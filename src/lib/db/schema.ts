import { pgTable, text, timestamp, boolean, pgEnum, integer, real } from 'drizzle-orm/pg-core';
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

export const templateCategoryEnum = pgEnum('template_category', [
  'household',
  'finances',
  'communication',
  'parenting',
  'work',
  'boundaries',
  'intimacy',
  'other',
]);

// Mediator personality enums
export const mediatorToneEnum = pgEnum('mediator_tone', [
  'warm',
  'professional',
  'direct',
  'gentle',
]);

export const mediatorFormalityEnum = pgEnum('mediator_formality', [
  'casual',
  'balanced',
  'formal',
]);

export const mediatorResponseLengthEnum = pgEnum('mediator_response_length', [
  'concise',
  'moderate',
  'detailed',
]);

// Session mode enum
export const sessionModeEnum = pgEnum('session_mode', [
  'solo',
  'collaborative',
]);

// Participant role enum
export const participantRoleEnum = pgEnum('participant_role', [
  'initiator',
  'partner',
]);

// Reminder type enum
export const reminderTypeEnum = pgEnum('reminder_type', [
  'follow_up',
  'agreement_check',
  'custom',
]);

// Reminder status enum
export const reminderStatusEnum = pgEnum('reminder_status', [
  'pending',
  'sent',
  'cancelled',
  'failed',
]);

// Reminder frequency enum
export const reminderFrequencyEnum = pgEnum('reminder_frequency', [
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'custom',
]);

// Goal category enum
export const goalCategoryEnum = pgEnum('goal_category', [
  'communication',
  'conflict_resolution',
  'emotional_connection',
  'trust_building',
  'quality_time',
  'boundaries',
  'personal_growth',
  'other',
]);

// Goal status enum
export const goalStatusEnum = pgEnum('goal_status', [
  'active',
  'completed',
  'paused',
  'abandoned',
]);

// Phase 1 Feature Enums

// Emotion check-in type enum
export const emotionCheckInTypeEnum = pgEnum('emotion_check_in_type', [
  'pre_session',
  'post_session',
  'daily',
]);

// Session request status enum
export const sessionRequestStatusEnum = pgEnum('session_request_status', [
  'pending',
  'accepted',
  'declined',
  'rescheduled',
  'expired',
]);

// Session request urgency enum
export const sessionRequestUrgencyEnum = pgEnum('session_request_urgency', [
  'whenever',
  'soon',
  'important',
]);

// Phase 2 Feature Enums

// Conflict pattern type enum
export const patternTypeEnum = pgEnum('pattern_type', [
  'recurring_topic',
  'trigger',
  'timing',
  'communication_style',
  'escalation_pattern',
  'resolution_pattern',
  'positive_pattern',
]);

// Calming exercise type enum
export const exerciseTypeEnum = pgEnum('exercise_type', [
  'breathing',
  'grounding',
  'visualization',
  'body_scan',
]);

// Health score trend enum
export const healthTrendEnum = pgEnum('health_trend', [
  'improving',
  'stable',
  'declining',
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
  // Collaborative session fields
  sessionMode: sessionModeEnum('session_mode').default('solo').notNull(),
  inviteCode: text('invite_code').unique(),
  inviteExpiresAt: timestamp('invite_expires_at', { mode: 'date' }),
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

// Session participants table (for collaborative sessions)
export const sessionParticipants = pgTable('session_participants', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: participantRoleEnum('role').notNull(),
  displayName: text('display_name'), // Optional display name for the session
  joinedAt: timestamp('joined_at', { mode: 'date' }).defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at', { mode: 'date' }),
  isActive: boolean('is_active').default(true).notNull(),
});

// Session templates table
export const sessionTemplates = pgTable('session_templates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // null = system template
  name: text('name').notNull(),
  description: text('description'),
  category: templateCategoryEnum('category').notNull(),
  promptContext: text('prompt_context').notNull(), // Pre-filled situation description
  suggestedOpening: text('suggested_opening'), // Suggested first message
  isSystem: boolean('is_system').default(false).notNull(), // System-provided templates
  usageCount: integer('usage_count').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Mediator settings table (per-user AI personality preferences)
export const mediatorSettings = pgTable('mediator_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  tone: mediatorToneEnum('tone').default('warm').notNull(),
  formality: mediatorFormalityEnum('formality').default('balanced').notNull(),
  responseLength: mediatorResponseLengthEnum('response_length').default('moderate').notNull(),
  useEmoji: boolean('use_emoji').default(false).notNull(),
  useMetaphors: boolean('use_metaphors').default(true).notNull(),
  culturalContext: text('cultural_context'), // Optional cultural considerations
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// User preferences table (notification and reminder settings)
export const userPreferences = pgTable('user_preferences', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  emailReminders: boolean('email_reminders').default(true).notNull(),
  reminderFrequency: reminderFrequencyEnum('reminder_frequency').default('weekly').notNull(),
  defaultFollowUpDays: integer('default_follow_up_days').default(7).notNull(),
  agreementCheckDays: integer('agreement_check_days').default(3).notNull(),
  emailDigest: boolean('email_digest').default(false).notNull(), // Combine reminders into digest
  quietHoursStart: integer('quiet_hours_start'), // Hour (0-23) to start quiet hours
  quietHoursEnd: integer('quiet_hours_end'), // Hour (0-23) to end quiet hours
  timezone: text('timezone').default('UTC'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Reminders table
export const reminders = pgTable('reminders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  type: reminderTypeEnum('type').notNull(),
  status: reminderStatusEnum('status').default('pending').notNull(),
  scheduledFor: timestamp('scheduled_for', { mode: 'date' }).notNull(),
  sentAt: timestamp('sent_at', { mode: 'date' }),
  message: text('message'), // Custom reminder message
  metadata: text('metadata'), // JSON string for additional data
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Goals table
export const goals = pgTable('goals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  category: goalCategoryEnum('category').notNull(),
  status: goalStatusEnum('status').default('active').notNull(),
  targetDate: timestamp('target_date', { mode: 'date' }),
  progress: integer('progress').default(0).notNull(), // 0-100 percentage
  sessionsTarget: integer('sessions_target'), // Optional: target number of sessions
  sessionsCompleted: integer('sessions_completed').default(0).notNull(),
  celebrationShown: boolean('celebration_shown').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { mode: 'date' }),
});

// Milestones table (achievements for goals)
export const milestones = pgTable('milestones', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  goalId: text('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  targetProgress: integer('target_progress').notNull(), // Progress percentage to unlock (e.g., 25, 50, 75, 100)
  isAchieved: boolean('is_achieved').default(false).notNull(),
  achievedAt: timestamp('achieved_at', { mode: 'date' }),
  celebrationShown: boolean('celebration_shown').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ============================================
// PHASE 1 FEATURES
// ============================================

// Emotion Check-Ins table
export const emotionCheckIns = pgTable('emotion_check_ins', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }), // null for daily check-ins
  type: emotionCheckInTypeEnum('type').notNull(),
  overallMood: integer('overall_mood').notNull(), // 1-5 scale
  primaryEmotion: text('primary_emotion'), // angry, sad, anxious, happy, calm, etc.
  feelings: text('feelings'), // JSON array of feelings
  energyLevel: integer('energy_level'), // 1-5
  opennessToTalk: integer('openness_to_talk'), // 1-5
  note: text('note'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Session Preparations table
export const sessionPreparations = pgTable('session_preparations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').references(() => sessions.id, { onDelete: 'set null' }), // linked after session created
  situation: text('situation'),
  initialFeelings: text('initial_feelings'), // JSON array
  desiredOutcome: text('desired_outcome'),
  identifiedNeeds: text('identified_needs'), // JSON array
  draftOpening: text('draft_opening'),
  suggestedOpening: text('suggested_opening'), // AI-generated
  concerns: text('concerns'),
  isComplete: boolean('is_complete').default(false).notNull(),
  shareWithMediator: boolean('share_with_mediator').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Session Requests table (Partner Session Request feature)
export const sessionRequests = pgTable('session_requests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  fromUserId: text('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId: text('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  partnershipId: text('partnership_id').notNull().references(() => partnerships.id, { onDelete: 'cascade' }),
  topic: text('topic'), // optional topic hint
  urgency: sessionRequestUrgencyEnum('urgency').default('whenever').notNull(),
  message: text('message'), // optional personal message
  suggestedTimes: text('suggested_times'), // JSON array of suggested times
  status: sessionRequestStatusEnum('status').default('pending').notNull(),
  responseMessage: text('response_message'),
  scheduledFor: timestamp('scheduled_for', { mode: 'date' }),
  sessionId: text('session_id').references(() => sessions.id, { onDelete: 'set null' }), // resulting session
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  respondedAt: timestamp('responded_at', { mode: 'date' }),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
});

// ============================================
// PHASE 2 FEATURES
// ============================================

// Conflict Patterns table
export const conflictPatterns = pgTable('conflict_patterns', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  partnershipId: text('partnership_id').references(() => partnerships.id, { onDelete: 'cascade' }),
  type: patternTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  frequency: text('frequency'), // 'weekly', 'monthly', 'occasional'
  severity: integer('severity'), // 1-5
  relatedSessionIds: text('related_session_ids'), // JSON array of session IDs
  exampleQuotes: text('example_quotes'), // JSON array of anonymized quotes
  suggestions: text('suggestions'), // JSON array of actionable suggestions
  confidence: real('confidence'), // 0-1
  isAcknowledged: boolean('is_acknowledged').default(false).notNull(),
  isResolved: boolean('is_resolved').default(false).notNull(),
  detectedAt: timestamp('detected_at', { mode: 'date' }).defaultNow().notNull(),
  lastOccurrence: timestamp('last_occurrence', { mode: 'date' }),
});

// Pattern Analysis Log table
export const patternAnalysisLog = pgTable('pattern_analysis_log', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionsAnalyzed: integer('sessions_analyzed'),
  patternsFound: integer('patterns_found'),
  analyzedAt: timestamp('analyzed_at', { mode: 'date' }).defaultNow().notNull(),
});

// Health Scores table
export const healthScores = pgTable('health_scores', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  partnershipId: text('partnership_id').references(() => partnerships.id, { onDelete: 'cascade' }),
  overallScore: integer('overall_score').notNull(), // 0-100
  communicationScore: integer('communication_score'), // 0-100
  resolutionScore: integer('resolution_score'), // 0-100
  consistencyScore: integer('consistency_score'), // 0-100
  progressScore: integer('progress_score'), // 0-100
  emotionalScore: integer('emotional_score'), // 0-100
  trend: healthTrendEnum('trend'),
  trendPercentage: real('trend_percentage'),
  factors: text('factors'), // JSON detailed breakdown
  periodStart: timestamp('period_start', { mode: 'date' }).notNull(),
  periodEnd: timestamp('period_end', { mode: 'date' }).notNull(),
  calculatedAt: timestamp('calculated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Calming Exercises table
export const calmingExercises = pgTable('calming_exercises', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  type: exerciseTypeEnum('type').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  instructions: text('instructions'), // JSON step-by-step
  audioUrl: text('audio_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Exercise Completions table
export const exerciseCompletions = pgTable('exercise_completions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  exerciseId: text('exercise_id').notNull().references(() => calmingExercises.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').references(() => sessions.id, { onDelete: 'set null' }), // if done before session
  moodBefore: integer('mood_before'), // 1-5
  moodAfter: integer('mood_after'), // 1-5
  completedAt: timestamp('completed_at', { mode: 'date' }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  partnerships1: many(partnerships, { relationName: 'user1' }),
  partnerships2: many(partnerships, { relationName: 'user2' }),
  initiatedSessions: many(sessions, { relationName: 'initiator' }),
  perspectives: many(perspectives),
  messages: many(messages),
  templates: many(sessionTemplates),
  mediatorSettings: one(mediatorSettings),
  sessionParticipations: many(sessionParticipants),
  preferences: one(userPreferences),
  reminders: many(reminders),
  goals: many(goals),
  milestones: many(milestones),
  // Phase 1 relations
  emotionCheckIns: many(emotionCheckIns),
  sessionPreparations: many(sessionPreparations),
  sentSessionRequests: many(sessionRequests, { relationName: 'sentRequests' }),
  receivedSessionRequests: many(sessionRequests, { relationName: 'receivedRequests' }),
  // Phase 2 relations
  conflictPatterns: many(conflictPatterns),
  healthScores: many(healthScores),
  exerciseCompletions: many(exerciseCompletions),
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
  participants: many(sessionParticipants),
  reminders: many(reminders),
  // Phase 1 relations
  emotionCheckIns: many(emotionCheckIns),
  preparations: many(sessionPreparations),
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

export const sessionParticipantsRelations = relations(sessionParticipants, ({ one }) => ({
  session: one(sessions, { fields: [sessionParticipants.sessionId], references: [sessions.id] }),
  user: one(users, { fields: [sessionParticipants.userId], references: [users.id] }),
}));

export const sessionTemplatesRelations = relations(sessionTemplates, ({ one }) => ({
  user: one(users, { fields: [sessionTemplates.userId], references: [users.id] }),
}));

export const mediatorSettingsRelations = relations(mediatorSettings, ({ one }) => ({
  user: one(users, { fields: [mediatorSettings.userId], references: [users.id] }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(users, { fields: [reminders.userId], references: [users.id] }),
  session: one(sessions, { fields: [reminders.sessionId], references: [sessions.id] }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
  milestones: many(milestones),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  goal: one(goals, { fields: [milestones.goalId], references: [goals.id] }),
  user: one(users, { fields: [milestones.userId], references: [users.id] }),
}));

// Phase 1 Relations

export const emotionCheckInsRelations = relations(emotionCheckIns, ({ one }) => ({
  user: one(users, { fields: [emotionCheckIns.userId], references: [users.id] }),
  session: one(sessions, { fields: [emotionCheckIns.sessionId], references: [sessions.id] }),
}));

export const sessionPreparationsRelations = relations(sessionPreparations, ({ one }) => ({
  user: one(users, { fields: [sessionPreparations.userId], references: [users.id] }),
  session: one(sessions, { fields: [sessionPreparations.sessionId], references: [sessions.id] }),
}));

export const sessionRequestsRelations = relations(sessionRequests, ({ one }) => ({
  fromUser: one(users, { fields: [sessionRequests.fromUserId], references: [users.id], relationName: 'sentRequests' }),
  toUser: one(users, { fields: [sessionRequests.toUserId], references: [users.id], relationName: 'receivedRequests' }),
  partnership: one(partnerships, { fields: [sessionRequests.partnershipId], references: [partnerships.id] }),
  session: one(sessions, { fields: [sessionRequests.sessionId], references: [sessions.id] }),
}));

// Phase 2 Relations

export const conflictPatternsRelations = relations(conflictPatterns, ({ one }) => ({
  user: one(users, { fields: [conflictPatterns.userId], references: [users.id] }),
  partnership: one(partnerships, { fields: [conflictPatterns.partnershipId], references: [partnerships.id] }),
}));

export const patternAnalysisLogRelations = relations(patternAnalysisLog, ({ one }) => ({
  user: one(users, { fields: [patternAnalysisLog.userId], references: [users.id] }),
}));

export const healthScoresRelations = relations(healthScores, ({ one }) => ({
  user: one(users, { fields: [healthScores.userId], references: [users.id] }),
  partnership: one(partnerships, { fields: [healthScores.partnershipId], references: [partnerships.id] }),
}));

export const calmingExercisesRelations = relations(calmingExercises, ({ many }) => ({
  completions: many(exerciseCompletions),
}));

export const exerciseCompletionsRelations = relations(exerciseCompletions, ({ one }) => ({
  user: one(users, { fields: [exerciseCompletions.userId], references: [users.id] }),
  exercise: one(calmingExercises, { fields: [exerciseCompletions.exerciseId], references: [calmingExercises.id] }),
  session: one(sessions, { fields: [exerciseCompletions.sessionId], references: [sessions.id] }),
}));
