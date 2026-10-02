'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/components/auth/AuthProvider';
import { authClient } from '@/lib/auth/client';
import { safeReturnPath } from '@/lib/auth/redirect';

function Verification() {
  const params = useSearchParams();
  const next = safeReturnPath(params.get('next'), '/admin');
  const { user, loading, signOut } = useUser();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function send() {
    if (!user) return;
    setBusy(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: user.email,
        callbackURL: new URL(next, window.location.origin).toString(),
      });
      setMessage(error ? error.message || 'Could not send verification email.' : 'Check your inbox for the verification link, then open the staff desk.');
    } catch { setMessage('Could not send verification email. Please retry.'); }
    finally { setBusy(false); }
  }

  return <section className="min-h-[70vh] bg-paper px-5 py-16"><div className="mx-auto max-w-md space-y-5 rounded-xl bg-white p-8">
    <h1 className="text-2xl font-bold">Verify your staff email</h1>
    <p>Staff access requires a verified email. {user && <>You are signed in as {user.email}.</>}</p>
    {loading ? <p>Checking your account…</p> : user ? <>
      <button className="btn-brand px-4 py-2" disabled={busy} onClick={() => void send()}>{busy ? 'Sending…' : 'Send verification email'}</button>
      <button className="block text-ember" disabled={busy} onClick={async () => {
        setBusy(true);
        try {
          const { data, error } = await authClient.getSession({ query: { disableCookieCache: true } });
          if (error) throw new Error(error.message || 'Could not check verification.');
          if (data?.user.emailVerified) window.location.href = next;
          else setMessage('Your email is still unverified. Open the link in your verification email first.');
        } catch { setMessage('Could not check verification. Please retry.'); }
        finally { setBusy(false); }
      }}>I have verified — open desk</button>
      <button className="text-sm underline" onClick={async () => { await signOut(); window.location.href = `/signin?next=${encodeURIComponent(next)}`; }}>Sign in with another account</button>
    </> : <Link href={`/signin?next=${encodeURIComponent(next)}`} className="text-ember">Sign in to continue</Link>}
    {message && <p role="status" className="text-sm">{message}</p>}
  </div></section>;
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<p>Checking your account…</p>}><Verification /></Suspense>;
}
