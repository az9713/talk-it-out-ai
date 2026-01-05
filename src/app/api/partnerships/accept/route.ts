import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { acceptInvite } from '@/services/partnership';
import { z } from 'zod';

const acceptSchema = z.object({
  inviteCode: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = acceptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 400 }
      );
    }

    const partnership = await acceptInvite(parsed.data.inviteCode, session.user.id);
    return NextResponse.json(partnership);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
