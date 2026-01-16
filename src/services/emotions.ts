import { db } from '@/lib/db';
import { emotionCheckIns } from '@/lib/db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

export interface EmotionCheckInInput {
  sessionId?: string;
  type: 'pre_session' | 'post_session' | 'daily';
  overallMood: number; // 1-5
  primaryEmotion?: string;
  feelings?: string[];
  energyLevel?: number;
  opennessToTalk?: number;
  note?: string;
}

export interface EmotionCheckIn {
  id: string;
  userId: string;
  sessionId: string | null;
  type: 'pre_session' | 'post_session' | 'daily';
  overallMood: number;
  primaryEmotion: string | null;
  feelings: string[] | null;
  energyLevel: number | null;
  opennessToTalk: number | null;
  note: string | null;
  createdAt: Date;
}

export interface EmotionStats {
  averageMood: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  commonEmotions: { emotion: string; count: number }[];
  totalCheckIns: number;
  averageEnergyLevel: number;
  sessionMoodImprovement: number; // average post - pre session mood
}

// Record a new emotion check-in
export async function recordEmotionCheckIn(
  userId: string,
  data: EmotionCheckInInput
): Promise<EmotionCheckIn> {
  const [checkIn] = await db
    .insert(emotionCheckIns)
    .values({
      userId,
      sessionId: data.sessionId || null,
      type: data.type,
      overallMood: data.overallMood,
      primaryEmotion: data.primaryEmotion || null,
      feelings: data.feelings ? JSON.stringify(data.feelings) : null,
      energyLevel: data.energyLevel || null,
      opennessToTalk: data.opennessToTalk || null,
      note: data.note || null,
    })
    .returning();

  return {
    ...checkIn,
    feelings: data.feelings || null,
  };
}

// Get emotion check-ins for a specific session
export async function getSessionEmotionCheckIns(
  sessionId: string,
  userId: string
): Promise<EmotionCheckIn[]> {
  const checkIns = await db.query.emotionCheckIns.findMany({
    where: and(
      eq(emotionCheckIns.sessionId, sessionId),
      eq(emotionCheckIns.userId, userId)
    ),
    orderBy: [desc(emotionCheckIns.createdAt)],
  });

  return checkIns.map((c: typeof checkIns[number]) => ({
    ...c,
    feelings: c.feelings ? JSON.parse(c.feelings) : null,
  }));
}

// Get user's emotion history
export async function getUserEmotionHistory(
  userId: string,
  days: number = 30
): Promise<EmotionCheckIn[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const checkIns = await db.query.emotionCheckIns.findMany({
    where: and(
      eq(emotionCheckIns.userId, userId),
      gte(emotionCheckIns.createdAt, startDate)
    ),
    orderBy: [desc(emotionCheckIns.createdAt)],
  });

  return checkIns.map((c: typeof checkIns[number]) => ({
    ...c,
    feelings: c.feelings ? JSON.parse(c.feelings) : null,
  }));
}

// Calculate emotion statistics
export async function getEmotionStats(
  userId: string,
  days: number = 30
): Promise<EmotionStats> {
  const checkIns = await getUserEmotionHistory(userId, days);

  if (checkIns.length === 0) {
    return {
      averageMood: 0,
      moodTrend: 'stable',
      commonEmotions: [],
      totalCheckIns: 0,
      averageEnergyLevel: 0,
      sessionMoodImprovement: 0,
    };
  }

  // Calculate average mood
  const averageMood =
    checkIns.reduce((sum, c) => sum + c.overallMood, 0) / checkIns.length;

  // Calculate mood trend (compare first half to second half)
  const midpoint = Math.floor(checkIns.length / 2);
  const recentMoods = checkIns.slice(0, midpoint);
  const olderMoods = checkIns.slice(midpoint);

  const recentAvg =
    recentMoods.length > 0
      ? recentMoods.reduce((sum, c) => sum + c.overallMood, 0) / recentMoods.length
      : 0;
  const olderAvg =
    olderMoods.length > 0
      ? olderMoods.reduce((sum, c) => sum + c.overallMood, 0) / olderMoods.length
      : 0;

  let moodTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentAvg - olderAvg > 0.3) moodTrend = 'improving';
  else if (olderAvg - recentAvg > 0.3) moodTrend = 'declining';

  // Count common emotions
  const emotionCounts: Record<string, number> = {};
  checkIns.forEach((c) => {
    if (c.primaryEmotion) {
      emotionCounts[c.primaryEmotion] = (emotionCounts[c.primaryEmotion] || 0) + 1;
    }
    if (c.feelings) {
      c.feelings.forEach((f) => {
        emotionCounts[f] = (emotionCounts[f] || 0) + 1;
      });
    }
  });

  const commonEmotions = Object.entries(emotionCounts)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate average energy level
  const energyCheckIns = checkIns.filter((c) => c.energyLevel !== null);
  const averageEnergyLevel =
    energyCheckIns.length > 0
      ? energyCheckIns.reduce((sum, c) => sum + (c.energyLevel || 0), 0) /
        energyCheckIns.length
      : 0;

  // Calculate session mood improvement
  const preSessionCheckIns = checkIns.filter((c) => c.type === 'pre_session');
  const postSessionCheckIns = checkIns.filter((c) => c.type === 'post_session');

  let sessionMoodImprovement = 0;
  if (preSessionCheckIns.length > 0 && postSessionCheckIns.length > 0) {
    const preAvg =
      preSessionCheckIns.reduce((sum, c) => sum + c.overallMood, 0) /
      preSessionCheckIns.length;
    const postAvg =
      postSessionCheckIns.reduce((sum, c) => sum + c.overallMood, 0) /
      postSessionCheckIns.length;
    sessionMoodImprovement = postAvg - preAvg;
  }

  return {
    averageMood: Math.round(averageMood * 10) / 10,
    moodTrend,
    commonEmotions,
    totalCheckIns: checkIns.length,
    averageEnergyLevel: Math.round(averageEnergyLevel * 10) / 10,
    sessionMoodImprovement: Math.round(sessionMoodImprovement * 10) / 10,
  };
}

// Get the most recent check-in for a session
export async function getLatestSessionCheckIn(
  sessionId: string,
  userId: string,
  type?: 'pre_session' | 'post_session'
): Promise<EmotionCheckIn | null> {
  const conditions = [
    eq(emotionCheckIns.sessionId, sessionId),
    eq(emotionCheckIns.userId, userId),
  ];

  if (type) {
    conditions.push(eq(emotionCheckIns.type, type));
  }

  const checkIn = await db.query.emotionCheckIns.findFirst({
    where: and(...conditions),
    orderBy: [desc(emotionCheckIns.createdAt)],
  });

  if (!checkIn) return null;

  return {
    ...checkIn,
    feelings: checkIn.feelings ? JSON.parse(checkIn.feelings) : null,
  };
}

// Common emotions list for UI
export const EMOTION_OPTIONS = {
  positive: ['happy', 'grateful', 'hopeful', 'calm', 'content', 'excited', 'loved', 'peaceful'],
  negative: ['angry', 'frustrated', 'sad', 'anxious', 'hurt', 'disappointed', 'overwhelmed', 'lonely'],
  neutral: ['confused', 'uncertain', 'tired', 'distracted', 'numb', 'indifferent'],
};

export const MOOD_LABELS = {
  1: 'Very Low',
  2: 'Low',
  3: 'Neutral',
  4: 'Good',
  5: 'Great',
};
