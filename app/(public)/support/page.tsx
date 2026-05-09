import Link from 'next/link';

export const metadata = {
  title: 'Support | Convivia24',
  description: 'Get support for Convivia24 accounts, verification, shifts, and outlet applications.',
};

export default function SupportPage() {
  return (
    <main className="mobile-scroll-screen mobile-safe-screen bg-[#f8f6f2] text-neutral-900 px-5">
      <section className="mx-auto max-w-xl rounded-[28px] border border-neutral-200 bg-white/95 p-6 text-center shadow-sm sm:p-10">
        <Link href="/" className="text-[10px] font-black uppercase tracking-[0.22em] text-red-700">
          Convivia24
        </Link>
        <h1 className="mt-6 font-display text-4xl italic">Support</h1>
        <p className="mt-4 text-sm leading-7 text-neutral-600">
          Need help with your account, verification, outlet application, shift, payout, or a safety issue?
          Contact the Convivia24 team and include the email address on your account.
        </p>
        <a
          href="mailto:support@convivia24.com"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-red-700 px-6 text-[11px] font-black uppercase tracking-widest text-white hover:bg-red-800"
        >
          support@convivia24.com
        </a>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs font-semibold text-neutral-500">
          <Link href="/privacy" className="hover:text-red-700">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-red-700">
            Terms
          </Link>
        </div>
      </section>
    </main>
  );
}
