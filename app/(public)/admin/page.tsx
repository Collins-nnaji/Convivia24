'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CATEGORIES, CATEGORY_LABELS, formatNgn } from '@/lib/drinks/catalog';
import { getPackageBySlug, resolveComponents } from '@/lib/packages/catalog';
import SourcingDesk from '@/components/admin/SourcingDesk';
import SuppliersDesk from '@/components/admin/SuppliersDesk';
import PriceListImport from '@/components/admin/PriceListImport';
import ReferralsDesk from '@/components/admin/ReferralsDesk';
import OrdersLedger from '@/components/admin/OrdersLedger';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/commerce/status';
import { skuMargin } from '@/lib/suppliers/margin';
import AdminShell, { type AdminTab } from '@/components/admin/AdminShell';
import DialogProvider, { useDialogs } from '@/components/admin/ui/DialogProvider';
import { AdminSelect } from '@/components/admin/ui/Fields';
import {
  ChevronDown,
  FileText,
  Plus,
  Gift,
  PackageSearch,
  Share2,
  ShoppingBag,
  Trophy,
  Truck,
  Wine,
} from 'lucide-react';

type Item = {
  slug: string;
  name: string;
  on_hand: number;
  reserved: number;
  low_stock_threshold: number;
  available: number;
  price_ngn: number | null;
  cost_ngn?: number | null;
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

type SupplierLite = { id: string; name: string; city: string };
type SupplierStockRow = {
  supplierId: string;
  supplierName: string;
  city: string;
  slug: string;
  onHand: number;
  reserved: number;
  available: number;
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
  return (
    <DialogProvider>
      <AdminDesk />
    </DialogProvider>
  );
}

function AdminDesk() {
  const { confirm, notify } = useDialogs();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<
    'drinks' | 'suppliers' | 'trivia' | 'orders' | 'giftcards' | 'sourcing' | 'referrals'
  >('drinks');
  const [items, setItems] = useState<Item[]>([]);
  const [msg, setMsg] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingSlug, setSavingSlug] = useState('');
  const [blobOk, setBlobOk] = useState(false);
  const [aiOk, setAiOk] = useState(false);
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
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [priceListOpen, setPriceListOpen] = useState(false);
  /** Per-supplier holdings, keyed by SKU slug — the shop total is the sum of these. */
  const [supplierStock, setSupplierStock] = useState<Record<string, SupplierStockRow[]>>({});
  const [suppliers, setSuppliers] = useState<SupplierLite[]>([]);
  const [stockQuery, setStockQuery] = useState('');
  const [stockCategory, setStockCategory] = useState('bottles');

  const loadStock = useCallback(async () => {
    const res = await fetch('/api/admin/inventory');
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setAuthed(true);
    setItems(data.items || []);
    setSupplierStock(data.supplierStock || {});
    setSuppliers(data.suppliers || []);
    setBlobOk(Boolean(data.blobConfigured));
    setAiOk(Boolean(data.aiConfigured));
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
    const ok = await confirm({
      title: 'Refund this order?',
      message: (
        <>
          {formatNgn(order.totalNgn)} goes back to <strong>{order.fullName}</strong> through Flutterwave, the
          order is marked refunded, and reserved stock is released. This cannot be undone.
        </>
      ),
      confirmLabel: 'Refund order',
      tone: 'danger',
    });
    if (!ok) return;
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
    const ok = await confirm({
      title: `Delete order ${order.id.slice(0, 8).toUpperCase()}?`,
      message: (
        <>
          The order from <strong>{order.fullName}</strong> is removed permanently. This cannot be undone.
        </>
      ),
      confirmLabel: 'Delete order',
      tone: 'danger',
    });
    if (!ok) return;
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
    const ok = await confirm({
      title: 'Delete this gift card?',
      message: 'Any remaining balance on the card is lost and the code stops working immediately.',
      confirmLabel: 'Delete card',
      tone: 'danger',
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/gift-cards?id=${id}`, { method: 'DELETE' });
    if (res.ok) setGiftCards((rows) => rows.filter((r) => r.id !== id));
    else setGiftCardError('Could not delete gift card.');
  }

  async function deleteTrivia(entry: TriviaEntry) {
    const ok = await confirm({
      title: 'Delete trivia entry?',
      message: (
        <>
          The entry from <strong>{entry.name}</strong> is removed from this week&apos;s round.
        </>
      ),
      confirmLabel: 'Delete entry',
      tone: 'danger',
    });
    if (!ok) return;
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
      .then(loadTrivia)
      .then(loadOrders)
      .then(loadGiftCards)
      .catch(() => setAuthed(false));
  }, [loadStock, loadTrivia, loadOrders, loadGiftCards]);

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
    // The form only exists in the DOM while the panel is open, so expand first and populate on
    // the next frame once React has mounted the fields.
    setAddStockOpen(true);
    requestAnimationFrame(() => populateForm(item));
  }

  function populateForm(item: Item) {
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

  /** Live-stock list after the desk's own search and category narrowing. */
  const visibleItems = useMemo(() => {
    const q = stockQuery.trim().toLowerCase();
    return items.filter((it) => {
      if (stockCategory === 'bottles' && it.category === 'party-packs') return false;
      if (stockCategory !== 'all' && stockCategory !== 'bottles' && it.category !== stockCategory) return false;
      if (!q) return true;
      return `${it.name} ${it.brand ?? ''} ${it.slug}`.toLowerCase().includes(q);
    });
  }, [items, stockQuery, stockCategory]);

  async function setSupplierStockQty(supplierId: string, slug: string, onHand: number) {
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'supplier-stock', supplierId, slug, onHand }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      notify(data.error || 'Could not update supplier stock.', 'error');
      return;
    }
    setSupplierStock((prev) => ({ ...prev, [slug]: data.rows || [] }));
    // The SKU's headline on-hand is derived from these, so pull the row totals back in.
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

  async function deleteStock(slug: string, name: string) {
    const ok = await confirm({
      title: 'Delete from inventory?',
      message: (
        <>
          <strong>{name}</strong> is removed from the stock list. Existing orders keep their line items.
        </>
      ),
      confirmLabel: 'Delete SKU',
      tone: 'danger',
    });
    if (!ok) return;
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

  const tabs: AdminTab[] = [
    { key: 'drinks', label: 'Drinks', count: items.length, icon: <Wine size={17} /> },
    { key: 'orders', label: 'Orders', count: orders.length, icon: <ShoppingBag size={17} /> },
    {
      key: 'sourcing',
      label: 'Order sourcing',
      count: orders.filter((o) => o.supplierCostNgn == null).length,
      icon: <PackageSearch size={17} />,
    },
    { key: 'suppliers', label: 'Suppliers', icon: <Truck size={17} /> },
    { key: 'referrals', label: 'Referrals', icon: <Share2 size={17} /> },
    { key: 'giftcards', label: 'Gift cards', count: giftCards.length, icon: <Gift size={17} /> },
    { key: 'trivia', label: 'Trivia', count: entries.length, icon: <Trophy size={17} /> },
  ];

  return (
    <AdminShell
      title="Desk"
      subtitle={`Azure upload ${blobOk ? 'ready' : 'not configured'} · OpenAI ${aiOk ? 'ready' : 'off'}`}
      tabs={tabs}
      active={tab}
      onSelect={(key) => setTab(key as typeof tab)}
      actions={
        tab === 'drinks' ? (
          <button
            type="button"
            onClick={askAi}
            disabled={loading || !aiOk}
            className="rounded-lg border border-obsidian/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/70 transition-colors hover:bg-obsidian/[0.04] disabled:opacity-40"
          >
            AI stock advice
          </button>
        ) : null
      }
    >
        {tab === 'orders' ? (
          <>
            {ordersError && <p className="text-sm text-ember mb-4">{ordersError}</p>}
            <OrdersLedger
              orders={orders}
              settableStatuses={settableStatuses}
              updatingOrder={updatingOrder}
              onStatusChange={updateOrderStatus}
              onRefund={refundOrder}
              onDelete={deleteOrder}
              renderTracking={(order) => (
                <TrackingForm
                  order={order}
                  saving={updatingOrder === order.id}
                  onSave={(patch) => saveTracking(order, patch)}
                />
              )}
            />
          </>
        ) : tab === 'suppliers' ? (
          <SuppliersDesk onCatalogChanged={loadStock} />
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
                One sponsoring house plays at a time. The week covering today is live on /discover; every other round
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
        ) : tab === 'drinks' ? (
          <>
            {msg && <p className="text-sm text-ember mb-6">{msg}</p>}
            {advice && (
              <div className="mb-8 bg-white p-5 text-sm text-obsidian/70 leading-relaxed whitespace-pre-wrap shadow-sm">
                {advice}
              </div>
            )}

            {/*
              Collapsed by default. This form is long enough to push the live stock table off the
              screen, and the table is what the desk actually works in day to day.
            */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-obsidian/10 bg-white shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
              <button
                type="button"
                onClick={() => setAddStockOpen((v) => !v)}
                aria-expanded={addStockOpen}
                aria-controls="admin-product-form"
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-obsidian/[0.02] sm:px-6"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember/10 text-ember">
                  <Plus size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-obsidian">Add / update stock</span>
                  <span className="block truncate text-xs text-obsidian/45">
                    Upload a bottle image, taste notes and brand story for the ⓘ guide.
                  </span>
                </span>
                <ChevronDown
                  size={18}
                  aria-hidden
                  className={`shrink-0 text-obsidian/40 transition-transform duration-200 ${addStockOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {addStockOpen && (
            <form id="admin-product-form" onSubmit={onUpload} className="border-t border-obsidian/8 p-5 sm:p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field name="name" label="Name" required />
                <Field name="slug" label="Slug (optional)" placeholder="auto-from-name" />
                <Field name="priceNgn" label="Price (NGN)" type="number" required />
                <Field name="onHand" label="On hand" type="number" required />
                <Field name="brand" label="Brand" />
                <SelectField
                  name="category"
                  label="Category"
                  placeholder="Choose a category…"
                  options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
                />
                <SelectField
                  name="volume"
                  label="Volume"
                  placeholder="Choose a size…"
                  options={BOTTLE_VOLUMES.map((v) => ({ value: v, label: v }))}
                />
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
              <div className="flex flex-wrap items-center gap-3 border-t border-obsidian/8 pt-4">
                <button type="submit" disabled={loading} className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
                  {loading ? 'Saving…' : 'Save to shop'}
                </button>
                <button
                  type="button"
                  onClick={() => setAddStockOpen(false)}
                  className="px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/45 hover:text-obsidian"
                >
                  Close
                </button>
              </div>
            </form>
              )}
            </div>

            {/* Same disclosure treatment as Add / update stock — both are occasional tasks. */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-obsidian/10 bg-white shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
              <button
                type="button"
                onClick={() => setPriceListOpen((v) => !v)}
                aria-expanded={priceListOpen}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-obsidian/[0.02] sm:px-6"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember/10 text-ember">
                  <FileText size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-obsidian">Scan a supplier price list</span>
                  <span className="block truncate text-xs text-obsidian/45">
                    Paste the list or upload a photo — review every change before it applies.
                  </span>
                </span>
                <ChevronDown
                  size={18}
                  aria-hidden
                  className={`shrink-0 text-obsidian/40 transition-transform duration-200 ${priceListOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {priceListOpen && (
                <div className="border-t border-obsidian/8 p-5 sm:p-6">
                  <PriceListImport onApplied={loadStock} />
                </div>
              )}
            </div>

            <h2 className="font-bold mb-1">Live stock</h2>
            <p className="text-sm text-obsidian/50 mb-3">
              Retail, wholesale cost and margin per SKU. Supplier-specific costs live in the Suppliers tab.
            </p>

            {/* Party packs outnumber bottles roughly two to one, so the list needs narrowing. */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                value={stockQuery}
                onChange={(e) => setStockQuery(e.target.value)}
                placeholder="Search SKU, brand…"
                aria-label="Search stock"
                className="w-52 rounded-lg border border-obsidian/12 px-3 py-2 text-sm focus:border-ember focus:ring-0"
              />
              <AdminSelect
                value={stockCategory}
                onChange={setStockCategory}
                options={[
                  { value: 'all', label: 'All categories' },
                  { value: 'bottles', label: 'Bottles only (no packs)' },
                  ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
                ]}
                className="w-auto"
              />
              <span className="text-xs text-obsidian/45">
                {visibleItems.length} of {items.length}
              </span>
            </div>
            <div className="hidden lg:grid grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,.55fr))_auto] gap-3 px-4 pb-2 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40">
              <span>SKU</span>
              <span className="text-right">On hand</span>
              <span className="text-right">Cost</span>
              <span className="text-right">Retail</span>
              <span className="text-right">Margin</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="space-y-3">
              {visibleItems.map((item) => (
                <StockRow
                  key={item.slug}
                  item={item}
                  saving={savingSlug === item.slug}
                  onSave={(patch) => saveStock(item.slug, patch)}
                  onDelete={() => deleteStock(item.slug, item.name)}
                  onLoadForm={() => loadItemIntoForm(item)}
                  suppliers={suppliers}
                  supplierRows={supplierStock[item.slug] || []}
                  onSetSupplierStock={setSupplierStockQty}
                />
              ))}
              {visibleItems.length === 0 && (
                <p className="text-sm text-obsidian/45">No SKUs match that search.</p>
              )}
            </div>
          </>
        ) : null}
    </AdminShell>
  );
}

/** The bottle sizes we actually stock — keeps `volume` values consistent across the catalog. */
const BOTTLE_VOLUMES = ['5CL', '20CL', '35CL', '50CL', '70CL', '75CL', '100CL', '150CL', '33CL × 6', '33CL × 12'];

/** Couriers the desk dispatches with. `allowCustom` covers a one-off rider. */
const COURIERS = ['GIG Logistics', 'Kwik', 'Gokada', 'Sendbox', 'Bolt Courier', 'In-house rider'];

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
        <FieldLabel>Courier</FieldLabel>
        <AdminSelect
          value={courierName}
          onChange={setCourierName}
          placeholder="Choose a courier…"
          options={COURIERS}
        />
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

/** One supplier's holding of one SKU. Saves on blur so there is no button per cell. */
function SupplierQtyField({
  supplier,
  row,
  onSave,
}: {
  supplier: SupplierLite;
  row?: SupplierStockRow;
  onSave: (qty: number) => Promise<void>;
}) {
  const [value, setValue] = useState(String(row?.onHand ?? 0));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValue(String(row?.onHand ?? 0));
  }, [row?.onHand]);

  async function commit() {
    const qty = Number(value);
    if (!Number.isFinite(qty) || qty < 0 || qty === (row?.onHand ?? 0)) {
      setValue(String(row?.onHand ?? 0));
      return;
    }
    setBusy(true);
    await onSave(qty);
    setBusy(false);
  }

  return (
    <label className="rounded-xl border border-obsidian/10 bg-paper/50 p-2.5">
      <span className="block text-[10px] font-black uppercase tracking-[0.1em] text-obsidian/45">
        {supplier.city}
      </span>
      <span className="mb-1.5 block truncate text-[11px] text-obsidian/40">{supplier.name}</span>
      <input
        type="number"
        min={0}
        value={value}
        disabled={busy}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className="w-full rounded-lg border border-obsidian/12 bg-white px-2 py-1.5 text-sm font-semibold tabular-nums text-obsidian focus:border-ember focus:ring-0 disabled:opacity-50"
      />
      <span className="mt-1 block text-[10px] text-obsidian/40">
        {row && row.reserved > 0 ? `${row.reserved} reserved · ${row.available} free` : 'none reserved'}
      </span>
    </label>
  );
}

function StockRow({
  item,
  saving,
  onSave,
  onDelete,
  onLoadForm,
  suppliers,
  supplierRows,
  onSetSupplierStock,
}: {
  item: Item;
  saving: boolean;
  onSave: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
  onLoadForm: () => void;
  suppliers: SupplierLite[];
  supplierRows: SupplierStockRow[];
  onSetSupplierStock: (supplierId: string, slug: string, onHand: number) => Promise<void>;
}) {
  const [onHand, setOnHand] = useState(String(item.on_hand));
  const [price, setPrice] = useState(item.price_ngn != null ? String(item.price_ngn) : '');
  const [cost, setCost] = useState(item.cost_ngn != null ? String(item.cost_ngn) : '');
  const [threshold, setThreshold] = useState(String(item.low_stock_threshold));
  const [tasteNote, setTasteNote] = useState(item.taste_note || '');
  const [guideOpen, setGuideOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);

  useEffect(() => {
    setOnHand(String(item.on_hand));
    setPrice(item.price_ngn != null ? String(item.price_ngn) : '');
    setCost(item.cost_ngn != null ? String(item.cost_ngn) : '');
    setThreshold(String(item.low_stock_threshold));
    setTasteNote(item.taste_note || '');
  }, [item.on_hand, item.price_ngn, item.cost_ngn, item.low_stock_threshold, item.taste_note]);

  const dirty =
    onHand !== String(item.on_hand) ||
    price !== (item.price_ngn != null ? String(item.price_ngn) : '') ||
    cost !== (item.cost_ngn != null ? String(item.cost_ngn) : '') ||
    threshold !== String(item.low_stock_threshold) ||
    tasteNote !== (item.taste_note || '');

  const margin = skuMargin(
    price === '' ? null : Number(price),
    cost === '' ? null : Number(cost)
  );

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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
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
            <FieldLabel>Cost (NGN)</FieldLabel>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className={inputClass}
              placeholder="Wholesale"
            />
          </div>
          <div>
            <FieldLabel>Retail (NGN)</FieldLabel>
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

        <div className="shrink-0 text-right min-w-[88px]">
          <FieldLabel>Margin</FieldLabel>
          {margin ? (
            <p className={`text-sm font-bold tabular-nums ${margin.negative ? 'text-red-600' : margin.low ? 'text-amber-700' : 'text-emerald-700'}`}>
              {formatNgn(margin.marginNgn)}
              <span className="block text-[11px] font-normal">{margin.marginPct}%</span>
            </p>
          ) : (
            <p className="text-sm text-obsidian/35">—</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={() =>
              onSave({
                onHand,
                priceNgn: price === '' ? undefined : price,
                costNgn: cost === '' ? null : cost,
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
            onClick={() => setStockOpen((v) => !v)}
            className={`px-3 py-2.5 border text-[10px] font-black uppercase tracking-[0.12em] ${
              stockOpen ? 'border-ember text-ember' : 'border-obsidian/15'
            }`}
          >
            {stockOpen ? 'Hide stock' : 'Suppliers'}
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

      {stockOpen && (
        <div className="pt-3 mt-3 border-t border-obsidian/10">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">
            Stock by supplier
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {suppliers.map((sup) => {
              const row = supplierRows.find((r) => r.supplierId === sup.id);
              return (
                <SupplierQtyField
                  key={sup.id}
                  supplier={sup}
                  row={row}
                  onSave={(qty) => onSetSupplierStock(sup.id, item.slug, qty)}
                />
              );
            })}
            {suppliers.length === 0 && (
              <p className="text-xs text-obsidian/45 sm:col-span-3">
                No active suppliers. Add one in the Suppliers tab, or run{' '}
                <code className="text-[11px]">npx tsx lib/db/seed-suppliers.ts</code>.
              </p>
            )}
          </div>
          <p className="mt-2 text-[11px] text-obsidian/40">
            On hand above is the total across suppliers and is recalculated from these numbers.
          </p>
        </div>
      )}

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

/**
 * Uncontrolled counterpart to `Field` for anything with a known set of values. Typing these by
 * hand is how `Whisky`, `whiskey` and `WHISKY ` all ended up in the catalog as separate categories.
 */
function SelectField({
  name,
  label,
  options,
  required,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          name={name}
          required={required}
          defaultValue={defaultValue ?? ''}
          className={`${inputClass} appearance-none pr-8`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          aria-hidden
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-obsidian/40"
        />
      </div>
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

