import Link from 'next/link';

const footerLinks = [
  { label: 'Moments',  href: '/moments' },
  { label: 'Discover', href: '/discover' },
  { label: 'Places',   href: '/places' },
  { label: 'Plans',    href: '/meetups' },
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
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cream/40">Gather &middot; Share &middot; Remember</p>
            </div>
            <p className="text-xs text-cream/40 max-w-xs leading-relaxed">
              An app for gathering around food and drink — finding the table, keeping the night,
              and quietly working out who owes what.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-16">
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-10 gap-y-3">
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

            <div className="max-w-xs">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/50 mb-3">No money moves here</p>
              <p className="text-xs text-cream/40 leading-relaxed">
                Convivia24 is not a wallet or a payment app. It works out what each person owes; you
                settle at the till, the way you always have.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-cream/30">
          <div className="flex items-center gap-6">
            <span>&copy; 2026 Convivia24</span>
            <span className="text-cream/20">Lagos &middot; Abuja &middot; London</span>
          </div>
          <Link href="/discover" className="text-gold/60 hover:text-gold font-semibold transition-colors uppercase tracking-wider text-[10px]">
            Find a table &rarr;
          </Link>
        </div>
      </div>
    </footer>
  );
}
