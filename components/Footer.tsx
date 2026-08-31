import Link from 'next/link';
import Image from 'next/image';

const footerLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Party Planner', href: '/plan' },
  { label: 'Discover', href: '/trivia' },
  { label: 'Brands', href: '/brands' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t border-white/10 mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-6 sm:pt-7 pb-[calc(1.5rem+4rem+env(safe-area-inset-bottom))] md:pb-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="shrink-0 hover:opacity-90 transition-opacity" aria-label="Convivia24">
              <Image
                src="/convivia24.png"
                alt="Convivia24"
                width={299}
                height={55}
                className="h-6 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
            <p className="hidden sm:block text-[10px] text-white/40 truncate">
              Plan the night · invite friends · order drinks · nationwide · 18+
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/30">
          <span>&copy; 2026 Convivia24 · 18+</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
