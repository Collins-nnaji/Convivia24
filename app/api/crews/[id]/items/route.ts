import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { getDrinkBySlug } from '@/lib/drinks/catalog';
import { isMember, addCrewItem, removeCrewItem, crewCartItems } from '@/lib/crews/repo';
import { rateLimit, clientIp } from '@/lib/redis';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  try {
    const rl = await rateLimit(`crews:items:${clientIp(req)}`, 40, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });

    if (!(await isMember(id, user.id))) {
      return NextResponse.json({ error: 'Join this crew first.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const slug = typeof body.slug === 'string' ? body.slug : '';
    const qty = Math.max(1, Math.min(24, Number(body.qty) || 1));
    const product = getDrinkBySlug(slug);
    if (!product) return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });

    await addCrewItem(id, { slug: product.slug, name: product.name, unitPriceNgn: product.priceNgn, qty }, user.name || user.email);
    const items = await crewCartItems(id);
    return NextResponse.json({ items });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not add that item.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  try {
    if (!(await isMember(id, user.id))) {
      return NextResponse.json({ error: 'Join this crew first.' }, { status: 403 });
    }
    const slug = new URL(req.url).searchParams.get('slug') || '';
    if (!slug) return NextResponse.json({ error: 'slug is required.' }, { status: 400 });
    await removeCrewItem(id, slug);
    const items = await crewCartItems(id);
    return NextResponse.json({ items });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not remove that item.');
    return NextResponse.json({ error }, { status });
  }
}
