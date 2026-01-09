import { db } from '@/lib/db';
import { sessions, messages, agreements, perspectives } from '@/lib/db/schema';
import { eq, desc, asc, and, sql, count } from 'drizzle-orm';

// Stage labels for display
const STAGE_LABELS: Record<string, string> = {
  intake: 'Intake',
  person_a_observation: 'Observation (A)',
  person_a_feeling: 'Feelings (A)',
  person_a_need: 'Needs (A)',
  person_a_request: 'Request (A)',
  reflection_a: 'Reflection (A)',
  person_b_observation: 'Observation (B)',
  person_b_feeling: 'Feelings (B)',
  person_b_need: 'Needs (B)',
  person_b_request: 'Request (B)',
  reflection_b: 'Reflection (B)',
  common_ground: 'Common Ground',
  agreement: 'Agreement',
  complete: 'Complete',
};

// Stage order for progress calculation
const STAGE_ORDER = [
  'intake',
  'person_a_observation',
  'person_a_feeling',
  'person_a_need',
  'person_a_request',
  'reflection_a',
  'person_b_observation',
  'person_b_feeling',
  'person_b_need',
  'person_b_request',
  'reflection_b',
  'common_ground',
  'agreement',
  'complete',
];

export interface SessionTimeline {
  id: string;
  stage: string;
  stageLabel: string;
  messageCount: number;
  timestamp: string;
  isBreakthrough: boolean;
  breakthroughType?: 'stage_complete' | 'agreement' | 'common_ground';
}

export interface SessionBreakthrough {
  id: string;
  type: 'agreement' | 'common_ground' | 'reflection' | 'progress';
  title: string;
  description: string;
  timestamp: string;
  stage: string;
}

export interface SessionPattern {
  category: string;
  description: string;
  sentiment: 'positive' | 'neutral' | 'concern';
}

export interface SessionInsights {
  sessionId: string;
  topic: string;
  status: string;
  stage: string;
  stageLabel: string;
  progress: number; // 0-100
  duration: {
    started: string;
    lastActivity: string;
    daysActive: number;
  };
  messageStats: {
    total: number;
    userMessages: number;
    assistantMessages: number;
    averageLength: number;
  };
  timeline: SessionTimeline[];
  breakthroughs: SessionBreakthrough[];
  patterns: SessionPattern[];
  agreements: {
    id: string;
    content: string;
    agreedByBoth: boolean;
    createdAt: string;
  }[];
  perspectives: {
    observation: string | null;
    feeling: string | null;
    need: string | null;
    request: string | null;
  } | null;
}

export interface SessionHistoryItem {
  id: string;
  topic: string;
  status: string;
  stage: string;
  stageLabel: string;
  progress: number;
  messageCount: number;
  hasAgreements: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionHistoryData {
  sessions: SessionHistoryItem[];
  stats: {
    totalSessions: number;
    completedSessions: number;
    averageProgress: number;
    totalBreakthroughs: number;
  };
  themes: {
    theme: string;
    count: number;
    successRate: number;
  }[];
}

// Get detailed insights for a single session
export async function getSessionInsights(sessionId: string, userId: string): Promise<SessionInsights | null> {
  // Get session with basic info
  const session = await db.query.sessions.findFirst({
    where: and(
      eq(sessions.id, sessionId),
      eq(sessions.initiatorId, userId)
    ),
  });

  if (!session) {
    return null;
  }

  // Get all messages for this session
  const sessionMessages = await db.query.messages.findMany({
    where: eq(messages.sessionId, sessionId),
    orderBy: [asc(messages.createdAt)],
  });

  // Get agreements
  const sessionAgreements = await db.query.agreements.findMany({
    where: eq(agreements.sessionId, sessionId),
    orderBy: [asc(agreements.createdAt)],
  });

  // Get perspectives
  const sessionPerspectives = await db.query.perspectives.findFirst({
    where: and(
      eq(perspectives.sessionId, sessionId),
      eq(perspectives.userId, userId)
    ),
  });

  // Calculate progress
  const currentStageIndex = STAGE_ORDER.indexOf(session.stage);
  const progress = Math.round((currentStageIndex / (STAGE_ORDER.length - 1)) * 100);

  // Calculate message stats
  const userMessages = sessionMessages.filter((m: typeof messages.$inferSelect) => m.role === 'user');
  const assistantMessages = sessionMessages.filter((m: typeof messages.$inferSelect) => m.role === 'assistant');
  const totalLength = sessionMessages.reduce((acc: number, m: typeof messages.$inferSelect) => acc + m.content.length, 0);
  const averageLength = sessionMessages.length > 0 ? Math.round(totalLength / sessionMessages.length) : 0;

  // Build timeline
  const timeline = buildTimeline(sessionMessages);

  // Identify breakthroughs
  const breakthroughs = identifyBreakthroughs(sessionMessages, sessionAgreements, session.stage);

  // Analyze patterns
  const patterns = analyzePatterns(sessionMessages, session.status);

  // Calculate duration
  const started = new Date(session.createdAt);
  const lastActivity = new Date(session.updatedAt);
  const daysActive = Math.max(1, Math.ceil((lastActivity.getTime() - started.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    sessionId: session.id,
    topic: session.topic,
    status: session.status,
    stage: session.stage,
    stageLabel: STAGE_LABELS[session.stage] || session.stage,
    progress,
    duration: {
      started: session.createdAt.toISOString(),
      lastActivity: session.updatedAt.toISOString(),
      daysActive,
    },
    messageStats: {
      total: sessionMessages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      averageLength,
    },
    timeline,
    breakthroughs,
    patterns,
    agreements: sessionAgreements.map((a: typeof agreements.$inferSelect) => ({
      id: a.id,
      content: a.content,
      agreedByBoth: a.agreedByUser1 && a.agreedByUser2,
      createdAt: a.createdAt.toISOString(),
    })),
    perspectives: sessionPerspectives ? {
      observation: sessionPerspectives.observation,
      feeling: sessionPerspectives.feeling,
      need: sessionPerspectives.need,
      request: sessionPerspectives.request,
    } : null,
  };
}

// Type for session with relations
type SessionWithRelations = typeof sessions.$inferSelect & {
  agreements: (typeof agreements.$inferSelect)[];
  messages: { id: string }[];
};

// Get session history with insights summary
export async function getSessionHistory(userId: string): Promise<SessionHistoryData> {
  // Get all sessions for user
  const userSessions = await db.query.sessions.findMany({
    where: eq(sessions.initiatorId, userId),
    orderBy: [desc(sessions.updatedAt)],
    with: {
      agreements: true,
      messages: {
        columns: { id: true },
      },
    },
  }) as SessionWithRelations[];

  // Calculate stats
  const totalSessions = userSessions.length;
  const completedSessions = userSessions.filter((s: SessionWithRelations) => s.status === 'completed').length;

  let totalProgress = 0;
  let totalBreakthroughs = 0;

  const sessionItems: SessionHistoryItem[] = userSessions.map((session: SessionWithRelations) => {
    const currentStageIndex = STAGE_ORDER.indexOf(session.stage);
    const progress = Math.round((currentStageIndex / (STAGE_ORDER.length - 1)) * 100);
    totalProgress += progress;

    // Count breakthroughs (agreements + reaching key stages)
    const breakthroughCount = session.agreements.length +
      (session.stage === 'complete' ? 1 : 0) +
      (session.stage === 'common_ground' || session.stage === 'agreement' ? 1 : 0);
    totalBreakthroughs += breakthroughCount;

    return {
      id: session.id,
      topic: session.topic,
      status: session.status,
      stage: session.stage,
      stageLabel: STAGE_LABELS[session.stage] || session.stage,
      progress,
      messageCount: session.messages.length,
      hasAgreements: session.agreements.length > 0,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  });

  // Analyze themes
  const themes = analyzeThemes(userSessions);

  return {
    sessions: sessionItems,
    stats: {
      totalSessions,
      completedSessions,
      averageProgress: totalSessions > 0 ? Math.round(totalProgress / totalSessions) : 0,
      totalBreakthroughs,
    },
    themes,
  };
}

// Build timeline from messages
function buildTimeline(sessionMessages: typeof messages.$inferSelect[]): SessionTimeline[] {
  const timeline: SessionTimeline[] = [];
  let currentStage = '';
  let stageMessages: typeof messages.$inferSelect[] = [];

  for (const message of sessionMessages) {
    if (message.stage !== currentStage) {
      // Save previous stage if exists
      if (currentStage && stageMessages.length > 0) {
        const lastMessage = stageMessages[stageMessages.length - 1];
        const isBreakthrough = ['reflection_a', 'reflection_b', 'common_ground', 'agreement', 'complete'].includes(currentStage);

        timeline.push({
          id: `stage-${currentStage}-${lastMessage.id}`,
          stage: currentStage,
          stageLabel: STAGE_LABELS[currentStage] || currentStage,
          messageCount: stageMessages.length,
          timestamp: lastMessage.createdAt.toISOString(),
          isBreakthrough,
          breakthroughType: isBreakthrough ? getBreakthroughType(currentStage) : undefined,
        });
      }

      currentStage = message.stage;
      stageMessages = [message];
    } else {
      stageMessages.push(message);
    }
  }

  // Don't forget the last stage
  if (currentStage && stageMessages.length > 0) {
    const lastMessage = stageMessages[stageMessages.length - 1];
    const isBreakthrough = ['reflection_a', 'reflection_b', 'common_ground', 'agreement', 'complete'].includes(currentStage);

    timeline.push({
      id: `stage-${currentStage}-${lastMessage.id}`,
      stage: currentStage,
      stageLabel: STAGE_LABELS[currentStage] || currentStage,
      messageCount: stageMessages.length,
      timestamp: lastMessage.createdAt.toISOString(),
      isBreakthrough,
      breakthroughType: isBreakthrough ? getBreakthroughType(currentStage) : undefined,
    });
  }

  return timeline;
}

function getBreakthroughType(stage: string): 'stage_complete' | 'agreement' | 'common_ground' {
  if (stage === 'agreement' || stage === 'complete') return 'agreement';
  if (stage === 'common_ground') return 'common_ground';
  return 'stage_complete';
}

// Identify breakthroughs in a session
function identifyBreakthroughs(
  sessionMessages: typeof messages.$inferSelect[],
  sessionAgreements: typeof agreements.$inferSelect[],
  currentStage: string
): SessionBreakthrough[] {
  const breakthroughs: SessionBreakthrough[] = [];

  // Add agreements as breakthroughs
  for (const agreement of sessionAgreements) {
    breakthroughs.push({
      id: `agreement-${agreement.id}`,
      type: 'agreement',
      title: 'Agreement Reached',
      description: agreement.content.length > 100
        ? agreement.content.substring(0, 100) + '...'
        : agreement.content,
      timestamp: agreement.createdAt.toISOString(),
      stage: 'agreement',
    });
  }

  // Check for reflection breakthroughs
  const stagesReached = new Set(sessionMessages.map(m => m.stage));

  if (stagesReached.has('reflection_a')) {
    const reflectionMsg = sessionMessages.find(m => m.stage === 'reflection_a');
    if (reflectionMsg) {
      breakthroughs.push({
        id: `reflection-a-${reflectionMsg.id}`,
        type: 'reflection',
        title: 'First Reflection Complete',
        description: 'Successfully articulated observations, feelings, needs, and requests.',
        timestamp: reflectionMsg.createdAt.toISOString(),
        stage: 'reflection_a',
      });
    }
  }

  if (stagesReached.has('reflection_b')) {
    const reflectionMsg = sessionMessages.find(m => m.stage === 'reflection_b');
    if (reflectionMsg) {
      breakthroughs.push({
        id: `reflection-b-${reflectionMsg.id}`,
        type: 'reflection',
        title: 'Second Reflection Complete',
        description: 'Both perspectives have been fully explored.',
        timestamp: reflectionMsg.createdAt.toISOString(),
        stage: 'reflection_b',
      });
    }
  }

  if (stagesReached.has('common_ground')) {
    const commonGroundMsg = sessionMessages.find(m => m.stage === 'common_ground');
    if (commonGroundMsg) {
      breakthroughs.push({
        id: `common-ground-${commonGroundMsg.id}`,
        type: 'common_ground',
        title: 'Common Ground Found',
        description: 'Identified shared values and mutual understanding.',
        timestamp: commonGroundMsg.createdAt.toISOString(),
        stage: 'common_ground',
      });
    }
  }

  // Progress breakthrough
  const stageIndex = STAGE_ORDER.indexOf(currentStage);
  if (stageIndex >= STAGE_ORDER.length / 2) {
    breakthroughs.push({
      id: `progress-halfway`,
      type: 'progress',
      title: 'Halfway Point Reached',
      description: 'Made significant progress through the NVC process.',
      timestamp: new Date().toISOString(),
      stage: currentStage,
    });
  }

  // Sort by timestamp
  breakthroughs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return breakthroughs;
}

// Analyze patterns in communication
function analyzePatterns(
  sessionMessages: typeof messages.$inferSelect[],
  status: string
): SessionPattern[] {
  const patterns: SessionPattern[] = [];

  // Analyze message frequency
  const userMessages = sessionMessages.filter(m => m.role === 'user');
  const avgUserMsgLength = userMessages.reduce((acc, m) => acc + m.content.length, 0) / (userMessages.length || 1);

  if (avgUserMsgLength > 200) {
    patterns.push({
      category: 'Communication Style',
      description: 'Detailed and thorough responses - good for deep exploration',
      sentiment: 'positive',
    });
  } else if (avgUserMsgLength < 50) {
    patterns.push({
      category: 'Communication Style',
      description: 'Brief responses - consider expanding on thoughts',
      sentiment: 'neutral',
    });
  }

  // Analyze engagement
  if (userMessages.length > 10) {
    patterns.push({
      category: 'Engagement',
      description: 'High engagement with the process',
      sentiment: 'positive',
    });
  }

  // Analyze session completion
  if (status === 'completed') {
    patterns.push({
      category: 'Resolution',
      description: 'Successfully completed the full NVC process',
      sentiment: 'positive',
    });
  } else if (status === 'abandoned') {
    patterns.push({
      category: 'Resolution',
      description: 'Session was not completed - consider returning to finish',
      sentiment: 'concern',
    });
  }

  // Check for feeling words in messages (simple sentiment analysis)
  const allContent = userMessages.map(m => m.content.toLowerCase()).join(' ');
  const positiveWords = ['grateful', 'appreciate', 'understand', 'agree', 'happy', 'hopeful', 'better'];
  const concernWords = ['frustrated', 'angry', 'upset', 'hurt', 'confused', 'disappointed'];

  const positiveCount = positiveWords.filter(w => allContent.includes(w)).length;
  const concernCount = concernWords.filter(w => allContent.includes(w)).length;

  if (positiveCount > concernCount && positiveCount > 0) {
    patterns.push({
      category: 'Emotional Tone',
      description: 'Generally positive emotional expression',
      sentiment: 'positive',
    });
  } else if (concernCount > positiveCount && concernCount > 0) {
    patterns.push({
      category: 'Emotional Tone',
      description: 'Processing difficult emotions - this is part of the healing process',
      sentiment: 'neutral',
    });
  }

  return patterns;
}

// Analyze themes across sessions
function analyzeThemes(
  userSessions: Array<typeof sessions.$inferSelect & { agreements: typeof agreements.$inferSelect[] }>
): { theme: string; count: number; successRate: number }[] {
  const themeStats: Record<string, { count: number; completed: number }> = {};

  for (const session of userSessions) {
    const topic = session.topic.toLowerCase();
    let theme = 'Other';

    // Categorize by keywords
    if (topic.includes('chore') || topic.includes('clean') || topic.includes('house') || topic.includes('dishes')) {
      theme = 'Household';
    } else if (topic.includes('money') || topic.includes('financ') || topic.includes('budget') || topic.includes('spend') || topic.includes('save')) {
      theme = 'Finances';
    } else if (topic.includes('talk') || topic.includes('listen') || topic.includes('communicat') || topic.includes('feel') || topic.includes('share')) {
      theme = 'Communication';
    } else if (topic.includes('kid') || topic.includes('child') || topic.includes('parent') || topic.includes('school')) {
      theme = 'Parenting';
    } else if (topic.includes('work') || topic.includes('job') || topic.includes('career') || topic.includes('boss')) {
      theme = 'Work-Life Balance';
    } else if (topic.includes('time') || topic.includes('together') || topic.includes('date') || topic.includes('quality')) {
      theme = 'Quality Time';
    } else if (topic.includes('family') || topic.includes('in-law') || topic.includes('relative')) {
      theme = 'Family Relations';
    } else if (topic.includes('trust') || topic.includes('honest') || topic.includes('lie')) {
      theme = 'Trust';
    }

    if (!themeStats[theme]) {
      themeStats[theme] = { count: 0, completed: 0 };
    }
    themeStats[theme].count++;
    if (session.status === 'completed') {
      themeStats[theme].completed++;
    }
  }

  return Object.entries(themeStats)
    .map(([theme, stats]) => ({
      theme,
      count: stats.count,
      successRate: stats.count > 0 ? Math.round((stats.completed / stats.count) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}
