import { NextResponse } from 'next/server';
import { getCurrentUser, authConfigured } from '@/lib/auth/session';

// Static route — takes precedence over the [...path] catch-all.
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user, authConfigured });
}
