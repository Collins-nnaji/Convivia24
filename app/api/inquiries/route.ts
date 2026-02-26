import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

type InquiryBody = {
  name: string;
  email: string;
  company?: string;
  inquiry_type: string;
  message: string;
};

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, inquiry_type, message } =
      (await req.json()) as InquiryBody;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured.' },
        { status: 500 },
      );
    }

    const rows = await sql`
      INSERT INTO inquiries (name, email, company, inquiry_type, message)
      VALUES (
        ${name.trim()},
        ${email.trim()},
        ${company?.trim() ?? null},
        ${inquiry_type ?? 'General Inquiry'},
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
