import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Privacy Policy | Convivia24',
  description: 'How Convivia24 handles your event, guest, and personal data.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-5 py-10" style={{ background: 'var(--cv-ivory, #faf6ee)', color: 'var(--cv-ink, #1a1714)' }}>
      <article className="mx-auto max-w-3xl rounded-[28px] border border-neutral-200 bg-white/95 p-6 shadow-sm sm:p-10">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src="/convivia24.png" alt="Convivia24" width={120} height={32} style={{ objectFit: 'contain' }} />
        </Link>

        <h1 className="mt-8 text-4xl italic" style={{ fontFamily: 'var(--font-instrument, serif)' }}>
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm" style={{ color: 'var(--cv-muted, #888)' }}>Last updated: May 16, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-7" style={{ color: 'var(--cv-muted-2, #555)' }}>
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              What We Collect
            </h2>
            <p className="mt-2">
              Convivia24 collects information you provide when creating an account, planning events, and managing
              guest lists. This includes your name and email address, event details (name, date, venue, type),
              guest information (names, email addresses, phone numbers, RSVP responses and party sizes),
              photos you upload to event galleries, AI concierge conversation history, and standard device
              and browser metadata generated when you use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              How We Use Your Data
            </h2>
            <p className="mt-2">
              We use the information we collect to provide and improve Convivia24 — specifically to authenticate
              your account, create and manage your events, generate RSVP links and guest passes, send invitation
              and reminder emails on your behalf, power the AI concierge with event context, store and serve
              event photos, and prevent fraud or abuse. We do not sell your data or use it for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Guest Data
            </h2>
            <p className="mt-2">
              When you add guests to an event, their name, email, and RSVP status are stored so you can track
              attendance and send invitations. Guests who receive an RSVP link can view limited event details
              (name, date, venue, dress code) and submit their RSVP response without creating an account.
              Guest data is associated with your event and is accessible only to you as the event host and
              to Convivia24 platform administrators for support and abuse prevention purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Photos and Uploads
            </h2>
            <p className="mt-2">
              Photos you upload to event galleries are stored securely in cloud storage. They are accessible
              to anyone with a link to your event gallery. Do not upload photos you would not want to share
              with your event guests. You can delete individual photos at any time from your event dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Sharing
            </h2>
            <p className="mt-2">
              We do not sell, rent, or trade your personal information. We use trusted infrastructure providers
              for authentication, hosting, database storage, file storage, and AI services. These providers
              process data on our behalf under appropriate data protection agreements. We may disclose data
              when required by law or to protect the rights and safety of our users.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Data Retention
            </h2>
            <p className="mt-2">
              Your events, guests, and photos remain stored until you delete them or close your account.
              When you delete an event, all associated guest records and photos are also deleted. When you
              close your account, all of your data is permanently removed within 30 days, except where
              retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Your Choices
            </h2>
            <p className="mt-2">
              You can access, update, export, or delete your account data at any time from your account
              settings or by contacting support. You can delete individual guests, events, or photos
              directly within the app. To close your account entirely or request a full data export,
              contact us at the address below.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Cookies and Analytics
            </h2>
            <p className="mt-2">
              Convivia24 uses cookies and similar technologies solely to keep you signed in and to remember
              your preferences. We may collect anonymised usage analytics to understand how the platform is
              used and to improve it. We do not use third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cv-ink, #1a1714)' }}>
              Contact
            </h2>
            <p className="mt-2">
              For privacy questions, data requests, or to report a concern, contact{' '}
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
