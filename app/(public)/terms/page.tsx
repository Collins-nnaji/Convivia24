import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Convivia24',
  description: 'Terms for using Convivia24 hospitality staffing services.',
};

export default function TermsPage() {
  return (
    <main className="mobile-scroll-screen mobile-safe-screen bg-[#f8f6f2] text-neutral-900 px-5">
      <article className="mx-auto max-w-3xl rounded-[28px] border border-neutral-200 bg-white/95 p-6 shadow-sm sm:p-10">
        <Link href="/" className="text-[10px] font-black uppercase tracking-[0.22em] text-red-700">
          Convivia24
        </Link>
        <h1 className="mt-6 font-display text-4xl italic">Terms of Service</h1>
        <p className="mt-3 text-sm text-neutral-500">Last updated: May 9, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-neutral-700">
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">Use Of The Service</h2>
            <p className="mt-2">
              Convivia24 connects hospitality workers, outlets, and platform administrators. You must provide
              accurate information, keep your account secure, and use the service only for lawful staffing,
              verification, and shift coordination purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">Eligibility</h2>
            <p className="mt-2">
              The service is intended for users who are at least 18 years old. Outlets are responsible for
              providing accurate shift, pay, safety, and venue information.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">Verification And Trust</h2>
            <p className="mt-2">
              We may require identity, profile, or outlet verification before unlocking some features. Verification
              helps platform trust, but it does not guarantee user behavior, outlet conditions, or shift outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">Payments And Disputes</h2>
            <p className="mt-2">
              Shift pay, payouts, fees, and disputes may depend on outlet confirmation, worker attendance,
              platform review, and applicable payment provider rules.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">Contact</h2>
            <p className="mt-2">
              For terms or support questions, contact{' '}
              <a href="mailto:support@convivia24.com" className="font-semibold text-red-700">
                support@convivia24.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
