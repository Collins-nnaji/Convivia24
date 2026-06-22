'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import DayPlanner from '@/components/calendar/DayPlanner';
import SubpageHeader from '@/components/calendar/SubpageHeader';
import { useUser } from '@/components/auth/AuthProvider';
import { dateKey } from '@/lib/calendar/dates';

export default function PlanPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();

  async function acceptDayPlan(blocks: { title: string; starts_at: string; ends_at: string; priority: 'low' | 'normal' | 'high'; notes?: string }[]) {
    await Promise.all(blocks.map((b) => fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: b.title, starts_at: b.starts_at, ends_at: b.ends_at, priority: b.priority, notes: b.notes }),
    })));
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    router.push(`/my24/calendar?date=${dateKey(tomorrow)}`);
  }

  if (!authLoading && !user) {
    return (
      <section className="min-h-dvh md:min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 text-center bg-cream-base">
        <div>
          <p className="text-obsidian/70 text-sm mb-4">Sign in to plan tomorrow.</p>
          <Link href="/signin?next=/my24/plan" className="inline-flex items-center gap-2 px-5 py-2.5 bg-obsidian hover:bg-obsidian-50 text-cream text-xs font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream-base min-h-dvh md:min-h-[calc(100dvh-4rem)] pb-16 md:pb-0 md:-mt-16 md:pt-16 flex flex-col">
      <SubpageHeader title="Plan tomorrow" icon={<Sparkles size={16} className="text-gold-dark" />} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-5 sm:px-8 py-6">
          <p className="text-obsidian/55 text-sm mb-5">Tell the Companion how you want tomorrow to feel — it&apos;ll sketch a calm timeline around what&apos;s already fixed.</p>
          <div className="rounded-2xl border border-obsidian/10 overflow-hidden bg-white">
            <DayPlanner onAccept={acceptDayPlan} />
          </div>
        </div>
      </div>
    </section>
  );
}
