'use client';

import { useEffect, useMemo, useState } from 'react';
import { BadgePercent, Check, ChevronDown, Users } from 'lucide-react';
import PackageAddToCart from '@/components/packages/PackageAddToCart';
import {
  EVENT_PACKAGES,
  OCCASION_LABELS,
  bottleCount,
  componentsTotalNgn,
  formatNgn,
  getPackageBySlug,
  resolveComponents,
  savingsNgn,
  spendPerGuestNgn,
  type PackageOccasion,
} from '@/lib/packages/catalog';
import { CATEGORY_LABELS } from '@/lib/drinks/catalog';

export const PACKAGE_OCCASION_ORDER: PackageOccasion[] = [
  'party',
  'wedding',
  'birthday',
  'corporate',
  'bbq',
  'premium',
  'low-abv',
];

function savingsPct(pkg: (typeof EVENT_PACKAGES)[number]) {
  const total = componentsTotalNgn(pkg);
  return total > 0 ? Math.round((savingsNgn(pkg) / total) * 100) : 0;
}

type Props = {
  selectedSlug?: string | null;
  className?: string;
  compact?: boolean;
  /** Occasion is driven by the shop left bar — hide the duplicate sidebar here. */
  hideSidebar?: boolean;
  occasion?: PackageOccasion;
  onOccasionChange?: (occ: PackageOccasion) => void;
};

export default function PackageBrowse({
  selectedSlug,
  className = '',
  compact = false,
  hideSidebar = false,
  occasion: controlledOccasion,
  onOccasionChange,
}: Props) {
  const initialOccasion = getPackageBySlug(selectedSlug || '')?.occasion ?? 'party';
  const [internalOccasion, setInternalOccasion] = useState<PackageOccasion>(initialOccasion);
  const occasion = controlledOccasion ?? internalOccasion;
  const [expanded, setExpanded] = useState<string | null>(selectedSlug || null);

  useEffect(() => {
    if (!selectedSlug) return;
    const pkg = getPackageBySlug(selectedSlug);
    if (!pkg) return;
    if (!controlledOccasion) setInternalOccasion(pkg.occasion);
    onOccasionChange?.(pkg.occasion);
    setExpanded(selectedSlug);
    requestAnimationFrame(() => {
      document.getElementById(`pkg-${selectedSlug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [selectedSlug]);

  useEffect(() => {
    if (controlledOccasion) setExpanded(null);
  }, [controlledOccasion]);

  const items = useMemo(() => EVENT_PACKAGES.filter((p) => p.occasion === occasion), [occasion]);
  const savingRates = items.map(savingsPct).filter((rate) => rate > 0);
  const savingRange = savingRates.length
    ? Math.min(...savingRates) === Math.max(...savingRates)
      ? `${savingRates[0]}%`
      : `${Math.min(...savingRates)}–${Math.max(...savingRates)}%`
    : null;

  function pickOccasion(occ: PackageOccasion) {
    if (onOccasionChange) onOccasionChange(occ);
    else setInternalOccasion(occ);
    setExpanded(null);
  }

  const list = (
    <div className="flex-1 min-w-0">
      {!hideSidebar && (
        <>
          <h2 className={`font-bold text-obsidian mb-2 ${compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>
            {OCCASION_LABELS[occasion]} packages
          </h2>
          <p className="text-body text-obsidian/60 mb-6 max-w-2xl">
            One fixed price per package — cheaper than buying the same bottles separately. Delivered nationwide.
          </p>
        </>
      )}

      {hideSidebar && (
        <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-obsidian">{OCCASION_LABELS[occasion]} packages</h2>
            <p className="mt-1 text-sm sm:text-base text-obsidian/55">
              Compare the package price with the same bottles bought separately.
            </p>
          </div>
          {savingRange && (
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
              <BadgePercent size={18} aria-hidden />
              <span className="text-sm font-semibold">Save {savingRange} on this tab</span>
            </div>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-body text-obsidian/45">No packages in this section yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((pkg) => {
            const open = expanded === pkg.slug;
            const saving = savingsNgn(pkg);
            const savingPercent = savingsPct(pkg);
            const individualTotal = componentsTotalNgn(pkg);
            const components = resolveComponents(pkg);

            return (
              <li
                key={pkg.slug}
                className={`overflow-hidden rounded-2xl border bg-white transition-colors ${
                  open ? 'border-ember/25' : 'border-obsidian/10 hover:border-obsidian/20'
                }`}
              >
                <button
                  type="button"
                  id={`pkg-${pkg.slug}`}
                  aria-expanded={open}
                  onClick={() => setExpanded(open ? null : pkg.slug)}
                  className="w-full p-4 sm:p-6 text-left flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 hover:bg-paper/60 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-obsidian">{pkg.name}</h3>
                      {saving > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                          <Check size={12} aria-hidden /> Save {savingPercent}%
                        </span>
                      )}
                    </div>
                    <p className="text-base text-obsidian/70 mt-1.5 leading-snug">{pkg.tagline}</p>
                    <p className="text-sm sm:text-base text-obsidian/50 mt-2.5 inline-flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="inline-flex items-center gap-1.5">
                        <Users size={15} aria-hidden /> ~{pkg.guests} guests
                      </span>
                      <span aria-hidden>·</span>
                      <span>{bottleCount(pkg)} bottles</span>
                      <span aria-hidden>·</span>
                      <span>{formatNgn(spendPerGuestNgn(pkg))} / guest</span>
                    </p>
                  </div>
                  <div className="flex w-full items-end justify-between gap-4 shrink-0 sm:w-auto sm:items-center">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-obsidian/35">Package price</p>
                      <p className="text-2xl sm:text-3xl font-semibold text-obsidian tabular-nums">
                        {formatNgn(pkg.priceNgn)}
                      </p>
                      {saving > 0 && (
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 sm:justify-end">
                          <p className="text-sm text-obsidian/40 line-through tabular-nums">{formatNgn(individualTotal)}</p>
                          <p className="text-sm font-semibold text-emerald-700 tabular-nums">Save {formatNgn(saving)}</p>
                        </div>
                      )}
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-obsidian/40 transition-transform ${open ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-obsidian/8 bg-paper/50 px-4 py-5 sm:px-6 sm:py-6">
                    <p className="text-body text-obsidian/75 mb-5 max-w-2xl">{pkg.description}</p>
                    {saving > 0 && (
                      <dl className="mb-6 grid grid-cols-3 overflow-hidden rounded-xl border border-obsidian/8 bg-white divide-x divide-obsidian/8">
                        <div className="p-3 sm:p-4 min-w-0">
                          <dt className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] text-obsidian/35">Separate</dt>
                          <dd className="mt-1 text-sm sm:text-lg text-obsidian/50 line-through tabular-nums truncate">{formatNgn(individualTotal)}</dd>
                        </div>
                        <div className="p-3 sm:p-4 min-w-0">
                          <dt className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] text-obsidian/35">Package</dt>
                          <dd className="mt-1 text-sm sm:text-lg font-bold text-obsidian tabular-nums truncate">{formatNgn(pkg.priceNgn)}</dd>
                        </div>
                        <div className="p-3 sm:p-4 min-w-0 bg-emerald-50/70">
                          <dt className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700">You save</dt>
                          <dd className="mt-1 text-sm sm:text-lg font-bold text-emerald-700 tabular-nums truncate">{formatNgn(saving)}</dd>
                        </div>
                      </dl>
                    )}
                    <p className="text-label text-obsidian/45 mb-2">What&apos;s included</p>
                    <ul className="mb-5 divide-y divide-obsidian/8 border border-obsidian/10 bg-white">
                      {components.map((c) => (
                        <li
                          key={c.slug}
                          className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-4 py-3 text-sm sm:text-base"
                        >
                          <span className="text-obsidian/85">
                            <span className="font-semibold tabular-nums">{c.qty}×</span> {c.product.name}{' '}
                            <span className="text-obsidian/45">· {CATEGORY_LABELS[c.product.category]}</span>
                          </span>
                          <span className="text-obsidian/50 tabular-nums shrink-0">{formatNgn(c.lineTotalNgn)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="max-w-md">
                      <PackageAddToCart slug={pkg.slug} label="Add package to cart" />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  if (hideSidebar) {
    return <div className={className}>{list}</div>;
  }

  return (
    <div className={`flex flex-col lg:flex-row gap-6 lg:gap-10 ${className}`}>
      <nav className="lg:w-52 shrink-0" aria-label="Package occasions">
        <p className="text-label text-obsidian/50 mb-3 hidden lg:block">Occasion</p>
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-hide pb-1">
          {PACKAGE_OCCASION_ORDER.map((occ) => {
            const count = EVENT_PACKAGES.filter((p) => p.occasion === occ).length;
            if (!count) return null;
            const active = occasion === occ;
            return (
              <button
                key={occ}
                type="button"
                onClick={() => pickOccasion(occ)}
                className={`shrink-0 lg:shrink w-full text-left px-4 py-3 text-sm sm:text-base font-medium transition-colors ${
                  active
                    ? 'bg-obsidian text-white lg:border-l-[3px] lg:border-ember'
                    : 'bg-white border border-obsidian/10 text-obsidian/65 hover:border-obsidian/25 hover:text-obsidian'
                }`}
              >
                {OCCASION_LABELS[occ]}
              </button>
            );
          })}
        </div>
      </nav>
      {list}
    </div>
  );
}
