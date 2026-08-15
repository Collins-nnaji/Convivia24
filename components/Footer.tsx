import Link from 'next/link';

const footerLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Circles', href: '/circles' },
  { label: 'Crews', href: '/crews' },
  { label: 'Venues', href: '/venues' },
  { label: 'Cart', href: '/cart' },
];

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t border-white/10 pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 sm:py-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="shrink-0 hover:opacity-90 transition-opacity" aria-label="Convivia24">
              <img
                src="/convivia24.png"
                alt="Convivia24"
                className="h-6 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
            <p className="hidden sm:block text-[10px] text-white/35 truncate">
              Lagos drinks · parties, clubs & lounges · 18+
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white/45 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-4 pt-4 border-t border-white/8 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/30">
          <span>&copy; 2026 Convivia24</span>
          <Link href="/shop" className="text-ember hover:text-ember-light uppercase tracking-wider text-[10px] font-semibold">
            Order drinks →
          </Link>
        </div>
      </div>
    </footer>
  );
}
