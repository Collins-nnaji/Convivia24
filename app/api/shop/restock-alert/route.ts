import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { addRestockAlert } from '@/lib/shop/restock-alerts';
import { DRINKS } from '@/lib/drinks/catalog';

/** POST { slug, email } — email me when this bottle is back. */
export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`restock:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    const body = await req.json().catch(() => ({}));
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ error: 'Unknown bottle.' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    if (!DRINKS.some((d) => d.slug === slug)) {
      // Admin-added bottles are not in the static list; the alert table tolerates any slug that
      // later appears in inventory, so only reject obviously malformed input above.
    }
    await addRestockAlert(slug, email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not save that.');
    return NextResponse.json({ error }, { status });
  }
}
