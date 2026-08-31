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
        // A tighter, dedicated lockout on top of the general admin bucket above —
        // a shared password is worth throttling harder than routine desk traffic.
        const loginRl = await rateLimit(`admin-login:${clientIp(req)}`, 8, 900);
        if (!loginRl.ok) {
          return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
        }
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
        if (body.costNgn != null && body.costNgn !== '') patch.costNgn = Number(body.costNgn);
        if (body.costNgn === '') patch.costNgn = null;
        if (body.lowStockThreshold != null && body.lowStockThreshold !== '') {
          patch.lowStockThreshold = Number(body.lowStockThreshold);
        }
        if (typeof body.active === 'boolean') patch.active = body.active;
        if (body.tasteNote !== undefined) patch.tasteNote = body.tasteNote == null ? null : String(body.tasteNote);
        if (body.tagline !== undefined) patch.tagline = body.tagline == null ? null : String(body.tagline);
        if (body.description !== undefined) {
          patch.description = body.description == null ? null : String(body.description);
        }
        if (body.brand !== undefined) patch.brand = body.brand == null ? null : String(body.brand);
        if (body.brandOrigin !== undefined) patch.brandOrigin = String(body.brandOrigin || '');
        if (body.brandFounded !== undefined) patch.brandFounded = String(body.brandFounded || '');
        if (body.brandHistory !== undefined) patch.brandHistory = String(body.brandHistory || '');
        if (body.brandStyle !== undefined) patch.brandStyle = String(body.brandStyle || '');
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
      if (body.action === 'delete') {
        const gate = await requireAdmin();
        if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
        const slug = String(body.slug || '');
        if (!slug) return NextResponse.json({ error: 'Slug is required.' }, { status: 400 });
        const { default: dbSql } = await import('@/lib/db');
        await dbSql`DELETE FROM inventory WHERE slug = ${slug}`;
        await redis()?.del('shop:catalog:v1');
        return NextResponse.json({ ok: true });
      }
      if (body.action === 'ai-product-copy') {
        const gate = await requireAdmin();
        if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
        if (!aiConfigured()) return NextResponse.json({ error: 'Azure OpenAI not configured' }, { status: 503 });
        const name = String(body.name || '').trim();
        if (!name) return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
        const brand = String(body.brand || '').trim();
        const category = String(body.category || 'spirits');
        const abv = body.abv != null ? Number(body.abv) : undefined;
        const volume = String(body.volume || '').trim();
        const raw = await chat({
          messages: [
            {
              role: 'system',
              content:
                'You write Convivia24 shop copy for drinks in Nigeria — concise, nightlife-aware, never encouraging excess or underage drinking. Reply with JSON only.',
            },
            {
              role: 'user',
              content: `Product: ${name}
Brand: ${brand || 'unknown'}
Category: ${category}
${abv ? `ABV: ${abv}%` : ''}
${volume ? `Volume: ${volume}` : ''}

Return JSON:
{
  "tagline": "short hook under 12 words",
  "description": "1-2 sentences for the product page",
  "tasteNote": "1 sentence tasting note — what it tastes like",
  "brandOrigin": "city/region, country",
  "brandFounded": "year or decade",
  "brandHistory": "2-3 sentences brand story",
  "brandStyle": "one sentence on house style"
}`,
            },
          ],
          temperature: 0.6,
          maxTokens: 700,
        });
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return NextResponse.json({ error: 'AI returned invalid JSON.' }, { status: 502 });
        const copy = JSON.parse(jsonMatch[0]) as {
          tagline?: string;
          description?: string;
          tasteNote?: string;
          brandOrigin?: string;
          brandFounded?: string;
          brandHistory?: string;
          brandStyle?: string;
        };
        return NextResponse.json({ copy });
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
    const tasteNote = String(form.get('tasteNote') || '');
    const brandOrigin = String(form.get('brandOrigin') || '');
    const brandFounded = String(form.get('brandFounded') || '');
    const brandHistory = String(form.get('brandHistory') || '');
    const brandStyle = String(form.get('brandStyle') || '');
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
      tasteNote: tasteNote || undefined,
      brandOrigin: brandOrigin || undefined,
      brandFounded: brandFounded || undefined,
      brandHistory: brandHistory || undefined,
      brandStyle: brandStyle || undefined,
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
