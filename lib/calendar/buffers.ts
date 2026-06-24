// Pure scheduling logic for the "My 24" calendar — no AI call needed.

export interface CalendarInvitee {
  id: string;
  name: string;
  email: string | null;
  status: 'invited' | 'accepted' | 'declined';
  response_token: string;
}

export type CalendarItemKind = 'task' | 'event' | 'gathering';

export interface CalendarItem {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  priority: 'low' | 'normal' | 'high';
  kind: CalendarItemKind;
  location: string | null;
  notes: string | null;
  is_rest_block: boolean;
  source: 'manual' | 'ai_buffer' | 'ai_destress';
  status: 'active' | 'done' | 'dismissed';
  invitees?: CalendarInvitee[];
}

const REST_BLOCK_MINUTES = 15;
const BACK_TO_BACK_THRESHOLD_MINUTES = 10;

/**
 * Scans a day's items (already sorted or not) and inserts a 15-minute "Rest"
 * block wherever two items are back-to-back (gap below the threshold).
 * Does not mutate input; returns a new merged, time-sorted array.
 */
export function insertRestBuffers(items: CalendarItem[]): CalendarItem[] {
  const sorted = [...items]
    .filter((i) => i.status === 'active')
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));

  const result: CalendarItem[] = [];

  for (let i = 0; i < sorted.length; i++) {
    result.push(sorted[i]);
    const current = sorted[i];
    const next = sorted[i + 1];
    if (!next) continue;

    const gapMinutes = (+new Date(next.starts_at) - +new Date(current.ends_at)) / 60000;
    if (gapMinutes >= 0 && gapMinutes < BACK_TO_BACK_THRESHOLD_MINUTES) {
      const restStart = new Date(current.ends_at);
      const restEnd = new Date(restStart.getTime() + REST_BLOCK_MINUTES * 60000);
      result.push({
        id: `rest-${current.id}-${next.id}`,
        title: 'Rest',
        starts_at: restStart.toISOString(),
        ends_at: restEnd.toISOString(),
        priority: 'normal',
        kind: 'task',
        location: null,
        notes: null,
        is_rest_block: true,
        source: 'ai_buffer',
        status: 'active',
      });
    }
  }

  return result;
}

const FULL_DAY_LOAD_HOURS = 8;

/**
 * Returns 0..1 — how "stacked" a day is, based on total scheduled time
 * against a realistic full day (default 8h of active commitments).
 */
export function dayLoadRatio(items: CalendarItem[], capHours = FULL_DAY_LOAD_HOURS): number {
  const capMinutes = capHours * 60;
  if (capMinutes <= 0) return 0;
  const busyMinutes = items
    .filter((i) => !i.is_rest_block && i.status === 'active')
    .reduce((sum, i) => sum + Math.max(0, (+new Date(i.ends_at) - +new Date(i.starts_at)) / 60000), 0);
  return Math.max(0, Math.min(1, busyMinutes / capMinutes));
}
