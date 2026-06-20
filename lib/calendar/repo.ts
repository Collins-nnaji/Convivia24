// Calendar data access — Postgres-backed (Neon).

import sql from '@/lib/db';
import type { CalendarInvitee, CalendarItem } from '@/lib/calendar/buffers';

function toItem(t: Record<string, unknown>, invitees: CalendarInvitee[] = []): CalendarItem {
  return {
    id: String(t.id),
    title: String(t.title),
    starts_at: new Date(t.starts_at as string).toISOString(),
    ends_at: new Date(t.ends_at as string).toISOString(),
    priority: t.priority as CalendarItem['priority'],
    kind: (t.kind as CalendarItem['kind']) || 'task',
    location: (t.location as string) ?? null,
    notes: (t.notes as string) ?? null,
    is_rest_block: !!t.is_rest_block,
    source: t.source as CalendarItem['source'],
    status: t.status as CalendarItem['status'],
    invitees,
  };
}

function toInvitee(i: Record<string, unknown>): CalendarInvitee {
  return { id: String(i.id), name: String(i.name), email: (i.email as string | null) ?? null, status: i.status as CalendarInvitee['status'] };
}

export interface NewItemInput {
  title: string;
  starts_at: string;
  ends_at: string;
  priority?: string;
  kind?: string;
  location?: string | null;
  notes?: string | null;
  invitees?: { name: string; email?: string }[];
}

export async function listRange(userId: string, startIso: string, endIso: string): Promise<CalendarItem[]> {
  const tasks = await sql`
    SELECT id, title, starts_at, ends_at, priority, kind, location, notes, is_rest_block, source, status
    FROM personal_tasks
    WHERE user_id = ${userId} AND starts_at >= ${startIso} AND starts_at <= ${endIso}
  `;
  const taskIds = tasks.map((t) => String(t.id));
  const invitees = taskIds.length
    ? await sql`SELECT id, task_id, name, email, status FROM personal_task_invitees WHERE task_id = ANY(${taskIds})`
    : [];
  const byTask = new Map<string, CalendarInvitee[]>();
  for (const inv of invitees) {
    const key = String(inv.task_id);
    if (!byTask.has(key)) byTask.set(key, []);
    byTask.get(key)!.push(toInvitee(inv));
  }
  return tasks.map((t) => toItem(t, byTask.get(String(t.id)) ?? []));
}

export async function getItem(userId: string, id: string): Promise<CalendarItem | null> {
  const [row] = await sql`
    SELECT id, title, starts_at, ends_at, priority, kind, location, notes, is_rest_block, source, status
    FROM personal_tasks WHERE id = ${id} AND user_id = ${userId}
  `;
  if (!row) return null;
  const invitees = await sql`SELECT id, name, email, status FROM personal_task_invitees WHERE task_id = ${id}`;
  return toItem(row, invitees.map(toInvitee));
}

export async function createItem(userId: string, input: NewItemInput): Promise<CalendarItem> {
  const guests = (input.invitees ?? []).filter((g) => g.name?.trim()).slice(0, 20);

  const [task] = await sql`
    INSERT INTO personal_tasks (user_id, title, starts_at, ends_at, priority, kind, location, notes, source)
    VALUES (${userId}, ${input.title.trim()}, ${input.starts_at}, ${input.ends_at}, ${input.priority || 'normal'}, ${input.kind || 'task'}, ${input.location?.trim() || null}, ${input.notes?.trim() || null}, 'manual')
    RETURNING id, title, starts_at, ends_at, priority, kind, location, notes, is_rest_block, source, status
  `;
  const invitees: CalendarInvitee[] = [];
  for (const g of guests) {
    const [row] = await sql`
      INSERT INTO personal_task_invitees (task_id, name, email)
      VALUES (${task.id}, ${g.name.trim()}, ${g.email?.trim() || null})
      RETURNING id, name, email, status
    `;
    invitees.push(toInvitee(row));
  }
  return toItem(task, invitees);
}

export async function updateItem(userId: string, id: string, patch: Partial<NewItemInput> & { status?: string }): Promise<CalendarItem | null> {
  const [task] = await sql`
    UPDATE personal_tasks SET
      title      = COALESCE(${patch.title ?? null}, title),
      starts_at  = COALESCE(${patch.starts_at ?? null}, starts_at),
      ends_at    = COALESCE(${patch.ends_at ?? null}, ends_at),
      priority   = COALESCE(${patch.priority ?? null}, priority),
      kind       = COALESCE(${patch.kind ?? null}, kind),
      location   = COALESCE(${patch.location ?? null}, location),
      notes      = COALESCE(${patch.notes ?? null}, notes),
      status     = COALESCE(${patch.status ?? null}, status),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id, title, starts_at, ends_at, priority, kind, location, notes, is_rest_block, source, status
  `;
  if (!task) return null;
  const invitees = await sql`SELECT id, name, email, status FROM personal_task_invitees WHERE task_id = ${id}`;
  return toItem(task, invitees.map(toInvitee));
}

export async function deleteItem(userId: string, id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM personal_tasks WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

export async function addInvitee(userId: string, taskId: string, name: string, email: string | null): Promise<CalendarInvitee | null> {
  const [owned] = await sql`SELECT id FROM personal_tasks WHERE id = ${taskId} AND user_id = ${userId}`;
  if (!owned) return null;
  const [row] = await sql`
    INSERT INTO personal_task_invitees (task_id, name, email) VALUES (${taskId}, ${name}, ${email})
    RETURNING id, name, email, status
  `;
  return toInvitee(row);
}

export async function removeInvitee(userId: string, taskId: string, inviteeId: string): Promise<void> {
  await sql`
    DELETE FROM personal_task_invitees
    WHERE id = ${inviteeId} AND task_id IN (SELECT id FROM personal_tasks WHERE id = ${taskId} AND user_id = ${userId})
  `;
}
