import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSessionInsights } from '@/services/insights';

// GET /api/insights/sessions/[id] - Get insights for a specific session
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sessionId } = await params;
    const insights = await getSessionInsights(sessionId, session.user.id);

    if (!insights) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Get session insights error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
