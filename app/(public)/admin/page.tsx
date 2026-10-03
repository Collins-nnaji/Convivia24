import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { requireAdmin } from '@/lib/admin';
import AdminPage from '@/components/admin/AdminPage';

export const metadata = { title: 'Staff desk | Convivia24', robots: { index: false, follow: false } };

export default async function StaffAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/signin?next=/admin');
  const gate = await requireAdmin('read');
  if (!gate.ok) return <section className="min-h-[70vh] bg-paper px-5 py-16"><h1 className="text-2xl font-bold">Staff access required</h1><p className="mt-4">Signed in as {user.email}. This email is not in the configured admin access list.</p></section>;
  return <AdminPage />;
}
