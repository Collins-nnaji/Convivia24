import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: NextRequest) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await req.json();
    const {
      inquiryId,
      name,
      email,
      subject,
      messages,
    } = body as {
      inquiryId: string;
      name?: string;
      email?: string;
      subject?: string;
      messages?: { role: string; content: string }[];
    };

    if (!inquiryId) {
      return NextResponse.json({ error: 'inquiryId required' }, { status: 400 });
    }

    const sql = neon(dbUrl);

    if (messages !== undefined) {
      await sql`
        UPDATE chat_inquiries
        SET name = COALESCE(${name ?? null}, name),
            email = COALESCE(${email ?? null}, email),
            subject = COALESCE(${subject ?? null}, subject),
            messages = ${JSON.stringify(messages)}::jsonb,
            "updatedAt" = NOW()
        WHERE id = ${inquiryId}::uuid
      `;
    } else {
      await sql`
        UPDATE chat_inquiries
        SET name = COALESCE(${name ?? null}, name),
            email = COALESCE(${email ?? null}, email),
            subject = COALESCE(${subject ?? null}, subject),
            "updatedAt" = NOW()
        WHERE id = ${inquiryId}::uuid
      `;
    }

    return NextResponse.json({ ok: true, inquiryId });
  } catch (err) {
    console.error('Save inquiry error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Save failed' },
      { status: 500 }
    );
  }
}
