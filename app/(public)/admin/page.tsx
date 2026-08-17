'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { formatNgn } from '@/lib/drinks/catalog';

type Item = {
  slug: string;
  name: string;
  on_hand: number;
  reserved: number;
  low_stock_threshold: number;
  available: number;
  price_ngn: number | null;
  image_url: string | null;
  source: string;
  active: boolean;
  tracked?: boolean;
};

type AdminEvent = {
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
};

type VenueOption = { slug: string; name: string };

type EventDraft = {
  id?: string;
  title: string;
  venueSlug: string;
  tag: string;
  blurb: string;
  expected: string;
  coverNgn: string;
  startsAtLocal: string;
  endsAtLocal: string;
  published: boolean;
};

const emptyDraft = (venueSlug = '', tag = 'Lounge'): EventDraft => ({
  title: '',
  venueSlug,
  tag,
  blurb: '',
  expected: '',
  coverNgn: '',
  startsAtLocal: '',
  endsAtLocal: '',
  published: true,
});

/** ISO → value for <input type="datetime-local"> in the browser's own zone. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'drinks' | 'events'>('drinks');
  const [items, setItems] = useState<Item[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState<EventDraft>(emptyDraft());
  const [msg, setMsg] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingSlug, setSavingSlug] = useState('');
  const [blobOk, setBlobOk] = useState(false);
  const [aiOk, setAiOk] = useState(false);
  const [eventsError, setEventsError] = useState('');

  const loadStock = useCallback(async () => {
    const res = await fetch('/api/admin/inventory');
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setAuthed(true);
    setItems(data.items || []);
    setBlobOk(Boolean(data.blobConfigured));
    setAiOk(Boolean(data.aiConfigured));
  }, []);

  const loadEvents = useCallback(async () => {
    const res = await fetch('/api/admin/events');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setEventsError(data.error || 'Could not load events.');
      return;
    }
    setEventsError(data.error || '');
    setEvents(data.events || []);
    setVenues(data.venues || []);
    setTags(data.tags || []);
    setDraft((d) => (d.venueSlug ? d : { ...d, venueSlug: data.venues?.[0]?.slug || '' }));
  }, []);

  useEffect(() => {
    loadStock()
      .then(loadEvents)
      .catch(() => setAuthed(false));
  }, [loadStock, loadEvents]);

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', password }),
    });
    setLoading(false);
    if (!res.ok) {
      setMsg('Invalid password');
      return;
    }
    await loadStock();
    await loadEvents();
  }

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setMsg('');
    const fd = new FormData(form);
    const res = await fetch('/api/admin/inventory', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || 'Upload failed');
      return;
    }
    setMsg(`Saved ${data.item?.name}`);
    form.reset();
    await loadStock();
  }

  async function saveStock(slug: string, patch: Record<string, unknown>) {
    setSavingSlug(slug);
    setMsg('');
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'adjust', slug, ...patch }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingSlug('');
    if (!res.ok) {
      setMsg(data.error || 'Could not update stock.');
      return;
    }
    setItems((rows) =>
      rows.map((row) => (row.slug === slug ? { ...row, ...(data.item as Item), tracked: true } : row))
    );
    setMsg(`Updated ${data.item?.name || slug}`);
  }

  async function askAi() {
    setLoading(true);
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ai-list' }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || 'AI unavailable');
      return;
    }
    setAdvice(data.advice || '');
  }

  async function saveEvent(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setEventsError('');
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: draft.id,
        title: draft.title,
        venueSlug: draft.venueSlug,
        tag: draft.tag,
        blurb: draft.blurb,
        expected: draft.expected,
        coverNgn: draft.coverNgn,
        startsAtIso: fromLocalInput(draft.startsAtLocal),
        endsAtIso: fromLocalInput(draft.endsAtLocal),
        published: draft.published,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setEventsError(data.error || 'Could not save event.');
      return;
    }
    setDraft(emptyDraft(venues[0]?.slug || '', tags[0] || 'Lounge'));
    await loadEvents();
  }

  async function togglePublished(event: AdminEvent) {
    setEventsError('');
    const res = await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: event.id, published: !event.published }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setEventsError(data.error || 'Could not update event.');
      return;
    }
    setEvents((rows) => rows.map((r) => (r.id === event.id ? { ...r, published: !event.published } : r)));
  }

  async function removeEvent(event: AdminEvent) {
    if (!window.confirm(`Delete “${event.title}”? This cannot be undone.`)) return;
    setEventsError('');
    const res = await fetch(`/api/admin/events?id=${encodeURIComponent(event.id)}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setEventsError(data.error || 'Could not delete event.');
      return;
    }
    setEvents((rows) => rows.filter((r) => r.id !== event.id));
    setDraft((d) => (d.id === event.id ? emptyDraft(venues[0]?.slug || '', tags[0] || 'Lounge') : d));
  }

  function editEvent(event: AdminEvent) {
    setDraft({
      id: event.id,
      title: event.title,
      venueSlug: event.venueSlug,
      tag: event.tag,
      blurb: event.blurb,
      expected: event.expected,
      coverNgn: event.coverNgn ? String(event.coverNgn) : '',
      startsAtLocal: toLocalInput(event.startsAtIso),
      endsAtLocal: toLocalInput(event.endsAtIso),
      published: event.published,
    });
    setTab('events');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!authed) {
    return (
      <section className="bg-paper min-h-[70vh] px-5 py-16">
        <div className="max-w-md mx-auto bg-white p-8 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-2">Admin</p>
          <h1 className="text-2xl font-bold mb-4">Stock desk</h1>
          <p className="text-sm text-obsidian/50 mb-6">
            Sign in with <code className="text-xs">ADMIN_PASSWORD</code>, or use a Neon Auth account listed in{' '}
            <code className="text-xs">CONVIVIA_ADMIN_EMAILS</code>.
          </p>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2"
            />
            <button type="submit" disabled={loading} className="w-full py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
              {loading ? '…' : 'Enter'}
            </button>
          </form>
          {msg && <p className="text-sm text-ember mt-4">{msg}</p>}
          <p className="text-xs text-obsidian/40 mt-6">
            Or{' '}
            <Link href="/signin?next=/admin" className="text-ember">
              sign in with Neon Auth
            </Link>
            .
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-2">Admin</p>
            <h1 className="text-3xl font-bold">Desk</h1>
            <p className="text-sm text-obsidian/50 mt-1">
              Azure upload {blobOk ? 'ready' : 'not configured'} · OpenAI {aiOk ? 'ready' : 'off'}
            </p>
          </div>
          {tab === 'drinks' && (
            <button
              type="button"
              onClick={askAi}
              disabled={loading || !aiOk}
              className="px-4 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40"
            >
              AI stock advice
            </button>
          )}
        </div>

        <div className="flex gap-1 mb-8 border-b border-obsidian/10">
          {(['drinks', 'events'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] border-b-2 -mb-px transition-colors ${
                tab === key ? 'border-ember text-ember' : 'border-transparent text-obsidian/40 hover:text-obsidian/70'
              }`}
            >
              {key === 'drinks' ? `Drinks (${items.length})` : `Events (${events.length})`}
            </button>
          ))}
        </div>

        {tab === 'drinks' ? (
          <>
            {msg && <p className="text-sm text-ember mb-6">{msg}</p>}
            {advice && (
              <div className="mb-8 bg-white p-5 text-sm text-obsidian/70 leading-relaxed whitespace-pre-wrap shadow-sm">
                {advice}
              </div>
            )}

            <form onSubmit={onUpload} className="bg-white p-6 sm:p-8 mb-12 space-y-4 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
              <h2 className="font-bold">Add / update stock</h2>
              <p className="text-sm text-obsidian/50">
                Upload a bottle image to Azure Storage. New SKUs appear in the shop with live on-hand counts.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field name="name" label="Name" required />
                <Field name="slug" label="Slug (optional)" placeholder="auto-from-name" />
                <Field name="priceNgn" label="Price (NGN)" type="number" required />
                <Field name="onHand" label="On hand" type="number" required />
                <Field name="brand" label="Brand" />
                <Field name="category" label="Category" placeholder="whisky, cognac, spirits…" />
                <Field name="volume" label="Volume" placeholder="70cl" />
                <Field name="abv" label="ABV %" type="number" />
              </div>
              <Field name="tagline" label="Tagline" />
              <Field name="description" label="Description" />
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1.5">
                  Product image
                </label>
                <input name="image" type="file" accept="image/*" className="text-sm" />
              </div>
              <button type="submit" disabled={loading} className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
                {loading ? 'Saving…' : 'Save to shop'}
              </button>
            </form>

            <h2 className="font-bold mb-1">Live stock</h2>
            <p className="text-sm text-obsidian/50 mb-5">
              Edit on-hand counts, price and listing state per SKU. Changes hit the shop straight away.
            </p>
            <div className="space-y-3">
              {items.map((item) => (
                <StockRow
                  key={item.slug}
                  item={item}
                  saving={savingSlug === item.slug}
                  onSave={(patch) => saveStock(item.slug, patch)}
                />
              ))}
              {items.length === 0 && <p className="text-sm text-obsidian/45">No SKUs yet.</p>}
            </div>
          </>
        ) : (
          <>
            {eventsError && <p className="text-sm text-ember mb-6">{eventsError}</p>}

            <form onSubmit={saveEvent} className="bg-white p-6 sm:p-8 mb-12 space-y-4 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-bold">{draft.id ? 'Edit event' : 'Create event'}</h2>
                {draft.id && (
                  <button
                    type="button"
                    onClick={() => setDraft(emptyDraft(venues[0]?.slug || '', tags[0] || 'Lounge'))}
                    className="text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/45 hover:text-obsidian"
                  >
                    New instead
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Title</FieldLabel>
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel>Venue</FieldLabel>
                  <select
                    value={draft.venueSlug}
                    onChange={(e) => setDraft({ ...draft, venueSlug: e.target.value })}
                    required
                    className={inputClass}
                  >
                    <option value="">Select venue…</option>
                    {venues.map((v) => (
                      <option key={v.slug} value={v.slug}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Starts</FieldLabel>
                  <input
                    type="datetime-local"
                    value={draft.startsAtLocal}
                    onChange={(e) => setDraft({ ...draft, startsAtLocal: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel>Ends</FieldLabel>
                  <input
                    type="datetime-local"
                    value={draft.endsAtLocal}
                    onChange={(e) => setDraft({ ...draft, endsAtLocal: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel>Tag</FieldLabel>
                  <select
                    value={draft.tag}
                    onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
                    className={inputClass}
                  >
                    {tags.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Cover (NGN)</FieldLabel>
                  <input
                    type="number"
                    min={0}
                    value={draft.coverNgn}
                    onChange={(e) => setDraft({ ...draft, coverNgn: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel>Expected turnout</FieldLabel>
                  <input
                    value={draft.expected}
                    onChange={(e) => setDraft({ ...draft, expected: e.target.value })}
                    placeholder="~180 in"
                    className={inputClass}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-obsidian/70">
                    <input
                      type="checkbox"
                      checked={draft.published}
                      onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
                      className="rounded border-obsidian/25 text-ember focus:ring-ember"
                    />
                    Published on /events
                  </label>
                </div>
              </div>
              <div>
                <FieldLabel>Blurb</FieldLabel>
                <textarea
                  value={draft.blurb}
                  onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
                  rows={2}
                  className={`${inputClass} resize-y`}
                />
              </div>
              <button type="submit" disabled={loading} className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
                {loading ? 'Saving…' : draft.id ? 'Save changes' : 'Publish event'}
              </button>
            </form>

            <h2 className="font-bold mb-1">Events</h2>
            <p className="text-sm text-obsidian/50 mb-5">
              Unpublished events stay hidden from the public feed. Seeded demo nights are not editable here.
            </p>
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{event.title}</p>
                      <span className="text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 bg-paper text-obsidian/50">
                        {event.tag}
                      </span>
                      {!event.published && (
                        <span className="text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 bg-obsidian text-white">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-obsidian/50 mt-1">
                      {formatWhen(event.startsAtIso)} → {formatWhen(event.endsAtIso)} ·{' '}
                      {venues.find((v) => v.slug === event.venueSlug)?.name || event.venueSlug}
                      {event.coverNgn ? ` · ${formatNgn(event.coverNgn)}` : ''}
                    </p>
                    {event.blurb && <p className="text-[12px] text-obsidian/45 mt-1 line-clamp-2">{event.blurb}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => editEvent(event)}
                      className="px-3 py-2 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublished(event)}
                      className="px-3 py-2 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em]"
                    >
                      {event.published ? 'Hide' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEvent(event)}
                      className="px-3 py-2 border border-ember/40 text-ember text-[10px] font-black uppercase tracking-[0.12em]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {events.length === 0 && !eventsError && (
                <p className="text-sm text-obsidian/45">No events yet — create the first one above.</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

const inputClass =
  'w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2 bg-transparent';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">{children}</label>
  );
}

function StockRow({
  item,
  saving,
  onSave,
}: {
  item: Item;
  saving: boolean;
  onSave: (patch: Record<string, unknown>) => void;
}) {
  const [onHand, setOnHand] = useState(String(item.on_hand));
  const [price, setPrice] = useState(item.price_ngn != null ? String(item.price_ngn) : '');
  const [threshold, setThreshold] = useState(String(item.low_stock_threshold));

  useEffect(() => {
    setOnHand(String(item.on_hand));
    setPrice(item.price_ngn != null ? String(item.price_ngn) : '');
    setThreshold(String(item.low_stock_threshold));
  }, [item.on_hand, item.price_ngn, item.low_stock_threshold]);

  const dirty =
    onHand !== String(item.on_hand) ||
    price !== (item.price_ngn != null ? String(item.price_ngn) : '') ||
    threshold !== String(item.low_stock_threshold);

  const lowStock = item.tracked !== false && item.available <= item.low_stock_threshold;

  return (
    <div className="bg-white p-4 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex items-center gap-3 min-w-0 lg:w-64">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt="" className="w-10 h-12 object-cover shrink-0" />
        ) : (
          <div className="w-10 h-12 bg-paper border border-obsidian/10 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="font-medium truncate">{item.name}</p>
          <p className="text-[11px] text-obsidian/40 font-mono truncate">{item.slug}</p>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] mt-0.5 text-obsidian/35">
            {item.source}
            {item.reserved > 0 ? ` · ${item.reserved} reserved` : ''}
            {lowStock ? ' · low' : ''}
            {!item.active ? ' · off shop' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 flex-1">
        <div>
          <FieldLabel>On hand</FieldLabel>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={onHand}
            onChange={(e) => setOnHand(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel>Price (NGN)</FieldLabel>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel>Low at</FieldLabel>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={saving || !dirty}
          onClick={() =>
            onSave({
              onHand,
              priceNgn: price === '' ? undefined : price,
              lowStockThreshold: threshold,
            })
          }
          className="px-4 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-35"
        >
          {saving ? '…' : 'Save'}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave({ active: !item.active })}
          className="px-3 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40"
        >
          {item.active ? 'Unlist' : 'List'}
        </button>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input name={name} type={type} required={required} placeholder={placeholder} className={inputClass} />
    </div>
  );
}
