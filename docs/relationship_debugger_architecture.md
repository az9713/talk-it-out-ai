# Technical Architecture Document
## Relationship-Debugger Bot

**Project ID:** #86
**Version:** 1.0
**Date:** 2026-01-04
**Phase:** BMAD Phase 3 - Solutioning

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack Selection](#2-tech-stack-selection)
3. [System Components](#3-system-components)
4. [Database Design](#4-database-design)
5. [API Specification](#5-api-specification)
6. [AI/LLM Integration](#6-aillm-integration)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Security Architecture](#8-security-architecture)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Monitoring & Observability](#10-monitoring--observability)
11. [Development Guidelines](#11-development-guidelines)

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         CLIENT LAYER                                 │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │    │
│  │  │   Web App   │  │  Mobile PWA │  │   Future:   │                  │    │
│  │  │   (React)   │  │   (React)   │  │ Native Apps │                  │    │
│  │  └──────┬──────┘  └──────┬──────┘  └─────────────┘                  │    │
│  └─────────┼────────────────┼──────────────────────────────────────────┘    │
│            │                │                                                │
│            └────────┬───────┘                                                │
│                     │ HTTPS                                                  │
│                     ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        API GATEWAY / CDN                             │    │
│  │                    (Vercel Edge / Cloudflare)                        │    │
│  └──────────────────────────────┬──────────────────────────────────────┘    │
│                                 │                                            │
│                                 ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       APPLICATION LAYER                              │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                    Next.js API Routes                        │    │    │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐    │    │    │
│  │  │  │   Auth    │ │  Session  │ │  Message  │ │  Billing  │    │    │    │
│  │  │  │  Service  │ │  Service  │ │  Service  │ │  Service  │    │    │    │
│  │  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘    │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └──────────────────────────────┬──────────────────────────────────────┘    │
│                                 │                                            │
│         ┌───────────────────────┼───────────────────────┐                    │
│         │                       │                       │                    │
│         ▼                       ▼                       ▼                    │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐              │
│  │  PostgreSQL │        │ Claude API  │        │   Stripe    │              │
│  │  (Neon.tech)│        │ (Anthropic) │        │  (Payments) │              │
│  └─────────────┘        └─────────────┘        └─────────────┘              │
│                                                                              │
│  ┌─────────────┐        ┌─────────────┐                                     │
│  │   Resend    │        │   Upstash   │                                     │
│  │   (Email)   │        │   (Redis)   │                                     │
│  └─────────────┘        └─────────────┘                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Monolith vs Microservices** | Modular Monolith | Solo dev, MVP speed, can extract later |
| **Rendering Strategy** | Server Components + Client | SEO for marketing, fast interactivity for app |
| **Database** | PostgreSQL | Relational data, ACID compliance, mature ecosystem |
| **Hosting** | Vercel | Integrated with Next.js, easy deployment, edge functions |
| **State Management** | Server state (React Query) | Reduces client complexity, real-time sync easier |
| **Styling** | Tailwind CSS | Rapid development, consistent design |

### 1.3 Request Flow

```
User Action → Next.js Frontend → API Route → Service Layer → Database/External APIs → Response
                    │                              │
                    │                              ├── Claude API (AI responses)
                    │                              ├── PostgreSQL (data)
                    │                              └── Stripe (payments)
                    │
                    └── React Query Cache (optimistic updates)
```

---

## 2. Tech Stack Selection

### 2.1 Frontend

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Next.js | 14.x | React framework with App Router |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **Components** | shadcn/ui | latest | Accessible component library |
| **State** | React Query (TanStack) | 5.x | Server state management |
| **Forms** | React Hook Form + Zod | latest | Form handling + validation |
| **Icons** | Lucide React | latest | Icon library |

### 2.2 Backend

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Runtime** | Node.js | 20.x LTS | JavaScript runtime |
| **Framework** | Next.js API Routes | 14.x | API endpoints |
| **ORM** | Drizzle ORM | latest | Type-safe database access |
| **Validation** | Zod | 3.x | Runtime validation |
| **Auth** | NextAuth.js (Auth.js) | 5.x | Authentication |

### 2.3 Database & Storage

| Service | Technology | Purpose |
|---------|------------|---------|
| **Primary DB** | PostgreSQL (Neon) | Relational data, serverless |
| **Cache** | Upstash Redis | Session cache, rate limiting |
| **File Storage** | Vercel Blob (if needed) | User uploads (future) |

### 2.4 External Services

| Service | Provider | Purpose |
|---------|----------|---------|
| **LLM** | Anthropic Claude | AI conversation engine |
| **Email** | Resend | Transactional emails |
| **Payments** | Stripe | Subscriptions |
| **Analytics** | PostHog | Product analytics |
| **Error Tracking** | Sentry | Error monitoring |

### 2.5 Development & Deployment

| Tool | Purpose |
|------|---------|
| **Hosting** | Vercel |
| **CI/CD** | Vercel (automatic) |
| **Version Control** | GitHub |
| **Package Manager** | pnpm |
| **Linting** | ESLint + Prettier |
| **Testing** | Vitest + Playwright |

---

## 3. System Components

### 3.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPONENT ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FRONTEND (src/app)                                                          │
│  ├── (marketing)/          # Landing, pricing pages                          │
│  │   ├── page.tsx          # Home                                            │
│  │   └── pricing/page.tsx  # Pricing                                         │
│  │                                                                           │
│  ├── (auth)/               # Authentication                                  │
│  │   ├── login/page.tsx                                                      │
│  │   ├── signup/page.tsx                                                     │
│  │   └── verify/page.tsx                                                     │
│  │                                                                           │
│  ├── (app)/                # Authenticated app                               │
│  │   ├── dashboard/page.tsx                                                  │
│  │   ├── session/[id]/page.tsx                                               │
│  │   ├── history/page.tsx                                                    │
│  │   ├── progress/page.tsx                                                   │
│  │   └── settings/page.tsx                                                   │
│  │                                                                           │
│  └── api/                  # API Routes                                      │
│      ├── auth/[...nextauth]/                                                 │
│      ├── sessions/                                                           │
│      ├── messages/                                                           │
│      ├── partnerships/                                                       │
│      ├── billing/                                                            │
│      └── webhooks/                                                           │
│                                                                              │
│  SERVICES (src/services)                                                     │
│  ├── auth.service.ts       # Authentication logic                            │
│  ├── session.service.ts    # Session management                              │
│  ├── message.service.ts    # Message handling                                │
│  ├── ai.service.ts         # Claude API integration                          │
│  ├── partnership.service.ts # Partner linking                                │
│  └── billing.service.ts    # Stripe integration                              │
│                                                                              │
│  AI ENGINE (src/ai)                                                          │
│  ├── prompts/              # System prompts                                  │
│  │   ├── moderator.ts      # Main conversation prompt                        │
│  │   ├── deescalation.ts   # De-escalation prompts                           │
│  │   └── crisis.ts         # Crisis detection                                │
│  ├── session-manager.ts    # Session state machine                           │
│  └── nvc-engine.ts         # NVC format enforcement                          │
│                                                                              │
│  DATABASE (src/db)                                                           │
│  ├── schema.ts             # Drizzle schema                                  │
│  ├── migrations/           # Database migrations                             │
│  └── queries/              # Reusable queries                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Service Responsibilities

| Service | Responsibilities |
|---------|-----------------|
| **AuthService** | User registration, login, password reset, OAuth |
| **SessionService** | Create/update sessions, state transitions, history |
| **MessageService** | Store messages, trigger AI responses, handle turns |
| **AIService** | Claude API calls, prompt management, response parsing |
| **PartnershipService** | Partner invites, linking, unlinking |
| **BillingService** | Stripe subscriptions, usage tracking, limits |

---

## 4. Database Design

### 4.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENTITY RELATIONSHIP DIAGRAM                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐         │
│  │    users     │         │ partnerships │         │   sessions   │         │
│  ├──────────────┤         ├──────────────┤         ├──────────────┤         │
│  │ id (PK)      │◄──┐     │ id (PK)      │◄───────►│ id (PK)      │         │
│  │ email        │   │     │ user1_id(FK) │────┐    │ partnership  │         │
│  │ password_hash│   ├────►│ user2_id(FK) │────┘    │   _id (FK)   │         │
│  │ name         │   │     │ status       │         │ initiated_by │         │
│  │ email_verified│  │     │ invite_code  │         │ title        │         │
│  │ subscription │   │     │ created_at   │         │ status       │         │
│  │ stripe_id    │   │     │ ended_at     │         │ stage        │         │
│  │ created_at   │   │     └──────────────┘         │ created_at   │         │
│  │ updated_at   │   │                              │ completed_at │         │
│  └──────────────┘   │                              └──────┬───────┘         │
│         ▲           │                                     │                  │
│         │           │                                     │                  │
│         │           │     ┌──────────────┐                │                  │
│         │           │     │   messages   │◄───────────────┤                  │
│         │           │     ├──────────────┤                │                  │
│         │           └────►│ id (PK)      │                │                  │
│         │                 │ session_id   │                │                  │
│         │                 │ user_id (FK) │                │                  │
│         │                 │ role         │                │                  │
│         │                 │ content      │                │                  │
│         │                 │ stage        │                │                  │
│         │                 │ metadata     │                │                  │
│         │                 │ created_at   │                │                  │
│         │                 └──────────────┘                │                  │
│         │                                                 │                  │
│         │                 ┌──────────────┐                │                  │
│         │                 │ perspectives │◄───────────────┤                  │
│         │                 ├──────────────┤                │                  │
│         └────────────────►│ id (PK)      │                │                  │
│                           │ session_id   │                │                  │
│                           │ user_id (FK) │                │                  │
│                           │ observation  │                │                  │
│                           │ feeling      │                │                  │
│                           │ need         │                │                  │
│                           │ request      │                │                  │
│                           │ confirmed    │                │                  │
│                           │ created_at   │                │                  │
│                           └──────────────┘                │                  │
│                                                           │                  │
│                           ┌──────────────┐                │                  │
│                           │  agreements  │◄───────────────┘                  │
│                           ├──────────────┤                                   │
│                           │ id (PK)      │                                   │
│                           │ session_id   │                                   │
│                           │ content      │                                   │
│                           │ owner_id(FK) │                                   │
│                           │ deadline     │                                   │
│                           │ status       │                                   │
│                           │ created_at   │                                   │
│                           └──────────────┘                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Schema Definition (Drizzle ORM)

```typescript
// src/db/schema.ts

import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'plus', 'pro']);
export const partnershipStatusEnum = pgEnum('partnership_status', ['pending', 'active', 'ended']);
export const sessionStatusEnum = pgEnum('session_status', ['active', 'paused', 'completed', 'abandoned', 'crisis_referred']);
export const sessionStageEnum = pgEnum('session_stage', [
  'intake',
  'person_a_perspective',
  'person_a_reflection',
  'waiting_for_b',
  'person_b_perspective',
  'person_b_reflection',
  'mutual_understanding_a',
  'mutual_understanding_b',
  'common_ground',
  'solution_brainstorm',
  'agreement',
  'summary',
  'complete'
]);
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);
export const agreementStatusEnum = pgEnum('agreement_status', ['pending', 'completed', 'overdue']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  name: varchar('name', { length: 100 }),
  emailVerified: boolean('email_verified').default(false),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free'),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  sessionsThisMonth: integer('sessions_this_month').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Partnerships table
export const partnerships = pgTable('partnerships', {
  id: uuid('id').primaryKey().defaultRandom(),
  user1Id: uuid('user1_id').references(() => users.id).notNull(),
  user2Id: uuid('user2_id').references(() => users.id),
  status: partnershipStatusEnum('status').default('pending'),
  inviteCode: varchar('invite_code', { length: 20 }).unique(),
  inviteExpiresAt: timestamp('invite_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
});

// Sessions table
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnershipId: uuid('partnership_id').references(() => partnerships.id).notNull(),
  initiatedBy: uuid('initiated_by').references(() => users.id).notNull(),
  title: varchar('title', { length: 200 }),
  status: sessionStatusEnum('status').default('active'),
  stage: sessionStageEnum('stage').default('intake'),
  currentTurnUserId: uuid('current_turn_user_id').references(() => users.id),
  resolutionOutcome: varchar('resolution_outcome', { length: 50 }),
  satisfactionRatingA: integer('satisfaction_rating_a'),
  satisfactionRatingB: integer('satisfaction_rating_b'),
  feelingHeardRatingA: integer('feeling_heard_rating_a'),
  feelingHeardRatingB: integer('feeling_heard_rating_b'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  userId: uuid('user_id').references(() => users.id), // null for assistant messages
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  stage: sessionStageEnum('stage'),
  metadata: jsonb('metadata'), // Store additional data like escalation flags
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Perspectives table (NVC structured responses)
export const perspectives = pgTable('perspectives', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  observation: text('observation'),
  feeling: text('feeling'),
  need: text('need'),
  request: text('request'),
  confirmed: boolean('confirmed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Agreements table
export const agreements = pgTable('agreements', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  content: text('content').notNull(),
  ownerId: uuid('owner_id').references(() => users.id),
  deadline: timestamp('deadline'),
  status: agreementStatusEnum('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Indexes
export const emailIdx = index('email_idx').on(users.email);
export const partnershipUser1Idx = index('partnership_user1_idx').on(partnerships.user1Id);
export const partnershipUser2Idx = index('partnership_user2_idx').on(partnerships.user2Id);
export const sessionPartnershipIdx = index('session_partnership_idx').on(sessions.partnershipId);
export const messageSessionIdx = index('message_session_idx').on(messages.sessionId);
```

### 4.3 Key Queries

```typescript
// src/db/queries/sessions.ts

import { db } from '../index';
import { sessions, messages, perspectives, users, partnerships } from '../schema';
import { eq, and, desc } from 'drizzle-orm';

// Get active sessions for a user
export async function getActiveSessionsForUser(userId: string) {
  return db
    .select()
    .from(sessions)
    .innerJoin(partnerships, eq(sessions.partnershipId, partnerships.id))
    .where(
      and(
        or(
          eq(partnerships.user1Id, userId),
          eq(partnerships.user2Id, userId)
        ),
        eq(sessions.status, 'active')
      )
    )
    .orderBy(desc(sessions.updatedAt));
}

// Get session with all messages
export async function getSessionWithMessages(sessionId: string) {
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  const sessionMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(messages.createdAt);

  const sessionPerspectives = await db
    .select()
    .from(perspectives)
    .where(eq(perspectives.sessionId, sessionId));

  return {
    session: session[0],
    messages: sessionMessages,
    perspectives: sessionPerspectives,
  };
}

// Create new session
export async function createSession(partnershipId: string, initiatedBy: string, title?: string) {
  return db
    .insert(sessions)
    .values({
      partnershipId,
      initiatedBy,
      title,
      currentTurnUserId: initiatedBy,
    })
    .returning();
}

// Update session stage
export async function updateSessionStage(sessionId: string, stage: string, nextTurnUserId?: string) {
  return db
    .update(sessions)
    .set({
      stage,
      currentTurnUserId: nextTurnUserId,
      updatedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));
}
```

---

## 5. API Specification

### 5.1 API Overview

| Category | Base Path | Auth Required |
|----------|-----------|---------------|
| Authentication | `/api/auth/*` | Partial |
| Users | `/api/users/*` | Yes |
| Partnerships | `/api/partnerships/*` | Yes |
| Sessions | `/api/sessions/*` | Yes |
| Messages | `/api/messages/*` | Yes |
| Billing | `/api/billing/*` | Yes |
| Webhooks | `/api/webhooks/*` | Signature |

### 5.2 Authentication Endpoints

```typescript
// POST /api/auth/register
// Register a new user
Request: {
  email: string;
  password: string;
  name?: string;
}
Response: {
  user: { id, email, name };
  message: "Verification email sent";
}

// POST /api/auth/login
// Login with email/password
Request: {
  email: string;
  password: string;
}
Response: {
  user: { id, email, name, subscriptionTier };
  token: string; // Set as httpOnly cookie
}

// POST /api/auth/logout
// Logout current user
Response: { success: true }

// POST /api/auth/forgot-password
Request: { email: string }
Response: { message: "Reset email sent if account exists" }

// POST /api/auth/reset-password
Request: {
  token: string;
  password: string;
}
Response: { success: true }
```

### 5.3 Partnership Endpoints

```typescript
// POST /api/partnerships/invite
// Create partner invite
Request: { email?: string } // Optional email to send invite to
Response: {
  inviteCode: string;
  inviteUrl: string;
  expiresAt: string;
}

// POST /api/partnerships/join
// Accept partner invite
Request: { inviteCode: string }
Response: {
  partnership: { id, user1Id, user2Id, status };
}

// GET /api/partnerships/current
// Get current partnership
Response: {
  partnership: { id, partner: { id, name }, status, createdAt };
} | null

// DELETE /api/partnerships/current
// Unlink from partner
Response: { success: true }
```

### 5.4 Session Endpoints

```typescript
// GET /api/sessions
// List sessions for current user
Query: { status?: 'active' | 'completed' | 'all', limit?: number, offset?: number }
Response: {
  sessions: [{
    id, title, status, stage, createdAt, updatedAt,
    partner: { id, name },
    myTurn: boolean
  }];
  total: number;
}

// POST /api/sessions
// Create new session
Request: {
  title?: string;
}
Response: {
  session: { id, title, status, stage };
  firstMessage: { role: 'assistant', content: string };
}

// GET /api/sessions/:id
// Get session details with messages
Response: {
  session: { id, title, status, stage, currentTurnUserId, ... };
  messages: [{ id, role, content, stage, createdAt }];
  perspectives: [{ userId, observation, feeling, need, request, confirmed }];
  agreements: [{ id, content, ownerId, deadline, status }];
  myTurn: boolean;
}

// PATCH /api/sessions/:id
// Update session (pause, resume, complete ratings)
Request: {
  action: 'pause' | 'resume' | 'rate';
  satisfactionRating?: number;
  feelingHeardRating?: number;
}
Response: { session: { ... } }

// DELETE /api/sessions/:id
// Delete session (soft delete, marks as abandoned)
Response: { success: true }
```

### 5.5 Message Endpoints

```typescript
// POST /api/sessions/:sessionId/messages
// Send a message in session
Request: {
  content: string;
}
Response: {
  userMessage: { id, role: 'user', content, createdAt };
  assistantMessage: { id, role: 'assistant', content, createdAt };
  sessionUpdate: {
    stage: string;
    currentTurnUserId: string;
    perspective?: { ... }; // If NVC element captured
  };
}

// GET /api/sessions/:sessionId/messages
// Get messages for session (with pagination)
Query: { after?: string, limit?: number }
Response: {
  messages: [{ id, role, content, stage, createdAt }];
  hasMore: boolean;
}
```

### 5.6 Billing Endpoints

```typescript
// GET /api/billing/subscription
// Get current subscription status
Response: {
  tier: 'free' | 'plus' | 'pro';
  sessionsUsed: number;
  sessionsLimit: number;
  renewsAt?: string;
  cancelledAt?: string;
}

// POST /api/billing/checkout
// Create Stripe checkout session
Request: {
  tier: 'plus' | 'pro';
  successUrl?: string;
  cancelUrl?: string;
}
Response: {
  checkoutUrl: string;
}

// POST /api/billing/portal
// Create Stripe customer portal session
Response: {
  portalUrl: string;
}

// POST /api/webhooks/stripe
// Stripe webhook handler (signature verified)
// Handles: checkout.session.completed, customer.subscription.updated, etc.
```

### 5.7 Error Response Format

```typescript
// All error responses follow this format
{
  error: {
    code: string;        // Machine-readable code (e.g., 'VALIDATION_ERROR')
    message: string;     // Human-readable message
    details?: object;    // Additional context (validation errors, etc.)
  }
}

// Common error codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | Not authorized for this action |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| CONFLICT | 409 | Resource conflict (e.g., email exists) |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
```

---

## 6. AI/LLM Integration

### 6.1 Claude API Integration

```typescript
// src/services/ai.service.ts

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateResponse(
  sessionContext: SessionContext,
  userMessage: string
): Promise<AIResponse> {
  const systemPrompt = buildSystemPrompt(sessionContext);
  const conversationHistory = formatConversationHistory(sessionContext.messages);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ],
  });

  return parseAIResponse(response, sessionContext);
}

function buildSystemPrompt(context: SessionContext): string {
  const basePrompt = getBaseModeratorPrompt();
  const stagePrompt = getStageSpecificPrompt(context.stage);
  const safetyPrompt = getSafetyPrompt();

  return `${basePrompt}\n\n${stagePrompt}\n\n${safetyPrompt}`;
}
```

### 6.2 System Prompts

```typescript
// src/ai/prompts/moderator.ts

export const BASE_MODERATOR_PROMPT = `
You are a skilled conflict resolution facilitator helping two people work through a disagreement.
Your approach is based on Nonviolent Communication (NVC) and other evidence-based techniques.

CORE PRINCIPLES:
1. You are warm, non-judgmental, and validating
2. You never take sides or assign blame
3. You guide users through the NVC framework: Observation → Feeling → Need → Request
4. You recognize escalation and offer de-escalation
5. You ensure both parties feel heard before moving to solutions

TONE:
- Compassionate but not saccharine
- Direct but gentle
- Professional but warm
- Encouraging but realistic

NEVER:
- Diagnose mental health conditions
- Provide legal, medical, or financial advice
- Take sides or assign blame
- Use psychological jargon excessively
- Be condescending or preachy

RESPONSE FORMAT:
Keep responses focused and concise (2-4 paragraphs typically).
Ask one question at a time.
Provide examples when helpful.
Use the user's own words when reflecting back.

CURRENT SESSION CONTEXT:
- Stage: {{stage}}
- Current turn: {{currentUser}}
- Partner: {{partnerName}}
- Topic: {{topic}}
`;

export const STAGE_PROMPTS = {
  intake: `
    You are in the INTAKE stage. Your goals:
    1. Welcome the user warmly
    2. Ask what the conflict is about (briefly)
    3. Check in on their current emotional state
    4. Set expectations for the process

    After gathering basic context, move to person_a_perspective.
  `,

  person_a_perspective: `
    You are guiding Person A through their perspective using NVC.

    Step through these in order, one at a time:
    1. OBSERVATION: Ask what specifically happened (facts only, no judgments)
       - If they use judgmental language ("They always...", "They're so..."),
         gently redirect to specific observable facts
    2. FEELING: Ask how that made them feel (use feeling words)
       - If they describe thoughts ("I felt that they..."), redirect to emotions
    3. NEED: Ask what underlying need wasn't met
       - Provide examples: connection, respect, reliability, safety, understanding
    4. REQUEST: Ask what specific action they'd like going forward
       - Ensure it's stated positively (what they want, not what they don't want)

    After completing all four, summarize their perspective and ask for confirmation.
  `,

  // ... additional stage prompts
};

export const SAFETY_PROMPT = `
SAFETY MONITORING:

ESCALATION SIGNALS (intervene with de-escalation):
- All caps text
- Profanity or insults
- Absolute language ("always", "never")
- Threats or ultimatums
- Personal attacks on character

DE-ESCALATION RESPONSE:
"I can feel the intensity here. These feelings are valid. Would you like to take a few breaths
before continuing? We can pause anytime."

CRISIS SIGNALS (immediately refer out):
- Mentions of self-harm or suicide
- Descriptions of physical violence or abuse
- Child safety concerns
- Immediate danger

CRISIS RESPONSE:
"I'm concerned about what you've shared. This situation needs professional support beyond
what I can provide. Please reach out to:
- National Domestic Violence Hotline: 1-800-799-7233
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
Your safety is the priority."

After a crisis response, set session status to 'crisis_referred'.
`;
```

### 6.3 Response Parsing

```typescript
// src/ai/response-parser.ts

interface AIResponse {
  content: string;
  stageTransition?: string;
  perspectiveUpdate?: Partial<Perspective>;
  escalationDetected?: boolean;
  crisisDetected?: boolean;
  deEscalationSuggested?: boolean;
}

export function parseAIResponse(
  response: Anthropic.Message,
  context: SessionContext
): AIResponse {
  const content = response.content[0].type === 'text'
    ? response.content[0].text
    : '';

  // Detect crisis keywords
  const crisisDetected = detectCrisisKeywords(context.lastUserMessage);
  if (crisisDetected) {
    return {
      content: CRISIS_RESPONSE,
      crisisDetected: true,
    };
  }

  // Detect escalation
  const escalationDetected = detectEscalation(context.lastUserMessage);

  // Determine stage transition based on context
  const stageTransition = determineStageTransition(context, content);

  // Extract any perspective updates
  const perspectiveUpdate = extractPerspectiveUpdate(context, content);

  return {
    content,
    stageTransition,
    perspectiveUpdate,
    escalationDetected,
    deEscalationSuggested: escalationDetected,
  };
}

function detectCrisisKeywords(text: string): boolean {
  const crisisPatterns = [
    /\b(kill|suicide|end my life|hurt myself)\b/i,
    /\b(hit|punch|slap|choke|strangle)\b.*\b(me|her|him|them)\b/i,
    /\b(abuse|abusing|abused)\b/i,
    /\b(child|kid|minor)\b.*\b(hurt|danger|unsafe)\b/i,
  ];

  return crisisPatterns.some(pattern => pattern.test(text));
}

function detectEscalation(text: string): boolean {
  const escalationPatterns = [
    /[A-Z]{3,}/, // Multiple caps
    /\b(fuck|shit|damn|hell|ass)\b/i,
    /\b(always|never|every time)\b/i,
    /\b(you're|you are)\s+(so|such a)\b/i, // Character attacks
  ];

  return escalationPatterns.some(pattern => pattern.test(text));
}
```

### 6.4 Token Usage & Cost Management

```typescript
// src/ai/usage-tracker.ts

const PRICING = {
  'claude-sonnet-4-20250514': {
    input: 0.003,  // per 1K tokens
    output: 0.015, // per 1K tokens
  },
};

export async function trackUsage(
  sessionId: string,
  inputTokens: number,
  outputTokens: number,
  model: string
) {
  const cost = calculateCost(inputTokens, outputTokens, model);

  // Log for analytics
  await db.insert(usageLogs).values({
    sessionId,
    inputTokens,
    outputTokens,
    model,
    costUsd: cost,
  });

  return cost;
}

// Estimated cost per session: ~$0.02-0.05
// 40 messages * ~500 input tokens * $0.003/1K = $0.06 input
// 40 messages * ~200 output tokens * $0.015/1K = $0.12 output
// Total: ~$0.18 per session worst case
```

---

## 7. Authentication & Authorization

### 7.1 Auth Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOWS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  EMAIL/PASSWORD FLOW:                                                        │
│  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐        │
│  │ Signup │───►│ Verify │───►│ Login  │───►│ JWT    │───►│ Access │        │
│  │ Form   │    │ Email  │    │ Form   │    │ Cookie │    │ App    │        │
│  └────────┘    └────────┘    └────────┘    └────────┘    └────────┘        │
│                                                                              │
│  OAUTH FLOW (Google/Apple):                                                  │
│  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐                       │
│  │ Click  │───►│ OAuth  │───►│ Callback│───►│ Access │                       │
│  │ Button │    │ Provider│   │ + JWT  │    │ App    │                       │
│  └────────┘    └────────┘    └────────┘    └────────┘                       │
│                                                                              │
│  SESSION REFRESH:                                                            │
│  JWT expires after 30 days                                                   │
│  Sliding expiration on activity                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 NextAuth Configuration

```typescript
// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db';
import { verifyPassword } from '@/lib/auth';

export const authOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 7.3 Authorization Rules

```typescript
// src/middleware.ts

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Additional authorization logic if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes
        const publicPaths = ['/', '/login', '/signup', '/pricing', '/api/auth'];
        if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
          return true;
        }

        // Protected routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 7.4 Session Authorization

```typescript
// src/lib/auth-guards.ts

export async function requireSessionAccess(sessionId: string, userId: string) {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: {
      partnership: true,
    },
  });

  if (!session) {
    throw new NotFoundError('Session not found');
  }

  const { partnership } = session;
  if (partnership.user1Id !== userId && partnership.user2Id !== userId) {
    throw new ForbiddenError('Not authorized to access this session');
  }

  return session;
}

export async function requirePartnershipAccess(partnershipId: string, userId: string) {
  const partnership = await db.query.partnerships.findFirst({
    where: eq(partnerships.id, partnershipId),
  });

  if (!partnership) {
    throw new NotFoundError('Partnership not found');
  }

  if (partnership.user1Id !== userId && partnership.user2Id !== userId) {
    throw new ForbiddenError('Not authorized to access this partnership');
  }

  return partnership;
}
```

---

## 8. Security Architecture

### 8.1 Security Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LAYER 1: NETWORK                                                            │
│  ├── HTTPS only (TLS 1.3)                                                    │
│  ├── Cloudflare/Vercel DDoS protection                                       │
│  └── Rate limiting at edge                                                   │
│                                                                              │
│  LAYER 2: APPLICATION                                                        │
│  ├── Input validation (Zod schemas)                                          │
│  ├── Output encoding (XSS prevention)                                        │
│  ├── CSRF protection (SameSite cookies)                                      │
│  ├── Content Security Policy headers                                         │
│  └── Prompt injection protection                                             │
│                                                                              │
│  LAYER 3: AUTHENTICATION                                                     │
│  ├── Bcrypt password hashing (cost 12)                                       │
│  ├── JWT with short expiry                                                   │
│  ├── Secure, HttpOnly, SameSite cookies                                      │
│  └── OAuth for social login                                                  │
│                                                                              │
│  LAYER 4: AUTHORIZATION                                                      │
│  ├── Session-based access control                                            │
│  ├── Partnership validation                                                  │
│  └── Subscription tier enforcement                                           │
│                                                                              │
│  LAYER 5: DATA                                                               │
│  ├── Encryption at rest (Neon default)                                       │
│  ├── Encryption in transit (TLS)                                             │
│  ├── Data minimization                                                       │
│  └── Secure deletion                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Security Headers

```typescript
// next.config.js

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.anthropic.com https://api.stripe.com;
    `.replace(/\n/g, ''),
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 8.3 Rate Limiting

```typescript
// src/lib/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Different rate limits for different endpoints
export const rateLimiters = {
  // Auth endpoints: strict limits
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
    prefix: 'rl:auth',
  }),

  // Message sending: moderate limits
  messages: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 per minute
    prefix: 'rl:messages',
  }),

  // General API: relaxed limits
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 per minute
    prefix: 'rl:api',
  }),
};

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  const { success, remaining } = await limiter.limit(identifier);
  return { success, remaining };
}
```

### 8.4 Prompt Injection Protection

```typescript
// src/ai/safety.ts

// Sanitize user input before sending to Claude
export function sanitizeUserInput(input: string): string {
  // Remove potential injection patterns
  const sanitized = input
    // Remove potential system prompt injections
    .replace(/\[SYSTEM\]/gi, '[INPUT]')
    .replace(/\[INST\]/gi, '[INPUT]')
    .replace(/<<SYS>>/gi, '')
    .replace(/<\|im_start\|>/gi, '')
    // Limit length
    .slice(0, 4000);

  return sanitized;
}

// Validate AI output before sending to user
export function validateAIOutput(output: string): string {
  // Ensure no sensitive information leakage
  const patterns = [
    /api[_-]?key/i,
    /password/i,
    /secret/i,
    /token/i,
  ];

  for (const pattern of patterns) {
    if (pattern.test(output)) {
      console.warn('Potential sensitive data in AI output, sanitizing');
      output = output.replace(pattern, '[REDACTED]');
    }
  }

  return output;
}
```

---

## 9. Deployment Architecture

### 9.1 Deployment Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  USERS                                                                       │
│    │                                                                         │
│    ▼                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        VERCEL EDGE NETWORK                           │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │    │
│  │  │ CDN (Static)│  │ Edge Cache  │  │ Edge Funcs  │                  │    │
│  │  │   Assets    │  │ (API Cache) │  │ (Rate Limit)│                  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │    │
│  └────────────────────────────┬────────────────────────────────────────┘    │
│                               │                                              │
│                               ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     VERCEL SERVERLESS                                │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │                    Next.js Application                         │  │    │
│  │  │                                                                │  │    │
│  │  │  • React Server Components (UI)                                │  │    │
│  │  │  • API Routes (Business Logic)                                 │  │    │
│  │  │  • Server Actions (Form Handling)                              │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  └────────────────────────────┬────────────────────────────────────────┘    │
│                               │                                              │
│         ┌─────────────────────┼─────────────────────┐                        │
│         │                     │                     │                        │
│         ▼                     ▼                     ▼                        │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐                │
│  │    Neon     │       │   Upstash   │       │   Anthropic │                │
│  │ PostgreSQL  │       │    Redis    │       │  Claude API │                │
│  │ (us-east-1) │       │  (Global)   │       │             │                │
│  └─────────────┘       └─────────────┘       └─────────────┘                │
│                                                                              │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐                │
│  │   Stripe    │       │   Resend    │       │   Sentry    │                │
│  │ (Payments)  │       │   (Email)   │       │  (Errors)   │                │
│  └─────────────┘       └─────────────┘       └─────────────┘                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Environment Configuration

```bash
# .env.local (development)
# .env.production (production - set in Vercel)

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." # For migrations

# Auth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="..." # Generate with: openssl rand -base64 32
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# AI
ANTHROPIC_API_KEY="sk-ant-..."

# Payments
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_PLUS="price_..."
STRIPE_PRICE_ID_PRO="price_..."

# Email
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourdomain.com"

# Redis
UPSTASH_REDIS_URL="https://..."
UPSTASH_REDIS_TOKEN="..."

# Monitoring
SENTRY_DSN="https://..."
POSTHOG_KEY="phc_..."
```

### 9.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install

      - run: pnpm lint

      - run: pnpm type-check

      - run: pnpm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 10. Monitoring & Observability

### 10.1 Monitoring Stack

| Tool | Purpose | Key Metrics |
|------|---------|-------------|
| **Vercel Analytics** | Performance, Web Vitals | LCP, FID, CLS |
| **Sentry** | Error tracking | Error rate, stack traces |
| **PostHog** | Product analytics | Sessions, funnels, retention |
| **Upstash** | Redis monitoring | Cache hit rate, latency |
| **Neon** | Database monitoring | Query performance, connections |

### 10.2 Key Metrics to Track

```typescript
// src/lib/analytics.ts

import posthog from 'posthog-js';

// Session Events
export function trackSessionStarted(sessionId: string, topic?: string) {
  posthog.capture('session_started', {
    sessionId,
    topic,
  });
}

export function trackSessionCompleted(sessionId: string, duration: number, outcome: string) {
  posthog.capture('session_completed', {
    sessionId,
    durationMinutes: Math.round(duration / 60000),
    outcome,
  });
}

export function trackMessageSent(sessionId: string, stage: string) {
  posthog.capture('message_sent', {
    sessionId,
    stage,
  });
}

// Conversion Events
export function trackSignup(method: 'email' | 'google' | 'apple') {
  posthog.capture('signup', { method });
}

export function trackSubscriptionStarted(tier: string) {
  posthog.capture('subscription_started', { tier });
}

// Quality Events
export function trackRatingSubmitted(sessionId: string, satisfactionRating: number, feelingHeardRating: number) {
  posthog.capture('rating_submitted', {
    sessionId,
    satisfactionRating,
    feelingHeardRating,
  });
}

export function trackCrisisDetected(sessionId: string) {
  posthog.capture('crisis_detected', {
    sessionId,
  });
}
```

### 10.3 Error Handling

```typescript
// src/lib/error-handling.ts

import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1, // 10% of transactions
    environment: process.env.NODE_ENV,
  });
}

export function captureError(error: Error, context?: Record<string, any>) {
  console.error(error);

  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(error);
  });
}

// API error handler
export function handleAPIError(error: unknown): Response {
  if (error instanceof ValidationError) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: error.message, details: error.details } },
      { status: 400 }
    );
  }

  if (error instanceof NotFoundError) {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: error.message } },
      { status: 404 }
    );
  }

  if (error instanceof ForbiddenError) {
    return Response.json(
      { error: { code: 'FORBIDDEN', message: error.message } },
      { status: 403 }
    );
  }

  // Unexpected error
  captureError(error as Error);

  return Response.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    { status: 500 }
  );
}
```

---

## 11. Development Guidelines

### 11.1 Project Structure

```
relationship-debugger/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Public pages
│   │   ├── (auth)/             # Auth pages
│   │   ├── (app)/              # Protected app pages
│   │   ├── api/                # API routes
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── session/            # Session-specific components
│   │   ├── dashboard/          # Dashboard components
│   │   └── shared/             # Shared components
│   │
│   ├── services/               # Business logic
│   │   ├── auth.service.ts
│   │   ├── session.service.ts
│   │   ├── message.service.ts
│   │   ├── ai.service.ts
│   │   ├── partnership.service.ts
│   │   └── billing.service.ts
│   │
│   ├── ai/                     # AI/LLM related
│   │   ├── prompts/            # System prompts
│   │   ├── session-manager.ts  # State machine
│   │   └── safety.ts           # Safety checks
│   │
│   ├── db/                     # Database
│   │   ├── schema.ts           # Drizzle schema
│   │   ├── migrations/         # Migrations
│   │   ├── queries/            # Query helpers
│   │   └── index.ts            # DB connection
│   │
│   ├── lib/                    # Utilities
│   │   ├── auth.ts             # Auth helpers
│   │   ├── rate-limit.ts       # Rate limiting
│   │   ├── validation.ts       # Zod schemas
│   │   ├── analytics.ts        # Event tracking
│   │   └── utils.ts            # General utils
│   │
│   └── types/                  # TypeScript types
│       └── index.ts
│
├── public/                     # Static assets
├── tests/                      # Test files
├── drizzle.config.ts           # Drizzle config
├── next.config.js              # Next.js config
├── tailwind.config.js          # Tailwind config
├── tsconfig.json               # TypeScript config
├── package.json
└── README.md
```

### 11.2 Coding Standards

```typescript
// Use Zod for all API request validation
const CreateSessionSchema = z.object({
  title: z.string().max(200).optional(),
});

// Use type inference from Zod
type CreateSessionInput = z.infer<typeof CreateSessionSchema>;

// Service functions are async and throw typed errors
async function createSession(input: CreateSessionInput, userId: string): Promise<Session> {
  // Validate subscription limits
  const user = await getUser(userId);
  if (!canCreateSession(user)) {
    throw new ForbiddenError('Session limit reached. Please upgrade.');
  }

  // Create session
  const session = await db.insert(sessions).values({
    // ...
  }).returning();

  return session[0];
}

// API routes use consistent error handling
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError('Not authenticated');
    }

    const body = await request.json();
    const input = CreateSessionSchema.parse(body);

    const result = await createSession(input, session.user.id);

    return Response.json({ session: result });
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### 11.3 Testing Strategy

```typescript
// Unit test example (Vitest)
// src/services/ai.service.test.ts

import { describe, it, expect, vi } from 'vitest';
import { detectEscalation, detectCrisisKeywords } from './ai.service';

describe('Safety Detection', () => {
  describe('detectEscalation', () => {
    it('detects all caps as escalation', () => {
      expect(detectEscalation('I AM SO ANGRY')).toBe(true);
    });

    it('detects profanity', () => {
      expect(detectEscalation('this is fucking ridiculous')).toBe(true);
    });

    it('does not flag normal messages', () => {
      expect(detectEscalation('I feel frustrated about this situation')).toBe(false);
    });
  });

  describe('detectCrisisKeywords', () => {
    it('detects suicide mentions', () => {
      expect(detectCrisisKeywords('I want to end my life')).toBe(true);
    });

    it('detects abuse mentions', () => {
      expect(detectCrisisKeywords('They hit me yesterday')).toBe(true);
    });

    it('does not flag normal conflict language', () => {
      expect(detectCrisisKeywords('We had a heated argument')).toBe(false);
    });
  });
});

// Integration test example (Playwright)
// tests/e2e/session.spec.ts

import { test, expect } from '@playwright/test';

test('user can complete a session', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'testpassword');
  await page.click('button[type="submit"]');

  // Start session
  await page.goto('/dashboard');
  await page.click('text=Start New Session');

  // Answer intake questions
  await expect(page.locator('.bot-message')).toContainText('What is the conflict about');
  await page.fill('textarea', 'Disagreement about household chores');
  await page.click('button:has-text("Send")');

  // Continue through session...
  await expect(page.locator('.bot-message')).toContainText('observation');
});
```

---

## Implementation Roadmap

### Sprint 1: Foundation (Week 1-2)
- [ ] Project setup (Next.js, TypeScript, Tailwind)
- [ ] Database schema and migrations
- [ ] Authentication (email + Google OAuth)
- [ ] Basic UI layout

### Sprint 2: Core Session (Week 3-4)
- [ ] Partnership invite/link flow
- [ ] Session creation
- [ ] AI integration (Claude)
- [ ] NVC prompt flow
- [ ] Message storage

### Sprint 3: Safety & Polish (Week 5-6)
- [ ] Escalation detection
- [ ] Crisis referral
- [ ] Session summary
- [ ] Email notifications
- [ ] UI polish

### Sprint 4: Billing & Launch (Week 7-8)
- [ ] Stripe integration
- [ ] Subscription tiers
- [ ] Usage limits
- [ ] Error monitoring (Sentry)
- [ ] Analytics (PostHog)
- [ ] Beta launch

---

*Document Version: 1.0*
*Last Updated: 2026-01-04*
*Status: Ready for Implementation*

---

**Next Steps (BMAD Phase 4 - Implementation):**
1. Initialize Next.js project with tech stack
2. Set up database and auth
3. Implement core session flow
4. Integrate Claude API
5. Add safety features
6. Add billing
7. Deploy MVP
