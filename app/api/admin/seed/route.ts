import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { seedEvents } from '@/lib/seed';
import { isAdminRequest } from '@/lib/auth/session';

/** Admin-only: populate the database with global sample events (idempotent). */
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await seedEvents(sql);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[POST /api/admin/seed]', err);
    return NextResponse.json({ error: 'Seeding failed.' }, { status: 500 });
  }
}
