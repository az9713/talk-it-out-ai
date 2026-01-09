import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { cancelReminder, deleteReminder } from '@/services/reminders';

// DELETE /api/reminders/[id] - Cancel or delete a reminder
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: reminderId } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    let success: boolean;
    if (permanent) {
      success = await deleteReminder(reminderId, session.user.id);
    } else {
      success = await cancelReminder(reminderId, session.user.id);
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Reminder not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete reminder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
