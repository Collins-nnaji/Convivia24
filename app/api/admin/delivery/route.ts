import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { getCurrentUser } from '@/lib/auth/session';
import sql, { apiErrorResponse } from '@/lib/db';
import { launchCity } from '@/lib/delivery/policy';
export async function GET() {
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
export async function POST(req: NextRequest) {
  const gate = await requireAdmin('operations');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const body = await req.json();
    const name = String(body.name || '').trim().slice(0, 100);
    if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    let rows;
    if (body.kind === 'provider') {
      rows = await sql`INSERT INTO delivery_providers(name, contact, active)
        VALUES(${name}, ${String(body.contact || '').trim().slice(0, 200)}, ${body.active === true})
        ON CONFLICT(name) DO UPDATE SET contact = EXCLUDED.contact, active = EXCLUDED.active RETURNING *`;
    } else if (body.kind === 'zone') {
      const city = launchCity(body.city);
      const fee = Number(body.feeNgn);
      const estimate = String(body.estimate || '').trim().slice(0, 200);
      if (!city || !Number.isSafeInteger(fee) || fee < 0 || !estimate) return NextResponse.json({ error: 'Choose a launch city and enter a whole non-negative fee and delivery estimate.' }, { status: 400 });
      rows = await sql`INSERT INTO delivery_zones(city, name, fee_ngn, estimate, active)
        VALUES(${city}, ${name}, ${fee}, ${estimate}, ${body.active === true})
        ON CONFLICT(city, name) DO UPDATE SET fee_ngn = EXCLUDED.fee_ngn, estimate = EXCLUDED.estimate, active = EXCLUDED.active RETURNING *`;
    } else return NextResponse.json({ error: 'Unknown delivery setting.' }, { status: 400 });
    const user = await getCurrentUser();
    await sql`INSERT INTO admin_audit(actor, action, subject) VALUES(${user?.id || 'shared-admin'}, ${'delivery.' + body.kind}, ${String(rows[0].id)})`;
    return NextResponse.json({ saved: rows[0] });
  } catch (err) { const { status, error } = apiErrorResponse(err, 'Could not save delivery settings.'); return NextResponse.json({ error }, { status }); }
}
