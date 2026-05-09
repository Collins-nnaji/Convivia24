'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const APP_HOST = 'app.convivia24.com';
const EXTERNAL_PROTOCOLS = new Set(['http:', 'https:']);

function routeFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'convivia24:') {
      const hostPath = parsed.hostname ? `/${parsed.hostname}` : '';
      return `${hostPath}${parsed.pathname || '/'}${parsed.search}${parsed.hash}`;
    }
    if (parsed.hostname === APP_HOST) {
      return `${parsed.pathname || '/'}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function NativeAppBridge() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    document.documentElement.classList.add('native-shell');

    const openListener = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      const route = routeFromUrl(url);
      if (route) router.push(route);
    });

    const backListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
        return;
      }
      CapacitorApp.minimizeApp();
    });

    return () => {
      document.documentElement.classList.remove('native-shell');
      openListener.then((listener) => listener.remove());
      backListener.then((listener) => listener.remove());
    };
  }, [router]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const onClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('/') || href.startsWith('#')) return;

      const url = new URL(anchor.href);
      if (url.hostname === APP_HOST || !EXTERNAL_PROTOCOLS.has(url.protocol)) return;

      event.preventDefault();
      await Browser.open({ url: anchor.href });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
