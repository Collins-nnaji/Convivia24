import { redirect } from 'next/navigation';

/** Packages live on the shop and plan pages — keep old URLs working. */
export default function PackagesPage() {
  redirect('/shop?section=packages');
}
