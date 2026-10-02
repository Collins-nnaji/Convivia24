'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

const listFields: Record<string, string[]> = {
  '/api/admin/delivery': ['zones', 'providers'], '/api/admin/support': ['tickets', 'deletions'],
  '/api/admin/staff': ['staff', 'audit'], '/api/admin/refunds': ['refunds', 'jobs', 'exceptions', 'overdue'],
  '/api/admin/operations': ['outlets', 'wholesale', 'rewards'], '/api/admin/readiness': ['checks'],
  '/api/admin/analytics': ['commerce.byStatus', 'commerce.trend', 'commerce.topSkus', 'api.routes', 'api.days'],
};
async function request<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, body === undefined ? { cache: 'no-store' } : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status}). Please retry.`);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('The server returned an invalid response. Please retry.');
  if (body === undefined) {
    if (url.startsWith('/api/admin/analytics?')) {
      for (const key of ['range', 'commerce', 'engagement', 'loyalty', 'inventory', 'api', 'systems']) {
        if (!data[key] || typeof data[key] !== 'object' || Array.isArray(data[key])) throw new Error('The server returned an incomplete analytics report. Please refresh or check server logs.');
      }
    }
    for (const key of listFields[url.split('?')[0]] || []) {
      const rows = key.split('.').reduce((value, part) => value?.[part], data);
      if (!Array.isArray(rows) || rows.some((row: unknown) => !row || typeof row !== 'object')) throw new Error('The server returned incomplete records. Please refresh or check server logs.');
    }
  }
  return data;
}
export function useDesk<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const generation = useRef(0); const saving = useRef(false);
  const reload = useCallback(async () => {
    const version = ++generation.current;
    setLoading(true); setError(''); setMessage('');
    try { const next = await request<T>(url); if (version !== generation.current) return false; setData(next); return true; }
    catch (err) { if (version === generation.current) { setData(null); setError(err instanceof Error ? err.message : 'Could not load this section.'); } return false; }
    finally { if (version === generation.current) setLoading(false); }
  }, [url]);
  const invalidate = useCallback(() => { generation.current++; }, []);
  useEffect(() => { void reload(); return invalidate; }, [reload, invalidate]);
  async function save(body: unknown, success = 'Changes saved.') {
    if (saving.current) return false;
    saving.current = true; setBusy(true); setError(''); setMessage('');
    try {
      await request(url, body);
      if (await reload()) setMessage(success);
      else setMessage('Changes saved, but the list could not refresh. Refresh to see the latest records.');
      return true;
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save.'); return false; }
    finally { saving.current = false; setBusy(false); }
  }
  return { data, loading, busy, error, message, reload, save };
}
