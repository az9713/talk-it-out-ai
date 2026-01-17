import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPattern, acknowledgePattern, resolvePattern } from '@/services/patterns';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const pattern = await getPattern(id, session.user.id);

    if (!pattern) {
      return NextResponse.json({ error: 'Pattern not found' }, { status: 404 });
    }

    return NextResponse.json(pattern);
  } catch (error) {
    console.error('Error fetching pattern:', error);
    return NextResponse.json({ error: 'Failed to fetch pattern' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === 'acknowledge') {
      await acknowledgePattern(id, session.user.id);
      return NextResponse.json({ success: true, message: 'Pattern acknowledged' });
    }

    if (action === 'resolve') {
      await resolvePattern(id, session.user.id);
      return NextResponse.json({ success: true, message: 'Pattern resolved' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating pattern:', error);
    return NextResponse.json({ error: 'Failed to update pattern' }, { status: 500 });
  }
}
