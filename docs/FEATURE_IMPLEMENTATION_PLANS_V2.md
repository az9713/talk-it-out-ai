# Feature Implementation Plans V2

This document contains detailed implementation plans for 15 new feature enhancements to Talk-It-Out-AI.

---

## Table of Contents

1. [Emotion Check-In & Tracking](#1-emotion-check-in--tracking)
2. [Pre-Session Preparation Mode](#2-pre-session-preparation-mode)
3. [Conflict Pattern Detection](#3-conflict-pattern-detection)
4. [Relationship Health Score](#4-relationship-health-score)
5. [Communication Skills Training](#5-communication-skills-training)
6. [Partner Session Request](#6-partner-session-request)
7. [Anonymous Post-Session Feedback](#7-anonymous-post-session-feedback)
8. [Professional Mediator Integration](#8-professional-mediator-integration)
9. [Calming Exercises Before Sessions](#9-calming-exercises-before-sessions)
10. [Personal Reflection Journal](#10-personal-reflection-journal)
11. [Weekly Relationship Challenges](#11-weekly-relationship-challenges)
12. [Calendar Integration](#12-calendar-integration)
13. [Offline Mode](#13-offline-mode)
14. [Weekly Progress Reports](#14-weekly-progress-reports)
15. [Multi-Language Support](#15-multi-language-support)

---

## 1. Emotion Check-In & Tracking

### Overview
Track emotional state before and after each session with a simple mood selector. Visualize emotional trends over time and measure the app's impact on relationship well-being.

### Technical Approach
Add emotion tracking tables and UI components for mood selection using emoji-based or scale-based input.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const emotionCheckInTypeEnum = pgEnum('emotion_check_in_type', [
  'pre_session', 'post_session', 'daily'
]);

export const emotionCheckIns = pgTable('emotion_check_ins', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  sessionId: text('session_id').references(() => sessions.id), // null for daily check-ins
  type: emotionCheckInTypeEnum('type').notNull(),

  // Primary emotion (1-5 scale or specific emotions)
  overallMood: integer('overall_mood').notNull(), // 1-5 scale
  primaryEmotion: text('primary_emotion'), // angry, sad, anxious, happy, calm, etc.

  // Optional detailed feelings (multiple select)
  feelings: jsonb('feelings'), // ['frustrated', 'hopeful', 'tired']

  // Energy and openness levels
  energyLevel: integer('energy_level'), // 1-5
  opennessToTalk: integer('openness_to_talk'), // 1-5

  // Optional note
  note: text('note'),

  createdAt: timestamp('created_at').defaultNow(),
});

// Track emotion trends over time
export const emotionTrends = pgTable('emotion_trends', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  averageMood: real('average_mood'),
  moodChange: real('mood_change'), // positive = improvement
  dominantEmotions: jsonb('dominant_emotions'),
  sessionsCompleted: integer('sessions_completed'),
  generatedAt: timestamp('generated_at').defaultNow(),
});
```

### New Files to Create

#### `src/services/emotions.ts`
```typescript
export async function recordCheckIn(userId: string, data: EmotionCheckInInput);
export async function getSessionCheckIns(sessionId: string);
export async function getUserEmotionHistory(userId: string, days?: number);
export async function calculateEmotionTrends(userId: string);
export async function getEmotionInsights(userId: string);
```

#### `src/app/api/emotions/route.ts`
```typescript
// GET - Get user's emotion history
// POST - Record a new check-in
```

#### `src/app/api/emotions/trends/route.ts`
```typescript
// GET - Get emotion trends and insights
```

#### `src/components/emotion-check-in.tsx`
```typescript
// Mood selector component with:
// - Emoji-based mood picker (5 levels)
// - Optional feeling tags (multi-select)
// - Energy slider
// - Quick note input
// - Animations for selection feedback
```

#### `src/components/emotion-trends-chart.tsx`
```typescript
// Visualization showing:
// - Mood over time (line chart)
// - Pre vs post session comparison
// - Feeling frequency (word cloud or bar chart)
```

### Files to Modify

#### `src/app/(dashboard)/dashboard/sessions/[id]/page.tsx`
- Show emotion check-in modal before session starts
- Show post-session check-in when session completes
- Display mood change indicator

#### `src/app/(dashboard)/dashboard/analytics/page.tsx`
- Add emotion trends section
- Show mood improvement metrics

### Implementation Steps
1. Add database tables and migrate
2. Create emotions service
3. Create API endpoints
4. Build emotion check-in component
5. Build trends visualization
6. Integrate into session flow
7. Add to analytics dashboard
8. Test mood tracking flow

### Estimated Complexity: Low-Medium
### Files Changed: 8-10

---

## 2. Pre-Session Preparation Mode

### Overview
Guided preparation before difficult conversations to help users clarify thoughts, identify feelings and needs beforehand, and reduce anxiety.

### Technical Approach
Create a multi-step preparation wizard that saves prep notes and optionally shares summary with AI mediator.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const sessionPreparations = pgTable('session_preparations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  sessionId: text('session_id').references(() => sessions.id), // linked after session created

  // What happened
  situation: text('situation'),

  // Initial feelings (before reflection)
  initialFeelings: jsonb('initial_feelings'),

  // What you want to achieve
  desiredOutcome: text('desired_outcome'),

  // Your needs (identified during prep)
  identifiedNeeds: jsonb('identified_needs'),

  // What you want to say (draft opening)
  draftOpening: text('draft_opening'),

  // AI-suggested opening (optional)
  suggestedOpening: text('suggested_opening'),

  // Concerns or fears about the conversation
  concerns: text('concerns'),

  // Completed all steps?
  isComplete: boolean('is_complete').default(false),

  // Share with AI mediator?
  shareWithMediator: boolean('share_with_mediator').default(true),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### New Files to Create

#### `src/services/preparation.ts`
```typescript
export async function createPreparation(userId: string);
export async function updatePreparation(prepId: string, data: Partial<Preparation>);
export async function getPreparation(prepId: string);
export async function generateSuggestedOpening(prepId: string); // AI call
export async function linkPreparationToSession(prepId: string, sessionId: string);
```

#### `src/app/api/preparations/route.ts`
```typescript
// GET - Get user's preparations
// POST - Create new preparation
```

#### `src/app/api/preparations/[id]/route.ts`
```typescript
// GET - Get preparation details
// PUT - Update preparation
// POST /suggest - Generate AI-suggested opening
```

#### `src/app/(dashboard)/dashboard/sessions/prepare/page.tsx`
```typescript
// Multi-step preparation wizard:
// Step 1: Describe the situation
// Step 2: Identify your feelings
// Step 3: What outcome do you want?
// Step 4: What do you need?
// Step 5: Draft your opening
// Step 6: Review & get AI suggestions
// Step 7: Ready to start session
```

#### `src/components/preparation-wizard.tsx`
```typescript
// Wizard component with:
// - Progress indicator
// - Step navigation
// - Auto-save on each step
// - Feeling/need selectors
// - AI suggestion button
```

#### `src/components/preparation-summary.tsx`
```typescript
// Summary card showing prep notes
// Displayed before session starts
// Option to edit or proceed
```

### Files to Modify

#### `src/app/(dashboard)/dashboard/sessions/new/page.tsx`
- Add "Prepare First" option alongside "Start Now"
- Link to preparation wizard

#### `src/lib/ai/prompts.ts`
- Add prompt for generating suggested openings
- Modify system prompt to include preparation context when shared

#### `src/lib/ai/index.ts`
- Add function to generate opening suggestions
- Include preparation context in session prompts

### Implementation Steps
1. Add database table and migrate
2. Create preparation service
3. Create API endpoints
4. Build preparation wizard UI
5. Implement AI opening suggestions
6. Integrate with session creation flow
7. Pass preparation context to AI mediator
8. Test full preparation flow

### Estimated Complexity: Medium
### Files Changed: 10-12

---

## 3. Conflict Pattern Detection

### Overview
AI analyzes sessions over time to identify recurring conflict themes, triggers, and patterns, providing proactive suggestions to address root causes.

### Technical Approach
Use Claude to analyze aggregated session data periodically. Store detected patterns and surface them in insights.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const patternTypeEnum = pgEnum('pattern_type', [
  'recurring_topic', 'trigger', 'timing', 'communication_style',
  'escalation_pattern', 'resolution_pattern', 'positive_pattern'
]);

export const conflictPatterns = pgTable('conflict_patterns', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  partnershipId: text('partnership_id').references(() => partnerships.id),

  type: patternTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),

  // Pattern details
  frequency: text('frequency'), // 'weekly', 'monthly', 'occasional'
  severity: integer('severity'), // 1-5

  // Supporting evidence
  relatedSessionIds: jsonb('related_session_ids'), // array of session IDs
  exampleQuotes: jsonb('example_quotes'), // anonymized quotes

  // AI-generated suggestions
  suggestions: jsonb('suggestions'), // array of actionable suggestions

  // Confidence and status
  confidence: real('confidence'), // 0-1
  isAcknowledged: boolean('is_acknowledged').default(false),
  isResolved: boolean('is_resolved').default(false),

  detectedAt: timestamp('detected_at').defaultNow(),
  lastOccurrence: timestamp('last_occurrence'),
});

export const patternAnalysisLog = pgTable('pattern_analysis_log', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  sessionsAnalyzed: integer('sessions_analyzed'),
  patternsFound: integer('patterns_found'),
  analyzedAt: timestamp('analyzed_at').defaultNow(),
});
```

### New Files to Create

#### `src/lib/ai/patterns.ts`
```typescript
export const PATTERN_ANALYSIS_PROMPT = `
You are an expert relationship analyst. Review the following session history
and identify recurring patterns...

Look for:
1. RECURRING TOPICS - Same issues appearing repeatedly
2. TRIGGERS - What consistently starts conflicts
3. TIMING PATTERNS - When conflicts tend to occur
4. COMMUNICATION PATTERNS - Defensive behaviors, interrupting, etc.
5. ESCALATION PATTERNS - How small issues become big
6. RESOLUTION PATTERNS - What helps resolve conflicts
7. POSITIVE PATTERNS - What's working well

Return patterns as JSON...
`;

export async function analyzePatterns(userId: string): Promise<Pattern[]>;
```

#### `src/services/patterns.ts`
```typescript
export async function runPatternAnalysis(userId: string);
export async function getUserPatterns(userId: string);
export async function acknowledgePattern(patternId: string);
export async function markPatternResolved(patternId: string);
export async function getPatternSuggestions(patternId: string);
```

#### `src/app/api/patterns/route.ts`
```typescript
// GET - Get user's detected patterns
// POST - Trigger pattern analysis
```

#### `src/app/api/patterns/[id]/route.ts`
```typescript
// PUT - Update pattern (acknowledge, resolve)
```

#### `src/app/(dashboard)/dashboard/patterns/page.tsx`
```typescript
// Patterns dashboard showing:
// - Active patterns with severity indicators
// - Pattern details with evidence
// - AI suggestions for each pattern
// - Acknowledge/resolve actions
// - Historical resolved patterns
```

#### `src/components/pattern-card.tsx`
```typescript
// Card showing:
// - Pattern type icon and title
// - Frequency and severity badges
// - Brief description
// - "View Details" action
```

#### `src/components/pattern-detail-dialog.tsx`
```typescript
// Dialog showing:
// - Full pattern description
// - Related sessions list
// - Example quotes (anonymized)
// - AI suggestions
// - Action buttons
```

### Files to Modify

#### `src/components/dashboard-nav.tsx`
- Add "Patterns" link with notification badge

#### `src/app/(dashboard)/dashboard/page.tsx`
- Add patterns preview card

#### `src/app/api/cron/patterns/route.ts` (new)
- Weekly cron job to analyze patterns for all users

### Implementation Steps
1. Add database tables and migrate
2. Create pattern analysis prompt
3. Create patterns service
4. Create API endpoints
5. Build patterns dashboard page
6. Create pattern cards and detail dialog
7. Add to navigation
8. Set up cron job for periodic analysis
9. Test with various session histories

### Estimated Complexity: High
### Files Changed: 12-15

---

## 4. Relationship Health Score

### Overview
A holistic metric combining session completion rates, agreement follow-through, communication improvements, and goal progress into an overall relationship health indicator.

### Technical Approach
Calculate a composite score from multiple factors, display as a trend over time with contributing factors breakdown.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const healthScores = pgTable('health_scores', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  partnershipId: text('partnership_id').references(() => partnerships.id),

  // Overall score (0-100)
  overallScore: integer('overall_score').notNull(),

  // Component scores (0-100 each)
  communicationScore: integer('communication_score'),
  resolutionScore: integer('resolution_score'),
  consistencyScore: integer('consistency_score'),
  progressScore: integer('progress_score'),
  emotionalScore: integer('emotional_score'),

  // Trend indicator
  trend: text('trend'), // 'improving', 'stable', 'declining'
  trendPercentage: real('trend_percentage'),

  // Factors breakdown
  factors: jsonb('factors'), // detailed breakdown

  // Period this score covers
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),

  calculatedAt: timestamp('calculated_at').defaultNow(),
});
```

### New Files to Create

#### `src/services/health-score.ts`
```typescript
interface HealthScoreFactors {
  sessionCompletionRate: number;
  averageMoodImprovement: number;
  agreementFollowThrough: number;
  goalProgress: number;
  sessionFrequency: number;
  communicationPatternScore: number;
}

export async function calculateHealthScore(userId: string): Promise<HealthScore>;
export async function getHealthScoreHistory(userId: string, months?: number);
export async function getScoreBreakdown(scoreId: string);
export async function getHealthInsights(userId: string);
```

#### `src/app/api/health-score/route.ts`
```typescript
// GET - Get current health score and history
// POST - Trigger recalculation
```

#### `src/components/health-score-gauge.tsx`
```typescript
// Circular gauge showing:
// - Overall score (0-100)
// - Color coding (red/yellow/green)
// - Trend arrow
// - Animation on load
```

#### `src/components/health-score-breakdown.tsx`
```typescript
// Breakdown showing:
// - Individual component scores
// - Bar chart comparison
// - Strengths and areas for improvement
```

#### `src/components/health-score-trend.tsx`
```typescript
// Line chart showing:
// - Score over time (weeks/months)
// - Key events marked on timeline
// - Comparison to previous periods
```

### Files to Modify

#### `src/app/(dashboard)/dashboard/page.tsx`
- Add prominent health score display
- Show trend indicator

#### `src/app/(dashboard)/dashboard/analytics/page.tsx`
- Add health score section with full breakdown

### Implementation Steps
1. Add database table and migrate
2. Create health score calculation service
3. Define scoring algorithm and weights
4. Create API endpoint
5. Build gauge component
6. Build breakdown component
7. Build trend chart
8. Integrate into dashboard
9. Add to analytics page
10. Test scoring accuracy

### Estimated Complexity: Medium
### Files Changed: 8-10

---

## 5. Communication Skills Training

### Overview
Interactive mini-lessons on NVC principles with practice exercises, quizzes, and skill badges.

### Technical Approach
Create a learning module system with lessons, exercises, and progress tracking. Use gamification with badges.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const skillCategoryEnum = pgEnum('skill_category', [
  'observations', 'feelings', 'needs', 'requests',
  'active_listening', 'empathy', 'de_escalation'
]);

export const lessons = pgTable('lessons', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  category: skillCategoryEnum('category').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  content: jsonb('content'), // lesson content blocks
  order: integer('order').notNull(),
  estimatedMinutes: integer('estimated_minutes'),
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const exercises = pgTable('exercises', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  lessonId: text('lesson_id').notNull().references(() => lessons.id),
  type: text('type'), // 'multiple_choice', 'fill_blank', 'rewrite', 'identify'
  question: text('question').notNull(),
  options: jsonb('options'), // for multiple choice
  correctAnswer: text('correct_answer'),
  explanation: text('explanation'),
  order: integer('order').notNull(),
});

export const userLessonProgress = pgTable('user_lesson_progress', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  lessonId: text('lesson_id').notNull().references(() => lessons.id),
  status: text('status'), // 'not_started', 'in_progress', 'completed'
  score: integer('score'), // percentage
  completedAt: timestamp('completed_at'),
  startedAt: timestamp('started_at'),
});

export const skillBadges = pgTable('skill_badges', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  category: skillCategoryEnum('category'),
  requirement: jsonb('requirement'), // criteria to earn
  createdAt: timestamp('created_at').defaultNow(),
});

export const userBadges = pgTable('user_badges', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  badgeId: text('badge_id').notNull().references(() => skillBadges.id),
  earnedAt: timestamp('earned_at').defaultNow(),
});
```

### New Files to Create

#### `src/services/learning.ts`
```typescript
export async function getLessons(category?: SkillCategory);
export async function getLesson(lessonId: string);
export async function startLesson(userId: string, lessonId: string);
export async function completeLesson(userId: string, lessonId: string, score: number);
export async function submitExercise(userId: string, exerciseId: string, answer: string);
export async function getUserProgress(userId: string);
export async function checkAndAwardBadges(userId: string);
export async function getUserBadges(userId: string);
```

#### `src/app/api/learning/lessons/route.ts`
```typescript
// GET - List lessons with progress
```

#### `src/app/api/learning/lessons/[id]/route.ts`
```typescript
// GET - Get lesson content
// POST - Submit lesson completion
```

#### `src/app/api/learning/exercises/[id]/route.ts`
```typescript
// POST - Submit exercise answer
```

#### `src/app/api/learning/badges/route.ts`
```typescript
// GET - Get user's badges
```

#### `src/app/(dashboard)/dashboard/learn/page.tsx`
```typescript
// Learning hub showing:
// - Skill categories with progress
// - Available lessons
// - Earned badges showcase
// - Recommended next lesson
```

#### `src/app/(dashboard)/dashboard/learn/[lessonId]/page.tsx`
```typescript
// Lesson viewer with:
// - Content sections
// - Interactive exercises
// - Progress indicator
// - Completion celebration
```

#### `src/components/learning/lesson-card.tsx`
#### `src/components/learning/exercise-card.tsx`
#### `src/components/learning/badge-display.tsx`
#### `src/components/learning/progress-ring.tsx`

### Seed Data

#### `src/lib/db/seed-lessons.ts`
```typescript
// Seed lessons for each category:
// - Observations: "Separating Facts from Judgments"
// - Feelings: "Expanding Your Feelings Vocabulary"
// - Needs: "Identifying Universal Human Needs"
// - Requests: "Making Clear, Actionable Requests"
// - Active Listening: "The Art of Reflective Listening"
// etc.
```

### Files to Modify

#### `src/components/dashboard-nav.tsx`
- Add "Learn" link

### Implementation Steps
1. Add database tables and migrate
2. Create learning service
3. Create API endpoints
4. Create seed data for lessons
5. Build learning hub page
6. Build lesson viewer
7. Build exercise components
8. Implement badge system
9. Add to navigation
10. Test full learning flow

### Estimated Complexity: High
### Files Changed: 18-22

---

## 6. Partner Session Request

### Overview
Send a gentle invitation when you want to talk, allowing partner to accept, suggest a time, or indicate they need space.

### Technical Approach
Create a request system with real-time notifications via Pusher and email fallback.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const sessionRequestStatusEnum = pgEnum('session_request_status', [
  'pending', 'accepted', 'declined', 'rescheduled', 'expired'
]);

export const sessionRequests = pgTable('session_requests', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  fromUserId: text('from_user_id').notNull().references(() => users.id),
  toUserId: text('to_user_id').notNull().references(() => users.id),
  partnershipId: text('partnership_id').notNull().references(() => partnerships.id),

  // Request details
  topic: text('topic'), // optional topic hint
  urgency: text('urgency'), // 'whenever', 'soon', 'important'
  message: text('message'), // optional personal message

  // Suggested times (optional)
  suggestedTimes: jsonb('suggested_times'),

  // Response
  status: sessionRequestStatusEnum('status').default('pending'),
  responseMessage: text('response_message'),
  scheduledFor: timestamp('scheduled_for'),

  // Resulting session
  sessionId: text('session_id').references(() => sessions.id),

  createdAt: timestamp('created_at').defaultNow(),
  respondedAt: timestamp('responded_at'),
  expiresAt: timestamp('expires_at'),
});
```

### New Files to Create

#### `src/services/session-requests.ts`
```typescript
export async function createRequest(fromUserId: string, toUserId: string, data: RequestInput);
export async function respondToRequest(requestId: string, response: RequestResponse);
export async function getPendingRequests(userId: string);
export async function getSentRequests(userId: string);
export async function cancelRequest(requestId: string);
export async function expireOldRequests(); // cron job
```

#### `src/app/api/session-requests/route.ts`
```typescript
// GET - Get pending and sent requests
// POST - Create new request
```

#### `src/app/api/session-requests/[id]/route.ts`
```typescript
// PUT - Respond to request
// DELETE - Cancel request
```

#### `src/components/session-request-dialog.tsx`
```typescript
// Dialog to create request:
// - Partner selector (if multiple)
// - Optional topic
// - Urgency level
// - Personal message
// - Suggested times picker
```

#### `src/components/session-request-notification.tsx`
```typescript
// Notification card showing:
// - Who's asking
// - Topic/message
// - Urgency indicator
// - Accept/Decline/Suggest Time buttons
```

#### `src/components/session-request-badge.tsx`
```typescript
// Badge showing pending request count
// Animated pulse for new requests
```

### Files to Modify

#### `src/app/(dashboard)/dashboard/page.tsx`
- Show pending requests prominently
- Add "Request to Talk" button

#### `src/components/dashboard-nav.tsx`
- Add request notification badge

#### `src/lib/email/templates/session-request.tsx`
- Email template for session requests

#### Real-time notifications via Pusher
- Notify partner instantly when request is sent

### Implementation Steps
1. Add database table and migrate
2. Create session requests service
3. Create API endpoints
4. Build request dialog
5. Build notification component
6. Add Pusher integration for real-time
7. Add email notification fallback
8. Integrate into dashboard
9. Test full request flow

### Estimated Complexity: Medium
### Files Changed: 10-12

---

## 7. Anonymous Post-Session Feedback

### Overview
After collaborative sessions, each partner privately rates the session without revealing individual responses, helping surface issues safely.

### Technical Approach
Collect feedback from both parties, aggregate without revealing individual scores, surface concerns only when patterns emerge.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const sessionFeedback = pgTable('session_feedback', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  userId: text('user_id').notNull().references(() => users.id),

  // Ratings (1-5)
  feltHeard: integer('felt_heard'),
  resolutionFairness: integer('resolution_fairness'),
  partnerOpenness: integer('partner_openness'),
  overallSatisfaction: integer('overall_satisfaction'),

  // Would you use agreements?
  willFollowAgreements: boolean('will_follow_agreements'),

  // Optional anonymous concerns
  concerns: text('concerns'),

  // What worked well
  whatWorked: text('what_worked'),

  isSubmitted: boolean('is_submitted').default(false),
  submittedAt: timestamp('submitted_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Aggregated feedback (no individual attribution)
export const aggregatedFeedback = pgTable('aggregated_feedback', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  partnershipId: text('partnership_id').notNull().references(() => partnerships.id),

  // Aggregated scores (averages)
  avgFeltHeard: real('avg_felt_heard'),
  avgFairness: real('avg_fairness'),
  avgOpenness: real('avg_openness'),
  avgSatisfaction: real('avg_satisfaction'),

  // Trends
  satisfactionTrend: text('satisfaction_trend'),

  // Flagged concerns (only shown if recurring)
  flaggedConcerns: jsonb('flagged_concerns'),

  sessionsIncluded: integer('sessions_included'),
  lastUpdated: timestamp('last_updated').defaultNow(),
});
```

### New Files to Create

#### `src/services/feedback.ts`
```typescript
export async function createFeedbackRequest(sessionId: string);
export async function submitFeedback(feedbackId: string, data: FeedbackInput);
export async function getSessionFeedbackStatus(sessionId: string);
export async function aggregateFeedback(partnershipId: string);
export async function getFeedbackInsights(partnershipId: string);
```

#### `src/app/api/feedback/route.ts`
```typescript
// POST - Submit feedback
```

#### `src/app/api/feedback/[sessionId]/route.ts`
```typescript
// GET - Get feedback status for session
```

#### `src/app/api/feedback/insights/route.ts`
```typescript
// GET - Get aggregated feedback insights
```

#### `src/components/feedback-form.tsx`
```typescript
// Anonymous feedback form:
// - Rating scales with emoji indicators
// - "Did you feel heard?" slider
// - "Was the resolution fair?" slider
// - Optional concerns text (anonymized)
// - What worked well text
// - Reassurance of anonymity
```

#### `src/components/feedback-insights.tsx`
```typescript
// Aggregated insights display:
// - Overall satisfaction trend
// - Areas of strength
// - Areas needing attention (only if consistent pattern)
// - No individual attribution
```

### Files to Modify

#### `src/app/(dashboard)/dashboard/sessions/[id]/page.tsx`
- Show feedback prompt after session completion
- Only for collaborative sessions

#### `src/app/(dashboard)/dashboard/analytics/page.tsx`
- Add feedback insights section for partnerships

### Implementation Steps
1. Add database tables and migrate
2. Create feedback service
3. Create API endpoints
4. Build feedback form
5. Build insights display
6. Integrate into session completion flow
7. Implement aggregation logic
8. Test anonymity and aggregation

### Estimated Complexity: Medium
### Files Changed: 10-12

---

## 8. Professional Mediator Integration

### Overview
Allow licensed therapists or counselors to join sessions as observers, review transcripts, and provide professional guidance.

### Technical Approach
Create a professional role with special permissions, secure transcript sharing, and integration points for professional feedback.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const professionalRoleEnum = pgEnum('professional_role', [
  'therapist', 'counselor', 'mediator', 'coach'
]);

export const professionals = pgTable('professionals', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  role: professionalRoleEnum('role').notNull(),

  // Verification
  licenseNumber: text('license_number'),
  licenseState: text('license_state'),
  isVerified: boolean('is_verified').default(false),
  verifiedAt: timestamp('verified_at'),

  // Profile
  specializations: jsonb('specializations'),
  bio: text('bio'),

  createdAt: timestamp('created_at').defaultNow(),
});

export const professionalConnections = pgTable('professional_connections', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  professionalId: text('professional_id').notNull().references(() => professionals.id),
  userId: text('user_id').notNull().references(() => users.id),
  partnershipId: text('partnership_id').references(() => partnerships.id),

  status: text('status'), // 'pending', 'active', 'ended'

  // Permissions
  canViewSessions: boolean('can_view_sessions').default(false),
  canJoinLive: boolean('can_join_live').default(false),
  canAddNotes: boolean('can_add_notes').default(false),

  connectedAt: timestamp('connected_at').defaultNow(),
  endedAt: timestamp('ended_at'),
});

export const professionalNotes = pgTable('professional_notes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  professionalId: text('professional_id').notNull().references(() => professionals.id),
  sessionId: text('session_id').notNull().references(() => sessions.id),

  note: text('note').notNull(),
  isSharedWithClients: boolean('is_shared_with_clients').default(false),

  createdAt: timestamp('created_at').defaultNow(),
});
```

### New Files to Create

#### `src/services/professionals.ts`
```typescript
export async function registerProfessional(userId: string, data: ProfessionalData);
export async function verifyProfessional(professionalId: string);
export async function connectWithProfessional(userId: string, professionalId: string);
export async function grantSessionAccess(connectionId: string, sessionId: string);
export async function addProfessionalNote(professionalId: string, sessionId: string, note: string);
export async function getProfessionalClients(professionalId: string);
export async function getClientProfessionals(userId: string);
```

#### `src/app/api/professionals/route.ts`
```typescript
// GET - Search professionals
// POST - Register as professional
```

#### `src/app/api/professionals/[id]/route.ts`
```typescript
// GET - Get professional profile
// PUT - Update profile
```

#### `src/app/api/professionals/connections/route.ts`
```typescript
// GET - Get connections
// POST - Create connection request
// PUT - Update connection permissions
```

#### `src/app/(dashboard)/dashboard/professional/page.tsx`
```typescript
// Professional dashboard:
// - Client list
// - Shared sessions
// - Notes management
// - Schedule (future)
```

#### `src/app/(dashboard)/dashboard/settings/professional/page.tsx`
```typescript
// Connect with professional:
// - Search professionals
// - Pending requests
// - Active connections
// - Permission management
```

### Files to Modify

#### `src/app/(dashboard)/dashboard/sessions/[id]/page.tsx`
- Show professional observer indicator
- Display professional notes (if shared)

#### `src/lib/auth.ts`
- Add professional role check

### Implementation Steps
1. Add database tables and migrate
2. Create professionals service
3. Create API endpoints
4. Build professional dashboard
5. Build client connection UI
6. Implement permission system
7. Add professional view of sessions
8. Test access controls

### Estimated Complexity: High
### Files Changed: 15-18

---

## 9. Calming Exercises Before Sessions

### Overview
Guided breathing exercises, grounding techniques, and mindfulness prompts to help users calm down before difficult conversations.

### Technical Approach
Create a library of calming exercises with timers, animations, and audio guidance.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const calmingExercises = pgTable('calming_exercises', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type'), // 'breathing', 'grounding', 'visualization', 'body_scan'
  durationSeconds: integer('duration_seconds').notNull(),
  instructions: jsonb('instructions'), // step-by-step
  audioUrl: text('audio_url'),
  isActive: boolean('is_active').default(true),
});

export const exerciseCompletions = pgTable('exercise_completions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  exerciseId: text('exercise_id').notNull().references(() => calmingExercises.id),
  sessionId: text('session_id').references(() => sessions.id), // if done before session
  completedAt: timestamp('completed_at').defaultNow(),
  moodBefore: integer('mood_before'),
  moodAfter: integer('mood_after'),
});
```

### New Files to Create

#### `src/services/calming.ts`
```typescript
export async function getExercises(type?: string);
export async function getExercise(exerciseId: string);
export async function recordCompletion(userId: string, exerciseId: string, data: CompletionData);
export async function getRecommendedExercise(userId: string);
```

#### `src/app/api/calming/route.ts`
```typescript
// GET - List exercises
```

#### `src/app/api/calming/[id]/complete/route.ts`
```typescript
// POST - Record completion
```

#### `src/components/calming/breathing-exercise.tsx`
```typescript
// Animated breathing guide:
// - Expanding/contracting circle
// - Inhale/hold/exhale timing
// - Countdown timer
// - Soothing colors
```

#### `src/components/calming/grounding-exercise.tsx`
```typescript
// 5-4-3-2-1 grounding technique:
// - Step-by-step prompts
// - Checkboxes for completion
// - Calming imagery
```

#### `src/components/calming/body-scan.tsx`
```typescript
// Guided body scan:
// - Body part highlighting
// - Relaxation prompts
// - Progress indicator
```

#### `src/components/calming/exercise-picker.tsx`
```typescript
// Exercise selection:
// - Quick options (2 min, 5 min)
// - Exercise type filters
// - "I'm feeling..." mood selector for recommendations
```

#### `src/app/(dashboard)/dashboard/calm/page.tsx`
```typescript
// Calming center:
// - Quick exercises
// - Full exercise library
// - Completion history
// - Mood improvement stats
```

### Seed Data

#### `src/lib/db/seed-exercises.ts`
```typescript
// Seed exercises:
// - "Box Breathing" (4-4-4-4 pattern)
// - "4-7-8 Relaxation Breath"
// - "5-4-3-2-1 Grounding"
// - "Body Scan Relaxation"
// - "Peaceful Place Visualization"
```

### Files to Modify

#### `src/app/(dashboard)/dashboard/sessions/[id]/page.tsx`
- Offer calming exercise before starting
- "Take a moment to center yourself" prompt

#### `src/components/dashboard-nav.tsx`
- Add "Calm" link

### Implementation Steps
1. Add database tables and migrate
2. Create calming service
3. Create seed data
4. Build breathing animation component
5. Build grounding exercise component
6. Build exercise picker
7. Create calming center page
8. Integrate into session flow
9. Test animations and timing

### Estimated Complexity: Medium
### Files Changed: 12-15

---

## 10. Personal Reflection Journal

### Overview
Private space for processing thoughts before and after sessions, with AI-suggested reflection prompts.

### Technical Approach
Create a journaling system with entries linked to sessions, AI-powered prompts, and search/filter capabilities.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const journalEntries = pgTable('journal_entries', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  sessionId: text('session_id').references(() => sessions.id), // optional link

  title: text('title'),
  content: text('content').notNull(),

  // Entry type
  type: text('type'), // 'free_write', 'prompted', 'pre_session', 'post_session'
  promptUsed: text('prompt_used'),

  // Mood at time of writing
  mood: integer('mood'),

  // Tags for organization
  tags: jsonb('tags'),

  // Privacy (always private, but user can choose to share with professional)
  sharedWithProfessional: boolean('shared_with_professional').default(false),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const journalPrompts = pgTable('journal_prompts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  prompt: text('prompt').notNull(),
  category: text('category'), // 'reflection', 'gratitude', 'growth', 'session_prep'
  isActive: boolean('is_active').default(true),
});
```

### New Files to Create

#### `src/services/journal.ts`
```typescript
export async function createEntry(userId: string, data: JournalEntryInput);
export async function updateEntry(entryId: string, data: Partial<JournalEntry>);
export async function deleteEntry(entryId: string);
export async function getEntries(userId: string, filters?: JournalFilters);
export async function getEntry(entryId: string);
export async function getRandomPrompt(category?: string);
export async function generatePersonalizedPrompt(userId: string); // AI-powered
export async function searchEntries(userId: string, query: string);
```

#### `src/app/api/journal/route.ts`
```typescript
// GET - List entries with filters
// POST - Create entry
```

#### `src/app/api/journal/[id]/route.ts`
```typescript
// GET - Get entry
// PUT - Update entry
// DELETE - Delete entry
```

#### `src/app/api/journal/prompts/route.ts`
```typescript
// GET - Get prompt (random or personalized)
```

#### `src/app/(dashboard)/dashboard/journal/page.tsx`
```typescript
// Journal home:
// - Entry list with search
// - New entry button
// - Filter by date/tag/session
// - Calendar view option
```

#### `src/app/(dashboard)/dashboard/journal/new/page.tsx`
```typescript
// New entry page:
// - Rich text editor
// - Prompt suggestion
// - Mood selector
// - Tag input
// - Link to session (optional)
```

#### `src/app/(dashboard)/dashboard/journal/[id]/page.tsx`
```typescript
// View/edit entry
```

#### `src/components/journal/entry-card.tsx`
#### `src/components/journal/entry-editor.tsx`
#### `src/components/journal/prompt-card.tsx`

### Seed Data

#### `src/lib/db/seed-prompts.ts`
```typescript
// Seed prompts:
// - "What am I grateful for in this relationship today?"
// - "What did I learn about myself in our last conversation?"
// - "What do I need right now that I haven't asked for?"
// - "How have I grown in my communication this month?"
// etc.
```

### Files to Modify

#### `src/components/dashboard-nav.tsx`
- Add "Journal" link

### Implementation Steps
1. Add database tables and migrate
2. Create journal service
3. Create seed prompts
4. Create API endpoints
5. Build journal listing page
6. Build entry editor
7. Implement search and filters
8. Add AI-powered prompt generation
9. Add to navigation
10. Test full journaling flow

### Estimated Complexity: Medium
### Files Changed: 12-15

---

## 11. Weekly Relationship Challenges

### Overview
Gamified micro-tasks to practice communication skills with progress tracking and celebrations.

### Technical Approach
Create a challenge system with weekly assignments, completion tracking, and streak mechanics.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const challenges = pgTable('challenges', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category'), // 'appreciation', 'listening', 'expression', 'quality_time'

  // Task details
  taskDescription: text('task_description').notNull(),
  frequency: text('frequency'), // 'daily', 'weekly', 'once'
  targetCount: integer('target_count').default(1),

  // Difficulty and rewards
  difficulty: text('difficulty'), // 'easy', 'medium', 'hard'
  pointsReward: integer('points_reward').default(10),

  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userChallenges = pgTable('user_challenges', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  challengeId: text('challenge_id').notNull().references(() => challenges.id),

  // Assignment period
  weekStart: timestamp('week_start').notNull(),
  weekEnd: timestamp('week_end').notNull(),

  // Progress
  completedCount: integer('completed_count').default(0),
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),

  // Reflection
  reflection: text('reflection'),

  createdAt: timestamp('created_at').defaultNow(),
});

export const challengeStreaks = pgTable('challenge_streaks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  totalCompleted: integer('total_completed').default(0),
  totalPoints: integer('total_points').default(0),
  lastCompletedAt: timestamp('last_completed_at'),
});
```

### New Files to Create

#### `src/services/challenges.ts`
```typescript
export async function assignWeeklyChallenge(userId: string);
export async function getCurrentChallenge(userId: string);
export async function recordProgress(userChallengeId: string);
export async function completeChallenge(userChallengeId: string, reflection?: string);
export async function getStreak(userId: string);
export async function getChallengeHistory(userId: string);
```

#### `src/app/api/challenges/route.ts`
```typescript
// GET - Get current challenge
// POST - Assign new challenge
```

#### `src/app/api/challenges/[id]/progress/route.ts`
```typescript
// POST - Record progress
// PUT - Complete with reflection
```

#### `src/app/(dashboard)/dashboard/challenges/page.tsx`
```typescript
// Challenges page:
// - Current challenge card
// - Progress indicator
// - Streak display
// - Past challenges
// - Leaderboard (optional, anonymized)
```

#### `src/components/challenges/challenge-card.tsx`
#### `src/components/challenges/streak-display.tsx`
#### `src/components/challenges/progress-tracker.tsx`
#### `src/components/challenges/completion-celebration.tsx`

### Seed Data

#### `src/lib/db/seed-challenges.ts`
```typescript
// Seed challenges:
// - "Express appreciation to your partner once daily"
// - "Practice reflective listening in one conversation"
// - "Share one feeling using an 'I' statement"
// - "Ask an open-ended question about their day"
// - "Give a genuine compliment"
// etc.
```

### Files to Modify

#### `src/components/dashboard-nav.tsx`
- Add "Challenges" link

#### `src/app/(dashboard)/dashboard/page.tsx`
- Show current challenge preview

### Implementation Steps
1. Add database tables and migrate
2. Create challenges service
3. Create seed challenges
4. Create API endpoints
5. Build challenges page
6. Build challenge card and progress components
7. Implement streak tracking
8. Add celebration animations
9. Set up weekly assignment cron
10. Add to navigation and dashboard

### Estimated Complexity: Medium
### Files Changed: 12-15

---

## 12. Calendar Integration

### Overview
Schedule sessions in Google/Outlook calendar, sync reminders, and coordinate partner availability.

### Technical Approach
Use OAuth to connect calendars, create calendar events, and sync bi-directionally.

### Dependencies to Add
```bash
npm install googleapis @microsoft/microsoft-graph-client
```

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const calendarConnections = pgTable('calendar_connections', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),

  provider: text('provider').notNull(), // 'google', 'outlook'
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),

  calendarId: text('calendar_id'), // specific calendar to use

  // Sync preferences
  syncReminders: boolean('sync_reminders').default(true),
  syncSessions: boolean('sync_sessions').default(true),

  connectedAt: timestamp('connected_at').defaultNow(),
});

export const scheduledSessions = pgTable('scheduled_sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  partnerId: text('partner_id').references(() => users.id),

  scheduledFor: timestamp('scheduled_for').notNull(),
  duration: integer('duration').default(30), // minutes
  topic: text('topic'),

  // Calendar event IDs
  calendarEventId: text('calendar_event_id'),
  partnerCalendarEventId: text('partner_calendar_event_id'),

  // Status
  status: text('status'), // 'scheduled', 'started', 'completed', 'cancelled'
  sessionId: text('session_id').references(() => sessions.id),

  createdAt: timestamp('created_at').defaultNow(),
});
```

### New Files to Create

#### `src/lib/calendar/google.ts`
```typescript
export async function getAuthUrl(userId: string): Promise<string>;
export async function handleCallback(code: string, userId: string);
export async function createEvent(userId: string, event: CalendarEvent);
export async function updateEvent(userId: string, eventId: string, event: CalendarEvent);
export async function deleteEvent(userId: string, eventId: string);
export async function getAvailability(userId: string, start: Date, end: Date);
```

#### `src/lib/calendar/outlook.ts`
```typescript
// Similar functions for Outlook/Microsoft Graph
```

#### `src/services/calendar.ts`
```typescript
export async function connectCalendar(userId: string, provider: string, tokens: Tokens);
export async function disconnectCalendar(userId: string, provider: string);
export async function scheduleSession(userId: string, data: ScheduleInput);
export async function cancelScheduledSession(scheduledId: string);
export async function getUpcomingScheduled(userId: string);
export async function findMutualAvailability(userId: string, partnerId: string, date: Date);
```

#### `src/app/api/calendar/connect/[provider]/route.ts`
```typescript
// GET - Initiate OAuth flow
```

#### `src/app/api/calendar/callback/[provider]/route.ts`
```typescript
// GET - Handle OAuth callback
```

#### `src/app/api/calendar/schedule/route.ts`
```typescript
// GET - Get scheduled sessions
// POST - Schedule new session
// DELETE - Cancel scheduled session
```

#### `src/app/(dashboard)/dashboard/settings/calendar/page.tsx`
```typescript
// Calendar settings:
// - Connect Google Calendar
// - Connect Outlook
// - Sync preferences
// - Default duration
```

#### `src/components/calendar/schedule-dialog.tsx`
```typescript
// Schedule session dialog:
// - Date/time picker
// - Duration selector
// - Partner availability view
// - Topic input
// - Add to calendar checkbox
```

#### `src/components/calendar/availability-picker.tsx`
```typescript
// Shows mutual availability
// Highlights suggested times
```

### Files to Modify

#### `src/app/(dashboard)/dashboard/sessions/new/page.tsx`
- Add "Schedule for Later" option

#### `src/app/(dashboard)/dashboard/page.tsx`
- Show upcoming scheduled sessions

### Environment Variables to Add
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
```

### Implementation Steps
1. Set up Google OAuth credentials
2. Set up Microsoft OAuth credentials
3. Add database tables and migrate
4. Create calendar provider libraries
5. Create calendar service
6. Create OAuth API routes
7. Build calendar settings page
8. Build schedule dialog
9. Build availability picker
10. Integrate into session creation
11. Test calendar sync

### Estimated Complexity: High
### Files Changed: 15-18

---

## 13. Offline Mode

### Overview
Work on reflections offline, review past sessions, and sync when connected using service workers and local storage.

### Technical Approach
Implement PWA with service worker caching, IndexedDB for local storage, and background sync.

### Dependencies to Add
```bash
npm install idb workbox-webpack-plugin
```

### New Files to Create

#### `public/sw.js` - Service Worker
```javascript
// Cache strategies:
// - Static assets: Cache first
// - API responses: Network first with cache fallback
// - Session data: Stale while revalidate

// Offline functionality:
// - Queue actions for sync
// - Store draft messages locally
// - Cache session history

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-drafts') {
    event.waitUntil(syncDrafts());
  }
});
```

#### `src/lib/offline/indexed-db.ts`
```typescript
import { openDB } from 'idb';

export async function initDB();
export async function saveDraft(sessionId: string, content: string);
export async function getDrafts();
export async function deleteDraft(id: string);
export async function cacheSession(session: Session);
export async function getCachedSessions();
export async function queueAction(action: OfflineAction);
export async function getQueuedActions();
```

#### `src/lib/offline/sync.ts`
```typescript
export async function syncDrafts();
export async function syncQueuedActions();
export async function checkConnectivity(): boolean;
export async function registerBackgroundSync();
```

#### `src/hooks/use-offline.ts`
```typescript
export function useOffline() {
  // State: isOnline, hasPendingSync, pendingCount
  // Methods: saveDraft, syncNow
  // Auto-sync when back online
}
```

#### `src/components/offline-indicator.tsx`
```typescript
// Banner showing:
// - Offline status
// - Pending sync count
// - "Sync Now" button when online
```

#### `src/components/offline-draft-list.tsx`
```typescript
// List of drafts saved offline
// Sync status for each
```

### Files to Modify

#### `src/app/layout.tsx`
- Register service worker
- Add offline indicator

#### `src/app/(dashboard)/dashboard/sessions/[id]/page.tsx`
- Save drafts locally
- Show cached data when offline
- Queue messages for sync

#### `next.config.ts`
- Configure PWA/service worker

#### `public/manifest.json`
- PWA manifest for installability

### Implementation Steps
1. Set up service worker with Workbox
2. Create IndexedDB wrapper
3. Implement draft saving
4. Implement session caching
5. Create sync logic
6. Build offline indicator
7. Integrate into session page
8. Test offline scenarios
9. Test sync when back online

### Estimated Complexity: High
### Files Changed: 12-15

---

## 14. Weekly Progress Reports

### Overview
Automated email summaries with sessions completed, goals progressed, insights discovered, and suggested focus areas.

### Technical Approach
Generate personalized reports using existing analytics data, send via Resend on a schedule.

### Database Changes

#### Add to `src/lib/db/schema.ts`
```typescript
export const progressReports = pgTable('progress_reports', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),

  // Report period
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),

  // Report data
  reportData: jsonb('report_data'), // full report content

  // Delivery
  sentAt: timestamp('sent_at'),
  openedAt: timestamp('opened_at'),

  createdAt: timestamp('created_at').defaultNow(),
});
```

### New Files to Create

#### `src/services/progress-reports.ts`
```typescript
export async function generateReport(userId: string, periodStart: Date, periodEnd: Date);
export async function sendReport(reportId: string);
export async function getReportHistory(userId: string);
export async function markReportOpened(reportId: string);
```

#### `src/lib/email/templates/progress-report.tsx`
```typescript
// React Email template:
// - Header with period dates
// - Sessions summary
// - Goals progress
// - Key insights
// - Patterns detected
// - Suggested focus for next week
// - Quick links to app
```

#### `src/app/api/reports/route.ts`
```typescript
// GET - Get report history
// POST - Generate report on demand
```

#### `src/app/api/cron/reports/route.ts`
```typescript
// GET - Weekly cron to generate and send reports
```

#### `src/app/(dashboard)/dashboard/reports/page.tsx`
```typescript
// Reports page:
// - Past reports list
// - View report in browser
// - Report preferences
```

#### `src/components/report-viewer.tsx`
```typescript
// In-browser report display
// Same content as email
```

### Files to Modify

#### `src/app/(dashboard)/dashboard/settings/page.tsx`
- Add report preferences:
  - Enable/disable weekly reports
  - Preferred day of week
  - Include partner data (if applicable)

#### `vercel.json`
- Add weekly report cron job

### Implementation Steps
1. Add database table and migrate
2. Create report generation service
3. Create email template
4. Create API endpoints
5. Set up cron job
6. Build reports page
7. Build report viewer
8. Add preferences to settings
9. Test report generation and delivery

### Estimated Complexity: Medium
### Files Changed: 10-12

---

## 15. Multi-Language Support

### Overview
Support multiple languages for interface and AI mediator responses.

### Technical Approach
Use next-intl for interface translations, configure Claude to respond in user's preferred language.

### Dependencies to Add
```bash
npm install next-intl
```

### Database Changes

#### Modify `src/lib/db/schema.ts`
```typescript
// Add to users table
export const users = pgTable('users', {
  // ... existing fields
  preferredLanguage: text('preferred_language').default('en'),
});

// Add to mediatorSettings
export const mediatorSettings = pgTable('mediator_settings', {
  // ... existing fields
  language: text('language').default('en'),
});
```

### New Files to Create

#### `src/i18n/config.ts`
```typescript
export const locales = ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko'];
export const defaultLocale = 'en';
```

#### `src/i18n/messages/en.json`
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "dashboard": {
    "welcome": "Welcome back, {name}",
    "activeSessions": "Active Sessions",
    "completedSessions": "Completed Sessions"
  },
  "session": {
    "startNew": "Start New Session",
    "topic": "Topic",
    "stage": "Stage"
  }
  // ... comprehensive translations
}
```

#### `src/i18n/messages/es.json`
#### `src/i18n/messages/fr.json`
#### `src/i18n/messages/de.json`
#### `src/i18n/messages/pt.json`
#### `src/i18n/messages/zh.json`
#### `src/i18n/messages/ja.json`
#### `src/i18n/messages/ko.json`

#### `src/middleware.ts`
```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko'],
  defaultLocale: 'en'
});
```

#### `src/i18n/request.ts`
```typescript
// next-intl request configuration
```

### Files to Modify

#### `src/lib/ai/prompts.ts`
- Add language instruction to system prompt
- Translate NVC terminology appropriately

#### `src/lib/ai/index.ts`
```typescript
// Add language parameter to generateResponse
export async function generateResponse(
  // ... existing params
  language: string = 'en'
) {
  const languageInstruction = language !== 'en'
    ? `Respond in ${getLanguageName(language)}. `
    : '';
  // ...
}
```

#### `src/app/(dashboard)/dashboard/settings/page.tsx`
- Add language selector

#### All page and component files
- Replace hardcoded strings with translation keys
- Use `useTranslations` hook

### Implementation Steps
1. Install and configure next-intl
2. Create translation files for all languages
3. Update middleware for locale detection
4. Add language preference to database
5. Update AI prompts for language support
6. Replace all hardcoded strings
7. Add language selector to settings
8. Test all languages
9. Get translations reviewed by native speakers

### Estimated Complexity: High
### Files Changed: 50+ (all UI files)

---

## Summary Table

| # | Feature | Complexity | New Tables | Key Dependencies | Priority |
|---|---------|------------|------------|------------------|----------|
| 1 | Emotion Check-In | Low-Medium | 2 | None | High |
| 2 | Pre-Session Prep | Medium | 1 | None | High |
| 3 | Pattern Detection | High | 2 | Claude AI | High |
| 4 | Health Score | Medium | 1 | None | Medium |
| 5 | Skills Training | High | 5 | None | Medium |
| 6 | Session Request | Medium | 1 | Pusher | High |
| 7 | Anonymous Feedback | Medium | 2 | None | Medium |
| 8 | Professional Integration | High | 3 | None | Low |
| 9 | Calming Exercises | Medium | 2 | None | Medium |
| 10 | Reflection Journal | Medium | 2 | None | Medium |
| 11 | Weekly Challenges | Medium | 3 | None | Medium |
| 12 | Calendar Integration | High | 2 | Google/Microsoft APIs | Medium |
| 13 | Offline Mode | High | 0 | Workbox, IDB | Low |
| 14 | Progress Reports | Medium | 1 | Resend | Medium |
| 15 | Multi-Language | High | 0 | next-intl | Low |

---

## Implementation Phases

### Phase 1: Core Engagement (Features 1, 2, 6)
- Emotion Check-In & Tracking
- Pre-Session Preparation Mode
- Partner Session Request

### Phase 2: Insights & Growth (Features 3, 4, 9)
- Conflict Pattern Detection
- Relationship Health Score
- Calming Exercises

### Phase 3: Learning & Reflection (Features 5, 10, 11)
- Communication Skills Training
- Personal Reflection Journal
- Weekly Challenges

### Phase 4: Collaboration & Feedback (Features 7, 8)
- Anonymous Feedback
- Professional Mediator Integration

### Phase 5: Integration & Accessibility (Features 12, 14)
- Calendar Integration
- Weekly Progress Reports

### Phase 6: Platform Enhancement (Features 13, 15)
- Offline Mode
- Multi-Language Support
