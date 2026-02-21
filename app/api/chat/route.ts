import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Models currently allowed for chat (override with OPENAI_CHAT_MODEL env)
const ALLOWED_OPENAI_CHAT_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-4o-2024-11-20',
  'gpt-4o-mini-2024-07-18',
  'gpt-3.5-turbo',
] as const;

function getModel(): string {
  const envModel = process.env.OPENAI_CHAT_MODEL?.trim();
  if (envModel && ALLOWED_OPENAI_CHAT_MODELS.includes(envModel as (typeof ALLOWED_OPENAI_CHAT_MODELS)[number])) {
    return envModel;
  }
  return 'gpt-4o-mini'; // default when OPENAI_CHAT_MODEL is unset or not in allowed list
}

const systemPrompt = `You are a live AI Revenue Advisor for Convivia24. You help visitors with revenue, sales, and pipeline questions. Be concise, professional, and helpful. Collect their name and email when relevant so the team can follow up. Treat this as a live chat: short turns, clear next steps.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], inquiryId: providedId, name, email, subject } = body as {
      messages?: { role: 'user' | 'assistant'; content: string }[];
      inquiryId?: string;
      name?: string;
      email?: string;
      subject?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required with at least one message' }, { status: 400 });
    }

    // Support OPENAI_API_KEY from env (use .env.local in dev; set in host for production)
    const apiKey = (process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || '').trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chat is not configured. Add OPENAI_API_KEY to .env.local (dev) or your deployment environment.' },
        { status: 503 }
      );
    }

    const model = getModel();
    const openai = new OpenAI({ apiKey });

    const dbUrl = process.env.DATABASE_URL;
    let inquiryId = providedId as string | null;

    if (dbUrl) {
      const sql = neon(dbUrl);
      if (!inquiryId) {
        const rows = await sql`
          INSERT INTO chat_inquiries (name, email, subject, messages, status)
          VALUES (${name ?? null}, ${email ?? null}, ${subject ?? null}, '[]', 'open')
          RETURNING id
        `;
        inquiryId = rows?.[0]?.id ?? null;
      }
    }

    const apiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: m.content,
      })),
    ];

    const stream = await openai.chat.completions.create({
      model,
      messages: apiMessages,
      max_tokens: 1024,
      stream: true,
    });

    const encoder = new TextEncoder();
    let fullContent = '';

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              fullContent += text;
              controller.enqueue(encoder.encode(text));
            }
          }
          if (dbUrl && inquiryId) {
            const sql = neon(dbUrl);
            const updatedMessages = [
              ...messages,
              { role: 'assistant' as const, content: fullContent },
            ];
            await sql`
              UPDATE chat_inquiries
              SET messages = ${JSON.stringify(updatedMessages)}::jsonb,
                  "updatedAt" = NOW()
              WHERE id = ${inquiryId}::uuid
            `;
          }
          controller.enqueue(encoder.encode(`\n\x00DATA:${JSON.stringify({ done: true, inquiryId })}\n`));
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Chat request failed' },
      { status: 500 }
    );
  }
}
