import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, party_size, reservation_date, reservation_time, space, occasion, special_requests } = body;

    if (!name?.trim() || !email?.trim() || !party_size || !reservation_date || !reservation_time) {
      return NextResponse.json({ error: 'Name, email, party size, date and time are required.' }, { status: 400 });
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const size = Number(party_size);
    if (!Number.isInteger(size) || size < 1 || size > 300) {
      return NextResponse.json({ error: 'Party size must be between 1 and 300.' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO reservations (name, email, phone, party_size, reservation_date, reservation_time, space, occasion, special_requests)
      VALUES (
        ${name.trim()}, ${email.trim().toLowerCase()}, ${phone?.trim() || null},
        ${size}, ${reservation_date}, ${reservation_time},
        ${space || 'The Floor'}, ${occasion?.trim() || null}, ${special_requests?.trim() || null}
      )
      RETURNING id, status, created_at
    `;

    return NextResponse.json({ id: rows[0].id, status: rows[0].status }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/reservations]', err);
    return NextResponse.json({ error: 'Unable to create reservation. Please try again.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    let rows;
    if (status && date) {
      rows = await sql`SELECT * FROM reservations WHERE status = ${status} AND reservation_date = ${date} ORDER BY reservation_time`;
    } else if (status) {
      rows = await sql`SELECT * FROM reservations WHERE status = ${status} ORDER BY reservation_date DESC, reservation_time`;
    } else if (date) {
      rows = await sql`SELECT * FROM reservations WHERE reservation_date = ${date} ORDER BY reservation_time`;
    } else {
      rows = await sql`SELECT * FROM reservations ORDER BY reservation_date DESC, reservation_time LIMIT 200`;
    }

    return NextResponse.json({ reservations: rows });
  } catch (err) {
    console.error('[GET /api/reservations]', err);
    return NextResponse.json({ error: 'Failed to fetch reservations.' }, { status: 500 });
  }
}
