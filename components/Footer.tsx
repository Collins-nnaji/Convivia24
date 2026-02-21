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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-14">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-8">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/convivia24.png" alt="Convivia24" className="h-7 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            </Link>
            <span className="hidden text-zinc-500 sm:inline" aria-hidden>|</span>
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
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500 sm:gap-x-8">
            <Link href="/briefing" className="text-red-400 hover:text-red-300 font-medium transition-colors">
              Contact
            </Link>
            <span>© 2024 Convivia24</span>
            <span>Lagos · Abuja · London</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
