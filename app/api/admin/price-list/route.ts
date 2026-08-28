import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { aiConfigured, chat } from '@/lib/ai/azure';
import { apiErrorResponse } from '@/lib/db';
import { editStockRow, listInventory, type InventoryRow } from '@/lib/inventory';
import { DRINKS } from '@/lib/drinks/catalog';
import {
  parsePriceList,
  proposeUpdates,
  summarise,
  type MatchTarget,
} from '@/lib/pricing/parse-price-list';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/** Roughly 8MB of base64 — a phone photo of a price list is well under this. */
const MAX_IMAGE_CHARS = 8_000_000;
const ALLOWED_IMAGE = /^data:image\/(png|jpe?g|webp|heic|heif);base64,/i;

/** Everything we can reprice: live inventory, falling back to the static catalogue. */
async function matchTargets(): Promise<MatchTarget[]> {
  const inventory: InventoryRow[] = await listInventory().catch(() => []);
  const bySlug = new Map<string, InventoryRow>(inventory.map((i) => [i.slug, i] as const));

  const targets: MatchTarget[] = DRINKS.map((d) => {
    const inv = bySlug.get(d.slug);
    return {
      slug: d.slug,
      name: inv?.name || d.name,
      brand: inv?.brand || d.brand || null,
      currentPriceNgn: inv?.price_ngn ?? d.priceNgn,
    };
  });

  // Admin-added SKUs that are not in the static catalogue.
  const known = new Set(DRINKS.map((d) => d.slug));
  for (const inv of inventory) {
    if (known.has(inv.slug)) continue;
    targets.push({
      slug: inv.slug,
      name: inv.name,
      brand: inv.brand,
      currentPriceNgn: inv.price_ngn,
    });
  }
  return targets;
}

const OCR_SYSTEM = `You transcribe supplier price lists for a Nigerian drinks wholesaler.
Read every product row in the image and output ONE product per line, in the form:
Product name - price
Rules:
- Use the product name exactly as printed, including size or age if shown.
- Price in naira, digits only with comma grouping. No currency symbol.
- Skip headers, totals, page numbers and anything without a price.
- Output nothing except those lines. No commentary, no markdown.`;

/**
 * POST — read a price list and return proposed changes. Never writes.
 * Accepts `{ text }` (pasted) or `{ imageBase64 }` (a scanned/photographed list).
 */
export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`admin:price-list:${clientIp(req)}`, 12, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : '';
    let text = typeof body.text === 'string' ? body.text : '';
    let source: 'text' | 'scan' = 'text';

    if (imageBase64) {
      if (!aiConfigured()) {
        return NextResponse.json(
          {
            error:
              'Scanning needs AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY. Paste the list as text instead.',
          },
          { status: 503 }
        );
      }
      if (!ALLOWED_IMAGE.test(imageBase64)) {
        return NextResponse.json(
          { error: 'Upload a PNG, JPEG, WebP or HEIC image.' },
          { status: 400 }
        );
      }
      if (imageBase64.length > MAX_IMAGE_CHARS) {
        return NextResponse.json({ error: 'That image is too large — try a smaller photo.' }, { status: 413 });
      }

      text = await chat({
        model: 'analysis',
        temperature: 0,
        maxTokens: 2000,
        messages: [
          { role: 'system', content: OCR_SYSTEM },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Transcribe this price list.' },
              { type: 'image_url', image_url: { url: imageBase64, detail: 'high' } },
            ],
          },
        ],
      });
      source = 'scan';
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'Nothing to read — paste a list or upload an image.' }, { status: 400 });
    }

    const lines = parsePriceList(text);
    if (!lines.length) {
      return NextResponse.json(
        { error: 'No priced product rows found. Check the list has a price on each line.' },
        { status: 422 }
      );
    }

    const proposals = proposeUpdates(lines, await matchTargets());
    return NextResponse.json({
      source,
      proposals,
      summary: summarise(proposals),
      // Handy when a scan looks wrong and the admin wants to see what the model actually read.
      transcript: source === 'scan' ? text : undefined,
    });
  } catch (err) {
    captureApiError(err, { route: 'admin/price-list POST' });
    const { status, error } = apiErrorResponse(err, 'Unable to read that price list.');
    return NextResponse.json({ error }, { status });
  }
}

/** PATCH — apply the rows the admin confirmed. Only price is touched; stock is left alone. */
export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`admin:${clientIp(req)}`, 40, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const raw = Array.isArray(body.updates) ? body.updates : [];
    if (!raw.length) return NextResponse.json({ error: 'No rows to apply.' }, { status: 400 });
    if (raw.length > 500) return NextResponse.json({ error: 'Too many rows in one go.' }, { status: 400 });

    const updates: { slug: string; priceNgn: number }[] = [];
    for (const u of raw) {
      const slug = typeof u?.slug === 'string' ? u.slug.trim() : '';
      const priceNgn = Number(u?.priceNgn);
      if (!slug) return NextResponse.json({ error: 'Every row needs a SKU.' }, { status: 400 });
      if (!Number.isFinite(priceNgn) || priceNgn <= 0) {
        return NextResponse.json({ error: `Invalid price for ${slug}.` }, { status: 400 });
      }
      updates.push({ slug, priceNgn: Math.round(priceNgn) });
    }

    const applied: { slug: string; priceNgn: number }[] = [];
    const failed: { slug: string; error: string }[] = [];
    for (const u of updates) {
      try {
        const row = await editStockRow(u.slug, { priceNgn: u.priceNgn });
        if (row) applied.push({ slug: u.slug, priceNgn: u.priceNgn });
        else failed.push({ slug: u.slug, error: 'Unknown SKU.' });
      } catch (err) {
        failed.push({ slug: u.slug, error: err instanceof Error ? err.message : 'Failed.' });
      }
    }

    return NextResponse.json({ ok: failed.length === 0, applied, failed });
  } catch (err) {
    captureApiError(err, { route: 'admin/price-list PATCH' });
    const { status, error } = apiErrorResponse(err, 'Unable to apply price updates.');
    return NextResponse.json({ error }, { status });
  }
}
