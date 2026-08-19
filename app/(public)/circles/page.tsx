import { redirect } from 'next/navigation';

export default function CirclesRedirect() {
  redirect('/events?tab=circles');
}
