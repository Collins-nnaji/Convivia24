import Link from 'next/link';

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'What We Do', href: '/collective' },
  { label: 'Intel', href: '/intel' },
  { label: 'Contact', href: '/briefing' },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-zinc-900 border-t-2 border-red-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-12">

        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-10 pb-10 border-b border-zinc-800">
          <div>
            <Link href="/" className="hover:opacity-80 transition-opacity block mb-3">
              <img src="/convivia24.png" alt="Convivia24" className="h-7 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-red-700 rounded-full animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">Revenue Doesn&apos;t Sleep</p>
            </div>
            <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">
              Always-on sales management — audit, network, and execution — running 24 hours a day for growth-focused businesses.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-3 sm:gap-x-12 sm:gap-y-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-6">
            <span>© 2026 Convivia24</span>
            <span className="text-zinc-700">Lagos · Abuja · London</span>
          </div>
          <Link href="/briefing" className="text-red-400 hover:text-red-300 font-semibold transition-colors uppercase tracking-wider text-[10px]">
            Get in Touch →
          </Link>
        </div>
      </div>
    </footer>
  );
}
