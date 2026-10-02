'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { LAUNCH_CITIES } from '@/lib/delivery/policy';
import { formatNgn } from '@/lib/drinks/catalog';
type Zone = { id: string; city: string; name: string; fee_ngn: number; estimate: string; active: boolean };
type Provider = { id: string; name: string; contact: string; active: boolean };
export default function DeliveryDesk() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try { const res = await fetch('/api/admin/delivery'); const data = await res.json(); if (!res.ok) throw new Error(data.error); setZones(data.zones); setProviders(data.providers); }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Could not load settings.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    await submit({ ...Object.fromEntries(data), active: data.get('active') === 'on' });
  }
  async function submit(body: Record<string, unknown>) {
    setBusy(true); setMessage('');
    try { const res = await fetch('/api/admin/delivery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); await load(); setMessage('Saved.'); }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Could not save.'); }
    finally { setBusy(false); }
  }
  const field = 'rounded-lg border border-obsidian/15 px-3 py-2 text-sm';
  return <div className="space-y-8">
    <p className="text-sm text-obsidian/60">Configure delivery areas and fees before enabling checkout. Staff book with their chosen courier and record tracking on the order.</p>
    <p role="status">{message}</p>
    <section className="rounded-xl bg-white p-5 space-y-4"><h3 className="text-lg font-bold">Delivery zones</h3>
      <form onSubmit={save} className="flex flex-wrap gap-3 items-center"><input type="hidden" name="kind" value="zone" />
        <select aria-label="City" name="city" className={field}>{LAUNCH_CITIES.map(city => <option key={city}>{city}</option>)}</select>
        <input className={field} name="name" aria-label="Zone name" placeholder="Zone name" required maxLength={100} />
        <input className={field} name="feeNgn" aria-label="Delivery fee in naira" placeholder="Fee (NGN)" type="number" min={0} step={1} required />
        <input className={field} name="estimate" aria-label="Delivery estimate" placeholder="Delivery estimate" required />
        <label className="text-sm"><input name="active" type="checkbox" /> Enable</label><button disabled={busy} className="btn-brand px-4 py-2">Save zone</button>
      </form>
      {zones.length === 0 && <p className="text-sm">No zones configured. Checkout will remain unavailable until a zone is enabled.</p>}
      {zones.map(zone => <div key={zone.id} className="flex flex-wrap justify-between gap-2 border-t py-3"><span>{zone.city} · {zone.name} · {formatNgn(Number(zone.fee_ngn))} · {zone.estimate}</span><button disabled={busy} onClick={() => submit({ kind: 'zone', city: zone.city, name: zone.name, feeNgn: Number(zone.fee_ngn), estimate: zone.estimate, active: !zone.active })}>{zone.active ? 'Disable' : 'Enable'}</button></div>)}
    </section>
    <section className="rounded-xl bg-white p-5 space-y-4"><h3 className="text-lg font-bold">Courier providers</h3>
      <form onSubmit={save} className="flex flex-wrap gap-3 items-center"><input type="hidden" name="kind" value="provider" /><input className={field} name="name" aria-label="Provider name" placeholder="Provider name" required /><input className={field} name="contact" aria-label="Provider contact" placeholder="Phone or booking contact" /><label className="text-sm"><input name="active" type="checkbox" defaultChecked /> Enable</label><button disabled={busy} className="btn-brand px-4 py-2">Save provider</button></form>
      {providers.map(provider => <div key={provider.id} className="flex justify-between gap-3 border-t py-3"><span>{provider.name} · {provider.contact}</span><button disabled={busy} onClick={() => submit({ kind: 'provider', name: provider.name, contact: provider.contact, active: !provider.active })}>{provider.active ? 'Disable' : 'Enable'}</button></div>)}
    </section>
  </div>;
}
