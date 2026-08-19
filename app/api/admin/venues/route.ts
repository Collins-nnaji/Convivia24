import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { apiErrorResponse } from '@/lib/db';
import { listVenues, createVenue, updateVenue, deleteVenue } from '@/lib/venues/repo';
import { LAGOS_AREAS } from '@/lib/geo/lagos';

export async function GET() {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const venues = await listVenues({ status: 'all' });
    return NextResponse.json({ venues, areas: LAGOS_AREAS });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not load venues.');
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const data = await req.json();
    if (!data.name || !data.slug) {
      return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 });
    }
    const venue = await createVenue({ ...data, source: data.source || 'admin', status: data.status || 'active' });
    return NextResponse.json({ venue });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not create venue.');
    return NextResponse.json({ error }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ error: 'Venue ID required.' }, { status: 400 });
    await updateVenue(id, data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not update venue.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Venue ID required.' }, { status: 400 });
    await deleteVenue(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not delete venue.');
    return NextResponse.json({ error }, { status });
  }
}
