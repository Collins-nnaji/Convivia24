import Link from 'next/link';
import { redirect } from 'next/navigation';
import { neonAuth } from '@/lib/auth/server';
import { isConviviaAdminAsync } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await neonAuth();

  if (!user?.email) {
    redirect('/auth/sign-in');
  }

  const allowed = await isConviviaAdminAsync(user.email);
  if (!allowed) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2] text-neutral-900">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-700">Convivia24 Admin</p>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
          <nav className="flex flex-wrap items-center justify-end gap-3 text-[10px] font-black uppercase tracking-widest">
            <Link href="/admin" className="text-neutral-700 hover:text-red-700">
              Console
            </Link>
            <Link href="/admin/outlets" className="text-neutral-700 hover:text-red-700">
              Outlets
            </Link>
            <Link href="/" className="text-red-700 hover:underline">
              App
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
