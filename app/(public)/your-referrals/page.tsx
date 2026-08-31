import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReferPortal from '@/components/referrals/ReferPortal';

export const metadata: Metadata = {
  title: 'Your referrals',
  robots: { index: false, follow: false },
};

export default function ReferPortalPage() {
  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-16 sm:pb-24">
        <Link
          href="/refer-and-earn"
          className="inline-flex items-center gap-1.5 text-[11px] font-wordmark-sm text-obsidian/45 hover:text-obsidian mb-6"
        >
          <ArrowLeft size={12} /> Partner programme
        </Link>
        <h1 className="font-wordmark text-lg sm:text-xl md:text-2xl text-obsidian mb-8">
          Your referrals
        </h1>
        <ReferPortal />
      </div>
    </section>
  );
}
