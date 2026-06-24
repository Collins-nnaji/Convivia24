'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { useUser } from '@/components/auth/AuthProvider';
import CheckInTrend from '@/components/calendar/CheckInTrend';
import RecommendationsPanel from '@/components/companion/RecommendationsPanel';

export default function InsightsPage() {
  const { user, loading: authLoading } = useUser();

  if (!authLoading && !user) {
    return (
      <section className="min-h-dvh md:min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 text-center bg-cream-base">
        <div>
          <p className="text-obsidian/70 text-sm mb-4">Sign in to see your insights.</p>
          <Link href="/signin?next=/insights" className="inline-flex items-center gap-2 px-5 py-2.5 bg-obsidian hover:bg-obsidian-50 text-cream text-xs font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream-base min-h-dvh md:min-h-[calc(100dvh-4rem)] pb-16 md:pb-0 md:-mt-16 md:pt-16 flex flex-col">
      <header className="shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-obsidian/10 bg-white/90">
        <TrendingUp size={16} className="text-gold-dark" />
        <span className="text-sm font-semibold text-obsidian tracking-tight">Insights</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-5 sm:px-8 py-6 space-y-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-light italic text-obsidian tracking-tight">Your last two weeks</h1>
            <p className="text-obsidian/45 text-sm mt-1 mb-5">Built from the mood you tap into your daily check-in on My 24.</p>
            <CheckInTrend />
          </div>

          <RecommendationsPanel />
        </div>
      </div>
    </section>
  );
}
