'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Ticket, CheckCircle2, Receipt, ArrowRight, Plus, ScanLine, Database } from 'lucide-react';
import { useAdmin } from './layout';
import { formatMoney } from '@/lib/money';

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

  function loadStats() {
    fetch('/api/stats', { headers: { 'x-admin-secret': secret } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }
  useEffect(loadStats, [secret]); // eslint-disable-line react-hooks/exhaustive-deps

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
    { icon: CheckCircle2, label: 'Revenue', value: loading ? '—' : formatMoney(stats?.orders.revenue ?? 0, 'NGN'), sub: 'gross (mixed ccy)' },
  ];

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-light italic text-obsidian">Dashboard</h1>
          <p className="text-obsidian/40 text-sm mt-1">Your events, tickets and check-ins at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/create" className="inline-flex items-center gap-1.5 bg-[#c9a84c] text-[#0a0a0a] text-[11px] font-black uppercase tracking-[0.15em] px-4 py-2.5 hover:bg-[#d4b464] transition-colors"><Plus size={14} /> New event</Link>
          <Link href="/admin/scan" className="inline-flex items-center gap-1.5 border border-[#c9a84c]/30 text-[#a07c28] text-[11px] font-black uppercase tracking-[0.15em] px-4 py-2.5 hover:bg-[#c9a84c]/10 transition-colors"><ScanLine size={14} /> Scan</Link>
          <button onClick={seed} disabled={seeding} className="inline-flex items-center gap-1.5 border border-[#c9a84c]/30 text-[#a07c28] text-[11px] font-black uppercase tracking-[0.15em] px-4 py-2.5 hover:bg-[#c9a84c]/10 transition-colors disabled:opacity-60">
            <Database size={14} /> {seeding ? 'Seeding…' : 'Seed sample events'}
          </button>
        </div>
      </div>
      {seedMsg && <p className="mb-6 text-[#a07c28] text-sm">{seedMsg}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="border border-[#c9a84c]/15 p-5">
            <c.icon size={18} className="text-[#a07c28]/70 mb-3" />
            <p className="text-3xl font-light text-obsidian">{c.value}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mt-1">{c.label}</p>
            <p className="text-obsidian/30 text-xs mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-obsidian/60">Selling now</h2>
        <Link href="/admin/events" className="inline-flex items-center gap-1 text-[#a07c28]/70 hover:text-[#a07c28] text-[10px] font-black uppercase tracking-[0.2em]">All events <ArrowRight size={12} /></Link>
      </div>

      <div className="border border-[#c9a84c]/15 divide-y divide-[#c9a84c]/10">
        {loading ? (
          <p className="p-5 text-obsidian/30 text-sm">Loading…</p>
        ) : !stats?.byEvent?.length ? (
          <p className="p-5 text-obsidian/30 text-sm">No published events yet. <Link href="/create" className="text-[#a07c28]">Create one →</Link></p>
        ) : (
          stats.byEvent.map((e) => (
            <div key={e.slug} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <Link href={`/events/${e.slug}`} className="font-display text-lg italic text-obsidian hover:text-[#a07c28] transition-colors truncate block">{e.title}</Link>
                <p className="text-obsidian/30 text-xs">{new Date(e.starts_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
              </div>
              <div className="flex items-center gap-6 shrink-0 text-right">
                <div><p className="text-obsidian text-lg">{e.sold}</p><p className="text-[9px] uppercase tracking-wider text-obsidian/30">sold</p></div>
                <div><p className="text-[#a07c28] text-lg">{e.checked_in}</p><p className="text-[9px] uppercase tracking-wider text-obsidian/30">in</p></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
