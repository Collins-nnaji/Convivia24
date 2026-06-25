import Link from 'next/link';
import WaitlistForm from './WaitlistForm';

const consumerLinks = [
  { label: 'Discover events', href: '/events' },
  { label: 'AI Concierge', href: '/concierge' },
  { label: 'My tickets', href: '/tickets' },
];

const organiserLinks = [
  { label: 'List an event', href: '/create' },
  { label: 'Event organiser tools', href: '/admin' },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink/8 bg-surface-sunken">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 sm:pb-12">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 sm:gap-10 mb-8 sm:mb-10 pb-8 sm:pb-10 border-b border-ink/8">
          <div className="max-w-sm">
            <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity touch-target" aria-label="Convivia24 home">
              <img src="/convivia24.png" alt="" className="h-7 sm:h-8 w-auto max-w-[9.5rem] object-contain" style={{ filter: 'brightness(0)' }} />
            </Link>
            <p className="font-display text-xl sm:text-2xl italic text-ink mb-2 text-balance">Find events. Book tickets. Show up.</p>
            <p className="text-sm text-ink-muted leading-relaxed">
              Discover curated gatherings — from business salons to supper clubs and nightlife. Your tickets live in one place, ready at the door.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-10 lg:gap-16">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-copper-deep mb-3">For guests</p>
              <div className="grid gap-y-2.5">
                {consumerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-ink-muted hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-copper-deep mb-3">For event organisers</p>
              <div className="grid gap-y-2.5">
                {organiserLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-ink-muted hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="w-full sm:min-w-[280px] sm:max-w-[360px]">
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
