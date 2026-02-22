import { getAuth } from '@/lib/auth/server';
import { syncUser, isAdmin } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { data, error } = await getAuth().getSession();
  const session = data;
  const user = session?.user ?? (session as any)?.session?.user;
  if (!user) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // Sync user into app_users on every login
  try {
    await syncUser({
      id: user.id,
      email: user.email!,
      name: user.name,
      image: user.image,
    });
  } catch (err) {
    console.error('syncUser failed on auth callback:', err);
  }

  const url = new URL(request.url);
  if (isAdmin(user.email)) {
    return NextResponse.redirect(new URL('/admin', url.origin), 303);
  }
  return NextResponse.redirect(new URL('/dashboard', url.origin), 303);
}
