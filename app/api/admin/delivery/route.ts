import { withAudit } from '@/lib/audit/route';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { getCurrentUser } from '@/lib/auth/session';
import sql, { apiErrorResponse } from '@/lib/db';
import { launchCity } from '@/lib/delivery/policy';
async function handleGET() {
  const gate = await requireAdmin('operations');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const [zones, providers] = await Promise.all([
      sql`SELECT * FROM delivery_zones ORDER BY city, name`,
      sql`SELECT * FROM delivery_providers ORDER BY name`,
    ]);
    return NextResponse.json({ zones, providers });
  } catch (err) { const { status, error } = apiErrorResponse(err); return NextResponse.json({ error }, { status }); }
}
async function handlePOST(req: NextRequest) {
  const gate = await requireAdmin('operations');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const body = await req.json();
    if (typeof body.active !== 'boolean') return NextResponse.json({ error: 'Choose whether this setting is enabled.' }, { status: 400 });
    const id = body.id ? String(body.id) : null;
    if (id && !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Valid delivery setting ID required.' }, { status: 400 });
    const name = String(body.name || '').trim().slice(0, 100);
    if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    let rows;
    if (body.kind === 'provider') {
      const contact = String(body.contact || '').trim().slice(0, 200);
      rows = id ? await sql`UPDATE delivery_providers SET name=${name}, contact=${contact}, active=${body.active === true} WHERE id=${id}::uuid RETURNING *` : await sql`INSERT INTO delivery_providers(name, contact, active)
        VALUES(${name}, ${contact}, ${body.active === true}) RETURNING *`;
    } else if (body.kind === 'zone') {
      const city = launchCity(body.city);
      const fee = Number(body.feeNgn);
      const estimate = String(body.estimate || '').trim().slice(0, 200);
      if (!city || !Number.isSafeInteger(fee) || fee < 0 || !estimate) return NextResponse.json({ error: 'Choose a supported delivery city and enter a whole non-negative fee and delivery estimate.' }, { status: 400 });
      rows = id ? await sql`UPDATE delivery_zones SET city=${city}, name=${name}, fee_ngn=${fee}, estimate=${estimate}, active=${body.active === true} WHERE id=${id}::uuid RETURNING *` : await sql`INSERT INTO delivery_zones(city, name, fee_ngn, estimate, active)
        VALUES(${city}, ${name}, ${fee}, ${estimate}, ${body.active === true}) RETURNING *`;
    } else return NextResponse.json({ error: 'Unknown delivery setting.' }, { status: 400 });
    if (!rows.length) return NextResponse.json({ error: 'Delivery setting not found. Refresh and retry.' }, { status: 404 });
    const user = await getCurrentUser();
    await sql`INSERT INTO admin_audit(actor, action, subject) VALUES(${user?.id || 'shared-admin'}, ${'delivery.' + body.kind}, ${String(rows[0].id)})`;
    return NextResponse.json({ saved: rows[0] });
  } catch (err) { if (err && typeof err === 'object' && 'code' in err && err.code === '23505') return NextResponse.json({ error: 'A delivery zone or courier with that name already exists. Edit the existing record or choose another name.' }, { status: 409 }); const { status, error } = apiErrorResponse(err, 'Could not save delivery settings.'); return NextResponse.json({ error }, { status }); }
}

export const GET = withAudit('/api/admin/delivery', handleGET);
export const POST = withAudit('/api/admin/delivery', handlePOST);
