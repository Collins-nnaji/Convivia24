'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Camera, CheckCircle2, MapPin, Phone } from 'lucide-react';

type Order = {
  ref: string;
  status: string;
  name: string;
  phone: string | null;
  address: string;
  notes: string | null;
  etaAt: string | null;
  rider: string | null;
  items: { name: string; qty: number }[];
};

/** What a rider sees from a delivery link: where to go, who to call, and one button to finish. */
export default function RiderDelivery({ token }: { token: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [photoUpload, setPhotoUpload] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    fetch(`/api/deliver/${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || 'This link does not work.');
        setOrder(data.order);
        setPhotoUpload(Boolean(data.photoUpload));
        if (data.order.status === 'delivered' || data.order.status === 'fulfilled') setDone(true);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'This link does not work.'));
  }, [token]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/deliver/${encodeURIComponent(token)}`, { method: 'POST', body: new FormData(e.currentTarget) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not mark it delivered. Try again.');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not mark it delivered.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f3ef] px-4 py-6 text-obsidian">
      <div className="mx-auto max-w-md space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ember">Convivia24 delivery</p>

        {!order && !error && <p className="text-sm text-obsidian/60">Loading delivery…</p>}
        {error && !order && <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        {order && (
          <>
            <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-obsidian/10">
              <p className="font-mono text-xs font-bold text-obsidian/60">Order #{order.ref}</p>
              <h1 className="mt-1 text-2xl font-bold">{order.name}</h1>
              <p className="mt-2 flex items-start gap-2 text-[15px]">
                <MapPin size={18} className="mt-0.5 shrink-0 text-ember" /> {order.address}
              </p>
              {order.notes && <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">Note: {order.notes}</p>}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {order.phone && (
                  <a href={`tel:${order.phone}`} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-obsidian text-sm font-bold text-white">
                    <Phone size={16} /> Call
                  </a>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-12 items-center justify-center gap-2 rounded-lg border border-obsidian/20 bg-white text-sm font-bold"
                >
                  <MapPin size={16} /> Directions
                </a>
              </div>
            </section>

            <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-obsidian/10">
              <h2 className="text-sm font-bold">In the bag</h2>
              <ul className="mt-2 divide-y divide-obsidian/10 text-[15px]">
                {order.items.map((i, idx) => (
                  <li key={idx} className="flex justify-between py-1.5">
                    <span>{i.name}</span>
                    <strong className="tabular-nums">×{i.qty}</strong>
                  </li>
                ))}
              </ul>
            </section>

            {done ? (
              <section className="rounded-xl bg-emerald-600 p-5 text-center text-white">
                <CheckCircle2 size={40} className="mx-auto" />
                <p className="mt-2 text-lg font-bold">Delivered — thank you!</p>
                <p className="text-sm text-white/85">The desk and the customer have been updated.</p>
              </section>
            ) : order.status !== 'out_for_delivery' ? (
              <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                This order hasn&apos;t been dispatched yet. Once the desk sends it out, this page lets you mark it delivered.
              </p>
            ) : (
              <form onSubmit={submit} className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-obsidian/10">
                <h2 className="text-sm font-bold">Hand-over</h2>
                <label className="block text-sm font-semibold">
                  Who received it?
                  <input name="receivedBy" required maxLength={120} placeholder="Full name" className="mt-1 h-12 w-full rounded-lg border border-obsidian/25 px-3 text-base" />
                </label>
                <label className="flex items-start gap-3 rounded-lg border border-obsidian/20 bg-[#faf8f5] p-3 text-[15px]">
                  <input type="checkbox" name="ageChecked" value="yes" required className="mt-1 h-5 w-5" />
                  <span>
                    <strong>I checked ID — they are 18 or older.</strong> Do not hand over alcohol otherwise.
                  </span>
                </label>
                {photoUpload && (
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-obsidian/30 p-3 text-sm font-semibold">
                    <Camera size={20} />
                    {preview ? 'Photo added — tap to change' : 'Add a photo (optional)'}
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={(e) => setPreview(e.target.files?.[0]?.name || '')}
                    />
                  </label>
                )}
                {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
                <button type="submit" disabled={busy} className="h-14 w-full rounded-lg bg-emerald-600 text-base font-bold text-white disabled:opacity-50">
                  {busy ? 'Saving…' : 'Mark delivered'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}
