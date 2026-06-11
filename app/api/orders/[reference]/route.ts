import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { faceConfigured } from '@/lib/ai/face';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const { reference } = await params;
    const orderRows = await sql`SELECT * FROM orders WHERE reference = ${reference} LIMIT 1`;
    const order = orderRows[0];
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    const eventRows = await sql`SELECT * FROM events WHERE id = ${order.event_id} LIMIT 1`;
    const tickets = await sql`SELECT * FROM tickets WHERE order_id = ${order.id} ORDER BY created_at`;

    return NextResponse.json({
      order,
      event: eventRows[0] ?? null,
      tickets,
      face: { available: faceConfigured(), enrolled: !!order.face_image_url },
    });
  } catch (err) {
    console.error('[GET /api/orders/[reference]]', err);
    return NextResponse.json({ error: 'Could not load order.' }, { status: 500 });
  }
}
