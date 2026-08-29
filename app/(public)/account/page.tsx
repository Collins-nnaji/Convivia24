import type { Metadata } from 'next';
import { Suspense } from 'react';
import AccountShell from '@/components/account/AccountShell';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'My account',
  description: 'Your Convivia24 account — points, taste profile, saved bottles and orders. Adults 18+.',
  alternates: { canonical: absoluteUrl('/account') },
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="bg-paper min-h-[60vh]" />}>
      <AccountShell />
    </Suspense>
  );
}
