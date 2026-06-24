'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import PeoplePanel from '@/components/calendar/PeoplePanel';
import { useUser } from '@/components/auth/AuthProvider';
import SubpageHeader from '@/components/calendar/SubpageHeader';

export default function PeoplePage() {
  const { user, loading: authLoading } = useUser();

  if (!authLoading && !user) {
    return (
      <section className="min-h-dvh md:min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 text-center bg-cream-base">
        <div>
          <p className="text-obsidian/70 text-sm mb-4">Sign in to see your people.</p>
          <Link href="/signin?next=/my24/people" className="inline-flex items-center gap-2 px-5 py-2.5 bg-obsidian hover:bg-obsidian-50 text-cream text-xs font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream-base min-h-dvh md:min-h-[calc(100dvh-4rem)] pb-16 md:pb-0 md:-mt-16 md:pt-16 flex flex-col">
      <SubpageHeader title="People" icon={<Users size={16} className="text-gold-dark" />} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-5 sm:px-8 py-6">
          <PeoplePanel />
        </div>
      </div>
    </section>
  );
}
