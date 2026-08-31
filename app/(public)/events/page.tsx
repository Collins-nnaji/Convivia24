import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Events & venues',
  description:
    'Discover Lagos nightlife — clubs, lounges, rooftops, and live rooms. Follow venues, read reviews, RSVP to nights, and plan with circles. Adults 18+.',
  alternates: { canonical: absoluteUrl('/events') },
  openGraph: {
    title: 'Events & venues | Convivia24',
    description:
      'What’s on in Lagos tonight: events, venue profiles, circles, and Guest Card nights.',
    url: absoluteUrl('/events'),
  },
};

export default function EventsPage() {
  redirect('/plan');
}
