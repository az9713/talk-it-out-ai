import { db } from '@/lib/db';
import { sessions, messages } from '@/lib/db/schema';
import { eq, count, sql } from 'drizzle-orm';

// Type for session data from database query
type SessionRecord = {
  id: string;
  topic: string;
  stage: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  partnershipId: string | null;
  initiatorId: string;
  currentSpeakerId: string | null;
};

export interface SessionMetrics {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  pausedSessions: number;
  activeSessions: number;
  completionRate: number;
}

export interface TimeMetrics {
  averageMessagesPerSession: number;
  totalMessages: number;
}

export interface MonthlyData {
  month: string;
  sessions: number;
  completed: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  color: string;
}

export interface StageProgress {
  stage: string;
  count: number;
}

export interface TopicCategory {
  topic: string;
  count: number;
}

export interface AnalyticsData {
  sessionMetrics: SessionMetrics;
  timeMetrics: TimeMetrics;
  sessionsOverTime: MonthlyData[];
  statusBreakdown: StatusBreakdown[];
  stageProgress: StageProgress[];
  recentActivity: { date: string; sessions: number }[];
  topTopics: TopicCategory[];
}

const STATUS_COLORS: Record<string, string> = {
  completed: '#10b981',
  active: '#3b82f6',
  paused: '#f59e0b',
  abandoned: '#ef4444',
};

const STAGE_LABELS: Record<string, string> = {
  intake: 'Intake',
  person_a_observation: 'Observation A',
  person_a_feeling: 'Feeling A',
  person_a_need: 'Need A',
  person_a_request: 'Request A',
  reflection_a: 'Reflection A',
  person_b_observation: 'Observation B',
  person_b_feeling: 'Feeling B',
  person_b_need: 'Need B',
  person_b_request: 'Request B',
  reflection_b: 'Reflection B',
  common_ground: 'Common Ground',
  agreement: 'Agreement',
  complete: 'Complete',
};

export async function getAnalytics(userId: string): Promise<AnalyticsData> {
  // Get all sessions for the user (as initiator)
  const userSessions: SessionRecord[] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.initiatorId, userId));

  // Calculate session metrics
  const totalSessions = userSessions.length;
  const completedSessions = userSessions.filter((s: SessionRecord) => s.status === 'completed').length;
  const abandonedSessions = userSessions.filter((s: SessionRecord) => s.status === 'abandoned').length;
  const pausedSessions = userSessions.filter((s: SessionRecord) => s.status === 'paused').length;
  const activeSessions = userSessions.filter((s: SessionRecord) => s.status === 'active').length;
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // Get message counts
  const sessionIds = userSessions.map((s) => s.id);
  let totalMessages = 0;
  let averageMessagesPerSession = 0;

  if (sessionIds.length > 0) {
    const messageCountResult = await db
      .select({ count: count() })
      .from(messages)
      .where(sql`${messages.sessionId} IN ${sessionIds}`);

    totalMessages = messageCountResult[0]?.count || 0;
    averageMessagesPerSession = totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0;
  }

  // Get sessions over time (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const sessionsOverTime = getSessionsOverTime(userSessions, sixMonthsAgo);

  // Status breakdown for pie chart
  const statusBreakdown: StatusBreakdown[] = [
    { status: 'Completed', count: completedSessions, color: STATUS_COLORS.completed },
    { status: 'Active', count: activeSessions, color: STATUS_COLORS.active },
    { status: 'Paused', count: pausedSessions, color: STATUS_COLORS.paused },
    { status: 'Abandoned', count: abandonedSessions, color: STATUS_COLORS.abandoned },
  ].filter((s) => s.count > 0);

  // Stage progress - where sessions currently are
  const stageProgress = getStageProgress(userSessions);

  // Recent activity (last 14 days)
  const recentActivity = getRecentActivity(userSessions);

  // Top topics (simplified word analysis)
  const topTopics = getTopTopics(userSessions);

  return {
    sessionMetrics: {
      totalSessions,
      completedSessions,
      abandonedSessions,
      pausedSessions,
      activeSessions,
      completionRate: Math.round(completionRate),
    },
    timeMetrics: {
      averageMessagesPerSession,
      totalMessages,
    },
    sessionsOverTime,
    statusBreakdown,
    stageProgress,
    recentActivity,
    topTopics,
  };
}

function getSessionsOverTime(
  userSessions: SessionRecord[],
  _startDate: Date
): MonthlyData[] {
  const months: MonthlyData[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    const monthSessions = userSessions.filter((s) => {
      const sessionDate = new Date(s.createdAt);
      return (
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });

    months.push({
      month: monthStr,
      sessions: monthSessions.length,
      completed: monthSessions.filter((s) => s.status === 'completed').length,
    });
  }

  return months;
}

function getStageProgress(
  userSessions: SessionRecord[]
): StageProgress[] {
  const stageCounts: Record<string, number> = {};

  // Only count active and paused sessions (not completed/abandoned)
  const activePausedSessions = userSessions.filter(
    (s) => s.status === 'active' || s.status === 'paused'
  );

  for (const session of activePausedSessions) {
    const label = STAGE_LABELS[session.stage] || session.stage;
    stageCounts[label] = (stageCounts[label] || 0) + 1;
  }

  return Object.entries(stageCounts)
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => b.count - a.count);
}

function getRecentActivity(
  userSessions: SessionRecord[]
): { date: string; sessions: number }[] {
  const activity: { date: string; sessions: number }[] = [];
  const now = new Date();

  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const daySessions = userSessions.filter((s) => {
      const sessionDate = new Date(s.createdAt);
      return sessionDate.toDateString() === date.toDateString();
    });

    activity.push({
      date: dateStr,
      sessions: daySessions.length,
    });
  }

  return activity;
}

function getTopTopics(userSessions: SessionRecord[]): TopicCategory[] {
  const topicCounts: Record<string, number> = {};

  for (const session of userSessions) {
    // Simple topic categorization based on keywords
    const topic = session.topic.toLowerCase();
    let category = 'Other';

    if (topic.includes('chore') || topic.includes('clean') || topic.includes('house')) {
      category = 'Household';
    } else if (topic.includes('money') || topic.includes('financ') || topic.includes('budget') || topic.includes('spend')) {
      category = 'Finances';
    } else if (topic.includes('talk') || topic.includes('listen') || topic.includes('communicat') || topic.includes('feel')) {
      category = 'Communication';
    } else if (topic.includes('kid') || topic.includes('child') || topic.includes('parent')) {
      category = 'Parenting';
    } else if (topic.includes('work') || topic.includes('job') || topic.includes('career')) {
      category = 'Work-Life';
    } else if (topic.includes('time') || topic.includes('together') || topic.includes('date')) {
      category = 'Quality Time';
    }

    topicCounts[category] = (topicCounts[category] || 0) + 1;
  }

  return Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export async function getQuickStats(userId: string): Promise<{
  totalSessions: number;
  completionRate: number;
  activeSessions: number;
}> {
  const userSessions: SessionRecord[] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.initiatorId, userId));

  const totalSessions = userSessions.length;
  const completedSessions = userSessions.filter((s: SessionRecord) => s.status === 'completed').length;
  const activeSessions = userSessions.filter((s: SessionRecord) => s.status === 'active').length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  return {
    totalSessions,
    completionRate,
    activeSessions,
  };
}
