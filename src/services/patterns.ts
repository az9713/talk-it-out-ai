import { db } from '@/lib/db';
import { conflictPatterns, patternAnalysisLog, sessions, messages } from '@/lib/db/schema';
import { eq, and, desc, gte } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';

export interface ConflictPattern {
  id: string;
  userId: string;
  partnershipId: string | null;
  type: 'recurring_topic' | 'trigger' | 'timing' | 'communication_style' | 'escalation_pattern' | 'resolution_pattern' | 'positive_pattern';
  title: string;
  description: string;
  frequency: string | null;
  severity: number | null;
  relatedSessionIds: string[] | null;
  exampleQuotes: string[] | null;
  suggestions: string[] | null;
  confidence: number | null;
  isAcknowledged: boolean;
  isResolved: boolean;
  detectedAt: Date;
  lastOccurrence: Date | null;
}

interface DetectedPattern {
  type: string;
  title: string;
  description: string;
  frequency: string;
  severity: number;
  relatedSessionIds: string[];
  exampleQuotes: string[];
  suggestions: string[];
  confidence: number;
}

// Get user's detected patterns
export async function getUserPatterns(userId: string): Promise<ConflictPattern[]> {
  const patterns = await db.query.conflictPatterns.findMany({
    where: eq(conflictPatterns.userId, userId),
    orderBy: [desc(conflictPatterns.detectedAt)],
  });

  return patterns.map((p: typeof patterns[number]) => ({
    ...p,
    relatedSessionIds: p.relatedSessionIds ? JSON.parse(p.relatedSessionIds) : null,
    exampleQuotes: p.exampleQuotes ? JSON.parse(p.exampleQuotes) : null,
    suggestions: p.suggestions ? JSON.parse(p.suggestions) : null,
  }));
}

// Get active (unresolved) patterns
export async function getActivePatterns(userId: string): Promise<ConflictPattern[]> {
  const patterns = await db.query.conflictPatterns.findMany({
    where: and(
      eq(conflictPatterns.userId, userId),
      eq(conflictPatterns.isResolved, false)
    ),
    orderBy: [desc(conflictPatterns.severity)],
  });

  return patterns.map((p: typeof patterns[number]) => ({
    ...p,
    relatedSessionIds: p.relatedSessionIds ? JSON.parse(p.relatedSessionIds) : null,
    exampleQuotes: p.exampleQuotes ? JSON.parse(p.exampleQuotes) : null,
    suggestions: p.suggestions ? JSON.parse(p.suggestions) : null,
  }));
}

// Acknowledge a pattern
export async function acknowledgePattern(patternId: string, userId: string): Promise<boolean> {
  await db
    .update(conflictPatterns)
    .set({ isAcknowledged: true })
    .where(and(eq(conflictPatterns.id, patternId), eq(conflictPatterns.userId, userId)));
  return true;
}

// Mark pattern as resolved
export async function resolvePattern(patternId: string, userId: string): Promise<boolean> {
  await db
    .update(conflictPatterns)
    .set({ isResolved: true })
    .where(and(eq(conflictPatterns.id, patternId), eq(conflictPatterns.userId, userId)));
  return true;
}

// Run pattern analysis for a user
export async function runPatternAnalysis(userId: string): Promise<ConflictPattern[]> {
  // Get sessions from the last 90 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  const userSessions = await db.query.sessions.findMany({
    where: and(
      eq(sessions.initiatorId, userId),
      gte(sessions.createdAt, startDate)
    ),
    with: {
      messages: true,
    },
    orderBy: [desc(sessions.createdAt)],
  });

  if (userSessions.length < 3) {
    // Need at least 3 sessions to detect patterns
    return [];
  }

  // Prepare session summaries for AI analysis
  const sessionSummaries = userSessions.map((s: typeof userSessions[number]) => ({
    id: s.id,
    topic: s.topic,
    status: s.status,
    stage: s.stage,
    createdAt: s.createdAt,
    messageCount: s.messages.length,
    userMessages: s.messages
      .filter((m: typeof s.messages[number]) => m.role === 'user')
      .map((m: typeof s.messages[number]) => m.content)
      .slice(0, 5), // First 5 user messages
  }));

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = `You are an expert relationship analyst. Analyze the following session history and identify recurring patterns.

Session History (${sessionSummaries.length} sessions):
${JSON.stringify(sessionSummaries, null, 2)}

Look for these pattern types:
1. RECURRING_TOPIC - Same issues appearing repeatedly
2. TRIGGER - What consistently starts conflicts
3. TIMING - When conflicts tend to occur
4. COMMUNICATION_STYLE - Defensive behaviors, blame language, etc.
5. ESCALATION_PATTERN - How small issues become big
6. RESOLUTION_PATTERN - What helps resolve conflicts
7. POSITIVE_PATTERN - What's working well

Return a JSON array of detected patterns. Each pattern should have:
{
  "type": "recurring_topic|trigger|timing|communication_style|escalation_pattern|resolution_pattern|positive_pattern",
  "title": "Short descriptive title",
  "description": "Detailed explanation of the pattern",
  "frequency": "weekly|monthly|occasional",
  "severity": 1-5 (1=minor, 5=severe),
  "relatedSessionIds": ["session-id-1", "session-id-2"],
  "exampleQuotes": ["Anonymized quote example 1", "Anonymized quote example 2"],
  "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2"],
  "confidence": 0.0-1.0
}

Only include patterns you're confident about (confidence > 0.6).
Return ONLY the JSON array, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse detected patterns
    let detectedPatterns: DetectedPattern[] = [];
    try {
      detectedPatterns = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse AI response:', responseText);
      return [];
    }

    // Save patterns to database
    const savedPatterns: ConflictPattern[] = [];

    for (const pattern of detectedPatterns) {
      const [saved] = await db
        .insert(conflictPatterns)
        .values({
          userId,
          type: pattern.type as ConflictPattern['type'],
          title: pattern.title,
          description: pattern.description,
          frequency: pattern.frequency,
          severity: pattern.severity,
          relatedSessionIds: JSON.stringify(pattern.relatedSessionIds),
          exampleQuotes: JSON.stringify(pattern.exampleQuotes),
          suggestions: JSON.stringify(pattern.suggestions),
          confidence: pattern.confidence,
        })
        .returning();

      savedPatterns.push({
        ...saved,
        relatedSessionIds: pattern.relatedSessionIds,
        exampleQuotes: pattern.exampleQuotes,
        suggestions: pattern.suggestions,
      });
    }

    // Log the analysis
    await db.insert(patternAnalysisLog).values({
      userId,
      sessionsAnalyzed: sessionSummaries.length,
      patternsFound: savedPatterns.length,
    });

    return savedPatterns;
  } catch (error) {
    console.error('Error running pattern analysis:', error);
    return [];
  }
}

// Get pattern by ID
export async function getPattern(patternId: string, userId: string): Promise<ConflictPattern | null> {
  const pattern = await db.query.conflictPatterns.findFirst({
    where: and(eq(conflictPatterns.id, patternId), eq(conflictPatterns.userId, userId)),
  });

  if (!pattern) return null;

  return {
    ...pattern,
    relatedSessionIds: pattern.relatedSessionIds ? JSON.parse(pattern.relatedSessionIds) : null,
    exampleQuotes: pattern.exampleQuotes ? JSON.parse(pattern.exampleQuotes) : null,
    suggestions: pattern.suggestions ? JSON.parse(pattern.suggestions) : null,
  };
}

// Pattern type labels for UI
export const PATTERN_TYPE_LABELS = {
  recurring_topic: 'Recurring Topic',
  trigger: 'Trigger',
  timing: 'Timing Pattern',
  communication_style: 'Communication Style',
  escalation_pattern: 'Escalation Pattern',
  resolution_pattern: 'Resolution Pattern',
  positive_pattern: 'Positive Pattern',
};

export const PATTERN_TYPE_COLORS = {
  recurring_topic: 'bg-blue-100 text-blue-800',
  trigger: 'bg-red-100 text-red-800',
  timing: 'bg-purple-100 text-purple-800',
  communication_style: 'bg-orange-100 text-orange-800',
  escalation_pattern: 'bg-red-100 text-red-800',
  resolution_pattern: 'bg-green-100 text-green-800',
  positive_pattern: 'bg-emerald-100 text-emerald-800',
};

export const SEVERITY_LABELS = {
  1: 'Minor',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Severe',
};
