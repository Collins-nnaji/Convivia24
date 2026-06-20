import Link from 'next/link';

const footerLinks = [
  { label: 'My 24',     href: '/my24' },
  { label: 'Companion', href: '/companion' },
];

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-gold/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-12">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-10 pb-10 border-b border-obsidian/10">
          <div>
            <Link href="/" className="hover:opacity-80 transition-opacity block mb-3">
              <img src="/convivia24.png" alt="Convivia24" className="h-7 w-auto object-contain" style={{ filter: 'brightness(0)' }} />
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-1 bg-gold rounded-full animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-obsidian/40">The Mindful Calendar</p>
            </div>
            <p className="text-xs text-obsidian/50 max-w-xs leading-relaxed">
              Lower your stress. Optimize your hours. Love your day.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-sm text-obsidian/50 hover:text-obsidian transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-obsidian/40">
          <span>&copy; 2026 Convivia24</span>
          <Link href="/my24" className="text-gold-dark hover:text-gold font-semibold transition-colors uppercase tracking-wider text-[10px]">
            Open My 24 &rarr;
          </Link>
        </div>
      </div>
    </footer>
  );
}
