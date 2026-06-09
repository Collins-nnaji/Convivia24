import Link from 'next/link';
import WaitlistForm from './WaitlistForm';

const footerLinks = [
  { label: 'Discover',     href: '/events' },
  { label: 'AI Concierge', href: '/concierge' },
  { label: 'My Tickets',   href: '/tickets' },
  { label: 'Sell Tickets', href: '/create' },
  { label: 'Organizers',   href: '/admin' },
];

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t border-gold/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-12">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-10 pb-10 border-b border-gold/10">
          <div>
            <Link href="/" className="hover:opacity-80 transition-opacity block mb-3">
              <img src="/convivia24.png" alt="Convivia24" className="h-7 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-1 bg-gold rounded-full animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cream/40">Events · Tickets · AI</p>
            </div>
            <p className="text-xs text-cream/40 max-w-xs leading-relaxed">
              The AI-powered events and ticketing platform for parties, concerts and culture.
              QR + barcode entry. Lagos · Abuja · London.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-12">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-10 gap-y-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap text-sm text-cream/40 hover:text-cream transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="w-full sm:min-w-[280px] sm:max-w-[360px]">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/50 mb-3">Get early access to drops</p>
              <WaitlistForm variant="footer" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-cream/30">
          <div className="flex items-center gap-6">
            <span>&copy; 2026 Convivia24</span>
            <span className="text-cream/20">Lagos &middot; Abuja &middot; London</span>
          </div>
          <Link href="/events" className="text-gold/60 hover:text-gold font-semibold transition-colors uppercase tracking-wider text-[10px]">
            Find Events &rarr;
          </Link>
        </div>
      </div>
    </footer>
  );
}
