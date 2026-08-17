import { NextRequest, NextResponse } from 'next/server';
import {
  deletePricingItem,
  getOutlet,
  listPricingItems,
  resolveOutletOwner,
  setTargetMargin,
  upsertPricingItem,
} from '@/lib/partners/outlets';
import { analysePortfolio, itemFromCatalogSlug, type PricingItem } from '@/lib/partners/pricing';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

async function requireOutlet() {
  const ownerId = await resolveOutletOwner();
  const outlet = await getOutlet(ownerId);
  return outlet;
}

/** Current menu lines plus the analysis, so the client never re-derives math. */
export async function GET() {
  try {
    const outlet = await requireOutlet();
    if (!outlet) return NextResponse.json({ error: 'Open a partner desk first.' }, { status: 404 });
    const items = await listPricingItems(outlet.id);
    return NextResponse.json({
      outlet,
      analysis: analysePortfolio(items, outlet.targetMarginPct),
    });
  } catch (err) {
    captureApiError(err, { route: 'partners/pricing GET' });
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'The pricing desk is offline right now.' }, { status: 503 });
    }
    const { status, error } = apiErrorResponse(err, 'Could not load pricing.');
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`partner-pricing:${clientIp(req)}`, 60, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const outlet = await requireOutlet();
    if (!outlet) return NextResponse.json({ error: 'Open a partner desk first.' }, { status: 404 });

    const body = await req.json().catch(() => ({}));

    if (body.action === 'target-margin') {
      const pct = Number(body.targetMarginPct);
      if (!Number.isFinite(pct)) return NextResponse.json({ error: 'Target margin must be a number.' }, { status: 400 });
      await setTargetMargin(outlet.id, pct);
      const items = await listPricingItems(outlet.id);
      return NextResponse.json({ analysis: analysePortfolio(items, Math.min(95, Math.max(1, Math.round(pct)))) });
    }

    // Seed a line straight from our catalog.
    let input: Omit<PricingItem, 'id'> & { id?: string };
    if (body.action === 'add-from-catalog') {
      const seed = itemFromCatalogSlug(String(body.slug || ''));
      if (!seed) return NextResponse.json({ error: 'Unknown bottle.' }, { status: 400 });
      input = seed;
    } else {
      const name = String(body.name || '').trim().slice(0, 120);
      if (!name) return NextResponse.json({ error: 'Give the line a name.' }, { status: 400 });
      const numbers = {
        bottleCostNgn: Number(body.bottleCostNgn ?? 0),
        sellPriceNgn: Number(body.sellPriceNgn ?? 0),
        servingsPerBottle: Number(body.servingsPerBottle ?? 12),
        bottlesPerMonth: Number(body.bottlesPerMonth ?? 0),
      };
      if (Object.values(numbers).some((n) => !Number.isFinite(n))) {
        return NextResponse.json({ error: 'Costs, prices and volumes must be numbers.' }, { status: 400 });
      }
      input = {
        id: body.id ? String(body.id) : undefined,
        slug: body.slug ? String(body.slug) : null,
        name,
        category: body.category ? String(body.category) : null,
        ...numbers,
      };
    }

    await upsertPricingItem(outlet.id, input);
    const items = await listPricingItems(outlet.id);
    return NextResponse.json({ analysis: analysePortfolio(items, outlet.targetMarginPct) });
  } catch (err) {
    captureApiError(err, { route: 'partners/pricing POST' });
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'The pricing desk is offline right now.' }, { status: 503 });
    }
    const { status, error } = apiErrorResponse(err, 'Could not save the line.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const outlet = await requireOutlet();
    if (!outlet) return NextResponse.json({ error: 'Open a partner desk first.' }, { status: 404 });
    const id = new URL(req.url).searchParams.get('id') || '';
    if (!id) return NextResponse.json({ error: 'Line id is required.' }, { status: 400 });
    const removed = await deletePricingItem(outlet.id, id);
    if (!removed) return NextResponse.json({ error: 'Line not found.' }, { status: 404 });
    const items = await listPricingItems(outlet.id);
    return NextResponse.json({ analysis: analysePortfolio(items, outlet.targetMarginPct) });
  } catch (err) {
    captureApiError(err, { route: 'partners/pricing DELETE' });
    const { status, error } = apiErrorResponse(err, 'Could not remove the line.');
    return NextResponse.json({ error }, { status });
  }
}
