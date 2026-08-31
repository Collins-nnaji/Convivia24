import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

export default function EventsLayout({ children: _children }: { children: ReactNode }) {
  redirect('/plan');
}
