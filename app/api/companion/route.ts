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
 * Heuristic planner used when no AI is configured (or as a fallback) — turns
 * a plan dump into a basic prioritised board + a time-blocked schedule for
 * tomorrow, so "Generate plan" is genuinely useful out of the box.
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

/** Trims/validates a raw dashboard (model or heuristic output) down to something safe to store/render. */
function cleanDashboard(d: Dashboard | null | undefined): Dashboard | null {
  if (!d) return null;
  const cleanList = (list?: PriorityItem[]) =>
    (list || [])
      .filter((i) => i?.title?.trim())
      .slice(0, 5)
      .map((i) => ({ title: String(i.title).slice(0, 140), why: i.why ? String(i.why).slice(0, 140) : undefined }));
  const schedule = (d.schedule || [])
    .filter((b) => b?.title?.trim() && b?.starts_at && b?.ends_at)
    .slice(0, 8)
    .map((b) => ({ title: String(b.title).slice(0, 140), starts_at: b.starts_at, ends_at: b.ends_at, priority: b.priority || 'normal' }));
  const focus = cleanList(d.focus);
  const deprioritize = cleanList(d.deprioritize);
  const stop = cleanList(d.stop);
  if (!schedule.length && !focus.length && !deprioritize.length && !stop.length) return null;
  return {
    summary: d.summary ? String(d.summary).slice(0, 240) : undefined,
    focus,
    deprioritize,
    stop,
    schedule,
  };
}

/**
 * POST /api/companion — { message, conversation_id? } for a normal chat turn,
 * or { action: 'generate_plan', conversation_id } to build/refresh the
 * prioritised plan from the whole conversation. The plan is only ever built
 * on that explicit request — never injected automatically into a chat reply
 * — and the user must separately choose to add it to their calendar.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const rl = await rateLimit(`companion:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Slow down a little — try again shortly.' }, { status: 429 });

    const body = await req.json();
    await ensureSchema();

    if (body?.action === 'generate_plan') {
      const conversationId = typeof body?.conversation_id === 'string' ? body.conversation_id : null;
      return await handleGeneratePlan(user.id, conversationId);
    }

    return await handleChat(user.id, body);
  } catch (err) {
    console.error('[POST /api/companion]', err);
    return NextResponse.json({ error: 'Could not reach your companion right now.' }, { status: 500 });
  }
}

async function handleChat(userId: string, body: { message?: string; conversation_id?: string }) {
  const message = body?.message;
  if (!message?.trim()) return NextResponse.json({ error: 'Say something first.' }, { status: 400 });

  let conversationId: string | null = typeof body?.conversation_id === 'string' ? body.conversation_id : null;
  if (conversationId) {
    const conv = await getConversation(userId, conversationId);
    if (!conv) conversationId = null;
  }
  if (!conversationId) {
    const conv = await createConversation(userId, titleFromMessage(message));
    conversationId = conv.id;
  }

  await sql`INSERT INTO companion_messages (user_id, conversation_id, role, content) VALUES (${userId}, ${conversationId}, 'user', ${message.trim()})`;
  await touchConversation(userId, conversationId, titleFromMessage(message));

  // Full thread (this conversation only) gives the companion context — not just this message.
  const history = await sql`
    SELECT role, content FROM companion_messages
    WHERE user_id = ${userId} AND conversation_id = ${conversationId}
    ORDER BY created_at DESC LIMIT 40
  `;
  const memory = await sql`
    SELECT key, value FROM companion_memory WHERE user_id = ${userId} ORDER BY updated_at DESC LIMIT 40
  `;
  const memoryLines = memory.map((m) => `${m.key}: ${m.value}`).join('\n');
  const recentTurns = [...history].reverse();

  if (!aiConfigured()) {
    const reply = "I'm listening — tell me everything you're juggling. When you're ready, press “Generate plan” and I'll sort it into what to focus on, what can wait, and what to drop.";
    await sql`INSERT INTO companion_messages (user_id, conversation_id, role, content) VALUES (${userId}, ${conversationId}, 'assistant', ${reply})`;
    await touchConversation(userId, conversationId);
    return NextResponse.json({ reply, suggested_tasks: [], conversation_id: conversationId });
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
  "suggested_tasks": [{"title": "...", "starts_at": "ISO datetime", "ends_at": "ISO datetime", "priority": "low|normal|high"}]
}
Only include "facts" for genuinely new, durable information about the person (preferences, people in their life, routines, goals, stressors) — not small talk.
Keep this a natural, flowing conversation — ask questions, react, help them think out loud. Only include "suggested_tasks" if they explicitly asked you to schedule one or two specific things right now. Don't try to build a full day plan here; the user asks for that explicitly (a separate "Generate plan" action) when they're ready, so just focus on being a good conversational partner.`;

  const raw = await chat({
    messages: [
      { role: 'system', content: system },
      ...recentTurns.map((m) => ({ role: m.role as 'user' | 'assistant', content: String(m.content) })),
    ],
    temperature: 0.7,
    maxTokens: 700,
    json: true,
  });

  let parsed: { reply?: string; facts?: { key: string; value: string }[]; suggested_tasks?: SuggestedTask[] };
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
  await sql`INSERT INTO companion_messages (user_id, conversation_id, role, content) VALUES (${userId}, ${conversationId}, 'assistant', ${reply})`;
  await touchConversation(userId, conversationId);

  for (const fact of (parsed.facts || []).slice(0, 5)) {
    if (!fact?.key || !fact?.value) continue;
    await sql`
      INSERT INTO companion_memory (user_id, key, value)
      VALUES (${userId}, ${fact.key.slice(0, 80)}, ${fact.value.slice(0, 300)})
      ON CONFLICT (user_id, LOWER(key)) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }

  const suggestedTasks = (parsed.suggested_tasks || []).slice(0, 5);
  return NextResponse.json({ reply, suggested_tasks: suggestedTasks, conversation_id: conversationId });
}

const NOT_ENOUGH_YET = "I don't have quite enough to go on yet — tell me a bit more about what's on your plate, then try again.";

async function handleGeneratePlan(userId: string, conversationId: string | null) {
  if (!conversationId) {
    return NextResponse.json({ error: 'Tell me a bit about your day first, then generate a plan.' }, { status: 400 });
  }
  const conv = await getConversation(userId, conversationId);
  if (!conv) return NextResponse.json({ error: 'Chat not found.' }, { status: 404 });

  const history = await sql`
    SELECT role, content FROM companion_messages
    WHERE user_id = ${userId} AND conversation_id = ${conversationId}
    ORDER BY created_at DESC LIMIT 60
  `;
  if (!history.length) {
    return NextResponse.json({ error: 'Tell me a bit about your day first, then generate a plan.' }, { status: 400 });
  }

  const memory = await sql`
    SELECT key, value FROM companion_memory WHERE user_id = ${userId} ORDER BY updated_at DESC LIMIT 40
  `;
  const memoryLines = memory.map((m) => `${m.key}: ${m.value}`).join('\n');
  const recentTurns = [...history].reverse();
  const conversationText = recentTurns.filter((m) => m.role === 'user').map((m) => String(m.content)).join('\n');

  if (!aiConfigured()) {
    const dashboard = cleanDashboard(heuristicDashboard(conversationText));
    if (!dashboard) return NextResponse.json({ dashboard: null, message: NOT_ENOUGH_YET });
    return NextResponse.json({ dashboard, conversation_id: conversationId });
  }

  const now = new Date().toISOString();
  const system = `You are the user's personal companion inside Convivia24, a de-stressing calendar app. You're building a LIVING plan from EVERYTHING discussed in this conversation so far — not just the latest message.

What you know about this person:
${memoryLines || '(nothing yet)'}

Current time: ${now}

Respond ONLY with strict JSON:
{
  "dashboard": {
    "summary": "one warm sentence framing their day/week",
    "focus": [{"title": "the few things that truly matter now", "why": "short reason"}],
    "deprioritize": [{"title": "things that can wait", "why": "short reason"}],
    "stop": [{"title": "things to drop or say no to", "why": "short reason"}],
    "schedule": [{"title": "...", "starts_at": "ISO datetime", "ends_at": "ISO datetime", "priority": "low|normal|high"}]
  }
}
Build the plan from the whole conversation. Aim for 2-4 focus items, what to deprioritize, what to stop/drop, and a realistic time-blocked "schedule" for the relevant day (default to today/tomorrow from context, always include a protected downtime block). Keep each list short and specific. If there genuinely isn't enough shared yet to plan from, respond with {"dashboard": null}.`;

  let dashboard: Dashboard | null = null;
  try {
    const raw = await chat({
      messages: [
        { role: 'system', content: system },
        ...recentTurns.map((m) => ({ role: m.role as 'user' | 'assistant', content: String(m.content) })),
      ],
      temperature: 0.6,
      maxTokens: 1200,
      json: true,
    });
    let parsed: { dashboard?: Dashboard | null };
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }
    dashboard = cleanDashboard(parsed.dashboard);
  } catch (err) {
    // AI hiccup — fall back to the heuristic planner below rather than failing outright.
    console.error('[POST /api/companion generate_plan]', err);
  }

  if (!dashboard) dashboard = cleanDashboard(heuristicDashboard(conversationText));
  if (!dashboard) return NextResponse.json({ dashboard: null, message: NOT_ENOUGH_YET });

  return NextResponse.json({ dashboard, conversation_id: conversationId });
}
