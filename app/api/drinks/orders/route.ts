import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

type OrderItem = {
  product_id: string;
  quantity: number;
};

export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const orders = await sql`
      SELECT o.*, COALESCE(
        json_agg(
          json_build_object(
            'product_id', i.product_id,
            'quantity', i.quantity,
            'unit_price_ngn', i.unit_price_ngn,
            'line_total_ngn', i.line_total_ngn,
            'brand', p.brand,
            'name', p.name,
            'pack_size', p.pack_size
          )
        ) FILTER (WHERE i.product_id IS NOT NULL),
        '[]'
      ) as items
      FROM drink_orders o
      LEFT JOIN drink_order_items i ON i.order_id = o.id
      LEFT JOIN drink_products p ON p.id = i.product_id
      WHERE o.user_id = ${user.id}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 30
    `;

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('Drink orders load error:', err);
    return NextResponse.json({ error: 'Failed to load drink orders.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items as OrderItem[] : [];

    if (items.length === 0) {
      return NextResponse.json({ error: 'Add at least one drink to the order.' }, { status: 400 });
    }

    const profileRows = await sql`
      SELECT id, city, address, delivery_window
      FROM outlet_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;
    const profile = profileRows[0];

    const productIds = items.map((item) => item.product_id);
    const products = await sql`
      SELECT id, price_ngn, moq, stock_status
      FROM drink_products
      WHERE id = ANY(${productIds}::uuid[]) AND is_active = true
    `;

    if (products.length !== items.length) {
      return NextResponse.json({ error: 'Some products are unavailable.' }, { status: 400 });
    }

    const lines = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      const quantity = Math.max(Number(item.quantity || 0), Number(product?.moq || 1));
      const unitPrice = Number(product?.price_ngn || 0);
      return {
        product_id: item.product_id,
        quantity,
        unit_price_ngn: unitPrice,
        line_total_ngn: Math.round(quantity * unitPrice),
      };
    });
    const subtotal = lines.reduce((sum, item) => sum + item.line_total_ngn, 0);

    const orderRows = await sql`
      INSERT INTO drink_orders (
        user_id, outlet_profile_id, order_type, delivery_city,
        delivery_address, delivery_window, subtotal_ngn, notes
      )
      VALUES (
        ${user.id},
        ${profile?.id || null},
        ${body.order_type === 'emergency' ? 'emergency' : 'regular'},
        ${body.delivery_city?.trim() || profile?.city || 'Lagos'},
        ${body.delivery_address?.trim() || profile?.address || null},
        ${body.delivery_window?.trim() || profile?.delivery_window || null},
        ${subtotal},
        ${body.notes?.trim() || null}
      )
      RETURNING *
    `;

    for (const line of lines) {
      await sql`
        INSERT INTO drink_order_items (order_id, product_id, quantity, unit_price_ngn, line_total_ngn)
        VALUES (${orderRows[0].id}, ${line.product_id}, ${line.quantity}, ${line.unit_price_ngn}, ${line.line_total_ngn})
      `;
    }

    return NextResponse.json({ ok: true, order: { ...orderRows[0], items: lines } });
  } catch (err) {
    console.error('Drink order create error:', err);
    return NextResponse.json({ error: 'Failed to place drink order.' }, { status: 500 });
  }
}
