import { EVENT_TAGS, mergeEvents, resolveEvent, type EventTag, type NightEvent, type ResolvedEvent } from '@/lib/events/catalog';

const KEY = 'convivia_created_events';

export type CreatedEvent = NightEvent & {
  startsAtIso: string;
  endsAtIso: string;
  source: 'admin';
  published: boolean;
};

function load(): CreatedEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CreatedEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(rows: CreatedEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function listCreatedEvents(): CreatedEvent[] {
  return load().sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso));
}

export function listPublishedCreated(): NightEvent[] {
  return load().filter((e) => e.published !== false);
}

export function upsertCreatedEvent(input: Omit<CreatedEvent, 'source' | 'id'> & { id?: string }): CreatedEvent {
  const all = load();
  const id = input.id || `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const row: CreatedEvent = {
    ...input,
    id,
    source: 'admin',
    tag: EVENT_TAGS.includes(input.tag) ? input.tag : 'Lounge',
    published: input.published !== false,
  };
  const idx = all.findIndex((e) => e.id === id);
  if (idx >= 0) all[idx] = row;
  else all.unshift(row);
  save(all);
  return row;
}

export function deleteCreatedEvent(id: string) {
  save(load().filter((e) => e.id !== id));
}

export function createdAsResolved(): ResolvedEvent[] {
  return listPublishedCreated().map(resolveEvent).filter(Boolean) as ResolvedEvent[];
}

export function feedEvents(): ResolvedEvent[] {
  return mergeEvents(listPublishedCreated());
}

export function findFeedEvent(id: string): ResolvedEvent | undefined {
  return feedEvents().find((e) => e.id === id);
}
