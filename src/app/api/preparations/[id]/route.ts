import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import {
  getPreparation,
  updatePreparation,
  completePreparation,
  deletePreparation,
  generateSuggestedOpening,
} from '@/services/preparations';

const updateSchema = z.object({
  situation: z.string().optional(),
  initialFeelings: z.array(z.string()).optional(),
  desiredOutcome: z.string().optional(),
  identifiedNeeds: z.array(z.string()).optional(),
  draftOpening: z.string().optional(),
  concerns: z.string().optional(),
  shareWithMediator: z.boolean().optional(),
});

// GET /api/preparations/[id] - Get a preparation
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
    const preparation = await getPreparation(id, session.user.id);

    if (!preparation) {
      return NextResponse.json({ error: 'Preparation not found' }, { status: 404 });
    }

    return NextResponse.json(preparation);
  } catch (error) {
    console.error('Error fetching preparation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preparation' },
      { status: 500 }
    );
  }
}

// PUT /api/preparations/[id] - Update a preparation
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
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const updated = await updatePreparation(id, session.user.id, validation.data);

    if (!updated) {
      return NextResponse.json({ error: 'Preparation not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating preparation:', error);
    return NextResponse.json(
      { error: 'Failed to update preparation' },
      { status: 500 }
    );
  }
}

// PATCH /api/preparations/[id] - Complete preparation or generate suggestion
export async function PATCH(
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
    const action = body.action as string;

    if (action === 'complete') {
      const completed = await completePreparation(id, session.user.id);
      if (!completed) {
        return NextResponse.json({ error: 'Preparation not found' }, { status: 404 });
      }
      return NextResponse.json(completed);
    }

    if (action === 'suggest') {
      const suggestedOpening = await generateSuggestedOpening(id, session.user.id);
      if (suggestedOpening === null) {
        return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 });
      }
      return NextResponse.json({ suggestedOpening });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error patching preparation:', error);
    return NextResponse.json(
      { error: 'Failed to update preparation' },
      { status: 500 }
    );
  }
}

// DELETE /api/preparations/[id] - Delete a preparation
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
    await deletePreparation(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting preparation:', error);
    return NextResponse.json(
      { error: 'Failed to delete preparation' },
      { status: 500 }
    );
  }
}
