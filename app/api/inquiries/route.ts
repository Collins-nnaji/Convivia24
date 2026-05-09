import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { InquirySchema, zodFirstError } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, 'inquiries', 5, 60);
    if (limited) return limited;

    const raw = await req.json().catch(() => ({}));
    const parsed = InquirySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: zodFirstError(parsed.error) },
        { status: 400 },
      );
    }
    const { name, email, company, inquiry_type, message } = parsed.data;

    const rows = await sql`
      INSERT INTO inquiries (name, email, company, inquiry_type, message)
      VALUES (
        ${name.trim()},
        ${email.trim()},
        ${company?.trim() ?? null},
        ${inquiry_type},
        ${message.trim()}
      )
      RETURNING id, created_at;
    `;

    return NextResponse.json({
      ok: true,
      id: rows[0]?.id,
      message: 'Your inquiry has been received. We will be in touch within 48 hours.',
    });
  } catch (err) {
    console.error('Inquiry save error:', err);
    return NextResponse.json(
      { error: 'Unable to save your inquiry right now. Please try again.' },
      { status: 500 },
    );
  }
}
