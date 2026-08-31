'use client';

import { useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowLeftRight, ArrowRight, ChevronDown, Minus, Plus, Save, Sparkles, Trash2, Users, X } from 'lucide-react';
import PlanShareActions from '@/components/party/PlanShareActions';
import { useCart } from '@/components/cart/CartProvider';
import {
  MAX_GUESTS,
  MAX_HOURS,
  MAX_LINE_QTY,
  MIN_GUESTS,
  MIN_HOURS,
  SIZE_PRESETS,
  VIBE_HELP,
  VIBE_LABELS,
  eventSizeMeta,
  nearestSizePreset,
  planAddProduct,
  planSwapProduct,
  planWithQty,
  recommendDrinks,
  type DrinkPlan,
  type PartyVibe,
} from '@/lib/party/drinks-plan';
import Link from 'next/link';
import { packageForGuests, savingsNgn } from '@/lib/packages/catalog';
import type { PlanShareInput } from '@/lib/party/render-plan-share';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  DRINKS,
  formatNgn,
  searchDrinks,
  type DrinkCategory,
  type DrinkProduct,
} from '@/lib/drinks/catalog';

type SavedParty = {
  id: string;
  name: string;
  occasion: string | null;
  eventDate: string | null;
  venue: string | null;
  guests: number;
  hours: number;
  vibe: string;
  budgetNgn: number | null;
  plan: DrinkPlan | null;
};

const OCCASIONS = ['House party', 'Birthday', 'Club table', 'Wedding after-party', 'Corporate', 'Chill hangout'];
const HOUR_PRESETS = [3, 5, 8, 12];
const VIBES = Object.keys(VIBE_LABELS) as PartyVibe[];
const GUEST_SLIDER_MAX = 5_000;

const inputClass =
  'w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2.5 bg-transparent';

/**
 * Advanced drink-supply planner used by the standalone Plan a Night experience.
 */
export default function PartyPlanner({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const router = useRouter();
  const { addProduct } = useCart();
  const [open, setOpen] = useState(defaultOpen);
  const [guests, setGuests] = useState(25);
  const [hours, setHours] = useState(5);
  const [budgetOn, setBudgetOn] = useState(false);
  const [budget, setBudget] = useState(300000);
  const [vibe, setVibe] = useState<PartyVibe>('balanced');
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [question, setQuestion] = useState('');
  const [plan, setPlan] = useState<DrinkPlan | null>(null);
  const [advice, setAdvice] = useState('');
  const [thinking, setThinking] = useState(false);
  const [msg, setMsg] = useState('');
  const [parties, setParties] = useState<SavedParty[]>([]);
  const [partyId, setPartyId] = useState<string | null>(null);
  const [partyName, setPartyName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [swapSlug, setSwapSlug] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [mobileStep, setMobileStep] = useState(0);
  const [mobileReviewOpen, setMobileReviewOpen] = useState(false);
  const mobileTouch = useRef<{ x: number; y: number; interactive: boolean } | null>(null);

  const size = eventSizeMeta(guests);
  const activePreset = nearestSizePreset(guests);
  const budgetNgn = budgetOn ? budget : 0;

  useEffect(() => {
    setPlan(recommendDrinks({ guests, hours, vibe, budgetNgn, occasion }));
    setAdvice('');
    setSwapSlug(null);
    setAdding(false);
  }, [guests, hours, vibe, budgetNgn, occasion]);

  useEffect(() => {
    if (!open) return;
    fetch('/api/parties')
      .then((r) => (r.ok ? r.json() : { parties: [] }))
      .then((data) => setParties(data.parties || []))
      .catch(() => {});
  }, [open]);

  async function saveParty() {
    if (!partyName.trim()) {
      setShowDetails(true);
      setMobileStep(0);
      setMsg('Give the event a name before saving.');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: partyId,
          name: partyName,
          occasion,
          eventDate: eventDate || null,
          venue: venue || null,
          guests,
          hours,
          vibe,
          budgetNgn: budgetOn ? budget : null,
          plan,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || 'Could not save the plan.');
        return;
      }
      setPartyId(data.party.id);
      setParties((rows) => {
        const without = rows.filter((r) => r.id !== data.party.id);
        return [data.party, ...without];
      });
      setMsg(`Saved “${data.party.name}”.`);
    } catch {
      setMsg('Could not save the plan.');
    } finally {
      setSaving(false);
    }
  }

  function loadParty(party: SavedParty) {
    setPartyId(party.id);
    setPartyName(party.name);
    setOccasion(party.occasion || OCCASIONS[0]);
    setEventDate(party.eventDate || '');
    setVenue(party.venue || '');
    setGuests(party.guests);
    setHours(party.hours);
    setVibe(party.vibe as PartyVibe);
    if (party.budgetNgn != null && party.budgetNgn > 0) {
      setBudgetOn(true);
      setBudget(party.budgetNgn);
    } else {
      setBudgetOn(false);
    }
    if (party.plan) setPlan(party.plan);
    setAdvice('');
    setShowDetails(true);
    setMsg(`Loaded “${party.name}”.`);
  }

  function newParty() {
    setPartyId(null);
    setPartyName('');
    setEventDate('');
    setVenue('');
    setMsg('');
  }

  async function removeParty(party: SavedParty) {
    if (!window.confirm(`Delete “${party.name}”?`)) return;
    const res = await fetch(`/api/parties?id=${encodeURIComponent(party.id)}`, { method: 'DELETE' });
    if (!res.ok) {
      setMsg('Could not delete the plan.');
      return;
    }
    setParties((rows) => rows.filter((r) => r.id !== party.id));
    if (partyId === party.id) newParty();
  }

  async function askAi() {
    setThinking(true);
    setMsg('');
    try {
      const res = await fetch('/api/party/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guests,
          hours,
          vibe,
          budgetNgn: budgetOn ? budget : undefined,
          occasion,
          question,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || 'Planner unavailable right now.');
        return;
      }
      if (data.plan) setPlan(data.plan);
      setAdvice(data.advice || '');
    } catch {
      setMsg('Planner unavailable right now.');
    } finally {
      setThinking(false);
    }
  }

  // The nearest ready-made package, offered as a shortcut out of the basket we just generated.
  const suggestedPackage = useMemo(() => packageForGuests(guests, occasion), [guests, occasion]);

  function addPlanToCart() {
    if (!plan?.lines.length) return;
    for (const line of plan.lines) addProduct(line.slug, line.qty);
    router.push('/cart');
  }

  function setLineQty(slug: string, qty: number) {
    setPlan((current) => (current ? planWithQty(current, slug, qty, guests) : current));
  }

  function swapLine(fromSlug: string, toSlug: string) {
    setPlan((current) => (current ? planSwapProduct(current, fromSlug, toSlug, guests) : current));
    setSwapSlug(null);
  }

  function addFromShop(slug: string) {
    setPlan((current) => {
      if (!current) {
        const empty: DrinkPlan = {
          lines: [],
          totalNgn: 0,
          drinksPerGuest: 0,
          servingsEstimate: 0,
          spendPerGuest: 0,
          sizeLabel: size.label,
          tips: [],
        };
        return planAddProduct(empty, slug, guests, 1);
      }
      return planAddProduct(current, slug, guests, 1);
    });
    setAdding(false);
  }

  const shareInput: PlanShareInput | null = plan?.lines.length
    ? {
        partyName: partyName.trim() || `${size.label} plan`,
        occasion,
        eventDate: eventDate || undefined,
        venue: venue || undefined,
        guests,
        hours,
        vibe,
        budgetNgn: budgetOn ? budget : 0,
        plan,
        advice: advice || undefined,
      }
    : null;

  const mobileStepLabels = ['Event', 'Size', 'Style', 'Your plan'];

  function goMobileStep(next: number) {
    setMobileStep(Math.max(0, Math.min(mobileStepLabels.length - 1, next)));
    setSwapSlug(null);
    setAdding(false);
  }

  function startMobileSwipe(event: TouchEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    mobileTouch.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      interactive: Boolean(target.closest('input, select, textarea, button, a')),
    };
  }

  function finishMobileSwipe(event: TouchEvent<HTMLDivElement>) {
    const start = mobileTouch.current;
    mobileTouch.current = null;
    if (!start || start.interactive) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    goMobileStep(mobileStep + (dx < 0 ? 1 : -1));
  }

  const mobileBody = (
    <div className="lg:hidden">
      <div className="mb-3 rounded-2xl border border-obsidian/10 bg-white px-3 py-2.5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-ember">
            Step {mobileStep + 1} of {mobileStepLabels.length}
          </p>
          <p className="text-sm font-semibold text-obsidian">{mobileStepLabels[mobileStep]}</p>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1" aria-hidden>
          {mobileStepLabels.map((label, index) => (
            <span
              key={label}
              className={`h-1 rounded-full transition-colors ${index <= mobileStep ? 'bg-ember' : 'bg-obsidian/10'}`}
            />
          ))}
        </div>
      </div>

      <div onTouchStart={startMobileSwipe} onTouchEnd={finishMobileSwipe}>
        {mobileStep === 0 && (
          <section className="rounded-2xl border border-obsidian/10 bg-white p-4 shadow-sm">
            <StepEyebrow n={1} title="Start with the essentials" />
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-bold text-obsidian/50">Event name</span>
              <input
                value={partyName}
                onChange={(event) => setPartyName(event.target.value)}
                placeholder="e.g. Ada's rooftop"
                className="w-full rounded-xl border border-obsidian/10 bg-paper px-3 py-3 text-base font-semibold text-obsidian placeholder:text-obsidian/30 focus:border-ember focus:ring-0"
              />
            </label>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-bold text-obsidian/50">Occasion</span>
              <span className="relative block">
                <select
                  value={occasion}
                  onChange={(event) => setOccasion(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-obsidian/10 bg-paper px-3 py-3 pr-10 text-base text-obsidian focus:border-ember focus:ring-0"
                >
                  {!OCCASIONS.includes(occasion) && <option value={occasion}>{occasion}</option>}
                  {OCCASIONS.map((item) => <option key={item}>{item}</option>)}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-obsidian/40" />
              </span>
            </label>

            {parties.length > 0 && (
              <label className="mt-4 block border-t border-obsidian/8 pt-3">
                <span className="mb-1.5 block text-xs font-bold text-obsidian/50">Or load a saved plan</span>
                <select
                  value={partyId || ''}
                  onChange={(event) => {
                    const party = parties.find((item) => item.id === event.target.value);
                    if (party) loadParty(party);
                  }}
                  className="w-full rounded-xl border border-obsidian/10 bg-white px-3 py-2.5 text-sm focus:border-ember focus:ring-0"
                >
                  <option value="">Choose a saved plan…</option>
                  {parties.map((party) => <option key={party.id} value={party.id}>{party.name}</option>)}
                </select>
              </label>
            )}
            {msg && <p className="mt-3 text-sm text-ember">{msg}</p>}
          </section>
        )}

        {mobileStep === 1 && (
          <section className="rounded-2xl border border-obsidian/10 bg-white p-4 shadow-sm">
            <StepEyebrow n={2} title="Guests & duration" />
            <p className="mt-2 text-sm leading-snug text-obsidian/50">{size.hint}</p>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {SIZE_PRESETS.map((preset) => {
                const on = activePreset?.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setGuests(preset.guests)}
                    className={`min-h-14 rounded-xl border px-1 py-1.5 text-center transition-colors ${
                      on ? 'border-ember bg-ember/5 text-ember' : 'border-obsidian/10 bg-paper text-obsidian/60'
                    }`}
                  >
                    <span className="block truncate text-[10px] font-bold">{preset.label}</span>
                    <span className="mt-0.5 block text-xs font-semibold">{preset.guests.toLocaleString()}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1.5 block text-xs font-bold text-obsidian/50">Guests</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={MIN_GUESTS}
                  max={MAX_GUESTS}
                  value={guests}
                  onChange={(event) => setGuests(Math.max(MIN_GUESTS, Math.min(MAX_GUESTS, Number(event.target.value) || MIN_GUESTS)))}
                  className="w-full rounded-xl border border-obsidian/10 bg-paper px-3 py-2.5 text-lg font-semibold focus:border-ember focus:ring-0"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-bold text-obsidian/50">Duration</span>
                <span className="relative block">
                  <select
                    value={hours}
                    onChange={(event) => setHours(Number(event.target.value))}
                    className="w-full appearance-none rounded-xl border border-obsidian/10 bg-paper px-3 py-3 pr-8 text-base font-semibold focus:border-ember focus:ring-0"
                  >
                    {Array.from({ length: MAX_HOURS }, (_, index) => index + 1).map((item) => (
                      <option key={item} value={item}>{item === 1 ? '1 hour' : `${item} hours`}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-obsidian/40" />
                </span>
              </label>
            </div>
            <input
              type="range"
              className="plan-slider mt-4 w-full"
              min={MIN_GUESTS}
              max={GUEST_SLIDER_MAX}
              value={Math.min(guests, GUEST_SLIDER_MAX)}
              onChange={(event) => setGuests(Number(event.target.value))}
              aria-label="Guest count"
            />
          </section>
        )}

        {mobileStep === 2 && (
          <section className="rounded-2xl border border-obsidian/10 bg-white p-4 shadow-sm">
            <StepEyebrow n={3} title="Choose the style" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {VIBES.map((id) => {
                const on = vibe === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setVibe(id)}
                    className={`rounded-xl border p-2.5 text-left transition-colors ${
                      on ? 'border-ember bg-ember/5' : 'border-obsidian/10 bg-paper'
                    }`}
                  >
                    <span className={`block text-sm font-semibold ${on ? 'text-ember' : 'text-obsidian'}`}>{VIBE_LABELS[id]}</span>
                    <span className="mt-1 block line-clamp-2 text-xs leading-snug text-obsidian/45">{VIBE_HELP[id]}</span>
                  </button>
                );
              })}
            </div>

            <label className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-obsidian/10 bg-paper px-3 py-2.5">
              <span>
                <span className="block text-sm font-semibold text-obsidian">Set a budget</span>
                <span className="block text-xs text-obsidian/45">Keep the suggested basket under a cap</span>
              </span>
              <input
                type="checkbox"
                checked={budgetOn}
                onChange={(event) => setBudgetOn(event.target.checked)}
                className="h-5 w-5 rounded border-obsidian/20 text-ember focus:ring-ember"
              />
            </label>
            {budgetOn && (
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-bold text-obsidian/50">Budget (NGN)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={10000}
                  value={budget}
                  onChange={(event) => setBudget(Math.max(0, Number(event.target.value) || 0))}
                  className="w-full rounded-xl border border-obsidian/10 bg-paper px-3 py-2.5 text-base font-semibold focus:border-ember focus:ring-0"
                />
              </label>
            )}

            <details className="mt-3 rounded-xl border border-obsidian/10 bg-white">
              <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-semibold text-obsidian/60">
                Date, venue & notes <span className="font-normal text-obsidian/35">(optional)</span>
              </summary>
              <div className="space-y-3 border-t border-obsidian/8 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} className="min-w-0 rounded-lg border-obsidian/10 px-2 py-2 text-sm focus:border-ember focus:ring-0" />
                  <input value={venue} onChange={(event) => setVenue(event.target.value)} placeholder="Venue" className="min-w-0 rounded-lg border-obsidian/10 px-2 py-2 text-sm focus:border-ember focus:ring-0" />
                </div>
                <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={2} placeholder="Any preferences or notes?" className="w-full rounded-lg border-obsidian/10 px-2 py-2 text-sm focus:border-ember focus:ring-0" />
                <div className="flex gap-2">
                  <button type="button" onClick={askAi} disabled={thinking} className="flex-1 rounded-lg border border-obsidian/10 px-2 py-2 text-xs font-bold text-obsidian/60 disabled:opacity-50">
                    <Sparkles size={13} className="mr-1 inline" /> {thinking ? 'Thinking…' : 'Get advice'}
                  </button>
                  <button type="button" onClick={saveParty} disabled={saving} className="flex-1 rounded-lg border border-obsidian/10 px-2 py-2 text-xs font-bold text-obsidian/60 disabled:opacity-50">
                    <Save size={13} className="mr-1 inline" /> {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </details>
            {msg && <p className="mt-3 text-sm text-ember">{msg}</p>}
          </section>
        )}

        {mobileStep === 3 && (
          <section className="overflow-hidden rounded-2xl border border-obsidian/10 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-obsidian to-ember-dark px-4 py-4 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">Suggested supplies</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold">{partyName.trim() || 'Your event'}</h2>
                  <p className="mt-1 text-xs text-white/60">{guests.toLocaleString()} guests · {hours}h · {VIBE_LABELS[vibe]}</p>
                </div>
                <p className="shrink-0 text-xl font-bold">{plan ? formatNgn(plan.totalNgn) : '—'}</p>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-paper p-3">
                <Stat label="Items" value={plan ? String(plan.lines.length) : '—'} />
                <Stat label="Per guest" value={plan ? formatNgn(plan.spendPerGuest || Math.round(plan.totalNgn / Math.max(guests, 1))) : '—'} />
              </div>

              {plan?.tips?.[0] && <p className="mt-3 border-l-2 border-ember/30 pl-3 text-xs leading-relaxed text-obsidian/60">{plan.tips[0]}</p>}

              {suggestedPackage && plan && (
                <Link href={`/shop?section=packages&pkg=${suggestedPackage.slug}`} className="mt-3 block rounded-xl border border-ember/20 bg-ember/[0.03] p-3">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-ember">Quick package option</span>
                  <span className="mt-1 block text-sm font-semibold text-obsidian">{suggestedPackage.name} · {formatNgn(suggestedPackage.priceNgn)}</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => setMobileReviewOpen((value) => !value)}
                className="mt-3 flex w-full items-center justify-between rounded-xl border border-obsidian/10 px-3 py-2.5 text-left text-sm font-semibold text-obsidian"
                aria-expanded={mobileReviewOpen}
              >
                Review & edit {plan?.lines.length || 0} items
                <ChevronDown size={16} className={`text-obsidian/40 transition-transform ${mobileReviewOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileReviewOpen && (
                <ul className="mt-2 max-h-[42dvh] overflow-y-auto overscroll-contain rounded-xl border border-obsidian/10 px-3">
                  {plan?.lines.map((line) => (
                    <li key={line.slug} className="border-b border-obsidian/8 py-2.5 last:border-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{line.name}</p>
                          <button type="button" onClick={() => setSwapSlug((slug) => slug === line.slug ? null : line.slug)} className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-ember">Swap</button>
                        </div>
                        <div className="inline-flex shrink-0 items-center rounded-lg border border-obsidian/10">
                          <button type="button" onClick={() => setLineQty(line.slug, line.qty - 1)} aria-label={`Fewer ${line.name}`} className="p-1.5 text-obsidian/45"><Minus size={12} /></button>
                          <span className="w-7 text-center text-xs font-semibold">{line.qty}</span>
                          <button type="button" onClick={() => setLineQty(line.slug, line.qty + 1)} aria-label={`More ${line.name}`} className="p-1.5 text-obsidian/45"><Plus size={12} /></button>
                        </div>
                      </div>
                      {swapSlug === line.slug && (
                        <ShopPicker preferCategory={line.category as DrinkCategory} excludeSlug={line.slug} title={`Swap ${line.name}`} actionLabel="Use" onPick={(slug) => swapLine(line.slug, slug)} onClose={() => setSwapSlug(null)} />
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <button type="button" onClick={addPlanToCart} disabled={!plan?.lines.length} className="mt-4 w-full rounded-xl px-4 py-3.5 btn-brand text-xs font-black uppercase tracking-[0.12em] disabled:opacity-40">
                Add supplies to cart
              </button>

              {shareInput && (
                <details className="mt-2 rounded-xl border border-obsidian/10 px-3 py-2.5">
                  <summary className="cursor-pointer list-none text-center text-xs font-bold text-obsidian/55">Share or download plan</summary>
                  <div className="mt-3"><PlanShareActions input={shareInput} /></div>
                </details>
              )}
            </div>
          </section>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => goMobileStep(mobileStep - 1)}
          disabled={mobileStep === 0}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-obsidian/10 bg-white px-3 text-sm font-semibold text-obsidian disabled:opacity-30"
        >
          <ArrowLeft size={16} /> Back
        </button>
        {mobileStep < mobileStepLabels.length - 1 ? (
          <button type="button" onClick={() => goMobileStep(mobileStep + 1)} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl btn-brand px-3 text-sm font-semibold">
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={() => goMobileStep(0)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-obsidian/10 bg-white px-3 text-sm font-semibold text-obsidian">
            Edit event
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-obsidian/35">Swipe left or right between steps</p>
    </div>
  );

  const body = (
    <div className="hidden lg:grid lg:grid-cols-12 gap-10 lg:gap-14 lg:items-start">
      <div className="lg:col-span-5 space-y-10">
        <section>
          <StepEyebrow n={1} title="Name your event" />
          <label className="block mt-4">
            <input
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="e.g. Ada's rooftop · Tolu's birthday"
              className="w-full border-0 border-b-2 border-obsidian/20 focus:border-ember focus:ring-0 text-2xl sm:text-3xl font-semibold text-obsidian py-3 bg-transparent placeholder:text-obsidian/25"
            />
          </label>
          <p className="text-base text-obsidian/50 mt-3 leading-relaxed">
            This name leads the plan image when you share or download.
          </p>
        </section>

        <section>
          <StepEyebrow n={2} title="How many people?" />
          <p className="text-base sm:text-sm text-obsidian/50 mt-2 mb-5 leading-relaxed">
            {size.hint} Type any headcount up to {MAX_GUESTS.toLocaleString()}.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {SIZE_PRESETS.map((preset) => {
              const on = activePreset?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setGuests(preset.guests)}
                  className={`text-left px-2.5 py-2 sm:px-3 sm:py-2.5 border transition-colors ${
                    on ? 'border-ember bg-ember/5' : 'border-obsidian/10 hover:border-obsidian/25 bg-white'
                  }`}
                >
                  <span className="block text-xs sm:text-sm font-medium text-obsidian/80">{preset.label}</span>
                  <span className="block text-xs sm:text-sm text-obsidian/35 mt-0.5">{preset.guests.toLocaleString()}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 space-y-6">
            <SliderField
              label="Headcount"
              value={guests}
              min={MIN_GUESTS}
              max={MAX_GUESTS}
              sliderMax={GUEST_SLIDER_MAX}
              onChange={setGuests}
              suffix="guests"
            />
            <div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {HOUR_PRESETS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h)}
                    className={`px-3 py-1.5 text-xs sm:text-xs sm:text-sm border ${
                      hours === h ? 'border-ember text-ember' : 'border-obsidian/10 text-obsidian/50'
                    }`}
                  >
                    {h === 12 ? 'All day' : `${h}h`}
                  </button>
                ))}
              </div>
              <SliderField
                label="Hours"
                value={hours}
                min={MIN_HOURS}
                max={MAX_HOURS}
                onChange={setHours}
                suffix="hours"
              />
            </div>
          </div>
        </section>

        <section>
          <StepEyebrow n={3} title="What kind of night?" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
            {VIBES.map((id) => {
              const on = vibe === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setVibe(id)}
                  className={`text-left px-4 py-3.5 border transition-colors ${
                    on ? 'border-ember bg-ember/5' : 'border-obsidian/10 hover:border-obsidian/25 bg-white'
                  }`}
                >
                  <span className="block text-base sm:text-sm font-medium text-obsidian">{VIBE_LABELS[id]}</span>
                  <span className="block text-sm text-obsidian/45 mt-1 leading-snug">{VIBE_HELP[id]}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-5">
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-2">
              Occasion
            </span>
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOccasion(o)}
                  className={`px-3 py-2 sm:py-1.5 text-xs sm:text-xs sm:text-sm border ${
                    occasion === o ? 'border-ember text-ember' : 'border-obsidian/10 text-obsidian/50 hover:border-obsidian/25'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
            <input
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="Or type your own — naming ceremony, bridal shower…"
              className={`${inputClass} mt-3 text-base sm:text-sm`}
            />
          </div>
          <div className="mt-6 pt-5 border-t border-obsidian/10">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={budgetOn}
                onChange={(e) => setBudgetOn(e.target.checked)}
                className="rounded border-obsidian/25 text-ember focus:ring-ember"
              />
              <span className="text-base sm:text-sm text-obsidian/70">Cap the basket to a budget</span>
            </label>
            {budgetOn && (
              <div className="mt-4">
                <SliderField
                  label="Budget (NGN)"
                  value={budget}
                  min={0}
                  max={50_000_000}
                  sliderMax={10_000_000}
                  step={10000}
                  onChange={setBudget}
                />
              </div>
            )}
          </div>
        </section>

        <section>
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <StepEyebrow n={4} title="Date, venue & save (optional)" />
            <ChevronDown size={16} className={`text-obsidian/35 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>
          {showDetails && (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                    Date
                  </span>
                  <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={`${inputClass} text-base sm:text-sm`} />
                </label>
                <label className="block">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                    Venue
                  </span>
                  <input
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Home, hall, lounge…"
                    className={`${inputClass} text-base sm:text-sm`}
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                  Notes for AI advice
                </span>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={2}
                  placeholder="Mostly cognac drinkers, outdoor, no red wine…"
                  className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-base sm:text-sm py-2 bg-transparent resize-y"
                />
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={askAi}
                  disabled={thinking}
                  className="inline-flex items-center gap-2 px-4 py-3 sm:py-2.5 border border-obsidian/15 text-xs sm:text-xs sm:text-sm font-black uppercase tracking-[0.12em] disabled:opacity-50"
                >
                  <Sparkles size={14} /> {thinking ? 'Thinking…' : 'Hosting advice'}
                </button>
                <button
                  type="button"
                  onClick={saveParty}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-3 sm:py-2.5 border border-obsidian/15 text-xs sm:text-xs sm:text-sm font-black uppercase tracking-[0.12em] disabled:opacity-50"
                >
                  <Save size={14} /> {saving ? 'Saving…' : partyId ? 'Update' : 'Save plan'}
                </button>
                {partyId && (
                  <button
                    type="button"
                    onClick={newParty}
                    className="px-3 py-3 sm:py-2.5 text-xs sm:text-xs sm:text-sm font-black uppercase tracking-[0.12em] text-obsidian/45 hover:text-obsidian"
                  >
                    New
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {parties.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => setShowSaved((v) => !v)}
              className="w-full flex items-center justify-between text-left"
            >
              <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-obsidian/40">
                Saved plans ({parties.length})
              </p>
              <ChevronDown size={16} className={`text-obsidian/35 transition-transform ${showSaved ? 'rotate-180' : ''}`} />
            </button>
            {showSaved && (
              <ul className="mt-3 space-y-1.5">
                {parties.map((party) => (
                  <li key={party.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadParty(party)}
                      className={`flex-1 min-w-0 text-left px-3 py-2.5 border text-sm transition-colors ${
                        partyId === party.id ? 'border-ember text-ember' : 'border-obsidian/10 hover:border-obsidian/25 bg-white'
                      }`}
                    >
                      <span className="block truncate font-medium">{party.name}</span>
                      <span className="block text-xs sm:text-sm text-obsidian/40 truncate">
                        {party.guests} guests{party.eventDate ? ` · ${party.eventDate}` : ''}
                        {party.venue ? ` · ${party.venue}` : ''}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeParty(party)}
                      aria-label={`Delete ${party.name}`}
                      className="p-2 border border-obsidian/10 text-obsidian/40 hover:text-ember"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {msg && <p className="text-sm text-ember">{msg}</p>}
      </div>

      <div className="lg:col-span-7">
        <div className="lg:sticky lg:top-24 bg-white border border-obsidian/10 px-5 sm:px-7 py-6 sm:py-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-black uppercase tracking-[0.22em] text-ember">Suggested supplies</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-obsidian mt-2 leading-tight text-balance">
                {partyName.trim() || 'Your event'}
              </h2>
              <p className="text-base sm:text-sm text-obsidian/45 mt-2">
                {size.label} · {guests.toLocaleString()} guests · {hours}h · {VIBE_LABELS[vibe]}
              </p>
              <p className="text-sm sm:text-xs sm:text-sm text-obsidian/40 mt-1.5">{occasion}</p>
              <p className="text-sm sm:text-xs sm:text-sm text-obsidian/40 mt-3">
                Swap any bottle with something else from the shop — keep the quantity.
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl sm:text-4xl font-bold brand-text leading-none">{plan ? formatNgn(plan.totalNgn) : '—'}</p>
              <p className="text-xs sm:text-xs sm:text-sm text-obsidian/40 mt-1.5">
                {plan ? `${formatNgn(plan.spendPerGuest || Math.round(plan.totalNgn / Math.max(guests, 1)))} / guest` : ''}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 mb-6 py-4 border-y border-obsidian/10">
            <Stat label="Items" value={plan ? String(plan.lines.length) : '—'} />
            <Stat
              label="Per guest"
              value={
                plan
                  ? formatNgn(plan.spendPerGuest || Math.round(plan.totalNgn / Math.max(guests, 1)))
                  : '—'
              }
            />
          </dl>

          {plan && budgetOn && budget > 0 && plan.totalNgn > budget && (
            <p className="text-sm text-ember mb-5">
              Still over {formatNgn(budget)} after trimming. Drop guests, hours, or switch vibe.
            </p>
          )}

          {plan?.tips?.length ? (
            <ul className="mb-7 space-y-2.5">
              {plan.tips.map((tip) => (
                <li key={tip} className="text-sm text-obsidian/65 leading-relaxed pl-3 border-l-2 border-ember/30">
                  {tip}
                </li>
              ))}
            </ul>
          ) : null}

          {suggestedPackage && plan && (
            <div className="mb-7 border border-ember/25 bg-ember/[0.03] px-4 py-3.5">
              <p className="text-xs sm:text-sm uppercase tracking-wider text-ember mb-1.5">
                Or skip the picking
              </p>
              <p className="text-sm text-obsidian/75 leading-relaxed">
                <Link
                  href={`/shop?section=packages&pkg=${suggestedPackage.slug}`}
                  className="font-semibold text-obsidian hover:text-ember hover:underline"
                >
                  {suggestedPackage.name}
                </Link>{' '}
                covers about {suggestedPackage.guests} guests for{' '}
                {formatNgn(suggestedPackage.priceNgn)} — one line, already sized, and{' '}
                {formatNgn(savingsNgn(suggestedPackage))} cheaper than buying those bottles
                separately.
              </p>
            </div>
          )}

          {advice && (
            <p className="text-sm text-obsidian/60 leading-relaxed mb-7 whitespace-pre-wrap border border-obsidian/10 px-4 py-3 bg-paper">
              {advice}
            </p>
          )}

          <ul>
            {plan?.lines.map((line) => (
              <li key={line.slug} className="border-b border-obsidian/10">
                <div className="flex items-start justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <p className="font-medium text-base sm:text-sm truncate">{line.name}</p>
                    <p className="text-sm sm:text-xs sm:text-sm text-obsidian/55 mt-0.5">
                      {formatNgn(line.priceNgn)} / bottle
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setAdding(false);
                        setSwapSlug((s) => (s === line.slug ? null : line.slug));
                      }}
                      className={`mt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-[0.12em] ${
                        swapSlug === line.slug ? 'text-ember' : 'text-obsidian/45 hover:text-ember'
                      }`}
                    >
                      <ArrowLeftRight size={12} /> {swapSlug === line.slug ? 'Close' : 'Swap'}
                    </button>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="inline-flex items-center border border-obsidian/10">
                      <button
                        type="button"
                        aria-label={`Fewer ${line.name}`}
                        onClick={() => setLineQty(line.slug, line.qty - 1)}
                        className="p-1.5 text-obsidian/45 hover:text-obsidian"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={MAX_LINE_QTY}
                        value={line.qty}
                        onChange={(e) => setLineQty(line.slug, Number(e.target.value || 0))}
                        aria-label={`${line.name} quantity`}
                        className="w-12 text-center text-sm font-semibold bg-transparent border-0 p-0 focus:ring-0"
                      />
                      <button
                        type="button"
                        aria-label={`More ${line.name}`}
                        onClick={() => setLineQty(line.slug, line.qty + 1)}
                        className="p-1.5 text-obsidian/45 hover:text-obsidian"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="text-base sm:text-sm font-semibold text-obsidian mt-1">
                      {formatNgn(line.priceNgn * line.qty)}
                    </p>
                  </div>
                </div>
                {swapSlug === line.slug && (
                  <ShopPicker
                    preferCategory={line.category as DrinkCategory}
                    excludeSlug={line.slug}
                    title={`Swap ${line.name}`}
                    actionLabel="Use this"
                    onPick={(slug) => swapLine(line.slug, slug)}
                    onClose={() => setSwapSlug(null)}
                  />
                )}
              </li>
            ))}
            {!plan?.lines.length && (
              <li className="text-sm text-obsidian/45 py-3">Set a headcount to see a supply list.</li>
            )}
          </ul>

          <div className="mt-4">
            {adding ? (
              <ShopPicker
                title="Add from shop"
                actionLabel="Add"
                onPick={addFromShop}
                onClose={() => setAdding(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSwapSlug(null);
                  setAdding(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-[0.12em] text-obsidian/50 hover:text-ember"
              >
                <Plus size={14} /> Add from shop
              </button>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-obsidian/10 space-y-4">
            <button
              type="button"
              onClick={addPlanToCart}
              disabled={!plan?.lines.length}
              className="w-full px-5 py-3.5 btn-brand text-xs sm:text-sm font-black uppercase tracking-[0.14em] disabled:opacity-40"
            >
              Add supplies to cart
            </button>
            {shareInput && (
              <div>
                <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-obsidian/35 mb-3">
                  Share this list
                </p>
                <PlanShareActions input={shareInput} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (defaultOpen) {
    return <div id="party-planner-panel">{mobileBody}{body}</div>;
  }

  return (
    <div className="mb-10 bg-white border border-obsidian/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="party-planner-panel"
        className="w-full flex items-center gap-3 px-5 sm:px-6 py-4 text-left"
      >
        <span className="shrink-0 w-9 h-9 grid place-items-center bg-paper text-ember">
          <Users size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs sm:text-sm font-black uppercase tracking-[0.22em] text-ember">Drink supply planner</span>
          <span className="block text-sm text-obsidian/55 truncate">
            Size any event — we build the basket.
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-obsidian/40 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div id="party-planner-panel" className="border-t border-obsidian/10 p-5 sm:p-8">
          {mobileBody}{body}
        </div>
      )}
    </div>
  );
}

function ShopPicker({
  preferCategory,
  excludeSlug,
  title,
  actionLabel,
  onPick,
  onClose,
}: {
  preferCategory?: DrinkCategory;
  excludeSlug?: string;
  title: string;
  actionLabel: string;
  onPick: (slug: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DrinkCategory | 'all'>(preferCategory || 'all');

  const results = useMemo(() => {
    const base = query.trim() ? searchDrinks(query) : DRINKS;
    const filtered = base.filter((d) => {
      if (excludeSlug && d.slug === excludeSlug) return false;
      if (category !== 'all' && d.category !== category) return false;
      return true;
    });
    if (!preferCategory || category !== 'all' || query.trim()) return filtered.slice(0, 40);
    const preferred = filtered.filter((d) => d.category === preferCategory);
    const rest = filtered.filter((d) => d.category !== preferCategory);
    return [...preferred, ...rest].slice(0, 40);
  }, [query, category, excludeSlug, preferCategory]);

  return (
    <div className="mb-3 border border-obsidian/10 bg-paper px-3 py-3">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-obsidian/50">{title}</p>
        <button type="button" onClick={onClose} aria-label="Close picker" className="p-1 text-obsidian/40 hover:text-obsidian">
          <X size={14} />
        </button>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the shop — Jameson, Moët, tonic…"
        className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2 bg-transparent mb-3"
        autoFocus
      />
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`px-2 py-1 text-xs sm:text-sm border ${
            category === 'all' ? 'border-ember text-ember' : 'border-obsidian/10 text-obsidian/45'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`px-2 py-1 text-xs sm:text-sm border ${
              category === c ? 'border-ember text-ember' : 'border-obsidian/10 text-obsidian/45'
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <ul className="max-h-56 overflow-y-auto divide-y divide-obsidian/10">
        {results.map((product: DrinkProduct) => (
          <li key={product.slug}>
            <button
              type="button"
              onClick={() => onPick(product.slug)}
              className="w-full flex items-center justify-between gap-3 py-2.5 text-left hover:bg-white/70 px-1"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-obsidian truncate">{product.name}</span>
                <span className="block text-xs sm:text-sm text-obsidian/40">
                  {CATEGORY_LABELS[product.category]} · {formatNgn(product.priceNgn)} / bottle
                </span>
              </span>
              <span className="shrink-0 text-xs sm:text-sm font-black uppercase tracking-[0.12em] text-ember">
                {actionLabel}
              </span>
            </button>
          </li>
        ))}
        {!results.length && (
          <li className="py-3 text-sm text-obsidian/45">No matches — try another search.</li>
        )}
      </ul>
    </div>
  );
}

function StepEyebrow({ n, title }: { n: number; title: string }) {
  return (
    <p className="flex items-baseline gap-3">
      <span className="text-xs sm:text-sm font-black uppercase tracking-[0.22em] text-ember">
        {String(n).padStart(2, '0')}
      </span>
      <span className="text-xs sm:text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-obsidian">{title}</span>
    </p>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs sm:text-sm font-black uppercase tracking-[0.14em] text-obsidian/35">{label}</dt>
      <dd className="text-xl sm:text-lg font-semibold text-obsidian mt-1">{value}</dd>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  sliderMax,
  step = 1,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  sliderMax?: number;
  step?: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  const rangeMax = sliderMax ?? max;
  const sliderValue = Math.min(value, rangeMax);

  function commit(raw: string) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    onChange(Math.max(min, Math.min(max, Math.round(n))));
  }

  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 mb-2">
        <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-obsidian/40">{label}</span>
        {suffix && (
          <span className="text-xs sm:text-sm text-obsidian/45">
            {value.toLocaleString()} {suffix}
          </span>
        )}
      </span>
      <input
        type="range"
        className="plan-slider w-full"
        min={min}
        max={rangeMax}
        step={step}
        value={sliderValue}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => commit(e.target.value)}
        className={`${inputClass} mt-1`}
      />
      {sliderMax && value > sliderMax && (
        <span className="block text-xs sm:text-sm text-obsidian/40 mt-1">
          Type any number up to {max.toLocaleString()} — the slider covers up to {sliderMax.toLocaleString()}.
        </span>
      )}
    </label>
  );
}
