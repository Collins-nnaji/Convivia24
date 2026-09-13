import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { findSupplierForEmail } from '@/lib/suppliers/repo';

export const metadata = { title: 'Supplier portal | Convivia24', robots: { index: false, follow: false } };

/**
 * /supplier with no slug: a signed-in account on a supplier's list goes straight to that portal.
 * Everyone else is told how to get in.
 */
export default async function SupplierIndexPage() {
  const user = await getCurrentUser().catch(() => null);
  if (user?.email) {
    const supplier = await findSupplierForEmail(user.email).catch(() => null);
    if (supplier) redirect(`/supplier/${supplier.slug}`);
  }

  return (
    <section className="min-h-[70vh] bg-paper px-5 py-16">
      <div className="mx-auto max-w-md bg-white p-8 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-ember">Convivia24 · Supplier</p>
        <h1 className="mb-3 text-2xl font-bold">Supplier portal</h1>
        {user ? (
          <p className="text-sm text-obsidian/60">
            <strong>{user.email}</strong> is not on any supplier&apos;s sign-in list yet. Ask the Convivia24 desk to add it, or open
            the portal link they sent you and use your access key.
          </p>
        ) : (
          <>
            <p className="text-sm text-obsidian/60">
              Sign in with the Convivia24 account the desk added for you, or open the portal link they sent you and use your access key.
            </p>
            <Link href="/signin?next=%2Fsupplier" className="btn-brand mt-5 block w-full rounded-xl py-3 text-center text-[11px] font-black uppercase tracking-[0.14em]">
              Sign in
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
