import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section'); // 'food' | 'drinks'

    const categories = section
      ? await sql`
          SELECT * FROM menu_categories
          WHERE is_active = true AND section = ${section}
          ORDER BY sort_order, name
        `
      : await sql`
          SELECT * FROM menu_categories WHERE is_active = true ORDER BY section, sort_order, name
        `;

    const items = await sql`
      SELECT mi.*, mc.slug AS category_slug, mc.section
      FROM menu_items mi
      JOIN menu_categories mc ON mc.id = mi.category_id
      WHERE mi.is_active = true AND mc.is_active = true
      ORDER BY mi.sort_order, mi.name
    `;

    const result = categories.map((cat) => ({
      ...cat,
      items: items.filter((item) => item.category_id === cat.id),
    }));

    return NextResponse.json({ menu: result });
  } catch (err) {
    console.error('[GET /api/menu]', err);
    return NextResponse.json({ error: 'Failed to fetch menu.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, ...data } = await req.json();

    if (type === 'category') {
      const { name, slug, section, note, sort_order } = data;
      if (!name || !slug || !section) return NextResponse.json({ error: 'name, slug, section required' }, { status: 400 });
      const rows = await sql`
        INSERT INTO menu_categories (name, slug, section, note, sort_order)
        VALUES (${name}, ${slug}, ${section}, ${note || null}, ${sort_order || 0})
        RETURNING *
      `;
      return NextResponse.json(rows[0], { status: 201 });
    }

    if (type === 'item') {
      const { category_id, name, description, price, is_highlight, sort_order, allergens } = data;
      if (!category_id || !name) return NextResponse.json({ error: 'category_id and name required' }, { status: 400 });
      const rows = await sql`
        INSERT INTO menu_items (category_id, name, description, price, is_highlight, sort_order, allergens)
        VALUES (${category_id}, ${name}, ${description || null}, ${price || null}, ${is_highlight || false}, ${sort_order || 0}, ${allergens || null})
        RETURNING *
      `;
      return NextResponse.json(rows[0], { status: 201 });
    }

    return NextResponse.json({ error: 'type must be "category" or "item"' }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/menu]', err);
    return NextResponse.json({ error: 'Failed to create menu entry.' }, { status: 500 });
  }
}
