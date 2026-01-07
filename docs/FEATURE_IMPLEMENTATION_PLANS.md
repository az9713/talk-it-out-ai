# Feature Implementation Plans

This document contains detailed implementation plans for 10 feature enhancements to Talk-It-Out-AI.

---

## Table of Contents

1. [Real-Time Messaging with WebSockets](#1-real-time-messaging-with-websockets)
2. [Session Export & Summary Reports](#2-session-export--summary-reports)
3. [Two-Person Collaborative Sessions](#3-two-person-collaborative-sessions)
4. [Session Analytics Dashboard](#4-session-analytics-dashboard)
5. [Saved Templates & Quick Starts](#5-saved-templates--quick-starts)
6. [Voice Input & Audio Messages](#6-voice-input--audio-messages)
7. [Reflection Reminders & Follow-ups](#7-reflection-reminders--follow-ups)
8. [AI-Generated Insights & Patterns](#8-ai-generated-insights--patterns)
9. [Customizable AI Mediator Personality](#9-customizable-ai-mediator-personality)
10. [Mobile Push Notifications & PWA](#10-mobile-push-notifications--pwa)

---

## 1. Real-Time Messaging with WebSockets

### Overview
Replace polling-based updates with WebSocket connections for instant message delivery, typing indicators, and presence detection.

### Technical Approach
Use **Pusher** (recommended for serverless) or **Socket.io** with a custom server. Pusher is preferred because Next.js API routes are serverless and don't support persistent WebSocket connections natively.

### Dependencies to Add
```bash
npm install pusher pusher-js
```

### Database Changes
None required - uses existing messages table.

### New Files to Create

#### `src/lib/pusher.ts` - Pusher Configuration
```typescript
// Server-side Pusher instance
import Pusher from 'pusher';

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Channel naming convention
export const getSessionChannel = (sessionId: string) => `session-${sessionId}`;
```

#### `src/lib/pusher-client.ts` - Client-side Pusher
```typescript
import PusherClient from 'pusher-js';

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER! }
);
```

#### `src/hooks/use-realtime-messages.ts` - React Hook
```typescript
// Hook for subscribing to real-time message updates
// Handles: new-message, typing-start, typing-stop, user-joined events
```

### Files to Modify

#### `src/app/api/sessions/[id]/messages/route.ts`
- After saving message to DB, trigger Pusher event:
```typescript
await pusher.trigger(getSessionChannel(sessionId), 'new-message', {
  message: savedMessage,
  sender: session.user.id,
});
```

#### `src/app/(dashboard)/dashboard/sessions/[id]/page.tsx`
- Add `useRealtimeMessages` hook
- Subscribe to session channel on mount
- Handle incoming messages and update state
- Add typing indicator UI component

### New API Endpoints

#### `POST /api/sessions/[id]/typing`
```typescript
// Broadcast typing status to other session participants
// Body: { isTyping: boolean }
```

### Environment Variables to Add
```
PUSHER_APP_ID=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
```

### Implementation Steps
1. Create Pusher account and app (free tier available)
2. Add environment variables
3. Create `src/lib/pusher.ts` and `src/lib/pusher-client.ts`
4. Create `useRealtimeMessages` hook
5. Modify messages API to trigger Pusher events
6. Add typing indicator API endpoint
7. Update session chat page to use real-time hook
8. Add typing indicator UI component
9. Test with multiple browser windows

### Estimated Complexity: High
### Files Changed: 5-7

---

## 2. Session Export & Summary Reports

### Overview
Allow users to export completed sessions as PDF or Markdown documents with full conversation transcripts, NVC breakdowns, and agreements.

### Technical Approach
Use **@react-pdf/renderer** for PDF generation (runs on server) or **jsPDF** (client-side). Recommend server-side for better formatting control.

### Dependencies to Add
```bash
npm install @react-pdf/renderer
```

### Database Changes
None required - uses existing data.

### New Files to Create

#### `src/lib/export/pdf-template.tsx` - PDF Document Template
```typescript
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles for:
// - Header with session title and date
// - Conversation transcript with role styling
// - NVC Perspectives section (observation, feeling, need, request)
// - Agreements section
// - Footer with generation timestamp
```

#### `src/lib/export/markdown-template.ts` - Markdown Generator
```typescript
export function generateSessionMarkdown(session: SessionWithDetails): string {
  // Generate structured markdown with:
  // - Session metadata header
  // - Conversation transcript
  // - NVC breakdown tables
  // - Agreements list
}
```

#### `src/app/api/sessions/[id]/export/route.ts` - Export API
```typescript
// GET /api/sessions/[id]/export?format=pdf|markdown
// Returns: PDF blob or markdown text file
```

### Files to Modify

#### `src/app/(dashboard)/dashboard/sessions/[id]/page.tsx`
- Add "Export" dropdown button with PDF/Markdown options
- Handle download initiation

#### `src/services/session.ts`
- Add `getSessionForExport()` function that fetches all related data:
  - Messages with timestamps
  - Perspectives for all participants
  - Agreements
  - Partnership details

### New UI Components

#### `src/components/export-button.tsx`
```typescript
// Dropdown button with:
// - "Export as PDF" option
// - "Export as Markdown" option
// - Loading state during generation
```

### Implementation Steps
1. Install @react-pdf/renderer
2. Create PDF template component with styling
3. Create markdown template function
4. Add export API endpoint
5. Add `getSessionForExport` service function
6. Create ExportButton component
7. Add export button to session detail page
8. Test PDF generation with various session lengths
9. Add error handling for failed exports

### Estimated Complexity: Low-Medium
### Files Changed: 5-6

---

## 3. Two-Person Collaborative Sessions

### Overview
Enable both partners to participate in the same session simultaneously, with the AI mediating between them in real-time.

### Technical Approach
Extend existing session model to support multiple active participants. Requires real-time messaging (Feature #1) as a prerequisite.

### Dependencies
- Requires Feature #1 (Real-Time Messaging) first

### Database Changes

#### Modify `src/lib/db/schema.ts`

```typescript
// Add session_participants table
export const sessionParticipants = pgTable('session_participants', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role', { enum: ['initiator', 'partner'] }).notNull(),
  joinedAt: timestamp('joined_at').defaultNow(),
  lastSeenAt: timestamp('last_seen_at'),
  isActive: boolean('is_active').default(true),
});

// Modify messages table - add senderId
export const messages = pgTable('messages', {
  // ... existing fields
  senderId: text('sender_id').references(() => users.id), // NEW: track who sent
});

// Modify sessions table
export const sessions = pgTable('sessions', {
  // ... existing fields
  sessionMode: text('session_mode', {
    enum: ['solo', 'collaborative']
  }).default('solo'),
  inviteCode: text('invite_code').unique(), // For partner to join
  inviteExpiresAt: timestamp('invite_expires_at'),
});
```

### New Files to Create

#### `src/services/session-participants.ts`
```typescript
export async function addParticipant(sessionId: string, userId: string, role: string);
export async function getSessionParticipants(sessionId: string);
export async function updateLastSeen(sessionId: string, userId: string);
export async function generateSessionInvite(sessionId: string): Promise<string>;
export async function joinSessionByInvite(inviteCode: string, userId: string);
```

#### `src/app/api/sessions/[id]/invite/route.ts`
```typescript
// POST - Generate invite link for session
// Returns: { inviteCode, inviteUrl, expiresAt }
```

#### `src/app/api/sessions/join/route.ts`
```typescript
// POST - Join session via invite code
// Body: { inviteCode: string }
```

#### `src/app/(dashboard)/dashboard/sessions/join/page.tsx`
```typescript
// Page for joining a session via invite link
// URL: /dashboard/sessions/join?code=XXXXX
```

#### `src/components/session-invite-dialog.tsx`
```typescript
// Dialog showing invite link with copy button
// Shows QR code for easy mobile sharing
```

#### `src/components/participant-presence.tsx`
```typescript
// Shows who's in the session
// Avatar bubbles with online/offline status
// "Partner is typing..." indicator
```

### Files to Modify

#### `src/lib/ai/prompts.ts`
- Add collaborative session prompts
- Modify stage prompts to address both participants
- Add turn-management prompts ("Let's hear from [Partner] now...")

#### `src/lib/ai/index.ts`
- Modify `generateResponse` to handle two-person context
- Track whose "turn" it is in the NVC process
- Generate prompts that invite the other person to respond

#### `src/app/(dashboard)/dashboard/sessions/[id]/page.tsx`
- Show participant presence indicators
- Different message styling for each participant
- Invite partner button for solo sessions

#### `src/app/api/sessions/[id]/messages/route.ts`
- Include senderId in message creation
- Broadcast to all participants via Pusher

### New UI Components

#### Split-view layout option
```typescript
// Optional side-by-side view showing:
// - Left: Person A's perspective journey
// - Right: Person B's perspective journey
// - Center: Shared conversation
```

### Implementation Steps
1. Run database migration for new tables/columns
2. Create session-participants service
3. Add invite generation and join APIs
4. Create join session page
5. Update AI prompts for collaborative mode
6. Modify generateResponse for two-person context
7. Add participant presence component
8. Update session page with invite button
9. Implement turn-based prompting logic
10. Add presence tracking via Pusher
11. Test full collaborative flow

### Estimated Complexity: High
### Files Changed: 12-15
### Prerequisite: Feature #1

---

## 4. Session Analytics Dashboard

### Overview
Provide users with insights into their conflict resolution patterns, progress over time, and relationship health metrics.

### Technical Approach
Create aggregation queries and a new analytics page with charts using **Recharts** library.

### Dependencies to Add
```bash
npm install recharts
```

### Database Changes
None required - analytics derived from existing data.

### New Files to Create

#### `src/services/analytics.ts`
```typescript
export async function getSessionAnalytics(userId: string) {
  return {
    // Session metrics
    totalSessions: number,
    completedSessions: number,
    abandonedSessions: number,
    completionRate: number,

    // Time metrics
    averageSessionDuration: number, // minutes
    averageMessagesPerSession: number,

    // Trend data (last 6 months)
    sessionsOverTime: { month: string, count: number }[],

    // NVC insights
    mostCommonFeelings: { feeling: string, count: number }[],
    mostCommonNeeds: { need: string, count: number }[],

    // Partner metrics
    sessionsByPartner: { partnerName: string, count: number }[],
  };
}

export async function getSessionTimeline(userId: string) {
  // Returns sessions with key milestones for timeline view
}
```

#### `src/app/(dashboard)/dashboard/analytics/page.tsx`
```typescript
// Analytics dashboard page with:
// - Summary cards (completion rate, avg duration, total sessions)
// - Line chart: Sessions over time
// - Pie chart: Session outcomes (completed/paused/abandoned)
// - Bar chart: Sessions by partner
// - Word cloud or list: Common feelings/needs identified
```

#### `src/app/api/analytics/route.ts`
```typescript
// GET /api/analytics
// Returns aggregated analytics data for current user
```

#### `src/components/analytics/` directory
```typescript
// stats-card.tsx - Individual metric card
// sessions-chart.tsx - Line chart component
// outcomes-pie.tsx - Pie chart for session outcomes
// feelings-cloud.tsx - Visual display of common feelings
// needs-list.tsx - Ranked list of identified needs
```

### Files to Modify

#### `src/components/dashboard-nav.tsx`
- Add "Analytics" link to navigation

#### `src/lib/db/schema.ts`
- Add index on sessions.createdAt for faster time-based queries
- Add index on perspectives for aggregation queries

### Implementation Steps
1. Install recharts
2. Create analytics service with aggregation queries
3. Create analytics API endpoint
4. Build individual chart components
5. Create analytics page layout
6. Add navigation link
7. Add database indexes for performance
8. Test with various data volumes
9. Add loading states and empty states

### Estimated Complexity: Medium
### Files Changed: 8-10

---

## 5. Saved Templates & Quick Starts

### Overview
Allow users to save common conflict scenarios as templates and quickly start new sessions with pre-filled context.

### Technical Approach
Create a templates system with both system-provided and user-created templates.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const sessionTemplates = pgTable('session_templates', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id), // null = system template
  name: text('name').notNull(),
  description: text('description'),
  category: text('category', {
    enum: ['household', 'finances', 'communication', 'parenting', 'work', 'other']
  }).notNull(),
  promptContext: text('prompt_context').notNull(), // Pre-filled situation
  suggestedOpening: text('suggested_opening'), // Suggested first message
  isPublic: boolean('is_public').default(false),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### New Files to Create

#### `src/services/templates.ts`
```typescript
export async function getSystemTemplates(): Promise<Template[]>;
export async function getUserTemplates(userId: string): Promise<Template[]>;
export async function createTemplate(userId: string, data: CreateTemplateInput);
export async function updateTemplate(templateId: string, data: UpdateTemplateInput);
export async function deleteTemplate(templateId: string);
export async function incrementUsageCount(templateId: string);
```

#### `src/app/api/templates/route.ts`
```typescript
// GET - List templates (system + user's own)
// POST - Create new template
```

#### `src/app/api/templates/[id]/route.ts`
```typescript
// GET - Get single template
// PUT - Update template
// DELETE - Delete template
```

#### `src/app/(dashboard)/dashboard/templates/page.tsx`
```typescript
// Templates management page
// - Grid of template cards organized by category
// - "Create Template" button
// - Edit/delete user's own templates
```

#### `src/app/(dashboard)/dashboard/sessions/new/page.tsx` (modify significantly)
```typescript
// Enhanced new session flow:
// Step 1: Choose template OR start blank
// Step 2: Review/edit pre-filled context
// Step 3: Select partner (optional)
// Step 4: Start session
```

#### `src/components/template-card.tsx`
```typescript
// Card displaying template with:
// - Name and category badge
// - Description preview
// - "Use Template" button
// - Edit/delete for user's own
```

#### `src/components/template-picker-dialog.tsx`
```typescript
// Dialog for selecting template when creating session
// Filterable by category
// Search functionality
```

### Seed Data

#### `src/lib/db/seed-templates.ts`
```typescript
// System templates to seed:
const systemTemplates = [
  {
    name: "Household Chores Division",
    category: "household",
    promptContext: "We need to discuss how household responsibilities are divided...",
    suggestedOpening: "I'd like to talk about how we share chores because..."
  },
  {
    name: "Financial Decisions",
    category: "finances",
    promptContext: "We have different views on a financial decision...",
    suggestedOpening: "I want to discuss our approach to..."
  },
  {
    name: "Feeling Unheard",
    category: "communication",
    promptContext: "I often feel like my perspective isn't being heard...",
    suggestedOpening: "Sometimes when we talk, I feel..."
  },
  // ... 10-15 more templates
];
```

### Files to Modify

#### `src/app/api/sessions/route.ts`
- Accept optional `templateId` in POST body
- Pre-populate session context from template
- Increment template usage count

### Implementation Steps
1. Add sessionTemplates table to schema
2. Run database migration
3. Create templates service
4. Create templates API endpoints
5. Create seed data and seeding script
6. Build template card component
7. Build template picker dialog
8. Modify new session page for template selection
9. Create templates management page
10. Add navigation link to templates
11. Test template creation and usage flow

### Estimated Complexity: Low-Medium
### Files Changed: 10-12

---

## 6. Voice Input & Audio Messages

### Overview
Allow users to speak their messages using speech-to-text, reducing friction for emotional conversations.

### Technical Approach
Use the **Web Speech API** (browser-native, free) for speech-to-text. For broader compatibility, offer **Whisper API** as fallback.

### Dependencies to Add
```bash
npm install openai  # For Whisper API fallback (optional)
```

### Database Changes

#### Modify `src/lib/db/schema.ts`
```typescript
// Add to messages table
export const messages = pgTable('messages', {
  // ... existing fields
  audioUrl: text('audio_url'), // Optional: store audio recording
  transcriptionSource: text('transcription_source', {
    enum: ['manual', 'web_speech', 'whisper']
  }),
});
```

### New Files to Create

#### `src/hooks/use-speech-recognition.ts`
```typescript
export function useSpeechRecognition() {
  // State: isListening, transcript, error, isSupported
  // Methods: startListening, stopListening, resetTranscript

  // Uses Web Speech API (SpeechRecognition)
  // Handles browser compatibility
  // Provides real-time transcript updates
}
```

#### `src/hooks/use-audio-recorder.ts`
```typescript
export function useAudioRecorder() {
  // State: isRecording, audioBlob, duration
  // Methods: startRecording, stopRecording, clearRecording

  // Uses MediaRecorder API
  // Outputs audio blob for upload or Whisper transcription
}
```

#### `src/lib/speech/whisper.ts` (optional)
```typescript
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // Upload to Whisper API
  // Return transcribed text
}
```

#### `src/app/api/transcribe/route.ts` (optional)
```typescript
// POST - Transcribe audio using Whisper
// Body: FormData with audio file
// Returns: { text: string }
```

#### `src/components/voice-input-button.tsx`
```typescript
// Microphone button component
// States: idle, listening, processing
// Visual feedback: pulsing animation when listening
// Waveform visualization (optional)
```

#### `src/components/audio-player.tsx` (if storing audio)
```typescript
// Mini audio player for voice messages
// Play/pause, duration, waveform
```

### Files to Modify

#### `src/app/(dashboard)/dashboard/sessions/[id]/page.tsx`
- Add VoiceInputButton next to send button
- Handle transcript insertion into message input
- Show recording indicator

#### Message input area enhancement
```typescript
// New input layout:
// [Message textarea                    ] [🎤] [Send]
//
// When recording:
// [🔴 Recording... (00:05)  [Stop] [Cancel]]
```

### Browser Compatibility Notes
```typescript
// Web Speech API support:
// - Chrome: Full support
// - Edge: Full support
// - Safari: Partial (macOS/iOS)
// - Firefox: Not supported
//
// For Firefox users, show Whisper fallback option
// or gracefully hide voice input feature
```

### Implementation Steps
1. Create useSpeechRecognition hook
2. Create useAudioRecorder hook (for Whisper fallback)
3. Build VoiceInputButton component
4. Add voice button to session chat UI
5. Handle transcript insertion into textarea
6. Add browser compatibility detection
7. (Optional) Implement Whisper API fallback
8. (Optional) Add audio message storage
9. Test across browsers
10. Add accessibility labels

### Estimated Complexity: Medium-High
### Files Changed: 6-8

---

## 7. Reflection Reminders & Follow-ups

### Overview
Help users maintain progress by sending reminders to check on agreements and offering follow-up sessions.

### Technical Approach
Use a scheduled job system. For serverless (Vercel), use **Vercel Cron** or **Upstash QStash**. Store reminder preferences and send via email.

### Dependencies to Add
```bash
npm install @upstash/qstash resend  # or nodemailer
```

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const reminders = pgTable('reminders', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  type: text('type', {
    enum: ['follow_up', 'agreement_check', 'custom']
  }).notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  sentAt: timestamp('sent_at'),
  status: text('status', {
    enum: ['pending', 'sent', 'cancelled', 'failed']
  }).default('pending'),
  message: text('message'), // Custom reminder message
  createdAt: timestamp('created_at').defaultNow(),
});

export const userPreferences = pgTable('user_preferences', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id).unique(),
  emailReminders: boolean('email_reminders').default(true),
  reminderFrequency: text('reminder_frequency', {
    enum: ['daily', 'weekly', 'custom']
  }).default('weekly'),
  defaultFollowUpDays: integer('default_follow_up_days').default(7),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### New Files to Create

#### `src/lib/email/index.ts`
```typescript
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReminderEmail(
  to: string,
  sessionTitle: string,
  reminderType: string,
  sessionUrl: string
);
```

#### `src/lib/email/templates/reminder.tsx`
```typescript
// React Email template for reminder emails
// Includes: greeting, session context, CTA button, unsubscribe link
```

#### `src/services/reminders.ts`
```typescript
export async function createReminder(data: CreateReminderInput);
export async function getUpcomingReminders(userId: string);
export async function cancelReminder(reminderId: string);
export async function processScheduledReminders(); // Called by cron
export async function scheduleDefaultReminders(sessionId: string); // After session completion
```

#### `src/app/api/reminders/route.ts`
```typescript
// GET - List user's reminders
// POST - Create custom reminder
```

#### `src/app/api/reminders/[id]/route.ts`
```typescript
// DELETE - Cancel reminder
```

#### `src/app/api/cron/reminders/route.ts`
```typescript
// GET - Process due reminders (called by Vercel Cron)
// Secured with CRON_SECRET
export async function GET(request: Request) {
  // Verify cron secret
  // Find reminders where scheduledFor <= now AND status = 'pending'
  // Send emails
  // Update status to 'sent'
}
```

#### `vercel.json` (add cron configuration)
```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "0 9 * * *"
  }]
}
```

#### `src/app/(dashboard)/dashboard/sessions/[id]/reminders/page.tsx`
```typescript
// Manage reminders for a specific session
// - List scheduled reminders
// - Add custom reminder
// - Cancel reminders
```

#### `src/components/reminder-scheduler.tsx`
```typescript
// Component for scheduling a new reminder
// Date picker + time selector
// Preset options: "Tomorrow", "In 3 days", "In 1 week", "In 1 month"
```

### Files to Modify

#### `src/app/(dashboard)/dashboard/settings/page.tsx`
- Add reminder preferences section
- Email notification toggles
- Default follow-up timing

#### `src/app/api/sessions/[id]/messages/route.ts`
- When session completes (stage = 'complete'), auto-schedule follow-up reminders

#### `src/app/(dashboard)/dashboard/sessions/[id]/page.tsx`
- Add "Schedule Reminder" button for completed sessions
- Show upcoming reminders

### Environment Variables to Add
```
RESEND_API_KEY=
CRON_SECRET=
```

### Implementation Steps
1. Add database tables and migrate
2. Set up Resend account and verify domain
3. Create email template
4. Create reminders service
5. Create reminder API endpoints
6. Set up Vercel Cron job
7. Add auto-scheduling after session completion
8. Build reminder scheduler component
9. Add reminders section to session page
10. Add preferences to settings page
11. Test email delivery
12. Add unsubscribe handling

### Estimated Complexity: Medium
### Files Changed: 12-15

---

## 8. AI-Generated Insights & Patterns

### Overview
Analyze user's session history to identify communication patterns, recurring themes, and provide personalized growth suggestions.

### Technical Approach
Use Claude to analyze aggregated session data and generate insights. Run analysis on-demand or periodically.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const userInsights = pgTable('user_insights', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type', {
    enum: ['communication_pattern', 'recurring_need', 'growth_area', 'strength', 'relationship_health']
  }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  confidence: real('confidence'), // 0-1 confidence score
  supportingData: jsonb('supporting_data'), // References to sessions/messages
  generatedAt: timestamp('generated_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // Insights can become stale
  isRead: boolean('is_read').default(false),
});

export const insightGenerationLog = pgTable('insight_generation_log', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  sessionsAnalyzed: integer('sessions_analyzed'),
  generatedAt: timestamp('generated_at').defaultNow(),
  status: text('status', { enum: ['success', 'failed', 'insufficient_data'] }),
});
```

### New Files to Create

#### `src/lib/ai/insights.ts`
```typescript
const INSIGHTS_PROMPT = `You are analyzing a user's conflict resolution session history...`;

export async function generateUserInsights(userId: string): Promise<Insight[]> {
  // 1. Fetch user's completed sessions (last 3 months)
  // 2. Aggregate perspectives (feelings, needs, requests)
  // 3. Compile conversation patterns
  // 4. Send to Claude for analysis
  // 5. Parse and store insights
}

export async function analyzeRelationshipHealth(
  userId: string,
  partnerId: string
): Promise<RelationshipInsight>;
```

#### `src/lib/ai/prompts/insights-prompt.ts`
```typescript
export const INSIGHTS_SYSTEM_PROMPT = `
You are an expert relationship counselor and communication analyst.
Analyze the following session history and identify:

1. COMMUNICATION PATTERNS
   - How does the user typically express themselves?
   - Do they lead with feelings, observations, or requests?
   - Are there defensive patterns?

2. RECURRING THEMES
   - What needs come up repeatedly?
   - What feelings are most common?
   - Are certain topics frequent sources of conflict?

3. GROWTH AREAS
   - Where could the user improve their communication?
   - What NVC skills need more practice?

4. STRENGTHS
   - What does the user do well?
   - What progress have they made?

5. RELATIONSHIP HEALTH (if partner data available)
   - Overall trajectory: improving, stable, or declining?
   - Balance of expression between partners

Return insights as JSON array...
`;
```

#### `src/services/insights.ts`
```typescript
export async function getUserInsights(userId: string);
export async function generateInsights(userId: string);
export async function markInsightRead(insightId: string);
export async function getLatestGenerationDate(userId: string);
export async function hasEnoughDataForInsights(userId: string): boolean;
```

#### `src/app/api/insights/route.ts`
```typescript
// GET - Fetch user's insights
// POST - Trigger insight generation
```

#### `src/app/api/insights/generate/route.ts`
```typescript
// POST - Generate new insights (rate limited)
// Requires minimum 3 completed sessions
```

#### `src/app/(dashboard)/dashboard/insights/page.tsx`
```typescript
// Insights dashboard showing:
// - Overall relationship health score (if applicable)
// - Communication pattern insights
// - Recurring needs/feelings visualization
// - Growth suggestions with actionable tips
// - "Generate New Insights" button
```

#### `src/components/insights/`
```typescript
// insight-card.tsx - Individual insight display
// health-score.tsx - Visual health indicator
// pattern-chart.tsx - Communication pattern visualization
// growth-tips.tsx - Actionable improvement suggestions
```

### Files to Modify

#### `src/components/dashboard-nav.tsx`
- Add "Insights" link with notification badge for unread insights

#### `src/app/(dashboard)/dashboard/page.tsx`
- Add insights preview/summary card

### Implementation Steps
1. Add database tables and migrate
2. Create insights prompt engineering
3. Build insight generation logic
4. Create insights service
5. Create API endpoints
6. Build insights page UI
7. Create visualization components
8. Add to navigation
9. Implement rate limiting (1 generation per week?)
10. Test with various session histories
11. Add "insufficient data" state handling

### Estimated Complexity: High
### Files Changed: 10-12

---

## 9. Customizable AI Mediator Personality

### Overview
Allow users to customize the AI mediator's communication style to match their preferences.

### Technical Approach
Store personality preferences and dynamically modify the system prompt based on settings.

### Database Changes

#### Modify `user_preferences` table (from Feature #7) or create new
```typescript
// Add to userPreferences or create mediatorSettings
export const mediatorSettings = pgTable('mediator_settings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id).unique(),

  // Tone settings
  tone: text('tone', {
    enum: ['warm', 'professional', 'direct', 'gentle']
  }).default('warm'),

  // Formality
  formality: text('formality', {
    enum: ['casual', 'balanced', 'formal']
  }).default('balanced'),

  // Response length preference
  responseLength: text('response_length', {
    enum: ['concise', 'moderate', 'detailed']
  }).default('moderate'),

  // Communication style
  useEmoji: boolean('use_emoji').default(false),
  useMetaphors: boolean('use_metaphors').default(true),

  // Cultural considerations
  culturalContext: text('cultural_context'), // Free text for specific needs

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### New Files to Create

#### `src/lib/ai/personality.ts`
```typescript
export interface MediatorPersonality {
  tone: 'warm' | 'professional' | 'direct' | 'gentle';
  formality: 'casual' | 'balanced' | 'formal';
  responseLength: 'concise' | 'moderate' | 'detailed';
  useEmoji: boolean;
  useMetaphors: boolean;
  culturalContext?: string;
}

export function buildPersonalityPrompt(settings: MediatorPersonality): string {
  // Generate prompt modifiers based on settings
  let prompt = '';

  // Tone modifiers
  const tonePrompts = {
    warm: 'Use a warm, empathetic tone. Express genuine care and understanding.',
    professional: 'Maintain a professional, composed tone. Be supportive but businesslike.',
    direct: 'Be direct and straightforward. Get to the point while remaining respectful.',
    gentle: 'Use an especially gentle, nurturing tone. Be extra careful with sensitive topics.',
  };

  // ... build full personality prompt
  return prompt;
}

export const DEFAULT_PERSONALITY: MediatorPersonality = {
  tone: 'warm',
  formality: 'balanced',
  responseLength: 'moderate',
  useEmoji: false,
  useMetaphors: true,
};
```

#### `src/services/mediator-settings.ts`
```typescript
export async function getMediatorSettings(userId: string);
export async function updateMediatorSettings(userId: string, settings: Partial<MediatorPersonality>);
export async function resetToDefaults(userId: string);
```

#### `src/app/api/settings/mediator/route.ts`
```typescript
// GET - Get current mediator settings
// PUT - Update mediator settings
```

#### `src/app/(dashboard)/dashboard/settings/mediator/page.tsx`
```typescript
// Mediator customization page with:
// - Tone selector (radio buttons with descriptions)
// - Formality slider
// - Response length preference
// - Toggle switches for emoji/metaphors
// - Preview of how the mediator will respond
// - Reset to defaults button
```

#### `src/components/personality-preview.tsx`
```typescript
// Shows example mediator responses with current settings
// Updates in real-time as settings change
```

### Files to Modify

#### `src/lib/ai/index.ts`
```typescript
// Modify generateResponse to include personality
export async function generateResponse(
  sessionId: string,
  messages: Message[],
  stage: string,
  userId: string // Add this to fetch personality
) {
  const personality = await getMediatorSettings(userId);
  const personalityPrompt = buildPersonalityPrompt(personality);

  // Inject personality into system prompt
  const systemPrompt = SYSTEM_PROMPT + '\n\n' + personalityPrompt;
  // ...
}
```

#### `src/lib/ai/prompts.ts`
- Refactor to accept personality modifiers
- Make base prompts more modular

#### `src/app/(dashboard)/dashboard/settings/page.tsx`
- Add link to mediator settings section

### Example Personality Prompts
```typescript
// Warm + Casual + Concise
"Respond in a warm, friendly way - like a caring friend who happens to be great at communication. Keep it casual and brief. Use simple language."

// Professional + Formal + Detailed
"Maintain a professional counselor's demeanor. Use proper, formal language. Provide thorough explanations and context for your guidance."

// Direct + Balanced + Moderate
"Be straightforward and get to the point. Don't over-explain, but ensure clarity. Balance warmth with efficiency."
```

### Implementation Steps
1. Add mediator_settings table and migrate
2. Create personality prompt builder
3. Create mediator settings service
4. Create API endpoint
5. Modify generateResponse to use personality
6. Build settings page UI
7. Create personality preview component
8. Add real-time preview functionality
9. Test various personality combinations
10. Fine-tune prompt modifiers based on testing

### Estimated Complexity: Medium
### Files Changed: 8-10

---

## 10. Mobile Push Notifications & PWA

### Overview
Transform the app into a Progressive Web App with push notifications for partner responses, session updates, and reminders.

### Technical Approach
Use **Service Workers** for PWA functionality and **Web Push API** with **web-push** library for notifications.

### Dependencies to Add
```bash
npm install web-push
```

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(), // Public key
  auth: text('auth').notNull(), // Auth secret
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
  lastUsed: timestamp('last_used'),
});
```

### New Files to Create

#### `public/manifest.json` - PWA Manifest
```json
{
  "name": "Talk It Out AI",
  "short_name": "TalkItOut",
  "description": "AI-powered conflict resolution",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#7c3aed",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### `public/sw.js` - Service Worker
```javascript
// Cache strategies for:
// - Static assets (cache-first)
// - API routes (network-first)
// - Pages (stale-while-revalidate)

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: { url: data.url },
  });
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

#### `src/lib/push/index.ts`
```typescript
import webPush from 'web-push';

webPush.setVapidDetails(
  'mailto:support@talkitout.ai',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushNotification(
  userId: string,
  notification: { title: string; body: string; url: string }
);

export async function sendToAllUserDevices(userId: string, notification: Notification);
```

#### `src/hooks/use-push-notifications.ts`
```typescript
export function usePushNotifications() {
  // State: isSupported, isSubscribed, permission
  // Methods: subscribe, unsubscribe, requestPermission

  // Handles:
  // - Checking browser support
  // - Requesting notification permission
  // - Registering service worker
  // - Creating push subscription
  // - Sending subscription to server
}
```

#### `src/hooks/use-service-worker.ts`
```typescript
export function useServiceWorker() {
  // Registers service worker on mount
  // Handles updates
  // Provides update prompt functionality
}
```

#### `src/services/push-subscriptions.ts`
```typescript
export async function saveSubscription(userId: string, subscription: PushSubscription);
export async function removeSubscription(endpoint: string);
export async function getUserSubscriptions(userId: string);
```

#### `src/app/api/push/subscribe/route.ts`
```typescript
// POST - Save push subscription
// Body: { subscription: PushSubscriptionJSON }
```

#### `src/app/api/push/unsubscribe/route.ts`
```typescript
// POST - Remove push subscription
// Body: { endpoint: string }
```

#### `src/components/pwa-install-prompt.tsx`
```typescript
// Shows install prompt for PWA
// Detects if app is installable
// Handles beforeinstallprompt event
```

#### `src/components/notification-permission.tsx`
```typescript
// UI for requesting notification permission
// Shows in settings or as banner
// Explains benefits of enabling
```

### Files to Modify

#### `src/app/layout.tsx`
- Add manifest link
- Add theme-color meta tag
- Register service worker

```typescript
// Add to head
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#7c3aed" />
```

#### `src/app/(dashboard)/dashboard/settings/page.tsx`
- Add push notification toggle
- Show subscription status

#### `src/app/api/sessions/[id]/messages/route.ts`
- After saving AI response, send push to partner (if collaborative session)

#### Feature #7's reminder cron
- Send push notification in addition to email

### PWA Icons to Create
```
public/icons/
├── icon-72.png
├── icon-96.png
├── icon-128.png
├── icon-144.png
├── icon-152.png
├── icon-192.png
├── icon-384.png
├── icon-512.png
└── badge-72.png
```

### Environment Variables to Add
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

### Implementation Steps
1. Generate VAPID keys and add to env
2. Create PWA manifest
3. Create app icons (all sizes)
4. Create service worker with caching strategies
5. Add push notification handling to service worker
6. Create push library and service
7. Create push API endpoints
8. Create usePushNotifications hook
9. Create useServiceWorker hook
10. Add service worker registration to layout
11. Add manifest to layout head
12. Create notification permission UI
13. Create PWA install prompt
14. Add notification settings to settings page
15. Integrate push with message sending
16. Integrate push with reminders
17. Test on mobile devices
18. Test offline functionality

### Estimated Complexity: Medium-High
### Files Changed: 15-18

---

## Implementation Priority Recommendation

### Phase 1: Foundation (Weeks 1-2)
1. **Feature #2: Session Export** - Quick win, high value
2. **Feature #5: Templates** - Improves onboarding

### Phase 2: Core Enhancements (Weeks 3-4)
3. **Feature #4: Analytics Dashboard** - User engagement
4. **Feature #9: Customizable Personality** - Personalization

### Phase 3: Engagement (Weeks 5-6)
5. **Feature #7: Reminders** - Retention
6. **Feature #8: AI Insights** - Deep value

### Phase 4: Real-Time & Collaboration (Weeks 7-9)
7. **Feature #1: Real-Time Messaging** - Technical foundation
8. **Feature #3: Two-Person Sessions** - Core feature expansion

### Phase 5: Mobile & Voice (Weeks 10-12)
9. **Feature #10: PWA & Push** - Mobile experience
10. **Feature #6: Voice Input** - Accessibility

---

## Summary Table

| # | Feature | Complexity | New Tables | Key Dependencies |
|---|---------|------------|------------|------------------|
| 1 | Real-Time Messaging | High | 0 | Pusher |
| 2 | Session Export | Low | 0 | @react-pdf/renderer |
| 3 | Collaborative Sessions | High | 1 | Feature #1 |
| 4 | Analytics Dashboard | Medium | 0 | Recharts |
| 5 | Templates | Low-Medium | 1 | None |
| 6 | Voice Input | Medium-High | 0 | Web Speech API |
| 7 | Reminders | Medium | 2 | Resend, Vercel Cron |
| 8 | AI Insights | High | 2 | None |
| 9 | Customizable AI | Medium | 1 | None |
| 10 | PWA & Push | Medium-High | 1 | web-push |
