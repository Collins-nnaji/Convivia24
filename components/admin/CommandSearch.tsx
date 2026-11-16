'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, ShoppingBag, Truck, User, Wine } from 'lucide-react';

export type SearchHit = { type: 'order' | 'customer' | 'bottle' | 'supplier'; id: string; title: string; sub: string };

const ICON = { order: ShoppingBag, customer: User, bottle: Wine, supplier: Truck };
const GROUP = { order: 'Orders', customer: 'Customers', bottle: 'Bottles', supplier: 'Suppliers' };

/** Ctrl/⌘+K anywhere on the desk: type a name, phone, order number or bottle and jump to it. */
export default function CommandSearch({ onPick }: { onPick: (hit: SearchHit) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 0);
    else {
      setQ('');
      setHits([]);
    }
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q.trim())}`, { signal: ctl.signal });
        if (res.ok) {
          setHits((await res.json()).results || []);
          setCursor(0);
        }
      } catch {
        /* superseded */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q]);

  const pick = (hit: SearchHit) => {
    setOpen(false);
    onPick(hit);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-md border border-obsidian/15 bg-white px-2.5 py-1.5 text-left text-xs text-obsidian/55 hover:border-obsidian/40"
      >
        <Search size={14} />
        <span className="flex-1">Search…</span>
        <kbd className="rounded border border-obsidian/15 px-1 text-[10px] font-semibold">Ctrl K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center bg-obsidian/40 px-3 pt-[12vh]" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Search the desk" className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-obsidian/10 px-3">
              <Search size={17} className="text-obsidian/50" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setCursor((c) => Math.min(hits.length - 1, c + 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setCursor((c) => Math.max(0, c - 1));
                  } else if (e.key === 'Enter' && hits[cursor]) pick(hits[cursor]);
                }}
                placeholder="Order number, customer, phone, bottle or supplier"
                className="h-12 flex-1 border-0 text-sm focus:ring-0"
              />
              {loading && <span className="text-[11px] text-obsidian/50">Searching…</span>}
            </div>
            <ul className="max-h-[50vh] overflow-y-auto py-1">
              {q.trim().length >= 2 && !loading && hits.length === 0 && <li className="px-4 py-3 text-sm text-obsidian/60">Nothing found.</li>}
              {hits.map((h, i) => {
                const Icon = ICON[h.type];
                const header = i === 0 || hits[i - 1].type !== h.type;
                return (
                  <li key={`${h.type}-${h.id}`}>
                    {header && <p className="px-4 pb-0.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-obsidian/50">{GROUP[h.type]}</p>}
                    <button
                      type="button"
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => pick(h)}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left ${cursor === i ? 'bg-obsidian text-white' : ''}`}
                    >
                      <Icon size={15} className={cursor === i ? 'text-saffron' : 'text-obsidian/50'} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{h.title}</span>
                        <span className={`block truncate text-[11px] ${cursor === i ? 'text-white/70' : 'text-obsidian/55'}`}>{h.sub}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
