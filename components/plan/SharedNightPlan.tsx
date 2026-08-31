'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Check, Clock3, MapPin, PartyPopper, Users, WalletCards } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import type { SavedParty, PartyRsvp } from '@/lib/party/plans';

export default function SharedNightPlan({ token }: { token: string }) {
  const [party, setParty] = useState<SavedParty | null>(null);
  const [rsvps, setRsvps] = useState<PartyRsvp[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/night-plans/${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Plan not found.');
        setParty(data.party);
        setRsvps(data.rsvps || []);
      })
      .catch((reason) => setError(reason.message || 'Could not load this plan.'))
      .finally(() => setLoading(false));
  }, [token]);

  async function respond(status: PartyRsvp['status']) {
    if (!name.trim()) { setError('Add your name before responding.'); return; }
    setBusy(true); setError('');
    const response = await fetch(`/api/night-plans/${encodeURIComponent(token)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, status }) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setRsvps(data.rsvps || []); else setError(data.error || 'Could not save your RSVP.');
    setBusy(false);
  }

  if (loading) return <div className="flex min-h-[70vh] items-center justify-center bg-paper text-sm text-obsidian/40">Loading your invitation…</div>;
  if (!party || error && !party) return <div className="flex min-h-[70vh] flex-col items-center justify-center bg-paper px-5 text-center"><PartyPopper className="text-ember" size={32} /><h1 className="mt-4 font-wordmark text-3xl">This plan is not available.</h1><p className="mt-2 text-sm text-obsidian/45">{error}</p><Link href="/party-planner" className="mt-6 rounded-full bg-obsidian px-6 py-3 text-sm font-bold text-white">Plan your own night</Link></div>;

  const night = party.plan?.night;
  const attending = rsvps.filter((item) => item.status === 'attending');
  return <main className="min-h-[75vh] bg-paper px-5 py-10 sm:px-8 sm:py-16"><div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-obsidian/10 bg-white shadow-[0_24px_80px_rgba(15,15,15,.1)]"><div className="brand-gradient p-7 text-white sm:p-10"><p className="text-[10px] font-black uppercase tracking-[.22em] text-white/60">You&apos;re invited</p><h1 className="mt-3 font-wordmark text-4xl sm:text-5xl">{party.name}</h1><p className="mt-3 text-sm text-white/65">A private Convivia24 night plan</p></div><div className="p-6 sm:p-10"><div className="grid gap-3 sm:grid-cols-2"><Info icon={<MapPin size={17} />} label="Venue" value={night?.suggestedVenueName || party.venue || 'To be decided'} /><Info icon={<CalendarDays size={17} />} label="Date" value={party.eventDate ? new Date(`${party.eventDate}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : 'To be decided'} /><Info icon={<Clock3 size={17} />} label="Meet" value={night?.meetingTime || 'Time to be decided'} /><Info icon={<WalletCards size={17} />} label="Budget" value={night?.budgetPerPersonNgn ? `${formatNgn(night.budgetPerPersonNgn)} per person` : 'Confirm with the host'} /></div><section className="mt-7 rounded-2xl border border-ember/15 bg-ember/[.04] p-5"><p className="text-[10px] font-black uppercase tracking-[.18em] text-ember">RSVP</p><h2 className="mt-2 text-xl font-semibold">Are you in?</h2><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="mt-4 w-full rounded-xl border-obsidian/10 bg-white px-4 py-3 focus:border-ember focus:ring-0" /><div className="mt-3 grid grid-cols-3 gap-2"><button disabled={busy} onClick={() => respond('attending')} className="rounded-xl bg-obsidian px-2 py-3 text-xs font-bold text-white disabled:opacity-50">I&apos;m in</button><button disabled={busy} onClick={() => respond('maybe')} className="rounded-xl border border-obsidian/10 bg-white px-2 py-3 text-xs font-bold text-obsidian/60 disabled:opacity-50">Maybe</button><button disabled={busy} onClick={() => respond('declined')} className="rounded-xl border border-obsidian/10 bg-white px-2 py-3 text-xs font-bold text-obsidian/60 disabled:opacity-50">Can&apos;t make it</button></div>{error && <p className="mt-3 text-sm text-ember">{error}</p>}</section><section className="mt-7"><div className="flex items-center justify-between"><p className="flex items-center gap-2 text-sm font-bold"><Users size={16} className="text-ember" /> Who&apos;s coming</p><span className="text-xs text-obsidian/40">{attending.length + 1} attending</span></div><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-obsidian px-3 py-1.5 text-xs font-semibold text-white">Host</span>{attending.map((item) => <span key={item.id} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><Check size={12} /> {item.name}</span>)}</div></section><Link href="/party-planner" className="mt-8 flex items-center justify-center rounded-2xl border border-obsidian/10 px-5 py-3.5 text-sm font-bold text-obsidian/60 hover:border-ember/30 hover:text-ember">Create your own night plan</Link></div></div></main>;
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-obsidian/8 p-4"><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-ember">{icon}{label}</p><p className="mt-2 text-sm font-semibold text-obsidian">{value}</p></div>; }
