'use client';

import { useCallback, useEffect, useState } from 'react';

export type StaffPersona = 'outlet' | 'worker';

const STORAGE_KEY = 'convivia24:persona_v1';

export function useStaffPersona() {
  const [persona, setPersonaState] = useState<StaffPersona>('worker');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === 'outlet' || raw === 'worker') setPersonaState(raw);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setPersona = useCallback((next: StaffPersona) => {
    setPersonaState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return { persona, setPersona, ready };
}
