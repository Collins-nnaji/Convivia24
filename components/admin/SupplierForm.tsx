'use client';

import { FormEvent, useState } from 'react';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/drinks/catalog';
import { LAGOS_AREAS } from '@/lib/geo/lagos';
import type { Supplier, SupplierInput } from '@/lib/suppliers/repo';
import { AdminInput, AdminTextArea } from './ui/Fields';

const AREA_NAMES = LAGOS_AREAS.map((a) => a.name);

const EMPTY: SupplierInput = {
  name: '',
  contactName: '',
  phone: '',
  email: '',
  city: 'Lagos',
  areas: [],
  categories: [],
  sameDay: false,
  notes: '',
  active: true,
};

function toggle(list: string[] | undefined, value: string): string[] {
  const l = list || [];
  return l.includes(value) ? l.filter((v) => v !== value) : [...l, value];
}

/** Create and edit share one form — every field the supplier record has, not a subset. */
export default function SupplierForm({
  initial,
  saving,
  onSubmit,
  onCancel,
}: {
  initial?: Supplier | null;
  saving: boolean;
  onSubmit: (input: SupplierInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<SupplierInput>(
    initial
      ? {
          name: initial.name,
          contactName: initial.contactName || '',
          phone: initial.phone || '',
          email: initial.email || '',
          city: initial.city,
          areas: initial.areas,
          categories: initial.categories,
          sameDay: initial.sameDay,
          notes: initial.notes || '',
          active: initial.active,
        }
      : EMPTY
  );
  const set = <K extends keyof SupplierInput>(k: K, v: SupplierInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  const chip = (on: boolean) =>
    `rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
      on ? 'border-ember bg-ember text-white' : 'border-obsidian/12 text-obsidian/55 hover:border-ember/40'
    }`;

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-obsidian/10 bg-white p-5">
      <h3 className="font-bold">{initial ? `Edit ${initial.name}` : 'New supplier'}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminInput label="Business name" required value={form.name} onChange={(e) => set('name', e.target.value)} className="sm:col-span-2" />
        <AdminInput label="Contact person" value={form.contactName || ''} onChange={(e) => set('contactName', e.target.value)} />
        <AdminInput label="Phone" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="+234…" />
        <AdminInput label="Email" hint="order alerts + portal login" type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
        <AdminInput label="City" value={form.city || ''} onChange={(e) => set('city', e.target.value)} />
      </div>
      <div>
        <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/45">
          Delivery areas <span className="font-normal normal-case tracking-normal text-obsidian/35">— none selected = anywhere in the city</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {AREA_NAMES.map((a) => (
            <button key={a} type="button" onClick={() => set('areas', toggle(form.areas, a))} className={chip(Boolean(form.areas?.includes(a)))}>
              {a}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/45">Categories they can fill</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => set('categories', toggle(form.categories, c))} className={chip(Boolean(form.categories?.includes(c)))}>
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-obsidian/70">
          <input type="checkbox" checked={form.sameDay === true} onChange={(e) => set('sameDay', e.target.checked)} className="rounded border-obsidian/30 text-ember focus:ring-ember" />
          Same-day delivery
        </label>
        {initial && (
          <label className="flex items-center gap-2 text-sm text-obsidian/70">
            <input type="checkbox" checked={form.active !== false} onChange={(e) => set('active', e.target.checked)} className="rounded border-obsidian/30 text-ember focus:ring-ember" />
            Active (routed orders, counted in shop stock)
          </label>
        )}
      </div>
      <AdminTextArea label="Notes" rows={2} value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="Pickup hours, account manager, terms…" />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-brand px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] disabled:opacity-50">
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Create supplier'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/45 hover:text-obsidian">
          Cancel
        </button>
      </div>
    </form>
  );
}
