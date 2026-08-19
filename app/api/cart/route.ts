import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { rateLimit, clientIp } from '@/lib/redis';

type CartLinePayload = { slug: string; qty: number };

/** Server-side cart for signed-in users — lets a cart survive a device switch. Guests stay localStorage-only. */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ items: null });
    const [row] = await sql`SELECT items FROM carts WHERE user_id = ${user.id} LIMIT 1`;
    return NextResponse.json({ items: row ? row.items : [] });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to load cart.');
    return NextResponse.json({ error, items: null }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

    const rl = await rateLimit(`cart:${clientIp(req)}`, 60, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const items = Array.isArray(body.items) ? (body.items as CartLinePayload[]) : [];
    const clean = items
      .filter((l) => l && typeof l.slug === 'string' && l.slug.length <= 128)
      .slice(0, 100)
      .map((l) => ({ slug: l.slug, qty: Math.max(1, Math.min(24, Number(l.qty) || 1)) }));

    await sql`
      INSERT INTO carts (user_id, items, updated_at)
      VALUES (${user.id}, ${JSON.stringify(clean)}::jsonb, NOW())
      ON CONFLICT (user_id) DO UPDATE SET items = EXCLUDED.items, updated_at = NOW()
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to save cart.');
    return NextResponse.json({ error }, { status });
  }
}
