'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Clock, MapPin, Truck, X } from 'lucide-react';
import { DEFAULT_CONTENT, safeHref, type StorefrontBlock } from '@/lib/storefront/blocks';
import type { DeliveryCity } from '@/lib/storefront/repo';
import { formatNgn } from '@/lib/drinks/catalog';
import { LAUNCH_CITIES } from '@/lib/delivery/policy';

const CITY_KEY = 'convivia_city';

const DISMISS_KEY = 'convivia_announcement_dismissed';

const THEME_BG: Record<StorefrontBlock['theme'], string> = {
  palm: 'bg-palm text-white',
  ember: 'bg-ember text-white',
  night: 'bg-obsidian text-white',
  gold: 'bg-saffron text-obsidian',
  cream: 'bg-shell text-obsidian',
};

/** An announcement about delivery opens the delivery-areas panel instead of navigating away. */
const isDeliveryItem = (item: StorefrontBlock) => /deliver/i.test(`${item.href ?? ''} ${item.title}`);

/**
 * The thin strip above the header. Messages come from the desk (Storefront → Announcement bar)
 * and rotate; a dismissal lasts for the browser session. "Details" on a delivery message opens
 * the live list of delivery areas — the active zones from Delivery settings.
 */
export default function AnnouncementBar() {
  const pathname = usePathname();
  const [items, setItems] = useState<StorefrontBlock[]>(DEFAULT_CONTENT.announcement);
  const [delivery, setDelivery] = useState<DeliveryCity[] | null>(null);
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  // The modal portals into <body>, which only exists after hydration.
  const [mounted, setMounted] = useState(false);
  // Delivery city is the shopper's choice — never auto-detected.
  const [city, setCity] = useState('');

  function chooseCity(next: string) {
    setCity(next);
    try {
      localStorage.setItem(CITY_KEY, next);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent('convivia:city', { detail: next }));
  }

  useEffect(() => {
    setMounted(true);
    try {
      setCity(localStorage.getItem(CITY_KEY) || '');
    } catch {
      /* ignore */
    }
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') setHidden(true);
    } catch {
      /* storage blocked — keep showing */
    }
    fetch('/api/storefront')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d?.announcement) && d.announcement.length) setItems(d.announcement);
        setDelivery(Array.isArray(d?.delivery) ? d.delivery : []);
      })
      .catch(() => setDelivery([]));
  }, []);

  // Rotation pauses while the panel is open so the message under the reader doesn't change.
  useEffect(() => {
    if (items.length < 2 || panelOpen) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length, panelOpen]);

  useEffect(() => setPanelOpen(false), [pathname]);

  // Modal behaviour: Escape cancels and the page behind stops scrolling while it is open.
  useEffect(() => {
    if (!panelOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanelOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [panelOpen]);

  if (hidden || items.length === 0) return null;
  const item = items[index % items.length];
  const href = safeHref(item.href);
  const deliveryItem = isDeliveryItem(item);
  const step = (d: number) => setIndex((i) => (i + d + items.length) % items.length);
  const cityCount = delivery?.length ?? 0;

  return (
    <div className={`relative shrink-0 ${THEME_BG[item.theme]}`} role="region" aria-label="Announcements">
      <div className="mx-auto flex h-9 max-w-[1600px] items-center justify-center gap-2 px-10 text-center text-[12px] font-medium sm:text-[13px]">
        <label className="absolute left-8 hidden items-center gap-1 opacity-90 md:flex">
          <MapPin size={13} aria-hidden />
          <span className="sr-only">Delivery city</span>
          <select
            value={city}
            onChange={(e) => chooseCity(e.target.value)}
            className="cursor-pointer bg-transparent text-[12px] font-semibold underline-offset-2 hover:underline focus:outline-none [&>option]:text-obsidian"
          >
            <option value="">Select city</option>
            {(delivery && delivery.length ? delivery.map((c) => c.city) : LAUNCH_CITIES).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        {items.length > 1 && (
          <button type="button" onClick={() => step(-1)} aria-label="Previous announcement" className="absolute left-2 hidden opacity-60 hover:opacity-100 sm:block">
            <ChevronLeft size={15} />
          </button>
        )}
        <p className="flex min-w-0 items-center gap-1.5" aria-live="polite">
          {deliveryItem ? (
            <>
              <span className="truncate">{item.title}</span>
              <button
                type="button"
                onClick={() => setPanelOpen((v) => !v)}
                aria-expanded={panelOpen}
                aria-haspopup="dialog"
                className="inline-flex shrink-0 items-center gap-1 font-bold underline underline-offset-2"
              >
                {item.ctaLabel || 'Details'}
                <ChevronDown size={14} className={`transition-transform ${panelOpen ? 'rotate-180' : ''}`} />
              </button>
            </>
          ) : href ? (
            <Link href={href} className="truncate hover:underline">
              {item.title}
              {item.ctaLabel && <span className="ml-1.5 font-bold underline underline-offset-2">{item.ctaLabel}</span>}
            </Link>
          ) : (
            <span className="truncate">{item.title}</span>
          )}
        </p>
        {items.length > 1 && (
          <button type="button" onClick={() => step(1)} aria-label="Next announcement" className="absolute right-9 hidden opacity-60 hover:opacity-100 sm:block">
            <ChevronRight size={15} />
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setHidden(true);
            try {
              sessionStorage.setItem(DISMISS_KEY, '1');
            } catch {
              /* ignore */
            }
          }}
          aria-label="Dismiss announcement"
          className="absolute right-2.5 opacity-60 hover:opacity-100"
        >
          <X size={15} />
        </button>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {panelOpen && (
              <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-6">
                <motion.button
                  type="button"
                  aria-label="Close delivery areas"
                  className="absolute inset-0 cursor-default bg-obsidian/55 backdrop-blur-[2px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setPanelOpen(false)}
                />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="delivery-areas-title"
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  className="relative w-full max-w-3xl"
                >
            <div className="max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white p-5 text-left text-obsidian shadow-[0_30px_70px_-25px_rgba(10,10,10,0.55)] sm:rounded-3xl sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-ember">Delivery</p>
                  <h2 id="delivery-areas-title" className="mt-1 font-serif text-2xl font-light text-obsidian sm:text-[1.75rem]">Where we deliver</h2>
                  {cityCount > 0 && (
                    <p className="mt-1 text-sm text-obsidian/55">
                      {cityCount} {cityCount === 1 ? 'city' : 'cities'} · fees and timings confirmed at checkout
                    </p>
                  )}
                </div>
                <button type="button" onClick={() => setPanelOpen(false)} aria-label="Close delivery areas" className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-obsidian/5">
                  <X size={18} />
                </button>
              </div>

              {delivery === null ? (
                <p className="mt-5 text-sm text-obsidian/50">Loading delivery areas…</p>
              ) : cityCount === 0 ? (
                <div className="mt-5 rounded-2xl bg-shell p-5">
                  <p className="flex items-center gap-2 font-semibold text-obsidian">
                    <Truck size={18} className="text-ember" /> Delivery areas are being switched on
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-obsidian/60">
                    Enter your address at checkout to see whether we can deliver to you, with the fee and estimated time
                    before you pay.
                  </p>
                </div>
              ) : (
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {delivery!.map((c) => (
                    <li key={c.city} className="rounded-2xl bg-shell p-4 sm:p-5">
                      <p className="flex items-center gap-2 font-serif text-xl font-light text-obsidian">
                        <MapPin size={17} className="text-ember" /> {c.city}
                        <span className="ml-auto font-sans text-xs font-semibold text-obsidian/45">
                          {c.areas.length} area{c.areas.length === 1 ? '' : 's'}
                        </span>
                      </p>
                      <ul className="mt-3 divide-y divide-obsidian/[0.06] rounded-xl bg-white">
                        {c.areas.map((a) => (
                          <li key={a.name} className="flex items-center gap-3 px-3.5 py-2.5 text-sm">
                            <span className="min-w-0 flex-1 truncate font-medium text-obsidian">{a.name}</span>
                            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-obsidian/50">
                              <Clock size={12} /> {a.estimate}
                            </span>
                            <span className="w-20 shrink-0 text-right text-xs font-bold tabular-nums text-obsidian">
                              {a.feeNgn > 0 ? formatNgn(a.feeNgn) : 'Free'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-obsidian/[0.06] pt-4 text-sm">
                <p className="text-obsidian/55">Adults 18+ only — ID may be checked on delivery.</p>
                <Link href="/delivery-and-returns" onClick={() => setPanelOpen(false)} className="font-semibold text-obsidian underline decoration-obsidian/30 underline-offset-4 hover:decoration-obsidian">
                  Delivery &amp; returns policy
                </Link>
              </div>
            </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
