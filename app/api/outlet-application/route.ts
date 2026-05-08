import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import {
  getOutletApplicationForUser,
  serializeOutletApplication,
  syncOutletFirmFromApplication,
} from '@/lib/outlet-application';

/** GET — current user's outlet application (or null). */
export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getOrCreateUser(authUser);
    const row = await getOutletApplicationForUser(String(user.id));
    return NextResponse.json({
      application: serializeOutletApplication(row),
    });
  } catch (err) {
    console.error('GET /api/outlet-application', err);
    return NextResponse.json({ error: 'Failed to load.' }, { status: 500 });
  }
}

/** PUT — create/update draft (does not submit). */
export async function PUT(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getOrCreateUser(authUser);
    const body = await req.json();
    const city_id = typeof body.city_id === 'string' ? body.city_id.trim() : '';
    const business_name = typeof body.business_name === 'string' ? body.business_name.trim() : '';
    const business_type = typeof body.business_type === 'string' ? body.business_type.trim() : '';
    const street_address = typeof body.street_address === 'string' ? body.street_address.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const cac_number = typeof body.cac_number === 'string' ? body.cac_number.trim() : '';
    const contact_email = typeof body.contact_email === 'string' ? body.contact_email.trim() : '';
    const verification_notes =
      typeof body.verification_notes === 'string' ? body.verification_notes.trim() : '';

    if (!city_id) {
      return NextResponse.json({ error: 'city_id is required.' }, { status: 400 });
    }

    const cityOk = await sql`SELECT id FROM cities WHERE id = ${city_id}::uuid LIMIT 1`;
    if (cityOk.length === 0) {
      return NextResponse.json({ error: 'Invalid city.' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO outlet_applications (
        user_id, city_id, business_name, business_type, street_address, phone,
        cac_number, contact_email, verification_notes, status, updated_at
      )
      VALUES (
        ${user.id}::uuid,
        ${city_id}::uuid,
        ${business_name},
        ${business_type || null},
        ${street_address},
        ${phone},
        ${cac_number || null},
        ${contact_email || null},
        ${verification_notes || null},
        'draft',
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        city_id = EXCLUDED.city_id,
        business_name = EXCLUDED.business_name,
        business_type = EXCLUDED.business_type,
        street_address = EXCLUDED.street_address,
        phone = EXCLUDED.phone,
        cac_number = EXCLUDED.cac_number,
        contact_email = EXCLUDED.contact_email,
        verification_notes = EXCLUDED.verification_notes,
        updated_at = NOW()
      RETURNING id
    `;

    const id = rows[0]?.id;
    const fresh = id ? await getOutletApplicationForUser(String(user.id)) : null;
    try {
      await syncOutletFirmFromApplication(String(user.id));
    } catch (e) {
      console.warn('[outlet-application PUT] syncOutletFirmFromApplication', e);
    }
    return NextResponse.json({
      ok: true,
      application: serializeOutletApplication(fresh),
    });
  } catch (err) {
    console.error('PUT /api/outlet-application', err);
    return NextResponse.json({ error: 'Failed to save.' }, { status: 500 });
  }
}
