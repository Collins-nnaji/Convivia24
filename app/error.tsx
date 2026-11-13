'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-paper text-obsidian antialiased">
        <section className="min-h-[100dvh] flex items-center justify-center px-5">
          <div className="max-w-md text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ember mb-4">Something broke</p>
            <h1 className="text-3xl font-serif font-light tracking-tight mb-3">The drop didn&apos;t land.</h1>
            <p className="text-sm text-obsidian/55 leading-relaxed mb-8">
              Something went wrong on our end. Your cart is safe — try again, or head back to the shop.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={reset}
                className="px-6 py-3 btn-brand text-[11px] font-bold uppercase tracking-[0.14em] rounded-full"
              >
                Try again
              </button>
              <Link
                href="/shop"
                className="px-6 py-3 border border-obsidian/15 text-obsidian/70 text-[11px] font-bold uppercase tracking-[0.14em] rounded-full"
              >
                Back to shop
              </Link>
            </div>
          </div>
        </section>
      </body>
    </html>
  );
}
