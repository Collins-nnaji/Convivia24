import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug, getGiftsForEvent, pledgeGift } from '@/lib/convivia24';

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const gift_id = typeof body.gift_id === 'string' ? body.gift_id : null;
  const amount = typeof body.amount === 'number' && body.amount > 0 ? body.amount : 1;

  if (!gift_id) return NextResponse.json({ error: 'gift_id required' }, { status: 400 });

  // Verify the gift belongs to this event
  const gifts = await getGiftsForEvent(event.id);
  const gift = gifts.find(g => g.id === gift_id);
  if (!gift) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (gift.claimed) return NextResponse.json({ error: 'Already claimed' }, { status: 409 });

  const updated = await pledgeGift(gift_id, amount);
  return NextResponse.json({ gift: updated });
}
