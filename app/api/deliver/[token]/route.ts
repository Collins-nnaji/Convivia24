import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { verifyRiderToken } from '@/lib/delivery/rider-link';
import { applyOrderStatus } from '@/lib/commerce/transitions';
import { blobConfigured, uploadBlob, validateImageFile } from '@/lib/azure/blob';
import { clientIp, rateLimit } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/**
 * Rider link API. The signed token is the only credential and it covers exactly one order:
 * GET shows the drop-off (no prices, no customer email); POST marks it delivered with the
 * receiver's name, the 18+ check and an optional photo.
 */

type Ctx = { params: Promise<{ token: string }> };

async function orderFor(token: string) {
  const orderId = verifyRiderToken(token);
  if (!orderId) return null;
  const [o] = await sql`
    SELECT o.id, o.status, o.full_name, o.phone, o.address_line1, o.address_line2, o.area, o.city, o.notes,
           o.eta_at, o.courier_name,
           COALESCE(json_agg(json_build_object('name', i.kit_name, 'qty', i.qty) ORDER BY i.created_at)
             FILTER (WHERE i.id IS NOT NULL), '[]'::json) AS items
    FROM ritual_orders o LEFT JOIN ritual_order_items i ON i.order_id = o.id
    WHERE o.id = ${orderId}::uuid
    GROUP BY o.id
  `;
  return o ?? null;
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const rl = await rateLimit(`rider-link:${clientIp(req)}`, 60, 60, { fallback: 'local' });
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  try {
    const o = await orderFor((await params).token);
    if (!o) return NextResponse.json({ error: 'This delivery link is invalid or has expired. Ask the desk for a new one.' }, { status: 404 });
    return NextResponse.json({
      order: {
        ref: String(o.id).slice(0, 8).toUpperCase(),
        status: o.status,
        name: o.full_name,
        phone: o.phone,
        address: [o.address_line1, o.address_line2, o.area, o.city].filter(Boolean).join(', '),
        notes: o.notes,
        etaAt: o.eta_at,
        rider: o.courier_name,
        items: o.items,
      },
      photoUpload: blobConfigured(),
    });
  } catch (err) {
    captureApiError(err, { route: 'deliver GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load this delivery.');
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const rl = await rateLimit(`rider-link-post:${clientIp(req)}`, 10, 60, { fallback: 'local' });
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  try {
    const o = await orderFor((await params).token);
    if (!o) return NextResponse.json({ error: 'This delivery link is invalid or has expired.' }, { status: 404 });
    if (o.status === 'delivered' || o.status === 'fulfilled') return NextResponse.json({ ok: true, already: true });
    if (o.status !== 'out_for_delivery') {
      return NextResponse.json({ error: 'This order is not out for delivery yet. Ask the desk to dispatch it first.' }, { status: 409 });
    }

    const form = await req.formData();
    const receivedBy = String(form.get('receivedBy') || '').trim().slice(0, 120);
    const ageChecked = form.get('ageChecked') === 'yes';
    if (!receivedBy) return NextResponse.json({ error: 'Enter the name of the person who received the order.' }, { status: 400 });
    if (!ageChecked) return NextResponse.json({ error: 'Confirm you checked the receiver is 18 or older.' }, { status: 400 });

    let photoUrl: string | null = null;
    const photo = form.get('photo');
    if (photo instanceof File && photo.size > 0) {
      if (!blobConfigured()) return NextResponse.json({ error: 'Photo upload is not available — submit without a photo.' }, { status: 503 });
      const invalid = validateImageFile(photo);
      if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
      const uploaded = await uploadBlob(Buffer.from(await photo.arrayBuffer()), photo.type, { filename: photo.name, purpose: 'delivery-proof' });
      photoUrl = uploaded.url;
    }

    const when = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' });
    const deliveryProof = `Received by ${receivedBy} at ${when} (rider link)${photoUrl ? ` · photo: ${photoUrl}` : ''}`;
    const result = await applyOrderStatus(String(o.id), 'delivered', {
      tracking: { deliveryProof, recipientAgeChecked: true },
      note: `Delivered — received by ${receivedBy}`,
      actor: { kind: 'rider', label: o.courier_name ? `rider ${o.courier_name}` : 'rider link' },
    });
    if (result.ok === false) return NextResponse.json({ error: result.error }, { status: result.httpStatus });
    return NextResponse.json({ ok: true });
  } catch (err) {
    captureApiError(err, { route: 'deliver POST' });
    const { status, error } = apiErrorResponse(err, 'Could not mark this delivery. Try again.');
    return NextResponse.json({ error }, { status });
  }
}
