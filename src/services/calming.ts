import { db } from '@/lib/db';
import { calmingExercises, exerciseCompletions } from '@/lib/db/schema';
import { eq, and, desc, gte } from 'drizzle-orm';

export interface CalmingExercise {
  id: string;
  name: string;
  description: string | null;
  type: 'breathing' | 'grounding' | 'visualization' | 'body_scan';
  durationSeconds: number;
  instructions: ExerciseInstruction[] | null;
  audioUrl: string | null;
  isActive: boolean;
}

export interface ExerciseInstruction {
  step: number;
  text: string;
  durationSeconds?: number;
  action?: 'inhale' | 'exhale' | 'hold' | 'observe' | 'relax';
}

export interface ExerciseCompletion {
  id: string;
  userId: string;
  exerciseId: string;
  sessionId: string | null;
  moodBefore: number | null;
  moodAfter: number | null;
  completedAt: Date;
  exercise?: CalmingExercise;
}

export interface CompletionInput {
  exerciseId: string;
  sessionId?: string;
  moodBefore?: number;
  moodAfter?: number;
}

// Get all active exercises
export async function getExercises(type?: string): Promise<CalmingExercise[]> {
  let exercises;

  if (type) {
    exercises = await db.query.calmingExercises.findMany({
      where: and(
        eq(calmingExercises.isActive, true),
        eq(calmingExercises.type, type as CalmingExercise['type'])
      ),
    });
  } else {
    exercises = await db.query.calmingExercises.findMany({
      where: eq(calmingExercises.isActive, true),
    });
  }

  return exercises.map((e: typeof exercises[number]) => ({
    ...e,
    instructions: e.instructions ? JSON.parse(e.instructions) : null,
  }));
}

// Get a single exercise by ID
export async function getExercise(exerciseId: string): Promise<CalmingExercise | null> {
  const exercise = await db.query.calmingExercises.findFirst({
    where: eq(calmingExercises.id, exerciseId),
  });

  if (!exercise) return null;

  return {
    ...exercise,
    instructions: exercise.instructions ? JSON.parse(exercise.instructions) : null,
  };
}

// Record exercise completion
export async function recordCompletion(
  userId: string,
  data: CompletionInput
): Promise<ExerciseCompletion> {
  const [completion] = await db
    .insert(exerciseCompletions)
    .values({
      userId,
      exerciseId: data.exerciseId,
      sessionId: data.sessionId || null,
      moodBefore: data.moodBefore || null,
      moodAfter: data.moodAfter || null,
    })
    .returning();

  return completion;
}

// Get user's completion history
export async function getUserCompletions(
  userId: string,
  days: number = 30
): Promise<ExerciseCompletion[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const completions = await db.query.exerciseCompletions.findMany({
    where: and(
      eq(exerciseCompletions.userId, userId),
      gte(exerciseCompletions.completedAt, startDate)
    ),
    with: {
      exercise: true,
    },
    orderBy: [desc(exerciseCompletions.completedAt)],
  });

  return completions.map((c: typeof completions[number]) => ({
    ...c,
    exercise: c.exercise ? {
      ...c.exercise,
      instructions: c.exercise.instructions ? JSON.parse(c.exercise.instructions) : null,
    } : undefined,
  }));
}

// Get completion stats for user
export async function getCompletionStats(userId: string, days: number = 30): Promise<{
  totalCompletions: number;
  averageMoodImprovement: number;
  favoriteExercise: string | null;
  completionsByType: { type: string; count: number }[];
}> {
  const completions = await getUserCompletions(userId, days);

  if (completions.length === 0) {
    return {
      totalCompletions: 0,
      averageMoodImprovement: 0,
      favoriteExercise: null,
      completionsByType: [],
    };
  }

  // Calculate average mood improvement
  const withMoods = completions.filter((c) => c.moodBefore && c.moodAfter);
  const avgImprovement = withMoods.length > 0
    ? withMoods.reduce((sum, c) => sum + ((c.moodAfter || 0) - (c.moodBefore || 0)), 0) / withMoods.length
    : 0;

  // Find favorite exercise
  const exerciseCounts: Record<string, number> = {};
  completions.forEach((c) => {
    const name = c.exercise?.name || 'Unknown';
    exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;
  });
  const favoriteExercise = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Completions by type
  const typeCounts: Record<string, number> = {};
  completions.forEach((c) => {
    const type = c.exercise?.type || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  const completionsByType = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

  return {
    totalCompletions: completions.length,
    averageMoodImprovement: Math.round(avgImprovement * 10) / 10,
    favoriteExercise,
    completionsByType,
  };
}

// Get recommended exercise based on user's history
export async function getRecommendedExercise(userId: string): Promise<CalmingExercise | null> {
  const allExercises = await getExercises();
  if (allExercises.length === 0) return null;

  const completions = await getUserCompletions(userId, 30);

  // If no completions, recommend a short breathing exercise
  if (completions.length === 0) {
    return allExercises.find((e) => e.type === 'breathing' && e.durationSeconds <= 180) || allExercises[0];
  }

  // Find exercises with best mood improvement
  const exerciseImprovements: Record<string, { total: number; count: number }> = {};
  completions.forEach((c) => {
    if (c.moodBefore && c.moodAfter && c.exercise) {
      const improvement = c.moodAfter - c.moodBefore;
      if (!exerciseImprovements[c.exerciseId]) {
        exerciseImprovements[c.exerciseId] = { total: 0, count: 0 };
      }
      exerciseImprovements[c.exerciseId].total += improvement;
      exerciseImprovements[c.exerciseId].count += 1;
    }
  });

  // Sort by average improvement
  const sortedExercises = Object.entries(exerciseImprovements)
    .map(([id, data]) => ({ id, avgImprovement: data.total / data.count }))
    .sort((a, b) => b.avgImprovement - a.avgImprovement);

  if (sortedExercises.length > 0) {
    const recommended = allExercises.find((e) => e.id === sortedExercises[0].id);
    if (recommended) return recommended;
  }

  // Default to first exercise
  return allExercises[0];
}

// Seed default exercises
export async function seedExercises(): Promise<void> {
  const existingExercises = await db.query.calmingExercises.findMany();
  if (existingExercises.length > 0) return; // Already seeded

  const defaultExercises = [
    {
      name: 'Box Breathing',
      description: 'A calming technique used by Navy SEALs. Breathe in a square pattern to reduce stress.',
      type: 'breathing' as const,
      durationSeconds: 120,
      instructions: JSON.stringify([
        { step: 1, text: 'Breathe in slowly through your nose', durationSeconds: 4, action: 'inhale' },
        { step: 2, text: 'Hold your breath', durationSeconds: 4, action: 'hold' },
        { step: 3, text: 'Breathe out slowly through your mouth', durationSeconds: 4, action: 'exhale' },
        { step: 4, text: 'Hold your breath', durationSeconds: 4, action: 'hold' },
        { step: 5, text: 'Repeat the cycle', durationSeconds: 0, action: 'observe' },
      ]),
    },
    {
      name: '4-7-8 Relaxation Breath',
      description: 'A breathing pattern that promotes deep relaxation and can help reduce anxiety.',
      type: 'breathing' as const,
      durationSeconds: 180,
      instructions: JSON.stringify([
        { step: 1, text: 'Exhale completely through your mouth', durationSeconds: 2, action: 'exhale' },
        { step: 2, text: 'Breathe in quietly through your nose', durationSeconds: 4, action: 'inhale' },
        { step: 3, text: 'Hold your breath', durationSeconds: 7, action: 'hold' },
        { step: 4, text: 'Exhale completely through your mouth', durationSeconds: 8, action: 'exhale' },
        { step: 5, text: 'Repeat 3-4 times', durationSeconds: 0, action: 'observe' },
      ]),
    },
    {
      name: '5-4-3-2-1 Grounding',
      description: 'A grounding technique that uses your senses to bring you back to the present moment.',
      type: 'grounding' as const,
      durationSeconds: 300,
      instructions: JSON.stringify([
        { step: 1, text: 'Name 5 things you can SEE around you', durationSeconds: 60, action: 'observe' },
        { step: 2, text: 'Name 4 things you can TOUCH or feel', durationSeconds: 60, action: 'observe' },
        { step: 3, text: 'Name 3 things you can HEAR', durationSeconds: 60, action: 'observe' },
        { step: 4, text: 'Name 2 things you can SMELL', durationSeconds: 60, action: 'observe' },
        { step: 5, text: 'Name 1 thing you can TASTE', durationSeconds: 60, action: 'observe' },
      ]),
    },
    {
      name: 'Peaceful Place Visualization',
      description: 'Imagine yourself in a calm, peaceful place to reduce stress and anxiety.',
      type: 'visualization' as const,
      durationSeconds: 300,
      instructions: JSON.stringify([
        { step: 1, text: 'Close your eyes and take a few deep breaths', durationSeconds: 30, action: 'inhale' },
        { step: 2, text: 'Imagine a place where you feel completely safe and peaceful', durationSeconds: 60, action: 'observe' },
        { step: 3, text: 'Notice the colors, shapes, and light in this place', durationSeconds: 60, action: 'observe' },
        { step: 4, text: 'Feel the temperature, textures, and sensations', durationSeconds: 60, action: 'observe' },
        { step: 5, text: 'Listen to the sounds in this peaceful place', durationSeconds: 60, action: 'observe' },
        { step: 6, text: 'Take a moment to appreciate this feeling of peace', durationSeconds: 30, action: 'relax' },
      ]),
    },
    {
      name: 'Quick Body Scan',
      description: 'A brief body scan to release tension and increase body awareness.',
      type: 'body_scan' as const,
      durationSeconds: 180,
      instructions: JSON.stringify([
        { step: 1, text: 'Close your eyes and focus on your breath', durationSeconds: 20, action: 'inhale' },
        { step: 2, text: 'Notice any tension in your face and jaw. Relax them.', durationSeconds: 30, action: 'relax' },
        { step: 3, text: 'Move attention to your shoulders and neck. Let them drop.', durationSeconds: 30, action: 'relax' },
        { step: 4, text: 'Feel your arms and hands. Release any tension.', durationSeconds: 30, action: 'relax' },
        { step: 5, text: 'Notice your chest and stomach. Breathe deeply.', durationSeconds: 30, action: 'inhale' },
        { step: 6, text: 'Finally, feel your legs and feet grounded.', durationSeconds: 30, action: 'relax' },
        { step: 7, text: 'Take a final deep breath and open your eyes.', durationSeconds: 10, action: 'exhale' },
      ]),
    },
  ];

  for (const exercise of defaultExercises) {
    await db.insert(calmingExercises).values(exercise);
  }
}

// Exercise type labels for UI
export const EXERCISE_TYPE_LABELS = {
  breathing: 'Breathing',
  grounding: 'Grounding',
  visualization: 'Visualization',
  body_scan: 'Body Scan',
};

export const EXERCISE_TYPE_ICONS = {
  breathing: 'Wind',
  grounding: 'Footprints',
  visualization: 'Eye',
  body_scan: 'User',
};

export const EXERCISE_TYPE_COLORS = {
  breathing: 'bg-blue-100 text-blue-800',
  grounding: 'bg-green-100 text-green-800',
  visualization: 'bg-purple-100 text-purple-800',
  body_scan: 'bg-orange-100 text-orange-800',
};
