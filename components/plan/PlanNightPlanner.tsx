'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Copy,
  GlassWater,
  Link2,
  MapPin,
  MessageCircle,
  PartyPopper,
  Send,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import PartyPlanner from '@/components/shop/PartyPlanner';
import { formatNgn } from '@/lib/drinks/catalog';
import { LAGOS_AREAS } from '@/lib/geo/lagos';
import {
  recommendDrinks,
  VIBE_LABELS,
  type DrinkPlan,
  type NightMood,
  type PartyVibe,
} from '@/lib/party/drinks-plan';

const DRINK_VIBES = Object.keys(VIBE_LABELS) as PartyVibe[];

const MOODS: { id: NightMood; label: string; help: string; icon: string }[] = [
  { id: 'chilled', label: 'Chilled', help: 'Easy conversation, softer music', icon: '◌' },
  { id: 'party', label: 'Party', help: 'Late night and high energy', icon: '✦' },
  { id: 'date-night', label: 'Date night', help: 'Intimate and polished', icon: '♡' },
  { id: 'networking', label: 'Networking', help: 'Room to connect and talk', icon: '◎' },
  { id: 'celebration', label: 'Celebration', help: 'A proper occasion', icon: '☆' },
];

const QUICK_PLANS = [
  { label: 'Birthday house party', mood: 'celebration' as NightMood, dayOffset: 7, time: '19:00', guests: 15, budget: 150_000 },
  { label: 'House party', mood: 'chilled' as NightMood, dayOffset: 3, time: '19:00', guests: 20, budget: 200_000 },
  { label: 'Tonight', mood: 'party' as NightMood, dayOffset: 0, time: '20:00', guests: 8, budget: 120_000 },
  { label: 'This weekend', mood: 'party' as NightMood, dayOffset: 5, time: '21:00', guests: 10, budget: 180_000 },
  { label: 'Date night', mood: 'date-night' as NightMood, dayOffset: 2, time: '19:00', guests: 2, budget: 80_000 },
  { label: 'After work', mood: 'networking' as NightMood, dayOffset: 1, time: '18:30', guests: 12, budget: 150_000 },
];

const moodToDrinkVibe: Record<NightMood, PartyVibe> = {
  chilled: 'balanced',
  party: 'nightlife',
  'date-night': 'dining',
  networking: 'dining',
  celebration: 'nightlife',
};

function isoDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function suggestedName(mood: NightMood, date: string) {
  const day = new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long' });
  const label = MOODS.find((item) => item.id === mood)?.label || 'Night';
  return mood === 'party' ? `${day} Link-Up` : `${label} · ${day}`;
}

export default function PlanNightPlanner() {
  const router = useRouter();
  const { addProduct } = useCart();
  const builderRef = useRef<HTMLDivElement>(null);
  const adjustRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [city] = useState('Lagos');
  const [area, setArea] = useState('vi');
  const [date, setDate] = useState(isoDate(7));
  const [time, setTime] = useState('19:00');
  const [mood, setMood] = useState<NightMood>('celebration');
  const [drinkVibe, setDrinkVibe] = useState<PartyVibe>('balanced');
  const [groupSize, setGroupSize] = useState(15);
  const [totalBudget, setTotalBudget] = useState(150_000);
  const [generated, setGenerated] = useState<DrinkPlan | null>(null);
  const [shareToken, setShareToken] = useState('');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [joinValue, setJoinValue] = useState('');
  const [joinOpen, setJoinOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const budgetPerPerson = Math.round(totalBudget / Math.max(groupSize, 1));
  const areaLabel = LAGOS_AREAS.find((item) => item.id === area)?.name || 'Lagos';
  const planName = name.trim() || suggestedName(mood, date);

  function applyQuickPlan(item: (typeof QUICK_PLANS)[number]) {
    setMood(item.mood);
    setDrinkVibe(moodToDrinkVibe[item.mood]);
    setDate(isoDate(item.dayOffset));
    setTime(item.time);
    setGroupSize(item.guests);
    setTotalBudget(item.budget);
    setName(item.label === 'Tonight' || item.label === 'This weekend' ? '' : item.label);
    builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openAdjustPackage() {
    setAdjustOpen(true);
    window.setTimeout(() => adjustRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  async function createPlan() {
    setCreating(true);
    setMessage('');
    setAdjustOpen(false);
    const drinksBudget = Math.max(0, Math.round(totalBudget * 0.75));
    const drinkPlan = recommendDrinks({
      guests: groupSize,
      hours: 5,
      vibe: drinkVibe,
      budgetNgn: drinksBudget,
      occasion: MOODS.find((item) => item.id === mood)?.label,
    });
    const fullPlan: DrinkPlan = {
      ...drinkPlan,
      night: {
        city,
        area: areaLabel,
        date,
        time,
        mood,
        budgetPerPersonNgn: budgetPerPerson,
        venueChoice: 'house-party',
        suggestedVenueName: 'Your place',
        meetingTime: time,
        estimatedGroupSpendNgn: totalBudget,
      },
    };
    setGenerated(fullPlan);

    try {
      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: planName,
          occasion: MOODS.find((item) => item.id === mood)?.label,
          eventDate: date,
          venue: fullPlan.night?.suggestedVenueName,
          guests: groupSize,
          hours: 5,
          vibe: drinkVibe,
          budgetNgn: totalBudget,
          plan: fullPlan,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setShareToken(data.party?.shareToken || '');
        setMessage('Your night is ready. Share the private link when you are happy with it.');
      } else {
        setMessage(data.error || 'Your plan is ready, but the private link could not be saved yet.');
      }
    } catch {
      setMessage('Your plan is ready on this device. Reconnect to create its private link.');
    } finally {
      setCreating(false);
      window.setTimeout(() => document.getElementById('generated-night')?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  async function sharePlan() {
    if (!shareToken) {
      setMessage('Save the plan online before sharing its private invitation link.');
      return;
    }
    const url = `${window.location.origin}/plan/${shareToken}`;
    const text = `You’re invited to ${planName} — ${areaLabel}, ${date} at ${time}.`;
    try {
      if (navigator.share) await navigator.share({ title: planName, text, url });
      else {
        await navigator.clipboard.writeText(url);
        setMessage('Private invitation link copied.');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setMessage('Could not share the link. Try again.');
    }
  }

  function addDrinks() {
    if (!generated) return;
    generated.lines.forEach((line) => addProduct(line.slug, line.qty));
    router.push('/cart');
  }

  function joinPlan() {
    const token = joinValue.trim().split('/').filter(Boolean).pop()?.split('?')[0] || '';
    if (token) router.push(`/plan/${encodeURIComponent(token)}`);
  }

  return (
    <div className="min-h-[70vh] bg-paper pb-16 sm:pb-20">
      <section className="border-b border-obsidian/8 bg-paper">
        <div className="relative mx-auto max-w-6xl px-5 py-5 sm:px-8 sm:py-12">
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-ember sm:mb-3">Party Planner</p>
          <h1 className="max-w-2xl font-wordmark text-2xl leading-tight text-obsidian sm:text-5xl sm:leading-[1.05]">
            We&apos;ll build the party.
          </h1>
          <p className="mt-2 max-w-md text-xs text-obsidian/55 sm:mt-4 sm:text-base">
            Guests, budget, delivery — you get one complete package.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
            <button type="button" onClick={() => builderRef.current?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 rounded-full bg-ember px-4 py-2 text-xs font-bold text-white transition hover:bg-ember-dark sm:px-6 sm:py-3 sm:text-sm">
              <Sparkles size={14} className="sm:h-4 sm:w-4" /> Plan my party
            </button>
            <button type="button" onClick={() => setJoinOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-obsidian/15 px-4 py-2 text-xs font-bold text-obsidian transition hover:border-ember hover:text-ember sm:px-6 sm:py-3 sm:text-sm">
              <Link2 size={14} className="sm:h-4 sm:w-4" /> Join a plan
            </button>
          </div>
          {joinOpen && (
            <div className="mt-3 flex max-w-md gap-2 rounded-2xl border border-obsidian/10 bg-white p-2 sm:mt-4">
              <input value={joinValue} onChange={(event) => setJoinValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && joinPlan()} placeholder="Paste invitation link" className="min-w-0 flex-1 rounded-xl border border-obsidian/10 bg-paper px-3 py-2 text-sm text-obsidian placeholder:text-obsidian/35 focus:border-ember focus:ring-0" />
              <button type="button" onClick={joinPlan} className="rounded-xl bg-obsidian px-4 text-sm font-bold text-white">Join</button>
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 sm:px-8">
          <section className="py-4 sm:py-10">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-obsidian/40 sm:mb-3 sm:text-xs">Start with a shortcut</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide sm:gap-2 sm:pb-2">
              {QUICK_PLANS.map((item) => (
                <button key={item.label} type="button" onClick={() => applyQuickPlan(item)} className="shrink-0 rounded-full border border-obsidian/10 bg-white px-3 py-2 text-xs font-semibold text-obsidian/65 shadow-sm transition hover:border-ember/40 hover:text-ember sm:px-4 sm:py-2.5 sm:text-sm">
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section ref={builderRef} className="scroll-mt-28 pb-8 sm:scroll-mt-36 sm:pb-12">
            <div className="grid overflow-hidden rounded-2xl border border-obsidian/10 bg-white shadow-[0_12px_40px_rgba(15,15,15,0.06)] sm:rounded-3xl sm:shadow-[0_20px_70px_rgba(15,15,15,0.08)] lg:grid-cols-[1.25fr_.75fr]">
              <aside className="order-1 border-b border-obsidian/8 lg:order-2 lg:border-b-0 lg:border-l">
                <PlanSharePreviewCard
                  planName={planName}
                  city={city}
                  areaLabel={areaLabel}
                  date={date}
                  time={time}
                  groupSize={groupSize}
                  moodLabel={MOODS.find((item) => item.id === mood)?.label || 'Party'}
                  totalBudget={totalBudget}
                  budgetPerPerson={budgetPerPerson}
                />
              </aside>

              <div className="order-2 p-4 sm:p-8 lg:order-1 lg:p-10">
                <div className="mb-5 flex items-start justify-between gap-4 sm:mb-8 sm:gap-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ember">Your brief</p>
                    <h2 className="mt-1.5 font-wordmark text-xl text-obsidian sm:mt-2 sm:text-3xl">Build your party package</h2>
                  </div>
                  <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 sm:block">About 45 sec</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                  <Field label="Plan name" icon={<PartyPopper size={15} />} wide>
                    <input value={name} onChange={(event) => setName(event.target.value)} placeholder={suggestedName(mood, date)} className="night-input" />
                  </Field>
                  <Field label="City" icon={<MapPin size={15} />}>
                    <span className="night-input block text-obsidian/70">Lagos</span>
                  </Field>
                  <Field label="Preferred area" icon={<MapPin size={15} />}>
                    <span className="relative block">
                      <select value={area} onChange={(event) => setArea(event.target.value)} className="night-input select-clean pr-9">
                        {LAGOS_AREAS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                      </select>
                      <ChevronDown size={15} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-obsidian/35" />
                    </span>
                  </Field>
                  <Field label="Date" icon={<CalendarDays size={15} />}>
                    <input type="date" min={isoDate()} value={date} onChange={(event) => setDate(event.target.value)} className="night-input" />
                  </Field>
                  <Field label="Delivery time" icon={<Clock3 size={15} />}>
                    <input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="night-input" />
                  </Field>
                  <Field label="Guests" icon={<Users size={15} />}>
                    <input type="number" min={2} max={500} value={groupSize} onChange={(event) => setGroupSize(Math.max(2, Math.min(500, Number(event.target.value) || 2)))} className="night-input" />
                  </Field>
                  <Field label="Total budget" icon={<WalletCards size={15} />}>
                    <div className="flex items-center border-b border-obsidian/15 focus-within:border-ember">
                      <span className="text-sm text-obsidian/40">₦</span>
                      <input type="number" min={20000} step={5000} value={totalBudget} onChange={(event) => setTotalBudget(Math.max(20000, Number(event.target.value) || 20000))} className="night-input border-0 pl-1 focus:ring-0" />
                    </div>
                    <p className="mt-1 text-[11px] text-obsidian/40">About {formatNgn(budgetPerPerson)} per guest</p>
                  </Field>
                </div>

                <div className="mt-5 sm:mt-7">
                  <p className="mb-2 text-xs font-bold text-obsidian/55 sm:mb-3">Party type</p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5 sm:gap-2">
                    {MOODS.map((item) => (
                      <button key={item.id} type="button" onClick={() => { setMood(item.id); setDrinkVibe(moodToDrinkVibe[item.id]); }} className={`rounded-xl border p-2.5 text-left transition sm:rounded-2xl sm:p-3 ${mood === item.id ? 'border-ember bg-ember/[0.06] text-ember' : 'border-obsidian/10 bg-paper text-obsidian/60 hover:border-obsidian/20'}`}>
                        <span className="text-base sm:text-lg">{item.icon}</span>
                        <span className="mt-0.5 block text-[11px] font-bold sm:mt-1 sm:text-xs">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 sm:mt-7">
                  <p className="mb-2 text-xs font-bold text-obsidian/55 sm:mb-3">Preferred drinks</p>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {DRINK_VIBES.map((id) => (
                      <button key={id} type="button" onClick={() => setDrinkVibe(id)} className={`rounded-xl border p-2.5 text-left transition sm:rounded-2xl sm:p-3 ${drinkVibe === id ? 'border-ember bg-ember/[0.06] text-ember' : 'border-obsidian/10 bg-paper text-obsidian/60 hover:border-obsidian/20'}`}>
                        <span className="block text-xs font-bold sm:text-sm">{VIBE_LABELS[id]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={createPlan} disabled={creating} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-obsidian px-5 py-3.5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-ember disabled:opacity-60 sm:mt-8 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-sm">
                  <Sparkles size={15} className="sm:h-4 sm:w-4" /> {creating ? 'Planning your party…' : 'Plan my party'}
                </button>
              </div>
            </div>
          </section>

          {generated?.night && (
            <section id="generated-night" className="scroll-mt-36 pb-14">
              <div className="overflow-hidden rounded-3xl border border-ember/20 bg-white shadow-[0_18px_60px_rgba(139,42,34,0.1)]">
                <div className="brand-gradient p-6 text-white sm:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Your party package</p>
                      <h2 className="mt-2 font-wordmark text-3xl sm:text-4xl">{planName}</h2>
                      <p className="mt-2 text-sm text-white/70">
                        {groupSize} guests · {formatNgn(totalBudget)} budget · Delivery by {generated.night.meetingTime}
                      </p>
                    </div>
                    <button type="button" onClick={sharePlan} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-ember">
                      <Send size={15} /> Invite friends
                    </button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-[1fr_.72fr]">
                  <div className="p-5 sm:p-8">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ResultTile eyebrow="Delivery to" title="Your place" text={`${areaLabel} · home delivery`} icon={<MapPin size={18} />} />
                      <ResultTile eyebrow="Delivery" title={`${generated.night.meetingTime} · ${new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`} text="Scheduled drop-off before guests arrive." icon={<Clock3 size={18} />} />
                      <ResultTile eyebrow="Servings" title={`~${generated.drinksPerGuest.toFixed(1)} drinks / guest`} text={`About ${generated.servingsEstimate} pours for ${groupSize} people`} icon={<GlassWater size={18} />} />
                      <ResultTile eyebrow="Party games" title={`${Math.min(3, Math.max(1, Math.floor(groupSize / 5)))} trivia games`} text="Free Convivia24 games to break the ice." icon={<MessageCircle size={18} />} />
                    </div>

                    <div className="mt-6 rounded-2xl border border-obsidian/8 bg-paper p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-ember">Recommended package</p>
                          <p className="mt-1 text-sm text-obsidian/50">Bottles, mixers, ice and cups sized for your group.</p>
                        </div>
                        <span className="text-sm font-bold text-obsidian">{formatNgn(generated.totalNgn)}</span>
                      </div>
                      <div className="mt-4 divide-y divide-obsidian/8">
                        {generated.lines.filter((line) => line.category !== 'mixers').slice(0, 5).map((line) => (
                          <div key={line.slug} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                            <span className="min-w-0 truncate text-obsidian/65">{line.qty} × {line.name}</span>
                            <span className="shrink-0 font-semibold text-obsidian">{formatNgn(line.priceNgn * line.qty)}</span>
                          </div>
                        ))}
                        {generated.lines.some((line) => line.category === 'mixers') ? (
                          <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
                            <span className="text-obsidian/65">Mixers, ice and cups</span>
                            <span className="shrink-0 font-semibold text-obsidian">Included</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
                            <span className="text-obsidian/65">Mixers, ice and cups</span>
                            <span className="shrink-0 text-xs text-obsidian/45">Added at checkout</span>
                          </div>
                        )}
                      </div>
                      <Link href="/trivia" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-ember hover:text-ember-dark">
                        Browse party games <ArrowRight size={13} />
                      </Link>
                    </div>
                    {message && <p className="mt-4 text-sm text-ember">{message}</p>}
                  </div>

                  <aside className="border-t border-obsidian/8 bg-paper p-5 sm:p-8 lg:border-l lg:border-t-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/40">Next steps</p>
                    <div className="mt-4 space-y-2">
                      <ActionButton icon={<Sparkles size={16} />} label="Adjust package" onClick={openAdjustPackage} />
                      <ActionButton icon={<Send size={16} />} label="Invite friends" onClick={sharePlan} />
                      <ActionButton icon={<CircleDollarSign size={16} />} label="Split payment" onClick={() => setSplitOpen((value) => !value)} />
                      <ActionButton icon={<GlassWater size={16} />} label="Order everything" onClick={addDrinks} />
                    </div>
                    {shareToken && (
                      <button type="button" onClick={async () => { await navigator.clipboard.writeText(`${window.location.origin}/plan/${shareToken}`); setMessage('Shared contribution link copied.'); }} className="mt-5 flex w-full items-center gap-2 rounded-xl border border-dashed border-obsidian/15 px-3 py-3 text-left text-xs text-obsidian/45 hover:border-ember/40 hover:text-ember">
                        <Copy size={14} /> Copy shared contribution link
                      </button>
                    )}
                    {splitOpen && (
                      <div className="mt-4 rounded-2xl border border-ember/15 bg-white p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-ember">Split payment</p>
                        <p className="mt-2 text-2xl font-semibold text-obsidian">{formatNgn(budgetPerPerson)} <span className="text-xs font-normal text-obsidian/40">each</span></p>
                        <p className="mt-1 text-xs text-obsidian/45">{groupSize} shares · {formatNgn(totalBudget)} total target</p>
                        <button type="button" onClick={async () => { await navigator.clipboard.writeText(`${planName}: ${formatNgn(budgetPerPerson)} each for ${groupSize} people.`); setMessage('Payment request copied for the group.'); }} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-ember"><Copy size={13} /> Copy payment request</button>
                      </div>
                    )}
                  </aside>
                </div>
              </div>
            </section>
          )}

          {adjustOpen && (
            <section ref={adjustRef} className="scroll-mt-36 mb-14 overflow-hidden rounded-3xl border border-obsidian/10 bg-white">
              <div className="border-b border-obsidian/8 p-5 sm:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-ember">Adjust package</p>
                <h2 className="mt-1 font-wordmark text-xl sm:text-2xl">Fine-tune bottles, quantities and party packs</h2>
              </div>
              <div className="p-3 sm:p-6">
                <PartyPlanner defaultOpen />
              </div>
            </section>
          )}
        </main>
    </div>
  );
}

function PlanSharePreviewCard({
  planName,
  city,
  areaLabel,
  date,
  time,
  groupSize,
  moodLabel,
  totalBudget,
  budgetPerPerson,
}: {
  planName: string;
  city: string;
  areaLabel: string;
  date: string;
  time: string;
  groupSize: number;
  moodLabel: string;
  totalBudget: number;
  budgetPerPerson: number;
}) {
  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="overflow-hidden bg-[#fafaf8]">
      <div className="border-b-4 border-ember bg-white px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5">
        <Image
          src="/convivia24.png"
          alt="Convivia24"
          width={299}
          height={55}
          className="h-7 w-auto sm:h-9"
        />
        <p className="mt-2 text-[10px] text-obsidian/45 sm:text-[11px]">
          Party plan · nationwide delivery · 18+
        </p>
      </div>

      <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/35">Live preview</p>
          <h3 className="mt-2 font-wordmark text-2xl leading-tight text-obsidian sm:text-3xl">{planName}</h3>
        </div>

        <div className="space-y-2.5 text-sm text-obsidian/60">
          <PreviewLine icon={<MapPin size={15} />} label={`${city} · ${areaLabel}`} />
          <PreviewLine icon={<CalendarDays size={15} />} label={`${dateLabel} · ${time}`} />
          <PreviewLine icon={<Users size={15} />} label={`${groupSize} guests · ${moodLabel}`} />
          <PreviewLine icon={<WalletCards size={15} />} label={`${formatNgn(totalBudget)} budget · ${formatNgn(budgetPerPerson)} each`} />
        </div>

        <p className="text-xl font-bold text-ember sm:text-2xl">{formatNgn(totalBudget)}</p>

        <div className="rounded-xl border border-obsidian/8 bg-white p-3.5 sm:p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-obsidian/40">Delivery to</p>
          <p className="mt-1.5 text-base font-semibold text-obsidian sm:text-lg">Your place</p>
          <p className="mt-1 text-xs leading-relaxed text-obsidian/50">{areaLabel} · home setup · drinks delivered</p>
        </div>

        <p className="text-[10px] text-obsidian/40 sm:text-[11px]">convivia24.com · Drink supplies for events</p>
      </div>
    </div>
  );
}

function Field({ label, icon, wide, children }: { label: string; icon: React.ReactNode; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? 'sm:col-span-2' : ''}><span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-obsidian/50 sm:mb-1.5 sm:text-xs">{icon}{label}</span>{children}</label>;
}

function PreviewLine({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex items-center gap-2.5"><span className="shrink-0 text-ember">{icon}</span><span>{label}</span></div>;
}

function ResultTile({ eyebrow, title, text, icon }: { eyebrow: string; title: string; text: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-obsidian/8 p-4"><div className="flex items-center gap-2 text-ember">{icon}<p className="text-[10px] font-black uppercase tracking-wider">{eyebrow}</p></div><p className="mt-3 font-semibold text-obsidian">{title}</p><p className="mt-1 text-xs leading-relaxed text-obsidian/45">{text}</p></div>;
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-obsidian/8 bg-white px-4 py-3 text-left text-sm font-semibold text-obsidian/65 transition hover:border-ember/30 hover:text-ember"><span className="text-ember">{icon}</span>{label}<ArrowRight size={14} className="ml-auto" /></button>;
}
