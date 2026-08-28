import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgePercent, Link2, Wallet } from 'lucide-react';
import ReferApplyForm from '@/components/referrals/ReferApplyForm';
import { DEFAULT_COMMISSION_PCT } from '@/lib/referrals/codes';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Refer & earn',
  description:
    'Event planners, venues, caterers and DJs: send your clients to Convivia24 for their event drinks and earn commission on every order. Adults 18+.',
  alternates: { canonical: absoluteUrl('/refer') },
  openGraph: {
    title: 'Refer & earn | Convivia24',
    description: 'Send your clients for their event drinks. Earn on every order they place.',
    url: absoluteUrl('/refer'),
  },
};

const STEPS = [
  {
    icon: Link2,
    title: 'Share your link',
    body: 'You get a code and a link. Send it to a client, put it in a proposal, or add it to your bio.',
  },
  {
    icon: BadgePercent,
    title: 'They order their drinks',
    body: 'Anyone who orders within 30 days of clicking your link is credited to you — packages included.',
  },
  {
    icon: Wallet,
    title: 'You get paid',
    body: `Commission starts at ${DEFAULT_COMMISSION_PCT}% of what they actually pay, and is confirmed once their payment clears. Take it as cash or a gift card.`,
  },
];

export default function ReferPage() {
  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-16 sm:pb-24">
        <header className="mb-10">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-2">
            Partner programme
          </p>
          <h1 className="font-wordmark text-lg sm:text-xl md:text-2xl text-obsidian mb-3">
            You plan the event. We handle the drinks.
          </h1>
          <p className="text-sm text-obsidian/60 max-w-xl leading-relaxed">
            Every wedding, birthday and corporate night you run needs drinks. Send that part to us and
            take a cut of it — without touching stock, delivery or a single crate.
          </p>
        </header>

        <ol className="grid gap-4 sm:grid-cols-3 mb-12">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="bg-white border border-obsidian/10 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={15} className="text-ember" />
                <span className="text-[10px] uppercase tracking-wider text-obsidian/35">
                  Step {i + 1}
                </span>
              </div>
              <h2 className="font-semibold text-sm text-obsidian mb-1.5">{title}</h2>
              <p className="text-xs text-obsidian/55 leading-relaxed">{body}</p>
            </li>
          ))}
        </ol>

        <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
          <div>
            <h2 className="font-wordmark-sm text-[11px] uppercase tracking-wider text-obsidian/40 mb-4">
              Apply
            </h2>
            <ReferApplyForm />
          </div>

          <aside className="space-y-6 text-xs text-obsidian/55 leading-relaxed lg:pt-9">
            <div>
              <h3 className="font-semibold text-obsidian text-sm mb-1.5">What we pay on</h3>
              <p>
                Commission is calculated on what the customer actually pays, after any discount, and
                only once their payment has cleared. Cancelled or refunded orders earn nothing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-obsidian text-sm mb-1.5">Already a partner?</h3>
              <p>
                <Link href="/refer/portal" className="text-ember hover:underline">
                  Open your dashboard
                </Link>{' '}
                to see your code, referred orders and what you are owed.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-obsidian text-sm mb-1.5">Selling to us instead?</h3>
              <p>
                If you run a club or lounge and want to buy wholesale, that is{' '}
                <Link href="/contact" className="text-ember hover:underline">
                  the partners programme
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
