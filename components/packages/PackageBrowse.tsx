'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, ChevronDown } from 'lucide-react';
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

function packageTitle(name: string) {
  return name.replace(/^CONVIVIA24\s*/i, '').trim() || name;
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

  function pickOccasion(occ: PackageOccasion) {
    if (onOccasionChange) onOccasionChange(occ);
    else setInternalOccasion(occ);
    setExpanded(null);
  }

  const list = (
    <div className="flex-1 min-w-0">
      {!hideSidebar && (
        <>
          <h2 className={`font-wordmark text-obsidian mb-2 ${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>
            {OCCASION_LABELS[occasion]} packages
          </h2>
          <p className="text-body text-obsidian/60 mb-6 max-w-2xl">
            One fixed price per package — cheaper than buying the same bottles separately. Delivered nationwide.
          </p>
        </>
      )}

      {hideSidebar && (
        <div className="mb-5">
          <div>
            <h2 className="font-wordmark text-lg sm:text-xl text-obsidian">{OCCASION_LABELS[occasion]} packages</h2>
            <p className="mt-1 text-sm sm:text-base text-obsidian/55">
              Compare the package price with the same bottles bought separately.
            </p>
          </div>
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
                className={`overflow-hidden rounded-2xl border bg-gradient-to-br from-ember/[0.06] via-white to-obsidian/[0.04] shadow-[0_6px_24px_rgba(34,11,10,0.05)] transition-all ${
                  open
                    ? 'border-ember/30 shadow-[0_10px_30px_rgba(78,19,15,0.09)]'
                    : 'border-obsidian/10 hover:border-ember/20 hover:shadow-[0_10px_28px_rgba(34,11,10,0.08)]'
                }`}
              >
                <button
                  type="button"
                  id={`pkg-${pkg.slug}`}
                  aria-expanded={open}
                  onClick={() => setExpanded(open ? null : pkg.slug)}
                  className="w-full p-4 sm:p-6 text-left flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 hover:bg-white/35 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Image
                          src="/convivia24.png"
                          alt="Convivia24"
                          width={299}
                          height={55}
                          className="h-[17px] w-auto sm:h-5"
                        />
                        <span className="package-title-accent brand-text font-wordmark-sm text-[13px] leading-none sm:text-[15px]">
                          {packageTitle(pkg.name)}
                        </span>
                      </h3>
                    </div>
                    <dl className="mt-3 grid max-w-xl grid-cols-3 divide-x divide-obsidian/10">
                      <div className="min-w-0 py-1 pr-2.5 sm:pr-3">
                        <dt className="text-[9px] font-black uppercase tracking-[0.1em] text-obsidian/35 sm:text-[10px]">Guests</dt>
                        <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums text-obsidian sm:text-base">~{pkg.guests}</dd>
                      </div>
                      <div className="min-w-0 px-2.5 py-1 sm:px-3">
                        <dt className="text-[9px] font-black uppercase tracking-[0.1em] text-obsidian/35 sm:text-[10px]">Bottles</dt>
                        <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums text-obsidian sm:text-base">{bottleCount(pkg)}</dd>
                      </div>
                      <div className="min-w-0 py-1 pl-2.5 sm:pl-3">
                        <dt className="text-[9px] font-black uppercase tracking-[0.1em] text-obsidian/35 sm:text-[10px]">Per guest</dt>
                        <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums text-obsidian sm:text-base">{formatNgn(spendPerGuestNgn(pkg))}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex w-full items-end justify-between gap-4 shrink-0 sm:w-auto sm:items-center">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-obsidian/35">Package price</p>
                      <p className="text-2xl sm:text-3xl font-semibold text-obsidian tabular-nums">
                        {formatNgn(pkg.priceNgn)}
                      </p>
                      {saving > 0 && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:justify-end">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                            <Check size={11} aria-hidden /> Save {savingPercent}%
                          </span>
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
                  <div className="border-t border-obsidian/8 bg-white/55 px-4 py-5 sm:px-6 sm:py-6">
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
