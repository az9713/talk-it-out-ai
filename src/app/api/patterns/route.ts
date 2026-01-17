import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPatterns, getActivePatterns, runPatternAnalysis } from '@/services/patterns';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const patterns = activeOnly
      ? await getActivePatterns(session.user.id)
      : await getUserPatterns(session.user.id);

    return NextResponse.json(patterns);
  } catch (error) {
    console.error('Error fetching patterns:', error);
    return NextResponse.json({ error: 'Failed to fetch patterns' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run pattern analysis
    const patterns = await runPatternAnalysis(session.user.id);

    return NextResponse.json({
      message: 'Pattern analysis complete',
      patternsFound: patterns.length,
      patterns,
    });
  } catch (error) {
    console.error('Error running pattern analysis:', error);
    return NextResponse.json({ error: 'Failed to run pattern analysis' }, { status: 500 });
  }
}
