import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import PackageAddToCart from '@/components/packages/PackageAddToCart';
import PackageCard from '@/components/packages/PackageCard';
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
} from '@/lib/packages/catalog';
import { CATEGORY_LABELS } from '@/lib/drinks/catalog';
import { absoluteUrl } from '@/lib/seo';

export function generateStaticParams() {
  return EVENT_PACKAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  if (!pkg) return { title: 'Package not found' };
  return {
    title: pkg.name,
    description: `${pkg.tagline} ${formatNgn(pkg.priceNgn)} for about ${pkg.guests} guests, delivered. Adults 18+.`,
    alternates: { canonical: absoluteUrl(`/packages/${pkg.slug}`) },
    openGraph: {
      title: `${pkg.name} | Convivia24`,
      description: pkg.tagline,
      url: absoluteUrl(`/packages/${pkg.slug}`),
    },
  };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  if (!pkg) notFound();

  const components = resolveComponents(pkg);
  const fullPrice = componentsTotalNgn(pkg);
  const saving = savingsNgn(pkg);
  const related = EVENT_PACKAGES.filter((p) => p.slug !== pkg.slug).slice(0, 3);

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-16 sm:pb-24">
        <Link
          href="/packages"
          className="inline-flex items-center gap-1.5 text-[11px] font-wordmark-sm text-obsidian/45 hover:text-obsidian mb-6"
        >
          <ArrowLeft size={12} /> All packages
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-obsidian/40 mb-2">
              {OCCASION_LABELS[pkg.occasion]}
            </p>
            <h1 className="font-wordmark text-lg sm:text-xl md:text-2xl text-obsidian mb-3">
              {pkg.name}
            </h1>
            <p className="text-sm text-obsidian/70 leading-relaxed mb-6 max-w-prose">
              {pkg.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-wider text-obsidian/45 mb-8">
              <span className="inline-flex items-center gap-1">
                <Users size={11} /> ~{pkg.guests} guests
              </span>
              <span aria-hidden>·</span>
              <span>{bottleCount(pkg)} bottles &amp; packs</span>
              <span aria-hidden>·</span>
              <span>about {formatNgn(spendPerGuestNgn(pkg))} a guest</span>
            </div>

            <h2 className="font-wordmark-sm text-[11px] uppercase tracking-wider text-obsidian/40 mb-3">
              What is in it
            </h2>
            <ul className="border-t border-obsidian/10">
              {components.map((c) => (
                <li
                  key={c.slug}
                  className="flex items-baseline justify-between gap-4 py-2.5 border-b border-obsidian/10"
                >
                  <span className="text-xs text-obsidian/80">
                    <span className="tabular-nums font-semibold text-obsidian">{c.qty} ×</span>{' '}
                    <Link href={`/shop/${c.slug}`} className="hover:text-ember hover:underline">
                      {c.product.name}
                    </Link>
                    <span className="text-obsidian/40">
                      {' '}
                      · {CATEGORY_LABELS[c.product.category]}
                    </span>
                  </span>
                  <span className="text-[11px] text-obsidian/45 tabular-nums shrink-0">
                    {formatNgn(c.lineTotalNgn)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-obsidian/40">
              Bought separately: {formatNgn(fullPrice)}.
              {saving > 0 && <> The package saves you {formatNgn(saving)}.</>}
            </p>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-obsidian/10 bg-white p-5">
              <p className="text-2xl font-semibold text-obsidian">{formatNgn(pkg.priceNgn)}</p>
              {saving > 0 && (
                <p className="text-[11px] text-obsidian/45 mt-1">
                  <span className="line-through">{formatNgn(fullPrice)}</span> · save{' '}
                  {formatNgn(saving)}
                </p>
              )}
              <div className="mt-4">
                <PackageAddToCart slug={pkg.slug} />
              </div>
              <p className="mt-3 text-[10px] text-obsidian/40 leading-relaxed">
                Delivered nationwide. Add your event date and address at checkout. Adults 18+.
              </p>
            </div>

            <p className="mt-4 text-[11px] text-obsidian/45 leading-relaxed">
              Wrong size?{' '}
              <Link href="/plan" className="text-ember hover:underline">
                Size it by headcount
              </Link>{' '}
              instead.
            </p>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-wordmark-sm text-[11px] uppercase tracking-wider text-obsidian/40 mb-4">
              Other packages
            </h2>
            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PackageCard key={p.slug} pkg={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
