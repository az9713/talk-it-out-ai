import { db } from '@/lib/db';
import { goals, milestones, sessions } from '@/lib/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

export type GoalCategory =
  | 'communication'
  | 'conflict_resolution'
  | 'emotional_connection'
  | 'trust_building'
  | 'quality_time'
  | 'boundaries'
  | 'personal_growth'
  | 'other';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  status: GoalStatus;
  targetDate: Date | null;
  progress: number;
  sessionsTarget: number | null;
  sessionsCompleted: number;
  celebrationShown: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface Milestone {
  id: string;
  goalId: string;
  userId: string;
  title: string;
  description: string | null;
  targetProgress: number;
  isAchieved: boolean;
  achievedAt: Date | null;
  celebrationShown: boolean;
  createdAt: Date;
}

export interface CreateGoalInput {
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetDate?: Date;
  sessionsTarget?: number;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  targetDate?: Date | null;
  progress?: number;
  sessionsTarget?: number | null;
  celebrationShown?: boolean;
}

// Goal category labels and colors
export const GOAL_CATEGORIES: Record<GoalCategory, { label: string; color: string; emoji: string }> = {
  communication: { label: 'Communication', color: 'blue', emoji: '💬' },
  conflict_resolution: { label: 'Conflict Resolution', color: 'rose', emoji: '🤝' },
  emotional_connection: { label: 'Emotional Connection', color: 'pink', emoji: '❤️' },
  trust_building: { label: 'Trust Building', color: 'purple', emoji: '🔒' },
  quality_time: { label: 'Quality Time', color: 'amber', emoji: '⏰' },
  boundaries: { label: 'Boundaries', color: 'green', emoji: '🛡️' },
  personal_growth: { label: 'Personal Growth', color: 'cyan', emoji: '🌱' },
  other: { label: 'Other', color: 'gray', emoji: '📌' },
};

// Default milestones for goals
const DEFAULT_MILESTONES = [
  { targetProgress: 25, title: 'Getting Started', description: 'Made initial progress toward your goal' },
  { targetProgress: 50, title: 'Halfway There', description: 'You\'re halfway to achieving your goal!' },
  { targetProgress: 75, title: 'Almost There', description: 'Great progress - the finish line is in sight' },
  { targetProgress: 100, title: 'Goal Achieved', description: 'Congratulations! You\'ve reached your goal!' },
];

// Create a new goal with default milestones
export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const [goal] = await db
    .insert(goals)
    .values({
      userId: input.userId,
      title: input.title,
      description: input.description || null,
      category: input.category,
      targetDate: input.targetDate || null,
      sessionsTarget: input.sessionsTarget || null,
    })
    .returning();

  // Create default milestones for the goal
  const milestonesToCreate = DEFAULT_MILESTONES.map((m) => ({
    goalId: goal.id,
    userId: input.userId,
    title: m.title,
    description: m.description,
    targetProgress: m.targetProgress,
  }));

  await db.insert(milestones).values(milestonesToCreate);

  return goal as Goal;
}

// Get all goals for a user
export async function getUserGoals(userId: string): Promise<Goal[]> {
  const result = await db.query.goals.findMany({
    where: eq(goals.userId, userId),
    orderBy: [desc(goals.createdAt)],
  });

  return result as Goal[];
}

// Get active goals for a user
export async function getActiveGoals(userId: string): Promise<Goal[]> {
  const result = await db.query.goals.findMany({
    where: and(eq(goals.userId, userId), eq(goals.status, 'active')),
    orderBy: [desc(goals.createdAt)],
  });

  return result as Goal[];
}

// Get a single goal with milestones
export async function getGoalWithMilestones(
  goalId: string,
  userId: string
): Promise<(Goal & { milestones: Milestone[] }) | null> {
  const goal = await db.query.goals.findFirst({
    where: and(eq(goals.id, goalId), eq(goals.userId, userId)),
    with: {
      milestones: {
        orderBy: [asc(milestones.targetProgress)],
      },
    },
  });

  if (!goal) return null;

  return goal as Goal & { milestones: Milestone[] };
}

// Update a goal
export async function updateGoal(
  goalId: string,
  userId: string,
  data: UpdateGoalInput
): Promise<Goal | null> {
  const [updated] = await db
    .update(goals)
    .set({
      ...data,
      updatedAt: new Date(),
      completedAt: data.status === 'completed' ? new Date() : undefined,
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();

  if (!updated) return null;

  // Check and update milestones based on new progress
  if (data.progress !== undefined) {
    await checkAndUpdateMilestones(goalId, userId, data.progress);
  }

  return updated as Goal;
}

// Update goal progress
export async function updateGoalProgress(
  goalId: string,
  userId: string,
  progress: number
): Promise<Goal | null> {
  const newProgress = Math.min(100, Math.max(0, progress));
  const isCompleted = newProgress >= 100;

  const [updated] = await db
    .update(goals)
    .set({
      progress: newProgress,
      status: isCompleted ? 'completed' : undefined,
      completedAt: isCompleted ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();

  if (!updated) return null;

  // Check and update milestones
  await checkAndUpdateMilestones(goalId, userId, newProgress);

  return updated as Goal;
}

// Check and update milestones based on progress
async function checkAndUpdateMilestones(
  goalId: string,
  userId: string,
  progress: number
): Promise<void> {
  // Get all milestones for this goal
  const goalMilestones = await db.query.milestones.findMany({
    where: and(eq(milestones.goalId, goalId), eq(milestones.isAchieved, false)),
  });

  // Update milestones that have been achieved
  for (const milestone of goalMilestones) {
    if (progress >= milestone.targetProgress) {
      await db
        .update(milestones)
        .set({
          isAchieved: true,
          achievedAt: new Date(),
        })
        .where(eq(milestones.id, milestone.id));
    }
  }
}

// Increment sessions completed for a goal
export async function incrementGoalSessions(
  goalId: string,
  userId: string
): Promise<Goal | null> {
  const goal = await db.query.goals.findFirst({
    where: and(eq(goals.id, goalId), eq(goals.userId, userId)),
  });

  if (!goal) return null;

  const newSessionsCompleted = goal.sessionsCompleted + 1;
  let newProgress = goal.progress;

  // Calculate progress based on sessions if target is set
  if (goal.sessionsTarget && goal.sessionsTarget > 0) {
    newProgress = Math.min(100, Math.round((newSessionsCompleted / goal.sessionsTarget) * 100));
  }

  return updateGoal(goalId, userId, {
    progress: newProgress,
    status: newProgress >= 100 ? 'completed' : undefined,
  });
}

// Delete a goal (and its milestones due to cascade)
export async function deleteGoal(goalId: string, userId: string): Promise<boolean> {
  const [deleted] = await db
    .delete(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();

  return !!deleted;
}

// Get milestones for a goal
export async function getGoalMilestones(goalId: string, userId: string): Promise<Milestone[]> {
  const result = await db.query.milestones.findMany({
    where: and(eq(milestones.goalId, goalId), eq(milestones.userId, userId)),
    orderBy: [asc(milestones.targetProgress)],
  });

  return result as Milestone[];
}

// Mark milestone celebration as shown
export async function markMilestoneCelebrationShown(
  milestoneId: string,
  userId: string
): Promise<boolean> {
  const [updated] = await db
    .update(milestones)
    .set({ celebrationShown: true })
    .where(and(eq(milestones.id, milestoneId), eq(milestones.userId, userId)))
    .returning();

  return !!updated;
}

// Mark goal celebration as shown
export async function markGoalCelebrationShown(
  goalId: string,
  userId: string
): Promise<boolean> {
  const [updated] = await db
    .update(goals)
    .set({ celebrationShown: true })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();

  return !!updated;
}

// Get uncelebrated achievements (milestones and completed goals)
export async function getUncelebratedAchievements(userId: string): Promise<{
  milestones: (Milestone & { goalTitle: string })[];
  completedGoals: Goal[];
}> {
  // Get uncelebrated milestones
  const uncelebratedMilestones = await db.query.milestones.findMany({
    where: and(
      eq(milestones.userId, userId),
      eq(milestones.isAchieved, true),
      eq(milestones.celebrationShown, false)
    ),
    with: {
      goal: {
        columns: { title: true },
      },
    },
  });

  // Get uncelebrated completed goals
  const uncelebratedGoals = await db.query.goals.findMany({
    where: and(
      eq(goals.userId, userId),
      eq(goals.status, 'completed'),
      eq(goals.celebrationShown, false)
    ),
  });

  return {
    milestones: uncelebratedMilestones.map((m: typeof milestones.$inferSelect & { goal: { title: string } }) => ({
      ...(m as Milestone),
      goalTitle: m.goal.title,
    })),
    completedGoals: uncelebratedGoals as Goal[],
  };
}

// Get goal statistics for a user
export async function getGoalStats(userId: string): Promise<{
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalMilestones: number;
  achievedMilestones: number;
  averageProgress: number;
}> {
  const userGoals = await getUserGoals(userId);
  const userMilestones = await db.query.milestones.findMany({
    where: eq(milestones.userId, userId),
  });

  const totalGoals = userGoals.length;
  const activeGoals = userGoals.filter((g) => g.status === 'active').length;
  const completedGoals = userGoals.filter((g) => g.status === 'completed').length;
  const totalMilestones = userMilestones.length;
  const achievedMilestones = userMilestones.filter((m: typeof milestones.$inferSelect) => m.isAchieved).length;

  const activeGoalsList = userGoals.filter((g) => g.status === 'active');
  const averageProgress =
    activeGoalsList.length > 0
      ? Math.round(activeGoalsList.reduce((acc, g) => acc + g.progress, 0) / activeGoalsList.length)
      : 0;

  return {
    totalGoals,
    activeGoals,
    completedGoals,
    totalMilestones,
    achievedMilestones,
    averageProgress,
  };
}
