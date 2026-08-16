import { Suspense } from 'react';
import EventsExplorer from '@/components/events/EventsExplorer';

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="px-5 py-20 text-sm text-obsidian/40">Loading nights…</div>}>
      <EventsExplorer />
    </Suspense>
  );
}
