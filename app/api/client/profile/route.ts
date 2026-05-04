import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

function asTextArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((v) => v.trim()).filter(Boolean);
  return [];
}

export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const rows = await sql`
      SELECT * FROM client_profiles WHERE user_id = ${user.id} LIMIT 1
    `;

    return NextResponse.json({
      profile: rows[0] || {
        user_id: user.id,
        company: user.company || '',
        role: user.role || '',
        website: user.website || '',
        product_category: user.product_category || '',
        target_markets: user.target_markets || [],
      },
      user,
    });
  } catch (err) {
    console.error('Client profile load error:', err);
    return NextResponse.json({ error: 'Failed to load client profile.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const body = await req.json();
    const targetMarkets = asTextArray(body.target_markets);

    const rows = await sql`
      INSERT INTO client_profiles (
        user_id, company, role, website, product_category,
        target_markets, launch_goal, budget_range, logo_url, updated_at
      )
      VALUES (
        ${user.id},
        ${body.company?.trim() || null},
        ${body.role?.trim() || null},
        ${body.website?.trim() || null},
        ${body.product_category?.trim() || null},
        ${targetMarkets}::text[],
        ${body.launch_goal?.trim() || null},
        ${body.budget_range?.trim() || null},
        ${body.logo_url?.trim() || null},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        company = EXCLUDED.company,
        role = EXCLUDED.role,
        website = EXCLUDED.website,
        product_category = EXCLUDED.product_category,
        target_markets = EXCLUDED.target_markets,
        launch_goal = EXCLUDED.launch_goal,
        budget_range = EXCLUDED.budget_range,
        logo_url = COALESCE(EXCLUDED.logo_url, client_profiles.logo_url),
        updated_at = NOW()
      RETURNING *
    `;

    await sql`
      UPDATE users SET
        company = ${body.company?.trim() || null},
        role = ${body.role?.trim() || null},
        website = ${body.website?.trim() || null},
        product_category = ${body.product_category?.trim() || null},
        target_markets = ${targetMarkets}::text[]
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ ok: true, profile: rows[0] });
  } catch (err) {
    console.error('Client profile save error:', err);
    return NextResponse.json({ error: 'Failed to save client profile.' }, { status: 500 });
  }
}
