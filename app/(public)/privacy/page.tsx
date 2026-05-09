import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Convivia24',
  description: 'How Convivia24 handles account, verification, staffing, and support data.',
};

export default function PrivacyPage() {
  return (
    <main className="mobile-scroll-screen mobile-safe-screen bg-[#f8f6f2] text-neutral-900 px-5">
      <article className="mx-auto max-w-3xl rounded-[28px] border border-neutral-200 bg-white/95 p-6 shadow-sm sm:p-10">
        <Link href="/" className="text-[10px] font-black uppercase tracking-[0.22em] text-red-700">
          Convivia24
        </Link>
        <h1 className="mt-6 font-display text-4xl italic">Privacy Policy</h1>
        <p className="mt-3 text-sm text-neutral-500">Last updated: May 9, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-neutral-700">
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">What We Collect</h2>
            <p className="mt-2">
              Convivia24 collects account details, profile information, outlet applications, shift activity,
              verification photos, uploaded images, device/browser metadata, and support messages needed to run
              the hospitality staffing platform.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">How We Use Data</h2>
            <p className="mt-2">
              We use this data to authenticate users, match workers and outlets, review applications, verify
              identity, process support requests, prevent abuse, improve reliability, and comply with legal or
              operational obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">Sharing</h2>
            <p className="mt-2">
              We share relevant profile, verification, and shift details between workers, outlets, and admins
              only where needed to operate the service. We also use infrastructure providers for authentication,
              hosting, database, storage, analytics, and messaging.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">Your Choices</h2>
            <p className="mt-2">
              You can request account help, correction, export, or deletion by contacting support. Some records
              may be retained where required for fraud prevention, dispute handling, financial records, or legal
              compliance.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">Contact</h2>
            <p className="mt-2">
              For privacy requests, contact{' '}
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
