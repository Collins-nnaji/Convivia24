import { NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
export async function GET() {
  try {
    const zones = await sql`SELECT id, city, name, fee_ngn AS "feeNgn", estimate FROM delivery_zones WHERE active ORDER BY city, name`;
    return NextResponse.json({ cities: [...new Set(zones.map(zone => zone.city))], zones });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Delivery options are temporarily unavailable.');
    return NextResponse.json({ error, zones: [] }, { status });
  }
}
