import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

type WaitlistBody = {
  email: string;
  company?: string;
  name?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(req: NextRequest) {
  try {
    const { email, company, name } = (await req.json()) as WaitlistBody;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 },
      );
    }

    if (!isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured.' },
        { status: 500 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await sql`
      SELECT id FROM waitlist WHERE LOWER(email) = ${normalizedEmail} LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({
        ok: true,
        message: "You're already on the list. We'll be in touch.",
      });
    }

    await sql`
      INSERT INTO waitlist (email, company, name)
      VALUES (
        ${normalizedEmail},
        ${company?.trim() || null},
        ${name?.trim() || null}
      )
    `;

    return NextResponse.json({
      ok: true,
      message: "You're on the list. We'll be in touch.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Waitlist save error:', err);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === 'development' ? msg : 'Unable to join the waitlist right now. Please try again.',
      },
      { status: 500 },
    );
  }
}
