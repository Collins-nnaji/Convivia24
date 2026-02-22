import { getAuth } from '@/lib/auth/server';
import { syncUser, isAdmin } from '@/lib/auth/session';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

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

/** Mark an invite token as used (if it exists, is valid, and hasn't been used yet). */
async function consumeInvite(token: string, email: string) {
  try {
    await sql`
      UPDATE signup_invites
      SET used_at = NOW(), used_by = ${email.toLowerCase().trim()}
      WHERE token = ${token}
        AND used_at IS NULL
        AND expires_at > NOW()
    `;
  } catch (err) {
    console.error('consumeInvite failed:', err);
  }
}

export async function GET(request: Request) {
  const user = await getSessionWithRetry();
  if (!user) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  const url = new URL(request.url);

  // Admins are never affected by invite logic: always sync and send to admin.
  if (isAdmin(user.email)) {
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
    return NextResponse.redirect(new URL('/admin', url.origin), 303);
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

  // If an invite token was passed through (from sign-up), mark it used.
  const inviteToken = url.searchParams.get('invite');
  if (inviteToken) {
    await consumeInvite(inviteToken, user.email!);
  }

  return NextResponse.redirect(new URL('/dashboard', url.origin), 303);
}
