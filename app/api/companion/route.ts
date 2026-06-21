import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { chat, aiConfigured } from '@/lib/ai/azure';
import { rateLimit, clientIp } from '@/lib/redis';

/** GET /api/companion — load recent chat history. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const messages = await sql`
      SELECT id, role, content, created_at FROM companion_messages
      WHERE user_id = ${user.id} ORDER BY created_at ASC LIMIT 100
    `;
    return NextResponse.json({ messages });
  } catch (err) {
    console.error('[GET /api/companion]', err);
    return NextResponse.json({ error: 'Could not load your conversation.' }, { status: 500 });
  }
}

interface SuggestedTask { title: string; starts_at: string; ends_at: string; priority: 'low' | 'normal' | 'high' }
interface PriorityItem { title: string; why?: string }
interface ScheduleBlock { title: string; starts_at: string; ends_at: string; priority: 'low' | 'normal' | 'high' }
interface Dashboard {
  summary?: string;
  focus?: PriorityItem[];
  deprioritize?: PriorityItem[];
  stop?: PriorityItem[];
  schedule?: ScheduleBlock[];
}

/**
 * POST /api/companion — send a message to the companion. It remembers facts
 * about the user across conversations and may suggest calendar items (the
 * user must explicitly add them — nothing is written to the calendar here).
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const rl = await rateLimit(`companion:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Slow down a little — try again shortly.' }, { status: 429 });

    const { message } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: 'Say something first.' }, { status: 400 });

    await sql`INSERT INTO companion_messages (user_id, role, content) VALUES (${user.id}, 'user', ${message.trim()})`;

    const history = await sql`
      SELECT role, content FROM companion_messages
      WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 20
    `;
    const memory = await sql`
      SELECT key, value FROM companion_memory WHERE user_id = ${user.id} ORDER BY updated_at DESC LIMIT 40
    `;

    const memoryLines = memory.map((m) => `${m.key}: ${m.value}`).join('\n');
    const recentTurns = [...history].reverse();

    if (!aiConfigured()) {
      const reply = "I'm listening — once the AI is configured I'll remember more about you and help plan your day, but for now: noted.";
      await sql`INSERT INTO companion_messages (user_id, role, content) VALUES (${user.id}, 'assistant', ${reply})`;
      return NextResponse.json({ reply, suggested_tasks: [], dashboard: null });
    }

    const now = new Date().toISOString();
    const system = `You are the user's personal companion inside Convivia24, a de-stressing calendar app. You remember things about them across conversations and use that to help plan a calmer, prioritised day. Be warm, brief, conversational — never clinical or corporate.

What you know about this person so far:
${memoryLines || '(nothing yet — this may be one of your first conversations)'}

Current time: ${now}

Respond ONLY with strict JSON:
{
  "reply": "your conversational reply, 1-4 sentences",
  "facts": [{"key": "short_fact_label", "value": "what you learned, in their words"}],
  "suggested_tasks": [{"title": "...", "starts_at": "ISO datetime", "ends_at": "ISO datetime", "priority": "low|normal|high"}],
  "dashboard": {
    "summary": "one warm sentence framing their day/week",
    "focus": [{"title": "the few things that truly matter now", "why": "short reason"}],
    "deprioritize": [{"title": "things that can wait", "why": "short reason"}],
    "stop": [{"title": "things to drop or say no to", "why": "short reason"}],
    "schedule": [{"title": "...", "starts_at": "ISO datetime", "ends_at": "ISO datetime", "priority": "low|normal|high"}]
  }
}
Only include "facts" for genuinely new, durable information about the person (preferences, people in their life, routines, goals, stressors) — not small talk.
Build the "dashboard" whenever the user describes several plans, tasks, or what they're juggling — turn their dump into a clear, prioritised picture: 2-4 focus items, what to deprioritize, what to stop/drop, and a realistic time-blocked "schedule" for the relevant day (default to today/tomorrow based on context, always include a protected downtime block). Keep each list short and specific. If they're just chatting and there's nothing to organise, omit "dashboard" entirely (use null) and reply conversationally.
Only include "suggested_tasks" if they explicitly asked you to schedule one or two specific things; otherwise prefer the dashboard's "schedule". Omit timing you're unsure of and ask a clarifying question in your reply instead.`;

    const raw = await chat({
      messages: [
        { role: 'system', content: system },
        ...recentTurns.map((m) => ({ role: m.role as 'user' | 'assistant', content: String(m.content) })),
      ],
      temperature: 0.7,
      json: true,
    });

    let parsed: { reply?: string; facts?: { key: string; value: string }[]; suggested_tasks?: SuggestedTask[]; dashboard?: Dashboard | null };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { reply: raw || "I'm here." };
    }

    const reply = parsed.reply || "I'm here.";
    await sql`INSERT INTO companion_messages (user_id, role, content) VALUES (${user.id}, 'assistant', ${reply})`;

    for (const fact of (parsed.facts || []).slice(0, 5)) {
      if (!fact?.key || !fact?.value) continue;
      await sql`
        INSERT INTO companion_memory (user_id, key, value)
        VALUES (${user.id}, ${fact.key.slice(0, 80)}, ${fact.value.slice(0, 300)})
        ON CONFLICT (user_id, LOWER(key)) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `;
    }

    const suggestedTasks = (parsed.suggested_tasks || []).slice(0, 5);

    let dashboard: Dashboard | null = null;
    const d = parsed.dashboard;
    if (d && (d.focus?.length || d.deprioritize?.length || d.stop?.length || d.schedule?.length)) {
      const cleanList = (list?: PriorityItem[]) =>
        (list || [])
          .filter((i) => i?.title?.trim())
          .slice(0, 5)
          .map((i) => ({ title: String(i.title).slice(0, 140), why: i.why ? String(i.why).slice(0, 140) : undefined }));
      dashboard = {
        summary: d.summary ? String(d.summary).slice(0, 240) : undefined,
        focus: cleanList(d.focus),
        deprioritize: cleanList(d.deprioritize),
        stop: cleanList(d.stop),
        schedule: (d.schedule || [])
          .filter((b) => b?.title?.trim() && b?.starts_at && b?.ends_at)
          .slice(0, 8)
          .map((b) => ({ title: String(b.title).slice(0, 140), starts_at: b.starts_at, ends_at: b.ends_at, priority: b.priority || 'normal' })),
      };
    }

    return NextResponse.json({ reply, suggested_tasks: suggestedTasks, dashboard });
  } catch (err) {
    console.error('[POST /api/companion]', err);
    return NextResponse.json({ error: 'Could not reach your companion right now.' }, { status: 500 });
  }
}
