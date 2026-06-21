import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { chat, aiConfigured } from '@/lib/ai/azure';
import { rateLimit, clientIp } from '@/lib/redis';
import {
  ensureSchema,
  getConversation,
  getMessages,
  createConversation,
  touchConversation,
  titleFromMessage,
} from '@/lib/companion/conversations';

/** GET /api/companion?conversation=ID — load a chat thread's messages. */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const conversationId = req.nextUrl.searchParams.get('conversation');
  try {
    if (!conversationId) return NextResponse.json({ messages: [] });
    const conv = await getConversation(user.id, conversationId);
    if (!conv) return NextResponse.json({ error: 'Chat not found.' }, { status: 404 });
    const messages = await getMessages(user.id, conversationId);
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

const HIGH_HINTS = /\b(urgent|asap|today|deadline|due|important|must|critical|priority|finish|submit|pay|call|reply|email back)\b/i;
const LOW_HINTS = /\b(maybe|someday|eventually|later|optional|whenever|at some point|nice to have|if i have time)\b/i;
const STOP_HINTS = /\b(stop|quit|drop|cancel|avoid|stop doing|say no|too much|overwhelm|distract|procrastinat|scroll)\b/i;

/** Split a free-text "brain dump" into individual task-like phrases. */
function splitTasks(message: string): string[] {
  return message
    .split(/[\n;]|,\s| and | then |•|\d+[.)]\s|- /gi)
    .map((s) => s.trim().replace(/^(i (need|have|want|should|must) to|i'?m|to)\s+/i, '').trim())
    .filter((s) => s.length > 2 && s.length < 120)
    .slice(0, 12);
}

/**
 * Heuristic planner used when no AI is configured — turns a plan dump into a
 * basic prioritised board + a time-blocked schedule for tomorrow, so the
 * companion is genuinely useful out of the box.
 */
function heuristicDashboard(message: string): Dashboard | null {
  const tasks = splitTasks(message);
  if (tasks.length < 2) return null;

  const focus: PriorityItem[] = [];
  const deprioritize: PriorityItem[] = [];
  const stop: PriorityItem[] = [];
  for (const t of tasks) {
    if (STOP_HINTS.test(t)) stop.push({ title: t });
    else if (LOW_HINTS.test(t)) deprioritize.push({ title: t });
    else if (HIGH_HINTS.test(t)) focus.push({ title: t, why: 'Looks time-sensitive.' });
    else (focus.length < 3 ? focus : deprioritize).push({ title: t });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const schedule: ScheduleBlock[] = focus.slice(0, 4).map((item, i) => {
    const starts = new Date(tomorrow.getTime() + i * 90 * 60000);
    const ends = new Date(starts.getTime() + 60 * 60000);
    return { title: item.title, starts_at: starts.toISOString(), ends_at: ends.toISOString(), priority: 'high' };
  });
  const downStart = new Date(tomorrow); downStart.setHours(20, 30, 0, 0);
  const downEnd = new Date(tomorrow); downEnd.setHours(22, 0, 0, 0);
  schedule.push({ title: 'Protected downtime', starts_at: downStart.toISOString(), ends_at: downEnd.toISOString(), priority: 'low' });

  return {
    summary: `Here's a calmer shape for what you're juggling — ${focus.length} to focus on first.`,
    focus: focus.slice(0, 4),
    deprioritize: deprioritize.slice(0, 4),
    stop: stop.slice(0, 4),
    schedule,
  };
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

    const body = await req.json();
    const message: string = body?.message;
    if (!message?.trim()) return NextResponse.json({ error: 'Say something first.' }, { status: 400 });

    await ensureSchema();

    // Resolve (or create) the conversation this message belongs to.
    let conversationId: string | null = typeof body?.conversation_id === 'string' ? body.conversation_id : null;
    if (conversationId) {
      const conv = await getConversation(user.id, conversationId);
      if (!conv) conversationId = null;
    }
    if (!conversationId) {
      const conv = await createConversation(user.id, titleFromMessage(message));
      conversationId = conv.id;
    }

    await sql`INSERT INTO companion_messages (user_id, conversation_id, role, content) VALUES (${user.id}, ${conversationId}, 'user', ${message.trim()})`;
    await touchConversation(user.id, conversationId, titleFromMessage(message));

    // Full thread (this conversation only) drives the plan — not just this message.
    const history = await sql`
      SELECT role, content FROM companion_messages
      WHERE user_id = ${user.id} AND conversation_id = ${conversationId}
      ORDER BY created_at DESC LIMIT 40
    `;
    const memory = await sql`
      SELECT key, value FROM companion_memory WHERE user_id = ${user.id} ORDER BY updated_at DESC LIMIT 40
    `;

    const memoryLines = memory.map((m) => `${m.key}: ${m.value}`).join('\n');
    const recentTurns = [...history].reverse();
    const conversationText = recentTurns.filter((m) => m.role === 'user').map((m) => String(m.content)).join('\n');

    if (!aiConfigured()) {
      const dashboard = heuristicDashboard(conversationText || message.trim());
      const reply = dashboard
        ? "Here's how I'd line that up so far — focus on the top few first, and I've sketched a plan you can drop into My 24. Tell me more and I'll keep refining it."
        : "I'm listening — tell me everything you're juggling and I'll sort it into what to focus on, what can wait, and what to drop.";
      await sql`INSERT INTO companion_messages (user_id, conversation_id, role, content) VALUES (${user.id}, ${conversationId}, 'assistant', ${reply})`;
      await touchConversation(user.id, conversationId);
      return NextResponse.json({ reply, suggested_tasks: [], dashboard, conversation_id: conversationId });
    }

    const now = new Date().toISOString();
    const system = `You are the user's personal companion inside Convivia24, a de-stressing calendar app. This is an ongoing planning conversation — a back-and-forth, not one-off replies. You remember things about them across conversations and use that to help plan a calmer, prioritised day. Be warm, brief, conversational — never clinical or corporate.

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
The "dashboard" is a LIVING plan for this whole conversation. Build it from EVERYTHING discussed so far across all earlier turns — not only the latest message — and refine the same plan each turn as you learn more (carry items forward, re-rank them, add/remove as the picture changes) rather than starting from scratch. Aim for 2-4 focus items, what to deprioritize, what to stop/drop, and a realistic time-blocked "schedule" for the relevant day (default to today/tomorrow from context, always include a protected downtime block). Keep each list short and specific.
Be an active planner: when a detail would materially improve the plan (a deadline, how long something takes, what matters most, fixed commitments), ASK ONE short clarifying question in "reply" — and still return your best current dashboard reflecting what you know so far, so the plan visibly improves as the conversation continues. Only omit "dashboard" (use null) at the very start when nothing concrete has been shared yet, or in pure small talk.
Only include "suggested_tasks" if they explicitly asked you to schedule one or two specific things; otherwise prefer the dashboard's "schedule".`;

    const raw = await chat({
      messages: [
        { role: 'system', content: system },
        ...recentTurns.map((m) => ({ role: m.role as 'user' | 'assistant', content: String(m.content) })),
      ],
      temperature: 0.7,
      maxTokens: 1600,
      json: true,
    });

    let parsed: { reply?: string; facts?: { key: string; value: string }[]; suggested_tasks?: SuggestedTask[]; dashboard?: Dashboard | null };
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Be forgiving if the model wraps JSON in prose or code fences.
      const match = raw.match(/\{[\s\S]*\}/);
      try {
        parsed = match ? JSON.parse(match[0]) : { reply: raw || "I'm here." };
      } catch {
        parsed = { reply: raw || "I'm here." };
      }
    }

    const reply = parsed.reply || "I'm here.";
    await sql`INSERT INTO companion_messages (user_id, conversation_id, role, content) VALUES (${user.id}, ${conversationId}, 'assistant', ${reply})`;
    await touchConversation(user.id, conversationId);

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

    // Safety net: only salvage a plan if the model neither organised one nor
    // asked a clarifying question (a trailing "?") — so deliberate questions
    // aren't overridden by a premature dashboard.
    if (!dashboard && !reply.includes('?')) dashboard = heuristicDashboard(conversationText);

    return NextResponse.json({ reply, suggested_tasks: suggestedTasks, dashboard, conversation_id: conversationId });
  } catch (err) {
    console.error('[POST /api/companion]', err);
    return NextResponse.json({ error: 'Could not reach your companion right now.' }, { status: 500 });
  }
}
