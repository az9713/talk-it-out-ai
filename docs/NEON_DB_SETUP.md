# Neon PostgreSQL Database Setup Guide

A comprehensive guide to setting up Neon PostgreSQL for Talk-It-Out-AI.

## Table of Contents

1. [What is Neon?](#what-is-neon)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Connecting to Your Application](#connecting-to-your-application)
5. [Applying the Database Schema](#applying-the-database-schema)
6. [Verifying Your Setup](#verifying-your-setup)
7. [Database Management](#database-management)
8. [Troubleshooting](#troubleshooting)
9. [Security Best Practices](#security-best-practices)

---

## What is Neon?

**Neon** is a serverless PostgreSQL database platform. Unlike traditional databases that require you to manage servers, Neon:

- **Scales automatically** - handles traffic spikes without configuration
- **Sleeps when idle** - saves costs during inactivity
- **Provides instant branching** - create database copies for testing
- **Offers a generous free tier** - perfect for development and small projects

### Why We Use Neon

| Feature | Benefit |
|---------|---------|
| Serverless | No server management needed |
| Free Tier | 0.5 GB storage, 191 compute hours/month |
| Instant Setup | Database ready in seconds |
| Modern UI | Easy-to-use dashboard |
| Branching | Safe testing without affecting production |

---

## Prerequisites

Before starting, you need:

1. **An email address** for creating a Neon account
2. **A web browser** (Chrome, Firefox, Safari, or Edge)
3. **The project cloned** to your local machine

---

## Step-by-Step Setup

### Step 1: Create a Neon Account

1. **Go to Neon**: Open https://neon.tech in your browser

2. **Click "Sign Up"** or "Get Started Free"

3. **Choose a sign-up method**:
   - **GitHub** (recommended - fastest)
   - **Google**
   - **Email/Password**

4. **Complete verification** if using email

5. **You're now on the Neon dashboard**

### Step 2: Create a New Project

1. **Click "New Project"** (or it may auto-prompt for first project)

2. **Configure your project**:

   | Field | Recommended Value | Notes |
   |-------|-------------------|-------|
   | **Project name** | `talk-it-out-ai` | Any descriptive name |
   | **Region** | Closest to your users | e.g., `US East (N. Virginia)` |
   | **PostgreSQL version** | `16` (latest) | Default is fine |
   | **Compute size** | `0.25 vCPU` | Free tier default |

3. **Click "Create Project"**

4. **Wait a few seconds** - your database is being provisioned

### Step 3: Get Your Connection String

After project creation, Neon shows your connection details:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Connection Details                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Host:     ep-cool-water-123456.us-east-2.aws.neon.tech             │
│  Database: neondb                                                    │
│  User:     your-username                                             │
│  Password: ••••••••••••                                              │
│                                                                      │
│  Connection string:                                                  │
│  postgresql://your-username:password@ep-cool-water-123456           │
│              .us-east-2.aws.neon.tech/neondb?sslmode=require        │
│                                                                      │
│  [Copy] [Show Password]                                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Important**:
- Click **"Show Password"** to reveal it
- Click **"Copy"** on the connection string
- **Save this somewhere safe** - you'll need it!

### Step 4: Understanding the Connection String

The connection string follows this format:

```
postgresql://USERNAME:PASSWORD@HOST/DATABASE?sslmode=require
```

| Component | Example | Description |
|-----------|---------|-------------|
| `postgresql://` | - | Protocol (always the same) |
| `USERNAME` | `neondb_owner` | Your database username |
| `PASSWORD` | `abc123xyz` | Your database password |
| `HOST` | `ep-cool-water-123456.us-east-2.aws.neon.tech` | Neon server address |
| `DATABASE` | `neondb` | Database name |
| `?sslmode=require` | - | Security setting (required) |

---

## Connecting to Your Application

### Step 1: Create Environment File

In your project root, create a `.env.local` file:

```bash
# If .env.example exists, copy it
cp .env.example .env.local

# Or create a new file
touch .env.local
```

### Step 2: Add Your Connection String

Open `.env.local` and add your credentials:

```env
# Database (Neon PostgreSQL)
# Paste your connection string from Neon dashboard
DATABASE_URL="postgresql://your-username:your-password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Authentication
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-32-character-random-string-here"
AUTH_URL="http://localhost:3000"

# Anthropic API (for AI features)
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Generate AUTH_SECRET

You need a random string for session encryption:

**On macOS/Linux:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

**Or use an online generator:**
- https://generate-secret.vercel.app/32

Copy the output and paste it as your `AUTH_SECRET` value.

---

## Applying the Database Schema

### What This Does

The database schema creates all the tables needed for Talk-It-Out-AI:

- `users` - User accounts
- `sessions` - Conflict resolution sessions
- `messages` - Chat messages
- `partnerships` - User connections
- `perspectives` - NVC components
- `agreements` - Resolution agreements

### Step 1: Install Dependencies (if not done)

```bash
npm install
```

### Step 2: Push Schema to Database

```bash
npx drizzle-kit push
```

**Expected output:**
```
Reading config file 'drizzle.config.ts'
Using 'pg' driver for database connection
[✓] Pulling schema from database...
[✓] Changes applied successfully!

Your schema is now in sync with the database.
```

### Step 3: Verify Tables Were Created

You can verify in the Neon dashboard:

1. Go to https://console.neon.tech
2. Select your project
3. Click **"Tables"** in the left sidebar
4. You should see all tables listed

Or use the Drizzle Studio:

```bash
npx drizzle-kit studio
```

This opens a web-based database viewer at `http://localhost:4983`.

---

## Verifying Your Setup

### Quick Verification

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the app:**
   Navigate to http://localhost:3000

3. **Create an account:**
   - Click "Sign Up"
   - Enter name, email, password
   - If it succeeds, your database is working!

### Manual Database Check

In Neon dashboard:

1. Go to **SQL Editor** (left sidebar)
2. Run this query:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```
3. You should see your tables listed

---

## Database Management

### Viewing Your Data

**Option 1: Neon Dashboard**
1. Go to https://console.neon.tech
2. Select your project
3. Click **"Tables"** to browse data
4. Click **"SQL Editor"** to run queries

**Option 2: Drizzle Studio**
```bash
npx drizzle-kit studio
```

**Option 3: Command Line (psql)**
```bash
# Install psql if needed
# Connect using your connection string
psql "postgresql://user:pass@host/db?sslmode=require"
```

### Common SQL Queries

```sql
-- Count all users
SELECT COUNT(*) FROM users;

-- View recent sessions
SELECT * FROM sessions ORDER BY created_at DESC LIMIT 10;

-- Check messages in a session
SELECT * FROM messages WHERE session_id = 'your-session-id';

-- View active partnerships
SELECT * FROM partnerships WHERE status = 'active';
```

### Creating Database Branches (Advanced)

Neon allows you to create branches for testing:

1. In Neon dashboard, click **"Branches"**
2. Click **"Create Branch"**
3. Name it (e.g., `testing`)
4. Get the new connection string
5. Use in a separate `.env.testing` file

This lets you test changes without affecting production data.

---

## Troubleshooting

### Connection Refused / Cannot Connect

**Symptoms:**
```
Error: Connection refused
Error: ECONNREFUSED
```

**Solutions:**
1. **Check connection string** - Copy fresh from Neon dashboard
2. **Check for typos** - Especially in username/password
3. **Verify SSL** - Connection string must include `?sslmode=require`
4. **Check firewall** - Neon should work from anywhere, but verify your network

### Authentication Failed

**Symptoms:**
```
Error: password authentication failed for user "xxx"
```

**Solutions:**
1. **Reset password** in Neon dashboard:
   - Go to project settings
   - Click "Reset Password"
   - Update `.env.local` with new password
2. **Check for special characters** - If password has special characters, URL-encode them

### Database Does Not Exist

**Symptoms:**
```
Error: database "xxx" does not exist
```

**Solutions:**
1. **Verify database name** - Default is `neondb`
2. **Check project** - Make sure you're using the right project's connection string

### Tables Not Found

**Symptoms:**
```
Error: relation "users" does not exist
```

**Solutions:**
1. **Run schema push:**
   ```bash
   npx drizzle-kit push
   ```
2. **Check connection** - You might be connected to wrong database

### Timeout Errors

**Symptoms:**
```
Error: Connection timed out
Error: Query timeout
```

**Solutions:**
1. **Wait and retry** - Neon cold starts can take a few seconds
2. **Check Neon status** - Visit https://neonstatus.com
3. **Try a different region** - Your region might have issues

### Schema Migration Errors

**Symptoms:**
```
Error: column "xxx" already exists
Error: cannot drop column
```

**Solutions:**
1. **For development** - Reset database:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```
   Then run `npx drizzle-kit push` again

2. **For production** - Use proper migrations:
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

---

## Security Best Practices

### Never Commit Credentials

Your `.gitignore` should include:
```
.env
.env.local
.env.*.local
```

### Use Environment Variables

Never hardcode credentials in your code:

```javascript
// ❌ BAD
const db = connect("postgresql://user:password@host/db");

// ✅ GOOD
const db = connect(process.env.DATABASE_URL);
```

### Rotate Credentials Periodically

1. Go to Neon dashboard
2. Project Settings → Reset Password
3. Update your `.env.local`
4. Restart your application

### Use Separate Databases for Environments

| Environment | Database |
|-------------|----------|
| Development | `talk-it-out-dev` |
| Staging | `talk-it-out-staging` |
| Production | `talk-it-out-prod` |

Create separate Neon projects or use branches for each.

### Monitor Database Access

Neon provides:
- **Query logs** - See what queries are running
- **Connection logs** - See who's connecting
- **Usage metrics** - Monitor compute and storage

Access these in the Neon dashboard under "Monitoring".

---

## Quick Reference

### Essential Commands

```bash
# Apply schema changes
npx drizzle-kit push

# Generate migrations
npx drizzle-kit generate

# Open database GUI
npx drizzle-kit studio

# Check schema status
npx drizzle-kit check
```

### Connection String Template

```
postgresql://USERNAME:PASSWORD@ENDPOINT.REGION.aws.neon.tech/DATABASE?sslmode=require
```

### Environment Variables Needed

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=random-32-chars
AUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Getting Help

- **Neon Documentation**: https://neon.tech/docs
- **Neon Discord**: https://discord.gg/neon
- **Drizzle ORM Docs**: https://orm.drizzle.team
- **Project Issues**: Check the project's GitHub issues

---

## Note on Automated Setup

This project was developed with **Claude in Chrome**, which can automate Neon database setup with minimal manual intervention. If you have Claude in Chrome installed, you can:

1. Provide your Neon username and password
2. Claude in Chrome can navigate the Neon dashboard
3. Create the project and database
4. Copy the connection string
5. Update your environment file

This significantly reduces the manual steps required for database setup.
