'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Ticket, CheckCircle2, Receipt, ArrowRight, Plus, ScanLine, Database, Sparkles, RefreshCw } from 'lucide-react';
import { useAdmin } from './layout';
import { formatMoney } from '@/lib/money';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

interface Stats {
  events: { total: number; published: number };
  tickets: { total: number; checked_in: number };
  orders: { total: number; revenue: number };
  byEvent: { title: string; slug: string; starts_at: string; sold: number; checked_in: number }[];
}

export default function AdminDashboard() {
  const { secret } = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [insights, setInsights] = useState<string[] | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  function loadStats() {
    fetch('/api/stats', { headers: { 'x-admin-secret': secret } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }
  function loadInsights() {
    setInsightsLoading(true);
    fetch('/api/ai/insights', { headers: { 'x-admin-secret': secret } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setInsights(d?.insights ?? []))
      .finally(() => setInsightsLoading(false));
  }
  useEffect(() => { loadStats(); loadInsights(); }, [secret]); // eslint-disable-line react-hooks/exhaustive-deps

  async function seed() {
    setSeeding(true);
    setSeedMsg('');
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST', headers: { 'x-admin-secret': secret } });
      const d = await res.json();
      setSeedMsg(res.ok ? `Seeded ${d.created} new events (${d.skipped} already present).` : (d.error || 'Seeding failed.'));
      if (res.ok) loadStats();
    } catch {
      setSeedMsg('Seeding failed — check the connection.');
    } finally {
      setSeeding(false);
    }
  }

  const num = (v: number | undefined) => (loading ? '—' : (v ?? 0).toLocaleString());

  const cards = [
    { icon: Calendar, label: 'Live events', value: num(stats?.events.published), sub: `${stats?.events.total ?? 0} total` },
    { icon: Ticket, label: 'Tickets sold', value: num(stats?.tickets.total), sub: `${stats?.tickets.checked_in ?? 0} checked in` },
    { icon: Receipt, label: 'Orders', value: num(stats?.orders.total), sub: 'paid' },
    { icon: CheckCircle2, label: 'Revenue', value: loading ? '—' : formatMoney(stats?.orders.revenue ?? 0, 'NGN'), sub: 'gross' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-3xl italic text-ink">Good to see you.</h2>
          <p className="text-ink-muted text-sm mt-1">Events, revenue, and check-ins at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/create" size="sm"><Plus size={16} /> New event</Button>
          <Button href="/admin/scan" variant="secondary" size="sm"><ScanLine size={16} /> Scan</Button>
          <button type="button" onClick={seed} disabled={seeding} className="btn-secondary text-xs">
            <Database size={14} /> {seeding ? 'Seeding…' : 'Seed samples'}
          </button>
        </div>
      </div>
      {seedMsg && <p className="mb-6 text-copper-deep text-sm font-medium">{seedMsg}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        {cards.map((c, i) => (
          <StatCard key={c.label} {...c} index={i} />
        ))}
      </div>

      <div className="glass-card p-5 sm:p-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-ink-muted flex items-center gap-2">
            <Sparkles size={16} className="text-copper" /> AI insights
          </h3>
          <button type="button" onClick={loadInsights} disabled={insightsLoading} className="btn-ghost !p-2" title="Refresh">
            <RefreshCw size={16} className={insightsLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        {insightsLoading && !insights ? (
          <p className="text-ink-muted text-sm">Analysing your sales patterns…</p>
        ) : insights && insights.length ? (
          <ul className="space-y-3">
            {insights.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink/80 leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-copper shrink-0" /> {t}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-muted text-sm">Insights appear once events start selling.</p>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-ink-muted">Selling now</h3>
        <Link href="/admin/events" className="inline-flex items-center gap-1 text-xs font-bold text-copper hover:text-copper-bright transition-colors">
          All events <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="glass-card p-8 text-center text-ink-muted text-sm">Loading events…</div>
      ) : !stats?.byEvent?.length ? (
        <EmptyState
          icon={Calendar}
          title="No live events yet"
          description="Create your first gathering or seed sample events to explore the console."
          actionLabel="Create event"
          actionHref="/create"
        />
      ) : (
        <div className="glass-card divide-y divide-ink/8 overflow-hidden">
          {stats.byEvent.map((e) => (
            <div key={e.slug} className="flex items-center justify-between gap-4 p-4 sm:p-5 hover:bg-surface/80 transition-colors">
              <div className="min-w-0">
                <Link href={`/admin/events/${e.slug}`} className="font-display text-lg italic text-ink hover:text-copper-deep transition-colors truncate block">
                  {e.title}
                </Link>
                <p className="text-ink-muted text-xs mt-0.5">
                  {new Date(e.starts_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
              </div>
              <div className="flex items-center gap-6 shrink-0 text-right">
                <div>
                  <p className="text-lg font-semibold text-ink">{e.sold}</p>
                  <p className="text-[10px] uppercase tracking-wider text-ink-muted">sold</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-copper">{e.checked_in}</p>
                  <p className="text-[10px] uppercase tracking-wider text-ink-muted">in</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
