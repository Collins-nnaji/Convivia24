import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PackageCard from '@/components/packages/PackageCard';
import TrustBadges from '@/components/shop/TrustBadges';
import { EVENT_PACKAGES, OCCASION_LABELS, type PackageOccasion } from '@/lib/packages/catalog';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Event drinks packages',
  description:
    'Named drinks packages for parties, weddings, birthdays, corporate events and BBQs across Nigeria. One fixed price, delivered. Adults 18+.',
  alternates: { canonical: absoluteUrl('/packages') },
  openGraph: {
    title: 'Event drinks packages | Convivia24',
    description: 'Pick the package that matches your event. One price, delivered nationwide.',
    url: absoluteUrl('/packages'),
  },
};

/** Display order for the occasion sections. */
const OCCASION_ORDER: PackageOccasion[] = [
  'party',
  'wedding',
  'birthday',
  'corporate',
  'bbq',
  'premium',
  'low-abv',
];

export default function PackagesPage() {
  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-16 sm:pb-24">
        <header className="mb-8 sm:mb-10">
          <h1 className="font-wordmark text-lg sm:text-xl md:text-2xl text-obsidian mb-3">
            Pick a package. We handle the rest.
          </h1>
          <p className="text-sm text-obsidian/60 max-w-xl mb-4 leading-relaxed">
            Every package below is a complete bar at one fixed price — cheaper than buying the same
            bottles one by one. Tell us the date at checkout and it arrives.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <TrustBadges />
            <Link
              href="/plan"
              className="inline-flex items-center gap-1.5 text-[11px] font-wordmark-sm text-ember hover:text-ember-dark"
            >
              Or size it yourself by headcount <ArrowRight size={12} />
            </Link>
          </div>
        </header>

        {OCCASION_ORDER.map((occasion) => {
          const items = EVENT_PACKAGES.filter((p) => p.occasion === occasion);
          if (!items.length) return null;
          return (
            <div key={occasion} className="mb-12 last:mb-0">
              <h2 className="font-wordmark-sm text-[11px] uppercase tracking-wider text-obsidian/40 mb-4">
                {OCCASION_LABELS[occasion]}
              </h2>
              <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((pkg) => (
                  <PackageCard key={pkg.slug} pkg={pkg} />
                ))}
              </div>
            </div>
          );
        })}

        <p className="mt-12 text-[11px] text-obsidian/40 leading-relaxed max-w-xl">
          Need something between two sizes, or a package built around bottles you already have? Use the{' '}
          <Link href="/plan" className="text-ember hover:underline">
            planner
          </Link>{' '}
          to size it by headcount, or{' '}
          <Link href="/inquire" className="text-ember hover:underline">
            talk to us
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
