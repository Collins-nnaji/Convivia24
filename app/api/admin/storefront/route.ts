import { NextRequest, NextResponse } from 'next/server';
import { withAudit } from '@/lib/audit/route';
import { requireAdmin } from '@/lib/admin';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import { blobConfigured, uploadBlob, validateImageFile } from '@/lib/azure/blob';
import { isBlockKind, isBlockTheme, safeHref } from '@/lib/storefront/blocks';
import {
  createBlock,
  deleteBlock,
  invalidateStorefront,
  listBlocks,
  moveBlock,
  setBlockPublished,
  updateBlock,
  type BlockInput,
} from '@/lib/storefront/repo';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(v: unknown, max: number): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  return s ? s.slice(0, max) : null;
}

function isoOrNull(v: unknown): string | null | 'invalid' {
  if (v == null || v === '') return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? 'invalid' : d.toISOString();
}

/** Validate a block body; returns the input or a message for the desk. */
function parseBlock(body: Record<string, unknown>): BlockInput | string {
  if (!isBlockKind(body.kind)) return 'Choose a slot.';
  const title = text(body.title, 140);
  if (!title) return 'Title is required.';
  const theme = isBlockTheme(body.theme) ? body.theme : 'ember';
  const rawHref = text(body.href, 500);
  const href = safeHref(rawHref);
  if (rawHref && !href) return 'Links must start with / (a page on this site) or https://.';
  const rawImage = text(body.imageUrl, 1000);
  const imageUrl = rawImage ? safeHref(rawImage) : null;
  if (rawImage && !imageUrl) return 'Image must be an uploaded file or an https:// link.';
  const startsAt = isoOrNull(body.startsAt);
  const endsAt = isoOrNull(body.endsAt);
  if (startsAt === 'invalid' || endsAt === 'invalid') return 'Schedule dates are not valid.';
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) return 'The end must be after the start.';
  return {
    kind: body.kind,
    title,
    subtitle: text(body.subtitle, 300),
    ctaLabel: text(body.ctaLabel, 40),
    href,
    imageUrl,
    theme,
    published: body.published !== false,
    startsAt,
    endsAt,
  };
}

async function handleGET() {
  const gate = await requireAdmin('content');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    return NextResponse.json({ blocks: await listBlocks(), blobConfigured: blobConfigured() });
  } catch (err) {
    captureApiError(err, { route: 'admin/storefront GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load storefront content. Has the storefront migration run?');
    return NextResponse.json({ error }, { status });
  }
}

async function handlePOST(req: NextRequest) {
  const gate = await requireAdmin('content');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const rl = await rateLimit(`admin-storefront:${clientIp(req)}`, 60, 60);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  try {
    // Image upload for a banner or tile — returns the URL; the block is saved separately.
    if ((req.headers.get('content-type') || '').includes('multipart/form-data')) {
      if (!blobConfigured()) return NextResponse.json({ error: 'Image storage is not configured.' }, { status: 503 });
      const form = await req.formData();
      const file = form.get('image');
      if (!(file instanceof File)) return NextResponse.json({ error: 'Attach an image.' }, { status: 400 });
      const invalid = validateImageFile(file);
      if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
      const uploaded = await uploadBlob(Buffer.from(await file.arrayBuffer()), file.type, {
        filename: file.name,
        purpose: 'admin-media',
      });
      return NextResponse.json({ url: uploaded.url }, { status: 201 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const id = typeof body.id === 'string' && UUID.test(body.id) ? body.id : null;

    switch (body.action) {
      case 'create': {
        const input = parseBlock(body);
        if (typeof input === 'string') return NextResponse.json({ error: input }, { status: 400 });
        const block = await createBlock(input);
        await invalidateStorefront();
        return NextResponse.json({ block }, { status: 201 });
      }
      case 'update': {
        if (!id) return NextResponse.json({ error: 'Unknown block.' }, { status: 400 });
        const input = parseBlock(body);
        if (typeof input === 'string') return NextResponse.json({ error: input }, { status: 400 });
        const block = await updateBlock(id, input);
        if (!block) return NextResponse.json({ error: 'Block not found.' }, { status: 404 });
        await invalidateStorefront();
        return NextResponse.json({ block });
      }
      case 'publish': {
        if (!id) return NextResponse.json({ error: 'Unknown block.' }, { status: 400 });
        const block = await setBlockPublished(id, body.published === true);
        if (!block) return NextResponse.json({ error: 'Block not found.' }, { status: 404 });
        await invalidateStorefront();
        return NextResponse.json({ block });
      }
      case 'move': {
        if (!id) return NextResponse.json({ error: 'Unknown block.' }, { status: 400 });
        await moveBlock(id, body.direction === -1 ? -1 : 1);
        await invalidateStorefront();
        return NextResponse.json({ ok: true });
      }
      case 'delete': {
        if (!id) return NextResponse.json({ error: 'Unknown block.' }, { status: 400 });
        const ok = await deleteBlock(id);
        await invalidateStorefront();
        return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
      }
      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    }
  } catch (err) {
    captureApiError(err, { route: 'admin/storefront POST' });
    const { status, error } = apiErrorResponse(err, 'Could not save storefront content.');
    return NextResponse.json({ error }, { status });
  }
}

export const GET = withAudit('/api/admin/storefront', handleGET);
export const POST = withAudit('/api/admin/storefront', handlePOST);
