'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { CategoryIcon } from '@/components/icons/ShopIcons';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  DRINKS,
  type DrinkCategory,
  type DrinkProduct,
} from '@/lib/drinks/catalog';

type ShopProduct = DrinkProduct & {
  onHand?: number;
  available?: number;
  lowStock?: boolean;
};

export default function ShopCatalog() {
  const params = useSearchParams();
  const initialCat = params.get('category') as DrinkCategory | null;
  const initialQ = params.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [category, setCategory] = useState<DrinkCategory | 'all'>(
    initialCat && CATEGORIES.includes(initialCat) ? initialCat : 'all'
  );
  const [products, setProducts] = useState<ShopProduct[]>(DRINKS);
  const [live, setLive] = useState(false);

  useEffect(() => {
    fetch('/api/shop/catalog')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length) {
          setProducts(data.products);
          setLive(!data.degraded);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products;
    if (category !== 'all') list = list.filter((d) => d.category === category);
    if (q) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.brand?.toLowerCase().includes(q) ||
          d.tagline.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, query, category]);

  const recommended = products.filter((d) => d.featured);
  const deals = products.filter((d) => d.deal);
  const packs = products.filter((d) => d.partyPack);
  const showRails = !query && category === 'all';

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="mb-8">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-2">Shop</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-obsidian mb-2">
          <span className="brand-text">Order drinks</span>
        </h1>
        <p className="text-sm text-obsidian/50">
          Parties, clubs, lounges — Lagos delivery
          {live ? ' · live stock' : ''}
        </p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian/35" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search whisky, canned cocktails, party packs…"
          className="w-full pl-10 pr-4 py-3 bg-white border border-obsidian/10 focus:border-ember focus:ring-0 text-sm"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-10 -mx-5 px-5 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`shrink-0 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] transition-colors ${
            category === 'all' ? 'bg-obsidian text-white' : 'bg-white border border-obsidian/10 text-obsidian/50'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] transition-colors ${
              category === cat ? 'bg-obsidian text-white' : 'bg-white border border-obsidian/10 text-obsidian/50'
            }`}
          >
            <CategoryIcon category={cat} className="w-3.5 h-3.5" />
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {showRails && (
        <>
          <Rail title="Recommended" products={recommended} />
          <Rail title="Hot deals" products={deals} />
          <Rail title="Party packs" products={packs} />
        </>
      )}

      <div className="mt-4">
        <h2 className="text-lg font-bold text-obsidian mb-5">
          {showRails ? 'All drinks' : `${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
        </h2>
        {filtered.length === 0 ? (
          <p className="text-sm text-obsidian/45">No drinks match. Try another search or category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {filtered.map((p) => (
              <div key={p.slug} className="relative">
                <ProductCard product={p} />
                {typeof p.available === 'number' && (
                  <p
                    className={`mt-1 text-[10px] font-black uppercase tracking-[0.1em] ${
                      p.available <= 0 ? 'text-obsidian/35' : p.lowStock ? 'text-ember' : 'text-obsidian/40'
                    }`}
                  >
                    {p.available <= 0 ? 'Out of stock' : p.lowStock ? `Low · ${p.available} left` : `${p.available} in stock`}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Rail({ title, products }: { title: string; products: ShopProduct[] }) {
  if (products.length === 0) return null;
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-obsidian">{title}</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1 -mx-5 px-5 sm:mx-0 sm:px-0">
        {products.map((p) => (
          <div key={p.slug} className="shrink-0 w-[150px] sm:w-[170px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
