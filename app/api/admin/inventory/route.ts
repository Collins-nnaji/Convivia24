import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, setAdminSession } from '@/lib/admin';
import { listInventory, upsertAdminProduct, adminStockList, editStockRow, StockEditError } from '@/lib/inventory';
import { uploadBlob, validateImageFile, blobConfigured } from '@/lib/azure/blob';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp, redis } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import { chat, aiConfigured } from '@/lib/ai/azure';

export async function GET() {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const items = await adminStockList();
    return NextResponse.json({
      items,
      blobConfigured: blobConfigured(),
      aiConfigured: aiConfigured(),
    });
  } catch (err) {
    captureApiError(err, { route: 'admin/inventory GET' });
    const { status, error } = apiErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`admin:${clientIp(req)}`, 40, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const contentType = req.headers.get('content-type') || '';

    // Password login
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      if (body.action === 'login') {
        const ok = await setAdminSession(String(body.password || ''));
        if (!ok) return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        return NextResponse.json({ ok: true });
      }
      if (body.action === 'adjust') {
        const gate = await requireAdmin();
        if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
        const slug = String(body.slug || '');
        if (!slug) return NextResponse.json({ error: 'Slug is required.' }, { status: 400 });
        const patch: Parameters<typeof editStockRow>[1] = {};
        if (body.onHand != null && body.onHand !== '') patch.onHand = Number(body.onHand);
        if (body.priceNgn != null && body.priceNgn !== '') patch.priceNgn = Number(body.priceNgn);
        if (body.lowStockThreshold != null && body.lowStockThreshold !== '') {
          patch.lowStockThreshold = Number(body.lowStockThreshold);
        }
        if (typeof body.active === 'boolean') patch.active = body.active;
        if (Object.values(patch).some((v) => typeof v === 'number' && !Number.isFinite(v))) {
          return NextResponse.json({ error: 'Numbers must be valid.' }, { status: 400 });
        }
        if (Object.keys(patch).length === 0) {
          return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
        }
        try {
          const row = await editStockRow(slug, patch);
          if (!row) return NextResponse.json({ error: 'Unknown SKU.' }, { status: 404 });
          await redis()?.del('shop:catalog:v1');
          return NextResponse.json({ item: row });
        } catch (err) {
          if (err instanceof StockEditError) {
            return NextResponse.json({ error: err.message }, { status: 400 });
          }
          throw err;
        }
      }
      if (body.action === 'ai-list') {
        const gate = await requireAdmin();
        if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
        if (!aiConfigured()) return NextResponse.json({ error: 'Azure OpenAI not configured' }, { status: 503 });
        const items = await listInventory(true);
        const summary = items
          .slice(0, 40)
          .map((i) => `${i.name}: ${i.available} available @ ₦${i.price_ngn || '?'}`)
          .join('\n');
        const advice = await chat({
          messages: [
            {
              role: 'system',
              content:
                'You are Convivia24 inventory ops for a Lagos drinks shop. Give concise restock and listing advice.',
            },
            {
              role: 'user',
              content: `Current stock:\n${summary || '(empty)'}\n\nSuggest what to restock or feature this week in Lagos nightlife.`,
            },
          ],
          temperature: 0.5,
          maxTokens: 500,
        });
        return NextResponse.json({ advice });
      }
    }

    // Multipart product upload
    const gate = await requireAdmin();
    if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const form = await req.formData();
    const name = String(form.get('name') || '').trim();
    const priceNgn = Number(form.get('priceNgn') || 0);
    const onHand = Number(form.get('onHand') || 0);
    const category = String(form.get('category') || 'spirits');
    const brand = String(form.get('brand') || '');
    const volume = String(form.get('volume') || '');
    const abv = Number(form.get('abv') || 0);
    const tagline = String(form.get('tagline') || '');
    const description = String(form.get('description') || '');
    const slugInput = String(form.get('slug') || name);
    const file = form.get('image');

    if (!name || priceNgn <= 0) {
      return NextResponse.json({ error: 'Name and price are required.' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    if (file && typeof file !== 'string' && 'arrayBuffer' in file) {
      const f = file as File;
      const invalid = validateImageFile({ type: f.type, size: f.size });
      if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
      if (!blobConfigured()) {
        return NextResponse.json({ error: 'Azure Storage is not configured.' }, { status: 503 });
      }
      const buffer = Buffer.from(await f.arrayBuffer());
      const uploaded = await uploadBlob(buffer, f.type, {
        filename: f.name,
        purpose: 'stock-image',
      });
      imageUrl = uploaded.url;
    }

    const item = await upsertAdminProduct({
      slug: slugInput,
      name,
      onHand,
      priceNgn,
      category,
      brand: brand || undefined,
      volume: volume || undefined,
      abv: abv || undefined,
      tagline: tagline || undefined,
      description: description || undefined,
      imageUrl,
    });

    await redis()?.del('shop:catalog:v1');
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    captureApiError(err, { route: 'admin/inventory POST' });
    const { status, error } = apiErrorResponse(err, 'Could not save stock.');
    return NextResponse.json({ error }, { status });
  }
}
