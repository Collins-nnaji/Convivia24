import Link from 'next/link';
import Image from 'next/image';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/drinks/catalog';

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'All drinks', href: '/shop' },
      { label: 'New in', href: '/shop?offer=new' },
      { label: 'Deals', href: '/shop?offer=on-offer' },
      ...CATEGORIES.filter((c) => c !== 'party-packs' && c !== 'mixers').map((c) => ({
        label: CATEGORY_LABELS[c],
        href: `/shop?type=${c}`,
      })),
      { label: 'Party packs', href: '/shop?section=packages' },
    ],
  },
  {
    title: 'Plan & discover',
    links: [
      { label: 'Party Planner', href: '/party-planner' },
      { label: 'Find your taste', href: '/discover/taste' },
      { label: 'Cocktail maker', href: '/discover/mix' },
      { label: 'Brands', href: '/brands' },
      { label: 'Trend report', href: '/trends' },
      { label: 'Guest Card', href: '/guest-card' },
      { label: 'Refer & earn', href: '/shop/refer-and-earn' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Track an order', href: '/orders' },
      { label: 'Delivery & returns', href: '/delivery-and-returns' },
      { label: 'Support', href: '/support' },
      { label: 'Contact us', href: '/contact' },
    ],
  },
  {
    title: 'Business',
    links: [
      { label: 'Venues & wholesale', href: '/partners' },
      { label: 'Brand partnerships', href: '/brands/portal' },
      { label: 'Supplier portal', href: '/supplier' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto shrink-0 bg-obsidian text-white">
      <div className="mx-auto max-w-[1600px] px-5 pb-[calc(2rem+4rem+env(safe-area-inset-bottom))] pt-14 sm:px-8 md:pb-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Link href="/" aria-label="Convivia24" className="inline-block hover:opacity-90">
              <Image src="/convivia24.png" alt="Convivia24" width={299} height={55} className="h-8 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              Spirits, Champagne, wine and party packs — delivered in supported areas across Nigeria.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70">
              <span className="grid h-6 w-6 place-items-center rounded-full border border-saffron text-[11px] font-bold text-saffron">18+</span>
              Adults only. Please enjoy responsibly.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/75 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Convivia24 · Payments secured by Flutterwave</span>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="hover:text-white/70">
              Privacy
            </Link>
            <Link href="/terms-of-use" className="hover:text-white/70">
              Terms
            </Link>
            <Link href="/delivery-and-returns" className="hover:text-white/70">
              Delivery
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
