'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, Mail, Package, Store, Truck } from 'lucide-react';
import { VENUE_KINDS } from '@/lib/partners/pricing';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/site';

type Tier = 'outlet' | 'brand';

const OUTLET_INTERESTS = [
  { id: 'wholesale', label: 'Wholesale & bulk restock' },
  { id: 'events', label: 'List events on Convivia' },
  { id: 'margin', label: 'Menu margin desk' },
  { id: 'delivery', label: 'Same-night delivery to the room' },
];

const BRAND_CATEGORIES = [
  { id: 'spirits', label: 'Spirits' },
  { id: 'whisky', label: 'Whisky' },
  { id: 'cognac', label: 'Cognac' },
  { id: 'vodka', label: 'Vodka' },
  { id: 'tequila', label: 'Tequila' },
  { id: 'wine', label: 'Wine' },
  { id: 'champagne', label: 'Champagne' },
  { id: 'rtd', label: 'RTDs & canned cocktails' },
  { id: 'beer', label: 'Beer & cider' },
  { id: 'mixers', label: 'Mixers' },
  { id: 'other', label: 'Other' },
];

export default function ContactPage() {
  const [tier, setTier] = useState<Tier>('outlet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  async function submitApplication(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    const fd = new FormData(e.currentTarget);
    const base = {
      kind: tier,
      contactName: String(fd.get('contactName') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || '') || null,
      notes: String(fd.get('notes') || '') || null,
    };

    let body: Record<string, unknown>;

    if (tier === 'outlet') {
      body = {
        ...base,
        companyName: String(fd.get('companyName') || ''),
        area: String(fd.get('area') || ''),
        venueKind: String(fd.get('venueKind') || 'lounge'),
        seats: fd.get('seats') ? Number(fd.get('seats')) : null,
        interests: OUTLET_INTERESTS.map((i) => i.id).filter((id) => fd.get(`interest-${id}`) === 'on'),
      };
    } else {
      body = {
        ...base,
        companyName: String(fd.get('companyName') || ''),
        website: String(fd.get('website') || '') || null,
        regions: String(fd.get('regions') || ''),
        skuEstimate: String(fd.get('skuEstimate') || '') || null,
        categories: BRAND_CATEGORIES.map((c) => c.id).filter((id) => fd.get(`cat-${id}`) === 'on'),
      };
    }

    try {
      const res = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not send message.');
        return;
      }
      setSuccess(data.message || 'Message sent — we will be in touch.');
      e.currentTarget.reset();
    } catch {
      setError('Could not send message.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-paper min-h-[70vh] pb-20 md:pb-14">
      <div className="relative overflow-hidden border-b border-obsidian/8">
        <div className="absolute inset-0 brand-gradient opacity-[0.07]" />
        <div className="relative max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 pt-10 pb-10 sm:pt-14 sm:pb-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-ember mb-3">Contact</p>
              <h1 className="font-wordmark text-3xl sm:text-4xl md:text-5xl text-obsidian mb-4 leading-tight">
                Get in touch
              </h1>
              <p className="text-base sm:text-lg text-obsidian/60 leading-relaxed">
                Orders, general questions, outlet wholesale, or brand distribution — email us directly or use
                the form below for outlets and brands.
              </p>
            </div>
            <a
              href={SUPPORT_MAILTO}
              className="inline-flex items-center gap-3 rounded-2xl border border-ember/20 bg-white px-5 py-4 shadow-sm hover:border-ember/40 transition-colors shrink-0"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ember/10 text-ember">
                <Mail size={20} />
              </span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-[0.14em] text-obsidian/45 mb-0.5">
                  Email us
                </span>
                <span className="block text-base sm:text-lg font-semibold text-obsidian">{SUPPORT_EMAIL}</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 py-10 sm:py-14">
        <p className="text-sm font-semibold text-obsidian/50 uppercase tracking-[0.12em] mb-6">
          Outlets & brands
        </p>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <TierCard
              active={tier === 'outlet'}
              onClick={() => {
                setTier('outlet');
                setSuccess(null);
                setError('');
              }}
              icon={Store}
              title="I'm an outlet"
              body="Clubs, lounges, bars, and event spaces — wholesale bottles, same-night restock, event listings, and a menu margin desk. Two weeks credit when your agreement is signed."
            />
            <TierCard
              active={tier === 'brand'}
              onClick={() => {
                setTier('brand');
                setSuccess(null);
                setError('');
              }}
              icon={Building2}
              title="I'm a brand"
              body="Spirit houses, importers, and producers — enquire about Convivia24 distributing your portfolio nationwide."
            />
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-obsidian/10 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex gap-2 mb-6 p-1 rounded-xl bg-paper/80">
                <button
                  type="button"
                  onClick={() => {
                    setTier('outlet');
                    setSuccess(null);
                    setError('');
                  }}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    tier === 'outlet' ? 'bg-obsidian text-white' : 'text-obsidian/60 hover:text-obsidian'
                  }`}
                >
                  Outlet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTier('brand');
                    setSuccess(null);
                    setError('');
                  }}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    tier === 'brand' ? 'bg-obsidian text-white' : 'text-obsidian/60 hover:text-obsidian'
                  }`}
                >
                  Brand
                </button>
              </div>

              {success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="shrink-0 text-emerald-600 mt-0.5" size={22} />
                    <div>
                      <p className="font-semibold text-obsidian mb-1">Message received</p>
                      <p className="text-sm text-obsidian/65 leading-relaxed">{success}</p>
                      <button
                        type="button"
                        onClick={() => setSuccess(null)}
                        className="mt-4 text-sm font-semibold text-ember"
                      >
                        Send another
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form key={tier} onSubmit={submitApplication} className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-obsidian mb-1">
                      {tier === 'outlet' ? 'Outlet enquiry' : 'Brand enquiry'}
                    </h2>
                    <p className="text-sm text-obsidian/55">
                      {tier === 'outlet'
                        ? 'Tell us about your room — approved outlets get two weeks credit once the agreement is signed.'
                        : 'Tell us about your portfolio — our team reviews distribution fit and compliance.'}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Your name" name="contactName" required placeholder="Ada Okafor" />
                    <Field label="Email" name="email" type="email" required placeholder="you@venue.com" />
                  </div>
                  <Field label="Phone" name="phone" type="tel" placeholder="+234…" />
                  <Field
                    label={tier === 'outlet' ? 'Venue / outlet name' : 'Brand name'}
                    name="companyName"
                    required
                    placeholder={tier === 'outlet' ? 'Harbour House' : 'Your brand'}
                  />

                  {tier === 'outlet' ? (
                    <>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <Field label="Area" name="area" required placeholder="Victoria Island, Lekki…" />
                        <div>
                          <label className="text-xs font-bold uppercase tracking-[0.14em] text-obsidian/45 block mb-1.5">
                            Room type
                          </label>
                          <select
                            name="venueKind"
                            className="w-full rounded-lg border border-obsidian/12 bg-white px-3 py-2.5 text-base capitalize focus:border-ember focus:ring-0"
                          >
                            {VENUE_KINDS.map((kind) => (
                              <option key={kind} value={kind}>
                                {kind}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <Field label="Covers / seats (optional)" name="seats" type="number" placeholder="120" />
                      <fieldset>
                        <legend className="text-xs font-bold uppercase tracking-[0.14em] text-obsidian/45 mb-3">
                          Interested in
                        </legend>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {OUTLET_INTERESTS.map(({ id, label }) => (
                            <label
                              key={id}
                              className="flex items-center gap-2.5 rounded-lg border border-obsidian/10 px-3 py-2.5 text-sm text-obsidian/75 cursor-pointer hover:border-ember/30"
                            >
                              <input type="checkbox" name={`interest-${id}`} className="accent-ember" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </>
                  ) : (
                    <>
                      <Field label="Website (optional)" name="website" type="url" placeholder="https://…" />
                      <Field
                        label="Markets / regions"
                        name="regions"
                        required
                        placeholder="Lagos, Abuja, nationwide…"
                      />
                      <Field
                        label="Portfolio size (optional)"
                        name="skuEstimate"
                        placeholder="e.g. 12 SKUs in Nigeria"
                      />
                      <fieldset>
                        <legend className="text-xs font-bold uppercase tracking-[0.14em] text-obsidian/45 mb-3">
                          Product categories
                        </legend>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {BRAND_CATEGORIES.map(({ id, label }) => (
                            <label
                              key={id}
                              className="flex items-center gap-2 rounded-lg border border-obsidian/10 px-3 py-2 text-sm text-obsidian/75 cursor-pointer hover:border-ember/30"
                            >
                              <input type="checkbox" name={`cat-${id}`} className="accent-ember" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </>
                  )}

                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.14em] text-obsidian/45 block mb-1.5">
                      Message
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Anything else we should know…"
                      className="w-full rounded-lg border border-obsidian/12 px-3 py-2.5 text-base focus:border-ember focus:ring-0 resize-y"
                    />
                  </div>

                  {error && <p className="text-sm text-ember">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-7 py-3.5 btn-brand text-sm font-wordmark-sm disabled:opacity-60"
                  >
                    {loading ? 'Sending…' : 'Send enquiry'}
                    {!loading && <ArrowRight size={15} />}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              <MiniPillar icon={Package} title="Wholesale" body="Cases and party packs at partner rates." />
              <MiniPillar icon={Truck} title="Distribution" body="Nationwide delivery into events and homes." />
              <MiniPillar icon={Store} title="Discovery" body="Shop, packages, and planner reach." />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TierCard({
  active,
  onClick,
  icon: Icon,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Store;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-5 sm:p-6 transition-all ${
        active
          ? 'border-ember/35 bg-ember/[0.05] shadow-sm ring-1 ring-ember/15'
          : 'border-obsidian/10 bg-white hover:border-obsidian/20'
      }`}
    >
      <Icon size={22} className={`mb-3 ${active ? 'text-ember' : 'text-obsidian/40'}`} strokeWidth={1.8} />
      <h2 className="font-semibold text-lg text-obsidian mb-2">{title}</h2>
      <p className="text-sm text-obsidian/55 leading-relaxed">{body}</p>
    </button>
  );
}

function MiniPillar({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Store;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-obsidian/8 bg-white/80 p-4">
      <Icon size={18} className="text-ember mb-2" />
      <p className="text-sm font-semibold text-obsidian mb-1">{title}</p>
      <p className="text-xs text-obsidian/50 leading-relaxed">{body}</p>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-[0.14em] text-obsidian/45 block mb-1.5">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-obsidian/12 px-3 py-2.5 text-base focus:border-ember focus:ring-0"
      />
    </div>
  );
}
