'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Mail, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { useUser } from '@/components/auth/AuthProvider';
import { recommendDrinks, VIBE_LABELS, type PartyVibe, type DrinkPlan } from '@/lib/party/drinks-plan';
import { formatNgn } from '@/lib/drinks/catalog';

type PartyEvent = {
  id: string;
  host_name: string;
  title: string;
  event_type: string;
  event_date: string | null;
  event_time: string | null;
  venue: string | null;
  city: string | null;
  capacity: number;
  invite_live: boolean;
  slug: string | null;
};

type Guest = {
  id: string;
  name: string;
  email: string | null;
  rsvp_state: string;
  party_size: number;
  pass_token: string;
  invite_sent_at: string | null;
};

export default function PlanPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { addProduct } = useCart();
  const [events, setEvents] = useState<PartyEvent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState({ in: 0, maybe: 0, out: 0, pending: 0, total: 0 });
  const [msg, setMsg] = useState('');
  const [creating, setCreating] = useState(false);

  const [guestCount, setGuestCount] = useState(40);
  const [hours, setHours] = useState(5);
  const [vibe, setVibe] = useState<PartyVibe>('balanced');
  const [budget, setBudget] = useState(250000);
  const [advice, setAdvice] = useState('');
  const [plan, setPlan] = useState<DrinkPlan | null>(null);

  const selected = useMemo(() => events.find((e) => e.id === selectedId) || null, [events, selectedId]);

  async function loadEvents() {
    const res = await fetch('/api/party/events');
    const data = await res.json();
    setEvents(data.events || []);
    if (!selectedId && data.events?.[0]) setSelectedId(data.events[0].id);
  }

  async function loadGuests(eventId: string) {
    const res = await fetch(`/api/party/guests?eventId=${eventId}`);
    if (!res.ok) return;
    const data = await res.json();
    setGuests(data.guests || []);
    setStats(data.stats || { in: 0, maybe: 0, out: 0, pending: 0, total: 0 });
  }

  useEffect(() => {
    loadEvents().catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedId) loadGuests(selectedId).catch(() => {});
  }, [selectedId]);

  useEffect(() => {
    setPlan(recommendDrinks({ guests: guestCount, hours, vibe, budgetNgn: budget }));
  }, [guestCount, hours, vibe, budget]);

  async function createParty(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setMsg('');
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/party/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host_name: fd.get('host_name'),
        title: fd.get('title') || fd.get('host_name'),
        event_type: fd.get('event_type') || 'party',
        event_date: fd.get('event_date') || null,
        event_time: fd.get('event_time') || null,
        venue: fd.get('venue') || null,
        city: 'Lagos',
        capacity: Number(fd.get('capacity') || guestCount),
        invite_live: true,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setCreating(false);
    if (!res.ok) {
      setMsg(data.error || 'Could not create party');
      return;
    }
    await loadEvents();
    setSelectedId(data.event.id);
    setMsg('Party created — invite is live.');
  }

  async function addGuest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedId) return;
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/party/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: selectedId,
        name: fd.get('name'),
        email: fd.get('email') || null,
        party_size: Number(fd.get('party_size') || 1),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error || 'Could not add guest');
      return;
    }
    e.currentTarget.reset();
    await loadGuests(selectedId);
  }

  function inviteLink(token: string) {
    if (typeof window === 'undefined') return `/rsvp/${token}`;
    return `${window.location.origin}/rsvp/${token}`;
  }

  async function copyLink(token: string, name: string) {
    await navigator.clipboard.writeText(inviteLink(token));
    setMsg(`Invite link copied for ${name}`);
    if (selectedId) {
      const guest = guests.find((g) => g.pass_token === token);
      if (guest) {
        await fetch(`/api/party/guests/${guest.id}`, { method: 'POST' });
        await loadGuests(selectedId);
      }
    }
  }

  function emailInvite(g: Guest) {
    if (!selected) return;
    const url = inviteLink(g.pass_token);
    const subject = encodeURIComponent(`You're invited — ${selected.host_name}`);
    const body = encodeURIComponent(
      `Hi ${g.name},\n\nYou're invited to ${selected.host_name}.${selected.event_date ? `\nWhen: ${selected.event_date}` : ''}${selected.venue ? `\nWhere: ${selected.venue}` : ''}\n\nRSVP: ${url}\n\nConvivia24`
    );
    window.location.href = `mailto:${g.email || ''}?subject=${subject}&body=${body}`;
  }

  async function removeGuest(id: string) {
    await fetch(`/api/party/guests/${id}`, { method: 'DELETE' });
    if (selectedId) await loadGuests(selectedId);
  }

  async function askAi() {
    const res = await fetch('/api/party/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guests: guestCount, hours, vibe, budgetNgn: budget }),
    });
    const data = await res.json();
    if (data.plan) setPlan(data.plan);
    setAdvice(data.advice || '');
  }

  function addPlanToCart() {
    if (!plan) return;
    for (const line of plan.lines) addProduct(line.slug, line.qty);
    setMsg('Drink plan added to cart');
    router.push('/cart');
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="relative overflow-hidden border-b border-obsidian/8">
        <div className="absolute inset-0 brand-gradient opacity-[0.07]" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-12 pb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-3">Party planning</p>
          <h1 className="font-logo font-black tracking-tight uppercase text-3xl sm:text-5xl text-obsidian leading-[0.95] mb-3">
            Plan the night. <span className="brand-text">Invite the room.</span>
          </h1>
          <p className="text-base text-obsidian/55 max-w-xl">
            Create a party, send personal RSVP links, and get a drink basket sized for your headcount.
          </p>
          {!authLoading && !user && (
            <p className="mt-4 text-sm text-obsidian/45">
              <Link href="/signin?next=/plan" className="text-ember font-semibold">
                Sign in
              </Link>{' '}
              to keep parties tied to your account (works anonymously too).
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14 space-y-14">
        {msg && <p className="text-sm text-ember">{msg}</p>}

        <div className="grid lg:grid-cols-12 gap-10">
          <form onSubmit={createParty} className="lg:col-span-5 bg-white p-6 space-y-4 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
            <h2 className="font-bold">Create a party</h2>
            <Field name="host_name" label="Host / party name" required placeholder="Ada's rooftop" />
            <Field name="title" label="Title (optional)" />
            <div className="grid grid-cols-2 gap-3">
              <Field name="event_date" label="Date" type="date" />
              <Field name="event_time" label="Time" placeholder="9pm" />
            </div>
            <Field name="venue" label="Venue" placeholder="Lumen / home address" />
            <div className="grid grid-cols-2 gap-3">
              <Field name="capacity" label="Expected guests" type="number" />
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">Type</label>
                <select name="event_type" className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2 bg-transparent">
                  <option value="party">Party</option>
                  <option value="birthday">Birthday</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={creating} className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
              {creating ? 'Creating…' : 'Create & go live'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="font-bold mb-3">Your parties</h2>
              {events.length === 0 ? (
                <p className="text-sm text-obsidian/45">No parties yet — create one to start inviting.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {events.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setSelectedId(ev.id)}
                      className={`px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${
                        selectedId === ev.id ? 'badge-brand' : 'bg-white border border-obsidian/10'
                      }`}
                    >
                      {ev.host_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selected && (
              <div className="bg-white p-6 shadow-sm space-y-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg">{selected.host_name}</h3>
                    <p className="text-sm text-obsidian/45">
                      {selected.venue || 'Venue TBD'} · {selected.capacity} capacity ·{' '}
                      {selected.invite_live ? 'Invite live' : 'Draft'}
                    </p>
                  </div>
                  <p className="text-xs text-obsidian/40">
                    In {stats.in} · Maybe {stats.maybe} · Pending {stats.pending} · Out {stats.out}
                  </p>
                </div>

                <form onSubmit={addGuest} className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
                    <Field name="name" label="Guest name" required />
                  </div>
                  <div className="flex-1 w-full">
                    <Field name="email" label="Email" type="email" />
                  </div>
                  <button type="submit" className="inline-flex items-center gap-1 px-4 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em]">
                    <Plus size={12} /> Add
                  </button>
                </form>

                <ul className="divide-y divide-obsidian/8">
                  {guests.map((g) => (
                    <li key={g.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{g.name}</p>
                        <p className="text-[11px] text-obsidian/40">
                          {g.rsvp_state} · party {g.party_size}
                          {g.invite_sent_at ? ' · invite sent' : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => copyLink(g.pass_token, g.name)} className="p-2 border border-obsidian/10" aria-label="Copy link">
                          <Copy size={14} />
                        </button>
                        <button type="button" onClick={() => emailInvite(g)} className="p-2 border border-obsidian/10" aria-label="Email invite">
                          <Mail size={14} />
                        </button>
                        <button type="button" onClick={() => removeGuest(g.id)} className="p-2 border border-obsidian/10 text-obsidian/40" aria-label="Remove">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Drink estimator */}
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 bg-white p-6 space-y-4 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-ember">Drink planner</p>
            <h2 className="font-logo font-extrabold uppercase tracking-tight text-2xl">Size the bar</h2>
            <label className="block text-sm">
              Guests
              <input type="number" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value || 0))} className="mt-1 w-full border-b border-obsidian/15 focus:border-ember focus:ring-0" />
            </label>
            <label className="block text-sm">
              Hours
              <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value || 0))} className="mt-1 w-full border-b border-obsidian/15 focus:border-ember focus:ring-0" />
            </label>
            <label className="block text-sm">
              Budget (NGN)
              <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value || 0))} className="mt-1 w-full border-b border-obsidian/15 focus:border-ember focus:ring-0" />
            </label>
            <label className="block text-sm">
              Vibe
              <select value={vibe} onChange={(e) => setVibe(e.target.value as PartyVibe)} className="mt-1 w-full border-b border-obsidian/15 focus:border-ember focus:ring-0 bg-transparent">
                {Object.entries(VIBE_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={askAi} className="inline-flex items-center gap-2 px-4 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em]">
              <Sparkles size={14} /> AI refine
            </button>
          </div>

          <div className="lg:col-span-8 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-obsidian/35">Recommended basket</p>
                <p className="text-3xl font-bold brand-text mt-1">{plan ? formatNgn(plan.totalNgn) : '—'}</p>
                <p className="text-sm text-obsidian/45 mt-1">
                  ~{plan?.drinksPerGuest ?? '—'} pours / guest · {plan?.servingsEstimate ?? '—'} total servings
                </p>
              </div>
              <button type="button" onClick={addPlanToCart} disabled={!plan?.lines.length} className="px-5 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-40">
                Add plan to cart
              </button>
            </div>
            {advice && <p className="text-sm text-obsidian/60 leading-relaxed mb-6 whitespace-pre-wrap">{advice}</p>}
            <ul className="space-y-3">
              {plan?.lines.map((line) => (
                <li key={line.slug} className="flex justify-between gap-4 border-b border-obsidian/6 pb-3">
                  <div>
                    <p className="font-medium">{line.name}</p>
                    <p className="text-[11px] text-obsidian/40">{line.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">×{line.qty}</p>
                    <p className="text-xs text-obsidian/45">{formatNgn(line.priceNgn * line.qty)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2"
      />
    </div>
  );
}
