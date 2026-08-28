import { redirect } from 'next/navigation';
import { eventsEnabled } from '@/lib/features';

export default function CirclesRedirect() {
  redirect(eventsEnabled ? '/events?tab=circles' : '/shop?section=plan');
}
