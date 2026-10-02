'use client';
import { useCallback, useEffect, useState } from 'react';

async function request<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, body === undefined ? { cache: 'no-store' } : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status}). Please retry.`);
  if (!data) throw new Error('The server returned an empty response. Please retry.');
  return data;
}

export function useDesk<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await request<T>(url)); return true; }
    catch (err) { setData(null); setError(err instanceof Error ? err.message : 'Could not load this section.'); return false; }
    finally { setLoading(false); }
  }, [url]);
  useEffect(() => { void reload(); }, [reload]);
  async function save(body: unknown, success = 'Changes saved.') {
    setBusy(true); setError(''); setMessage('');
    try {
      await request(url, body);
      if (await reload()) setMessage(success);
      else setMessage('Changes saved, but the list could not refresh. Refresh to see the latest records.');
      return true;
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save.'); return false; }
    finally { setBusy(false); }
  }
  return { data, loading, busy, error, message, reload, save };
}
