import { NextResponse } from 'next/server';
import { seedSystemTemplates } from '@/lib/db/seed-templates';

// This endpoint can be called once to seed system templates
// In production, you might want to protect this or use a migration instead
export async function POST() {
  try {
    const result = await seedSystemTemplates();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Seed templates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
