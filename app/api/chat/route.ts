import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

type RequestBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = (await req.json()) as RequestBody;
    const trimmedMessage = message?.trim() ?? '';

    if (!trimmedMessage) {
      return NextResponse.json({ error: 'Please include a message.' }, { status: 400 });
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        { error: 'Database not configured. Set DATABASE_URL in your environment.' },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);
    const rows = await sql`
      INSERT INTO chat_inquiries (name, email, subject, messages)
      VALUES (${name ?? null}, ${email ?? null}, ${subject ?? null}, ${JSON.stringify([
        { role: 'user', content: trimmedMessage },
      ])}::jsonb)
      RETURNING id, createdAt;
    `;

    const inquiryId = rows?.[0]?.id ?? null;
    return NextResponse.json({ inquiryId, message: 'Your note has been saved. Someone on the team will take it from here.' });
  } catch (err) {
    console.error('Inquiry save error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unable to save your inquiry right now.' },
      { status: 500 }
    );
  }
}
