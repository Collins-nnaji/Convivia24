import type { Metadata } from 'next';
import EventsPage, { type PublicEvent } from '@/components/discover/EventsPage';
import { listUpcomingEvents } from '@/lib/events/store';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: "What's on — events",
  description: 'Upcoming nights and events, and the drinks to bring. Adults 18+.',
  alternates: { canonical: absoluteUrl('/discover/events') },
};

// Desk edits (Storefront & content › Events & venues) show within a minute.
export const revalidate = 60;

/**
 * Only events published from the admin desk are listed — never the built-in sample nights,
 * which exist for development and would read as real listings.
 */
export default async function Page() {
  let events: PublicEvent[] = [];
  let unavailable = false;
  try {
    events = (await listUpcomingEvents()).map((e) => ({
      id: e.id,
      title: e.title,
      tag: e.tag,
      blurb: e.blurb,
      expected: e.expected,
      coverNgn: e.coverNgn ?? null,
      startsAtIso: e.startsAtIso,
      endsAtIso: e.endsAtIso,
      venueName: e.venue?.name ?? null,
      venueArea: e.venue?.area ?? null,
      venueAddress: e.venue?.address ?? null,
      venuePhoto: e.venue?.photoUrl ?? null,
    }));
  } catch {
    unavailable = true;
  }
  return <EventsPage events={events} unavailable={unavailable} />;
}
