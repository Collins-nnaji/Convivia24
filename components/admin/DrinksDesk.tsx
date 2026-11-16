'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { PlusMinus } from './ui/DeskContent';
import Image from 'next/image';
import { FileText, Minus, Plus, Sparkles, X } from 'lucide-react';
import Modal from './ui/Modal';
import { BADGE_LABELS, CATEGORIES, CATEGORY_LABELS, PRODUCT_BADGES, formatNgn } from '@/lib/drinks/catalog';
import { skuMargin } from '@/lib/suppliers/margin';
import { derivedPackCost, isDerivedCostSku } from '@/lib/suppliers/pack-cost';
import { DEFAULT_MARKUP, quoteRetail, type MarkupPolicy } from '@/lib/pricing/checkout-fees';
import PriceListImport from './PriceListImport';
import PricePolicyBar from './PricePolicyBar';
import { useDialogs } from './ui/DialogProvider';
import { AdminInput, AdminLabel, AdminSelect, AdminTextArea, adminInputClass } from './ui/Fields';
import { readError } from './types';

type Item = {
  slug: string;
  name: string;
  on_hand: number;
  reserved: number;
  low_stock_threshold: number;
  min_order_qty: number;
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
  compare_at_ngn?: number | null;
  featured?: boolean | null;
  badge?: string | null;
  origin?: string | null;
  merch_rank?: number;
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

/** The bottle sizes we actually stock — keeps `volume` values consistent across the catalog. */
const BOTTLE_VOLUMES = ['5CL', '20CL', '35CL', '50CL', '70CL', '75CL', '100CL', '150CL', '33CL × 6', '33CL × 12'];

const EMPTY_PRODUCT = {
  name: '',
  slug: '',
  priceNgn: '',
  onHand: '',
  brand: '',
  category: '',
  volume: '',
  abv: '',
  tagline: '',
  description: '',
  tasteNote: '',
  brandOrigin: '',
  brandFounded: '',
  brandHistory: '',
  brandStyle: '',
};
type ProductForm = typeof EMPTY_PRODUCT;

function productFromItem(item: Item): ProductForm {
  return {
    ...EMPTY_PRODUCT,
    name: item.name,
    slug: item.slug,
    priceNgn: item.price_ngn != null ? String(item.price_ngn) : '',
    onHand: String(item.on_hand),
    brand: item.brand || '',
    category: item.category || '',
    volume: item.volume || '',
    abv: item.abv != null ? String(item.abv) : '',
    tagline: item.tagline || '',
    description: item.description || '',
    tasteNote: item.taste_note || '',
  };
}

export default function DrinksDesk({ onChanged }: { onChanged?: () => void }) {
  const { confirm, notify } = useDialogs();
  const [items, setItems] = useState<Item[]>([]);
  const [msg, setMsg] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingSlug, setSavingSlug] = useState('');
  const [blobOk, setBlobOk] = useState(false);
  const [aiOk, setAiOk] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [priceListOpen, setPriceListOpen] = useState(false);
  const [product, setProduct] = useState<ProductForm>(EMPTY_PRODUCT);
  const fileRef = useRef<HTMLInputElement>(null);
  /** Per-supplier holdings, keyed by SKU slug — the shop total is the sum of these. */
  const [supplierStock, setSupplierStock] = useState<Record<string, SupplierStockRow[]>>({});
  const [supplierCosts, setSupplierCosts] = useState<Record<string, Record<string, number>>>({});
  const [suppliers, setSuppliers] = useState<SupplierLite[]>([]);
  const [stockQuery, setStockQuery] = useState('');
  const [stockCategory, setStockCategory] = useState('bottles');
  const [onlyLow, setOnlyLow] = useState(false);
  const [policy, setPolicy] = useState<MarkupPolicy>(DEFAULT_MARKUP);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/inventory');
    if (!res.ok) {
      setMsg(await readError(res, 'Could not load stock.'));
      return;
    }
    const data = await res.json();
    setItems(data.items || []);
    setSupplierStock(data.supplierStock || {});
    setSupplierCosts(data.supplierCosts || {});
    setSuppliers(data.suppliers || []);
    setBlobOk(Boolean(data.blobConfigured));
    setAiOk(Boolean(data.aiConfigured));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changed = useCallback(async () => {
    await load();
    onChanged?.();
  }, [load, onChanged]);

  const setField = (field: keyof ProductForm) => (value: string) => setProduct((p) => ({ ...p, [field]: value }));

  async function saveProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const fd = new FormData();
    for (const [k, v] of Object.entries(product)) fd.set(k, v);
    const file = fileRef.current?.files?.[0];
    if (file) fd.set('image', file);
    const res = await fetch('/api/admin/inventory', { method: 'POST', body: fd });
    setLoading(false);
    if (!res.ok) {
      setMsg(await readError(res, 'Upload failed'));
      return;
    }
    const data = await res.json();
    notify(`Saved ${data.item?.name}`);
    setProduct(EMPTY_PRODUCT);
    if (fileRef.current) fileRef.current.value = '';
    setFormOpen(false);
    await changed();
  }

  function editItem(item: Item) {
    setProduct(productFromItem(item));
    setFormOpen(true);
  }

  function closeForm() {
    setProduct(EMPTY_PRODUCT);
    if (fileRef.current) fileRef.current.value = '';
    setFormOpen(false);
  }

  async function generateCopy() {
    if (!product.name.trim()) {
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
        name: product.name,
        brand: product.brand,
        category: product.category || 'spirits',
        abv: product.abv ? Number(product.abv) : undefined,
        volume: product.volume,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setMsg(await readError(res, 'AI unavailable'));
      return;
    }
    const { copy = {} } = await res.json();
    setProduct((p) => ({
      ...p,
      tagline: copy.tagline || p.tagline,
      description: copy.description || p.description,
      tasteNote: copy.tasteNote || p.tasteNote,
      brandOrigin: copy.brandOrigin || p.brandOrigin,
      brandFounded: copy.brandFounded || p.brandFounded,
      brandHistory: copy.brandHistory || p.brandHistory,
      brandStyle: copy.brandStyle || p.brandStyle,
    }));
    setMsg('AI copy filled — review and save.');
  }

  async function askAdvice() {
    setLoading(true);
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ai-list' }),
    });
    setLoading(false);
    if (!res.ok) {
      setMsg(await readError(res, 'AI unavailable'));
      return;
    }
    const data = await res.json();
    setAdvice(data.advice || '');
  }

  async function saveStock(slug: string, patch: Record<string, unknown>) {
    setSavingSlug(slug);
    setMsg('');
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'adjust', slug, ...patch }),
    });
    setSavingSlug('');
    if (!res.ok) {
      setMsg(await readError(res, 'Could not update stock.'));
      return;
    }
    const data = await res.json();
    setItems((rows) => rows.map((row) => (row.slug === slug ? { ...row, ...(data.item as Item), tracked: true } : row)));
    notify(`Updated ${data.item?.name || slug}`);
    onChanged?.();
  }

  async function deleteStock(item: Item) {
    const ok = await confirm({
      title: 'Delete from inventory?',
      message: (
        <>
          <strong>{item.name}</strong> is removed from the stock list along with its supplier holdings and quotes.
          Existing orders keep their line items.
        </>
      ),
      confirmLabel: 'Delete SKU',
      tone: 'danger',
    });
    if (!ok) return;
    setSavingSlug(item.slug);
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', slug: item.slug }),
    });
    setSavingSlug('');
    if (!res.ok) {
      setMsg(await readError(res, 'Could not delete item.'));
      return;
    }
    setItems((rows) => rows.filter((r) => r.slug !== item.slug));
    notify(`Deleted ${item.name}`);
    onChanged?.();
  }

  async function setSupplierStockQty(supplierId: string, slug: string, onHand: number) {
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'supplier-stock', supplierId, slug, onHand }),
    });
    if (!res.ok) {
      notify(await readError(res, 'Could not update supplier stock.'), 'error');
      return;
    }
    const data = await res.json();
    setSupplierStock((prev) => ({ ...prev, [slug]: data.rows || [] }));
    // The SKU's headline on-hand is derived from these, so pull the row totals back in.
    await changed();
  }

  async function setSupplierCost(supplierId: string, slug: string, costNgn: number) {
    const res = await fetch('/api/admin/supplier-prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierId, slug, costNgn }),
    });
    if (!res.ok) {
      notify(await readError(res, 'Could not update supplier cost.'), 'error');
      return;
    }
    setSupplierCosts((current) => ({ ...current, [slug]: { ...(current[slug] || {}), [supplierId]: costNgn } }));
    await load();
  }

  /** Live-stock list after the desk's own search and category narrowing. */
  const visibleItems = useMemo(() => {
    const q = stockQuery.trim().toLowerCase();
    return items.filter((it) => {
      if (stockCategory === 'bottles' && it.category === 'party-packs') return false;
      if (stockCategory !== 'all' && stockCategory !== 'bottles' && it.category !== stockCategory) return false;
      if (onlyLow && !(it.tracked !== false && it.available <= it.low_stock_threshold)) return false;
      if (!q) return true;
      return `${it.name} ${it.brand ?? ''} ${it.slug}`.toLowerCase().includes(q);
    });
  }, [items, stockQuery, stockCategory, onlyLow]);

  const lowCount = items.filter((it) => it.tracked !== false && it.available <= it.low_stock_threshold).length;

  return (
    <>
      {msg && <p className="mb-3 text-sm text-ember">{msg}</p>}
      {advice && (
        <div className="relative mb-4 whitespace-pre-wrap bg-white p-4 pr-12 text-sm leading-relaxed text-obsidian/70 rounded-lg">
          {advice}
          <button
            type="button"
            onClick={() => setAdvice('')}
            aria-label="Dismiss advice"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-obsidian/65 hover:bg-obsidian/[0.05] hover:text-obsidian"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <Modal
        open={formOpen}
        size="lg"
        title={product.slug ? `Edit ${product.name || product.slug}` : 'Add a drink'}
        description={product.slug ? 'Changes go live in the shop on save.' : 'Name, price and stock are enough to list it — the rest can come later.'}
        onClose={closeForm}
        footer={
          <>
            <button type="button" onClick={closeForm} className="rounded-full border border-obsidian/15 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-obsidian/70 hover:bg-obsidian/[0.04]">
              {product.slug ? 'Discard' : 'Cancel'}
            </button>
            <button type="submit" form="admin-product-form" disabled={loading} className="btn-brand rounded-full px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] disabled:opacity-50">
              {loading ? 'Saving…' : 'Save to shop'}
            </button>
          </>
        }
      >
        <form id="admin-product-form" onSubmit={saveProduct} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput label="Name" value={product.name} onChange={(e) => setField('name')(e.target.value)} required />
            <AdminInput label="Slug" hint="optional — auto from name" value={product.slug} onChange={(e) => setField('slug')(e.target.value)} placeholder="auto-from-name" />
            <AdminInput label="Price (NGN)" type="number" min={1} value={product.priceNgn} onChange={(e) => setField('priceNgn')(e.target.value)} required />
            <AdminInput label="On hand" type="number" min={0} value={product.onHand} onChange={(e) => setField('onHand')(e.target.value)} required />
            <AdminInput label="Brand" value={product.brand} onChange={(e) => setField('brand')(e.target.value)} />
            <AdminSelect
              label="Category"
              value={product.category}
              onChange={setField('category')}
              placeholder="Choose a category…"
              options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
            />
            <AdminSelect label="Volume" value={product.volume} onChange={setField('volume')} placeholder="Choose a size…" options={BOTTLE_VOLUMES} />
            <AdminInput label="ABV %" type="number" step="0.1" min={0} value={product.abv} onChange={(e) => setField('abv')(e.target.value)} />
          </div>
          <AdminInput label="Tagline" value={product.tagline} onChange={(e) => setField('tagline')(e.target.value)} />
          <AdminTextArea label="Description" rows={2} value={product.description} onChange={(e) => setField('description')(e.target.value)} />
          <AdminTextArea
            label="Taste note (bottle guide)"
            placeholder="What it tastes like — one sentence"
            rows={2}
            value={product.tasteNote}
            onChange={(e) => setField('tasteNote')(e.target.value)}
          />
          <div className="border-t border-obsidian/8 pt-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-obsidian/55">
              Brand story (optional — shared across same brand)
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminInput label="Brand origin" placeholder="Cognac, France" value={product.brandOrigin} onChange={(e) => setField('brandOrigin')(e.target.value)} />
              <AdminInput label="Founded" placeholder="1765" value={product.brandFounded} onChange={(e) => setField('brandFounded')(e.target.value)} />
            </div>
            <div className="mt-4 space-y-4">
              <AdminTextArea label="Brand history (short)" placeholder="2–3 sentences" rows={3} value={product.brandHistory} onChange={(e) => setField('brandHistory')(e.target.value)} />
              <AdminInput label="Brand style" value={product.brandStyle} onChange={(e) => setField('brandStyle')(e.target.value)} />
            </div>
          </div>
          <button
            type="button"
            onClick={generateCopy}
            disabled={loading || !aiOk}
            title={aiOk ? undefined : 'Azure OpenAI is not configured'}
            className="inline-flex items-center gap-1.5 border border-obsidian/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-obsidian/60 hover:text-ember disabled:opacity-40"
          >
            <Sparkles size={13} /> {loading ? 'Generating…' : 'Generate copy with AI'}
          </button>
          <div>
            <AdminLabel hint={blobOk ? undefined : 'Azure Storage not configured — images will be rejected'}>Product image</AdminLabel>
            <input ref={fileRef} name="image" type="file" accept="image/*" className="text-sm" />
          </div>
        </form>
      </Modal>

      {/* Same disclosure treatment as Add / update stock — both are occasional tasks. */}
      <Disclosure
        open={priceListOpen}
        onToggle={() => setPriceListOpen((v) => !v)}
        icon={<FileText size={17} />}
        title="Scan a supplier price list"
        hint="Paste the list or upload a photo — review every change before it applies."
      >
        <div className="border-t border-obsidian/8 p-3 sm:p-4">
          <PriceListImport onApplied={changed} />
        </div>
      </Disclosure>

      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold">Live stock</h2>
        <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setProduct(EMPTY_PRODUCT);
            setFormOpen(true);
          }}
          className="btn-brand inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
        >
          <Plus size={13} /> Add a drink
        </button>
        <button
          type="button"
          onClick={askAdvice}
          disabled={loading || !aiOk}
          title={aiOk ? undefined : 'Azure OpenAI is not configured'}
          className="inline-flex items-center gap-1.5 rounded-full border border-obsidian/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-obsidian/70 transition-colors hover:bg-obsidian/[0.04] disabled:opacity-40"
        >
          <Sparkles size={13} /> AI stock advice
        </button>
        </div>
      </div>
      <p className="mb-3 text-sm text-obsidian/65">
        Retail, wholesale cost and margin per SKU. Suggested prices follow the markup and the Flutterwave and Access Bank fees.
      </p>
      <PricePolicyBar onChange={setPolicy} />

      {/* Party packs outnumber bottles roughly two to one, so the list needs narrowing. */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={stockQuery}
          onChange={(e) => setStockQuery(e.target.value)}
          placeholder="Search SKU, brand…"
          aria-label="Search stock"
          className={`${adminInputClass} w-52 py-2`}
        />
        <AdminSelect
          value={stockCategory}
          onChange={setStockCategory}
          options={[
            { value: 'all', label: 'All categories' },
            { value: 'bottles', label: 'Bottles only (no packs)' },
            ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
          ]}
          className="w-auto py-2"
        />
        <button
          type="button"
          aria-pressed={onlyLow}
          onClick={() => setOnlyLow((v) => !v)}
          className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
            onlyLow ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-obsidian/12 text-obsidian/55 hover:border-amber-400'
          }`}
        >
          Low stock{lowCount > 0 ? ` (${lowCount})` : ''}
        </button>
        <span className="text-xs text-obsidian/60">
          {visibleItems.length} of {items.length}
          {suppliers.length ? ` · ${suppliers.length} supplier${suppliers.length === 1 ? '' : 's'}` : ''}
        </span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-obsidian/15 bg-white">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead className="bg-obsidian text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-white/85">
            <tr>
              <th className="w-11 py-2.5 pl-3 pr-1" aria-label="Expand" />
              <th className="py-2.5 pr-3">Product</th>
              <th className="px-2 py-2.5 text-right">On hand</th>
              <th className="px-2 py-2.5 text-right">Cost</th>
              <th className="px-2 py-2.5 text-right">Retail (₦)</th>
              <th className="px-2 py-2.5 text-right">Margin</th>
              <th className="px-2 py-2.5">Status</th>
              <th className="py-2.5 pl-2 pr-3" aria-label="Save" />
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => (
              <StockRow
                key={item.slug}
                item={item}
                saving={savingSlug === item.slug}
                onSave={(patch) => saveStock(item.slug, patch)}
                onDelete={() => deleteStock(item)}
                onEdit={() => editItem(item)}
                suppliers={suppliers}
                supplierRows={supplierStock[item.slug] || []}
                supplierCosts={supplierCosts[item.slug] || {}}
                onSetSupplierStock={setSupplierStockQty}
                onSetSupplierCost={setSupplierCost}
                defaultCostOf={(slug) => items.find((i) => i.slug === slug)?.cost_ngn ?? null}
                policy={policy}
              />
            ))}
          </tbody>
        </table>
        {visibleItems.length === 0 && (
          <p className="p-4 text-sm text-obsidian/60">
            {items.length === 0 ? 'No stock yet — add your first bottle above.' : 'No SKUs match that search.'}
          </p>
        )}
      </div>
    </>
  );
}

function Disclosure({
  open,
  onToggle,
  icon,
  title,
  hint,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-obsidian/10 bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-obsidian/[0.02] sm:px-6"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember/10 text-ember">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-obsidian">{title}</span>
          <span className="block truncate text-xs text-obsidian/60">{hint}</span>
        </span>
        <PlusMinus open={open} />
      </button>
      {open && children}
    </div>
  );
}

/** One supplier's holding of one SKU. Saves on blur so there is no button per cell. */
function SupplierQtyField({
  supplier,
  row,
  costNgn,
  retailNgn,
  derivedCost = false,
  onSave,
  onSaveCost,
}: {
  supplier: SupplierLite;
  row?: SupplierStockRow;
  costNgn?: number;
  retailNgn: number | null;
  derivedCost?: boolean;
  onSave: (qty: number) => Promise<void>;
  onSaveCost: (cost: number) => Promise<void>;
}) {
  const [value, setValue] = useState(String(row?.onHand ?? 0));
  const [cost, setCost] = useState(costNgn == null ? '' : String(costNgn));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValue(String(row?.onHand ?? 0));
  }, [row?.onHand]);
  useEffect(() => setCost(costNgn == null ? '' : String(costNgn)), [costNgn]);

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

  async function commitCost() {
    const next = Number(cost);
    if (!Number.isFinite(next) || next < 0 || next === costNgn) {
      setCost(costNgn == null ? '' : String(costNgn));
      return;
    }
    setBusy(true);
    await onSaveCost(next);
    setBusy(false);
  }

  const margin = skuMargin(retailNgn, cost === '' ? null : Number(cost));
  const cell =
    'w-full rounded-lg border border-obsidian/12 bg-white px-2 py-1.5 text-sm font-semibold tabular-nums text-obsidian focus:border-ember focus:ring-0 disabled:opacity-50';

  return (
    <div className="rounded-xl border border-obsidian/10 bg-paper/50 p-2.5">
      <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-obsidian/60">{supplier.city}</span>
      <span className="mb-1.5 block truncate text-[11px] text-obsidian/55">{supplier.name}</span>
      <label className="block text-[10px] text-obsidian/55">
        Stock
        <input
          type="number"
          min={0}
          value={value}
          disabled={busy}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className={cell}
        />
      </label>
      <label className="mt-1.5 block text-[10px] text-obsidian/55">
        Unit cost{derivedCost ? ' · from bottles' : ''}
        <input
          type="number"
          min={0}
          value={cost}
          disabled={busy || derivedCost}
          readOnly={derivedCost}
          title={derivedCost ? 'Summed from the bottles in the pack' : undefined}
          onChange={(e) => setCost(e.target.value)}
          onBlur={commitCost}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className={cell}
        />
      </label>
      <span className="mt-1 block text-[10px] text-obsidian/55">
        {row && row.reserved > 0 ? `${row.reserved} reserved · ${row.available} free` : 'none reserved'}
      </span>
      <span className={`mt-1 block text-[10px] font-semibold ${margin?.negative ? 'text-red-600' : 'text-emerald-700'}`}>
        {margin ? `${formatNgn(margin.marginNgn)} · ${margin.marginPct}% margin` : 'Add cost for margin'}
      </span>
    </div>
  );
}

type Movement = { id: string; deltaOnHand: number; deltaReserved: number; reason: string; orderId: string | null; note: string | null; actor: string; actorLabel: string | null; supplierName: string | null; createdAt: string };

const REASON_LABEL: Record<string, string> = {
  reserve: 'Reserved',
  release: 'Released',
  fulfill: 'Delivered',
  adjust: 'Adjusted',
  restock: 'Restocked',
  manual: 'Manual',
  admin_upload: 'Uploaded',
  sync: 'Synced',
  'cost.set': 'Supplier cost changed',
  'cost.remove': 'Supplier cost removed',
};

/** The national ledger for one SKU — what moved, why, and which order did it. */
function StockHistory({ slug, saving, item }: { slug: string; saving: boolean; item: Item }) {
  const [rows, setRows] = useState<Movement[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    fetch(`/api/admin/inventory/movements?slug=${encodeURIComponent(slug)}&limit=40`)
      .then(async (res) => {
        if (!live) return;
        if (!res.ok) {
          setError(await readError(res, 'Could not load history.'));
          return;
        }
        setRows((await res.json()).movements || []);
      })
      .catch(() => live && setError('Could not load history.'));
    return () => {
      live = false;
    };
  }, [slug, saving, item]);

  if (error) return <p className="text-xs text-ember">{error}</p>;
  if (rows === null) return <p className="text-xs text-obsidian/55">Loading…</p>;
  if (rows.length === 0) return <p className="text-xs text-obsidian/55">No movements recorded for this SKU yet.</p>;
  const delta = (n: number) => (n === 0 ? '·' : n > 0 ? `+${n}` : String(n));
  return (
    <table className="w-full text-xs">
      <thead className="text-[10px] font-bold uppercase tracking-[0.12em] text-obsidian/55">
        <tr>
          <th className="py-1 text-left">When</th>
          <th className="py-1 text-left">What</th>
          <th className="py-1 text-left">Who</th>
          <th className="py-1 text-right">On hand</th>
          <th className="py-1 text-right">Reserved</th>
          <th className="py-1 text-left pl-3">Note</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-obsidian/6">
        {rows.map((m) => (
          <tr key={m.id}>
            <td className="py-1.5 tabular-nums text-obsidian/65">
              {new Date(m.createdAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' })}
            </td>
            <td className="py-1.5 font-semibold text-obsidian/70">{REASON_LABEL[m.reason] ?? m.reason}</td>
            <td className="py-1.5 text-obsidian/55">{m.actor === 'supplier' ? m.supplierName || 'Supplier' : m.actor === 'admin' ? m.actorLabel || 'Desk' : 'System'}</td>
            <td className={`py-1.5 text-right tabular-nums ${m.deltaOnHand < 0 ? 'text-red-600' : m.deltaOnHand > 0 ? 'text-emerald-700' : 'text-obsidian/65'}`}>{delta(m.deltaOnHand)}</td>
            <td className={`py-1.5 text-right tabular-nums ${m.deltaReserved !== 0 ? 'text-obsidian/70' : 'text-obsidian/65'}`}>{delta(m.deltaReserved)}</td>
            <td className="py-1.5 pl-3 text-obsidian/65">
              {m.supplierName && <span>{m.supplierName}: </span>}{m.note || '—'}
              {m.orderId && <span className="ml-1 font-mono text-[10px] text-obsidian/65">{m.orderId.slice(0, 8).toUpperCase()}</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StockRow({
  item,
  saving,
  onSave,
  onDelete,
  onEdit,
  suppliers,
  supplierRows,
  supplierCosts,
  onSetSupplierStock,
  onSetSupplierCost,
  defaultCostOf,
  policy,
}: {
  item: Item;
  saving: boolean;
  onSave: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
  onEdit: () => void;
  suppliers: SupplierLite[];
  supplierRows: SupplierStockRow[];
  supplierCosts: Record<string, number>;
  onSetSupplierStock: (supplierId: string, slug: string, onHand: number) => Promise<void>;
  onSetSupplierCost: (supplierId: string, slug: string, costNgn: number) => Promise<void>;
  /** Default cost of another SKU — lets a pack sum its bottles. */
  defaultCostOf: (slug: string) => number | null;
  policy: MarkupPolicy;
}) {
  const [onHand, setOnHand] = useState(String(item.on_hand));
  const [price, setPrice] = useState(item.price_ngn != null ? String(item.price_ngn) : '');
  const [cost, setCost] = useState(item.cost_ngn != null ? String(item.cost_ngn) : '');
  const [threshold, setThreshold] = useState(String(item.low_stock_threshold));
  const [minOrder, setMinOrder] = useState(String(item.min_order_qty ?? 1));
  const [tasteNote, setTasteNote] = useState(item.taste_note || '');

  useEffect(() => {
    setOnHand(String(item.on_hand));
    setPrice(item.price_ngn != null ? String(item.price_ngn) : '');
    setCost(item.cost_ngn != null ? String(item.cost_ngn) : '');
    setThreshold(String(item.low_stock_threshold));
    setMinOrder(String(item.min_order_qty ?? 1));
    setTasteNote(item.taste_note || '');
  }, [item.on_hand, item.price_ngn, item.cost_ngn, item.low_stock_threshold, item.min_order_qty, item.taste_note]);

  const derived = supplierRows.some((r) => r.onHand > 0 || r.reserved > 0);
  const dirty =
    (!derived && onHand !== String(item.on_hand)) ||
    price !== (item.price_ngn != null ? String(item.price_ngn) : '') ||
    (!isDerivedCostSku(item.slug) && cost !== (item.cost_ngn != null ? String(item.cost_ngn) : '')) ||
    threshold !== String(item.low_stock_threshold) ||
    minOrder !== String(item.min_order_qty ?? 1) ||
    tasteNote !== (item.taste_note || '');

  // Once any supplier holds this bottle, on-hand is the sum of their shelves — editing the SKU
  // directly would only be overwritten by the next rollup, so the field goes read-only.
  const quotes = Object.entries(supplierCosts).map(([id, c]) => ({ id, cost: c })).sort((a, b) => a.cost - b.cost);
  const bestQuote = quotes[0];
  const bestSupplier = bestQuote ? supplierRows.find((r) => r.supplierId === bestQuote.id)?.supplierName : undefined;
  // A party pack's cost is the sum of its bottles — never typed. `supplierCosts` for packs already
  // arrives summed per supplier from the API; the default falls back to the bottles' defaults.
  const isPack = isDerivedCostSku(item.slug);
  const packDefault = isPack ? derivedPackCost(item.slug, defaultCostOf) : null;
  // Margin is against what we would actually pay: the cheapest real quote, else the default cost.
  const effectiveCost = bestQuote ? bestQuote.cost : isPack ? packDefault : cost === '' ? null : Number(cost);
  const margin = skuMargin(price === '' ? null : Number(price), effectiveCost);
  const quote = typeof effectiveCost === 'number' ? quoteRetail(effectiveCost, policy) : null;
  const belowQuote = quote != null && price !== '' && Number(price) < quote.suggestedNgn;
  const lowStock = item.tracked !== false && item.available <= item.low_stock_threshold;
  const chips: { label: string; tone?: string }[] = [
    ...(item.tracked === false ? [{ label: isPack ? 'Stock comes from bottles' : 'Not tracked yet', tone: isPack ? 'text-obsidian/60' : 'text-amber-700' }] : []),
    ...(item.brand ? [{ label: item.brand }] : []),
    ...(item.reserved > 0 ? [{ label: `${item.reserved} reserved` }] : []),
    ...(lowStock ? [{ label: 'Low', tone: 'text-amber-700' }] : []),
    ...(!item.active ? [{ label: 'Off shop', tone: 'text-red-600' }] : []),
    ...(item.taste_note ? [] : [{ label: 'No guide' }]),
    ...(item.featured ? [{ label: 'Featured', tone: 'text-ember' }] : []),
    ...(item.compare_at_ngn && item.price_ngn && item.compare_at_ngn > item.price_ngn
      ? [{ label: `Save ${formatNgn(item.compare_at_ngn - item.price_ngn)}`, tone: 'text-emerald-700' }]
      : []),
    ...(item.badge && item.badge in BADGE_LABELS ? [{ label: BADGE_LABELS[item.badge as keyof typeof BADGE_LABELS] }] : []),
  ];
  const cell = `${adminInputClass} h-9 w-full py-1.5 text-right tabular-nums`;
  const btn = 'rounded-md border border-obsidian/20 bg-white px-2.5 py-1.5 text-xs font-semibold text-obsidian/80 hover:border-obsidian disabled:opacity-40';
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<DrawerPane>('settings');
  // The drawer's old one-off toggles now open the matching pane.
  const show = (pane: DrawerPane) => {
    setPanel(pane);
    setOpen(true);
  };
  const status: { label: string; tone: string }[] = [
    item.active ? { label: 'Listed', tone: 'bg-emerald-50 text-emerald-800 ring-emerald-200' } : { label: 'Off shop', tone: 'bg-red-50 text-red-700 ring-red-200' },
    ...(lowStock ? [{ label: 'Low stock', tone: 'bg-amber-50 text-amber-800 ring-amber-200' }] : []),
    ...(item.featured ? [{ label: 'Featured', tone: 'bg-ember/10 text-ember ring-ember/20' }] : []),
  ];
  const save = () =>
    onSave({
      ...(derived ? {} : { onHand }),
      priceNgn: price === '' ? undefined : price,
      ...(isPack ? {} : { costNgn: cost === '' ? null : cost }),
      lowStockThreshold: threshold,
      minOrderQty: minOrder,
      tasteNote,
    });
  const panes: { key: DrawerPane; label: string }[] = [
    { key: 'settings', label: 'Stock rules' },
    ...(suppliers.length > 0 ? [{ key: 'suppliers' as const, label: `Suppliers (${suppliers.length})` }] : []),
    { key: 'merch', label: 'Merchandising' },
    { key: 'guide', label: 'Taste guide' },
    { key: 'history', label: 'History' },
  ];

  return (
    <>
      <tr className={`border-t border-obsidian/10 align-middle ${open ? 'bg-shell' : 'bg-white hover:bg-obsidian/[0.025]'}`}>
        <td className="w-11 py-2 pl-3 pr-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? `Collapse ${item.name}` : `Expand ${item.name}`}
            className={`grid h-7 w-7 place-items-center rounded-md border transition-colors ${
              open ? 'border-obsidian bg-obsidian text-white' : 'border-obsidian/20 text-obsidian/70 hover:border-obsidian hover:text-obsidian'
            }`}
          >
            {open ? <Minus size={14} /> : <Plus size={14} />}
          </button>
        </td>
        <td className="py-2 pr-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-14 w-11 shrink-0 place-items-center overflow-hidden rounded-md bg-shell ring-1 ring-obsidian/10">
              {item.image_url ? (
                <Image src={item.image_url} alt="" width={44} height={56} className="h-14 w-11 object-contain" />
              ) : (
                <span className="text-[9px] font-bold uppercase text-obsidian/55">No pic</span>
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-obsidian">{item.name}</p>
              <p className="truncate text-xs text-obsidian/60">
                {[item.brand, item.category ? CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] ?? item.category : null, item.volume]
                  .filter(Boolean)
                  .join(' · ') || item.slug}
              </p>
              {chips.length > 0 && (
                <p className="mt-0.5 truncate text-[11px] text-obsidian/55">
                  {chips
                    .filter((c) => c.label !== item.brand && c.label !== 'Low' && c.label !== 'Off shop' && c.label !== 'Featured')
                    .map((c) => c.label)
                    .join(' · ')}
                </p>
              )}
            </div>
          </div>
        </td>
        <td className="w-28 px-2 py-2 text-right">
          {derived ? (
            <button
              type="button"
              onClick={() => show('suppliers')}
              title="Held by suppliers — set per supplier"
              className="w-full rounded-md border border-dashed border-obsidian/25 px-2 py-1.5 text-right text-sm font-semibold tabular-nums hover:border-ember"
            >
              {item.on_hand}
            </button>
          ) : (
            <input aria-label="On hand" type="number" min={0} inputMode="numeric" value={onHand} onChange={(e) => setOnHand(e.target.value)} className={cell} />
          )}
          <p className="mt-0.5 text-[11px] tabular-nums text-obsidian/55">{item.available} free</p>
        </td>
        <td className="w-32 px-2 py-2 text-right">
          {bestQuote ? (
            <button type="button" onClick={() => show('suppliers')} title="Quotes per supplier" className="w-full text-right">
              <span className="block text-sm font-semibold tabular-nums text-obsidian">{formatNgn(bestQuote.cost)}</span>
              <span className="block truncate text-[11px] text-obsidian/55">{bestSupplier || 'best quote'}</span>
            </button>
          ) : isPack ? (
            <span title="Summed from the pack's bottles">
              <span className="block text-sm font-semibold tabular-nums text-obsidian/80">{packDefault != null ? formatNgn(packDefault) : '—'}</span>
              <span className="block text-[11px] text-obsidian/55">from bottles</span>
            </span>
          ) : (
            <input aria-label="Default cost" type="number" min={0} inputMode="numeric" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Cost" className={cell} />
          )}
        </td>
        <td className="w-32 px-2 py-2 text-right">
          <input aria-label="Retail price" type="number" min={0} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className={cell} />
          {quote && String(quote.suggestedNgn) !== price && (
            <button
              type="button"
              onClick={() => setPrice(String(quote.suggestedNgn))}
              title={`Cost ${formatNgn(quote.costNgn)}, Access ${formatNgn(quote.nipNgn + quote.camfNgn + quote.smsNgn)}, markup ${formatNgn(quote.markupNgn)}, Flutterwave ${formatNgn(quote.flutterwaveNgn)}`}
              className={`mt-0.5 text-[11px] font-semibold ${belowQuote ? 'text-ember' : 'text-obsidian/60 hover:text-ember'}`}
            >
              Use {formatNgn(quote.suggestedNgn)}
            </button>
          )}
        </td>
        <td className="w-24 px-2 py-2 text-right">
          {margin ? (
            <p className={`text-sm font-bold tabular-nums ${margin.negative ? 'text-red-600' : margin.low ? 'text-amber-700' : 'text-emerald-700'}`}>
              {formatNgn(margin.marginNgn)}
              <span className="block text-[11px] font-semibold">{margin.marginPct}%</span>
            </p>
          ) : (
            <p className="text-sm text-obsidian/55">—</p>
          )}
        </td>
        <td className="w-32 px-2 py-2">
          <div className="flex flex-wrap gap-1">
            {status.map((st) => (
              <span key={st.label} className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${st.tone}`}>
                {st.label}
              </span>
            ))}
          </div>
        </td>
        <td className="w-24 py-2 pl-2 pr-3 text-right">
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={save}
            className="btn-brand h-9 rounded-md px-3 text-xs font-bold disabled:opacity-30"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </td>
      </tr>

      {open && (
        <tr className="bg-shell">
          <td />
          <td colSpan={7} className="pb-4 pr-3">
            <div className="overflow-hidden rounded-lg border border-obsidian/15 bg-white">
              <div className="flex flex-wrap items-center gap-1 border-b border-obsidian/10 bg-obsidian/[0.03] px-2 py-1.5">
                {panes.map((pn) => (
                  <button
                    key={pn.key}
                    type="button"
                    onClick={() => setPanel(pn.key)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                      panel === pn.key ? 'bg-obsidian text-white' : 'text-obsidian/70 hover:bg-obsidian/[0.06] hover:text-obsidian'
                    }`}
                  >
                    {pn.label}
                  </button>
                ))}
                <span className="flex-1" />
                <button type="button" disabled={saving} onClick={() => onSave({ active: !item.active })} className={btn}>
                  {item.active ? 'Hide from shop' : 'List in shop'}
                </button>
                <button type="button" onClick={onEdit} className={btn}>
                  Edit details &amp; photo
                </button>
                <button type="button" disabled={saving} onClick={onDelete} className={`${btn} border-red-300 text-red-700 hover:bg-red-50`}>
                  Delete
                </button>
              </div>

              <div className="p-3">
                {panel === 'settings' && (
                  <div className="grid max-w-xl gap-3 sm:grid-cols-2">
                    <AdminInput label="Low-stock alert at" hint="flags the row amber" type="number" min={0} inputMode="numeric" value={threshold} onChange={(e) => setThreshold(e.target.value)} className={`${adminInputClass} h-9 py-1.5`} />
                    <AdminInput label="Minimum order" hint="checkout floor" type="number" min={1} max={24} inputMode="numeric" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className={`${adminInputClass} h-9 py-1.5`} />
                    <p className="text-xs text-obsidian/60 sm:col-span-2">
                      {item.reserved > 0 ? `${item.reserved} reserved by open orders. ` : ''}Use the row&apos;s Save button to apply.
                    </p>
                  </div>
                )}

                {panel === 'suppliers' && (
                  <div>
                    <div className="grid max-w-2xl gap-2">
                      {suppliers.map((sup) => (
                        <SupplierQtyField
                          key={sup.id}
                          supplier={sup}
                          row={supplierRows.find((r) => r.supplierId === sup.id)}
                          costNgn={supplierCosts[sup.id]}
                          retailNgn={item.price_ngn}
                          derivedCost={isPack}
                          onSave={(qty) => onSetSupplierStock(sup.id, item.slug, qty)}
                          onSaveCost={(costNgn) => onSetSupplierCost(sup.id, item.slug, costNgn)}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-obsidian/60">
                      Shelf count and wholesale price per supplier. The cheapest quote drives the margin column.
                    </p>
                  </div>
                )}

                {panel === 'merch' && <MerchPanel item={item} retailNgn={price === '' ? item.price_ngn : Number(price)} saving={saving} onSave={onSave} />}

                {panel === 'history' && <StockHistory slug={item.slug} saving={saving} item={item} />}

                {panel === 'guide' && (
                  <div className="max-w-2xl space-y-2">
                    <AdminTextArea
                      label="Taste note (bottle guide ⓘ)"
                      value={tasteNote}
                      onChange={(e) => setTasteNote(e.target.value)}
                      rows={2}
                      placeholder="What it tastes like — one sentence"
                    />
                    <p className="text-xs text-obsidian/60">
                      Saved with the row&apos;s Save button. For the full brand story use{' '}
                      <button type="button" onClick={onEdit} className="font-semibold text-ember underline">
                        Edit details
                      </button>
                      .
                    </p>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

type DrawerPane = 'settings' | 'suppliers' | 'merch' | 'guide' | 'history';

/**
 * How the bottle is sold on the storefront: Handpicked, the SAVE badge, the ribbon and the Country
 * facet. Saved through the same audited `adjust` action as stock and price.
 */
function MerchPanel({
  item,
  retailNgn,
  saving,
  onSave,
}: {
  item: Item;
  retailNgn: number | null;
  saving: boolean;
  onSave: (patch: Record<string, unknown>) => void;
}) {
  const [featured, setFeatured] = useState(Boolean(item.featured));
  const [compareAt, setCompareAt] = useState(item.compare_at_ngn != null ? String(item.compare_at_ngn) : '');
  const [badge, setBadge] = useState(item.badge || '');
  const [origin, setOrigin] = useState(item.origin || '');
  const [rank, setRank] = useState(String(item.merch_rank ?? 0));

  const was = compareAt === '' ? null : Number(compareAt);
  const saving_ = was != null && retailNgn != null && was > retailNgn ? was - retailNgn : 0;
  const dirty =
    featured !== Boolean(item.featured) ||
    compareAt !== (item.compare_at_ngn != null ? String(item.compare_at_ngn) : '') ||
    badge !== (item.badge || '') ||
    origin !== (item.origin || '') ||
    rank !== String(item.merch_rank ?? 0);

  return (
    <div className="space-y-3 border-t border-obsidian/10 pt-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-obsidian/55">Storefront merchandising</p>
      <div className="grid gap-3 sm:grid-cols-5">
        <label className="flex items-center gap-2 self-end rounded-lg border border-obsidian/12 px-3 py-2.5 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded text-ember focus:ring-ember" />
          Handpicked (home)
        </label>
        <div>
          <AdminInput
            label="Was price (NGN)"
            hint="blank = no offer"
            type="number"
            min={0}
            inputMode="numeric"
            value={compareAt}
            onChange={(e) => setCompareAt(e.target.value)}
            className={`${adminInputClass} py-2`}
          />
          <p className={`mt-1 text-[11px] font-semibold ${saving_ ? 'text-emerald-700' : 'text-obsidian/55'}`}>
            {saving_ ? `Shows SAVE ${formatNgn(saving_)}` : was != null ? 'Must be above retail to show an offer' : 'Not on offer'}
          </p>
        </div>
        <AdminSelect
          label="Ribbon"
          value={badge}
          onChange={setBadge}
          placeholder="None"
          options={PRODUCT_BADGES.map((b) => ({ value: b, label: BADGE_LABELS[b] }))}
        />
        <AdminInput label="Country" placeholder="Scotland" value={origin} onChange={(e) => setOrigin(e.target.value)} className={`${adminInputClass} py-2`} />
        <AdminInput label="Rank" hint="higher shows first" type="number" inputMode="numeric" value={rank} onChange={(e) => setRank(e.target.value)} className={`${adminInputClass} py-2`} />
      </div>
      <button
        type="button"
        disabled={saving || !dirty}
        onClick={() => onSave({ featured, compareAtNgn: compareAt, badge, origin, merchRank: rank || 0 })}
        className="btn-brand px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] disabled:opacity-35"
      >
        {saving ? '…' : 'Save merchandising'}
      </button>
    </div>
  );
}
