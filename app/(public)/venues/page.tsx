import { redirect } from 'next/navigation';
import { eventsEnabled } from '@/lib/features';

export default function VenuesRedirect() {
  redirect(eventsEnabled ? '/events?tab=venues' : '/shop?section=plan');
}
