'use client';

import { AuthCallback } from '@neondatabase/auth/react/ui';
import { NeonAuthProvider } from '@/components/auth/NeonAuthProvider';

export default function CallbackPage() {
  return (
    <main className="mobile-scroll-screen mobile-safe-screen bg-[#faf6ee] text-neutral-900 flex items-center justify-center">
      <NeonAuthProvider>
        <AuthCallback redirectTo="/" />
      </NeonAuthProvider>
    </main>
  );
}
