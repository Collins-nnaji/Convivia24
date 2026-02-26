import Link from 'next/link';
import WaitlistForm from './WaitlistForm';

const footerLinks = [
  { label: 'Home',           href: '/' },
  { label: 'The Spaces',     href: '/spaces' },
  { label: 'The Convivium',  href: '/convivium' },
  { label: 'Partnerships',  href: '/partnerships' },
  { label: 'Inquire',        href: '/inquire' },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-obsidian border-t border-gold/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-12">

        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-10 pb-10 border-b border-gold/10">
          <div>
            <Link href="/" className="hover:opacity-80 transition-opacity block mb-3">
              <img src="/convivia24.png" alt="Convivia24" className="h-7 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-1 bg-gold rounded-full animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cream/40">Come to the Table</p>
            </div>
            <p className="text-xs text-cream/40 max-w-xs leading-relaxed">
              A luxury hotel and members club for African business. Where operators, founders, and executives convene.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-12">
            <div className="flex flex-col gap-4 sm:grid sm:grid-cols-3 sm:gap-x-12 sm:gap-y-4">
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
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/50 mb-3">Join the Convivium Waitlist</p>
              <WaitlistForm variant="footer" />
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-cream/30">
          <div className="flex items-center gap-6">
            <span>&copy; 2026 Convivia24</span>
            <span className="text-cream/20">Lagos &middot; Abuja &middot; London</span>
          </div>
          <Link href="/inquire" className="text-gold/60 hover:text-gold font-semibold transition-colors uppercase tracking-wider text-[10px]">
            Inquire &rarr;
          </Link>
        </div>
      </div>
    </footer>
  );
}
