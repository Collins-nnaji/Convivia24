'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useUser } from '@/components/auth/AuthProvider';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import type { ProfileData } from '@/lib/profile/questions';

/**
 * Watches the signed-in user's profile and, the first time they arrive without
 * having been onboarded, presents the get-to-know-you flow. Also listens for a
 * `convivia:edit-profile` window event so the flow can be re-opened later.
 */
export default function OnboardingGate() {
  const { user, loading } = useUser();
  const [show, setShow] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading || !user || checked) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && !data.onboarded) setShow(true);
      } catch { /* offline — skip */ }
      finally { if (!cancelled) setChecked(true); }
    })();
    return () => { cancelled = true; };
  }, [user, loading, checked]);

  useEffect(() => {
    const open = () => setShow(true);
    window.addEventListener('convivia:edit-profile', open);
    return () => window.removeEventListener('convivia:edit-profile', open);
  }, []);

  const complete = useCallback(async (answers: ProfileData) => {
    // Never let a save hiccup bubble up as a client-side exception — always
    // close the flow gracefully.
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
    } catch {
      /* offline / transient — the answers can be re-entered later */
    } finally {
      setShow(false);
    }
  }, []);

  if (!user) return null;

  return (
    <AnimatePresence>
      {show && (
        <OnboardingFlow
          userName={user.name}
          onComplete={complete}
          onSkip={() => setShow(false)}
        />
      )}
    </AnimatePresence>
  );
}
