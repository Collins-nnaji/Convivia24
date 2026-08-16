import { redirect } from 'next/navigation';

export default function VenuesRedirect() {
  redirect('/events?tab=venues');
}
