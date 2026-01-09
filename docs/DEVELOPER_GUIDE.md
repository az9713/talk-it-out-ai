# Developer Guide - Talk-It-Out-AI

A comprehensive guide for developers with C/C++/Java background who are new to full-stack web development.

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack Explained](#technology-stack-explained)
4. [Project Structure](#project-structure)
5. [Setting Up Development Environment](#setting-up-development-environment)
6. [Database Operations](#database-operations)
7. [Authentication System](#authentication-system)
8. [API Development](#api-development)
9. [Frontend Development](#frontend-development)
10. [AI Integration](#ai-integration)
11. [Testing](#testing)
12. [Debugging](#debugging)
13. [Common Tasks](#common-tasks)
14. [Troubleshooting](#troubleshooting)

---

## Introduction

### For C/C++/Java Developers

If you're coming from traditional compiled languages, here's what's different in web development:

| C/C++/Java Concept | Web Equivalent | Explanation |
|--------------------|----------------|-------------|
| `main()` function | Server entry point | Next.js handles this automatically |
| Header files (.h) | Import statements | `import { func } from './module'` |
| Compilation | Build process | `npm run build` transpiles TypeScript |
| Linking | Bundling | Webpack/Turbopack combines all files |
| Memory management | Garbage collected | JavaScript handles memory automatically |
| Threads | Async/await | Single-threaded with event loop |
| Function call | API request | HTTP requests replace direct calls |
| Return value | JSON response | `return { data: "value" }` |
| Struct/Class | TypeScript interface | `interface User { name: string }` |

### What is This Project?

Talk-It-Out-AI is a **full-stack web application** that:
1. Runs in a web browser (no installation needed)
2. Uses AI (Claude) to mediate conversations
3. Stores data in a cloud database
4. Authenticates users with email/password

---

## Architecture Overview

### The Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     FRONTEND (React)                       │  │
│  │   - What users see and interact with                       │  │
│  │   - Built with Next.js, React, Tailwind CSS                │  │
│  │   - Runs in the browser                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests (API calls)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR SERVER                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    BACKEND (Next.js API)                   │  │
│  │   - Business logic, authentication                         │  │
│  │   - API routes handle requests                             │  │
│  │   - Connects to database and AI                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
     ┌────────────┐   ┌────────────┐   ┌────────────┐
     │ PostgreSQL │   │   Claude   │   │  NextAuth  │
     │  Database  │   │    API     │   │   (Auth)   │
     └────────────┘   └────────────┘   └────────────┘
```

### Request Flow Example

When a user sends a message in a session:

```
1. User types message → clicks "Send"
2. Browser JavaScript captures the click
3. fetch() sends POST request to /api/sessions/[id]/messages
4. Server receives request
5. Server validates user is authenticated
6. Server checks message for safety concerns (AI call)
7. Server saves message to database
8. Server generates AI response (AI call)
9. Server saves AI response to database
10. Server returns both messages as JSON
11. Browser receives JSON response
12. React updates the UI to show new messages
```

---

## Technology Stack Explained

### Core Technologies

#### 1. Next.js 15 (Framework)

**What it is**: A React framework that handles both frontend AND backend.

**C++ Analogy**: Imagine if your IDE could automatically compile, link, and run your code, plus handle networking - that's Next.js for web apps.

**Key Concepts**:
- **App Router**: File-based routing. Create `app/about/page.tsx` and you get `/about` URL
- **Server Components**: React components that run on the server (default)
- **Client Components**: React components that run in the browser (add `'use client'` directive)
- **API Routes**: Server-side endpoints in `app/api/` folder

```typescript
// This is a Server Component (default) - runs on server
export default async function DashboardPage() {
  const data = await fetchFromDatabase(); // Can access database directly
  return <div>{data.name}</div>;
}

// This is a Client Component - runs in browser
'use client';
export default function Counter() {
  const [count, setCount] = useState(0); // Uses browser state
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### 2. TypeScript (Language)

**What it is**: JavaScript with static typing (like Java/C++).

**Why we use it**: Catches errors at compile time, not runtime.

```typescript
// TypeScript (what we write)
interface User {
  id: string;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return `Hello, ${user.name}`;
}

// Compile error if you pass wrong type:
greetUser({ id: 1, name: "John" }); // Error: 'email' is missing
```

#### 3. React (UI Library)

**What it is**: A library for building user interfaces with components.

**C++ Analogy**: Like building UI with reusable widgets/classes.

```tsx
// A React component is like a class that renders HTML
function MessageBubble({ message, isUser }) {
  return (
    <div className={isUser ? 'bg-blue-500' : 'bg-gray-200'}>
      <p>{message.content}</p>
      <span>{message.timestamp}</span>
    </div>
  );
}

// Use it like this (similar to instantiating objects)
<MessageBubble message={msg} isUser={true} />
```

#### 4. Tailwind CSS (Styling)

**What it is**: Utility-first CSS framework. Instead of writing CSS files, you add classes directly.

```html
<!-- Traditional CSS approach -->
<div class="message-bubble user-message">Hello</div>
<style>
  .message-bubble { padding: 10px; border-radius: 8px; }
  .user-message { background: blue; color: white; }
</style>

<!-- Tailwind approach (what we use) -->
<div class="p-2.5 rounded-lg bg-blue-500 text-white">Hello</div>
```

**Common Tailwind Classes**:
| Class | CSS Equivalent | Meaning |
|-------|---------------|---------|
| `p-4` | `padding: 1rem` | Padding on all sides |
| `mt-2` | `margin-top: 0.5rem` | Margin top |
| `flex` | `display: flex` | Flexbox container |
| `bg-blue-500` | `background: #3b82f6` | Blue background |
| `text-sm` | `font-size: 0.875rem` | Small text |
| `rounded-lg` | `border-radius: 0.5rem` | Rounded corners |

#### 5. Drizzle ORM (Database)

**What it is**: Type-safe database queries. Like JDBC but with TypeScript types.

**C++ Analogy**: Instead of raw SQL strings, you write type-safe function calls.

```typescript
// Raw SQL (error-prone)
const result = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

// Drizzle ORM (type-safe)
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
});
// TypeScript knows 'user' has id, name, email properties
```

#### 6. PostgreSQL (Database)

**What it is**: A relational database (like MySQL, Oracle).

**We use Neon**: A serverless PostgreSQL provider. No server to manage.

#### 7. NextAuth.js v5 (Authentication)

**What it is**: Handles user login/logout, sessions, and security.

**How it works**:
1. User submits email/password
2. NextAuth validates credentials against database
3. Creates a secure session (stored in a cookie)
4. Subsequent requests include the session cookie
5. Server can verify who's logged in

---

## Project Structure

```
talk-it-out-ai/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Route group for auth pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx     # /login page
│   │   │   └── signup/
│   │   │       └── page.tsx     # /signup page
│   │   ├── (dashboard)/         # Route group for protected pages
│   │   │   └── dashboard/
│   │   │       ├── page.tsx     # /dashboard page
│   │   │       ├── sessions/
│   │   │       │   ├── page.tsx # /dashboard/sessions
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx  # /dashboard/sessions/new
│   │   │       │   ├── join/
│   │   │       │   │   └── page.tsx  # /dashboard/sessions/join
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx  # /dashboard/sessions/abc123
│   │   │       ├── templates/
│   │   │       │   └── page.tsx # /dashboard/templates
│   │   │       ├── analytics/
│   │   │       │   └── page.tsx # /dashboard/analytics
│   │   │       ├── history/
│   │   │       │   ├── page.tsx # /dashboard/history
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx  # /dashboard/history/[id]
│   │   │       ├── goals/
│   │   │       │   └── page.tsx # /dashboard/goals
│   │   │       ├── partners/
│   │   │       │   └── page.tsx # /dashboard/partners
│   │   │       └── settings/
│   │   │           ├── page.tsx # /dashboard/settings
│   │   │           └── mediator/
│   │   │               └── page.tsx # /dashboard/settings/mediator
│   │   ├── api/                 # API endpoints
│   │   │   ├── auth/           # Auth API (handled by NextAuth)
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── sessions/       # Sessions API
│   │   │   │   ├── route.ts    # GET /api/sessions, POST /api/sessions
│   │   │   │   ├── join/
│   │   │   │   │   └── route.ts # POST /api/sessions/join
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts    # GET /api/sessions/[id]
│   │   │   │       ├── invite/
│   │   │   │       │   └── route.ts # POST /api/sessions/[id]/invite
│   │   │   │       ├── export/
│   │   │   │       │   └── route.ts # GET /api/sessions/[id]/export
│   │   │   │       ├── typing/
│   │   │   │       │   └── route.ts # POST /api/sessions/[id]/typing
│   │   │   │       └── messages/
│   │   │   │           └── route.ts # POST /api/sessions/[id]/messages
│   │   │   ├── templates/      # Templates API
│   │   │   │   ├── route.ts    # GET/POST /api/templates
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # GET/PUT/DELETE /api/templates/[id]
│   │   │   ├── analytics/      # Analytics API
│   │   │   │   └── route.ts    # GET /api/analytics
│   │   │   ├── insights/       # Session insights API
│   │   │   │   ├── route.ts    # GET /api/insights
│   │   │   │   └── sessions/
│   │   │   │       └── [id]/
│   │   │   │           └── route.ts # GET /api/insights/sessions/[id]
│   │   │   ├── goals/          # Goals API
│   │   │   │   ├── route.ts    # GET/POST /api/goals
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # GET/PUT/PATCH/DELETE /api/goals/[id]
│   │   │   ├── reminders/      # Reminders API
│   │   │   │   ├── route.ts    # GET/POST /api/reminders
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # DELETE /api/reminders/[id]
│   │   │   ├── cron/           # Cron jobs
│   │   │   │   └── reminders/
│   │   │   │       └── route.ts # GET /api/cron/reminders
│   │   │   ├── settings/       # Settings API
│   │   │   │   ├── mediator/
│   │   │   │   │   └── route.ts # GET/PUT /api/settings/mediator
│   │   │   │   └── preferences/
│   │   │   │       └── route.ts # GET/PUT /api/settings/preferences
│   │   │   └── partnerships/   # Partnerships API
│   │   │       └── route.ts
│   │   ├── layout.tsx          # Root layout (wraps all pages)
│   │   ├── page.tsx            # Landing page (/)
│   │   └── globals.css         # Global styles
│   ├── components/             # Reusable React components
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── progress.tsx
│   │   │   └── ...
│   │   ├── analytics/         # Analytics components
│   │   │   ├── stats-card.tsx
│   │   │   ├── sessions-chart.tsx
│   │   │   └── ...
│   │   ├── session-insights.tsx  # Session insights components
│   │   ├── goal-tracking.tsx     # Goal tracking components
│   │   ├── template-card.tsx     # Template display card
│   │   ├── voice-input-button.tsx # Voice input component
│   │   ├── reminder-scheduler.tsx # Reminder scheduling
│   │   ├── personality-preview.tsx # AI personality preview
│   │   ├── dashboard-nav.tsx     # Dashboard navigation
│   │   └── providers.tsx         # Context providers
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-realtime-messages.ts  # WebSocket messaging
│   │   ├── use-speech-recognition.ts # Voice input
│   │   └── use-audio-recorder.ts     # Audio recording
│   ├── lib/                   # Utilities and configs
│   │   ├── ai/               # AI integration
│   │   │   ├── index.ts      # AI functions
│   │   │   ├── prompts.ts    # System prompts
│   │   │   └── personality.ts # Personality customization
│   │   ├── db/               # Database
│   │   │   ├── index.ts      # DB connection
│   │   │   └── schema.ts     # Database schema
│   │   ├── email/            # Email integration
│   │   │   ├── index.ts      # Resend setup
│   │   │   └── templates/
│   │   │       └── reminder.tsx # Email templates
│   │   ├── export/           # Export functionality
│   │   │   ├── pdf-template.tsx  # PDF generation
│   │   │   └── markdown-template.ts
│   │   ├── pusher.ts         # Server-side Pusher
│   │   ├── pusher-client.ts  # Client-side Pusher
│   │   ├── auth.ts           # NextAuth configuration
│   │   └── utils.ts          # Helper functions
│   ├── services/             # Business logic layer
│   │   ├── session.ts        # Session operations
│   │   ├── session-participants.ts # Collaborative sessions
│   │   ├── partnership.ts    # Partnership operations
│   │   ├── templates.ts      # Template operations
│   │   ├── analytics.ts      # Analytics aggregation
│   │   ├── insights.ts       # Session insights
│   │   ├── goals.ts          # Goal tracking
│   │   ├── reminders.ts      # Reminder operations
│   │   └── mediator-settings.ts # AI personality settings
│   └── types/                # TypeScript type definitions
│       └── index.ts
├── docs/                     # Documentation
├── public/                   # Static files (images, etc.)
├── .env.local               # Environment variables (secrets)
├── drizzle.config.ts        # Drizzle ORM configuration
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
├── vercel.json              # Vercel cron configuration
└── tsconfig.json            # TypeScript configuration
```

### Understanding Route Groups

The `(auth)` and `(dashboard)` folders are **route groups**. The parentheses mean:
- They organize code but DON'T affect URLs
- `/login` not `/(auth)/login`
- `/dashboard` not `/(dashboard)/dashboard`

### Understanding Dynamic Routes

`[id]` in folder names creates dynamic routes:
- `sessions/[id]/page.tsx` matches `/sessions/abc123`, `/sessions/xyz789`, etc.
- Access the ID in code: `params.id`

---

## Setting Up Development Environment

### Step 1: Install Prerequisites

#### Install Node.js (Required)

Node.js is the JavaScript runtime (like JVM for Java).

**Windows**:
1. Go to https://nodejs.org/
2. Download the LTS version (20.x or higher)
3. Run the installer, accept all defaults
4. Verify installation:
   ```cmd
   node --version
   # Should show v20.x.x or higher

   npm --version
   # Should show 10.x.x or higher
   ```

**macOS**:
```bash
# Using Homebrew
brew install node@20

# Verify
node --version
npm --version
```

**Linux (Ubuntu/Debian)**:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

#### Install Git (Required)

**Windows**: Download from https://git-scm.com/download/win

**macOS**: `xcode-select --install` or `brew install git`

**Linux**: `sudo apt-get install git`

#### Install VS Code (Recommended)

1. Download from https://code.visualstudio.com/
2. Install these extensions:
   - **ESLint** - JavaScript/TypeScript linting
   - **Prettier** - Code formatting
   - **Tailwind CSS IntelliSense** - Tailwind autocomplete
   - **Prisma** - Database schema syntax (works for Drizzle too)

### Step 2: Clone and Install

```bash
# Clone the repository
git clone https://github.com/az9713/talk-it-out-ai.git

# Navigate to project directory
cd talk-it-out-ai

# Install dependencies
npm install
```

**What `npm install` does**:
- Reads `package.json` for list of dependencies
- Downloads all packages to `node_modules/` folder
- Creates `package-lock.json` with exact versions
- Similar to Maven/Gradle downloading JARs

### Step 3: Set Up Database

We use **Neon** for PostgreSQL hosting (free tier available).

1. **Create Neon Account**:
   - Go to https://neon.tech
   - Sign up (GitHub or email)
   - Create a new project (any name)

2. **Get Connection String**:
   - In Neon dashboard, click on your project
   - Copy the connection string (looks like):
     ```
     postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
     ```

3. **Create Environment File**:
   ```bash
   # Copy the example file
   cp .env.example .env.local
   ```

4. **Edit `.env.local`**:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require

   # Authentication
   NEXTAUTH_SECRET=generate-a-random-32-character-string-here
   NEXTAUTH_URL=http://localhost:3000

   # AI (get from console.anthropic.com)
   ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   ```

   **Generate NEXTAUTH_SECRET**:
   ```bash
   # On macOS/Linux
   openssl rand -base64 32

   # Or use any random string generator for a 32+ character string
   ```

5. **Apply Database Schema**:
   ```bash
   npx drizzle-kit push
   ```

   This creates all tables in your database.

### Step 4: Get Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy it to your `.env.local` file

### Step 5: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

**What happens**:
1. Next.js compiles your TypeScript code
2. Starts a development server on port 3000
3. Watches for file changes and hot-reloads
4. Shows errors in terminal and browser

---

## Database Operations

### Understanding the Schema

Our database has these tables:

```
users
├── id (primary key)
├── email (unique)
├── password (hashed)
├── name
├── createdAt
└── updatedAt

sessions (conflict resolution sessions)
├── id (primary key)
├── partnershipId (foreign key → partnerships)
├── initiatorId (foreign key → users)
├── topic
├── stage (intake, observation, feeling, need, request, etc.)
├── status (active, paused, completed, abandoned)
├── sessionMode (solo, collaborative)
├── inviteCode (unique, for partner joining)
├── inviteExpiresAt
├── currentSpeakerId
├── createdAt
└── updatedAt

session_participants
├── id (primary key)
├── sessionId (foreign key → sessions)
├── userId (foreign key → users)
├── role (initiator, partner)
├── joinedAt
├── lastSeenAt
└── isActive

messages
├── id (primary key)
├── sessionId (foreign key → sessions)
├── userId (null for AI messages)
├── senderId (foreign key → users, for collaborative)
├── role (user, assistant, system)
├── content
├── stage
├── audioUrl (for voice messages)
├── transcriptionSource (manual, web_speech, whisper)
├── createdAt
└── updatedAt

partnerships
├── id (primary key)
├── user1Id (foreign key → users)
├── user2Id (foreign key → users)
├── inviteCode
├── status (pending, active, ended)
├── createdAt
└── updatedAt

perspectives (NVC components for each user)
├── id (primary key)
├── sessionId (foreign key → sessions)
├── userId (foreign key → users)
├── observation
├── feeling
├── need
├── request
├── createdAt
└── updatedAt

agreements
├── id (primary key)
├── sessionId (foreign key → sessions)
├── content
├── agreedByUser1
├── agreedByUser2
├── createdAt
└── updatedAt

session_templates
├── id (primary key)
├── userId (foreign key → users, null for system templates)
├── name
├── description
├── category (household, finances, communication, parenting, work, other)
├── promptContext
├── suggestedOpening
├── isPublic
├── usageCount
├── createdAt
└── updatedAt

reminders
├── id (primary key)
├── userId (foreign key → users)
├── sessionId (foreign key → sessions)
├── type (follow_up, agreement_check, custom)
├── scheduledFor
├── sentAt
├── status (pending, sent, cancelled, failed)
├── message
└── createdAt

user_preferences
├── id (primary key)
├── userId (foreign key → users, unique)
├── emailReminders
├── reminderFrequency (daily, weekly, custom)
├── defaultFollowUpDays
├── createdAt
└── updatedAt

mediator_settings
├── id (primary key)
├── userId (foreign key → users, unique)
├── tone (warm, professional, direct, gentle)
├── formality (casual, balanced, formal)
├── responseLength (concise, moderate, detailed)
├── useEmoji
├── useMetaphors
├── culturalContext
├── createdAt
└── updatedAt

goals
├── id (primary key)
├── userId (foreign key → users)
├── title
├── description
├── category (communication, conflict_resolution, emotional_connection, trust_building, quality_time, boundaries, personal_growth, other)
├── status (active, completed, paused, abandoned)
├── targetDate
├── progress (0-100)
├── sessionsTarget
├── sessionsCompleted
├── celebrationShown
├── createdAt
├── updatedAt
└── completedAt

milestones
├── id (primary key)
├── goalId (foreign key → goals)
├── userId (foreign key → users)
├── title
├── description
├── targetProgress (0-100)
├── isAchieved
├── achievedAt
├── celebrationShown
└── createdAt
```

### Schema Definition (src/lib/db/schema.ts)

```typescript
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Common Database Operations

#### Reading Data

```typescript
import { db, users, sessions } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';

// Find one user by email
const user = await db.query.users.findFirst({
  where: eq(users.email, 'user@example.com'),
});

// Find all sessions for a user
const userSessions = await db.query.sessions.findMany({
  where: eq(sessions.initiatorId, userId),
  orderBy: [desc(sessions.updatedAt)],
});

// Find session with related data
const sessionWithMessages = await db.query.sessions.findFirst({
  where: eq(sessions.id, sessionId),
  with: {
    messages: true,
    initiator: true,
  },
});
```

#### Creating Data

```typescript
// Insert a new session
const [newSession] = await db
  .insert(sessions)
  .values({
    initiatorId: userId,
    topic: 'Household chores',
    stage: 'intake',
    status: 'active',
  })
  .returning();
```

#### Updating Data

```typescript
// Update session status
await db
  .update(sessions)
  .set({
    status: 'completed',
    updatedAt: new Date(),
  })
  .where(eq(sessions.id, sessionId));
```

#### Deleting Data

```typescript
// Delete a message
await db
  .delete(messages)
  .where(eq(messages.id, messageId));
```

### Database Migrations

When you change the schema:

```bash
# Apply changes to database
npx drizzle-kit push

# Generate migration file (optional, for production)
npx drizzle-kit generate

# Open database GUI
npx drizzle-kit studio
```

---

## Authentication System

### How NextAuth Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User submits login form                                      │
│     ↓                                                            │
│  2. POST /api/auth/callback/credentials                          │
│     ↓                                                            │
│  3. NextAuth calls authorize() function                          │
│     ↓                                                            │
│  4. We validate email/password against database                  │
│     ↓                                                            │
│  5. If valid, NextAuth creates session JWT                       │
│     ↓                                                            │
│  6. JWT stored in HTTP-only cookie                               │
│     ↓                                                            │
│  7. Subsequent requests include cookie automatically             │
│     ↓                                                            │
│  8. Server can call auth() to get current user                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Configuration (src/lib/auth.ts)

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        // Find user by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (!user) return null;

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        // Return user object (stored in session)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  // ... additional config
});
```

### Using Authentication in Code

#### In Server Components

```typescript
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <h1>Welcome, {session.user.name}</h1>;
}
```

#### In API Routes

```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // User is authenticated, proceed...
}
```

#### In Client Components

```typescript
'use client';
import { useSession } from 'next-auth/react';

export function UserGreeting() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return <p>Please log in</p>;

  return <p>Hello, {session.user.name}</p>;
}
```

---

## API Development

### API Route Structure

API routes live in `src/app/api/`. The file structure determines the URL:

```
src/app/api/
├── sessions/
│   ├── route.ts          → /api/sessions (GET, POST)
│   └── [id]/
│       ├── route.ts      → /api/sessions/[id] (GET, PUT, DELETE)
│       └── messages/
│           └── route.ts  → /api/sessions/[id]/messages (GET, POST)
```

### Example API Route

```typescript
// src/app/api/sessions/route.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getUserSessions, createSession } from '@/services/session';

// GET /api/sessions - List all sessions for current user
export async function GET() {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Fetch data
    const sessions = await getUserSessions(session.user.id);

    // 3. Return response
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { topic, partnershipId } = body;

    // Validate input
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Create session
    const newSession = await createSession(
      partnershipId || null,
      session.user.id,
      topic
    );

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST that creates resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Logged in but not allowed |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

### Calling APIs from Frontend

```typescript
// Fetch all sessions
const response = await fetch('/api/sessions');
const sessions = await response.json();

// Create a new session
const response = await fetch('/api/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    topic: 'Communication issues',
  }),
});
const newSession = await response.json();
```

---

## Frontend Development

### React Component Anatomy

```tsx
// 1. Imports
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// 2. TypeScript interfaces
interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// 3. Component function
export function Message({ content, isUser, timestamp }: MessageProps) {
  // 4. State (data that can change)
  const [expanded, setExpanded] = useState(false);

  // 5. Effects (side effects like API calls)
  useEffect(() => {
    console.log('Message rendered');
  }, []); // Empty array = run once on mount

  // 6. Event handlers
  const handleClick = () => {
    setExpanded(!expanded);
  };

  // 7. Render JSX
  return (
    <div
      className={`p-4 rounded-lg ${isUser ? 'bg-blue-500' : 'bg-gray-200'}`}
      onClick={handleClick}
    >
      <p>{content}</p>
      {expanded && (
        <span className="text-sm text-gray-500">
          {timestamp.toLocaleString()}
        </span>
      )}
    </div>
  );
}
```

### State Management with useState

```tsx
'use client';
import { useState } from 'react';

export function Counter() {
  // useState returns [currentValue, setterFunction]
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}
```

### Fetching Data with useEffect

```tsx
'use client';
import { useState, useEffect } from 'react';

export function SessionsList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch('/api/sessions');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setSessions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []); // Empty array = run once on component mount

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {sessions.map(session => (
        <li key={session.id}>{session.topic}</li>
      ))}
    </ul>
  );
}
```

### Using shadcn/ui Components

shadcn/ui provides pre-built, customizable components.

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Adding New shadcn/ui Components

```bash
# Add a new component
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add select

# Component appears in src/components/ui/
```

---

## AI Integration

### How Claude Integration Works

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI Integration Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User sends message                                              │
│     ↓                                                            │
│  API route receives message                                      │
│     ↓                                                            │
│  checkSafety(message) - Check for crisis indicators              │
│     ↓                                                            │
│  If crisis detected → Return safety resources                    │
│     ↓                                                            │
│  Build conversation context (history + system prompt)            │
│     ↓                                                            │
│  Call Claude API with context                                    │
│     ↓                                                            │
│  Parse response, extract stage transitions                       │
│     ↓                                                            │
│  Save message and response to database                           │
│     ↓                                                            │
│  Return response to frontend                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### AI Functions (src/lib/ai/index.ts)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, SAFETY_CHECK_PROMPT } from './prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Check message for safety concerns
export async function checkSafety(message: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: SAFETY_CHECK_PROMPT,
    messages: [{ role: 'user', content: message }],
  });

  const text = response.content[0].type === 'text'
    ? response.content[0].text
    : '';

  return {
    isSafe: !text.includes('CRISIS'),
    response: text,
  };
}

// Generate AI mediator response
export async function generateResponse(
  messages: Array<{ role: string; content: string }>,
  currentStage: string
) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  const text = response.content[0].type === 'text'
    ? response.content[0].text
    : '';

  // Parse stage from response if present
  const stageMatch = text.match(/\[STAGE: (\w+)\]/);
  const newStage = stageMatch ? stageMatch[1] : currentStage;

  return {
    content: text.replace(/\[STAGE: \w+\]/, '').trim(),
    stage: newStage,
  };
}
```

### System Prompts (src/lib/ai/prompts.ts)

```typescript
export const SYSTEM_PROMPT = `You are a compassionate AI mediator trained in Nonviolent Communication (NVC).

Your role is to guide users through conflict resolution using the NVC framework:
1. OBSERVATION - What happened? (facts, not judgments)
2. FEELING - How does it make you feel?
3. NEED - What underlying need isn't being met?
4. REQUEST - What specific, actionable request would help?

Guidelines:
- Be warm, empathetic, and non-judgmental
- Ask one question at a time
- Reflect back what you hear to show understanding
- Gently guide toward deeper understanding
- Help identify underlying feelings and needs
- Suggest specific, actionable requests

When you determine the conversation should move to a new stage, include:
[STAGE: stage_name]

Available stages: intake, observation, feeling, need, request, reflection, common_ground, agreement`;

export const SAFETY_CHECK_PROMPT = `You are a safety monitor. Analyze the message for:
- Self-harm or suicide indicators
- Threats of violence
- Signs of abuse (physical, emotional, sexual)
- Severe mental health crisis

If you detect any crisis indicators, respond with:
CRISIS: [type]
[Appropriate resources and guidance]

If the message is safe, respond with:
SAFE`;
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testPathPattern="session"
```

### Writing Tests

```typescript
// src/services/__tests__/session.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createSession, getSession } from '../session';

describe('Session Service', () => {
  beforeEach(async () => {
    // Clean up test data before each test
  });

  it('creates a new session', async () => {
    const session = await createSession(
      null,
      'user-123',
      'Test topic'
    );

    expect(session).toBeDefined();
    expect(session.topic).toBe('Test topic');
    expect(session.status).toBe('active');
    expect(session.stage).toBe('intake');
  });

  it('retrieves a session with messages', async () => {
    const created = await createSession(null, 'user-123', 'Test');
    const retrieved = await getSession(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved.id).toBe(created.id);
    expect(Array.isArray(retrieved.messages)).toBe(true);
  });
});
```

---

## Debugging

### Common Debugging Techniques

#### 1. Console Logging

```typescript
// Server-side (shows in terminal)
console.log('User ID:', userId);
console.log('Request body:', JSON.stringify(body, null, 2));

// Client-side (shows in browser DevTools Console)
console.log('State updated:', sessions);
```

#### 2. Browser DevTools

1. **Open DevTools**: F12 or Right-click → Inspect
2. **Network Tab**: See all API requests/responses
3. **Console Tab**: See logs and errors
4. **React DevTools**: Install browser extension to inspect components

#### 3. VS Code Debugger

Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

### Common Errors and Solutions

#### "Module not found"

```
Error: Module not found: Can't resolve '@/components/ui/xyz'
```

**Solution**: The component doesn't exist. Add it:
```bash
npx shadcn@latest add xyz
```

#### "Hydration mismatch"

```
Error: Hydration failed because the initial UI does not match
```

**Solution**: Server and client rendered different HTML. Common causes:
- Using `Date.now()` or `Math.random()` in render
- Browser extensions modifying DOM
- Different data on server vs client

#### "Unauthorized" (401)

**Solution**: User isn't logged in or session expired:
1. Check if you're calling `auth()` correctly
2. Verify the session exists in cookies
3. Try logging out and back in

#### Database Connection Error

```
Error: Connection terminated unexpectedly
```

**Solution**:
1. Check DATABASE_URL in `.env.local`
2. Verify Neon database is active
3. Check if IP is allowed (Neon dashboard)

---

## Common Tasks

### Adding a New Page

1. Create the file:
   ```bash
   # For /dashboard/newpage
   mkdir -p src/app/(dashboard)/dashboard/newpage
   touch src/app/(dashboard)/dashboard/newpage/page.tsx
   ```

2. Add the component:
   ```tsx
   import { auth } from '@/lib/auth';
   import { redirect } from 'next/navigation';

   export default async function NewPage() {
     const session = await auth();
     if (!session) redirect('/login');

     return (
       <div>
         <h1>New Page</h1>
       </div>
     );
   }
   ```

### Adding a New API Endpoint

1. Create the file:
   ```bash
   mkdir -p src/app/api/newendpoint
   touch src/app/api/newendpoint/route.ts
   ```

2. Add the handler:
   ```typescript
   import { auth } from '@/lib/auth';
   import { NextResponse } from 'next/server';

   export async function GET() {
     const session = await auth();
     if (!session?.user?.id) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     return NextResponse.json({ message: 'Hello!' });
   }
   ```

### Adding a Database Table

1. Edit `src/lib/db/schema.ts`:
   ```typescript
   export const newTable = pgTable('new_table', {
     id: uuid('id').defaultRandom().primaryKey(),
     name: text('name').notNull(),
     createdAt: timestamp('created_at').defaultNow().notNull(),
   });
   ```

2. Apply to database:
   ```bash
   npx drizzle-kit push
   ```

### Adding a Service Function

1. Create or edit file in `src/services/`:
   ```typescript
   // src/services/newservice.ts
   import { db, newTable } from '@/lib/db';
   import { eq } from 'drizzle-orm';

   export async function createNew(name: string) {
     const [created] = await db
       .insert(newTable)
       .values({ name })
       .returning();
     return created;
   }

   export async function getAll() {
     return db.query.newTable.findMany();
   }
   ```

---

## Troubleshooting

### Development Server Won't Start

1. **Check Node version**: `node --version` (need 20+)
2. **Clear cache**: `rm -rf .next node_modules && npm install`
3. **Check port**: Make sure port 3000 isn't in use
4. **Check `.env.local`**: All required variables set?

### Database Connection Issues

1. **Check Neon dashboard**: Is the database active?
2. **Verify connection string**: Copy fresh from Neon
3. **Check SSL**: Connection string should have `?sslmode=require`
4. **Check IP allowlist**: Neon may restrict IPs

### Authentication Not Working

1. **Check NEXTAUTH_SECRET**: Is it set in `.env.local`?
2. **Check NEXTAUTH_URL**: Should be `http://localhost:3000`
3. **Clear cookies**: DevTools → Application → Cookies → Clear
4. **Check console**: Any auth errors logged?

### API Returns 500 Error

1. **Check terminal**: Server-side errors appear here
2. **Add try/catch**: Wrap code to catch specific error
3. **Log the error**: `console.error(error)` to see details
4. **Check database**: Is the query valid?

### Styling Not Applied

1. **Check Tailwind config**: Is the path in `content` array?
2. **Check class names**: Typos in Tailwind classes?
3. **Clear cache**: `rm -rf .next && npm run dev`
4. **Check component imports**: Using correct shadcn/ui component?

---

## Getting Help

1. **Check documentation**:
   - [Next.js Docs](https://nextjs.org/docs)
   - [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
   - [NextAuth.js Docs](https://authjs.dev/)
   - [Tailwind CSS Docs](https://tailwindcss.com/docs)
   - [shadcn/ui Docs](https://ui.shadcn.com/)

2. **Search errors**: Copy the error message and search online

3. **Check the CLAUDE.md file**: Context for AI assistants

4. **Review existing code**: The codebase has examples of most patterns

---

## Next Steps

After understanding this guide:

1. **Explore the codebase**: Read through key files
2. **Make a small change**: Fix a typo, add a feature
3. **Run and test**: Verify your changes work
4. **Read the User Guide**: Understand how users use the app
5. **Review the Architecture doc**: Understand system design decisions
