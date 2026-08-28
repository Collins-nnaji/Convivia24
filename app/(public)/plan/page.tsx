import { redirect } from 'next/navigation';

/** Plan lives on the shop page now. */
export default function PlanPage() {
  redirect('/shop?section=plan');
}
