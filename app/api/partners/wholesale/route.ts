import { NextRequest, NextResponse } from 'next/server';
import {
  requireSignedInOutlet,
  getPartnerInventory,
  setPartnerOnHand,
  listWholesaleOrders,
  placeWholesaleOrder,
} from '@/lib/partners/outlets';
import { listGiftCardsIssuedBy } from '@/lib/commerce/gift-cards';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/** Inventory + order history + points for the signed-in outlet. Requires a real sign-in — no guest desks. */
export async function GET() {
  try {
    const outlet = await requireSignedInOutlet();
    if ('error' in outlet) return NextResponse.json({ error: outlet.error }, { status: 401 });

    const [inventory, orders, giftCards] = await Promise.all([
      getPartnerInventory(outlet.id),
      listWholesaleOrders(outlet.id),
      listGiftCardsIssuedBy(outlet.venueName),
    ]);
    return NextResponse.json({ outlet, inventory, orders, giftCards });
  } catch (err) {
    captureApiError(err, { route: 'partners/wholesale GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load the wholesale desk.');
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`partner-wholesale:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const outlet = await requireSignedInOutlet();
    if ('error' in outlet) return NextResponse.json({ error: outlet.error }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    if (body.action === 'set-on-hand') {
      const slug = String(body.slug || '');
      const onHand = Number(body.onHand);
      if (!slug || !Number.isFinite(onHand)) {
        return NextResponse.json({ error: 'slug and onHand are required.' }, { status: 400 });
      }
      await setPartnerOnHand(outlet.id, slug, onHand);
      const inventory = await getPartnerInventory(outlet.id);
      return NextResponse.json({ inventory });
    }

    const items = Array.isArray(body.items) ? body.items : [];
    const result = await placeWholesaleOrder(outlet.id, items);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });

    const inventory = await getPartnerInventory(outlet.id);
    return NextResponse.json({ order: result, inventory }, { status: 201 });
  } catch (err) {
    captureApiError(err, { route: 'partners/wholesale POST' });
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'The wholesale desk is offline right now.' }, { status: 503 });
    }
    const { status, error } = apiErrorResponse(err, 'Could not place that order.');
    return NextResponse.json({ error }, { status });
  }
}
