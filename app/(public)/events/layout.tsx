import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { eventsEnabled } from '@/lib/features';

export default function EventsLayout({ children }: { children: ReactNode }) {
  if (!eventsEnabled) redirect('/shop?section=plan');
  return children;
}
