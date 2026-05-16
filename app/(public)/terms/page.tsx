import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Terms of Service | Convivia24',
  description: 'Terms for using Convivia24 party planning and event management services.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-5 py-10" style={{ background: 'var(--cv-ivory, #faf6ee)', color: 'var(--cv-ink, #1a1714)' }}>
      <article className="mx-auto max-w-3xl rounded-[28px] border border-neutral-200 bg-white/95 p-6 shadow-sm sm:p-10">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src="/convivia24.png" alt="Convivia24" width={120} height={32} style={{ objectFit: 'contain' }} />
        </Link>

        <h1 className="mt-8 text-4xl italic" style={{ fontFamily: 'var(--font-instrument, serif)' }}>
          Terms of Service
        </h1>
        <p className="mt-3 text-sm" style={{ color: 'var(--cv-muted, #888)' }}>Last updated: May 16, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-7" style={{ color: 'var(--cv-muted-2, #555)' }}>
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              What Convivia24 Is
            </h2>
            <p className="mt-2">
              Convivia24 is a party planning and event management platform that helps you create events,
              manage guest lists, send invitations, track RSVPs, share photo galleries, and use an AI
              concierge to help plan the details. By creating an account or using the service, you agree
              to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Eligibility
            </h2>
            <p className="mt-2">
              You must be at least 18 years old to create a Convivia24 account. By registering, you confirm
              that the information you provide is accurate and that you have the authority to send invitations
              and communications to the guests you add. You are responsible for ensuring you have the consent
              of your guests to share their contact details with Convivia24.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Your Events and Content
            </h2>
            <p className="mt-2">
              You own the events, guest lists, and photos you create on Convivia24. By uploading photos or
              other content, you grant Convivia24 a limited licence to store and display that content in
              order to provide the service. You are responsible for ensuring that content you upload does
              not infringe third-party rights, violate any laws, or contain harmful material.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Guest Communications
            </h2>
            <p className="mt-2">
              When you use Convivia24 to send invitation emails or nudge reminders, you confirm that
              recipients have a legitimate connection to you and your event, and that sending them messages
              via Convivia24 is appropriate. You must not use the platform to send unsolicited bulk
              communications or spam.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              AI Concierge
            </h2>
            <p className="mt-2">
              The AI concierge provides planning suggestions and ideas based on your event details. Its
              responses are generated automatically and may not always be accurate, current, or appropriate
              for your specific circumstances. You should use your own judgement before acting on any
              AI-generated suggestions, particularly regarding vendor recommendations, budgets, or logistics.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Acceptable Use
            </h2>
            <p className="mt-2">
              You agree not to misuse Convivia24. Prohibited activities include: using the platform to
              harass or deceive guests; uploading content that is unlawful, offensive, or infringes
              third-party rights; attempting to access other users&apos; accounts or data; scraping or
              automated access without permission; and using the service to facilitate any illegal activity.
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Service Availability
            </h2>
            <p className="mt-2">
              We aim to keep Convivia24 available and reliable, but we cannot guarantee uninterrupted
              access. We may update, maintain, or suspend the service at any time. We are not liable for
              any loss arising from service unavailability, particularly around time-sensitive events.
              We strongly recommend downloading guest lists and key event information ahead of your event.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Limitation of Liability
            </h2>
            <p className="mt-2">
              Convivia24 is provided &quot;as is&quot; without warranties of any kind. To the fullest extent
              permitted by law, we are not liable for any indirect, incidental, or consequential damages
              arising from your use of the platform, including but not limited to missed invitations,
              RSVP errors, or lost event data. Our total liability to you shall not exceed the amount
              you paid us in the 12 months before the claim arose.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Changes to These Terms
            </h2>
            <p className="mt-2">
              We may update these terms from time to time. We will notify you of material changes by
              email or via an in-app notice. Continued use of Convivia24 after changes are posted
              constitutes your acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Contact
            </h2>
            <p className="mt-2">
              For questions about these terms, contact{' '}
              <a href="mailto:support@convivia24.com" className="font-semibold" style={{ color: 'var(--cv-accent, #b91c1c)' }}>
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
