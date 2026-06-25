import Link from 'next/link';
import WaitlistForm from './WaitlistForm';

const footerLinks = [
  { label: 'Discover', href: '/events' },
  { label: 'Concierge', href: '/concierge' },
  { label: 'My tickets', href: '/tickets' },
  { label: 'Host an event', href: '/create' },
  { label: 'Organizer console', href: '/admin' },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink/8 bg-surface-sunken">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 mb-10 pb-10 border-b border-ink/8">
          <div className="max-w-sm">
            <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity" aria-label="Convivia24 home">
              <img src="/convivia24.png" alt="" className="h-8 w-auto" style={{ filter: 'brightness(0)' }} />
            </Link>
            <p className="font-display text-2xl italic text-ink mb-2">Curated gatherings, worldwide.</p>
            <p className="text-sm text-ink-muted leading-relaxed">
              From business salons to supper clubs and nightlife — guestlists, lounges, and memory walls built in.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-10 lg:gap-16">
            <div className="grid grid-cols-2 gap-x-10 gap-y-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-ink-muted hover:text-ink transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="w-full sm:min-w-[300px] sm:max-w-[360px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-copper-deep mb-3">Early access</p>
              <WaitlistForm variant="footer" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-ink-muted">
          <span>&copy; {new Date().getFullYear()} Convivia24</span>
          <Link href="/events" className="font-semibold text-copper hover:text-copper-bright transition-colors">
            Browse events →
          </Link>
        </div>
      </div>
    </footer>
  );
}
