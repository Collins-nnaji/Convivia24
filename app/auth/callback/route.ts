import { getAuth } from '@/lib/auth/server';
import { syncUser, isAdmin } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

/** Brief wait then retry once so the session cookie from sign-in has time to be visible */
async function getSessionWithRetry() {
  const { data } = await getAuth().getSession();
  const session = data;
  let user = session?.user ?? (session as any)?.session?.user;
  if (!user) {
    await new Promise((r) => setTimeout(r, 150));
    const retry = await getAuth().getSession();
    const retrySession = retry.data;
    user = retrySession?.user ?? (retrySession as any)?.session?.user;
  }
  return user;
}

export async function GET(request: Request) {
  const user = await getSessionWithRetry();
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
