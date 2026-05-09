import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { WaitlistSchema, zodFirstError } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, 'waitlist', 5, 60);
    if (limited) return limited;

    const raw = await req.json().catch(() => ({}));
    const parsed = WaitlistSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: zodFirstError(parsed.error) },
        { status: 400 },
      );
    }
    const { email, company, name } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await sql`
      SELECT id FROM waitlist WHERE LOWER(email) = ${normalizedEmail} LIMIT 1
    `;
    if (existing.length > 0) {
      return NextResponse.json({ ok: true, message: "You're already on the list. We'll be in touch." });
    }

    await sql`
      INSERT INTO waitlist (email, company, name)
      VALUES (${normalizedEmail}, ${company?.trim() || null}, ${name?.trim() || null})
    `;

    return NextResponse.json({ ok: true, message: "You're on the list. We'll be in touch." });
  } catch (err) {
    console.error('Waitlist save error:', err);
    return NextResponse.json(
      { error: 'Unable to join the waitlist right now. Please try again.' },
      { status: 500 },
    );
  }
}
