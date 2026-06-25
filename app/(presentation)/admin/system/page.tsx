'use client';

import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Database, RefreshCw, ServerCog } from 'lucide-react';

interface Check {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
  optional?: boolean;
}

interface StatusPayload {
  ok: boolean;
  checks: Check[];
  counts: Record<string, number>;
  missing: { tables: string[]; event_columns: string[] };
}

export default function SystemStatusPage() {
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    fetch('/api/system/status')
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (!r.ok) throw new Error(data?.error || 'Could not load status.');
        return data;
      })
      .then(setStatus)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load status.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-copper-deep mb-2 flex items-center gap-2">
            <ServerCog size={14} /> Production readiness
          </p>
          <h1 className="font-display text-3xl italic text-ink mb-2">System status</h1>
          <p className="text-sm text-ink-muted max-w-2xl leading-relaxed">
            Live checks for database schema, storage, auth, AI, rate limiting, and error tracking.
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="btn-secondary text-xs">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="glass-card p-5 mb-6 border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="grid sm:grid-cols-2 gap-4">
          {(status?.checks ?? Array.from({ length: 8 })).map((check, i) => (
            <div key={check?.id ?? i} className="glass-card p-5">
              {check ? (
                <>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${check.ok ? 'bg-emerald-500/10 text-emerald-600' : check.optional ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'}`}>
                      {check.ok ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
                    </div>
                    {check.optional && <span className="rounded-full bg-ink/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Optional</span>}
                  </div>
                  <h2 className="font-semibold text-ink">{check.label}</h2>
                  <p className="text-sm text-ink-muted mt-1 leading-relaxed">{check.detail}</p>
                </>
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="h-11 w-11 rounded-2xl bg-ink/10" />
                  <div className="h-4 w-1/2 rounded bg-ink/10" />
                  <div className="h-3 w-3/4 rounded bg-ink/10" />
                </div>
              )}
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="glass-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-4 flex items-center gap-2">
              <Database size={14} /> Data counts
            </p>
            {status ? (
              <div className="space-y-3">
                {Object.entries(status.counts).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between border-b border-ink/8 pb-2 last:border-b-0 last:pb-0">
                    <span className="text-sm capitalize text-ink-muted">{key.replace(/_/g, ' ')}</span>
                    <span className="font-semibold text-ink">{Number(value ?? 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Loading counts…</p>
            )}
          </div>

          {status && (status.missing.tables.length > 0 || status.missing.event_columns.length > 0) && (
            <div className="glass-card p-5 border-amber-200 bg-amber-50">
              <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Activity size={16} /> Migration needed
              </p>
              <p className="text-xs text-amber-800/80 leading-relaxed mb-3">
                Run <code className="font-mono">database/experiential-platform.sql</code> in Neon to add missing production schema pieces.
              </p>
              {status.missing.tables.length > 0 && <p className="text-xs text-amber-900">Tables: {status.missing.tables.join(', ')}</p>}
              {status.missing.event_columns.length > 0 && <p className="text-xs text-amber-900 mt-1">Event columns: {status.missing.event_columns.join(', ')}</p>}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
