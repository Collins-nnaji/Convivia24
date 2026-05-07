import Link from 'next/link';

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Inquire', href: '/inquire' },
];

export default function Footer() {
  return (
    <footer
      data-site-footer
      className="relative z-30 isolate mt-0 border-t border-gold/20 bg-[#f8f6f2]/95 text-neutral-900"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 md:py-7">
        {/* Mobile: one tight band */}
        <div className="flex flex-col gap-4 sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="shrink-0 opacity-90 hover:opacity-100 transition-opacity">
              <img
                src="/convivia24.png"
                alt="Convivia24"
                className="h-5 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center gap-4 text-[11px] text-neutral-500">
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-red-800 transition-colors whitespace-nowrap">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-neutral-500 leading-relaxed pr-2">
            Connecting people together daily — same-night tables across London, Lagos, Abuja.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-100 text-[10px] text-neutral-500">
            <span>&copy; 2026 Convivia24</span>
            <Link href="/auth/sign-in" className="text-red-700/80 hover:text-red-800 transition-colors text-[10px] font-semibold uppercase tracking-wider">
              Sign in
            </Link>
          </div>
        </div>

        {/* Desktop: compact two-column */}
        <div className="hidden sm:flex sm:flex-row sm:items-start sm:justify-between gap-6 sm:gap-10">
          <div className="min-w-0 max-w-sm">
            <Link href="/" className="inline-block mb-2 opacity-90 hover:opacity-100 transition-opacity">
              <img
                src="/convivia24.png"
                alt="Convivia24"
                className="h-6 w-auto object-contain"
              />
            </Link>
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-red-700/70 mb-1.5">Connecting people together daily</p>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Live pulse, curated tables, and AI matches — rooted in London, Lagos, and Abuja.
            </p>
          </div>

          <div className="flex flex-col items-end gap-4 sm:min-w-[200px]">
            <div className="flex flex-wrap justify-end gap-x-8 gap-y-2 text-[12px] text-neutral-500">
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-red-800 transition-colors whitespace-nowrap">
                  {link.label}
                </Link>
              ))}
            </div>
            <Link
              href="/auth/sign-in"
              className="text-center text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 border border-red-200 text-red-800 hover:bg-red-50 transition-colors"
            >
              Open Your 24
            </Link>
          </div>
        </div>

        <div className="hidden sm:flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-neutral-100 text-[11px] text-neutral-400">
          <span>&copy; 2026 Convivia24</span>
          <Link href="/inquire" className="text-red-700/75 hover:text-red-800 text-[10px] font-semibold uppercase tracking-wider transition-colors">
            Inquire &rarr;
          </Link>
        </div>
      </div>
    </footer>
  );
}
