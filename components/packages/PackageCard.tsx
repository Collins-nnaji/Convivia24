import Link from 'next/link';
import Image from 'next/image';
import PackageAddToCart from '@/components/packages/PackageAddToCart';
import {
  bottleCount,
  componentsTotalNgn,
  formatNgn,
  savingsNgn,
  spendPerGuestNgn,
  type EventPackage,
} from '@/lib/packages/catalog';

export default function PackageCard({ pkg }: { pkg: EventPackage }) {
  const saving = savingsNgn(pkg);
  const title = pkg.name.replace(/^CONVIVIA24\s*/i, '').trim() || pkg.name;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-obsidian/10 bg-gradient-to-br from-ember/[0.06] via-white to-obsidian/[0.04] shadow-[0_6px_24px_rgba(34,11,10,0.05)]">
      <Link href={`/packages/${pkg.slug}`} className="block p-5 pb-4 flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="flex flex-wrap items-center gap-2">
            <Image src="/convivia24.png" alt="Convivia24" width={299} height={55} className="h-4 w-auto" />
            <span className="package-title-accent brand-text font-wordmark-sm text-[12px] leading-none">{title}</span>
          </h3>
        </div>

        <dl className="mb-4 mt-3 grid grid-cols-3 divide-x divide-obsidian/10">
          <div className="min-w-0 py-1 pr-2">
            <dt className="text-[8px] font-black uppercase tracking-wider text-obsidian/35">Guests</dt>
            <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums">~{pkg.guests}</dd>
          </div>
          <div className="min-w-0 px-2 py-1">
            <dt className="text-[8px] font-black uppercase tracking-wider text-obsidian/35">Bottles</dt>
            <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums">{bottleCount(pkg)}</dd>
          </div>
          <div className="min-w-0 py-1 pl-2">
            <dt className="text-[8px] font-black uppercase tracking-wider text-obsidian/35">Per guest</dt>
            <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums">{formatNgn(spendPerGuestNgn(pkg))}</dd>
          </div>
        </dl>

        <p className="text-lg font-semibold text-obsidian">{formatNgn(pkg.priceNgn)}</p>
        <p className="text-[10px] text-obsidian/45 mt-0.5">
          {saving > 0 && (
            <>
              <span className="mr-1 inline-flex rounded-full bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                Save {formatNgn(saving)}
              </span>
              <span className="line-through">{formatNgn(componentsTotalNgn(pkg))}</span>
              <span aria-hidden> · </span>
            </>
          )}
          about {formatNgn(spendPerGuestNgn(pkg))} a guest
        </p>
      </Link>

      <div className="px-5 pb-5">
        <PackageAddToCart slug={pkg.slug} label="Add to cart" showQty={false} />
      </div>
    </article>
  );
}
