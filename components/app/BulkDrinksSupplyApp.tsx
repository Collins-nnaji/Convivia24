'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownUp,
  Beer,
  Camera,
  Check,
  Clock,
  Droplets,
  Flame,
  GlassWater,
  Home,
  Loader2,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  Truck,
  User,
  Wine,
  Zap,
} from 'lucide-react';

type Tab = 'home' | 'shop' | 'profile';

type Product = {
  id: string;
  sku: string;
  brand: string;
  name: string;
  category: string;
  pack_size: string;
  unit: string;
  price_ngn: number;
  market_price_ngn?: number;
  moq: number;
  stock_status: string;
  tags?: string[];
};

type CartItem = Product & { quantity: number };

type PlanLine = {
  product: Product;
  quantity: number;
  reason: string;
};

type OutletProfile = {
  outlet_name?: string;
  outlet_type?: string;
  city?: string;
  address?: string;
  contact_name?: string;
  phone?: string;
  logo_url?: string;
  delivery_window?: string;
};

type DrinkOrder = {
  id: string;
  order_type: string;
  status: string;
  delivery_city: string;
  subtotal_ngn: number;
  created_at: string;
  items?: any[];
};

const fallbackProducts: Product[] = [
  { id: 'demo-star', sku: 'BEER-STAR-LAGER-60CL', brand: 'Star', name: 'Lager Beer 60cl', category: 'beer', pack_size: '24 bottles x 60cl', unit: 'case', price_ngn: 18500, market_price_ngn: 20500, moq: 0.5, stock_status: 'in_stock', tags: ['alcoholic','nightlife'] },
  { id: 'demo-heineken', sku: 'BEER-HEINEKEN-33CL', brand: 'Heineken', name: 'Premium Lager 33cl', category: 'beer', pack_size: '24 bottles x 33cl', unit: 'case', price_ngn: 28500, market_price_ngn: 31500, moq: 0.5, stock_status: 'low_stock', tags: ['alcoholic','premium'] },
  { id: 'demo-jw', sku: 'SPIRIT-JW-RED-70CL', brand: 'Johnnie Walker', name: 'Red Label 70cl', category: 'spirits', pack_size: '12 bottles x 70cl', unit: 'case', price_ngn: 126000, market_price_ngn: 142000, moq: 0.5, stock_status: 'in_stock', tags: ['whisky','club'] },
  { id: 'demo-henny', sku: 'SPIRIT-HENNESSY-VS-70CL', brand: 'Hennessy', name: 'VS Cognac 70cl', category: 'spirits', pack_size: '12 bottles x 70cl', unit: 'case', price_ngn: 410000, market_price_ngn: 455000, moq: 0.5, stock_status: 'preorder', tags: ['cognac','vip'] },
  { id: 'demo-wine', sku: 'WINE-FOUR-COUSINS-75CL', brand: 'Four Cousins', name: 'Sweet Red Wine 75cl', category: 'wine', pack_size: '12 bottles x 75cl', unit: 'case', price_ngn: 76000, market_price_ngn: 86000, moq: 0.5, stock_status: 'in_stock', tags: ['wine','restaurant'] },
  { id: 'demo-maltina', sku: 'NA-MALTINA-33CL', brand: 'Maltina', name: 'Classic Malt 33cl', category: 'non_alcoholic', pack_size: '24 cans x 33cl', unit: 'case', price_ngn: 16200, market_price_ngn: 18000, moq: 0.5, stock_status: 'in_stock', tags: ['malt','horeca'] },
  { id: 'demo-water', sku: 'WATER-EVA-75CL', brand: 'Eva', name: 'Table Water 75cl', category: 'water', pack_size: '12 bottles x 75cl', unit: 'case', price_ngn: 3200, market_price_ngn: 4000, moq: 0.5, stock_status: 'in_stock', tags: ['water','hotel'] },
  { id: 'demo-redbull', sku: 'ENERGY-RED-BULL-25CL', brand: 'Red Bull', name: 'Energy Drink 25cl', category: 'energy', pack_size: '24 cans x 25cl', unit: 'case', price_ngn: 52000, market_price_ngn: 57500, moq: 0.5, stock_status: 'low_stock', tags: ['energy','mixer'] },
  { id: 'demo-tonic', sku: 'MIXER-SCHWEPPES-TONIC', brand: 'Schweppes', name: 'Tonic Water 33cl', category: 'mixer', pack_size: '24 cans x 33cl', unit: 'case', price_ngn: 24500, market_price_ngn: 27500, moq: 0.5, stock_status: 'in_stock', tags: ['mixer','cocktail'] },
];

const categoryMeta: Record<string, { label: string; Icon: any; tile: string; mark: string; ring: string }> = {
  all: { label: 'All', Icon: Sparkles, tile: 'bg-surface-100', mark: 'text-ink/45', ring: 'border-ink/10' },
  beer: { label: 'Beer', Icon: Beer, tile: 'bg-amber-50', mark: 'text-amber-700', ring: 'border-amber-200' },
  spirits: { label: 'Spirits', Icon: Flame, tile: 'bg-orange-50', mark: 'text-orange-700', ring: 'border-orange-200' },
  wine: { label: 'Wine', Icon: Wine, tile: 'bg-rose-50', mark: 'text-rose-700', ring: 'border-rose-200' },
  non_alcoholic: { label: 'No Alcohol', Icon: GlassWater, tile: 'bg-emerald-50', mark: 'text-emerald-700', ring: 'border-emerald-200' },
  water: { label: 'Water', Icon: Droplets, tile: 'bg-sky-50', mark: 'text-sky-700', ring: 'border-sky-200' },
  energy: { label: 'Energy', Icon: Zap, tile: 'bg-yellow-50', mark: 'text-yellow-700', ring: 'border-yellow-200' },
  mixer: { label: 'Mixers', Icon: PackageCheck, tile: 'bg-violet-50', mark: 'text-violet-700', ring: 'border-violet-200' },
};

const tabs: { id: Tab; label: string; Icon: any }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'shop', label: 'Shop', Icon: ShoppingBag },
  { id: 'profile', label: 'Outlet', Icon: User },
];

const mobileTabs = tabs;

const field = 'w-full rounded-2xl border border-ink/10 bg-surface-50 px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10';
const label = 'mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-ink/50';

function money(value: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value || 0);
}

function qtyLabel(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

async function jsonFetch(url: string) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function StatusPill({ status }: { status: string }) {
  const tone = status === 'in_stock'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : status === 'low_stock'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : status === 'preorder'
        ? 'bg-sky-50 text-sky-700 border-sky-200'
        : 'bg-rose-50 text-rose-700 border-rose-200';

  return <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${tone}`}>{status.replaceAll('_', ' ')}</span>;
}

function ProductCard({ product, cartItem, add, remove }: { product: Product; cartItem?: CartItem; add: () => void; remove: () => void }) {
  const meta = categoryMeta[product.category] || categoryMeta.all;
  const Icon = meta.Icon;
  const marketPrice = Number(product.market_price_ngn || Math.round(product.price_ngn * 1.12));
  const savings = Math.max(0, marketPrice - product.price_ngn);
  const savingsPct = marketPrice ? Math.round((savings / marketPrice) * 100) : 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[24px] border border-ink/10 bg-white text-ink shadow-sm transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-md">
      <div className={`relative overflow-hidden px-5 pb-5 pt-5 ${meta.tile}`}>
        <Icon className={`pointer-events-none absolute -right-6 -top-6 ${meta.mark} opacity-[0.08]`} size={160} strokeWidth={1.2} />
        <div className="relative flex items-start justify-between gap-3">
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border bg-white shadow-sm ${meta.mark} ${meta.ring}`}>
            <Icon size={22} />
          </span>
          <StatusPill status={product.stock_status} />
        </div>
        <div className="relative mt-4">
          <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${meta.mark}`}>{product.brand}</p>
          <h3 className="mt-1.5 font-display text-3xl italic leading-tight text-ink">{product.name}</h3>
          <p className="mt-1.5 text-xs text-ink/55">{product.pack_size}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-4xl italic leading-none text-ink">{money(product.price_ngn)}</p>
            <p className="mt-1 text-xs text-ink/45">
              <span className="line-through">{money(marketPrice)}</span> market price
            </p>
          </div>
          {savingsPct > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
              <TrendingDown size={11} />
              {savingsPct}% off
            </span>
          )}
        </div>

        {savings > 0 && (
          <p className="rounded-xl bg-emerald-50/70 px-3 py-2 text-xs text-emerald-700">Save {money(savings)} per {product.unit} vs market.</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-700"><ShieldCheck size={10} /> Verified</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-brand"><Clock size={10} /> 24h</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-surface-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-ink/55">Half-carton OK</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-ink/45">Min 0.5 ctn</p>
          {cartItem ? (
            <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-surface-50 p-1 text-ink">
              <button onClick={remove} className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"><Minus size={13} /></button>
              <span className="min-w-8 text-center text-sm font-black">{qtyLabel(cartItem.quantity)}</span>
              <button onClick={add} className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white"><Plus size={13} /></button>
            </div>
          ) : (
            <button onClick={add} className="rounded-full bg-brand px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_8px_24px_rgba(232,24,26,0.25)] transition hover:bg-brand-dark">Add 0.5</button>
          )}
        </div>
      </div>
    </article>
  );
}

function Hero({ onShop, onPlanner }: { onShop: () => void; onPlanner: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-obsidian text-cream shadow-xl md:p-10">
      <div className="absolute inset-0">
        <img src="/Homepage.png" alt="" className="h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/85 to-obsidian/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
      </div>
      <div className="relative z-10 max-w-3xl p-6 md:p-0">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-brand-light">
          <ShieldCheck size={12} />
          Verified drinks supply
        </span>
        <h1 className="mt-6 font-display text-5xl italic leading-[0.95] text-white md:text-7xl">Bulk breaking. 24-hour delivery.</h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/65 md:text-lg">
          Verified beer, spirits, wine, water, mixers, energy and non-alcoholic supply for events and outlets. Buy by the carton or half-carton, delivered within 24 hours.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button onClick={onShop} className="rounded-full bg-brand px-8 py-4 text-[12px] font-black uppercase tracking-[0.18em] text-white shadow-[0_8px_24px_rgba(232,24,26,0.4)] transition hover:bg-brand-dark">Shop catalogue</button>
          <button onClick={onPlanner} className="rounded-full border border-white/25 bg-white/10 px-8 py-4 text-[12px] font-black uppercase tracking-[0.18em] text-white backdrop-blur transition hover:bg-white/20">Plan purchase</button>
        </div>
        <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
          {[
            { Icon: PackageCheck, label: 'Bulk breaking', sub: 'Cartons + half-cartons' },
            { Icon: Clock, label: '24h delivery', sub: 'Lagos & partners' },
            { Icon: ShieldCheck, label: 'Verified', sub: 'Authentic stock' },
          ].map(({ Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-start gap-1.5 rounded-2xl bg-white/5 p-3 backdrop-blur">
              <Icon size={16} className="text-brand-light" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white">{label}</p>
              <p className="text-[10px] text-cream/55">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CartDrawer({ cartItems, subtotal, placing, placeOrder }: { cartItems: CartItem[]; subtotal: number; placing: boolean; placeOrder: () => void }) {
  return (
    <aside className="sticky top-[88px] rounded-[28px] border border-ink/10 bg-white p-5 text-ink shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-ink/45">Order basket</p>
          <h3 className="font-display text-4xl italic text-ink">{money(subtotal)}</h3>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white"><ShoppingCart size={20} /></span>
      </div>
      <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
        {cartItems.length ? cartItems.map((item) => (
          <div key={item.id} className="rounded-2xl border border-ink/10 bg-surface-50 p-3">
            <div className="flex justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{item.brand} {item.name}</p>
                <p className="text-xs text-ink/45">{item.pack_size}</p>
              </div>
              <span className="text-sm font-black text-brand">x{qtyLabel(item.quantity)}</span>
            </div>
            <p className="mt-2 text-right text-sm font-semibold text-ink">{money(item.price_ngn * item.quantity)}</p>
          </div>
        )) : <p className="rounded-2xl border border-dashed border-ink/15 p-5 text-center text-sm text-ink/45">Add drinks to start a bulk order.</p>}
      </div>
      <button onClick={placeOrder} disabled={!cartItems.length || placing} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-[12px] font-black uppercase tracking-[0.18em] text-white shadow-[0_8px_24px_rgba(232,24,26,0.25)] transition hover:bg-brand-dark disabled:bg-ink/20 disabled:shadow-none">
        {placing ? <Loader2 size={16} className="animate-spin" /> : <Truck size={16} />}
        Place bulk order
      </button>
    </aside>
  );
}

function PlannerTool({ products, addPlanToCart }: { products: Product[]; addPlanToCart: (lines: PlanLine[]) => void }) {
  const [guests, setGuests] = useState(120);
  const [budget, setBudget] = useState(450000);
  const [preference, setPreference] = useState('balanced');

  const plan = useMemo(() => {
    const available = products.filter((p) => p.stock_status !== 'out_of_stock');
    const pick = (category: string, fallback = category) =>
      available
        .filter((p) => p.category === category || p.tags?.includes(fallback))
        .sort((a, b) => a.price_ngn - b.price_ngn)[0];

    const beer = pick('beer');
    const spirits = pick('spirits');
    const wine = pick('wine');
    const water = pick('water');
    const mixer = pick('mixer');
    const energy = pick('energy');
    const nonAlcoholic = pick('non_alcoholic');

    const ratios: Record<string, Partial<Record<string, number>>> = {
      balanced: { beer: 0.035, spirits: 0.012, water: 0.05, mixer: 0.018, non_alcoholic: 0.02 },
      nightlife: { beer: 0.045, spirits: 0.018, energy: 0.018, mixer: 0.025, water: 0.035 },
      dining: { wine: 0.025, water: 0.055, non_alcoholic: 0.025, spirits: 0.008 },
      sober: { water: 0.07, non_alcoholic: 0.045, energy: 0.015, mixer: 0.01 },
    };

    const productByCategory: Record<string, Product | undefined> = { beer, spirits, wine, water, mixer, energy, non_alcoholic: nonAlcoholic };
    const raw = Object.entries(ratios[preference] || ratios.balanced)
      .map(([category, ratio]) => {
        const product = productByCategory[category];
        if (!product) return null;
        const quantity = Math.max(0.5, Math.round((guests * Number(ratio || 0)) * 2) / 2);
        return {
          product,
          quantity,
          reason: `${categoryMeta[category]?.label || category} allocation for ${guests} guests`,
        };
      })
      .filter(Boolean) as PlanLine[];

    let lines = raw;
    let total = lines.reduce((sum, line) => sum + line.quantity * line.product.price_ngn, 0);

    while (total > budget && lines.length) {
      const largest = [...lines].sort((a, b) => b.quantity * b.product.price_ngn - a.quantity * a.product.price_ngn)[0];
      if (!largest || largest.quantity <= 0.5) break;
      lines = lines.map((line) => line.product.id === largest.product.id ? { ...line, quantity: Math.max(0.5, line.quantity - 0.5) } : line);
      total = lines.reduce((sum, line) => sum + line.quantity * line.product.price_ngn, 0);
    }

    return { lines, total };
  }, [products, guests, budget, preference]);

  return (
    <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <div className="rounded-[28px] border border-ink/10 bg-white p-6 text-ink shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand">Purchase planner</p>
        <h1 className="mt-2 font-display text-5xl italic leading-none text-ink">Plan by crowd, taste, and budget.</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/55">Build a mixed bulk-break basket of full and half cartons for events and outlets, all delivered within 24 hours.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className={label}>Event size</label>
            <input type="number" className={field} value={guests} onChange={(e) => setGuests(Number(e.target.value || 0))} />
          </div>
          <div>
            <label className={label}>Budget</label>
            <input type="number" className={field} value={budget} onChange={(e) => setBudget(Number(e.target.value || 0))} />
          </div>
          <div>
            <label className={label}>Preference</label>
            <select className={field} value={preference} onChange={(e) => setPreference(e.target.value)}>
              <option value="balanced">Balanced bar</option>
              <option value="nightlife">Nightlife heavy</option>
              <option value="dining">Dining and wine</option>
              <option value="sober">Non-alcoholic / sober</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-ink/10 bg-white p-6 text-ink shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ink/45">Recommended basket</p>
            <h2 className="mt-1 font-display text-5xl italic text-ink">{money(plan.total)}</h2>
            <p className={`mt-1 text-sm ${plan.total > budget ? 'text-rose-600' : 'text-emerald-700'}`}>
              {plan.total > budget ? 'Above budget. Reduce guest count or preference intensity.' : `${money(Math.max(0, budget - plan.total))} budget buffer`}
            </p>
          </div>
          <button onClick={() => addPlanToCart(plan.lines)} className="rounded-full bg-brand px-6 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_8px_24px_rgba(232,24,26,0.25)] transition hover:bg-brand-dark">Add plan to cart</button>
        </div>

        <div className="mt-6 space-y-3">
          {plan.lines.map((line) => (
            <div key={line.product.id} className="rounded-2xl border border-ink/10 bg-surface-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand">{line.product.brand}</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{line.product.name}</p>
                  <p className="mt-1 text-xs text-ink/50">{line.reason}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl italic text-ink">{qtyLabel(line.quantity)}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-ink/45">cartons</p>
                </div>
              </div>
              <p className="mt-3 text-right text-sm font-semibold text-brand">{money(line.quantity * line.product.price_ngn)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type ShopSection = 'catalogue' | 'planner' | 'orders';

export function BulkDrinksSupplyApp({ initialUser }: { initialUser?: any }) {
  const [active, setActive] = useState<Tab>('home');
  const [shopSection, setShopSection] = useState<ShopSection>('catalogue');
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [orders, setOrders] = useState<DrinkOrder[]>([]);
  const [profile, setProfile] = useState<OutletProfile>({
    outlet_name: initialUser?.company || 'Preview Lounge',
    outlet_type: 'nightlife',
    city: 'Lagos',
    contact_name: initialUser?.name || '',
    delivery_window: 'Today, 6pm-9pm',
  });
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'savings'>('default');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price_ngn * item.quantity, 0);
  const filteredProducts = useMemo(() => {
    const list = products.filter((product) => {
      const matchesCategory = category === 'all' || product.category === category;
      const search = `${product.brand} ${product.name} ${product.tags?.join(' ')}`.toLowerCase();
      return matchesCategory && search.includes(query.toLowerCase());
    });
    if (sortBy === 'price-asc') return [...list].sort((a, b) => a.price_ngn - b.price_ngn);
    if (sortBy === 'price-desc') return [...list].sort((a, b) => b.price_ngn - a.price_ngn);
    if (sortBy === 'savings') {
      return [...list].sort((a, b) => {
        const aSav = Number(a.market_price_ngn || a.price_ngn * 1.12) - a.price_ngn;
        const bSav = Number(b.market_price_ngn || b.price_ngn * 1.12) - b.price_ngn;
        return bSav - aSav;
      });
    }
    return list;
  }, [products, category, query, sortBy]);
  const categoryCounts = useMemo(() => {
    return Object.keys(categoryMeta).reduce<Record<string, number>>((acc, key) => {
      acc[key] = key === 'all'
        ? products.length
        : products.filter((p) => p.category === key).length;
      return acc;
    }, {});
  }, [products]);
  const inStockCount = useMemo(() => products.filter((p) => p.stock_status === 'in_stock').length, [products]);
  const topBrands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).slice(0, 10), [products]);

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    setLoading(true);
    try {
      const [productData, orderData, profileData] = await Promise.all([
        jsonFetch('/api/drinks/products'),
        jsonFetch('/api/drinks/orders'),
        jsonFetch('/api/drinks/profile'),
      ]);
      if (productData.products?.length) setProducts(productData.products);
      setOrders(orderData.orders || []);
      setProfile((p) => ({ ...p, ...(profileData.profile || {}) }));
    } catch {
      setNotice('Preview catalogue active. Connect database/auth to sync live orders.');
    } finally {
      setLoading(false);
    }
  }

  function add(product: Product) {
    setCart((current) => {
      const existing = current[product.id];
      const quantity = existing ? existing.quantity + 0.5 : Math.max(0.5, Number(product.moq || 0.5));
      return { ...current, [product.id]: { ...product, quantity } };
    });
  }

  function remove(product: Product) {
    setCart((current) => {
      const existing = current[product.id];
      if (!existing) return current;
      const nextQty = existing.quantity - 0.5;
      if (nextQty < 0.5) {
        const { [product.id]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [product.id]: { ...existing, quantity: nextQty } };
    });
  }

  function addPlanToCart(lines: PlanLine[]) {
    setCart((current) => {
      const next = { ...current };
      for (const line of lines) {
        const existing = next[line.product.id];
        next[line.product.id] = {
          ...line.product,
          quantity: (existing?.quantity || 0) + line.quantity,
        };
      }
      return next;
    });
    setNotice('Planner basket added to cart.');
    setActive('shop');
    setShopSection('catalogue');
  }

  async function placeOrder() {
    if (!cartItems.length) {
      setNotice('Add at least one drink before placing an order.');
      return;
    }
    setPlacing(true);
    setNotice('');
    try {
      const res = await fetch('/api/drinks/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_type: 'regular',
          delivery_city: profile.city,
          delivery_address: profile.address,
          delivery_window: profile.delivery_window,
          items: cartItems.map((item) => ({ product_id: item.id, quantity: item.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed.');
      setOrders((items) => [data.order, ...items]);
      setCart({});
      setNotice('Bulk order placed. Track it under Orders below.');
      setActive('shop');
      setShopSection('orders');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not place order.');
    } finally {
      setPlacing(false);
    }
  }

  async function saveProfile() {
    setNotice('');
    try {
      const res = await fetch('/api/drinks/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profile save failed.');
      setProfile(data.profile);
      setNotice('Outlet profile saved.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not save profile.');
    }
  }

  async function uploadLogo(file?: File) {
    if (!file) return;
    setUploadingLogo(true);
    setNotice('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');

      const updated = { ...profile, logo_url: data.url };
      setProfile(updated);

      const saveRes = await fetch('/api/drinks/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const saved = await saveRes.json();
      if (!saveRes.ok) throw new Error(saved.error || 'Profile update failed.');
      setProfile(saved.profile);
      setNotice('Outlet logo updated.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  }

  return (
    <div className="relative h-full overflow-hidden bg-surface-50 text-ink">
      <div className="relative z-10 flex h-full flex-col">
        <header className="sticky top-0 z-30 border-b border-ink/10 bg-white/85 px-5 py-4 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <button onClick={() => setActive('home')} className="flex items-center gap-3">
              <img src="/convivia24.png" alt="Convivia24" className="h-7 w-auto" />
              <span className="hidden text-[9px] font-black uppercase tracking-[0.28em] text-brand sm:block">Supply</span>
            </button>
            <nav className="hidden items-center gap-2 lg:flex">
              {tabs.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setActive(id)} className={`flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-widest transition ${active === id ? 'bg-brand text-white shadow-[0_6px_20px_rgba(232,24,26,0.2)]' : 'text-ink/55 hover:bg-surface-100 hover:text-ink'}`}>
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </nav>
            <button onClick={() => setActive('shop')} className="relative flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-[0_6px_20px_rgba(232,24,26,0.25)]">
              <ShoppingCart size={18} />
              {cartItems.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">{cartItems.length}</span>}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-28 pt-5 md:px-8 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            {notice && <div className="mb-5 rounded-2xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">{notice}</div>}
            {loading ? (
              <div className="flex h-80 items-center justify-center"><Loader2 className="animate-spin text-brand" size={32} /></div>
            ) : (
              <>
                {active === 'home' && (
                  <div className="space-y-6">
                    <Hero onShop={() => { setActive('shop'); setShopSection('catalogue'); }} onPlanner={() => { setActive('shop'); setShopSection('planner'); }} />

                    <section className="grid gap-4 md:grid-cols-3">
                      {[
                        { Icon: PackageCheck, title: 'Bulk breaking', body: 'Buy by the carton or half-carton, mix and match across categories without minimum-order headaches.' },
                        { Icon: Clock, title: '24-hour delivery', body: 'Place an order today, restock tomorrow. Standard same/next-day delivery across Lagos partner zones.' },
                        { Icon: ShieldCheck, title: 'Verified drinks', body: 'Every brand sourced from authorised distributors. No counterfeits, no expired stock, every time.' },
                      ].map(({ Icon, title, body }) => (
                        <div key={title} className="rounded-[28px] border border-ink/10 bg-white p-6 shadow-sm">
                          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand"><Icon size={22} /></span>
                          <h3 className="mt-4 font-display text-3xl italic text-ink">{title}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-ink/60">{body}</p>
                        </div>
                      ))}
                    </section>

                    <section className="rounded-[28px] border border-ink/10 bg-white p-6 shadow-sm md:p-8">
                      <div className="mb-6 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand">How it works</p>
                          <h2 className="mt-1 font-display text-4xl italic text-ink">From order to restock in 24 hours.</h2>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-4">
                        {[
                          { step: '01', title: 'Plan or shop', body: 'Use the planner to size by event, or browse the catalogue with live market price intel.' },
                          { step: '02', title: 'Bulk break', body: 'Mix full and half cartons across beer, spirits, wine, mixers, water, and non-alcoholic.' },
                          { step: '03', title: 'Verified pick', body: 'Stock pulled from authorised distributor channels and quality-checked.' },
                          { step: '04', title: '24h delivery', body: 'Dispatched within 24 hours to your outlet or event venue.' },
                        ].map(({ step, title, body }) => (
                          <div key={step} className="rounded-2xl border border-ink/10 bg-surface-50 p-5">
                            <p className="font-display text-5xl italic leading-none text-brand">{step}</p>
                            <p className="mt-3 font-display text-2xl italic text-ink">{title}</p>
                            <p className="mt-2 text-xs leading-relaxed text-ink/60">{body}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[28px] border border-ink/10 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-ink/45">Top brands</p>
                        <button onClick={() => setActive('shop')} className="text-[10px] font-black uppercase tracking-widest text-brand">Shop all</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {topBrands.map((brand) => <span key={brand} className="rounded-full border border-ink/10 bg-surface-50 px-4 py-2 text-sm font-semibold text-ink/75">{brand}</span>)}
                      </div>
                    </section>

                    <section className="overflow-hidden rounded-[28px] border border-ink/10 bg-gradient-to-br from-brand to-brand-dark p-6 text-white shadow-sm md:p-8">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Built for</p>
                      <h2 className="mt-3 font-display text-4xl italic leading-none md:text-5xl">Events and outlets that move stock.</h2>
                      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
                        Clubs, lounges, hotels, restaurants, cafes, and event companies use Convivia24 to break bulk on verified drinks supply with reliable 24-hour delivery.
                      </p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button onClick={() => { setActive('shop'); setShopSection('catalogue'); }} className="rounded-full bg-white px-6 py-3 text-[11px] font-black uppercase tracking-widest text-brand">Start shopping</button>
                        <button onClick={() => { setActive('shop'); setShopSection('planner'); }} className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur">Plan an event</button>
                      </div>
                    </section>
                  </div>
                )}

                {active === 'shop' && (
                  <section className="space-y-6">
                    <div className="overflow-hidden rounded-[28px] border border-ink/10 bg-white shadow-sm">
                      <div className="relative px-6 pb-7 pt-7 md:px-9 md:pb-9 md:pt-9">
                        <div className="absolute inset-0 -z-10 opacity-50">
                          <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
                          <div className="absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
                        </div>
                        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                          <div className="max-w-2xl">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand">Bulk-break workspace</p>
                            <h1 className="mt-3 font-display text-5xl italic leading-[0.95] text-ink md:text-7xl">Plan, price, order.</h1>
                            <p className="mt-4 text-sm leading-relaxed text-ink/60 md:text-base">
                              Shop verified drinks with live market price intel, plan event baskets, and lock in 24-hour delivery, all in one workspace.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand"><PackageCheck size={11} /> Bulk breaking</span>
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand"><Clock size={11} /> 24h delivery</span>
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand"><ShieldCheck size={11} /> Verified drinks</span>
                            </div>
                          </div>
                          <div className="grid w-full grid-cols-3 gap-3 lg:w-auto">
                            {[
                              { label: 'Catalogue', value: String(products.length), caption: 'SKUs ready' },
                              { label: 'Basket', value: money(subtotal), caption: `${cartItems.length} item${cartItems.length === 1 ? '' : 's'}` },
                              { label: 'Orders', value: String(orders.length), caption: 'Recent' },
                            ].map((stat) => (
                              <div key={stat.label} className="rounded-2xl border border-ink/10 bg-surface-50 p-4 text-ink">
                                <p className="text-[9px] font-black uppercase tracking-widest text-ink/45">{stat.label}</p>
                                <p className="mt-1 font-display text-2xl italic leading-tight text-ink md:text-3xl">{stat.value}</p>
                                <p className="mt-1 text-[10px] uppercase tracking-widest text-ink/45">{stat.caption}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-ink/10 bg-surface-50 px-3 py-3 md:px-5">
                        <div className="flex items-center gap-1 overflow-x-auto rounded-full border border-ink/10 bg-white p-1.5 shadow-inner">
                          {[
                            { id: 'catalogue' as ShopSection, label: 'Shop', Icon: ShoppingBag, badge: products.length },
                            { id: 'planner' as ShopSection, label: 'Planner', Icon: Sparkles, badge: undefined },
                            { id: 'orders' as ShopSection, label: 'Orders', Icon: PackageCheck, badge: orders.length },
                          ].map(({ id, label, Icon, badge }) => {
                            const activePill = shopSection === id;
                            return (
                              <button
                                key={id}
                                onClick={() => setShopSection(id)}
                                className={`flex flex-1 shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3 text-[11px] font-black uppercase tracking-widest transition ${
                                  activePill
                                    ? 'bg-brand text-white shadow-[0_8px_24px_rgba(232,24,26,0.25)]'
                                    : 'text-ink/55 hover:bg-surface-100 hover:text-ink'
                                }`}
                              >
                                <Icon size={13} />
                                {label}
                                {badge !== undefined && (
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[9px] ${
                                      activePill ? 'bg-white/20 text-white' : 'bg-ink/5 text-ink/55'
                                    }`}
                                  >
                                    {badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {shopSection === 'catalogue' && (
                      <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
                        <section className="space-y-4">
                          <div className="rounded-[28px] border border-ink/10 bg-white p-4 shadow-sm md:p-5">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                              <div className="relative flex-1">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
                                <input
                                  value={query}
                                  onChange={(e) => setQuery(e.target.value)}
                                  placeholder="Search brand, drink, mixer..."
                                  className="w-full rounded-2xl border border-ink/10 bg-surface-50 py-3 pl-11 pr-4 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-brand/40 focus:bg-white"
                                />
                              </div>
                              <div className="relative">
                                <ArrowDownUp size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
                                <select
                                  value={sortBy}
                                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                  className="appearance-none rounded-2xl border border-ink/10 bg-surface-50 py-3 pl-10 pr-8 text-xs font-semibold text-ink outline-none focus:border-brand/40 focus:bg-white"
                                >
                                  <option value="default">Sort: Featured</option>
                                  <option value="price-asc">Price: low to high</option>
                                  <option value="price-desc">Price: high to low</option>
                                  <option value="savings">Best savings</option>
                                </select>
                              </div>
                            </div>
                            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                              {Object.entries(categoryMeta).map(([key, meta]) => {
                                const Icon = meta.Icon;
                                const isActive = category === key;
                                const count = categoryCounts[key] || 0;
                                return (
                                  <button
                                    key={key}
                                    onClick={() => setCategory(key)}
                                    className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${
                                      isActive ? 'bg-brand text-white shadow-[0_6px_18px_rgba(232,24,26,0.25)]' : 'bg-surface-100 text-ink/55 hover:bg-surface-200 hover:text-ink'
                                    }`}
                                  >
                                    <Icon size={12} />
                                    {meta.label}
                                    <span className={`rounded-full px-1.5 py-0.5 text-[8px] ${isActive ? 'bg-white/25 text-white' : 'bg-white text-ink/55'}`}>{count}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink/55">
                            <p>
                              <span className="font-bold text-ink">{filteredProducts.length}</span> result{filteredProducts.length === 1 ? '' : 's'}
                              {category !== 'all' && <> in <span className="font-semibold text-ink/70">{categoryMeta[category]?.label || category}</span></>}
                              {query && <> for "<span className="font-semibold text-ink/70">{query}</span>"</>}
                            </p>
                            <p className="flex items-center gap-3">
                              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {inStockCount} in stock</span>
                              <span className="inline-flex items-center gap-1 text-ink/45"><ShieldCheck size={12} className="text-emerald-600" /> All verified</span>
                            </p>
                          </div>

                          {filteredProducts.length ? (
                            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                              {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} cartItem={cart[product.id]} add={() => add(product)} remove={() => remove(product)} />
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-[28px] border border-dashed border-ink/15 bg-white p-10 text-center shadow-sm">
                              <Search size={28} className="mx-auto mb-3 text-ink/35" />
                              <p className="font-display text-3xl italic text-ink">No drinks match this filter.</p>
                              <p className="mx-auto mt-2 max-w-sm text-sm text-ink/55">Try a different category, clear the search, or open the Planner to auto-build a basket.</p>
                              <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
                                <button onClick={() => { setQuery(''); setCategory('all'); }} className="rounded-full border border-ink/15 bg-surface-50 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-ink/70">Reset filters</button>
                                <button onClick={() => setShopSection('planner')} className="rounded-full bg-brand px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_8px_24px_rgba(232,24,26,0.25)]">Open planner</button>
                              </div>
                            </div>
                          )}
                        </section>
                        <CartDrawer cartItems={cartItems} subtotal={subtotal} placing={placing} placeOrder={placeOrder} />
                      </div>
                    )}

                    {shopSection === 'planner' && (
                      <div className="space-y-4">
                        <PlannerTool products={products} addPlanToCart={addPlanToCart} />
                        <div className="flex flex-col items-start justify-between gap-3 rounded-[24px] border border-ink/10 bg-white p-5 text-ink/65 shadow-sm sm:flex-row sm:items-center">
                          <p className="text-sm">Happy with your plan? Jump back to the catalogue to fine-tune the basket and place the order.</p>
                          <button onClick={() => setShopSection('catalogue')} className="rounded-full border border-brand/25 bg-brand/5 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-brand">Back to shop</button>
                        </div>
                      </div>
                    )}

                    {shopSection === 'orders' && (
                      <section className="space-y-4">
                        <div className="flex flex-col items-start justify-between gap-4 rounded-[28px] border border-ink/10 bg-white p-6 shadow-sm md:flex-row md:items-end">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand">Order history</p>
                            <h2 className="mt-1 font-display text-4xl italic text-ink">Purchase history.</h2>
                            <p className="mt-2 text-sm text-ink/55">Track recent bulk orders, status, and delivery details.</p>
                          </div>
                          <button onClick={() => setShopSection('catalogue')} className="rounded-full bg-brand px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_8px_24px_rgba(232,24,26,0.25)]">New order</button>
                        </div>

                        {orders.length ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            {orders.slice(0, 8).map((order) => (
                              <article key={order.id} className="rounded-[28px] border border-ink/10 bg-white p-5 text-ink shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand">{order.order_type} order</p>
                                    <h3 className="mt-1 font-display text-4xl italic text-ink">{money(order.subtotal_ngn)}</h3>
                                    <p className="mt-1 text-sm text-ink/55">{order.delivery_city || 'No city'} - {new Date(order.created_at).toLocaleString()}</p>
                                  </div>
                                  <span className="rounded-full bg-brand px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">{order.status}</span>
                                </div>
                                {order.items?.length ? (
                                  <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
                                    {order.items.slice(0, 4).map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between gap-3">
                                        <span className="truncate text-ink/70">{item.brand ? `${item.brand} ` : ''}{item.name || item.product_name || 'Item'}</span>
                                        <span className="shrink-0 text-ink/50">x{qtyLabel(Number(item.quantity))}</span>
                                      </div>
                                    ))}
                                    {order.items.length > 4 && (
                                      <p className="pt-1 text-[11px] uppercase tracking-widest text-ink/45">+{order.items.length - 4} more line{order.items.length - 4 === 1 ? '' : 's'}</p>
                                    )}
                                  </div>
                                ) : null}
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-[28px] border border-dashed border-ink/15 bg-white p-10 text-center shadow-sm">
                            <Truck className="mx-auto mb-4 text-ink/30" size={36} />
                            <p className="font-display text-3xl italic text-ink">No orders yet.</p>
                            <p className="mx-auto mt-2 max-w-sm text-sm text-ink/55">Use the catalogue or planner to build your first bulk order.</p>
                            <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
                              <button onClick={() => setShopSection('catalogue')} className="rounded-full bg-brand px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_8px_24px_rgba(232,24,26,0.25)]">Open catalogue</button>
                              <button onClick={() => setShopSection('planner')} className="rounded-full border border-brand/25 bg-brand/5 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-brand">Try planner</button>
                            </div>
                          </div>
                        )}
                      </section>
                    )}
                  </section>
                )}

                {active === 'profile' && (
                  <section className="mx-auto max-w-3xl rounded-[28px] border border-ink/10 bg-white p-6 text-ink shadow-sm md:p-8">
                    <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
                      <label className="group relative block h-32 w-32 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-brand/35 bg-surface-100 shadow-sm">
                        {profile.logo_url ? (
                          <img src={profile.logo_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/15 to-brand/5 font-display text-5xl italic text-brand">
                            {(profile.outlet_name || 'O')[0].toUpperCase()}
                          </span>
                        )}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                          {uploadingLogo ? <Loader2 size={26} className="animate-spin text-white" /> : <Camera size={26} className="text-white" />}
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0])} />
                      </label>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand">Outlet profile</p>
                        <h3 className="mt-2 font-display text-5xl italic leading-none text-ink">{profile.outlet_name || 'Your outlet'}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-ink/55">
                          Upload your outlet logo or display picture, then save delivery details for faster bulk orders.
                        </p>
                        <button onClick={() => document.getElementById('outlet-logo-upload')?.click()} className="mt-4 rounded-full border border-brand/25 bg-brand/5 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-brand">
                          {profile.logo_url ? 'Change logo' : 'Upload logo'}
                        </button>
                        <input id="outlet-logo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0])} />
                      </div>
                    </div>
                    <div className="mt-7 grid gap-4 md:grid-cols-2">
                      <div><label className={label}>Outlet name</label><input className={field} value={profile.outlet_name || ''} onChange={(e) => setProfile({ ...profile, outlet_name: e.target.value })} /></div>
                      <div><label className={label}>Outlet type</label><select className={field} value={profile.outlet_type || 'nightlife'} onChange={(e) => setProfile({ ...profile, outlet_type: e.target.value })}><option value="nightlife">Nightlife</option><option value="hotel">Hotel</option><option value="restaurant">Restaurant</option><option value="cafe">Cafe</option><option value="event">Event company</option><option value="retail">Retail</option></select></div>
                      <div><label className={label}>City</label><input className={field} value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} /></div>
                      <div><label className={label}>Phone</label><input className={field} value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
                      <div><label className={label}>Contact person</label><input className={field} value={profile.contact_name || ''} onChange={(e) => setProfile({ ...profile, contact_name: e.target.value })} /></div>
                      <div><label className={label}>Delivery window</label><input className={field} value={profile.delivery_window || ''} onChange={(e) => setProfile({ ...profile, delivery_window: e.target.value })} /></div>
                      <div className="md:col-span-2"><label className={label}>Delivery address</label><textarea className={field} rows={3} value={profile.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })} /></div>
                    </div>
                    <button onClick={saveProfile} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-[12px] font-black uppercase tracking-[0.18em] text-white shadow-[0_8px_24px_rgba(232,24,26,0.25)] transition hover:bg-brand-dark"><Check size={16} /> Save outlet profile</button>
                  </section>
                )}
              </>
            )}
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink/10 bg-white/95 px-2 pt-1.5 shadow-[0_-8px_24px_rgba(15,15,15,0.06)] backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}>
          <div className="mx-auto flex max-w-md items-stretch justify-around">
            {mobileTabs.map(({ id, label, Icon }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition ${
                    isActive ? 'text-brand' : 'text-ink/45 hover:text-ink/70'
                  }`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${isActive ? 'bg-brand text-white shadow-[0_6px_16px_rgba(232,24,26,0.3)]' : 'bg-transparent'}`}>
                    <Icon size={16} />
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-brand' : ''}`}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
