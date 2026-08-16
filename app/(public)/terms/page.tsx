import Link from 'next/link';

export const metadata = {
  title: 'Terms of Use | Convivia24',
  description: 'Terms of use for Convivia24. Alcohol delivery and nightlife services for adults 18+.',
};

export default function TermsPage() {
  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-3">Legal · 18+</p>
        <h1 className="font-logo font-black tracking-tight uppercase text-3xl sm:text-4xl text-obsidian mb-3">
          Terms of Use
        </h1>
        <p className="text-sm text-obsidian/45 mb-10">Last updated: 16 August 2026</p>

        <div className="space-y-8 text-base text-obsidian/70 leading-relaxed">
          <p>
            These Terms govern your use of Convivia24 — drinks ordering, events discovery, Guest Card perks, and
            partner tools. By entering the site or placing an order you agree to them.
          </p>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">1. Age requirement (18+)</h2>
            <p>
              Convivia24 is for persons aged 18 years or older only. Alcohol products are sold and delivered only
              to adults. By confirming the age gate and ordering, you represent that you and any recipient of
              alcohol are 18+. We may request ID at delivery and refuse service without refund where the law
              requires.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">2. The service</h2>
            <p>
              We offer Lagos-area drink delivery to homes, parties, clubs, and lounges; event listings; loyalty
              features; and partner wholesale tools. Catalog, pricing, stock, and delivery windows may change.
              Event listings and venue information may be provided by third parties and are not a guarantee of
              entry or availability.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">3. Orders &amp; payment</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>An order is an offer to buy; acceptance occurs when we confirm payment and fulfilment.</li>
              <li>Prices are shown in Nigerian Naira (NGN) unless stated otherwise.</li>
              <li>Payment is processed by our payment provider (e.g. Flutterwave or other processors we designate).</li>
              <li>We may cancel orders for suspected fraud, underage purchase, stock issues, or delivery limits.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">4. Delivery</h2>
            <p>
              Delivery estimates are indicative. You must provide a reachable phone number and accurate address
              or venue. Risk in goods passes on delivery to you or your nominated recipient, subject to applicable
              law. Failed delivery attempts due to unreachable customers may incur redelivery fees or cancellation.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">5. Responsible use</h2>
            <p>
              Do not misuse the platform — including purchasing for minors, reselling without authorisation, or
              harassing staff and partners. You are responsible for consuming alcohol responsibly.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">6. Loyalty, partners &amp; invites</h2>
            <p>
              Guest Card points, partner Premium perks, gift cards, and party invite tools are promotional
              features we may modify or withdraw. Partner portals and invite links must not be abused.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">7. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by Nigerian law, Convivia24 is not liable for indirect or
              consequential losses, venue door policies, or third-party event cancellations. Our total liability
              for a given order is limited to the amount you paid for that order.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">8. Changes</h2>
            <p>
              We may update these Terms. Continued use after changes means you accept the revised Terms. Material
              changes to paid services will be highlighted where practical.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-obsidian mb-2">9. Contact</h2>
            <p>
              For terms questions or order issues, use the site inquire flow or the contact details on your order
              confirmation.
            </p>
          </section>
        </div>

        <p className="mt-12 text-sm text-obsidian/45">
          See also our{' '}
          <Link href="/privacy" className="text-ember hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
