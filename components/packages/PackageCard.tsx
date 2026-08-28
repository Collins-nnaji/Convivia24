import Link from 'next/link';
import { Users } from 'lucide-react';
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

  return (
    <article className="flex flex-col border border-obsidian/10 bg-white">
      <Link href={`/packages/${pkg.slug}`} className="block p-5 pb-4 flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-wordmark-sm text-[13px] leading-tight text-obsidian">{pkg.name}</h3>
          {saving > 0 && (
            <span className="badge-brand text-[8px] font-black uppercase tracking-wider px-2 py-0.5 shrink-0">
              Save {formatNgn(saving)}
            </span>
          )}
        </div>

        <p className="text-xs text-obsidian/60 leading-snug mb-4">{pkg.tagline}</p>

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-obsidian/45 mb-4">
          <span className="inline-flex items-center gap-1">
            <Users size={11} /> ~{pkg.guests} guests
          </span>
          <span aria-hidden>·</span>
          <span>{bottleCount(pkg)} bottles</span>
        </div>

        <p className="text-lg font-semibold text-obsidian">{formatNgn(pkg.priceNgn)}</p>
        <p className="text-[10px] text-obsidian/45 mt-0.5">
          {saving > 0 && (
            <>
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
