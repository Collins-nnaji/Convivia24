'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, PartyPopper, Save, Sparkles, Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { recommendDrinks, VIBE_LABELS, type PartyVibe, type DrinkPlan } from '@/lib/party/drinks-plan';
import { formatNgn } from '@/lib/drinks/catalog';

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

const inputClass =
  'w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2 bg-transparent';

const OCCASIONS = ['House party', 'Birthday', 'Club table', 'Wedding after-party', 'Corporate', 'Chill hangout'];

/**
 * In-shop party planning tool. Collapsed by default; expands into an
 * AI-assisted basket builder that drops straight into the cart.
 */
export default function PartyPlanner({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const router = useRouter();
  const { addProduct } = useCart();
  const [open, setOpen] = useState(defaultOpen);
  const [guests, setGuests] = useState(40);
  const [hours, setHours] = useState(5);
  const [budget, setBudget] = useState(250000);
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

  useEffect(() => {
    setPlan(recommendDrinks({ guests, hours, vibe, budgetNgn: budget }));
  }, [guests, hours, vibe, budget]);

  useEffect(() => {
    if (!open) return;
    fetch('/api/parties')
      .then((r) => (r.ok ? r.json() : { parties: [] }))
      .then((data) => setParties(data.parties || []))
      .catch(() => {});
  }, [open]);

  async function saveParty() {
    if (!partyName.trim()) {
      setMsg('Give the party a name before saving.');
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
          budgetNgn: budget,
          plan,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || 'Could not save the party.');
        return;
      }
      setPartyId(data.party.id);
      setParties((rows) => {
        const without = rows.filter((r) => r.id !== data.party.id);
        return [data.party, ...without];
      });
      setMsg(`Saved “${data.party.name}”.`);
    } catch {
      setMsg('Could not save the party.');
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
    if (party.budgetNgn != null) setBudget(party.budgetNgn);
    if (party.plan) setPlan(party.plan);
    setAdvice('');
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
      setMsg('Could not delete the party.');
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
        body: JSON.stringify({ guests, hours, vibe, budgetNgn: budget, occasion, question }),
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

  function addPlanToCart() {
    if (!plan?.lines.length) return;
    for (const line of plan.lines) addProduct(line.slug, line.qty);
    router.push('/cart');
  }

  return (
    <div className="mb-10 bg-white border border-obsidian/10 shadow-[0_12px_40px_-24px_rgba(10,10,10,0.35)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="party-planner-panel"
        className="w-full flex items-center gap-3 px-5 sm:px-6 py-4 text-left"
      >
        <span className="shrink-0 w-9 h-9 grid place-items-center bg-paper text-ember">
          <PartyPopper size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-ember">Party planning tool</span>
          <span className="block text-sm text-obsidian/55 truncate">
            Tell us the night — we size the bar and build the basket.
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-obsidian/40 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div id="party-planner-panel" className="border-t border-obsidian/10 p-5 sm:p-6 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Guests" value={guests} onChange={setGuests} min={4} max={800} />
              <NumberField label="Hours" value={hours} onChange={setHours} min={2} max={12} />
            </div>
            <NumberField label="Budget (NGN)" value={budget} onChange={setBudget} min={0} step={10000} />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Occasion" value={occasion} onChange={setOccasion} options={OCCASIONS.map((o) => [o, o])} />
              <SelectField
                label="Vibe"
                value={vibe}
                onChange={(v) => setVibe(v as PartyVibe)}
                options={Object.entries(VIBE_LABELS)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                  Party name
                </span>
                <input
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="Ada's rooftop"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                  Date
                </span>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputClass} />
              </label>
            </div>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">Venue</span>
              <input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Lumen Lounge / home address"
                className={inputClass}
              />
            </label>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                Anything else? (optional)
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={2}
                placeholder="Mostly cognac drinkers, outdoor, no red wine…"
                className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2 bg-transparent resize-y"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={askAi}
                disabled={thinking}
                className="inline-flex items-center gap-2 px-5 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
              >
                <Sparkles size={14} /> {thinking ? 'Planning…' : 'Plan my party'}
              </button>
              <button
                type="button"
                onClick={saveParty}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-3 border border-obsidian/15 text-[11px] font-black uppercase tracking-[0.12em] disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Saving…' : partyId ? 'Update party' : 'Save party'}
              </button>
              {partyId && (
                <button
                  type="button"
                  onClick={newParty}
                  className="px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/45 hover:text-obsidian"
                >
                  New
                </button>
              )}
            </div>
            {msg && <p className="text-sm text-ember">{msg}</p>}

            {parties.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-2">Your parties</p>
                <ul className="space-y-1.5">
                  {parties.map((party) => (
                    <li key={party.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => loadParty(party)}
                        className={`flex-1 min-w-0 text-left px-3 py-2 border text-sm transition-colors ${
                          partyId === party.id ? 'border-ember text-ember' : 'border-obsidian/10 hover:border-obsidian/25'
                        }`}
                      >
                        <span className="block truncate font-medium">{party.name}</span>
                        <span className="block text-[11px] text-obsidian/40 truncate">
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
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-obsidian/35">Suggested basket</p>
                <p className="text-3xl font-bold brand-text mt-1">{plan ? formatNgn(plan.totalNgn) : '—'}</p>
                <p className="text-sm text-obsidian/45 mt-1">
                  ~{plan?.drinksPerGuest ?? '—'} pours / guest · {plan?.servingsEstimate ?? '—'} servings
                </p>
                {plan && budget > 0 && plan.totalNgn > budget && (
                  <p className="text-[11px] text-ember mt-1">
                    Over your {formatNgn(budget)} budget — one of each is already this much. Drop guests, hours, or
                    switch vibe.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={addPlanToCart}
                disabled={!plan?.lines.length}
                className="px-5 py-3 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40"
              >
                Add basket to cart
              </button>
            </div>

            {advice && (
              <p className="text-sm text-obsidian/60 leading-relaxed mb-5 whitespace-pre-wrap">{advice}</p>
            )}

            <ul className="space-y-3">
              {plan?.lines.map((line) => (
                <li key={line.slug} className="flex justify-between gap-4 border-b border-obsidian/10 pb-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{line.name}</p>
                    <p className="text-[11px] text-obsidian/40">{line.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">×{line.qty}</p>
                    <p className="text-xs text-obsidian/45">{formatNgn(line.priceNgn * line.qty)}</p>
                  </div>
                </li>
              ))}
              {!plan?.lines.length && (
                <li className="text-sm text-obsidian/45">Set a headcount to see a basket.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2 bg-transparent"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2 bg-transparent"
      >
        {options.map(([id, text]) => (
          <option key={id} value={id}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
