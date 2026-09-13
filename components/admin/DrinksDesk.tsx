'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { ChevronDown, FileText, Plus, Sparkles, X } from 'lucide-react';
import Modal from './ui/Modal';
import { CATEGORIES, CATEGORY_LABELS, formatNgn } from '@/lib/drinks/catalog';
import { skuMargin } from '@/lib/suppliers/margin';
import { derivedPackCost, isDerivedCostSku } from '@/lib/suppliers/pack-cost';
import PriceListImport from './PriceListImport';
import { useDialogs } from './ui/DialogProvider';
import { AdminInput, AdminLabel, AdminSelect, AdminTextArea, adminInputClass } from './ui/Fields';
import { readError } from './types';

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
  const [visibleSupplierIds, setVisibleSupplierIds] = useState<string[]>([]);
  const [stockQuery, setStockQuery] = useState('');
  const [stockCategory, setStockCategory] = useState('bottles');
  const [onlyLow, setOnlyLow] = useState(false);

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
    setVisibleSupplierIds((current) =>
      current.length ? current : (data.suppliers || []).slice(0, 3).map((supplier: SupplierLite) => supplier.id)
    );
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
  const visibleSuppliers = suppliers.filter((s) => visibleSupplierIds.includes(s.id));

  return (
    <>
      {msg && <p className="mb-6 text-sm text-ember">{msg}</p>}
      {advice && (
        <div className="relative mb-8 whitespace-pre-wrap bg-white p-5 pr-12 text-sm leading-relaxed text-obsidian/70 shadow-sm">
          {advice}
          <button
            type="button"
            onClick={() => setAdvice('')}
            aria-label="Dismiss advice"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-obsidian/35 hover:bg-obsidian/[0.05] hover:text-obsidian"
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
            <button type="button" onClick={closeForm} className="rounded-lg border border-obsidian/15 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/70 hover:bg-obsidian/[0.04]">
              {product.slug ? 'Discard' : 'Cancel'}
            </button>
            <button type="submit" form="admin-product-form" disabled={loading} className="btn-brand rounded-lg px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50">
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
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40">
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
            className="inline-flex items-center gap-1.5 border border-obsidian/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/60 hover:text-ember disabled:opacity-40"
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
        <div className="border-t border-obsidian/8 p-5 sm:p-6">
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
          className="btn-brand inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em]"
        >
          <Plus size={13} /> Add a drink
        </button>
        <button
          type="button"
          onClick={askAdvice}
          disabled={loading || !aiOk}
          title={aiOk ? undefined : 'Azure OpenAI is not configured'}
          className="inline-flex items-center gap-1.5 rounded-lg border border-obsidian/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/70 transition-colors hover:bg-obsidian/[0.04] disabled:opacity-40"
        >
          <Sparkles size={13} /> AI stock advice
        </button>
        </div>
      </div>
      <p className="mb-3 text-sm text-obsidian/50">
        Retail, wholesale cost and margin per SKU. Supplier-specific costs live in the Suppliers tab.
      </p>

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
        <span className="text-xs text-obsidian/45">
          {visibleItems.length} of {items.length}
        </span>
      </div>
      {suppliers.length > 0 && (
        <div className="mb-4 rounded-xl border border-obsidian/10 bg-white p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">Supplier columns</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suppliers.map((supplier) => {
              const active = visibleSupplierIds.includes(supplier.id);
              return (
                <button
                  key={supplier.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setVisibleSupplierIds((current) =>
                      active ? current.filter((id) => id !== supplier.id) : [...current, supplier.id].slice(-3)
                    )
                  }
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                    active ? 'border-ember bg-ember text-white' : 'border-obsidian/12 text-obsidian/55 hover:border-ember/35'
                  }`}
                >
                  {supplier.name}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-obsidian/40">
            Choose up to three suppliers. Expand a drink to see their stock, unit cost and margin.
          </p>
        </div>
      )}
      <div className="hidden min-w-[980px] grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,.55fr))_auto] gap-3 border-x border-t border-obsidian/10 bg-paper px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40 lg:grid">
        <span>SKU</span>
        <span className="text-right">On hand</span>
        <span className="text-right">Cost</span>
        <span className="text-right">Retail</span>
        <span className="text-right">Margin</span>
        <span className="text-right">Actions</span>
      </div>
      <div className="overflow-x-auto border-b border-obsidian/10">
        {visibleItems.map((item) => (
          <StockRow
            key={item.slug}
            item={item}
            saving={savingSlug === item.slug}
            onSave={(patch) => saveStock(item.slug, patch)}
            onDelete={() => deleteStock(item)}
            onEdit={() => editItem(item)}
            suppliers={visibleSuppliers}
            supplierRows={supplierStock[item.slug] || []}
            supplierCosts={supplierCosts[item.slug] || {}}
            onSetSupplierStock={setSupplierStockQty}
            onSetSupplierCost={setSupplierCost}
            defaultCostOf={(slug) => items.find((i) => i.slug === slug)?.cost_ngn ?? null}
          />
        ))}
        {visibleItems.length === 0 && (
          <p className="bg-white p-4 text-sm text-obsidian/45">
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
    <div className="mb-8 overflow-hidden rounded-2xl border border-obsidian/10 bg-white shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-obsidian/[0.02] sm:px-6"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember/10 text-ember">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-obsidian">{title}</span>
          <span className="block truncate text-xs text-obsidian/45">{hint}</span>
        </span>
        <ChevronDown
          size={18}
          aria-hidden
          className={`shrink-0 text-obsidian/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
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
      <span className="block text-[10px] font-black uppercase tracking-[0.1em] text-obsidian/45">{supplier.city}</span>
      <span className="mb-1.5 block truncate text-[11px] text-obsidian/40">{supplier.name}</span>
      <label className="block text-[10px] text-obsidian/40">
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
      <label className="mt-1.5 block text-[10px] text-obsidian/40">
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
      <span className="mt-1 block text-[10px] text-obsidian/40">
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
};

/** The national ledger for one SKU — what moved, why, and which order did it. */
function StockHistory({ slug }: { slug: string }) {
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
  }, [slug]);

  if (error) return <p className="text-xs text-ember">{error}</p>;
  if (rows === null) return <p className="text-xs text-obsidian/40">Loading…</p>;
  if (rows.length === 0) return <p className="text-xs text-obsidian/40">No movements recorded for this SKU yet.</p>;
  const delta = (n: number) => (n === 0 ? '·' : n > 0 ? `+${n}` : String(n));
  return (
    <table className="w-full text-xs">
      <thead className="text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40">
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
            <td className="py-1.5 tabular-nums text-obsidian/50">
              {new Date(m.createdAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
            </td>
            <td className="py-1.5 font-semibold text-obsidian/70">{REASON_LABEL[m.reason] ?? m.reason}</td>
            <td className="py-1.5 text-obsidian/55">{m.actor === 'supplier' ? m.supplierName || 'Supplier' : m.actor === 'admin' ? 'Desk' : 'System'}</td>
            <td className={`py-1.5 text-right tabular-nums ${m.deltaOnHand < 0 ? 'text-red-600' : m.deltaOnHand > 0 ? 'text-emerald-700' : 'text-obsidian/30'}`}>{delta(m.deltaOnHand)}</td>
            <td className={`py-1.5 text-right tabular-nums ${m.deltaReserved !== 0 ? 'text-obsidian/70' : 'text-obsidian/30'}`}>{delta(m.deltaReserved)}</td>
            <td className="py-1.5 pl-3 text-obsidian/50">
              {m.note || '—'}
              {m.orderId && <span className="ml-1 font-mono text-[10px] text-obsidian/35">{m.orderId.slice(0, 8).toUpperCase()}</span>}
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
}) {
  const [onHand, setOnHand] = useState(String(item.on_hand));
  const [price, setPrice] = useState(item.price_ngn != null ? String(item.price_ngn) : '');
  const [cost, setCost] = useState(item.cost_ngn != null ? String(item.cost_ngn) : '');
  const [threshold, setThreshold] = useState(String(item.low_stock_threshold));
  const [tasteNote, setTasteNote] = useState(item.taste_note || '');
  const [guideOpen, setGuideOpen] = useState(false);
  const [suppliersOpen, setSuppliersOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setOnHand(String(item.on_hand));
    setPrice(item.price_ngn != null ? String(item.price_ngn) : '');
    setCost(item.cost_ngn != null ? String(item.cost_ngn) : '');
    setThreshold(String(item.low_stock_threshold));
    setTasteNote(item.taste_note || '');
  }, [item.on_hand, item.price_ngn, item.cost_ngn, item.low_stock_threshold, item.taste_note]);

  const derived = supplierRows.some((r) => r.onHand > 0 || r.reserved > 0);
  const dirty =
    (!derived && onHand !== String(item.on_hand)) ||
    price !== (item.price_ngn != null ? String(item.price_ngn) : '') ||
    (!isDerivedCostSku(item.slug) && cost !== (item.cost_ngn != null ? String(item.cost_ngn) : '')) ||
    threshold !== String(item.low_stock_threshold) ||
    tasteNote !== (item.taste_note || '');

  // Once any supplier holds this bottle, on-hand is the sum of their shelves — editing the SKU
  // directly would only be overwritten by the next rollup, so the field goes read-only.
  const heldBySuppliers = supplierRows.filter((r) => r.onHand > 0 || r.reserved > 0);
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
  const lowStock = item.tracked !== false && item.available <= item.low_stock_threshold;
  const chips: { label: string; tone?: string }[] = [
    ...(item.tracked === false ? [{ label: 'Not tracked yet', tone: 'text-amber-700' }] : []),
    ...(item.brand ? [{ label: item.brand }] : []),
    ...(item.reserved > 0 ? [{ label: `${item.reserved} reserved` }] : []),
    ...(lowStock ? [{ label: 'Low', tone: 'text-amber-700' }] : []),
    ...(!item.active ? [{ label: 'Off shop', tone: 'text-red-600' }] : []),
    ...(item.taste_note ? [] : [{ label: 'No guide' }]),
  ];
  const cell = `${adminInputClass} py-2`;
  const btn = 'px-3 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40';

  return (
    <div className="min-w-[980px] space-y-3 border-x border-t border-obsidian/10 bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 items-center gap-3 lg:w-64">
          {item.image_url ? (
            <Image src={item.image_url} alt="" width={40} height={48} className="h-12 w-10 shrink-0 object-cover" />
          ) : (
            <div className="h-12 w-10 shrink-0 border border-obsidian/10 bg-paper" />
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{item.name}</p>
            <p className="truncate font-mono text-[11px] text-obsidian/40">{item.slug}</p>
            <p className="mt-0.5 flex flex-wrap gap-x-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-obsidian/35">
              {chips.map((c, i) => (
                <span key={c.label} className={c.tone}>
                  {i > 0 && <span className="text-obsidian/20">· </span>}
                  {c.label}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          {derived ? (
            <div>
              <AdminLabel hint={`${heldBySuppliers.length} supplier${heldBySuppliers.length === 1 ? '' : 's'}`}>On hand</AdminLabel>
              <button
                type="button"
                onClick={() => setSuppliersOpen(true)}
                title="Set per supplier"
                className="w-full rounded-lg border border-dashed border-obsidian/15 bg-paper/60 px-3 py-2 text-left text-sm font-semibold tabular-nums text-obsidian hover:border-ember"
              >
                {item.on_hand} <span className="text-[11px] font-normal text-obsidian/45">· {item.available} free</span>
              </button>
            </div>
          ) : (
            <AdminInput label="On hand" type="number" min={0} inputMode="numeric" value={onHand} onChange={(e) => setOnHand(e.target.value)} className={cell} />
          )}
          {bestQuote ? (
            <div>
              <AdminLabel hint="best quote">Cost</AdminLabel>
              <button
                type="button"
                onClick={() => setSuppliersOpen(true)}
                title="Quotes per supplier"
                className="w-full rounded-lg border border-dashed border-obsidian/15 bg-paper/60 px-3 py-2 text-left text-sm font-semibold tabular-nums text-obsidian hover:border-ember"
              >
                {formatNgn(bestQuote.cost)}
                {bestSupplier && <span className="block truncate text-[11px] font-normal text-obsidian/45">{bestSupplier}</span>}
              </button>
            </div>
          ) : isPack ? (
            <div>
              <AdminLabel hint="from bottles">Cost</AdminLabel>
              <div className="w-full rounded-lg border border-dashed border-obsidian/15 bg-paper/60 px-3 py-2 text-sm font-semibold tabular-nums text-obsidian/70" title="Summed from the pack's bottles — set their costs">
                {packDefault != null ? formatNgn(packDefault) : <span className="font-normal text-obsidian/40">cost the bottles</span>}
              </div>
            </div>
          ) : (
            <AdminInput label="Default cost" hint="until a supplier quotes" type="number" min={0} inputMode="numeric" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Wholesale" className={cell} />
          )}
          <AdminInput label="Retail (NGN)" type="number" min={0} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className={cell} />
          <AdminInput label="Low at" type="number" min={0} inputMode="numeric" value={threshold} onChange={(e) => setThreshold(e.target.value)} className={cell} />
        </div>

        <div className="min-w-[88px] shrink-0 text-right">
          <AdminLabel>Margin</AdminLabel>
          {margin ? (
            <p className={`text-sm font-bold tabular-nums ${margin.negative ? 'text-red-600' : margin.low ? 'text-amber-700' : 'text-emerald-700'}`}>
              {formatNgn(margin.marginNgn)}
              <span className="block text-[11px] font-normal">{margin.marginPct}%</span>
            </p>
          ) : (
            <p className="text-sm text-obsidian/35">—</p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={() =>
              onSave({
                ...(derived ? {} : { onHand }),
                priceNgn: price === '' ? undefined : price,
                ...(isPack ? {} : { costNgn: cost === '' ? null : cost }),
                lowStockThreshold: threshold,
                tasteNote,
              })
            }
            className="btn-brand px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-35"
          >
            {saving ? '…' : 'Save'}
          </button>
          <button type="button" disabled={saving} onClick={() => onSave({ active: !item.active })} className={btn}>
            {item.active ? 'Unlist' : 'List'}
          </button>
          {suppliers.length > 0 && (
            <button type="button" onClick={() => setSuppliersOpen((v) => !v)} aria-expanded={suppliersOpen} className={btn}>
              Suppliers
            </button>
          )}
          <button type="button" onClick={() => setGuideOpen((v) => !v)} aria-expanded={guideOpen} className={btn}>
            Guide
          </button>
          <button type="button" onClick={() => setHistoryOpen((v) => !v)} aria-expanded={historyOpen} className={btn}>
            History
          </button>
          <button type="button" onClick={onEdit} className={btn}>
            Edit
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onDelete}
            className="border border-ember/40 px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-ember disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>

      {suppliersOpen && suppliers.length > 0 && (
        <div className="mt-3 border-t border-obsidian/10 pt-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">Stock by supplier</p>
          <div className="grid gap-2 sm:grid-cols-3">
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
          <p className="mt-2 text-[11px] text-obsidian/40">
            The SKU's on-hand is the sum of these shelves. Quotes here also set the cost the margin column uses.
          </p>
        </div>
      )}

      {historyOpen && (
        <div className="border-t border-obsidian/10 pt-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">Stock history</p>
          <StockHistory slug={item.slug} />
        </div>
      )}

      {guideOpen && (
        <div className="space-y-3 border-t border-obsidian/10 pt-3">
          <AdminTextArea
            label="Taste note (bottle guide ⓘ)"
            value={tasteNote}
            onChange={(e) => setTasteNote(e.target.value)}
            rows={2}
            placeholder="What it tastes like — one sentence"
          />
          <p className="text-[11px] text-obsidian/45">
            Save updates the taste note on this SKU. For the full brand story (origin, history, style), use{' '}
            <button type="button" onClick={onEdit} className="text-ember underline">
              Edit
            </button>{' '}
            then Generate / Save.
          </p>
        </div>
      )}
    </div>
  );
}
