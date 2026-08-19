import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="min-h-[100dvh] flex items-center justify-center px-5 bg-paper">
      <div className="max-w-md text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ember mb-4">404</p>
        <h1 className="text-3xl font-bold mb-3">Nothing's dropping here.</h1>
        <p className="text-sm text-obsidian/55 leading-relaxed mb-8">
          This page doesn&apos;t exist, or the link's gone stale. Let's get you back to the shop.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop" className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
            Shop drinks
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-obsidian/15 text-obsidian/70 text-[11px] font-black uppercase tracking-[0.14em]"
          >
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
