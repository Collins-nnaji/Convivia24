import Link from 'next/link';

const footerLinks = [
  { label: 'My 24', href: '/my24' },
  { label: 'Companion', href: '/companion' },
];

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-gold/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-5 sm:pt-6 sm:pb-6 md:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="hover:opacity-80 transition-opacity shrink-0">
              <img src="/convivia24.png" alt="Convivia24" className="h-5 w-auto object-contain" />
            </Link>
            <span className="hidden sm:block w-px h-4 bg-obsidian/10" aria-hidden />
            <p className="hidden sm:block text-[10px] text-obsidian/45 truncate">
              Lower your stress. Optimize your hours. Love your day.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-obsidian/45">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-obsidian transition-colors">
                {link.label}
              </Link>
            ))}
            <span className="text-obsidian/25 hidden sm:inline" aria-hidden>|</span>
            <span className="text-obsidian/40">&copy; 2026 Convivia24</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
