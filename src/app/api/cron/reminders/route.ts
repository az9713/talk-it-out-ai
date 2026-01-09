import { NextResponse } from 'next/server';
import { processScheduledReminders } from '@/services/reminders';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is configured, allow in development
  if (!cronSecret) {
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    console.warn('[Cron] CRON_SECRET not configured');
    return false;
  }

  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Check query parameter (for Vercel Cron)
  const url = new URL(request.url);
  if (url.searchParams.get('secret') === cronSecret) {
    return true;
  }

  return false;
}

// GET /api/cron/reminders - Process scheduled reminders
// This endpoint should be called by a cron job (e.g., Vercel Cron)
export async function GET(request: Request) {
  try {
    // Verify authorization
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Processing scheduled reminders...');
    const result = await processScheduledReminders();

    console.log(
      `[Cron] Processed ${result.processed} reminders: ${result.sent} sent, ${result.failed} failed`
    );

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error processing reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST also supported for flexibility
export async function POST(request: Request) {
  return GET(request);
}
