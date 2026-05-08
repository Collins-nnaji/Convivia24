import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import {
  getOutletApplicationForUser,
  serializeOutletApplication,
  syncOutletFirmFromApplication,
} from '@/lib/outlet-application';

/** POST — submit draft for admin review (easy verification: one form + queue). */
export async function POST() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getOrCreateUser(authUser);

    const rows = await sql`
      SELECT id, status, business_name, street_address, phone, city_id
      FROM outlet_applications
      WHERE user_id = ${user.id}::uuid
      LIMIT 1
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Save your application first.' }, { status: 400 });
    }
    const row = rows[0];
    if (String(row.status) === 'approved') {
      return NextResponse.json({ error: 'Already approved.' }, { status: 400 });
    }
    if (!String(row.business_name || '').trim() || !String(row.street_address || '').trim() || !String(row.phone || '').trim()) {
      return NextResponse.json(
        { error: 'Business name, outlet address, and phone are required before submit.' },
        { status: 400 },
      );
    }

    await sql`
      UPDATE outlet_applications
      SET
        status = 'submitted',
        submitted_at = COALESCE(submitted_at, NOW()),
        updated_at = NOW()
      WHERE user_id = ${user.id}::uuid
    `;

    try {
      await syncOutletFirmFromApplication(String(user.id));
    } catch (e) {
      console.warn('[outlet-application/submit] syncOutletFirmFromApplication', e);
    }

    const fresh = await getOutletApplicationForUser(String(user.id));
    return NextResponse.json({
      ok: true,
      application: serializeOutletApplication(fresh),
    });
  } catch (err) {
    console.error('POST /api/outlet-application/submit', err);
    return NextResponse.json({ error: 'Failed to submit.' }, { status: 500 });
  }
}
