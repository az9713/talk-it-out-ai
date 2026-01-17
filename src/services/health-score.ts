import { db } from '@/lib/db';
import { healthScores, sessions, emotionCheckIns, goals, agreements } from '@/lib/db/schema';
import { eq, and, desc, gte, count } from 'drizzle-orm';

export interface HealthScore {
  id: string;
  userId: string;
  partnershipId: string | null;
  overallScore: number;
  communicationScore: number | null;
  resolutionScore: number | null;
  consistencyScore: number | null;
  progressScore: number | null;
  emotionalScore: number | null;
  trend: 'improving' | 'stable' | 'declining' | null;
  trendPercentage: number | null;
  factors: HealthFactors | null;
  periodStart: Date;
  periodEnd: Date;
  calculatedAt: Date;
}

export interface HealthFactors {
  sessionCompletionRate: number;
  averageMoodImprovement: number;
  agreementCount: number;
  goalProgress: number;
  sessionFrequency: number;
  positiveInteractions: number;
}

// Get current health score
export async function getCurrentHealthScore(userId: string): Promise<HealthScore | null> {
  const score = await db.query.healthScores.findFirst({
    where: eq(healthScores.userId, userId),
    orderBy: [desc(healthScores.calculatedAt)],
  });

  if (!score) return null;

  return {
    ...score,
    factors: score.factors ? JSON.parse(score.factors) : null,
  };
}

// Get health score history
export async function getHealthScoreHistory(
  userId: string,
  months: number = 6
): Promise<HealthScore[]> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const scores = await db.query.healthScores.findMany({
    where: and(
      eq(healthScores.userId, userId),
      gte(healthScores.calculatedAt, startDate)
    ),
    orderBy: [desc(healthScores.calculatedAt)],
  });

  return scores.map((s: typeof scores[number]) => ({
    ...s,
    factors: s.factors ? JSON.parse(s.factors) : null,
  }));
}

// Calculate and save new health score
export async function calculateHealthScore(userId: string): Promise<HealthScore> {
  const now = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - 30); // Last 30 days

  // Get previous score for trend calculation
  const previousScore = await getCurrentHealthScore(userId);

  // Calculate component scores
  const communicationScore = await calculateCommunicationScore(userId, periodStart);
  const resolutionScore = await calculateResolutionScore(userId, periodStart);
  const consistencyScore = await calculateConsistencyScore(userId, periodStart);
  const progressScore = await calculateProgressScore(userId);
  const emotionalScore = await calculateEmotionalScore(userId, periodStart);

  // Calculate overall score (weighted average)
  const weights = {
    communication: 0.25,
    resolution: 0.25,
    consistency: 0.15,
    progress: 0.15,
    emotional: 0.20,
  };

  const overallScore = Math.round(
    communicationScore * weights.communication +
    resolutionScore * weights.resolution +
    consistencyScore * weights.consistency +
    progressScore * weights.progress +
    emotionalScore * weights.emotional
  );

  // Calculate trend
  let trend: 'improving' | 'stable' | 'declining' | null = null;
  let trendPercentage: number | null = null;

  if (previousScore) {
    const scoreDiff = overallScore - previousScore.overallScore;
    trendPercentage = Math.round((scoreDiff / previousScore.overallScore) * 100);

    if (scoreDiff > 5) trend = 'improving';
    else if (scoreDiff < -5) trend = 'declining';
    else trend = 'stable';
  }

  // Calculate detailed factors
  const factors = await calculateFactors(userId, periodStart);

  // Save the score
  const [saved] = await db
    .insert(healthScores)
    .values({
      userId,
      overallScore,
      communicationScore,
      resolutionScore,
      consistencyScore,
      progressScore,
      emotionalScore,
      trend,
      trendPercentage,
      factors: JSON.stringify(factors),
      periodStart,
      periodEnd: now,
    })
    .returning();

  return {
    ...saved,
    factors,
  };
}

// Calculate communication score based on session participation and message patterns
async function calculateCommunicationScore(userId: string, since: Date): Promise<number> {
  const userSessions = await db.query.sessions.findMany({
    where: and(
      eq(sessions.initiatorId, userId),
      gte(sessions.createdAt, since)
    ),
    with: {
      messages: true,
    },
  });

  if (userSessions.length === 0) return 50; // Default score

  let score = 50; // Base score

  // Bonus for session completion
  const completedCount = userSessions.filter((s: typeof userSessions[number]) => s.status === 'completed').length;
  const completionRate = completedCount / userSessions.length;
  score += completionRate * 30;

  // Bonus for reaching later stages
  const advancedStages = ['reflection_a', 'reflection_b', 'common_ground', 'agreement', 'complete'];
  const advancedCount = userSessions.filter((s: typeof userSessions[number]) => advancedStages.includes(s.stage)).length;
  score += (advancedCount / userSessions.length) * 20;

  return Math.min(100, Math.round(score));
}

// Calculate resolution score based on agreements and completions
async function calculateResolutionScore(userId: string, since: Date): Promise<number> {
  const userSessions = await db.query.sessions.findMany({
    where: and(
      eq(sessions.initiatorId, userId),
      gte(sessions.createdAt, since)
    ),
    with: {
      agreements: true,
    },
  });

  if (userSessions.length === 0) return 50;

  let score = 50;

  // Sessions with agreements
  const sessionsWithAgreements = userSessions.filter((s: typeof userSessions[number]) => s.agreements.length > 0).length;
  score += (sessionsWithAgreements / userSessions.length) * 30;

  // Completed sessions
  const completedSessions = userSessions.filter((s: typeof userSessions[number]) => s.status === 'completed').length;
  score += (completedSessions / userSessions.length) * 20;

  return Math.min(100, Math.round(score));
}

// Calculate consistency score based on session frequency
async function calculateConsistencyScore(userId: string, since: Date): Promise<number> {
  const userSessions = await db.query.sessions.findMany({
    where: and(
      eq(sessions.initiatorId, userId),
      gte(sessions.createdAt, since)
    ),
  });

  const daysSince = Math.ceil((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24));
  const sessionsPerWeek = (userSessions.length / daysSince) * 7;

  // Ideal is 1-2 sessions per week
  let score = 50;

  if (sessionsPerWeek >= 0.5 && sessionsPerWeek <= 3) {
    score = 80 + Math.min(20, sessionsPerWeek * 10);
  } else if (sessionsPerWeek > 0) {
    score = 60;
  }

  return Math.round(score);
}

// Calculate progress score based on goal completion
async function calculateProgressScore(userId: string): Promise<number> {
  const userGoals = await db.query.goals.findMany({
    where: eq(goals.userId, userId),
  });

  if (userGoals.length === 0) return 50;

  const activeGoals = userGoals.filter((g: typeof userGoals[number]) => g.status === 'active');
  const completedGoals = userGoals.filter((g: typeof userGoals[number]) => g.status === 'completed');

  let score = 50;

  // Bonus for having goals
  if (userGoals.length > 0) score += 10;

  // Score based on average progress of active goals
  if (activeGoals.length > 0) {
    const avgProgress = activeGoals.reduce((sum: number, g: typeof activeGoals[number]) => sum + g.progress, 0) / activeGoals.length;
    score += avgProgress * 0.2;
  }

  // Bonus for completed goals
  const completionRate = completedGoals.length / userGoals.length;
  score += completionRate * 20;

  return Math.min(100, Math.round(score));
}

// Calculate emotional score based on mood check-ins
async function calculateEmotionalScore(userId: string, since: Date): Promise<number> {
  const checkIns = await db.query.emotionCheckIns.findMany({
    where: and(
      eq(emotionCheckIns.userId, userId),
      gte(emotionCheckIns.createdAt, since)
    ),
  });

  if (checkIns.length === 0) return 50;

  // Average mood (1-5) converted to 0-100
  const avgMood = checkIns.reduce((sum: number, c: typeof checkIns[number]) => sum + c.overallMood, 0) / checkIns.length;
  const moodScore = ((avgMood - 1) / 4) * 100;

  // Check for improvement (post vs pre session)
  const preSessions = checkIns.filter((c: typeof checkIns[number]) => c.type === 'pre_session');
  const postSessions = checkIns.filter((c: typeof checkIns[number]) => c.type === 'post_session');

  let improvementBonus = 0;
  if (preSessions.length > 0 && postSessions.length > 0) {
    const preAvg = preSessions.reduce((sum: number, c: typeof preSessions[number]) => sum + c.overallMood, 0) / preSessions.length;
    const postAvg = postSessions.reduce((sum: number, c: typeof postSessions[number]) => sum + c.overallMood, 0) / postSessions.length;
    if (postAvg > preAvg) {
      improvementBonus = Math.min(20, (postAvg - preAvg) * 10);
    }
  }

  return Math.min(100, Math.round(moodScore * 0.8 + improvementBonus));
}

// Calculate detailed factors for insights
async function calculateFactors(userId: string, since: Date): Promise<HealthFactors> {
  const userSessions = await db.query.sessions.findMany({
    where: and(
      eq(sessions.initiatorId, userId),
      gte(sessions.createdAt, since)
    ),
    with: {
      agreements: true,
    },
  });

  const checkIns = await db.query.emotionCheckIns.findMany({
    where: and(
      eq(emotionCheckIns.userId, userId),
      gte(emotionCheckIns.createdAt, since)
    ),
  });

  const userGoals = await db.query.goals.findMany({
    where: eq(goals.userId, userId),
  });

  // Session completion rate
  const completedSessions = userSessions.filter((s: typeof userSessions[number]) => s.status === 'completed').length;
  const sessionCompletionRate = userSessions.length > 0
    ? Math.round((completedSessions / userSessions.length) * 100)
    : 0;

  // Mood improvement
  const preSessionCheckIns = checkIns.filter((c: typeof checkIns[number]) => c.type === 'pre_session');
  const postSessionCheckIns = checkIns.filter((c: typeof checkIns[number]) => c.type === 'post_session');
  let averageMoodImprovement = 0;
  if (preSessionCheckIns.length > 0 && postSessionCheckIns.length > 0) {
    const preAvg = preSessionCheckIns.reduce((sum: number, c: typeof preSessionCheckIns[number]) => sum + c.overallMood, 0) / preSessionCheckIns.length;
    const postAvg = postSessionCheckIns.reduce((sum: number, c: typeof postSessionCheckIns[number]) => sum + c.overallMood, 0) / postSessionCheckIns.length;
    averageMoodImprovement = Math.round((postAvg - preAvg) * 10) / 10;
  }

  // Agreement count
  const agreementCount = userSessions.reduce((sum: number, s: typeof userSessions[number]) => sum + s.agreements.length, 0);

  // Goal progress
  const activeGoals = userGoals.filter((g: typeof userGoals[number]) => g.status === 'active');
  const goalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum: number, g: typeof activeGoals[number]) => sum + g.progress, 0) / activeGoals.length)
    : 0;

  // Session frequency (sessions per week)
  const daysSince = Math.ceil((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24));
  const sessionFrequency = Math.round((userSessions.length / daysSince) * 7 * 10) / 10;

  // Positive interactions (sessions reaching agreement stage)
  const positiveInteractions = userSessions.filter((s: typeof userSessions[number]) =>
    ['agreement', 'complete'].includes(s.stage)
  ).length;

  return {
    sessionCompletionRate,
    averageMoodImprovement,
    agreementCount,
    goalProgress,
    sessionFrequency,
    positiveInteractions,
  };
}

// Get health insights (recommendations based on score components)
export function getHealthInsights(score: HealthScore): string[] {
  const insights: string[] = [];

  if (score.communicationScore && score.communicationScore < 60) {
    insights.push('Try to complete more sessions to improve your communication score.');
  }

  if (score.resolutionScore && score.resolutionScore < 60) {
    insights.push('Focus on reaching agreements in your sessions.');
  }

  if (score.consistencyScore && score.consistencyScore < 60) {
    insights.push('Regular sessions help build better communication habits.');
  }

  if (score.progressScore && score.progressScore < 60) {
    insights.push('Set relationship goals to track your progress.');
  }

  if (score.emotionalScore && score.emotionalScore < 60) {
    insights.push('Consider using calming exercises before sessions.');
  }

  if (score.overallScore >= 80) {
    insights.push("You're doing great! Keep up the good work.");
  }

  return insights;
}

// Score level labels
export const SCORE_LEVELS = {
  excellent: { min: 80, label: 'Excellent', color: 'text-green-600' },
  good: { min: 60, label: 'Good', color: 'text-blue-600' },
  fair: { min: 40, label: 'Fair', color: 'text-yellow-600' },
  needsWork: { min: 0, label: 'Needs Work', color: 'text-red-600' },
};

export function getScoreLevel(score: number): { label: string; color: string } {
  if (score >= 80) return SCORE_LEVELS.excellent;
  if (score >= 60) return SCORE_LEVELS.good;
  if (score >= 40) return SCORE_LEVELS.fair;
  return SCORE_LEVELS.needsWork;
}
