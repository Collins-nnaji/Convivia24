import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { createVenue } from '@/lib/venues/repo';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in to submit a venue.' }, { status: 401 });

    const data = await req.json();
    if (!data.name || !data.areaId || !data.area) {
      return NextResponse.json({ error: 'Name and area are required.' }, { status: 400 });
    }

    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const venue = await createVenue({
      slug: `${slug}-${Date.now().toString(36)}`,
      name: data.name,
      kind: data.kind || 'lounge',
      areaId: data.areaId,
      area: data.area,
      address: data.address || '',
      tagline: data.tagline || '',
      about: data.about || '',
      hours: data.hours || '',
      phone: data.phone || null,
      instagram: data.instagram || null,
      website: data.website || null,
      photoUrl: data.photoUrl || null,
      status: 'pending',
      source: 'partner_submission',
      submittedBy: user.id,
    });

    return NextResponse.json({ venue, message: 'Submitted for approval.' });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not submit venue.');
    return NextResponse.json({ error }, { status });
  }
}
