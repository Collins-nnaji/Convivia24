'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatNgn } from '@/lib/drinks/catalog';
import { getPackageBySlug, resolveComponents } from '@/lib/packages/catalog';
import SourcingDesk from '@/components/admin/SourcingDesk';
import PriceListImport from '@/components/admin/PriceListImport';
import ReferralsDesk from '@/components/admin/ReferralsDesk';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/commerce/status';

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
  brand?: string | null;
  category?: string | null;
  volume?: string | null;
  abv?: number | null;
  tagline?: string | null;
  description?: string | null;
  taste_note?: string | null;
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

type TriviaWeek = {
  id: string;
  roundSlug: string;
  weekStart: string;
  weekEnd: string;
  published: boolean;
  live: boolean;
};

type RoundOption = { slug: string; brand: string; prizeLabel: string };

type TriviaEntry = {
  id: string;
  code: string;
  roundSlug: string;
  brand: string;
  name: string;
  email: string;
  phone: string | null;
  score: number;
  total: number;
  status: string;
  createdAt: string;
};

type AdminOrder = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  status: OrderStatus;
  subtotalNgn: number;
  loyaltyDiscountNgn: number;
  giftCardDiscountNgn: number;
  totalNgn: number;
  addressLine1: string;
  addressLine2: string | null;
  area: string | null;
  notes: string | null;
  courierName: string | null;
  riderPhone: string | null;
  etaAt: string | null;
  trackingNote: string | null;
  paymentProvider: string | null;
  paymentRef: string | null;
  refundRef: string | null;
  refundedNgn: number;
  supplierId: string | null;
  supplierName: string | null;
  supplierCostNgn: number | null;
  sourcedAt: string | null;
  sourcingNote: string | null;
  margin: { revenueNgn: number; costNgn: number; marginNgn: number; marginPct: number; sourced: boolean };
  createdAt: string;
  updatedAt: string;
  items: { slug?: string; name: string; qty: number; unitPriceNgn: number }[];
};

type GiftCard = {
  id: string;
  code: string;
  valueNgn: number;
  status: 'active' | 'redeemed' | 'void';
  issuedBy: string;
  note: string | null;
  redeemedOrderId: string | null;
  createdAt: string;
};

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
  const [tab, setTab] = useState<
    'drinks' | 'events' | 'trivia' | 'orders' | 'giftcards' | 'venues' | 'sourcing' | 'referrals'
  >('drinks');
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
  const [entries, setEntries] = useState<TriviaEntry[]>([]);
  const [triviaError, setTriviaError] = useState('');
  const [weeks, setWeeks] = useState<TriviaWeek[]>([]);
  const [rounds, setRounds] = useState<RoundOption[]>([]);
  const [weekRound, setWeekRound] = useState('');
  const [weekStart, setWeekStart] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersError, setOrdersError] = useState('');
  const [settableStatuses, setSettableStatuses] = useState<OrderStatus[]>([]);
  const [updatingOrder, setUpdatingOrder] = useState('');
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [giftCardError, setGiftCardError] = useState('');
  const [giftCardIssuing, setGiftCardIssuing] = useState(false);

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

  const loadTrivia = useCallback(async () => {
    const [entryRes, schedRes] = await Promise.all([
      fetch('/api/admin/trivia'),
      fetch('/api/admin/trivia/schedule'),
    ]);
    const entryData = await entryRes.json().catch(() => ({}));
    const schedData = await schedRes.json().catch(() => ({}));
    if (!entryRes.ok && !schedRes.ok) {
      setTriviaError(entryData.error || schedData.error || 'Could not load trivia.');
      return;
    }
    setTriviaError(entryData.error || schedData.error || '');
    setEntries(entryData.entries || []);
    setWeeks(schedData.weeks || []);
    setRounds(schedData.rounds || []);
    setWeekRound((v) => v || schedData.rounds?.[0]?.slug || '');
    setWeekStart((v) => v || schedData.thisWeek || '');
  }, []);

  async function scheduleWeek() {
    setTriviaError('');
    const res = await fetch('/api/admin/trivia/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundSlug: weekRound, weekStart }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setTriviaError(data.error || 'Could not schedule the week.');
      return;
    }
    setWeeks((rows) => {
      const without = rows.filter((r) => r.weekStart !== data.week.weekStart);
      return [data.week, ...without].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
    });
  }

  async function removeWeek(week: TriviaWeek) {
    setTriviaError('');
    const res = await fetch(`/api/admin/trivia/schedule?id=${encodeURIComponent(week.id)}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setTriviaError(data.error || 'Could not remove the week.');
      return;
    }
    setWeeks((rows) => rows.filter((r) => r.id !== week.id));
  }

  const loadOrders = useCallback(async () => {
    const res = await fetch('/api/admin/orders');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setOrdersError(data.error || 'Could not load orders.');
      return;
    }
    setOrdersError('');
    setOrders(data.orders || []);
    setSettableStatuses(data.statuses || []);
  }, []);

  async function updateOrderStatus(order: AdminOrder, status: OrderStatus) {
    setOrdersError('');
    setUpdatingOrder(order.id);
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, status }),
    });
    const data = await res.json().catch(() => ({}));
    setUpdatingOrder('');
    if (!res.ok) {
      setOrdersError(data.error || 'Could not update the order.');
      return;
    }
    setOrders((rows) => rows.map((r) => (r.id === order.id ? { ...r, status } : r)));
  }

  async function saveTracking(order: AdminOrder, patch: { courierName?: string; riderPhone?: string; etaAt?: string | null; trackingNote?: string }) {
    setOrdersError('');
    setUpdatingOrder(order.id);
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, status: order.status, ...patch }),
    });
    const data = await res.json().catch(() => ({}));
    setUpdatingOrder('');
    if (!res.ok) {
      setOrdersError(data.error || 'Could not save tracking info.');
      return;
    }
    setOrders((rows) => rows.map((r) => (r.id === order.id ? { ...r, ...patch } as AdminOrder : r)));
  }

  async function refundOrder(order: AdminOrder) {
    if (!window.confirm(`Refund ${order.fullName}'s order for ${formatNgn(order.totalNgn)}?`)) return;
    setOrdersError('');
    setUpdatingOrder(order.id);
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, action: 'refund' }),
    });
    const data = await res.json().catch(() => ({}));
    setUpdatingOrder('');
    if (!res.ok) {
      setOrdersError(data.error || 'Could not refund this order.');
      return;
    }
    setOrders((rows) =>
      rows.map((r) => (r.id === order.id ? { ...r, status: 'refunded', refundedNgn: data.refundedNgn } : r))
    );
  }

  async function deleteOrder(order: AdminOrder) {
    if (!window.confirm(`Delete order ${order.id.slice(0, 8).toUpperCase()} from ${order.fullName}? This cannot be undone.`)) return;
    setUpdatingOrder(order.id);
    const res = await fetch(`/api/admin/orders?id=${order.id}`, { method: 'DELETE' });
    setUpdatingOrder('');
    if (res.ok) setOrders((rows) => rows.filter((r) => r.id !== order.id));
    else setOrdersError('Could not delete order.');
  }

  const loadGiftCards = useCallback(async () => {
    const res = await fetch('/api/admin/gift-cards');
    const data = await res.json().catch(() => ({}));
    if (res.ok) setGiftCards(data.cards || []);
  }, []);

  async function issueGiftCard(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGiftCardError('');
    setGiftCardIssuing(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/gift-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valueNgn: Number(fd.get('valueNgn')), note: String(fd.get('note') || '') }),
    });
    const data = await res.json().catch(() => ({}));
    setGiftCardIssuing(false);
    if (!res.ok) {
      setGiftCardError(data.error || 'Could not issue gift card.');
      return;
    }
    setGiftCards((rows) => [data.card, ...rows]);
    (e.target as HTMLFormElement).reset();
  }

  async function deleteGiftCard(id: string) {
    if (!window.confirm('Delete this gift card?')) return;
    const res = await fetch(`/api/admin/gift-cards?id=${id}`, { method: 'DELETE' });
    if (res.ok) setGiftCards((rows) => rows.filter((r) => r.id !== id));
    else setGiftCardError('Could not delete gift card.');
  }

  async function deleteTrivia(entry: TriviaEntry) {
    if (!window.confirm(`Delete trivia entry from ${entry.name}?`)) return;
    const res = await fetch(`/api/admin/trivia?id=${entry.id}`, { method: 'DELETE' });
    if (res.ok) setEntries((rows) => rows.filter((r) => r.id !== entry.id));
    else setTriviaError('Could not delete entry.');
  }

  async function setEntryStatus(entry: TriviaEntry, status: string) {
    setTriviaError('');
    const res = await fetch('/api/admin/trivia', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: entry.id, status }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setTriviaError(data.error || 'Could not update the entry.');
      return;
    }
    setEntries((rows) => rows.map((r) => (r.id === entry.id ? { ...r, status } : r)));
  }

  useEffect(() => {
    loadStock()
      .then(loadEvents)
      .then(loadTrivia)
      .then(loadOrders)
      .then(loadGiftCards)
      .catch(() => setAuthed(false));
  }, [loadStock, loadEvents, loadTrivia, loadOrders, loadGiftCards]);

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
    await loadTrivia();
    await loadOrders();
    await loadGiftCards();
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

  function loadItemIntoForm(item: Item) {
    const form = document.getElementById('admin-product-form') as HTMLFormElement | null;
    if (!form) return;
    const set = (field: string, value: string) => {
      const el = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement | null;
      if (el) el.value = value || '';
    };
    set('name', item.name);
    set('slug', item.slug);
    set('priceNgn', item.price_ngn != null ? String(item.price_ngn) : '');
    set('onHand', String(item.on_hand));
    set('brand', item.brand || '');
    set('category', item.category || '');
    set('volume', item.volume || '');
    set('abv', item.abv != null ? String(item.abv) : '');
    set('tagline', item.tagline || '');
    set('description', item.description || '');
    set('tasteNote', item.taste_note || '');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMsg(`Loaded “${item.name}” into the form — edit taste/brand and save.`);
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

  async function deleteStock(slug: string, name: string) {
    if (!window.confirm(`Delete ${name} from inventory?`)) return;
    setSavingSlug(slug);
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', slug }),
    });
    setSavingSlug('');
    if (res.ok) {
      setItems((rows) => rows.filter((r) => r.slug !== slug));
      setMsg(`Deleted ${name}`);
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error || 'Could not delete item.');
    }
  }

  async function askProductCopy() {
    const form = document.getElementById('admin-product-form') as HTMLFormElement | null;
    if (!form) return;
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    if (!name) {
      setMsg('Enter a product name first.');
      return;
    }
    setLoading(true);
    setMsg('');
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ai-product-copy',
        name,
        brand: String(fd.get('brand') || ''),
        category: String(fd.get('category') || 'spirits'),
        abv: fd.get('abv') ? Number(fd.get('abv')) : undefined,
        volume: String(fd.get('volume') || ''),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || 'AI unavailable');
      return;
    }
    const copy = data.copy || {};
    const set = (field: string, value: string) => {
      const el = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement | null;
      if (el) el.value = value || '';
    };
    set('tagline', copy.tagline);
    set('description', copy.description);
    set('tasteNote', copy.tasteNote);
    set('brandOrigin', copy.brandOrigin);
    set('brandFounded', copy.brandFounded);
    set('brandHistory', copy.brandHistory);
    set('brandStyle', copy.brandStyle);
    setMsg('AI copy filled — review and save.');
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
    // #app-scroll is the actual scroll container on mobile (see the (public)
    // layout's app-shell wrapper); window.scrollTo alone is a no-op there.
    document.getElementById('app-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
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

        <div className="flex gap-1 mb-8 border-b border-obsidian/10 overflow-x-auto">
          {(['drinks', 'orders', 'sourcing', 'referrals', 'giftcards', 'events', 'venues', 'trivia'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] border-b-2 -mb-px transition-colors whitespace-nowrap ${
                tab === key ? 'border-ember text-ember' : 'border-transparent text-obsidian/40 hover:text-obsidian/70'
              }`}
            >
              {key === 'drinks'
                ? `Drinks (${items.length})`
                : key === 'orders'
                  ? `Orders (${orders.length})`
                  : key === 'sourcing'
                    ? `Sourcing (${orders.filter((o) => o.supplierCostNgn == null).length})`
                    : key === 'referrals'
                      ? 'Referrals'
                      : key === 'giftcards'
                    ? `Gift cards (${giftCards.length})`
                    : key === 'events'
                      ? `Events (${events.length})`
                      : key === 'venues'
                        ? 'Venues'
                        : `Trivia (${entries.length})`}
            </button>
          ))}
        </div>

        {tab === 'orders' ? (
          <>
            {ordersError && <p className="text-sm text-ember mb-6">{ordersError}</p>}
            <p className="text-sm text-obsidian/50 mb-5">
              Move an order through fulfillment, add rider ETA/contact, or refund it. Each status change emails
              the customer automatically (once Resend is configured).
            </p>
            <div className="space-y-3">
              {orders.map((order) => {
                const refundable = !['refunded', 'cancelled', 'pending', 'awaiting_payment'].includes(order.status);
                return (
                  <div key={order.id} className="bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">
                          {order.fullName}{' '}
                          <span className="text-[11px] text-obsidian/40 font-mono font-normal">
                            {order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </p>
                        <p className="text-[12px] text-obsidian/50 truncate">
                          {order.email}
                          {order.phone ? ` · ${order.phone}` : ''}
                        </p>
                        <p className="text-[12px] text-obsidian/50">
                          {order.addressLine1}
                          {order.area ? `, ${order.area}` : ''}
                        </p>
                        <p className="text-[12px] text-obsidian/45 mt-1">
                          {order.items.map((i) => `${i.name} × ${i.qty}`).join(' · ')}
                        </p>
                        {order.items.flatMap((i) => {
                          const pkg = i.slug ? getPackageBySlug(i.slug) : undefined;
                          if (!pkg) return [];
                          return [
                            <div
                              key={`${order.id}-${i.slug}`}
                              className="mt-2 border-l-2 border-ember/30 pl-2.5"
                            >
                              <p className="text-[10px] uppercase tracking-wider text-ember/80">
                                Pick list · {pkg.name}
                                {i.qty > 1 ? ` × ${i.qty}` : ''}
                              </p>
                              <p className="text-[11px] text-obsidian/50 leading-relaxed">
                                {resolveComponents(pkg)
                                  .map((c) => `${c.qty * i.qty} × ${c.product.name}`)
                                  .join(' · ')}
                              </p>
                            </div>,
                          ];
                        })}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold">{formatNgn(order.totalNgn)}</p>
                        {order.giftCardDiscountNgn > 0 && (
                          <p className="text-[11px] text-ember">−{formatNgn(order.giftCardDiscountNgn)} gift card</p>
                        )}
                        {order.status === 'refunded' && order.refundedNgn > 0 && (
                          <p className="text-[11px] text-obsidian/40">Refunded {formatNgn(order.refundedNgn)}</p>
                        )}
                        <p className="text-[11px] text-obsidian/40">{formatWhen(order.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-obsidian/10 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-[0.12em] px-2 py-1 bg-paper text-obsidian/60">
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                      <a
                        href={`/admin/label/${order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-[0.1em] px-3 py-2 border border-obsidian/15 text-obsidian/60 hover:border-ember hover:text-ember"
                      >
                        Print label
                      </a>
                      {refundable && (
                        <button
                          type="button"
                          disabled={updatingOrder === order.id}
                          onClick={() => refundOrder(order)}
                          className="text-[10px] font-black uppercase tracking-[0.1em] px-3 py-2 border border-obsidian/15 text-obsidian/60 hover:border-ember hover:text-ember disabled:opacity-40"
                        >
                          Refund
                        </button>
                      )}
                      <select
                        value=""
                        disabled={updatingOrder === order.id}
                        onChange={(e) => {
                          const next = e.target.value as OrderStatus;
                          if (next) updateOrderStatus(order, next);
                          e.target.value = '';
                        }}
                        className="ml-auto text-[11px] font-black uppercase tracking-[0.1em] border border-obsidian/15 px-3 py-2 disabled:opacity-40"
                      >
                        <option value="">
                          {updatingOrder === order.id ? 'Updating…' : 'Set status…'}
                        </option>
                        {settableStatuses
                          .filter((s) => s !== order.status)
                          .map((s) => (
                            <option key={s} value={s}>
                              {ORDER_STATUS_LABELS[s] || s}
                            </option>
                          ))}
                      </select>
                    </div>

                    <TrackingForm order={order} saving={updatingOrder === order.id} onSave={(patch) => saveTracking(order, patch)} />
                    <div className="mt-2 pt-2 border-t border-obsidian/5">
                      <button
                        type="button"
                        disabled={updatingOrder === order.id}
                        onClick={() => deleteOrder(order)}
                        className="text-[10px] font-black uppercase tracking-[0.1em] px-3 py-2 border border-ember/40 text-ember disabled:opacity-40"
                      >
                        Delete order
                      </button>
                    </div>
                  </div>
                );
              })}
              {orders.length === 0 && !ordersError && (
                <p className="text-sm text-obsidian/45">No paid orders yet.</p>
              )}
            </div>
          </>
        ) : tab === 'sourcing' ? (
          <SourcingDesk orders={orders} onOrdersChanged={loadOrders} />
        ) : tab === 'referrals' ? (
          <ReferralsDesk />
        ) : tab === 'giftcards' ? (
          <>
            {giftCardError && <p className="text-sm text-ember mb-6">{giftCardError}</p>}
            <form onSubmit={issueGiftCard} className="bg-white p-6 sm:p-8 mb-10 space-y-4 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
              <h2 className="font-bold">Issue a gift card</h2>
              <p className="text-sm text-obsidian/50">
                Generates a real, single-use code backed by the database — a customer applies it at checkout to
                take the value straight off their order total.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field name="valueNgn" label="Value (NGN)" type="number" required />
                <Field name="note" label="Note (internal)" placeholder="e.g. goodwill credit, order #1234" />
              </div>
              <button type="submit" disabled={giftCardIssuing} className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-60">
                {giftCardIssuing ? 'Issuing…' : 'Issue gift card'}
              </button>
            </form>

            <h2 className="font-bold mb-4">Issued codes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white border border-obsidian/8">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40 border-b border-obsidian/8">
                    <th className="p-3">Code</th>
                    <th className="p-3">Value</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Note</th>
                    <th className="p-3">Issued</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {giftCards.map((c) => (
                    <tr key={c.id} className="border-b border-obsidian/6">
                      <td className="p-3 font-mono text-xs">{c.code}</td>
                      <td className="p-3">{formatNgn(c.valueNgn)}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-black uppercase tracking-[0.1em] px-2 py-1 ${
                            c.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-paper text-obsidian/50'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-obsidian/50">{c.note || '—'}</td>
                      <td className="p-3 text-obsidian/40 text-xs">{formatWhen(c.createdAt)}</td>
                      <td className="p-3">
                        <button type="button" onClick={() => deleteGiftCard(c.id)} className="text-[10px] font-black uppercase text-ember hover:text-ember/80">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {giftCards.length === 0 && <p className="text-sm text-obsidian/45 p-3">No gift cards issued yet.</p>}
            </div>
          </>
        ) : tab === 'trivia' ? (
          <>
            {triviaError && <p className="text-sm text-ember mb-6">{triviaError}</p>}

            <div className="bg-white p-6 sm:p-8 mb-12 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
              <h2 className="font-bold">Brand of the week</h2>
              <p className="text-sm text-obsidian/50 mt-1 mb-5">
                One sponsoring house plays at a time. The week covering today is live on /trivia; every other round
                stays open as practice with no draw.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 items-end">
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                    Brand
                  </span>
                  <select value={weekRound} onChange={(e) => setWeekRound(e.target.value)} className={inputClass}>
                    {rounds.map((r) => (
                      <option key={r.slug} value={r.slug}>
                        {r.brand} — {r.prizeLabel}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                    Week starting
                  </span>
                  <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} className={inputClass} />
                </label>
                <button
                  type="button"
                  onClick={scheduleWeek}
                  disabled={!weekRound || !weekStart}
                  className="px-5 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-40"
                >
                  Set week
                </button>
              </div>

              {weeks.length > 0 && (
                <ul className="mt-6 pt-6 border-t border-obsidian/10 space-y-2">
                  {weeks.map((week) => (
                    <li key={week.id} className="flex items-center gap-3 flex-wrap">
                      <span className="text-[11px] text-obsidian/45 tabular-nums w-40">
                        {week.weekStart} → {week.weekEnd}
                      </span>
                      <span className="font-medium text-sm">
                        {rounds.find((r) => r.slug === week.roundSlug)?.brand || week.roundSlug}
                      </span>
                      {week.live && (
                        <span className="text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 bg-ember text-white">
                          Live
                        </span>
                      )}
                      {!week.published && (
                        <span className="text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 bg-paper text-obsidian/45">
                          Hidden
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeWeek(week)}
                        className="ml-auto text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <h2 className="font-bold mb-1">Draw entries</h2>
            <p className="text-sm text-obsidian/50 mb-5">
              Everyone who passed a brand round. Mark a winner, then mark the bottle claimed once collected.
            </p>
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-white p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{entry.name}</p>
                      <span className="text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 bg-paper text-obsidian/50">
                        {entry.brand}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 ${
                          entry.status === 'won'
                            ? 'bg-ember text-white'
                            : entry.status === 'claimed'
                              ? 'bg-obsidian text-white'
                              : 'bg-paper text-obsidian/45'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-obsidian/50 mt-1 truncate">
                      {entry.email}
                      {entry.phone ? ` · ${entry.phone}` : ''} · scored {entry.score}/{entry.total}
                    </p>
                    <p className="text-[11px] text-obsidian/40 font-mono mt-0.5">{entry.code}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(['won', 'claimed', 'void'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={entry.status === status}
                        onClick={() => setEntryStatus(entry, status)}
                        className="px-3 py-2 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-35"
                      >
                        {status}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => deleteTrivia(entry)}
                      className="px-3 py-2 border border-ember/40 text-ember text-[10px] font-black uppercase tracking-[0.12em]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {entries.length === 0 && !triviaError && (
                <p className="text-sm text-obsidian/45">No entries yet.</p>
              )}
            </div>
          </>
        ) : tab === 'venues' ? (
          <AdminVenuesTab />
        ) : tab === 'drinks' ? (
          <>
            {msg && <p className="text-sm text-ember mb-6">{msg}</p>}
            {advice && (
              <div className="mb-8 bg-white p-5 text-sm text-obsidian/70 leading-relaxed whitespace-pre-wrap shadow-sm">
                {advice}
              </div>
            )}

            <form id="admin-product-form" onSubmit={onUpload} className="bg-white p-6 sm:p-8 mb-12 space-y-4 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
              <h2 className="font-bold">Add / update stock</h2>
              <p className="text-sm text-obsidian/50">
                Upload a bottle image to Azure Storage. Add taste notes and brand story for the ⓘ bottle guide in shop and cart.
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
              <TextAreaField name="description" label="Description" rows={2} />
              <TextAreaField
                name="tasteNote"
                label="Taste note (bottle guide)"
                placeholder="What it tastes like — one sentence"
                rows={2}
              />
              <div className="border-t border-obsidian/8 pt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-3">
                  Brand story (optional — shared across same brand)
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field name="brandOrigin" label="Brand origin" placeholder="Cognac, France" />
                  <Field name="brandFounded" label="Founded" placeholder="1765" />
                </div>
                <TextAreaField name="brandHistory" label="Brand history (short)" placeholder="2–3 sentences" rows={3} />
                <Field name="brandStyle" label="Brand style" />
              </div>
              <button
                type="button"
                onClick={askProductCopy}
                disabled={loading}
                className="px-4 py-2 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/60 hover:text-ember"
              >
                {loading ? 'Generating…' : 'Generate copy with AI'}
              </button>
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

            <div className="mb-10 pb-10 border-b border-obsidian/10">
              <PriceListImport onApplied={loadStock} />
            </div>

            <h2 className="font-bold mb-1">Live stock</h2>
            <p className="text-sm text-obsidian/50 mb-5">
              Edit counts, price, listing state, and bottle-guide taste notes. Changes hit the shop and ⓘ panels straight away.
            </p>
            <div className="space-y-3">
              {items.map((item) => (
                <StockRow
                  key={item.slug}
                  item={item}
                  saving={savingSlug === item.slug}
                  onSave={(patch) => saveStock(item.slug, patch)}
                  onDelete={() => deleteStock(item.slug, item.name)}
                  onLoadForm={() => loadItemIntoForm(item)}
                />
              ))}
              {items.length === 0 && <p className="text-sm text-obsidian/45">No SKUs yet.</p>}
            </div>
          </>
        ) : (
          <>
            {eventsError && <p className="text-sm text-ember mb-6">{eventsError}</p>}
            <p className="text-sm text-obsidian/50 mb-6">
              Create and publish nights for <code className="text-xs">/events</code>. Pick a venue from the list
              — add a new one under the{' '}
              <button
                type="button"
                onClick={() => setTab('venues')}
                className="text-ember font-medium hover:underline"
              >
                Venues
              </button>{' '}
              tab if you need to. Check “Published on /events” to go live.
            </p>

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
                    disabled={venues.length === 0}
                  >
                    <option value="">{venues.length === 0 ? 'Loading venues…' : 'Select venue…'}</option>
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

            <h2 className="font-bold mb-1">Saved events</h2>
            <p className="text-sm text-obsidian/50 mb-5">
              Events you create here appear on /events when published. Unpublished nights stay hidden from the public feed.
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

function TrackingForm({
  order,
  saving,
  onSave,
}: {
  order: AdminOrder;
  saving: boolean;
  onSave: (patch: { courierName?: string; riderPhone?: string; etaAt?: string | null; trackingNote?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [courierName, setCourierName] = useState(order.courierName || '');
  const [riderPhone, setRiderPhone] = useState(order.riderPhone || '');
  const [etaLocal, setEtaLocal] = useState(order.etaAt ? toLocalInput(order.etaAt) : '');
  const [trackingNote, setTrackingNote] = useState(order.trackingNote || '');

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-[10px] font-black uppercase tracking-[0.1em] text-obsidian/40 hover:text-ember"
      >
        {order.courierName || order.etaAt ? `Rider: ${order.courierName || '—'} · edit tracking` : '+ Add rider / ETA'}
      </button>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-obsidian/10 grid sm:grid-cols-4 gap-3">
      <div>
        <FieldLabel>Rider name</FieldLabel>
        <input value={courierName} onChange={(e) => setCourierName(e.target.value)} className={inputClass} placeholder="e.g. Tunde" />
      </div>
      <div>
        <FieldLabel>Rider phone</FieldLabel>
        <input value={riderPhone} onChange={(e) => setRiderPhone(e.target.value)} className={inputClass} placeholder="+234…" />
      </div>
      <div>
        <FieldLabel>ETA</FieldLabel>
        <input type="datetime-local" value={etaLocal} onChange={(e) => setEtaLocal(e.target.value)} className={inputClass} />
      </div>
      <div>
        <FieldLabel>Tracking note</FieldLabel>
        <input value={trackingNote} onChange={(e) => setTrackingNote(e.target.value)} className={inputClass} placeholder="Optional" />
      </div>
      <div className="sm:col-span-4 flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() =>
            onSave({
              courierName,
              riderPhone,
              etaAt: etaLocal ? fromLocalInput(etaLocal) : null,
              trackingNote,
            })
          }
          className="px-4 py-2 btn-brand text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40"
        >
          {saving ? '…' : 'Save tracking'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function StockRow({
  item,
  saving,
  onSave,
  onDelete,
  onLoadForm,
}: {
  item: Item;
  saving: boolean;
  onSave: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
  onLoadForm: () => void;
}) {
  const [onHand, setOnHand] = useState(String(item.on_hand));
  const [price, setPrice] = useState(item.price_ngn != null ? String(item.price_ngn) : '');
  const [threshold, setThreshold] = useState(String(item.low_stock_threshold));
  const [tasteNote, setTasteNote] = useState(item.taste_note || '');
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    setOnHand(String(item.on_hand));
    setPrice(item.price_ngn != null ? String(item.price_ngn) : '');
    setThreshold(String(item.low_stock_threshold));
    setTasteNote(item.taste_note || '');
  }, [item.on_hand, item.price_ngn, item.low_stock_threshold, item.taste_note]);

  const dirty =
    onHand !== String(item.on_hand) ||
    price !== (item.price_ngn != null ? String(item.price_ngn) : '') ||
    threshold !== String(item.low_stock_threshold) ||
    tasteNote !== (item.taste_note || '');

  const lowStock = item.tracked !== false && item.available <= item.low_stock_threshold;

  return (
    <div className="bg-white p-4 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-3 min-w-0 lg:w-64">
          {item.image_url ? (
            <Image src={item.image_url} alt="" width={40} height={48} className="w-10 h-12 object-cover shrink-0" />
          ) : (
            <div className="w-10 h-12 bg-paper border border-obsidian/10 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium truncate">{item.name}</p>
            <p className="text-[11px] text-obsidian/40 font-mono truncate">{item.slug}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.1em] mt-0.5 text-obsidian/35">
              {item.source}
              {item.brand ? ` · ${item.brand}` : ''}
              {item.reserved > 0 ? ` · ${item.reserved} reserved` : ''}
              {lowStock ? ' · low' : ''}
              {!item.active ? ' · off shop' : ''}
              {item.taste_note ? ' · guide ✓' : ' · no guide'}
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

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={() =>
              onSave({
                onHand,
                priceNgn: price === '' ? undefined : price,
                lowStockThreshold: threshold,
                tasteNote,
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
          <button
            type="button"
            onClick={() => setGuideOpen((v) => !v)}
            className="px-3 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em]"
          >
            {guideOpen ? 'Hide guide' : 'Guide'}
          </button>
          <button
            type="button"
            onClick={onLoadForm}
            className="px-3 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em]"
          >
            Edit form
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onDelete}
            className="px-3 py-2.5 border border-ember/40 text-ember text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>

      {guideOpen && (
        <div className="pt-3 border-t border-obsidian/10 space-y-3">
          <div>
            <FieldLabel>Taste note (bottle guide ⓘ)</FieldLabel>
            <textarea
              value={tasteNote}
              onChange={(e) => setTasteNote(e.target.value)}
              rows={2}
              placeholder="What it tastes like — one sentence"
              className={`${inputClass} resize-y`}
            />
          </div>
          <p className="text-[11px] text-obsidian/45">
            Save updates the taste note on this SKU. For full brand story (origin, history, style), use{' '}
            <button type="button" onClick={onLoadForm} className="text-ember underline">
              Edit form
            </button>{' '}
            at the top, then Generate / Save.
          </p>
        </div>
      )}
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

function TextAreaField({
  name,
  label,
  placeholder,
  rows = 2,
}: {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        className={`${inputClass} resize-y`}
      />
    </div>
  );
}

type AdminVenue = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  area: string;
  areaId: string;
  status: string;
  source: string;
  photoUrl: string | null;
  tagline: string;
  about: string;
  hours: string;
  followerCount: number;
  reviewCount: number;
};

function AdminVenuesTab() {
  const [venues, setVenues] = useState<AdminVenue[]>([]);
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [kind, setKind] = useState('lounge');
  const [areaId, setAreaId] = useState('vi');
  const [areaName, setAreaName] = useState('Victoria Island');
  const [tagline, setTagline] = useState('');
  const [about, setAbout] = useState('');
  const [hours, setHours] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/venues')
      .then((r) => r.json())
      .then((d) => {
        setVenues(d.venues || []);
        setAreas(d.areas || []);
      })
      .catch(() => setError('Could not load venues.'))
      .finally(() => setLoading(false));
  }, []);

  function autoSlug(n: string) {
    setName(n);
    setSlug(n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  }

  async function createVenue(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/venues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, slug, kind, areaId, area: areaName,
        tagline, about, hours, photoUrl: photoUrl || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Could not create venue.'); return; }
    setVenues((v) => [data.venue, ...v]);
    setShowForm(false);
    setName(''); setSlug(''); setTagline(''); setAbout(''); setHours(''); setPhotoUrl('');
  }

  async function approveVenue(venue: AdminVenue) {
    const res = await fetch('/api/admin/venues', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: venue.id, status: 'active' }),
    });
    if (res.ok) setVenues((v) => v.map((x) => x.id === venue.id ? { ...x, status: 'active' } : x));
  }

  async function suspendVenue(venue: AdminVenue) {
    const res = await fetch('/api/admin/venues', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: venue.id, status: 'suspended' }),
    });
    if (res.ok) setVenues((v) => v.map((x) => x.id === venue.id ? { ...x, status: 'suspended' } : x));
  }

  async function removeVenue(venue: AdminVenue) {
    if (!window.confirm(`Delete ${venue.name}?`)) return;
    const res = await fetch(`/api/admin/venues?id=${venue.id}`, { method: 'DELETE' });
    if (res.ok) setVenues((v) => v.filter((x) => x.id !== venue.id));
  }

  if (loading) return <p className="text-sm text-obsidian/45">Loading venues…</p>;

  const pending = venues.filter((v) => v.status === 'pending');
  const active = venues.filter((v) => v.status === 'active');
  const suspended = venues.filter((v) => v.status === 'suspended');

  return (
    <>
      {error && <p className="text-sm text-ember mb-4">{error}</p>}

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-obsidian/50">
          Manage venue profiles. Approve partner submissions, add photos, and control visibility.
        </p>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.14em]"
        >
          {showForm ? 'Cancel' : '+ Add venue'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createVenue} className="bg-white p-6 mb-8 shadow-sm space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Name</FieldLabel>
              <input value={name} onChange={(e) => autoSlug(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <FieldLabel>Slug</FieldLabel>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required className={inputClass} />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <FieldLabel>Type</FieldLabel>
              <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputClass}>
                {['club','lounge','rooftop','beach','live','restaurant','bar'].map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Area</FieldLabel>
              <select
                value={areaId}
                onChange={(e) => {
                  setAreaId(e.target.value);
                  const a = areas.find((x) => x.id === e.target.value);
                  if (a) setAreaName(a.name);
                }}
                className={inputClass}
              >
                {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Hours</FieldLabel>
              <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. Thu-Sun · 7pm-3am" className={inputClass} />
            </div>
          </div>
          <div>
            <FieldLabel>Photo URL</FieldLabel>
            <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." className={inputClass} />
          </div>
          <div>
            <FieldLabel>Tagline</FieldLabel>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} />
          </div>
          <div>
            <FieldLabel>About</FieldLabel>
            <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={3} className={`${inputClass} resize-y`} />
          </div>
          <button type="submit" disabled={saving} className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
            {saving ? 'Saving…' : 'Create venue'}
          </button>
        </form>
      )}

      {pending.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-ember mb-3">Pending approval ({pending.length})</h3>
          <div className="space-y-3">
            {pending.map((v) => (
              <div key={v.id} className="bg-white p-4 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-paper flex items-center justify-center shrink-0">
                  {v.photoUrl ? <img src={v.photoUrl} alt="" className="w-full h-full object-cover rounded" /> : <span className="text-lg">📍</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{v.name}</p>
                  <p className="text-xs text-obsidian/45">{v.kind} · {v.area} · via {v.source}</p>
                </div>
                <button type="button" onClick={() => approveVenue(v)} className="px-3 py-2 border border-green-500 text-green-600 text-[10px] font-black uppercase">Approve</button>
                <button type="button" onClick={() => removeVenue(v)} className="px-3 py-2 border border-ember/40 text-ember text-[10px] font-black uppercase">Reject</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-sm font-bold mb-3">Active venues ({active.length})</h3>
      <div className="space-y-3 mb-8">
        {active.map((v) => (
          <div key={v.id} className="bg-white p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-paper flex items-center justify-center shrink-0 overflow-hidden">
              {v.photoUrl ? <img src={v.photoUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">📍</span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{v.name}</p>
              <p className="text-xs text-obsidian/45">{v.kind} · {v.area} · {v.followerCount} followers · {v.reviewCount} reviews</p>
            </div>
            <button type="button" onClick={() => suspendVenue(v)} className="px-3 py-2 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em]">Suspend</button>
            <button type="button" onClick={() => removeVenue(v)} className="px-3 py-2 border border-ember/40 text-ember text-[10px] font-black uppercase tracking-[0.12em]">Delete</button>
          </div>
        ))}
        {active.length === 0 && <p className="text-sm text-obsidian/45">No active venues. Create one above.</p>}
      </div>

      {suspended.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-obsidian/50 mb-3">Suspended ({suspended.length})</h3>
          <div className="space-y-3">
            {suspended.map((v) => (
              <div key={v.id} className="bg-white p-4 shadow-sm flex items-center gap-4 opacity-60">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{v.name}</p>
                  <p className="text-xs text-obsidian/45">{v.kind} · {v.area}</p>
                </div>
                <button type="button" onClick={() => approveVenue(v)} className="px-3 py-2 border border-obsidian/15 text-[10px] font-black uppercase">Reactivate</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
