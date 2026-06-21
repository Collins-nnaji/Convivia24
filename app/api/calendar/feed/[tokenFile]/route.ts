import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/calendar/repo';
import { buildICS } from '@/lib/calendar/ics';

/**
 * GET /api/calendar/feed/[token].ics — public, no auth. Calendar apps (Google,
 * Apple, Outlook) poll this URL directly, so it's secured by the token alone.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ tokenFile: string }> }) {
  const { tokenFile } = await params;
  const token = tokenFile.replace(/\.ics$/i, '');

  try {
    const items = await repo.listForFeedToken(token);
    if (!items) return NextResponse.json({ error: 'Feed not found.' }, { status: 404 });

    return new NextResponse(buildICS(items), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="my24.ics"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[GET /api/calendar/feed/[tokenFile]]', err);
    return NextResponse.json({ error: 'Could not build your calendar feed.' }, { status: 500 });
  }
}
