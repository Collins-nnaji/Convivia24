import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Convivia24 collects and uses data for drinks orders, events, Guest Card, and partner tools. Adults 18+.',
  alternates: { canonical: absoluteUrl('/privacy') },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-3">Legal · 18+</p>
        <h1 className="font-logo font-black tracking-tight uppercase text-3xl sm:text-4xl text-obsidian mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-obsidian/45 mb-10">Last updated: 16 August 2026</p>

        <div className="space-y-8 text-base text-obsidian/70 leading-relaxed">
          <p>
            Convivia24 (&quot;we&quot;, &quot;us&quot;) operates a drinks ordering and nightlife platform for adults
            aged 18 and over, with nationwide delivery across Nigeria. This policy explains what we collect and how we use it.
          </p>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">1. Who may use Convivia24</h2>
            <p>
              You must be at least 18 years old to browse, order alcohol, or create an account. We use an age gate and
              may refuse or cancel orders if we reasonably believe a customer is underage.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">2. Information we collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Contact and delivery details you provide at checkout (name, email, phone, address or venue).</li>
              <li>Order history, payment references from our payment provider, and cart activity on your device.</li>
              <li>Account details if you sign in (email, name, profile image from the auth provider).</li>
              <li>Optional loyalty / Guest Card details and partner outlet information you submit.</li>
              <li>Technical data such as device type, approximate location (if you use Near me), and cookies for age verification and sessions.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">3. How we use information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To process and deliver orders, confirm payments, and support you.</li>
              <li>To send transactional messages (order status, delivery windows).</li>
              <li>To operate loyalty perks, partner desks, events, and invites you opt into.</li>
              <li>To prevent fraud, enforce our 18+ rule, and improve the product.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">4. Sharing</h2>
            <p>
              We share data with service providers needed to run the service — for example payment processors,
              email delivery, hosting, and logistics partners. We do not sell your personal information. We may
              disclose information if required by law or to protect users and the platform.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">5. Cookies &amp; local storage</h2>
            <p>
              We use cookies and local storage for the age gate, cart, loyalty wallet, and session state. You can
              clear these in your browser; doing so may reset your cart and preferences.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">6. Retention &amp; security</h2>
            <p>
              We keep order and account records as long as needed for operations, accounting, and legal duties.
              We apply reasonable technical and organisational measures; no system is perfectly secure.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">7. Your choices</h2>
            <p>
              Contact us to request access, correction, or deletion of personal data we hold, subject to legal
              retention needs. You may also opt out of non-essential marketing emails.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">8. Contact</h2>
            <p>
              Questions about privacy: use the inquire flow on the site or email the address published on your
              order confirmation when available.
            </p>
          </section>
        </div>

        <p className="mt-12 text-sm text-obsidian/45">
          See also our{' '}
          <Link href="/terms" className="text-ember hover:underline">
            Terms of Use
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
