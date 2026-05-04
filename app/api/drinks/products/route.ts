import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const emergency = searchParams.get('emergency') === 'true';

    const products = await sql`
      SELECT *
      FROM drink_products
      WHERE is_active = true
        AND (${category}::text IS NULL OR category = ${category})
        AND (${emergency}::boolean = false OR stock_status IN ('in_stock','low_stock'))
      ORDER BY
        CASE category
          WHEN 'beer' THEN 1
          WHEN 'spirits' THEN 2
          WHEN 'wine' THEN 3
          WHEN 'non_alcoholic' THEN 4
          WHEN 'water' THEN 5
          WHEN 'energy' THEN 6
          WHEN 'mixer' THEN 7
          ELSE 8
        END,
        brand ASC,
        name ASC
    `;

    return NextResponse.json({ products });
  } catch (err) {
    console.error('Drink products load error:', err);
    return NextResponse.json({ error: 'Failed to load drinks catalogue.' }, { status: 500 });
  }
}
