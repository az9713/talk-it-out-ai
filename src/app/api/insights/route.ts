import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSessionHistory } from '@/services/insights';

// GET /api/insights - Get session history with insights
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const history = await getSessionHistory(session.user.id);
    return NextResponse.json(history);
  } catch (error) {
    console.error('Get session history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
