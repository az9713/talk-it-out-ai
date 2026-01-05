# BMAD Method: A Complete Tutorial for Classical Programmers

> **Target Audience**: Developers with C, C++, Java, and OOP experience who are new to product development methodologies, web applications, and AI-assisted development.

---

## Table of Contents

1. [Introduction: Why This Tutorial Exists](#1-introduction)
2. [Part A: Foundation Concepts](#part-a-foundation-concepts)
   - [What is a SaaS Application?](#what-is-a-saas-application)
   - [Full-Stack Web Architecture](#full-stack-web-architecture)
   - [Bridging C/C++/Java to Web Development](#bridging-cc-java-to-web-development)
3. [Part B: Product Development Fundamentals](#part-b-product-development-fundamentals)
   - [Why We Need Product Development Methodologies](#why-we-need-product-development-methodologies)
   - [Key Documents: PRD, SPEC, and Architecture](#key-documents)
4. [Part C: The BMAD Method](#part-c-the-bmad-method)
   - [What is BMAD?](#what-is-bmad)
   - [The Four Phases](#the-four-phases)
   - [The Agent Team](#the-agent-team)
   - [Workflow Tracks](#workflow-tracks)
5. [Part D: Practical Application](#part-d-practical-application)
   - [Installation and Setup](#installation-and-setup)
   - [Step-by-Step Workflow](#step-by-step-workflow)
   - [Document Templates](#document-templates)
6. [Part E: Code Examples](#part-e-code-examples---building-a-complete-feature)
   - [Database Schema](#layer-1-database-schema-data-storage)
   - [Backend API](#layer-2-backend-api-business-logic)
   - [Frontend UI](#layer-3-frontend-user-interface)
   - [Complete Data Flow](#complete-data-flow-visualization)
7. [Part F: Deployment Guide](#part-f-deployment-guide-from-code-to-live-application)
   - [Deployment Concepts](#deployment-concepts-explained)
   - [Deployment Options](#deployment-options-simplest-to-most-complex)
   - [Step-by-Step Railway Deployment](#step-by-step-deploying-to-railway-recommended)
   - [Environment Variables](#environment-variables-explained)
   - [Monitoring](#monitoring-your-application)
8. [Part G: Testing Basics](#part-g-testing-basics)
   - [Unit Tests](#unit-tests-testing-individual-functions)
   - [Integration Tests](#integration-tests-testing-components-together)
   - [Test-Driven Development (TDD)](#test-driven-development-tdd)
   - [Mocking](#mocking-isolating-code-for-testing)
   - [Continuous Integration](#continuous-integration-ci)
9. [Glossary](#glossary)

---

## 1. Introduction

### Why This Tutorial Exists

As a C, C++, or Java developer, you understand how to write code. You know about classes, objects, functions, memory management, and algorithms. But building a modern SaaS (Software as a Service) application involves much more than coding:

- **What** to build (Product Requirements)
- **How** to structure it (Architecture)
- **Who** uses it (User Stories)
- **Where** it runs (Cloud Infrastructure)
- **When** to build what (Prioritization)

The **BMAD Method** (Breakthrough Method for Agile AI-Driven Development) is a framework that uses AI agents to help you navigate all of this systematically.

### What You'll Learn

By the end of this tutorial, you will understand:
1. How web applications differ from desktop applications
2. What documents are created before coding begins
3. How BMAD structures AI-assisted development
4. How to apply BMAD to build real projects

---

## Part A: Foundation Concepts

### What is a SaaS Application?

**SaaS** = Software as a Service

| Your Experience (Desktop/Compiled) | SaaS Application |
|-----------------------------------|------------------|
| User downloads and installs `.exe` | User opens a web browser |
| Runs on user's computer | Runs on remote servers (cloud) |
| One-time purchase | Subscription model (monthly/yearly) |
| Updates require new download | Updates happen automatically |
| Data stored locally | Data stored in cloud databases |

**Example**: Microsoft Word (desktop) vs. Google Docs (SaaS)

### Full-Stack Web Architecture

A "full-stack" application has three main layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND                                │  │
│  │    (What the user sees and interacts with)                 │  │
│  │    HTML, CSS, JavaScript, React/Vue/Angular                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests (API calls)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR SERVER                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    BACKEND                                 │  │
│  │    (Business logic, authentication, processing)            │  │
│  │    Node.js, Python, Java, Go, etc.                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    DATABASE                                │  │
│  │    (Persistent data storage)                               │  │
│  │    PostgreSQL, MySQL, MongoDB, etc.                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Bridging C/C++/Java to Web Development

| C/C++/Java Concept | Web Equivalent | Explanation |
|--------------------|----------------|-------------|
| `main()` function | Server entry point | In Node.js: `app.listen(3000)` starts the server |
| Function call | API endpoint | Instead of `calculate(x, y)`, you call `POST /api/calculate` |
| Return value | JSON response | Functions return `{ "result": 42 }` instead of `return 42` |
| Struct/Class | JSON object | `{"name": "John", "age": 30}` instead of `Person p = new Person()` |
| Header files (.h) | API specification | Documents what endpoints exist and what they accept |
| Compilation | Build process | Transpiling TypeScript, bundling JavaScript, etc. |
| Linking libraries | npm/pip packages | `npm install express` instead of linking `.lib` files |
| Memory management | Garbage collected | JavaScript/Python handle memory automatically |
| Threads | Async/await | Web uses event-driven concurrency model |
| File I/O | Database queries | `SELECT * FROM users` instead of `fread()` |

#### Code Comparison Example

**C++ (Desktop Application)**
```cpp
#include <iostream>
#include <string>

struct User {
    std::string name;
    int age;
};

User getUser(int id) {
    // Read from file or memory
    User u;
    u.name = "John";
    u.age = 30;
    return u;
}

int main() {
    User user = getUser(1);
    std::cout << "Name: " << user.name << std::endl;
    return 0;
}
```

**JavaScript (Web Application - Backend)**
```javascript
const express = require('express');
const app = express();

// This is like your getUser function, but accessed via HTTP
app.get('/api/user/:id', async (req, res) => {
    const id = req.params.id;

    // Read from database instead of file
    const user = await database.query('SELECT * FROM users WHERE id = ?', [id]);

    // Return JSON instead of struct
    res.json({ name: user.name, age: user.age });
});

// This is like main() - starts the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

**Frontend (What user sees)**
```javascript
// Called when user clicks a button
async function loadUser() {
    // Instead of calling getUser(1), we make an HTTP request
    const response = await fetch('/api/user/1');
    const user = await response.json();

    // Update the webpage instead of printing to console
    document.getElementById('userName').textContent = user.name;
}
```

### What is an API?

**API** = Application Programming Interface

Think of it as a **contract** between frontend and backend:

```
┌─────────────────────────────────────────────────────────────┐
│  API Contract Example                                        │
├─────────────────────────────────────────────────────────────┤
│  Endpoint: POST /api/login                                   │
│                                                              │
│  Request (what frontend sends):                              │
│  {                                                           │
│      "email": "user@example.com",                            │
│      "password": "secret123"                                 │
│  }                                                           │
│                                                              │
│  Response (what backend returns):                            │
│  {                                                           │
│      "success": true,                                        │
│      "token": "eyJhbGciOiJIUzI1NiIs...",                     │
│      "user": { "id": 1, "name": "John" }                     │
│  }                                                           │
│                                                              │
│  Error Response:                                             │
│  {                                                           │
│      "success": false,                                       │
│      "error": "Invalid credentials"                          │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

This is similar to a function signature in C++:
```cpp
// C++ equivalent concept
struct LoginResponse {
    bool success;
    string token;
    User user;
    string error;
};

LoginResponse login(string email, string password);
```

---

## Part B: Product Development Fundamentals

### Why We Need Product Development Methodologies

In traditional programming, you might:
1. Get requirements
2. Write code
3. Test
4. Ship

For SaaS products, this fails because:
- **Requirements are complex**: Many users, many features, many edge cases
- **Changes are expensive**: Rewriting code costs time and money
- **Misalignment is common**: What you build ≠ what users need

**Solution**: Create detailed documentation BEFORE writing code.

### Key Documents

#### 1. PRD (Product Requirements Document)

**Purpose**: Defines WHAT to build

**Contents**:
- **Overview**: What is this product? What problem does it solve?
- **Target Users**: Who will use this? (Personas)
- **User Stories**: "As a [user], I want [feature] so that [benefit]"
- **Features**: Detailed list of functionality
- **Requirements**: Functional (what it does) and Non-functional (performance, security)
- **Success Metrics**: How do we measure success?
- **Scope**: What's IN and what's OUT

**Example User Story**:
```
As a couple experiencing conflict,
I want to describe my perspective in a structured way,
So that my partner and I can understand each other better.

Acceptance Criteria:
- User can input their side of a conflict
- System prompts for specific details (feelings, needs, context)
- Response is stored for later discussion
- Both partners can view each other's perspectives
```

#### 2. Technical Specification (SPEC/TDD)

**Purpose**: Defines HOW to build it

**Contents**:
- **System Architecture**: How components connect
- **Tech Stack**: What technologies to use
- **Database Schema**: What data to store and how
- **API Specification**: All endpoints and their contracts
- **Security Plan**: Authentication, authorization, encryption
- **Scalability Plan**: How to handle growth

**Example Database Schema**:
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Conflicts table (for our Relationship-Debugger)
CREATE TABLE conflicts (
    id SERIAL PRIMARY KEY,
    user1_id INT REFERENCES users(id),
    user2_id INT REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Perspectives table
CREATE TABLE perspectives (
    id SERIAL PRIMARY KEY,
    conflict_id INT REFERENCES conflicts(id),
    user_id INT REFERENCES users(id),
    content TEXT,
    feelings TEXT,
    needs TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. Architecture Document

**Purpose**: Shows the big picture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SYSTEM ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐       │
│  │   Web App    │      │  Mobile App  │      │   Admin      │       │
│  │   (React)    │      │   (Future)   │      │   Panel      │       │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘       │
│         │                     │                     │                │
│         └──────────┬──────────┴──────────┬──────────┘                │
│                    │                     │                           │
│                    ▼                     ▼                           │
│         ┌─────────────────────────────────────────┐                  │
│         │              API Gateway                 │                  │
│         │         (Authentication)                 │                  │
│         └─────────────────┬───────────────────────┘                  │
│                           │                                          │
│         ┌─────────────────┼───────────────────┐                      │
│         │                 │                   │                      │
│         ▼                 ▼                   ▼                      │
│  ┌────────────┐   ┌────────────┐      ┌────────────┐                 │
│  │   User     │   │  Conflict  │      │    AI      │                 │
│  │  Service   │   │  Service   │      │  Service   │                 │
│  └─────┬──────┘   └─────┬──────┘      └─────┬──────┘                 │
│        │                │                   │                        │
│        ▼                ▼                   ▼                        │
│  ┌─────────────────────────────┐    ┌────────────────┐               │
│  │      PostgreSQL DB          │    │  Claude API    │               │
│  │  (Users, Conflicts, etc.)   │    │  (LLM Engine)  │               │
│  └─────────────────────────────┘    └────────────────┘               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part C: The BMAD Method

### What is BMAD?

**BMAD** = **B**reakthrough **M**ethod for **A**gile AI-**D**riven Development

It's a framework that uses **specialized AI agents** to help you through the entire software development lifecycle. Instead of one AI doing everything, BMAD assigns different AI personas to different roles:

```
Traditional Development:
┌─────────────────────────────────────────────┐
│  Human Developer does EVERYTHING            │
│  - Gathers requirements                     │
│  - Designs architecture                     │
│  - Writes code                              │
│  - Tests code                               │
│  - Writes documentation                     │
└─────────────────────────────────────────────┘

BMAD Development:
┌─────────────────────────────────────────────┐
│  Human Developer COLLABORATES with AI Team  │
│                                             │
│  Analyst Agent      → Researches market     │
│  PM Agent           → Creates PRD           │
│  Architect Agent    → Designs system        │
│  Developer Agent    → Writes code           │
│  QA Agent           → Tests & validates     │
│  Tech Writer Agent  → Documentation         │
│                                             │
│  Human: Reviews, approves, steers           │
└─────────────────────────────────────────────┘
```

### The Four Phases

BMAD organizes development into four sequential phases:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BMAD FOUR PHASES                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PHASE 1: ANALYSIS                                                      │
│  ├── Agent: Analyst                                                     │
│  ├── Activities:                                                        │
│  │   • Brainstorming and ideation                                       │
│  │   • Market research                                                  │
│  │   • Competitor analysis                                              │
│  │   • Problem validation                                               │
│  ├── Output: Project Brief                                              │
│  └── Duration: Variable (can be skipped if you know what to build)      │
│                                                                         │
│  PHASE 2: PLANNING                                                      │
│  ├── Agent: Product Manager (PM)                                        │
│  ├── Activities:                                                        │
│  │   • Transform brief into detailed requirements                       │
│  │   • Define user stories and acceptance criteria                      │
│  │   • Prioritize features (MoSCoW method)                              │
│  │   • Create epics and break into stories                              │
│  ├── Output: PRD (15-25 pages typically)                                │
│  └── Duration: ~15-30 minutes with AI assistance                        │
│                                                                         │
│  PHASE 3: SOLUTIONING                                                   │
│  ├── Agents: Architect, UX Designer                                     │
│  ├── Activities:                                                        │
│  │   • System architecture design                                       │
│  │   • Database schema design                                           │
│  │   • API specification                                                │
│  │   • Tech stack selection                                             │
│  │   • UX/UI wireframes                                                 │
│  ├── Output: Technical Specification, Architecture Document             │
│  └── Duration: ~20-40 minutes with AI assistance                        │
│                                                                         │
│  PHASE 4: IMPLEMENTATION                                                │
│  ├── Agents: Developer, QA, Scrum Master                                │
│  ├── Activities:                                                        │
│  │   • Story-driven development (one story at a time)                   │
│  │   • Code implementation                                              │
│  │   • Continuous testing                                               │
│  │   • Code review and validation                                       │
│  ├── Output: Working software                                           │
│  └── Duration: Depends on project scope                                 │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### The Agent Team

BMAD includes **12 specialized agents**, each with distinct expertise:

#### Core Agents

| Agent | Role | What They Do | C++ Analogy |
|-------|------|--------------|-------------|
| **Analyst** | Research | Market research, competitor analysis, problem validation | Requirements analyst |
| **PM (Product Manager)** | Planning | Creates PRD, defines features, writes user stories | Project manager |
| **Architect** | Design | System design, tech stack, database schema, APIs | Software architect |
| **Developer** | Building | Writes actual code following specifications | Programmer |
| **QA** | Quality | Tests code, validates against requirements | QA engineer |
| **UX Designer** | Interface | Designs user experience and interface | UI designer |

#### Support Agents

| Agent | Role | What They Do |
|-------|------|--------------|
| **Scrum Master** | Coordination | Breaks PRD into stories, manages workflow |
| **Product Owner** | Validation | Ensures implementation matches requirements |
| **Tech Writer** | Documentation | Creates user docs, API docs, README files |
| **BMad Master** | Methodology | Helps you use BMAD correctly |

### Workflow Tracks

BMAD offers three tracks based on project complexity:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WORKFLOW TRACKS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  QUICK FLOW (Bug fixes, small features)                                  │
│  ├── Setup time: ~5 minutes                                              │
│  ├── Documents: Technical spec only                                      │
│  └── Use when: Simple changes, clear requirements                        │
│                                                                          │
│  BMAD METHOD TRACK (Products, platforms)                                 │
│  ├── Setup time: ~15-30 minutes                                          │
│  ├── Documents: PRD + Architecture + UX                                  │
│  └── Use when: New features, new products (Use this for Project #86)     │
│                                                                          │
│  ENTERPRISE TRACK (Compliance-heavy systems)                             │
│  ├── Setup time: ~30-60 minutes                                          │
│  ├── Documents: Full governance + compliance                             │
│  └── Use when: HIPAA, SOC2, financial regulations                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key BMAD Innovations

#### 1. Scale-Adaptive Intelligence
BMAD automatically adjusts planning depth based on project scope:
- Bug fix → Minimal planning
- New feature → Moderate planning
- New product → Comprehensive planning

#### 2. Document Sharding
Large documents are split into smaller, focused pieces to:
- Reduce AI context usage (90% token savings)
- Enable parallel work on different parts
- Maintain focus and accuracy

#### 3. Story-Driven Development
Implementation happens one story at a time:
```
Story: "User can describe their perspective"
├── Context: All relevant PRD sections
├── Architecture: Relevant components
├── Acceptance criteria: Clear definition of done
└── Implementation: Focused coding session
```

#### 4. Continuous Alignment
Every change is validated against the original PRD:
```
Code Change → Automated Tests → AI Review → Human Review → Merge
                                   ↓
                        Check against PRD requirements
```

---

## Part D: Practical Application

### Installation and Setup

#### Prerequisites
- Node.js 20 or higher
- An AI coding assistant (Claude Code, Cursor, etc.)
- Git for version control

#### Installation
```bash
# Install BMAD Method
npx bmad-method@alpha install

# This creates:
# - bmad/ directory with agents and workflows
# - Configuration files
# - Template documents
```

### Step-by-Step Workflow

Here's how to use BMAD for Project #86 (Relationship-Debugger Bot):

#### Step 1: Initialize Project
```bash
# Create project directory
mkdir relationship-debugger
cd relationship-debugger

# Initialize Git
git init

# Install BMAD
npx bmad-method@alpha install
```

#### Step 2: Start with Analyst (Phase 1 - Analysis)
Load the Analyst agent and provide your idea:

```
Human: I want to build a "Relationship-Debugger Bot" - an AI mediator
that helps couples or teams resolve conflicts using therapy dialogue
techniques.

Analyst: [Conducts research, asks probing questions, creates Project Brief]
```

**Output**: `docs/project-brief.md`

#### Step 3: Create PRD with PM Agent (Phase 2 - Planning)
Load the PM agent with your Project Brief:

```
Human: Please create a PRD based on the project brief.

PM: [Asks clarifying questions, creates comprehensive PRD]
```

**Output**: `docs/prd.md` (15-25 pages) containing:
- Product overview
- User personas
- User stories with acceptance criteria
- Feature list
- Functional requirements
- Non-functional requirements
- Epic breakdown

#### Step 4: Design Architecture with Architect (Phase 3 - Solutioning)
Load the Architect agent with your PRD:

```
Human: Please design the system architecture based on the PRD.

Architect: [Creates technical specification]
```

**Output**: `docs/architecture.md` containing:
- System architecture diagram
- Tech stack recommendations
- Database schema
- API specification
- Security considerations

#### Step 5: Implement with Developer (Phase 4 - Implementation)
Load the Developer agent with a specific story:

```
Human: Please implement Story 1: User Registration

Developer: [Writes code following the architecture]
```

**Output**: Actual code files, committed to Git

### Document Templates

#### Project Brief Template
```markdown
# Project Brief: [Project Name]

## 1. Problem Statement
What problem are we solving? Who has this problem?

## 2. Proposed Solution
High-level description of the solution.

## 3. Target Users
- Primary: [Who]
- Secondary: [Who]

## 4. Key Features (High Level)
1. Feature 1
2. Feature 2
3. Feature 3

## 5. Success Metrics
- Metric 1: [How to measure]
- Metric 2: [How to measure]

## 6. Constraints
- Budget: [If any]
- Timeline: [If any]
- Technical: [If any]

## 7. Risks
- Risk 1: [Mitigation]
- Risk 2: [Mitigation]
```

#### PRD Section Structure
```markdown
# Product Requirements Document

## 1. Executive Summary
[1-2 paragraphs summarizing the product]

## 2. Problem Statement
[Detailed problem description]

## 3. Goals and Objectives
- Goal 1
- Goal 2

## 4. User Personas
### Persona 1: [Name]
- Demographics
- Goals
- Pain points
- Behaviors

## 5. User Stories
### Epic 1: [Name]
#### Story 1.1
- As a [user type]
- I want [feature]
- So that [benefit]
- Acceptance Criteria:
  - [ ] Criterion 1
  - [ ] Criterion 2

## 6. Functional Requirements
### FR-001: [Requirement Name]
- Description
- Priority: Must Have / Should Have / Could Have / Won't Have
- Dependencies

## 7. Non-Functional Requirements
### NFR-001: Performance
- Response time < 200ms
- Support 1000 concurrent users

## 8. Out of Scope
[What we're explicitly NOT building]

## 9. Dependencies
[External dependencies]

## 10. Risks and Mitigations
[Risk analysis]
```

---

## Glossary

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface - contract for how software components communicate |
| **Backend** | Server-side code that handles business logic and data |
| **Database** | System for storing and retrieving data persistently |
| **Endpoint** | A specific URL that accepts requests (like a function entry point) |
| **Epic** | A large user story that can be broken into smaller stories |
| **Frontend** | Client-side code that users interact with in their browser |
| **JSON** | JavaScript Object Notation - data format like `{"key": "value"}` |
| **MVP** | Minimum Viable Product - smallest version that provides value |
| **MoSCoW** | Prioritization: Must have, Should have, Could have, Won't have |
| **PRD** | Product Requirements Document - what to build |
| **REST** | REpresentational State Transfer - API design pattern |
| **SaaS** | Software as a Service - web-based subscription software |
| **SPEC/TDD** | Technical Design Document - how to build |
| **Story** | A unit of work described from user perspective |
| **User Story** | "As a [user], I want [feature], so that [benefit]" |

---

## Part E: Code Examples - Building a Complete Feature

This section shows how a single feature flows through all layers of a web application. We'll use "User Registration" as an example since it's common to all web apps.

### The Feature: User Registration

**User Story**: "As a new user, I want to create an account so that I can access the application."

### Layer 1: Database Schema (Data Storage)

First, we define HOW to store user data:

```sql
-- File: database/migrations/001_create_users.sql
-- This is like defining a struct in C++, but for persistent storage

CREATE TABLE users (
    id SERIAL PRIMARY KEY,           -- Auto-incrementing ID (like auto-generated pointer)
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- NEVER store plain passwords!
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster email lookups (like creating a hash table)
CREATE INDEX idx_users_email ON users(email);
```

**C++ Equivalent Thinking**:
```cpp
// This is conceptually what the database table represents
struct User {
    int id;                    // PRIMARY KEY
    std::string email;         // UNIQUE NOT NULL
    std::string password_hash; // NOT NULL
    std::string name;
    time_t created_at;
    time_t updated_at;
};
// But unlike structs, database tables PERSIST across program restarts
```

### Layer 2: Backend API (Business Logic)

Now we create the endpoint that handles registration:

```javascript
// File: src/api/routes/auth.js
// This is like a public function in a class that external code can call

const express = require('express');
const bcrypt = require('bcrypt');  // Library for password hashing
const db = require('../database'); // Database connection
const router = express.Router();

/**
 * POST /api/auth/register
 *
 * C++ Analogy: This is like defining a function:
 * RegisterResponse registerUser(string email, string password, string name);
 *
 * But instead of being called directly, it's called via HTTP POST request
 */
router.post('/register', async (req, res) => {
    try {
        // 1. Extract data from request body (like function parameters)
        const { email, password, name } = req.body;

        // 2. Validate input (defensive programming)
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // 3. Check if email already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // 4. Hash the password (NEVER store plain text!)
        // bcrypt is like a one-way encryption function
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 5. Insert into database (like writing to a file, but structured)
        const result = await db.query(
            `INSERT INTO users (email, password_hash, name)
             VALUES ($1, $2, $3)
             RETURNING id, email, name, created_at`,
            [email, passwordHash, name]
        );

        const newUser = result.rows[0];

        // 6. Return success response (like return statement)
        res.status(201).json({
            success: true,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name
            }
        });

    } catch (error) {
        // Error handling (like try-catch in C++)
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
```

**Understanding the Code Flow**:
```
┌─────────────────────────────────────────────────────────────────┐
│  HTTP Request comes in                                          │
│  POST /api/auth/register                                        │
│  Body: { "email": "user@example.com", "password": "secret123" } │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Express router matches the route                            │
│  2. Request body is parsed (like sscanf or cin >>)              │
│  3. Validation runs                                              │
│  4. Database query checks for existing user                      │
│  5. Password is hashed                                          │
│  6. User is inserted into database                              │
│  7. Response is sent back                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  HTTP Response                                                   │
│  Status: 201 Created                                            │
│  Body: { "success": true, "user": { "id": 1, ... } }            │
└─────────────────────────────────────────────────────────────────┘
```

### Layer 3: Frontend (User Interface)

The frontend is what users see and interact with in their browser:

```html
<!-- File: public/register.html -->
<!-- HTML defines the structure (like a UI layout in any GUI framework) -->

<!DOCTYPE html>
<html>
<head>
    <title>Register</title>
    <style>
        /* CSS defines appearance (colors, fonts, spacing) */
        .form-container {
            max-width: 400px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 8px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
        }
        .form-group input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .btn {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        .error {
            color: red;
            margin-top: 10px;
        }
        .success {
            color: green;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h2>Create Account</h2>

        <form id="registerForm">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" required>
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>

            <button type="submit" class="btn">Register</button>
        </form>

        <div id="message"></div>
    </div>

    <script>
        // JavaScript handles interactivity (like event handlers in GUI programming)

        document.getElementById('registerForm').addEventListener('submit', async (event) => {
            // Prevent the form from submitting traditionally (which would reload the page)
            event.preventDefault();

            // Get form values (like reading from input fields in a GUI)
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const messageDiv = document.getElementById('message');

            try {
                // Make HTTP request to our backend API
                // This is like calling a remote function
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });

                // Parse the JSON response
                const data = await response.json();

                if (data.success) {
                    messageDiv.className = 'success';
                    messageDiv.textContent = 'Registration successful! Redirecting...';

                    // Redirect to login page after 2 seconds
                    setTimeout(() => {
                        window.location.href = '/login.html';
                    }, 2000);
                } else {
                    messageDiv.className = 'error';
                    messageDiv.textContent = data.error;
                }
            } catch (error) {
                messageDiv.className = 'error';
                messageDiv.textContent = 'Network error. Please try again.';
            }
        });
    </script>
</body>
</html>
```

### Layer 4: Connecting Frontend to Backend (Server Setup)

```javascript
// File: src/server.js
// This is the main entry point (like main() in C++)

const express = require('express');
const path = require('path');
const authRoutes = require('./api/routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Parse JSON request bodies
// (Automatically converts JSON string to JavaScript object)
app.use(express.json());

// Serve static files (HTML, CSS, JS) from 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// Mount API routes
// All routes in authRoutes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// Start the server (like starting your program)
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

### Complete Data Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPLETE DATA FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  USER'S BROWSER                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  1. User fills form and clicks "Register"                              │  │
│  │                                                                         │  │
│  │  2. JavaScript captures form data:                                     │  │
│  │     { name: "John", email: "john@example.com", password: "secret" }    │  │
│  │                                                                         │  │
│  │  3. fetch() sends HTTP POST to /api/auth/register                      │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    │ HTTP Request (Internet)                 │
│                                    ▼                                         │
│  YOUR SERVER                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  4. Express receives request at POST /api/auth/register                │  │
│  │                                                                         │  │
│  │  5. auth.js route handler runs:                                        │  │
│  │     a. Validates input                                                 │  │
│  │     b. Checks if email exists in database                              │  │
│  │     c. Hashes password with bcrypt                                     │  │
│  │     d. Inserts new user into database                                  │  │
│  │                                                                         │  │
│  │  6. Sends JSON response back                                           │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    │ Database Query                          │
│                                    ▼                                         │
│  DATABASE                                                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  INSERT INTO users (email, password_hash, name)                        │  │
│  │  VALUES ('john@example.com', '$2b$10$...hashed...', 'John')            │  │
│  │                                                                         │  │
│  │  RETURNING id, email, name, created_at                                 │  │
│  │  → { id: 1, email: 'john@example.com', name: 'John', ... }             │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    │ Response flows back                     │
│                                    ▼                                         │
│  BACK TO BROWSER                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  7. JavaScript receives response:                                      │  │
│  │     { success: true, user: { id: 1, ... } }                            │  │
│  │                                                                         │  │
│  │  8. UI updates to show success message                                 │  │
│  │                                                                         │  │
│  │  9. User is redirected to login page                                   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part F: Deployment Guide (From Code to Live Application)

This section explains how to take your code from your local computer and make it accessible to anyone on the internet.

### Understanding Deployment

**Local Development** (what you've been doing):
```
Your Computer
├── Code runs on localhost:3000
├── Only YOU can access it
├── Database is on your machine
└── If your computer is off, app is off
```

**Production Deployment** (what users access):
```
Cloud Server
├── Code runs on a server in a data center
├── ANYONE with the URL can access it
├── Database is hosted reliably
└── Runs 24/7, even when you're asleep
```

### Deployment Concepts Explained

#### 1. What is a Server?

In C++, your `main()` runs on your computer. In web development:

| Local Development | Production |
|-------------------|------------|
| Your laptop runs the code | A remote computer (server) runs the code |
| `localhost:3000` | `https://yourapp.com` |
| You start/stop it manually | It runs continuously |
| Only your network can reach it | The whole internet can reach it |

A **server** is just a computer in a data center that:
- Runs 24/7 with reliable power and internet
- Has a public IP address anyone can connect to
- Is optimized for running applications

#### 2. What is a Domain Name?

Like a phone contact saves a number, a domain name saves an IP address:

```
IP Address: 104.21.47.108       (hard to remember)
Domain:     yourapp.com          (easy to remember)

When someone types yourapp.com:
1. Browser asks DNS (Domain Name System): "What's the IP for yourapp.com?"
2. DNS responds: "104.21.47.108"
3. Browser connects to that IP address
```

#### 3. What is HTTPS/SSL?

```
HTTP  = Data sent in plain text (anyone can read it)
HTTPS = Data is encrypted (only sender and receiver can read it)

For any app with passwords or personal data: HTTPS is REQUIRED
```

### Deployment Options (Simplest to Most Complex)

#### Option 1: Platform-as-a-Service (PaaS) - RECOMMENDED FOR BEGINNERS

These platforms handle servers for you. You just upload your code.

**Popular Options:**
| Platform | Free Tier | Best For |
|----------|-----------|----------|
| [Vercel](https://vercel.com) | Yes | Frontend + simple backends |
| [Railway](https://railway.app) | Yes (limited) | Full-stack Node.js apps |
| [Render](https://render.com) | Yes | Full-stack apps with databases |
| [Fly.io](https://fly.io) | Yes | Docker-based apps |
| [Heroku](https://heroku.com) | No (paid only) | Traditional PaaS |

#### Option 2: Virtual Private Server (VPS)

You rent a server and manage it yourself. More control, more responsibility.

**Popular Options:**
| Provider | Starting Price | Notes |
|----------|---------------|-------|
| [DigitalOcean](https://digitalocean.com) | $4/month | Beginner-friendly |
| [Linode](https://linode.com) | $5/month | Good documentation |
| [AWS EC2](https://aws.amazon.com/ec2/) | Pay-per-use | Enterprise-grade |
| [Google Cloud](https://cloud.google.com) | Pay-per-use | Enterprise-grade |

#### Option 3: Serverless

Code runs on-demand, you pay per execution. Good for APIs with variable traffic.

**Popular Options:**
- AWS Lambda
- Google Cloud Functions
- Vercel Serverless Functions

### Step-by-Step: Deploying to Railway (Recommended)

Railway is beginner-friendly and handles most complexity for you.

#### Prerequisites
1. Your code in a Git repository (GitHub, GitLab, etc.)
2. A Railway account (sign up at railway.app)

#### Step 1: Prepare Your Code

Add these files to your project:

```javascript
// File: src/server.js - Update to use environment variables

const express = require('express');
const app = express();

// Use PORT from environment variable (Railway sets this)
// Falls back to 3000 for local development
const PORT = process.env.PORT || 3000;

// Your routes and middleware here...

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
```

```json
// File: package.json - Add start script

{
    "name": "relationship-debugger",
    "version": "1.0.0",
    "scripts": {
        "start": "node src/server.js",
        "dev": "nodemon src/server.js"
    },
    "dependencies": {
        "express": "^4.18.2",
        "pg": "^8.11.0",
        "bcrypt": "^5.1.0"
    }
}
```

#### Step 2: Set Up Database

```javascript
// File: src/database.js - Use environment variable for connection

const { Pool } = require('pg');

// DATABASE_URL is automatically set by Railway when you add a PostgreSQL database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};
```

#### Step 3: Deploy on Railway

1. **Go to Railway**: https://railway.app
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository**
5. **Railway auto-detects Node.js and deploys**

#### Step 4: Add Database

1. **In Railway dashboard, click "New"**
2. **Select "Database" → "PostgreSQL"**
3. **Railway automatically sets DATABASE_URL environment variable**

#### Step 5: Run Database Migrations

1. **Go to your PostgreSQL service in Railway**
2. **Click "Connect" → "Query"**
3. **Paste your SQL schema and run it**

#### Step 6: Get Your URL

Railway provides a URL like: `https://relationship-debugger-production.up.railway.app`

### Environment Variables Explained

Environment variables are like configuration files that differ between environments:

```javascript
// DON'T DO THIS (hardcoded values):
const dbPassword = "mysecretpassword";  // Bad! Password in code!

// DO THIS (environment variables):
const dbPassword = process.env.DB_PASSWORD;  // Good! Password is external
```

**Why?**
1. **Security**: Passwords aren't in your code (which goes to GitHub)
2. **Flexibility**: Different values for development vs. production
3. **Secrets management**: Platforms like Railway securely store these

**Common Environment Variables:**
```
PORT=3000                           # Server port
DATABASE_URL=postgres://...         # Database connection string
NODE_ENV=production                 # Environment type
JWT_SECRET=your-secret-key          # For authentication
ANTHROPIC_API_KEY=sk-ant-...        # For AI features
```

### Complete Deployment Checklist

```
[ ] Code Preparation
  [ ] Use environment variables for all secrets
  [ ] Add proper start script to package.json
  [ ] Database connection uses DATABASE_URL
  [ ] Server listens on process.env.PORT

[ ] Git Repository
  [ ] Code pushed to GitHub/GitLab
  [ ] .env file is in .gitignore (never commit secrets!)
  [ ] README.md with setup instructions

[ ] Platform Setup (Railway/Render/etc.)
  [ ] Account created
  [ ] Repository connected
  [ ] Environment variables configured
  [ ] Database provisioned
  [ ] Database schema applied

[ ] Domain (Optional)
  [ ] Domain purchased (Namecheap, Google Domains, etc.)
  [ ] DNS configured to point to your app
  [ ] SSL/HTTPS enabled (usually automatic on modern platforms)

[ ] Testing
  [ ] App accessible via public URL
  [ ] All features work in production
  [ ] Error logging is working
```

### Monitoring Your Application

Once deployed, you need to know if something breaks:

```
┌────────────────────────────────────────────────────────────────────┐
│                      MONITORING BASICS                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LOGS (see what your app is doing):                                 │
│  └── Railway: Dashboard → Select Service → "Logs" tab               │
│                                                                     │
│  METRICS (CPU, memory, requests):                                   │
│  └── Railway: Dashboard → Select Service → "Metrics" tab            │
│                                                                     │
│  ALERTS (get notified of problems):                                 │
│  └── Set up with services like:                                     │
│      • Better Uptime (free tier available)                          │
│      • UptimeRobot (free tier available)                            │
│      • PagerDuty (for serious production apps)                      │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Cost Estimation

For a small SaaS like Project #86:

| Component | Service | Estimated Cost |
|-----------|---------|----------------|
| Hosting | Railway | $5-20/month |
| Database | Railway PostgreSQL | Included |
| Domain | Namecheap | $10-15/year |
| SSL | Included | Free |
| Email (transactional) | SendGrid | Free tier |
| AI (Claude API) | Anthropic | Pay per use (~$0.01/conversation) |
| **Total** | | **~$10-30/month** to start |

---

## Part G: Testing Basics

Testing ensures your code works correctly and continues to work as you make changes. This section covers the fundamentals.

### Why Test?

In C++, you might run your program and check the output manually. For web applications:

| Manual Testing | Automated Testing |
|----------------|-------------------|
| Run app, click around, check results | Write code that tests your code |
| Time-consuming to repeat | Runs in seconds |
| Easy to forget edge cases | Edge cases documented in tests |
| Human error prone | Consistent and repeatable |
| Doesn't scale | Tests thousands of cases easily |

### Types of Tests

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TESTING PYRAMID                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                            /\                                            │
│                           /  \      E2E Tests (End-to-End)               │
│                          /    \     - Test complete user flows           │
│                         /      \    - Slow, expensive, few of these      │
│                        /--------\                                        │
│                       /          \   Integration Tests                   │
│                      /            \  - Test components working together  │
│                     /              \ - Medium speed, moderate count      │
│                    /----------------\                                    │
│                   /                  \  Unit Tests                       │
│                  /                    \ - Test individual functions      │
│                 /                      \- Fast, cheap, MANY of these     │
│                /________________________\                                │
│                                                                          │
│  Rule of thumb: 70% unit, 20% integration, 10% E2E                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Unit Tests: Testing Individual Functions

Unit tests verify that a single function works correctly in isolation.

**C++ Testing Analogy:**
```cpp
// In C++, you might test like this:
#include <cassert>

int add(int a, int b) {
    return a + b;
}

int main() {
    assert(add(2, 3) == 5);
    assert(add(-1, 1) == 0);
    assert(add(0, 0) == 0);
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
```

**JavaScript Unit Testing with Jest:**

First, install Jest (a popular testing framework):
```bash
npm install --save-dev jest
```

Configure in `package.json`:
```json
{
    "scripts": {
        "test": "jest",
        "test:watch": "jest --watch"
    }
}
```

**Example: Testing a Validation Function**

```javascript
// File: src/utils/validation.js
// The function we want to test

function validateEmail(email) {
    if (!email) return { valid: false, error: 'Email is required' };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true, error: null };
}

function validatePassword(password) {
    if (!password) return { valid: false, error: 'Password is required' };
    if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
    if (!/[A-Z]/.test(password)) return { valid: false, error: 'Password must contain uppercase letter' };
    if (!/[0-9]/.test(password)) return { valid: false, error: 'Password must contain a number' };

    return { valid: true, error: null };
}

module.exports = { validateEmail, validatePassword };
```

```javascript
// File: src/utils/validation.test.js
// The test file (Jest looks for *.test.js files)

const { validateEmail, validatePassword } = require('./validation');

// Group related tests with describe()
describe('validateEmail', () => {

    // Each test case uses test() or it()
    test('returns valid for correct email', () => {
        const result = validateEmail('user@example.com');
        expect(result.valid).toBe(true);
        expect(result.error).toBeNull();
    });

    test('returns invalid for empty email', () => {
        const result = validateEmail('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Email is required');
    });

    test('returns invalid for null email', () => {
        const result = validateEmail(null);
        expect(result.valid).toBe(false);
    });

    test('returns invalid for malformed email', () => {
        const result = validateEmail('not-an-email');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid email format');
    });

    test('returns invalid for email without domain', () => {
        const result = validateEmail('user@');
        expect(result.valid).toBe(false);
    });
});

describe('validatePassword', () => {

    test('returns valid for strong password', () => {
        const result = validatePassword('SecurePass123');
        expect(result.valid).toBe(true);
    });

    test('returns invalid for short password', () => {
        const result = validatePassword('Short1');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('8 characters');
    });

    test('returns invalid for password without uppercase', () => {
        const result = validatePassword('lowercase123');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('uppercase');
    });

    test('returns invalid for password without number', () => {
        const result = validatePassword('NoNumbersHere');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('number');
    });
});
```

**Running Tests:**
```bash
npm test

# Output:
# PASS  src/utils/validation.test.js
#   validateEmail
#     ✓ returns valid for correct email (2 ms)
#     ✓ returns invalid for empty email (1 ms)
#     ✓ returns invalid for null email
#     ✓ returns invalid for malformed email (1 ms)
#     ✓ returns invalid for email without domain
#   validatePassword
#     ✓ returns valid for strong password
#     ✓ returns invalid for short password (1 ms)
#     ✓ returns invalid for password without uppercase
#     ✓ returns invalid for password without number
#
# Test Suites: 1 passed, 1 total
# Tests:       9 passed, 9 total
```

### Integration Tests: Testing Components Together

Integration tests verify that multiple parts work together correctly.

**Example: Testing an API Endpoint**

```javascript
// File: src/api/routes/auth.test.js
// Testing the registration endpoint

const request = require('supertest');  // HTTP testing library
const app = require('../server');      // Your Express app
const db = require('../database');     // Database connection

describe('POST /api/auth/register', () => {

    // Setup: Run before each test
    beforeEach(async () => {
        // Clear the users table before each test
        await db.query('DELETE FROM users');
    });

    // Cleanup: Run after all tests
    afterAll(async () => {
        await db.end();  // Close database connection
    });

    test('successfully registers a new user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'newuser@example.com',
                password: 'SecurePass123',
                name: 'Test User'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.user.email).toBe('newuser@example.com');
        expect(response.body.user.name).toBe('Test User');
        // Password should NOT be in response
        expect(response.body.user.password).toBeUndefined();
    });

    test('returns 400 for missing email', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                password: 'SecurePass123',
                name: 'Test User'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('required');
    });

    test('returns 409 for duplicate email', async () => {
        // First registration
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'duplicate@example.com',
                password: 'SecurePass123',
                name: 'First User'
            });

        // Second registration with same email
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'duplicate@example.com',
                password: 'AnotherPass456',
                name: 'Second User'
            });

        expect(response.status).toBe(409);
        expect(response.body.error).toContain('already registered');
    });

    test('hashes the password before storing', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'hashtest@example.com',
                password: 'SecurePass123',
                name: 'Hash Test'
            });

        // Directly check database
        const result = await db.query(
            'SELECT password_hash FROM users WHERE email = $1',
            ['hashtest@example.com']
        );

        // Password should be hashed (bcrypt hashes start with $2b$)
        expect(result.rows[0].password_hash).toMatch(/^\$2b\$/);
        // Should NOT be plain text
        expect(result.rows[0].password_hash).not.toBe('SecurePass123');
    });
});
```

### Test-Driven Development (TDD)

TDD is a development approach where you write tests BEFORE writing the code:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TDD CYCLE: RED-GREEN-REFACTOR                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│     ┌─────────┐                                                          │
│     │  RED    │  1. Write a failing test                                 │
│     │  (Fail) │     - Define what the code SHOULD do                     │
│     └────┬────┘     - Run test, watch it FAIL (this is expected!)        │
│          │                                                               │
│          ▼                                                               │
│     ┌─────────┐                                                          │
│     │  GREEN  │  2. Write minimum code to pass                           │
│     │  (Pass) │     - Don't over-engineer                                │
│     └────┬────┘     - Just make the test pass                            │
│          │                                                               │
│          ▼                                                               │
│     ┌─────────┐                                                          │
│     │REFACTOR │  3. Clean up the code                                    │
│     │(Improve)│     - Remove duplication                                 │
│     └────┬────┘     - Improve readability                                │
│          │          - Tests should still pass                            │
│          │                                                               │
│          └──────────────► Repeat for next feature                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**TDD Example: Building a Conflict Service**

```javascript
// Step 1: RED - Write a failing test first
// File: src/services/conflict.test.js

const ConflictService = require('./conflict');

describe('ConflictService', () => {
    test('creates a new conflict between two users', async () => {
        const conflict = await ConflictService.create({
            user1Id: 1,
            user2Id: 2
        });

        expect(conflict.id).toBeDefined();
        expect(conflict.user1Id).toBe(1);
        expect(conflict.user2Id).toBe(2);
        expect(conflict.status).toBe('active');
    });
});

// Run: npm test
// Result: FAIL - ConflictService doesn't exist yet!
```

```javascript
// Step 2: GREEN - Write minimum code to pass
// File: src/services/conflict.js

const db = require('../database');

class ConflictService {
    static async create({ user1Id, user2Id }) {
        const result = await db.query(
            `INSERT INTO conflicts (user1_id, user2_id, status)
             VALUES ($1, $2, 'active')
             RETURNING id, user1_id as "user1Id", user2_id as "user2Id", status`,
            [user1Id, user2Id]
        );
        return result.rows[0];
    }
}

module.exports = ConflictService;

// Run: npm test
// Result: PASS!
```

```javascript
// Step 3: REFACTOR - Clean up, add more tests
// Continue adding tests for edge cases, then implement them

test('throws error if user1 and user2 are the same', async () => {
    await expect(
        ConflictService.create({ user1Id: 1, user2Id: 1 })
    ).rejects.toThrow('Cannot create conflict with self');
});

// Run: npm test
// Result: FAIL - Need to add validation

// Then implement the validation...
```

### Mocking: Isolating Code for Testing

**Mocking** replaces real dependencies with fake versions for testing.

```javascript
// Problem: Testing code that calls external APIs
// We don't want to actually call Claude API during tests!

// File: src/services/ai.test.js

const AIService = require('./ai');
const Anthropic = require('@anthropic-ai/sdk');

// Mock the entire Anthropic module
jest.mock('@anthropic-ai/sdk');

describe('AIService', () => {
    test('generates a therapeutic response', async () => {
        // Setup: Define what the mock should return
        const mockResponse = {
            content: [{ text: 'I understand you feel frustrated. Let me help...' }]
        };

        // Make the mock return our fake response
        Anthropic.mockImplementation(() => ({
            messages: {
                create: jest.fn().mockResolvedValue(mockResponse)
            }
        }));

        // Test our service
        const result = await AIService.generateResponse(
            'My partner never listens to me'
        );

        expect(result).toContain('understand');
        // We tested our code WITHOUT calling the real API
    });
});
```

### Testing Best Practices

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TESTING BEST PRACTICES                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  DO:                                                                     │
│  ✓ Test one thing per test (single assertion focus)                      │
│  ✓ Use descriptive test names that explain the scenario                  │
│  ✓ Test edge cases (empty inputs, nulls, boundaries)                     │
│  ✓ Test error conditions, not just happy paths                           │
│  ✓ Keep tests independent (no test should depend on another)             │
│  ✓ Run tests before every commit                                         │
│  ✓ Aim for ~80% code coverage as a guideline                             │
│                                                                          │
│  DON'T:                                                                   │
│  ✗ Test implementation details (test behavior, not HOW it works)         │
│  ✗ Write tests that are flaky (sometimes pass, sometimes fail)           │
│  ✗ Test third-party libraries (they have their own tests)                │
│  ✗ Skip tests to meet deadlines (technical debt)                         │
│  ✗ Write tests that take too long to run                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Continuous Integration (CI)

CI automatically runs your tests whenever you push code:

```yaml
# File: .github/workflows/test.yml
# GitHub Actions configuration

name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

**Benefits:**
- Tests run automatically on every code change
- Prevents broken code from being merged
- Team visibility into code quality
- Catches issues before they reach production

### Quick Reference: Jest Matchers

```javascript
// Equality
expect(value).toBe(expected);           // Exact equality (===)
expect(value).toEqual(expected);        // Deep equality (objects/arrays)

// Truthiness
expect(value).toBeTruthy();             // truthy value
expect(value).toBeFalsy();              // falsy value
expect(value).toBeNull();               // null
expect(value).toBeUndefined();          // undefined
expect(value).toBeDefined();            // not undefined

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3);         // Floating point

// Strings
expect(string).toMatch(/pattern/);      // Regex match
expect(string).toContain('substring');  // Contains

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty('key');
expect(object).toMatchObject({key: value});

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('error message');

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();

// Negation (add .not)
expect(value).not.toBe(expected);
```

---

## Next Steps for Project #86

1. **Initialize BMAD** in your project directory
2. **Run Phase 1** (Analysis) - optional since we have project details
3. **Run Phase 2** (Planning) - create comprehensive PRD
4. **Run Phase 3** (Solutioning) - design architecture
5. **Run Phase 4** (Implementation) - build story by story

---

## Sources & References

- [BMAD-METHOD GitHub Repository](https://github.com/bmad-code-org/BMAD-METHOD)
- [BMAD Implementation Guide](https://bennycheung.github.io/bmad-reclaiming-control-in-ai-dev)
- [Full Stack Development Guide 2025](https://pangea.ai/resources/full-stack-development-everything-you-need-to-know)
- [PRD Templates - Product School](https://productschool.com/blog/product-strategy/product-template-requirements-document-prd)
- [SaaS Development Lifecycle](https://www.classicinformatics.com/blog/saas-development-lifecycle)
