'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarPlus, LineChart, Package } from 'lucide-react';
import ConviviumCard from '@/components/ConviviumCard';
import { joinPartner } from '@/lib/partners/store';
import { VENUE_KINDS } from '@/lib/partners/pricing';

const PILLARS = [
  {
    icon: Package,
    title: 'Bulk purchase',
    body: 'Buy cases and Party Packs at partner rates. Restock the room the same night — not a storeroom you do not have.',
  },
  {
    icon: CalendarPlus,
    title: 'Upload your events',
    body: 'List nights at your outlet on the Convivia board. Guests find you, RSVP, and order drinks to the table.',
  },
  {
    icon: LineChart,
    title: 'Menu margin desk',
    body: 'Price every bottle against your own cost: pour cost, target-margin price, profit per bottle, and what wholesale would save you each month.',
  },
];

export default function PartnersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** Open the desk: create the outlet record, then drop straight into the tool. */
  async function onboard(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const payload = {
      venueName: String(fd.get('venue') || ''),
      email: String(fd.get('email') || ''),
      contact: String(fd.get('name') || ''),
      area: String(fd.get('area') || ''),
      venueKind: String(fd.get('venueKind') || 'lounge'),
      seats: fd.get('seats') ? Number(fd.get('seats')) : null,
      targetMarginPct: fd.get('targetMarginPct') ? Number(fd.get('targetMarginPct')) : 72,
    };

    try {
      const res = await fetch('/api/partners/outlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not open the desk.');
        return;
      }
      // Keep the local partner session in step so the portal opens signed in.
      joinPartner({
        venueName: payload.venueName,
        email: payload.email,
        area: payload.area,
        contact: payload.contact,
      });
      router.push('/partners/portal?tab=pricing');
    } catch {
      setError('Could not open the desk.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="relative overflow-hidden border-b border-obsidian/8">
        <div className="absolute inset-0 brand-gradient opacity-[0.08]" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-12 pb-10 sm:pt-16 sm:pb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-3">Partners</p>
          <h1 className="font-logo font-black tracking-tight uppercase text-3xl sm:text-5xl text-obsidian leading-[0.95] mb-4">
            Bulk buy. <span className="brand-text">List nights.</span>
          </h1>
          <p className="text-base sm:text-lg text-obsidian/55 max-w-xl leading-relaxed">
            For outlets that purchase with us and put their events on the board. Your Convivium card is the
            partner record — perks accumulate on every purchase.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white p-6 sm:p-8 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
              <Icon size={22} className="text-ember mb-4" strokeWidth={1.8} />
              <h2 className="font-logo font-extrabold uppercase tracking-tight text-xl text-obsidian mb-2">
                {title}
              </h2>
              <p className="text-base text-obsidian/55 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-16">
          <div className="lg:col-span-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-ember mb-3">Convivium card</p>
            <h2 className="font-logo font-black uppercase tracking-tight text-2xl sm:text-3xl text-obsidian mb-4">
              Partner records, not guest perks
            </h2>
            <p className="text-base text-obsidian/55 leading-relaxed mb-6">
              Each outlet gets a Convivium Premium card on file. Wholesale and bulk spend banks points. Those
              perks stay on the partner account — ready for gift cards and room benefits when invite signup
              opens.
            </p>
            <ConviviumCard kind="premium" tier="Premium" name="YOUR OUTLET" points={12500} />
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-ember mb-2">Open your desk</p>
              <h2 className="font-bold text-xl text-obsidian mb-2">Outlet sign-up</h2>
              <p className="text-base text-obsidian/55 leading-relaxed mb-6">
                Takes a minute. You get the wholesale desk, event uploads, your Convivium Premium record, and the
                menu margin tool — priced against your own costs.
              </p>

              <form onSubmit={onboard} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Your name" name="name" required />
                  <Field label="Email" name="email" type="email" required />
                </div>
                <Field label="Venue / outlet" name="venue" required />
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Area" name="area" placeholder="Victoria Island, Lekki…" required />
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                      Room type
                    </label>
                    <select
                      name="venueKind"
                      className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2 bg-transparent capitalize"
                    >
                      {VENUE_KINDS.map((kind) => (
                        <option key={kind} value={kind}>
                          {kind}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Covers / seats" name="seats" type="number" placeholder="120" />
                  <Field label="Target margin %" name="targetMarginPct" type="number" placeholder="72" />
                </div>
                {error && <p className="text-sm text-ember">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-3.5 btn-brand text-[12px] font-black uppercase tracking-[0.14em] disabled:opacity-60"
                >
                  {loading ? 'Opening…' : 'Open my desk'}
                </button>
              </form>
            </div>

            <p className="mt-6 text-sm text-obsidian/45">
              Already onboarded?{' '}
              <Link href="/partners/portal" className="inline-flex items-center gap-1 text-ember font-semibold">
                Open the portal <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
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
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1.5">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-base py-2.5"
      />
    </div>
  );
}
