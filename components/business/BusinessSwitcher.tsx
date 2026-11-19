import Link from 'next/link';
import { Megaphone, Store } from 'lucide-react';

/**
 * The two business portals, side by side: Wholesale (venues buying stock) and
 * Brands (houses managing their page, campaigns and events).
 */
const PORTALS = [
  { id: 'wholesale', href: '/partners', label: 'Wholesale portal', sub: 'For bars, clubs, hotels & events', icon: Store },
  { id: 'brands', href: '/brands/portal', label: 'Brand portal', sub: 'Claim your brand, campaigns & events', icon: Megaphone },
] as const;

export default function BusinessSwitcher({ active }: { active: (typeof PORTALS)[number]['id'] }) {
  return (
    <nav aria-label="Business portals" className="mx-auto max-w-[1600px] px-3 pt-4 sm:px-4 lg:px-5">
      <ul className="grid grid-cols-2 gap-2 rounded-2xl border border-obsidian/8 bg-white p-1.5">
        {PORTALS.map(({ id, href, label, sub, icon: Icon }) => {
          const on = id === active;
          return (
            <li key={id}>
              <Link
                href={href}
                aria-current={on ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors sm:px-4 ${
                  on ? 'bg-obsidian text-white' : 'text-obsidian/60 hover:bg-paper hover:text-obsidian'
                }`}
              >
                <Icon size={17} className={on ? 'text-saffron' : 'text-ember'} />
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold leading-tight">{label}</span>
                  <span className={`hidden truncate text-[11px] sm:block ${on ? 'text-white/55' : 'text-obsidian/40'}`}>{sub}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
