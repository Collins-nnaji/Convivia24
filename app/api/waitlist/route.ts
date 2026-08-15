import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const company = typeof body.company === 'string' ? body.company.trim() : null;
    const source =
      body.source === 'convivium' || body.source === 'checkout' || body.source === 'rituals'
        ? body.source
        : 'footer';
    const tier =
      body.tier === 'founding' || body.tier === 'patron' || body.tier === 'resident'
        ? body.tier
        : null;
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    await sql`
      INSERT INTO waitlist (email, company, source)
      VALUES (${email}, ${company}, ${source})
      ON CONFLICT (email) DO UPDATE SET
        company = COALESCE(EXCLUDED.company, waitlist.company),
        source = EXCLUDED.source
    `;

    if (source === 'convivium' || tier) {
      await sql`
        INSERT INTO convivium_members (email, full_name, tier, status)
        VALUES (${email}, ${fullName}, ${tier || 'resident'}, 'waitlist')
        ON CONFLICT (email) DO UPDATE SET
          full_name = COALESCE(EXCLUDED.full_name, convivium_members.full_name),
          tier = EXCLUDED.tier,
          updated_at = NOW()
      `;
    }

    return NextResponse.json({ ok: true, message: "You're on the list." });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to save right now. Please try again.');
    return NextResponse.json({ error }, { status });
  }
}
