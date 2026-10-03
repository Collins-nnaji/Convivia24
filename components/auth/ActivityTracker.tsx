'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from './AuthProvider';

export default function ActivityTracker() {
  const path = usePathname();
  const { user } = useUser();
  const userId = user?.id;
  useEffect(() => {
    if (!userId || !path) return;
    function send(action: 'page.view' | 'heartbeat') {
      if (document.visibilityState !== 'visible') return;
      void fetch('/api/activity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path, action }) }).catch(() => {});
    }
    send('page.view');
    const timer = window.setInterval(() => send('heartbeat'), 60000);
    const visible = () => send('heartbeat');
    document.addEventListener('visibilitychange', visible);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', visible); };
  }, [userId, path]);
  return null;
}
