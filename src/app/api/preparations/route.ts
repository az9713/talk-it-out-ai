import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createPreparation,
  getIncompletePreparations,
} from '@/services/preparations';

// GET /api/preparations - Get incomplete preparations
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preparations = await getIncompletePreparations(session.user.id);

    return NextResponse.json({ preparations });
  } catch (error) {
    console.error('Error fetching preparations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preparations' },
      { status: 500 }
    );
  }
}

// POST /api/preparations - Create a new preparation
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preparation = await createPreparation(session.user.id);

    return NextResponse.json(preparation, { status: 201 });
  } catch (error) {
    console.error('Error creating preparation:', error);
    return NextResponse.json(
      { error: 'Failed to create preparation' },
      { status: 500 }
    );
  }
}
