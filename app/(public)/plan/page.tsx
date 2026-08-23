import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PartyPlanner from '@/components/shop/PartyPlanner';
import TrustBadges from '@/components/shop/TrustBadges';
import PlanShareDemo from '@/components/party/PlanShareDemo';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Plan drink supplies',
  description:
    'Size drink supplies for any event in Nigeria — from a dinner for eight to a thousand-guest hall. Bottles, mixers, party packs, nationwide delivery. Adults 18+.',
  alternates: { canonical: absoluteUrl('/plan') },
  openGraph: {
    title: 'Plan drink supplies | Convivia24',
    description: 'Tell us the headcount. We size the bar — spirits, Champagne, RTDs, and mixers — then drop it in your cart.',
    url: absoluteUrl('/plan'),
  },
};

export default function PlanPage() {
  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-16 sm:pb-24">
        <header className="mb-8 sm:mb-10">
          <h1 className="font-wordmark text-lg sm:text-xl md:text-2xl text-obsidian mb-4 whitespace-nowrap">
            Plan drinks for any event size
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <TrustBadges />
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-[11px] font-wordmark-sm text-ember hover:text-ember-dark"
            >
              Or browse the shop <ArrowRight size={12} />
            </Link>
          </div>
        </header>

        <PlanShareDemo />

        <PartyPlanner defaultOpen />
      </div>
    </section>
  );
}
