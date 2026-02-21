'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PAGES = [
  { label: 'What We Do', href: '/collective' },
  { label: 'Intel', href: '/intel' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Convivia24 home">
          <img src="/convivia24.png" alt="Convivia24" className="h-7 w-auto sm:h-8" />
        </Link>

        <nav className="flex flex-1 items-center justify-end gap-6 sm:gap-8" aria-label="Main">
          {PAGES.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`whitespace-nowrap text-sm font-medium ${pathname === href ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/briefing"
            className="shrink-0 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 sm:px-5 sm:py-2.5"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
