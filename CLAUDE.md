# CLAUDE.md - AI Assistant Context for Talk-It-Out-AI

This file provides context for AI assistants (like Claude) working on this codebase.

## Project Overview

**Talk-It-Out-AI** is an AI-powered conflict resolution application that facilitates structured dialogues in personal conflicts using therapeutic dialogue techniques. It helps couples and teams work through disagreements using Nonviolent Communication (NVC) principles, acting as a neutral mediator guiding users through structured dialogue to understand each other's feelings and needs.

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15 (App Router) | React-based web framework |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | shadcn/ui | Pre-built accessible components |
| Backend | Next.js API Routes | Serverless API endpoints |
| Database | PostgreSQL (Neon) | Serverless PostgreSQL |
| ORM | Drizzle ORM | Type-safe database queries |
| Authentication | NextAuth.js v5 | User authentication |
| AI | Anthropic Claude API | Conversation AI |
| Email | Resend | Email notifications |
| Language | TypeScript | Type-safe JavaScript |

## Project Structure

```
talk-it-out-ai/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   │   └── dashboard/
│   │   │       ├── page.tsx           # Main dashboard
│   │   │       ├── sessions/          # Session management
│   │   │       │   ├── page.tsx       # Sessions list
│   │   │       │   ├── new/           # Create session
│   │   │       │   └── [id]/          # Session detail/chat
│   │   │       ├── templates/         # Session templates
│   │   │       ├── analytics/         # Analytics dashboard
│   │   │       ├── history/           # Session history & insights
│   │   │       ├── goals/             # Goal tracking
│   │   │       ├── partners/          # Partner management
│   │   │       └── settings/          # User settings
│   │   │           └── reminders/     # Reminder preferences
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Auth endpoints
│   │   │   ├── sessions/      # Session CRUD + messages
│   │   │   ├── partnerships/  # Partnership endpoints
│   │   │   ├── templates/     # Session templates
│   │   │   ├── analytics/     # Analytics data
│   │   │   ├── insights/      # Session insights
│   │   │   ├── goals/         # Goal tracking
│   │   │   ├── reminders/     # Reminder management
│   │   │   └── cron/          # Scheduled tasks
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── analytics/        # Analytics charts
│   │   ├── dashboard-nav.tsx # Dashboard navigation
│   │   ├── session-insights.tsx # Session insight components
│   │   ├── goal-tracking.tsx # Goal tracking components
│   │   ├── reminder-scheduler.tsx # Reminder UI
│   │   ├── voice-input-button.tsx # Voice input
│   │   └── providers.tsx     # Context providers
│   ├── hooks/                # Custom React hooks
│   │   ├── use-speech-recognition.ts # Web Speech API
│   │   └── use-audio-recorder.ts     # Audio recording
│   ├── lib/                  # Utilities and configs
│   │   ├── ai/              # Claude AI integration
│   │   │   ├── index.ts     # AI functions
│   │   │   └── prompts.ts   # System prompts
│   │   ├── db/              # Database
│   │   │   ├── index.ts     # DB connection
│   │   │   └── schema.ts    # Drizzle schema
│   │   ├── email/           # Email service (Resend)
│   │   ├── auth.ts          # NextAuth config
│   │   └── utils.ts         # Helper functions
│   ├── services/            # Business logic
│   │   ├── session.ts       # Session operations
│   │   ├── partnership.ts   # Partnership operations
│   │   ├── analytics.ts     # Analytics calculations
│   │   ├── insights.ts      # Session insights
│   │   ├── goals.ts         # Goal tracking
│   │   └── reminders.ts     # Reminder management
│   └── types/               # TypeScript types
│       └── index.ts
├── docs/                    # Documentation
├── drizzle.config.ts       # Drizzle ORM config
└── package.json
```

## Key Features

### 1. Session Templates
Pre-built templates for common conflict scenarios (household, finances, communication, parenting, work, boundaries, intimacy).

### 2. Session Export
Export session transcripts and summaries in multiple formats.

### 3. Two-Person Collaborative Sessions
- Invite partners to join sessions via invite code
- Real-time participant tracking
- Collaborative AI mediation prompts

### 4. Analytics Dashboard
- Session metrics and completion rates
- Activity charts and trends
- Topic categorization

### 5. Customizable AI Mediator
- Tone settings (warm, professional, direct, gentle)
- Formality levels (casual, balanced, formal)
- Response length preferences
- Optional emoji and metaphor usage

### 6. Voice Input & Audio Messages
- Web Speech API for speech-to-text
- MediaRecorder API fallback for Firefox
- Voice input button in session chat

### 7. Reflection Reminders & Follow-ups
- Schedule follow-up reminders
- Agreement check reminders
- Email notifications via Resend
- Customizable reminder preferences

### 8. Session History & Insights
- Timeline visualization of session progress
- Breakthrough detection (agreements, reflections)
- Communication pattern analysis
- Theme analysis across sessions

### 10. Goal Tracking & Progress
- Set relationship goals with categories
- Track progress with milestones (25%, 50%, 75%, 100%)
- Celebration modals for achievements
- Session-based goal tracking

## Database Schema

### Core Tables
- `users` - User accounts
- `accounts` - OAuth provider accounts
- `sessions` - Conflict resolution sessions
- `messages` - Chat messages within sessions
- `partnerships` - User-to-user connections
- `perspectives` - NVC components (observation, feeling, need, request)
- `agreements` - Resolution agreements

### Feature Tables
- `sessionTemplates` - Pre-built session templates
- `sessionParticipants` - Collaborative session participants
- `mediatorSettings` - AI personality preferences per user
- `userPreferences` - Notification and reminder settings
- `reminders` - Scheduled reminders
- `goals` - User relationship goals
- `milestones` - Goal milestone achievements

## API Endpoints

### Sessions
- `GET/POST /api/sessions` - List and create sessions
- `GET/PUT /api/sessions/[id]` - Get and update session
- `POST /api/sessions/[id]/messages` - Send message
- `POST /api/sessions/[id]/export` - Export session

### Goals
- `GET/POST /api/goals` - List and create goals
- `GET/PUT/PATCH/DELETE /api/goals/[id]` - Goal management

### Reminders
- `GET/POST /api/reminders` - List and create reminders
- `DELETE /api/reminders/[id]` - Cancel reminder

### Insights
- `GET /api/insights` - Session history with stats
- `GET /api/insights/sessions/[id]` - Session insights

### Other
- `GET /api/analytics` - Analytics data
- `GET/POST /api/templates` - Session templates
- `GET/PUT /api/settings/preferences` - User preferences
- `GET/PUT /api/settings/mediator` - Mediator settings

## Environment Variables

Required in `.env.local`:
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_... (optional, for email reminders)
CRON_SECRET=your-cron-secret (for scheduled tasks)
```

## Running the Project

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npx drizzle-kit push # Apply database schema changes
```

## Session Status Flow

```
New Session Created
       ↓
    [active] ←──────────────┐
       ↓                    │
  User interacts            │
       ↓                    │
 Stages progress:           │
 intake → observation →     │
 feeling → need →           │
 request → reflection →     │
 common_ground → agreement  │
       ↓                    │
   [completed]              │
                            │
   [paused] ────────────────┘
   [abandoned]
```

## NVC Stage Progression

The AI guides users through Nonviolent Communication steps:
1. **Intake** - Describe the situation
2. **Observation** - What happened (facts, not judgments)
3. **Feeling** - How you feel about it
4. **Need** - What underlying need isn't being met
5. **Request** - Specific, actionable request
6. **Reflection** - Summary and validation
7. **Common Ground** - Finding shared understanding
8. **Agreement** - Concrete resolution

## Safety Features

The AI includes safety checks for:
- **Crisis indicators** - Self-harm, danger
- **Abuse indicators** - Patterns of abuse
- **Escalation** - Heated exchanges

When detected, appropriate resources are provided.

## Code Conventions

- Use TypeScript strict mode
- Prefer async/await over callbacks
- Use Zod for API input validation
- Follow existing file naming patterns
- Keep components small and focused

## Testing Approach

Currently no automated tests. When adding:
- Use Jest for unit tests
- Use Playwright for E2E tests
- Test API routes with supertest

## Getting Help

- Check `docs/` directory for detailed guides
- Review existing code patterns
- API errors are logged to console
