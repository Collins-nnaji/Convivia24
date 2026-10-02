import { NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { LAUNCH_CITIES } from '@/lib/delivery/policy';
export async function GET() {
  try {
    const zones = await sql`SELECT id, city, name, fee_ngn AS "feeNgn", estimate FROM delivery_zones WHERE active ORDER BY city, name`;
    return NextResponse.json({ cities: LAUNCH_CITIES, zones });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Delivery options are temporarily unavailable.');
    return NextResponse.json({ error, zones: [] }, { status });
  }
}
