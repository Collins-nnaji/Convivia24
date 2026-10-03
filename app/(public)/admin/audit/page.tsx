import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { requireAdmin } from '@/lib/admin';
import AdminPage from '@/components/admin/AdminPage';

export const metadata = { title: 'Platform audit | Convivia24', robots: { index: false, follow: false } };

export default async function AuditPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/signin?next=/admin/audit');
  const gate = await requireAdmin('owner');
  if (!gate.ok) return <section className="min-h-[70vh] bg-paper px-5 py-16"><h1 className="text-2xl font-bold">Owner access required</h1><p className="mt-4">Platform audit records are available to owners.</p></section>;
  return <AdminPage initialTab="audit" />;
}
