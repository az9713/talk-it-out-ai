import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import {
  createSessionRequest,
  getAllUserRequests,
  getPendingRequestCount,
} from '@/services/session-requests';

const createRequestSchema = z.object({
  toUserId: z.string(),
  partnershipId: z.string(),
  topic: z.string().optional(),
  urgency: z.enum(['whenever', 'soon', 'important']).optional(),
  message: z.string().optional(),
  suggestedTimes: z.array(z.string().transform((s) => new Date(s))).optional(),
});

// GET /api/session-requests - Get all requests for user
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('count') === 'true';

    if (countOnly) {
      const count = await getPendingRequestCount(session.user.id);
      return NextResponse.json({ count });
    }

    const requests = await getAllUserRequests(session.user.id);

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching session requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session requests' },
      { status: 500 }
    );
  }
}

// POST /api/session-requests - Create a new session request
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Prevent sending request to self
    if (validation.data.toUserId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot send request to yourself' },
        { status: 400 }
      );
    }

    const sessionRequest = await createSessionRequest(
      session.user.id,
      validation.data
    );

    return NextResponse.json(sessionRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating session request:', error);
    const message = error instanceof Error ? error.message : 'Failed to create session request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
