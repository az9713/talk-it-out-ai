import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import {
  getSessionRequest,
  respondToRequest,
  cancelRequest,
} from '@/services/session-requests';

const responseSchema = z.object({
  status: z.enum(['accepted', 'declined', 'rescheduled']),
  responseMessage: z.string().optional(),
  scheduledFor: z.string().transform((s) => new Date(s)).optional(),
});

// GET /api/session-requests/[id] - Get a session request
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
    const sessionRequest = await getSessionRequest(id, session.user.id);

    if (!sessionRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(sessionRequest);
  } catch (error) {
    console.error('Error fetching session request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session request' },
      { status: 500 }
    );
  }
}

// PUT /api/session-requests/[id] - Respond to a session request
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
    const validation = responseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const updated = await respondToRequest(id, session.user.id, validation.data);

    if (!updated) {
      return NextResponse.json(
        { error: 'Request not found or not pending' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error responding to session request:', error);
    return NextResponse.json(
      { error: 'Failed to respond to session request' },
      { status: 500 }
    );
  }
}

// DELETE /api/session-requests/[id] - Cancel a session request
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await cancelRequest(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling session request:', error);
    return NextResponse.json(
      { error: 'Failed to cancel session request' },
      { status: 500 }
    );
  }
}
