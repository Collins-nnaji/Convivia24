import { NextRequest, NextResponse } from 'next/server';
import { EVENTS_CACHE_KEY, listUpcomingEvents } from '@/lib/events/store';
import { cacheGet, cacheSet, rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(`events-feed:${clientIp(req)}`, 60, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const cached = await cacheGet<{ events: unknown[] }>(EVENTS_CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const events = await listUpcomingEvents();
    const payload = { events };
    await cacheSet(EVENTS_CACHE_KEY, payload, 30);
    return NextResponse.json(payload);
  } catch (err) {
    captureApiError(err, { route: 'events GET' });
    // Seeded events still render client-side, so degrade to an empty remote list.
    return NextResponse.json({ events: [], degraded: true });
  }
}
