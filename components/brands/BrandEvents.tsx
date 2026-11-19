'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Pencil, Plus, Trash2, X } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';

type BrandEvent = {
  id: string;
  title: string;
  venueSlug: string;
  tag: string;
  blurb: string;
  expected: string;
  coverNgn?: number;
  startsAtIso: string;
  endsAtIso: string;
  published: boolean;
  venue?: { name: string; area: string };
};

type Venue = { slug: string; name: string };

type Draft = {
  id?: string;
  title: string;
  venueSlug: string;
  tag: string;
  blurb: string;
  expected: string;
  coverNgn: string;
  startsAt: string;
  endsAt: string;
  published: boolean;
};

/** ISO → value for <input type="datetime-local"> in the viewer's own time zone. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function blankDraft(venues: Venue[], tags: string[]): Draft {
  const start = new Date();
  start.setDate(start.getDate() + 7);
  start.setHours(21, 0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 5);
  return {
    title: '',
    venueSlug: venues[0]?.slug ?? '',
    tag: tags[0] ?? 'Lounge',
    blurb: '',
    expected: '',
    coverNgn: '',
    startsAt: toLocalInput(start.toISOString()),
    endsAt: toLocalInput(end.toISOString()),
    published: true,
  };
}

const field = 'w-full rounded-xl border border-obsidian/12 bg-white px-3 py-2.5 text-base focus:border-ember focus:ring-0 sm:text-sm';
const label = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-obsidian/45';

/** The Events section of the brand portal: everything this brand has posted, plus a form. */
export default function BrandEvents({ brandSlug, brandName, admin }: { brandSlug: string; brandName: string; admin: boolean }) {
  const [events, setEvents] = useState<BrandEvent[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const query = admin ? `?brand=${encodeURIComponent(brandSlug)}` : '';

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/brands/portal/events${query}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setEvents(data.events || []);
      setVenues(data.venues || []);
      setTags(data.tags || []);
      setError('');
    } else setError(data.error || 'Could not load your events.');
    setLoading(false);
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/brands/portal/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: admin ? brandSlug : undefined,
          id: draft.id,
          title: draft.title,
          venueSlug: draft.venueSlug,
          tag: draft.tag,
          blurb: draft.blurb,
          expected: draft.expected,
          coverNgn: draft.coverNgn,
          startsAtIso: new Date(draft.startsAt).toISOString(),
          endsAtIso: new Date(draft.endsAt).toISOString(),
          published: draft.published,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not save the event.');
        return;
      }
      setMsg(draft.id ? 'Event updated.' : draft.published ? 'Event posted — it is now on the events page.' : 'Draft saved.');
      setDraft(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(ev: BrandEvent) {
    if (!window.confirm(`Delete “${ev.title}”? This cannot be undone.`)) return;
    const res = await fetch(`/api/brands/portal/events?id=${encodeURIComponent(ev.id)}${admin ? `&brand=${encodeURIComponent(brandSlug)}` : ''}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || 'Could not delete the event.');
    else {
      setMsg('Event deleted.');
      await load();
    }
  }

  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.endsAtIso).getTime() >= now);
  const past = events.filter((e) => new Date(e.endsAtIso).getTime() < now);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-obsidian/8 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold">{brandName} events</h2>
          <p className="mt-1 max-w-lg text-sm text-obsidian/55">
            Tastings, launches and brand nights. Published events show on the{' '}
            <Link href="/events" className="font-semibold text-ember">events page</Link> straight away.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setMsg('');
            setDraft(blankDraft(venues, tags));
          }}
          disabled={loading || venues.length === 0}
          className="btn-brand inline-flex shrink-0 items-center gap-2 self-start rounded-full px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] disabled:opacity-40 sm:self-auto"
        >
          <Plus size={14} /> Post an event
        </button>
      </section>

      {msg && <p className="text-sm text-ember">{msg}</p>}
      {error && !draft && <p className="text-sm text-ember">{error}</p>}

      {draft && (
        <form onSubmit={save} className="space-y-4 rounded-2xl border border-ember/25 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-bold">{draft.id ? 'Edit event' : 'New event'}</h3>
            <button type="button" aria-label="Close form" onClick={() => setDraft(null)} className="text-obsidian/40 hover:text-obsidian">
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={label}>Title</span>
              <input required maxLength={140} className={field} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder={`${brandName} tasting night`} />
            </label>
            <label>
              <span className={label}>Venue</span>
              <select className={field} value={draft.venueSlug} onChange={(e) => setDraft({ ...draft, venueSlug: e.target.value })}>
                {venues.map((v) => (
                  <option key={v.slug} value={v.slug}>{v.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span className={label}>Type</span>
              <select className={field} value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value })}>
                {tags.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              <span className={label}>Starts</span>
              <input required type="datetime-local" className={field} value={draft.startsAt} onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} />
            </label>
            <label>
              <span className={label}>Ends</span>
              <input required type="datetime-local" className={field} value={draft.endsAt} onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })} />
            </label>
            <label className="sm:col-span-2">
              <span className={label}>Description</span>
              <textarea rows={3} maxLength={600} className={field} value={draft.blurb} onChange={(e) => setDraft({ ...draft, blurb: e.target.value })} placeholder="What guests can expect — pours, music, dress code." />
            </label>
            <label>
              <span className={label}>Entry (₦, optional)</span>
              <input type="number" min={0} inputMode="numeric" className={field} value={draft.coverNgn} onChange={(e) => setDraft({ ...draft, coverNgn: e.target.value })} placeholder="Free" />
            </label>
            <label>
              <span className={label}>Expected crowd (optional)</span>
              <input maxLength={60} className={field} value={draft.expected} onChange={(e) => setDraft({ ...draft, expected: e.target.value })} placeholder="~120 in" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
            Publish on the events page
          </label>
          {error && <p className="text-sm text-ember">{error}</p>}
          <div className="flex gap-3">
            <button disabled={saving} className="btn-brand rounded-full px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] disabled:opacity-40">
              {saving ? 'Saving…' : draft.id ? 'Save changes' : draft.published ? 'Post event' : 'Save draft'}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="rounded-full border border-obsidian/15 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-obsidian/45">Loading events…</p>
      ) : (
        <>
          <EventList
            title="Upcoming"
            events={upcoming}
            empty="No upcoming events. Post one and it appears on the events page."
            onEdit={(ev) =>
              setDraft({
                id: ev.id,
                title: ev.title,
                venueSlug: ev.venueSlug,
                tag: ev.tag,
                blurb: ev.blurb,
                expected: ev.expected,
                coverNgn: ev.coverNgn ? String(ev.coverNgn) : '',
                startsAt: toLocalInput(ev.startsAtIso),
                endsAt: toLocalInput(ev.endsAtIso),
                published: ev.published,
              })
            }
            onDelete={remove}
          />
          {past.length > 0 && <EventList title="Past" events={past} onDelete={remove} />}
        </>
      )}
    </div>
  );
}

function EventList({
  title,
  events,
  empty,
  onEdit,
  onDelete,
}: {
  title: string;
  events: BrandEvent[];
  empty?: string;
  onEdit?: (ev: BrandEvent) => void;
  onDelete: (ev: BrandEvent) => void;
}) {
  return (
    <section className="rounded-2xl border border-obsidian/8 bg-white">
      <h3 className="border-b border-obsidian/8 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-obsidian/50">{title}</h3>
      {events.length === 0 && empty && <p className="px-5 py-8 text-sm text-obsidian/45">{empty}</p>}
      <ul className="divide-y divide-obsidian/6">
        {events.map((ev) => (
          <li key={ev.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ember/10 text-ember">
              <CalendarDays size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {ev.title}
                {!ev.published && <span className="ml-2 rounded-full bg-obsidian/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-obsidian/50">Draft</span>}
              </p>
              <p className="text-[12px] text-obsidian/50">
                {new Date(ev.startsAtIso).toLocaleString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                {ev.venue ? ` · ${ev.venue.name}` : ''}
                {ev.coverNgn ? ` · ${formatNgn(ev.coverNgn)}` : ' · Free entry'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {ev.published && (
                <Link href={`/events/${ev.id}`} className="text-[11px] font-bold uppercase tracking-[0.1em] text-obsidian/50 hover:text-ember">
                  View
                </Link>
              )}
              {onEdit && (
                <button type="button" aria-label={`Edit ${ev.title}`} onClick={() => onEdit(ev)} className="grid h-8 w-8 place-items-center rounded-full border border-obsidian/10 text-obsidian/55 hover:text-ember">
                  <Pencil size={14} />
                </button>
              )}
              <button type="button" aria-label={`Delete ${ev.title}`} onClick={() => onDelete(ev)} className="grid h-8 w-8 place-items-center rounded-full border border-obsidian/10 text-obsidian/55 hover:text-ember">
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
