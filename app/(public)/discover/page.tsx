import { redirect } from 'next/navigation';

/** Discover opens on its first section — the rail is the landing. */
export default function DiscoverPage() {
  redirect('/discover/taste');
}
