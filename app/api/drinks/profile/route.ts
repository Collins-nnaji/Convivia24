import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const rows = await sql`
      SELECT * FROM outlet_profiles WHERE user_id = ${user.id} LIMIT 1
    `;

    return NextResponse.json({
      profile: rows[0] || {
        user_id: user.id,
        outlet_name: user.company || '',
        outlet_type: 'nightlife',
        city: user.location || 'Lagos',
        contact_name: user.name || '',
        logo_url: user.avatar_url || '',
      },
    });
  } catch (err) {
    console.error('Outlet profile load error:', err);
    return NextResponse.json({ error: 'Failed to load outlet profile.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const body = await req.json();

    const rows = await sql`
      INSERT INTO outlet_profiles (
        user_id, outlet_name, outlet_type, city, address,
        contact_name, phone, logo_url, delivery_window, credit_terms, updated_at
      )
      VALUES (
        ${user.id},
        ${body.outlet_name?.trim() || null},
        ${body.outlet_type?.trim() || 'nightlife'},
        ${body.city?.trim() || 'Lagos'},
        ${body.address?.trim() || null},
        ${body.contact_name?.trim() || null},
        ${body.phone?.trim() || null},
        ${body.logo_url?.trim() || null},
        ${body.delivery_window?.trim() || null},
        ${Boolean(body.credit_terms)},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        outlet_name = EXCLUDED.outlet_name,
        outlet_type = EXCLUDED.outlet_type,
        city = EXCLUDED.city,
        address = EXCLUDED.address,
        contact_name = EXCLUDED.contact_name,
        phone = EXCLUDED.phone,
        logo_url = COALESCE(EXCLUDED.logo_url, outlet_profiles.logo_url),
        delivery_window = EXCLUDED.delivery_window,
        credit_terms = EXCLUDED.credit_terms,
        updated_at = NOW()
      RETURNING *
    `;

    return NextResponse.json({ ok: true, profile: rows[0] });
  } catch (err) {
    console.error('Outlet profile save error:', err);
    return NextResponse.json({ error: 'Failed to save outlet profile.' }, { status: 500 });
  }
}
