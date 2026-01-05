import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createPartnership, getUserPartnerships } from '@/services/partnership';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerships = await getUserPartnerships(session.user.id);
    return NextResponse.json(partnerships);
  } catch (error) {
    console.error('Get partnerships error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnership = await createPartnership(session.user.id);
    return NextResponse.json(partnership, { status: 201 });
  } catch (error) {
    console.error('Create partnership error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
