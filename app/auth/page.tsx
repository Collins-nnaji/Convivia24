import { redirect } from 'next/navigation';

/**
 * /auth -> redirect to sign-in (Neon quickstart-style single auth entry).
 */
export default function AuthIndexPage() {
  redirect('/auth/sign-in');
}
