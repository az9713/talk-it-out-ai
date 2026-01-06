# Product Requirements Document (PRD)
## Relationship-Debugger Bot (Now: Talk-It-Out-AI)

> **Note:** This is the original planning document created during the BMAD Phase 2 planning process. The project was subsequently renamed to **Talk-It-Out-AI**. This document is preserved for historical reference and to demonstrate the BMAD methodology workflow.

**Project ID:** #86
**Version:** 1.0
**Date:** 2026-01-04
**Status:** Complete (Implementation Finished)
**Phase:** BMAD Phase 2 - Planning (Historical)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals and Objectives](#3-goals-and-objectives)
4. [User Personas](#4-user-personas)
5. [User Stories](#5-user-stories)
6. [Feature Specifications](#6-feature-specifications)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [User Interface Requirements](#9-user-interface-requirements)
10. [Conversation Design](#10-conversation-design)
11. [Data Requirements](#11-data-requirements)
12. [Security and Privacy](#12-security-and-privacy)
13. [Integration Requirements](#13-integration-requirements)
14. [Success Metrics](#14-success-metrics)
15. [Release Plan](#15-release-plan)
16. [Out of Scope](#16-out-of-scope)
17. [Appendices](#17-appendices)

---

## 1. Executive Summary

### 1.1 Product Vision

The Relationship-Debugger Bot is an AI-powered conflict resolution assistant that helps couples and teams work through disagreements using proven therapy dialogue techniques. The application provides structured, guided conversations based on Nonviolent Communication (NVC), active listening, and other evidence-based methodologies.

### 1.2 Value Proposition

| For | Who | The Product | Unlike | Our Solution |
|-----|-----|-------------|--------|--------------|
| Couples experiencing conflict | Want to resolve disagreements constructively | Is an AI mediator | Traditional therapy ($150+/session, scheduling hassles) | Provides instant, affordable, structured dialogue guidance 24/7 |
| Remote team members | Have miscommunication or tension | Is a professional conflict tool | HR escalation (slow, formal, relationship-damaging) | Enables private, structured resolution without organizational involvement |

### 1.3 Key Differentiators

1. **Structured Methodology:** Uses proven NVC framework, not generic chatbot responses
2. **Both Parties Participate:** Not just venting to a bot; both perspectives captured and reflected
3. **Always Available:** 24/7 access when conflicts happen (often nights/weekends)
4. **Affordable:** $9.99/month vs $150+/session for couples therapy
5. **Progress Tracking:** Identifies patterns and measures improvement over time

---

## 2. Problem Statement

### 2.1 The Core Problem

People struggle to resolve conflicts constructively because:

1. **Emotional Flooding:** Strong emotions prevent rational discussion
2. **Feeling Unheard:** Defensive reactions block genuine listening
3. **No Structure:** Conversations devolve into blame cycles
4. **No Facilitation:** Without a neutral third party, power imbalances dominate
5. **Access Barriers:** Professional mediation is expensive and hard to schedule

### 2.2 Evidence of Problem

| Data Point | Source |
|------------|--------|
| 65% of divorces cite "communication problems" as primary cause | American Psychological Association |
| Average couples wait 6 years before seeking therapy | Gottman Institute |
| 70% of workplace conflicts go unresolved | CPP Global Study |
| Only 19% of couples have access to affordable therapy | National Survey on Drug Use and Health |
| Remote workers report 2x more miscommunication conflicts | Buffer State of Remote Work |

### 2.3 Current Alternatives and Gaps

| Alternative | Gap |
|-------------|-----|
| **Couples Therapy** | $150-300/session, requires scheduling, stigma |
| **HR Mediation** | Formal, slow, creates paper trail, relationship-damaging |
| **Self-Help Books** | Not interactive, hard to apply in the moment |
| **Friends/Family** | Biased, not trained, may worsen situation |
| **Generic AI Chatbots** | No therapeutic structure, just conversation |
| **Relationship Apps (Lasting, Paired)** | Content/exercises, not conflict-specific dialogue |

---

## 3. Goals and Objectives

### 3.1 Product Goals

| Goal | Measurement | Target |
|------|-------------|--------|
| **Help users feel heard** | Post-session "feeling heard" rating | 4.2+ / 5.0 |
| **Improve conflict resolution outcomes** | User-reported satisfaction with resolution | 70%+ "somewhat" or "very satisfied" |
| **Reduce conflict recurrence** | Same-topic sessions per couple | <3 sessions on same issue |
| **Provide accessible mediation** | Cost per session vs traditional therapy | 90%+ cost reduction |
| **Build healthy communication habits** | NVC technique adoption in daily life (self-reported) | 50%+ report using techniques outside app |

### 3.2 Business Objectives

| Objective | Metric | Target (Year 1) |
|-----------|--------|-----------------|
| User Acquisition | Monthly signups | 1,000/month by month 12 |
| Activation | Complete first session within 7 days | 40% |
| Retention | 30-day return rate | 50% |
| Conversion | Free to paid | 12% |
| Revenue | Annual Recurring Revenue | $150,000 |

### 3.3 Non-Goals

- Replace professional therapy for mental health conditions
- Provide legal advice for custody/divorce
- Handle domestic violence or abuse situations (must refer out)
- Diagnose relationship disorders
- Provide crisis intervention (suicide, self-harm)

---

## 4. User Personas

### 4.1 Primary Persona: The Committed Couple

**Name:** Sarah & Mike Chen
**Demographics:** Ages 32 and 34, married 4 years, no children yet, dual-income household
**Location:** Urban/suburban, remote or hybrid work

**Background:**
- Together 7 years, married 4
- Both work demanding jobs (tech and healthcare)
- Generally happy but have recurring arguments about:
  - Division of household chores
  - Spending priorities
  - Time with in-laws
  - Future family planning decisions

**Goals:**
- Stop having the same fights repeatedly
- Feel heard and understood by partner
- Resolve conflicts before they escalate
- Build stronger communication patterns

**Frustrations:**
- "We've had this same argument 20 times"
- "Therapy seems like too big a step for our issues"
- "By the time we could get a therapist appointment, the fight is over but unresolved"
- "I don't want to vent to friends about our problems"

**Tech Behavior:**
- Daily smartphone users
- Comfortable with apps and digital tools
- Use shared calendars, messaging apps
- Privacy-conscious about personal data

**Quote:** *"I love my partner, but sometimes we just can't communicate. I wish we had a tool to help us work through things when they come up."*

---

### 4.2 Secondary Persona: The Remote Team Members

**Name:** Alex Martinez & Jordan Kim
**Demographics:** Ages 28 and 35, software engineers at same company, different time zones
**Location:** Alex in Austin, TX; Jordan in Seattle, WA

**Background:**
- Work on same project, never met in person
- Communicate primarily via Slack and async video
- Had a blowup over code review feedback
- Tension is affecting collaboration

**Goals:**
- Clear the air professionally
- Avoid involving manager or HR
- Get back to productive working relationship
- Prevent similar conflicts

**Frustrations:**
- "The Slack message came across way harsher than I think they intended"
- "I don't know them well enough to address this directly"
- "I don't want to escalate to our manager over something that should be resolvable"
- "Text-based communication loses so much nuance"

**Tech Behavior:**
- Heavy users of async tools
- Prefer text to video when possible
- Value efficiency and directness
- Familiar with structured processes (agile, etc.)

**Quote:** *"I need a way to have a difficult conversation professionally without making it a whole HR thing."*

---

### 4.3 Tertiary Persona: The Family Reconciler

**Name:** Maria & Elena Rodriguez (mother and adult daughter)
**Demographics:** Maria 58, Elena 31
**Location:** Different cities (Elena moved away)

**Background:**
- Have historical tension from Elena's teenage years
- Elena established boundaries that Maria finds hurtful
- Both want better relationship but conversations escalate
- Holiday visits are stressful

**Goals:**
- Improve relationship without formal family therapy
- Understand each other's perspectives
- Break the cycle of hurt and defensiveness
- Enjoy family time again

**Frustrations:**
- "Every conversation turns into old grievances"
- "We both end up hurt and nothing changes"
- "Family therapy feels like too much for us"
- "I want her to understand my side"

**Quote:** *"We love each other but we don't know how to talk to each other anymore."*

---

## 5. User Stories

### 5.1 Epic 1: User Onboarding

#### Story 1.1: Account Creation
**As a** new user
**I want to** create an account quickly
**So that** I can start using the service without friction

**Acceptance Criteria:**
- [ ] User can sign up with email/password
- [ ] User can sign up with Google OAuth
- [ ] User can sign up with Apple Sign-In
- [ ] Email verification is sent within 30 seconds
- [ ] Password requirements are clearly communicated
- [ ] Account creation completes in under 60 seconds

**Priority:** P0 (Must Have)

---

#### Story 1.2: Partner Invitation
**As a** registered user
**I want to** invite my partner to join our shared space
**So that** we can both participate in conflict resolution

**Acceptance Criteria:**
- [ ] User can send invitation via email link
- [ ] User can send invitation via shareable code
- [ ] Invitation expires after 7 days
- [ ] Partner receives clear instructions to join
- [ ] Both users are linked once partner accepts
- [ ] Either user can initiate sessions after linking

**Priority:** P0 (Must Have)

---

#### Story 1.3: Introduction Tutorial
**As a** new user
**I want to** understand how the dialogue process works
**So that** I can participate effectively

**Acceptance Criteria:**
- [ ] Interactive walkthrough explains the NVC framework
- [ ] Example dialogue demonstrates the process
- [ ] User can skip tutorial if desired
- [ ] Tutorial is accessible later from settings
- [ ] Tutorial takes less than 3 minutes

**Priority:** P1 (Should Have)

---

### 5.2 Epic 2: Core Conflict Resolution Session

#### Story 2.1: Session Initiation
**As a** user with a conflict
**I want to** start a new resolution session
**So that** I can begin the structured dialogue process

**Acceptance Criteria:**
- [ ] User can initiate session from home screen
- [ ] User can optionally name/categorize the conflict
- [ ] User chooses whether to start first or invite partner first
- [ ] Partner is notified of new session
- [ ] Session state is saved if interrupted

**Priority:** P0 (Must Have)

---

#### Story 2.2: Perspective Sharing (NVC Format)
**As a** session participant
**I want to** share my perspective in a structured format
**So that** I can communicate clearly without blame

**Acceptance Criteria:**
- [ ] Bot prompts for **Observation** (what happened, facts only)
- [ ] Bot prompts for **Feeling** (emotional response)
- [ ] Bot prompts for **Need** (underlying need not met)
- [ ] Bot prompts for **Request** (specific desired action)
- [ ] Bot provides examples for each prompt
- [ ] Bot gently redirects judgmental language to observations
- [ ] User can edit their responses before finalizing

**Priority:** P0 (Must Have)

---

#### Story 2.3: Perspective Reflection
**As a** session participant
**I want to** see a clear summary of my perspective
**So that** I can confirm it accurately represents my view

**Acceptance Criteria:**
- [ ] Bot summarizes Observation, Feeling, Need, Request
- [ ] Summary uses user's own words where possible
- [ ] User can approve or request changes
- [ ] Approved summary is saved for partner to see

**Priority:** P0 (Must Have)

---

#### Story 2.4: Partner Turn
**As a** partner in a session
**I want to** add my perspective after my partner
**So that** both sides are captured

**Acceptance Criteria:**
- [ ] Partner receives notification when it's their turn
- [ ] Partner sees summary of other's perspective first
- [ ] Partner goes through same NVC structure
- [ ] Partner's summary is created and approved
- [ ] Both perspectives are now available

**Priority:** P0 (Must Have)

---

#### Story 2.5: Mutual Understanding Check
**As a** session participant
**I want to** confirm I understand my partner's perspective
**So that** we both feel heard before moving to solutions

**Acceptance Criteria:**
- [ ] Each party is asked to reflect back other's perspective
- [ ] Bot highlights key points to acknowledge
- [ ] Bot asks "Does this feel accurate?" to original speaker
- [ ] Misunderstandings trigger clarification loop
- [ ] Understanding is confirmed before proceeding

**Priority:** P0 (Must Have)

---

#### Story 2.6: Common Ground Identification
**As a** session participant
**I want to** see what we agree on
**So that** we can build on shared values

**Acceptance Criteria:**
- [ ] Bot analyzes both perspectives for shared needs
- [ ] Bot highlights common values and goals
- [ ] Areas of agreement are clearly presented
- [ ] Areas of difference are noted neutrally

**Priority:** P1 (Should Have)

---

#### Story 2.7: Solution Brainstorming
**As a** session participant
**I want to** propose potential solutions
**So that** we can find a mutually acceptable resolution

**Acceptance Criteria:**
- [ ] Both parties can suggest solutions
- [ ] Bot encourages creative options
- [ ] Bot evaluates solutions against both parties' needs
- [ ] Discussion of solutions is guided
- [ ] Multiple rounds of refinement supported

**Priority:** P0 (Must Have)

---

#### Story 2.8: Agreement Documentation
**As a** session participant
**I want to** record what we agreed to
**So that** we have clear commitments

**Acceptance Criteria:**
- [ ] Agreed actions are documented with owner
- [ ] Timeline/deadline can be set
- [ ] Both parties confirm agreement
- [ ] Session summary is generated
- [ ] Summary is accessible to both parties

**Priority:** P0 (Must Have)

---

### 5.3 Epic 3: Emotional Safety Features

#### Story 3.1: Escalation Detection
**As a** user in a heated moment
**I want the** bot to recognize when things are escalating
**So that** we can take a break before saying something hurtful

**Acceptance Criteria:**
- [ ] Bot detects escalating language patterns
- [ ] Bot offers de-escalation techniques
- [ ] Bot suggests "take a break" option
- [ ] Session can be paused and resumed
- [ ] Neither party can see incomplete responses if paused

**Priority:** P0 (Must Have)

---

#### Story 3.2: Crisis Resource Referral
**As a** user in a serious situation
**I want to** be directed to professional help
**So that** I get appropriate support for severe issues

**Acceptance Criteria:**
- [ ] Keywords for abuse, violence, self-harm trigger intervention
- [ ] Clear message that this requires professional help
- [ ] Links to appropriate resources (hotlines, etc.)
- [ ] Session is paused with explanation
- [ ] No blame or judgment in referral message

**Priority:** P0 (Must Have)

---

#### Story 3.3: Repair Attempts
**As a** user who said something hurtful
**I want** help to repair the conversation
**So that** one mistake doesn't derail the whole session

**Acceptance Criteria:**
- [ ] Bot recognizes when repair might be needed
- [ ] Bot suggests repair phrases (Gottman method)
- [ ] User can choose to use repair attempt
- [ ] Repair attempts are noted positively
- [ ] Partner has option to accept repair

**Priority:** P1 (Should Have)

---

### 5.4 Epic 4: Session History & Progress

#### Story 4.1: View Past Sessions
**As a** returning user
**I want to** access previous session summaries
**So that** I can remember what we agreed to

**Acceptance Criteria:**
- [ ] Sessions listed chronologically
- [ ] Session title/topic shown
- [ ] Resolution status indicated
- [ ] Full summary accessible
- [ ] Search/filter by date or topic

**Priority:** P1 (Should Have)

---

#### Story 4.2: Pattern Recognition
**As a** long-term user
**I want to** see recurring themes in our conflicts
**So that** we can address root causes

**Acceptance Criteria:**
- [ ] Bot identifies recurring needs across sessions
- [ ] Bot identifies recurring triggers
- [ ] Insights presented constructively
- [ ] Suggestions for deeper work provided
- [ ] Data never shared outside partnership

**Priority:** P2 (Could Have)

---

#### Story 4.3: Progress Dashboard
**As a** user working on relationship
**I want to** see our progress over time
**So that** I feel motivated and see improvement

**Acceptance Criteria:**
- [ ] Number of sessions completed
- [ ] Resolution success rate
- [ ] Average "feeling heard" scores over time
- [ ] Streak/consistency tracking
- [ ] Positive reinforcement messaging

**Priority:** P2 (Could Have)

---

### 5.5 Epic 5: Settings & Preferences

#### Story 5.1: Notification Preferences
**As a** user
**I want to** control when and how I'm notified
**So that** the app respects my boundaries

**Acceptance Criteria:**
- [ ] Toggle notifications on/off
- [ ] Set quiet hours
- [ ] Choose notification channels (email, push)
- [ ] Set reminder frequency for pending sessions

**Priority:** P1 (Should Have)

---

#### Story 5.2: Privacy Controls
**As a** user
**I want to** control my data
**So that** I feel safe using the service

**Acceptance Criteria:**
- [ ] View all stored data
- [ ] Export personal data
- [ ] Delete individual sessions
- [ ] Delete entire account and all data
- [ ] Clear explanation of data usage

**Priority:** P0 (Must Have)

---

#### Story 5.3: Unlink Partnership
**As a** user
**I want to** remove the connection with my partner
**So that** I can use the service independently or with someone else

**Acceptance Criteria:**
- [ ] Either party can initiate unlink
- [ ] Other party is notified
- [ ] Session history is retained for each user
- [ ] No shared access after unlink
- [ ] Can link with new partner

**Priority:** P1 (Should Have)

---

## 6. Feature Specifications

### 6.1 Core Session Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SESSION STATE MACHINE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [START] ──► [INTAKE] ──► [PERSON_A_PERSPECTIVE] ──►                │
│                                                                      │
│  ──► [A_REFLECTION_CONFIRM] ──► [WAIT_FOR_B] ──►                    │
│                                                                      │
│  ──► [PERSON_B_PERSPECTIVE] ──► [B_REFLECTION_CONFIRM] ──►          │
│                                                                      │
│  ──► [MUTUAL_UNDERSTANDING_A] ──► [MUTUAL_UNDERSTANDING_B] ──►      │
│                                                                      │
│  ──► [COMMON_GROUND] ──► [SOLUTION_BRAINSTORM] ──►                  │
│                                                                      │
│  ──► [AGREEMENT] ──► [SUMMARY] ──► [COMPLETE]                       │
│                                                                      │
│  Any state can transition to:                                        │
│  - [PAUSED] (user-initiated or de-escalation)                        │
│  - [CRISIS_REFERRAL] (safety triggered)                              │
│  - [ABANDONED] (no activity for 7 days)                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 NVC Prompt Structure

| Step | Prompt | Example Response | Redirect Trigger |
|------|--------|------------------|------------------|
| **Observation** | "What specifically happened? Describe the facts without judgment." | "On Saturday, the trash wasn't taken out before guests arrived." | "They never..." → "Can you give a specific example?" |
| **Feeling** | "How did that make you feel? Use feeling words like frustrated, hurt, anxious..." | "I felt embarrassed and frustrated." | "I felt that they..." → "That's a thought. What was the feeling underneath?" |
| **Need** | "What need of yours wasn't met? Common needs: respect, reliability, partnership..." | "I need reliability and teamwork." | Vague → "Can you be more specific about what you needed?" |
| **Request** | "What specific action would you like? State positively (what you want, not what you don't)." | "I'd like them to acknowledge requests and follow through or communicate blockers." | "I want them to stop..." → "What would you like instead?" |

### 6.3 De-escalation Triggers

| Trigger | Example | Response |
|---------|---------|----------|
| **All-caps** | "I CAN'T BELIEVE YOU DID THIS" | "I can feel the intensity here. Would you like to take a few breaths before continuing?" |
| **Profanity** | "This is f***ing ridiculous" | "Strong emotions are valid. Let's try to express the feeling underneath in a way your partner can hear." |
| **Absolute language** | "You ALWAYS/NEVER do this" | "I hear the frustration. Can we look at a specific recent example instead?" |
| **Threats** | "If you don't change, I'm done" | "It sounds like you're feeling desperate. Would you like to take a break and continue when you're ready?" |
| **Personal attacks** | "You're such a selfish person" | "I can tell you're hurt. Let's focus on the specific behavior rather than character." |

### 6.4 Crisis Detection Keywords

**Immediate Referral Triggers:**
- Suicide/self-harm language
- Physical violence/abuse
- Child safety concerns
- Immediate danger

**Response:**
```
"I'm concerned about what you've shared. This situation is beyond
what I can help with, and you deserve professional support.

Please reach out to:
- National Domestic Violence Hotline: 1-800-799-7233
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741

Your safety is the priority. Would you like me to provide more
resources specific to your situation?"
```

---

## 7. Functional Requirements

### 7.1 User Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | System shall allow user registration with email/password | P0 |
| FR-002 | System shall support OAuth (Google, Apple) | P0 |
| FR-003 | System shall send email verification | P0 |
| FR-004 | System shall support password reset | P0 |
| FR-005 | System shall allow users to link with a partner | P0 |
| FR-006 | System shall allow users to unlink from a partner | P1 |
| FR-007 | System shall support account deletion | P0 |

### 7.2 Session Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008 | System shall allow creation of new sessions | P0 |
| FR-009 | System shall persist session state across interruptions | P0 |
| FR-010 | System shall track session progress through defined stages | P0 |
| FR-011 | System shall notify partners of session activity | P0 |
| FR-012 | System shall generate session summaries | P0 |
| FR-013 | System shall store session history | P1 |
| FR-014 | System shall allow session search/filtering | P2 |

### 7.3 Conversation Engine

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015 | System shall guide users through NVC framework | P0 |
| FR-016 | System shall provide examples and clarifications | P0 |
| FR-017 | System shall redirect non-NVC responses constructively | P0 |
| FR-018 | System shall summarize user perspectives | P0 |
| FR-019 | System shall detect escalation patterns | P0 |
| FR-020 | System shall suggest de-escalation techniques | P0 |
| FR-021 | System shall detect crisis keywords | P0 |
| FR-022 | System shall provide crisis resources when triggered | P0 |
| FR-023 | System shall identify common ground between parties | P1 |
| FR-024 | System shall facilitate solution brainstorming | P0 |

### 7.4 Progress & Analytics

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-025 | System shall track sessions completed | P1 |
| FR-026 | System shall track resolution outcomes | P1 |
| FR-027 | System shall identify recurring themes | P2 |
| FR-028 | System shall display progress dashboard | P2 |

### 7.5 Subscription & Billing

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-029 | System shall support free tier with session limits | P0 |
| FR-030 | System shall support paid subscription tiers | P0 |
| FR-031 | System shall integrate with payment processor | P0 |
| FR-032 | System shall manage subscription lifecycle | P0 |

---

## 8. Non-Functional Requirements

### 8.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Page load time | < 2 seconds |
| NFR-002 | AI response time | < 3 seconds |
| NFR-003 | API response time (non-AI) | < 200ms |
| NFR-004 | System uptime | 99.5% |
| NFR-005 | Concurrent users supported | 1,000 |

### 8.2 Security

| ID | Requirement |
|----|-------------|
| NFR-006 | All data transmitted over HTTPS |
| NFR-007 | Passwords hashed with bcrypt (cost factor 12+) |
| NFR-008 | Session tokens expire after 30 days |
| NFR-009 | Rate limiting on authentication endpoints |
| NFR-010 | Input sanitization on all user inputs |
| NFR-011 | CSRF protection on all forms |
| NFR-012 | XSS protection headers |

### 8.3 Privacy & Compliance

| ID | Requirement |
|----|-------------|
| NFR-013 | GDPR compliant (EU users) |
| NFR-014 | CCPA compliant (California users) |
| NFR-015 | User data exportable in machine-readable format |
| NFR-016 | User data deletable within 30 days of request |
| NFR-017 | Session content NOT used for AI training |
| NFR-018 | Clear privacy policy accessible |
| NFR-019 | Data retention policy documented |

### 8.4 Scalability

| ID | Requirement |
|----|-------------|
| NFR-020 | Horizontal scaling for API servers |
| NFR-021 | Database connection pooling |
| NFR-022 | Caching layer for static content |
| NFR-023 | CDN for frontend assets |

### 8.5 Accessibility

| ID | Requirement |
|----|-------------|
| NFR-024 | WCAG 2.1 AA compliance |
| NFR-025 | Screen reader compatible |
| NFR-026 | Keyboard navigation supported |
| NFR-027 | Color contrast ratios meet standards |
| NFR-028 | Text resizable without layout break |

---

## 9. User Interface Requirements

### 9.1 Screen List

| Screen | Description | Priority |
|--------|-------------|----------|
| Landing Page | Marketing, signup CTA | P0 |
| Login | Email/password + OAuth | P0 |
| Signup | Registration form | P0 |
| Dashboard/Home | Session list, start new | P0 |
| Active Session | Chat-like interface | P0 |
| Session Summary | Post-session review | P0 |
| History | Past sessions list | P1 |
| Progress | Analytics dashboard | P2 |
| Settings | Account, notifications, privacy | P1 |
| Partner Invite | Invite flow | P0 |

### 9.2 Key UI Components

#### Session Interface (Chat-like)
```
┌─────────────────────────────────────────────────────────────────┐
│  [Back] Conflict: Household Chores              [⋯ Menu]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 🤖 BOT                                                     │  │
│  │ Let's start with your perspective. What specifically       │  │
│  │ happened? Try to describe just the facts.                  │  │
│  │                                                            │  │
│  │ Example: "On Saturday, the trash wasn't taken out          │  │
│  │ before guests arrived."                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 👤 YOU                                          [Editing]  │  │
│  │ On Saturday I asked Mike to take out the trash before      │  │
│  │ our friends came over and it was still there when they     │  │
│  │ arrived.                                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Progress: ●●○○○○○○ Step 2 of 8: Your Observation]             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Type your response...                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│  [💡 Help] [⏸️ Pause]                             [Send →]       │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Mobile Considerations

- Primary design: Mobile-responsive web
- Touch-friendly tap targets (44x44px minimum)
- Soft keyboard considerations for input
- Notification badges for pending sessions
- Progressive Web App (PWA) for home screen installation

---

## 10. Conversation Design

### 10.1 Bot Personality

**Tone:**
- Warm but professional
- Non-judgmental and validating
- Encouraging but not sycophantic
- Clear and direct
- Compassionate

**Voice Examples:**

| Situation | Response |
|-----------|----------|
| User shares difficult feeling | "That sounds really frustrating. It's understandable to feel that way." |
| User uses judgmental language | "I hear the hurt behind that. Can we translate it into what happened and how you felt?" |
| User completes a step well | "Thank you for sharing that so clearly." |
| Session reaches agreement | "You've both done meaningful work here. These agreements feel solid." |

**Avoid:**
- Excessive positivity ("That's amazing!")
- Taking sides
- Psychoanalyzing
- Medical/diagnostic language
- Condescension

### 10.2 Error Recovery

| Error | Recovery |
|-------|----------|
| User gives one-word response | "Can you tell me a bit more about that?" |
| User goes off-topic | "I want to make sure we address that. For now, let's finish capturing your perspective on [topic]." |
| User expresses confusion | "Good question! [Explain]. Would you like an example?" |
| User wants to skip step | "I understand. This step helps your partner understand you. Want to try, or take a break?" |

### 10.3 Session Pacing

- **Intake:** 2-3 minutes
- **Person A Perspective:** 5-8 minutes
- **Person B Perspective:** 5-8 minutes
- **Understanding Checks:** 3-5 minutes
- **Solutions:** 5-10 minutes
- **Agreement:** 2-3 minutes

**Total target:** 25-40 minutes per session

---

## 11. Data Requirements

### 11.1 Core Data Entities

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA MODEL                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User                        Partnership                         │
│  ├── id                      ├── id                              │
│  ├── email                   ├── user1_id (FK)                   │
│  ├── password_hash           ├── user2_id (FK)                   │
│  ├── name                    ├── status                          │
│  ├── subscription_tier       ├── created_at                      │
│  ├── subscription_end        └── ended_at                        │
│  └── created_at                                                  │
│                                                                  │
│  Session                     Message                             │
│  ├── id                      ├── id                              │
│  ├── partnership_id (FK)     ├── session_id (FK)                 │
│  ├── title                   ├── user_id (FK)                    │
│  ├── status                  ├── role (user/bot)                 │
│  ├── stage                   ├── content                         │
│  ├── resolution_outcome      ├── stage                           │
│  ├── created_at              └── created_at                      │
│  └── completed_at                                                │
│                                                                  │
│  Perspective                 Agreement                           │
│  ├── id                      ├── id                              │
│  ├── session_id (FK)         ├── session_id (FK)                 │
│  ├── user_id (FK)            ├── content                         │
│  ├── observation             ├── owner_user_id (FK)              │
│  ├── feeling                 ├── deadline                        │
│  ├── need                    └── status                          │
│  ├── request                                                     │
│  └── confirmed                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Data Retention

| Data Type | Retention Period |
|-----------|------------------|
| Active user accounts | Until deletion request |
| Session content | 2 years or until deletion |
| Message history | 2 years or until deletion |
| Analytics (aggregated) | Indefinite |
| Logs (no PII) | 90 days |

---

## 12. Security and Privacy

### 12.1 Threat Model

| Threat | Mitigation |
|--------|------------|
| Account takeover | Strong passwords, 2FA (future), rate limiting |
| Data breach | Encryption at rest, minimal data collection |
| Partner snooping | Separate authentication, no shared passwords |
| Session hijacking | Secure cookies, HTTPS only |
| Prompt injection | Input sanitization, output validation |
| Partner abuse of tool | Clear consent flows, unlink option |

### 12.2 Privacy Commitments

1. **We will NEVER:**
   - Sell user data
   - Use session content for AI training
   - Share identifiable data with third parties
   - Target ads based on session content

2. **We WILL:**
   - Encrypt all data in transit and at rest
   - Allow full data export
   - Allow complete data deletion
   - Provide transparent privacy policy

### 12.3 Consent Requirements

- Both parties must have accounts to participate
- Session initiation notifies both parties
- Either party can pause or end session
- Either party can request data deletion

---

## 13. Integration Requirements

### 13.1 MVP Integrations

| System | Purpose | Priority |
|--------|---------|----------|
| **Claude API** | LLM for conversation | P0 |
| **PostgreSQL** | Primary database | P0 |
| **SendGrid/Resend** | Transactional email | P0 |
| **Stripe** | Payments | P0 |
| **Vercel/Railway** | Hosting | P0 |

### 13.2 Future Integrations

| System | Purpose | Priority |
|--------|---------|----------|
| **Firebase Cloud Messaging** | Push notifications | P1 |
| **Google Calendar** | Check-in scheduling | P2 |
| **Therapist platforms** | Export for professional review | P3 |

---

## 14. Success Metrics

### 14.1 Primary KPIs

| Metric | Definition | Target |
|--------|------------|--------|
| **Session Completion Rate** | % of sessions reaching Agreement stage | 70% |
| **Feeling Heard Score** | Post-session rating (1-5) | 4.2+ avg |
| **Resolution Satisfaction** | User-reported outcome satisfaction | 70%+ "satisfied" |
| **Recurrence Rate** | Same-topic sessions per couple | <3 |
| **NPS** | Net Promoter Score | 40+ |

### 14.2 Business KPIs

| Metric | Definition | Year 1 Target |
|--------|------------|---------------|
| **Signups** | New account registrations | 12,000 |
| **Activation Rate** | Complete first session in 7 days | 40% |
| **Conversion Rate** | Free → Paid | 12% |
| **MRR** | Monthly Recurring Revenue | $12,500 |
| **Churn Rate** | Monthly paid subscription cancellation | <8% |

### 14.3 Quality KPIs

| Metric | Target |
|--------|--------|
| Crisis referrals per 1000 sessions | <5 |
| Sessions flagged for review | <2% |
| User-reported harmful advice | 0 |

---

## 15. Release Plan

### 15.1 MVP (v1.0)

**Scope:**
- User registration and authentication
- Partner linking
- Core session flow (full NVC cycle)
- Basic de-escalation
- Crisis referral
- Session summary
- Free tier (2 sessions/month)
- Paid tier (unlimited)

**Success Criteria:**
- 100 beta users complete sessions
- Session completion rate >60%
- No critical bugs
- Avg feeling heard score >3.5

### 15.2 v1.1

**Additions:**
- Session history
- Basic progress tracking
- Tutorial improvements
- Email notifications

### 15.3 v1.2

**Additions:**
- Pattern recognition
- Progress dashboard
- Check-in reminders
- Mobile PWA optimization

### 15.4 Future (v2.0+)

- Real-time sync mode
- Voice input
- Therapist integration
- Native mobile apps
- Team/workplace mode

---

## 16. Out of Scope

### 16.1 Explicitly Excluded

| Feature | Reason |
|---------|--------|
| Video/audio sessions | Complexity; text-first for MVP |
| Real-time sync mode | Async sufficient for MVP |
| Group mediation (3+) | Different dynamics, scope creep |
| Native mobile apps | Web-first, PWA for now |
| Therapist marketplace | B2B complexity |
| AI voice/avatar | Unnecessary for core value |
| Integration with EHR | Regulatory complexity |

### 16.2 Safety Exclusions

The system will **NOT** handle:
- Domestic violence or abuse situations
- Child safety concerns
- Suicidal ideation or self-harm
- Legal disputes (divorce, custody)
- Situations requiring mandatory reporting

These will be referred to appropriate professionals.

---

## 17. Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| **NVC** | Nonviolent Communication - Marshall Rosenberg's framework |
| **Observation** | What happened (facts without judgment) |
| **Feeling** | Emotional response to observation |
| **Need** | Underlying human need (safety, connection, autonomy, etc.) |
| **Request** | Specific action requested |
| **Session** | One complete conflict resolution dialogue |
| **Partnership** | Link between two users |
| **De-escalation** | Techniques to reduce emotional intensity |
| **Repair attempt** | Phrase to break negative cycle (Gottman) |

### Appendix B: Competitive Analysis Detail

| App | Model | Price | Conflict Support | AI-Powered |
|-----|-------|-------|------------------|------------|
| **Lasting** | Subscription | $12/mo | General exercises | No |
| **Paired** | Subscription | $10/mo | Daily questions | No |
| **Relish** | Subscription | $15/mo | Coach sessions | Partial |
| **BetterHelp** | Subscription | $60-90/wk | Full therapy | No |
| **Talkspace** | Subscription | $65-99/wk | Full therapy | No |
| **Ours (proposed)** | Subscription | $10/mo | Structured dialogue | Yes |

### Appendix C: User Research Questions

For future validation:
1. When did you last have a conflict with your partner? How did you resolve it?
2. Have you ever considered couples therapy? What stopped you?
3. Would you use an AI tool for conflict resolution? What concerns would you have?
4. How important is it that your partner also participates?
5. What would make you trust an AI with sensitive relationship information?

### Appendix D: Technical Spike Questions

1. What's the optimal prompt structure for maintaining NVC format?
2. How do we handle long messages in conversation context?
3. What's the latency budget for AI responses to feel conversational?
4. How do we detect escalation reliably without over-triggering?
5. What's the data model for async session state?

---

*Document Version: 1.0*
*Last Updated: 2026-01-04*
*Status: Ready for Architecture Phase*

---

**Next Steps (BMAD Phase 3 - Solutioning):**
1. System Architecture Design
2. Database Schema Specification
3. API Design
4. Tech Stack Selection
5. UX Wireframes
