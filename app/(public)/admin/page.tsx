import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { requireAdmin } from '@/lib/admin';
import AdminPage from '@/components/admin/AdminPage';

export const metadata = { title: 'Staff desk | Convivia24', robots: { index: false, follow: false } };

export default async function StaffAdminPage() {
  if (!(await getCurrentUser())) redirect('/signin?next=/admin');
  const gate = await requireAdmin('read');
  if (!gate.ok) notFound();
  return <AdminPage />;
}
