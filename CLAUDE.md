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
│   │   │       ├── partners/          # Partner management
│   │   │       └── settings/          # User settings
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Auth endpoints
│   │   │   ├── sessions/      # Session CRUD + messages
│   │   │   └── partnerships/  # Partnership endpoints
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── dashboard-nav.tsx # Dashboard navigation
│   │   └── providers.tsx     # Context providers
│   ├── lib/                  # Utilities and configs
│   │   ├── ai/              # Claude AI integration
│   │   │   ├── index.ts     # AI functions
│   │   │   └── prompts.ts   # System prompts
│   │   ├── db/              # Database
│   │   │   ├── index.ts     # DB connection
│   │   │   └── schema.ts    # Drizzle schema
│   │   ├── auth.ts          # NextAuth config
│   │   └── utils.ts         # Helper functions
│   ├── services/            # Business logic
│   │   ├── session.ts       # Session operations
│   │   └── partnership.ts   # Partnership operations
│   └── types/               # TypeScript types
│       └── index.ts
├── docs/                    # Documentation
├── drizzle.config.ts       # Drizzle ORM config
└── package.json
```

## Key Files to Understand

### Database Schema (`src/lib/db/schema.ts`)
Defines all database tables:
- `users` - User accounts
- `sessions` - Conflict resolution sessions
- `messages` - Chat messages within sessions
- `partnerships` - User-to-user connections
- `perspectives` - NVC components (observation, feeling, need, request)
- `agreements` - Resolution agreements

### AI Integration (`src/lib/ai/`)
- `prompts.ts` - System prompts defining the AI mediator's behavior
- `index.ts` - Functions for safety checks and response generation

### Session Flow
1. User creates session → `POST /api/sessions`
2. AI generates welcome → `generateWelcome()`
3. User sends message → `POST /api/sessions/[id]/messages`
4. AI checks safety → `checkSafety()`
5. AI responds → `generateResponse()`
6. Session progresses through NVC stages

## Common Development Tasks

### Adding a New API Endpoint
1. Create file in `src/app/api/[endpoint]/route.ts`
2. Export async functions: `GET`, `POST`, `PUT`, `DELETE`
3. Use `auth()` for protected routes
4. Return `NextResponse.json()`

### Adding a New Page
1. Create `page.tsx` in appropriate `src/app/` directory
2. Use `'use client'` directive for client components
3. Wrap with layout if needed

### Modifying Database Schema
1. Edit `src/lib/db/schema.ts`
2. Run `npx drizzle-kit push` to apply changes
3. Update related services and types

### Adding UI Components
1. Use `npx shadcn@latest add [component]`
2. Component appears in `src/components/ui/`
3. Import and use in pages

## Environment Variables

Required in `.env.local`:
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...
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

## Known Limitations

1. No real-time updates (polling or refresh needed)
2. Single-user sessions (partner joining not fully implemented)
3. No file attachments in messages
4. No export/print session summaries

## Getting Help

- Check `docs/` directory for detailed guides
- Review existing code patterns
- API errors are logged to console
