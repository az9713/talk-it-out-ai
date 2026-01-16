import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import {
  recordEmotionCheckIn,
  getUserEmotionHistory,
  getEmotionStats,
} from '@/services/emotions';

const checkInSchema = z.object({
  sessionId: z.string().optional(),
  type: z.enum(['pre_session', 'post_session', 'daily']),
  overallMood: z.number().min(1).max(5),
  primaryEmotion: z.string().optional(),
  feelings: z.array(z.string()).optional(),
  energyLevel: z.number().min(1).max(5).optional(),
  opennessToTalk: z.number().min(1).max(5).optional(),
  note: z.string().optional(),
});

// GET /api/emotions - Get emotion history and stats
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const includeStats = searchParams.get('stats') === 'true';

    const history = await getUserEmotionHistory(session.user.id, days);

    if (includeStats) {
      const stats = await getEmotionStats(session.user.id, days);
      return NextResponse.json({ history, stats });
    }

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching emotions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emotions' },
      { status: 500 }
    );
  }
}

// POST /api/emotions - Record a new emotion check-in
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = checkInSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const checkIn = await recordEmotionCheckIn(session.user.id, validation.data);

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    console.error('Error recording emotion:', error);
    return NextResponse.json(
      { error: 'Failed to record emotion' },
      { status: 500 }
    );
  }
}
