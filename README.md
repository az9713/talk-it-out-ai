# Talk-It-Out-AI

> AI-guided conflict resolution using therapeutic dialogue techniques.

An AI mediator that helps couples and teams work through disagreements using Nonviolent Communication (NVC) principles.

## What is Talk-It-Out-AI?

Talk-It-Out-AI facilitates structured dialogues in personal conflicts by orchestrating conversations using proven therapy dialogue techniques. Acting as a neutral AI mediator, it guides users through the NVC framework to understand each other's feelings and needs, transforming conflicts into opportunities for deeper connection.

### Key Features

- **AI-Guided Mediation** - Claude AI facilitates conversations using therapeutic dialogue techniques
- **Structured NVC Process** - Guided steps through Observation, Feeling, Need, and Request
- **Safety Monitoring** - Automatic detection of crisis situations with appropriate resources
- **Session Persistence** - Save and continue conversations across multiple sessions
- **Partner Connections** - Invite partners or teammates to participate in sessions
- **Progress Tracking** - Visual indicators of conversation stage and session status

## Quick Start

### Prerequisites

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **PostgreSQL Database** - We recommend [Neon](https://neon.tech/) (free tier available)
- **Anthropic API Key** - [Get one here](https://console.anthropic.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/az9713/talk-it-out-ai.git
cd talk-it-out-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see Environment Setup below)

# 4. Set up the database
npx drizzle-kit push

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Setup

Create a `.env.local` file with:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Authentication
NEXTAUTH_SECRET=your-random-secret-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000

# AI (Anthropic Claude)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**How to get these values:**

1. **DATABASE_URL**: Sign up at [neon.tech](https://neon.tech), create a project, and copy the connection string
2. **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32` or use any 32+ character random string
3. **ANTHROPIC_API_KEY**: Get from [console.anthropic.com](https://console.anthropic.com/settings/keys)

## Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [Quick Start Guide](docs/QUICK_START.md) | 10 hands-on use cases to learn the app | New users |
| [User Guide](docs/USER_GUIDE.md) | Complete user documentation | All users |
| [Developer Guide](docs/DEVELOPER_GUIDE.md) | Technical documentation for developers | Developers |
| [Neon DB Setup](docs/NEON_DB_SETUP.md) | Detailed database setup guide | Developers |
| [PRD](docs/relationship_debugger_PRD.md) | Product Requirements Document (Historical) | Product/Dev |
| [Architecture](docs/relationship_debugger_architecture.md) | Technical architecture (Historical) | Developers |
| [BMAD Tutorial](docs/BMAD_Tutorial.md) | BMAD methodology overview | All |
| [CLAUDE.md](CLAUDE.md) | AI assistant context | AI/Developers |
| [Acknowledgments](ACKNOWLEDGMENTS.md) | Credits and methodology | All |

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Next.js 15 | Full-stack React framework |
| Language | TypeScript | Type-safe JavaScript |
| Styling | Tailwind CSS | Utility-first CSS |
| UI | shadcn/ui | Accessible components |
| Database | PostgreSQL (Neon) | Data persistence |
| ORM | Drizzle | Type-safe queries |
| Auth | NextAuth.js v5 | Authentication |
| AI | Anthropic Claude | Conversation AI |

## Project Structure

```
talk-it-out-ai/
├── src/
│   ├── app/                 # Pages and API routes
│   │   ├── (auth)/         # Login, signup pages
│   │   ├── (dashboard)/    # Protected dashboard
│   │   └── api/            # API endpoints
│   ├── components/         # React components
│   ├── lib/               # Utilities, DB, AI
│   ├── services/          # Business logic
│   └── types/             # TypeScript types
├── docs/                  # Documentation
└── public/               # Static assets
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Database Commands

```bash
npx drizzle-kit push     # Apply schema changes to database
npx drizzle-kit studio   # Open database GUI (optional)
```

## How It Works

### The NVC Process

Talk-It-Out-AI guides users through the Nonviolent Communication process:

```
1. OBSERVATION  → What happened? (facts, not judgments)
2. FEELING      → How do you feel about it?
3. NEED         → What need isn't being met?
4. REQUEST      → What specific action would help?
```

### Session Flow

```
Create Session → AI Welcome → User Shares → AI Guides →
Progress Stages → Find Common Ground → Reach Agreement
```

### Safety Features

The AI monitors conversations for:
- Crisis indicators (self-harm, danger)
- Abuse patterns
- Escalating tension

When detected, it provides appropriate resources and de-escalation.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

This project was built entirely with AI assistance. See [ACKNOWLEDGMENTS.md](ACKNOWLEDGMENTS.md) for full details.

**Key credits:**
- **All code and documentation** generated by [Claude Code](https://claude.ai/claude-code) powered by Claude Opus 4.5
- **Database setup & UI debugging** automated by [Claude in Chrome](https://chromewebstore.google.com/detail/claude-in-chrome/)
- **Product planning** via [BMAD Method](https://github.com/bmad-method/BMAD-METHOD) for PRD generation
- **Development workflow** powered by [Superpowers Plugin](https://github.com/superpowers-ai/superpowers) skills:
  - `/superpowers:brainstorming` - Design exploration
  - `/superpowers:writing-plans` - Implementation planning
  - `/superpowers:subagent-driven-development` - Task execution
- **Therapy framework**: [Nonviolent Communication](https://www.cnvc.org/) by Marshall Rosenberg
- **Tech stack**: [Next.js](https://nextjs.org/), [shadcn/ui](https://ui.shadcn.com/), [Drizzle ORM](https://orm.drizzle.team/), [Neon](https://neon.tech/)
