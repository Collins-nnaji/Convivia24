'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const KEY = 'c24-admin-order-alerts';
const POLL_MS = 30_000;

/** Two short rising tones — audible over a busy room, not alarming. */
function chime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
    setTimeout(() => void ctx.close(), 600);
  } catch {
    /* audio blocked until the page has been interacted with */
  }
}

/**
 * Keeps the desk's counts fresh while it is open and announces new work: when the number of
 * orders to fulfil goes up, it chimes, shows a browser notification (if allowed) and calls
 * `onNewOrders` so the Fulfil queue reloads.
 */
export function useOrderAlerts({
  active,
  toFulfil,
  refresh,
  onNewOrders,
  notify,
}: {
  active: boolean;
  toFulfil: number;
  refresh: () => Promise<unknown>;
  onNewOrders: (added: number) => void;
  notify: (message: string) => void;
}) {
  const [enabled, setEnabled] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const last = useRef<number | null>(null);

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem(KEY) !== 'off');
    } catch {
      /* private mode: keep the default */
    }
    setPermission(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((on) => {
      try {
        localStorage.setItem(KEY, on ? 'off' : 'on');
      } catch {
        /* ignore */
      }
      return !on;
    });
  }, []);

  const askPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    setPermission(await Notification.requestPermission());
  }, []);

  // Poll only while the desk is open and visible.
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && void refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [active, refresh]);

  // Announce increases; the first reading only sets the baseline.
  useEffect(() => {
    if (!active) return;
    const prev = last.current;
    last.current = toFulfil;
    if (prev === null || toFulfil <= prev) return;
    const added = toFulfil - prev;
    onNewOrders(added);
    if (!enabled) return;
    const message = `${added} new order${added === 1 ? '' : 's'} to fulfil`;
    chime();
    notify(message);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
      try {
        new Notification('Convivia24 desk', { body: message, tag: 'c24-new-order' });
      } catch {
        /* some browsers only allow notifications from a service worker */
      }
    }
  }, [active, toFulfil, enabled, onNewOrders, notify]);

  return { enabled, toggle, permission, askPermission };
}
