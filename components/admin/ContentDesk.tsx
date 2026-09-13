'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import { useDialogs } from './ui/DialogProvider';
import { AdminInput, AdminSelect, AdminTextArea } from './ui/Fields';
import Modal from './ui/Modal';
import { readError, formatWhen } from './types';

/**
 * Events, brand campaigns and venues — the public pages read these; until now they were edited
 * in the database by hand. Three panes, one shape each: a list with publish toggles, and a modal
 * form for create/edit.
 */

type Pane = 'events' | 'campaigns' | 'venues';

type EventRow = { id: string; title: string; venueSlug: string; tag: string; blurb: string; expected: string; coverNgn?: number; startsAtIso: string; endsAtIso: string; published: boolean; venue?: { name: string } };
type VenueOption = { slug: string; name: string };
type Task = { id: string; title: string; detail: string; points: number };
type CampaignRow = { id: string; slug: string; brandSlug: string; title: string; tagline: string | null; blurb: string | null; entryPoints: number; rewardPoints: number; topReward: string | null; tasks: Task[]; rules: string[]; startsAt: string; endsAt: string | null; published: boolean; live: boolean; daysLeft: number | null };
type Claim = { id: string; brandName: string; contactName: string; email: string; phone: string | null; role: string | null; message: string | null; status: 'pending' | 'verified' | 'approved' | 'rejected'; createdAt: string };
type VenueRow = { id: string; slug: string; name: string; kind: string; areaId: string; area: string; address: string; tagline: string; about: string; hours: string; coverNgn: number | null; cardPerk: string; cardDiscountPct: number; phone: string | null; instagram: string | null; website: string | null; status: 'pending' | 'active' | 'suspended'; source: string; followerCount: number; reviewCount: number };
type Area = { id: string; name: string };

const VENUE_KINDS = ['club', 'lounge', 'rooftop', 'beach', 'live', 'restaurant', 'bar'];

function toLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
const toIso = (local: string) => (local ? new Date(local).toISOString() : '');
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

export default function ContentDesk({ onChanged }: { onChanged?: () => void }) {
  const [pane, setPane] = useState<Pane>('events');
  return (
    <div className="space-y-5">
      <div className="flex gap-1 border-b border-obsidian/10">
        {(['events', 'campaigns', 'venues'] as Pane[]).map((p) => (
          <button key={p} type="button" onClick={() => setPane(p)} className={`-mb-px border-b-2 px-3 py-2 text-xs font-bold capitalize ${pane === p ? 'border-ember text-ember' : 'border-transparent text-obsidian/50 hover:text-obsidian'}`}>
            {p}
          </button>
        ))}
      </div>
      {pane === 'events' && <EventsPane onChanged={onChanged} />}
      {pane === 'campaigns' && <CampaignsPane onChanged={onChanged} />}
      {pane === 'venues' && <VenuesPane onChanged={onChanged} />}
    </div>
  );
}

/* ── Events ─────────────────────────────────────────────────────── */

const EMPTY_EVENT = { id: '', title: '', venueSlug: '', tag: 'Lounge', blurb: '', expected: '', coverNgn: '', startsAt: '', endsAt: '', published: true };

function EventsPane({ onChanged }: { onChanged?: () => void }) {
  const { confirm, notify } = useDialogs();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [form, setForm] = useState<typeof EMPTY_EVENT | null>(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/events');
    const data = await res.json().catch(() => ({}));
    setEvents(data.events || []);
    setTags(data.tags || []);
    setVenues(data.venues || []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy('save');
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: form.id || undefined, coverNgn: form.coverNgn === '' ? null : Number(form.coverNgn), startsAtIso: toIso(form.startsAt), endsAtIso: toIso(form.endsAt) }),
      });
      if (!res.ok) {
        notify(await readError(res, 'Could not save the event.'), 'error');
        return;
      }
      notify(form.id ? 'Event updated.' : 'Event created.');
      setForm(null);
      await load();
      onChanged?.();
    } finally {
      setBusy('');
    }
  }

  async function togglePublished(ev: EventRow) {
    setBusy(ev.id);
    try {
      const res = await fetch('/api/admin/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ev.id, published: !ev.published }) });
      if (!res.ok) notify(await readError(res, 'Could not update.'), 'error');
      await load();
    } finally {
      setBusy('');
    }
  }

  async function remove(ev: EventRow) {
    if (!(await confirm({ title: `Delete “${ev.title}”?`, message: 'It disappears from the events feed. RSVPs stay on record.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    const res = await fetch(`/api/admin/events?id=${encodeURIComponent(ev.id)}`, { method: 'DELETE' });
    if (!res.ok) notify(await readError(res, 'Could not delete.'), 'error');
    await load();
  }

  const set = <K extends keyof typeof EMPTY_EVENT>(k: K, v: (typeof EMPTY_EVENT)[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const upcoming = events.filter((e) => new Date(e.endsAtIso) >= new Date());
  const past = events.filter((e) => new Date(e.endsAtIso) < new Date());

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-obsidian/50">{upcoming.length} upcoming · {past.length} past</p>
        <button type="button" onClick={() => setForm({ ...EMPTY_EVENT, venueSlug: venues[0]?.slug || '' })} className="btn-brand inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em]">
          <Plus size={13} /> New event
        </button>
      </div>
      <EventList rows={upcoming} busy={busy} onEdit={(ev) => setForm({ id: ev.id, title: ev.title, venueSlug: ev.venueSlug, tag: ev.tag, blurb: ev.blurb, expected: ev.expected, coverNgn: ev.coverNgn != null ? String(ev.coverNgn) : '', startsAt: toLocal(ev.startsAtIso), endsAt: toLocal(ev.endsAtIso), published: ev.published })} onToggle={togglePublished} onDelete={remove} />
      {past.length > 0 && (
        <details className="rounded-xl border border-obsidian/10 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-obsidian/60">Past events ({past.length})</summary>
          <div className="border-t border-obsidian/8">
            <EventList rows={past} busy={busy} onEdit={() => {}} onToggle={togglePublished} onDelete={remove} />
          </div>
        </details>
      )}

      {form && (
        <Modal open size="lg" title={form.id ? 'Edit event' : 'New event'} onClose={() => setForm(null)} footer={
          <>
            <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-obsidian/15 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/70">Cancel</button>
            <button type="submit" form="event-form" disabled={busy === 'save'} className="btn-brand rounded-lg px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] disabled:opacity-40">{busy === 'save' ? 'Saving…' : 'Save event'}</button>
          </>
        }>
          <form id="event-form" onSubmit={save} className="grid gap-3 sm:grid-cols-2">
            <AdminInput label="Title" required value={form.title} onChange={(e) => set('title', e.target.value)} className="sm:col-span-2" />
            <AdminSelect label="Venue" value={form.venueSlug} onChange={(v) => set('venueSlug', v)} options={venues.map((v) => ({ value: v.slug, label: v.name }))} required />
            <AdminSelect label="Tag" value={form.tag} onChange={(v) => set('tag', v)} options={tags} />
            <AdminInput label="Starts" type="datetime-local" required value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
            <AdminInput label="Ends" type="datetime-local" required value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} />
            <AdminInput label="Expected crowd" value={form.expected} onChange={(e) => set('expected', e.target.value)} placeholder="e.g. 200–300" />
            <AdminInput label="Cover (₦)" hint="blank = free" type="number" min={0} value={form.coverNgn} onChange={(e) => set('coverNgn', e.target.value)} />
            <AdminTextArea label="Blurb" rows={3} value={form.blurb} onChange={(e) => set('blurb', e.target.value)} className="sm:col-span-2" />
            <label className="flex items-center gap-2 text-sm text-obsidian/70 sm:col-span-2">
              <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} className="rounded border-obsidian/30 text-ember focus:ring-ember" /> Published
            </label>
          </form>
        </Modal>
      )}
    </>
  );
}

function EventList({ rows, busy, onEdit, onToggle, onDelete }: { rows: EventRow[]; busy: string; onEdit: (e: EventRow) => void; onToggle: (e: EventRow) => void; onDelete: (e: EventRow) => void }) {
  if (rows.length === 0) return <p className="text-sm text-obsidian/45">No events.</p>;
  return (
    <ul className="divide-y divide-obsidian/6 rounded-xl border border-obsidian/10 bg-white">
      {rows.map((ev) => (
        <li key={ev.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className="truncate">{ev.title}</span>
              <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-obsidian/50">{ev.tag}</span>
              {!ev.published && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">hidden</span>}
            </p>
            <p className="text-xs text-obsidian/50">{ev.venue?.name || ev.venueSlug} · {formatWhen(ev.startsAtIso)}{ev.coverNgn ? ` · ${formatNgn(ev.coverNgn)}` : ' · free'}</p>
          </div>
          <button type="button" disabled={busy === ev.id} onClick={() => onToggle(ev)} className="rounded-lg border border-obsidian/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-obsidian/60 hover:border-ember hover:text-ember disabled:opacity-40">{ev.published ? 'Unpublish' : 'Publish'}</button>
          <button type="button" onClick={() => onEdit(ev)} className="grid h-8 w-8 place-items-center rounded text-obsidian/40 hover:bg-obsidian/[0.06] hover:text-obsidian"><Pencil size={14} /></button>
          <button type="button" onClick={() => onDelete(ev)} className="grid h-8 w-8 place-items-center rounded text-obsidian/40 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
        </li>
      ))}
    </ul>
  );
}

/* ── Campaigns ──────────────────────────────────────────────────── */

const EMPTY_CAMPAIGN = { slug: '', brandSlug: '', title: '', tagline: '', blurb: '', entryPoints: '50', rewardPoints: '500', topReward: '', tasksText: '', rulesText: '', startsAt: '', endsAt: '', published: false, existing: false };

function CampaignsPane({ onChanged }: { onChanged?: () => void }) {
  const { confirm, notify } = useDialogs();
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [brands, setBrands] = useState<{ slug: string; name: string }[]>([]);
  const [form, setForm] = useState<typeof EMPTY_CAMPAIGN | null>(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/campaigns');
    const data = await res.json().catch(() => ({}));
    setCampaigns(data.campaigns || []);
    setClaims(data.claims || []);
    setBrands(data.brands || []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy('save');
    try {
      // One task per line: "Title | detail | points". One rule per line.
      const tasks = form.tasksText.split('\n').map((l) => l.trim()).filter(Boolean).map((l, i) => {
        const [title, detail = '', points = '0'] = l.split('|').map((x) => x.trim());
        return { id: `t${i + 1}`, title, detail, points: Number(points) || 0 };
      });
      const rules = form.rulesText.split('\n').map((l) => l.trim()).filter(Boolean);
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug: form.slug || slugify(form.title), entryPoints: Number(form.entryPoints), rewardPoints: Number(form.rewardPoints), tasks, rules, startsAt: toIso(form.startsAt) || undefined, endsAt: toIso(form.endsAt) || null }),
      });
      if (!res.ok) {
        notify(await readError(res, 'Could not save the campaign.'), 'error');
        return;
      }
      notify('Campaign saved.');
      setForm(null);
      await load();
      onChanged?.();
    } finally {
      setBusy('');
    }
  }

  async function remove(c: CampaignRow) {
    if (!(await confirm({ title: `Delete “${c.title}”?`, message: 'The campaign page goes away. Points already awarded stay with the drinkers.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    const res = await fetch(`/api/admin/campaigns?slug=${encodeURIComponent(c.slug)}`, { method: 'DELETE' });
    if (!res.ok) notify(await readError(res, 'Could not delete.'), 'error');
    await load();
  }

  async function setClaim(claim: Claim, status: Claim['status']) {
    setBusy(claim.id);
    try {
      const res = await fetch('/api/admin/campaigns', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: claim.id, status }) });
      if (!res.ok) notify(await readError(res, 'Could not update the claim.'), 'error');
      await load();
    } finally {
      setBusy('');
    }
  }

  const set = <K extends keyof typeof EMPTY_CAMPAIGN>(k: K, v: (typeof EMPTY_CAMPAIGN)[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const edit = (c: CampaignRow) =>
    setForm({ slug: c.slug, brandSlug: c.brandSlug, title: c.title, tagline: c.tagline || '', blurb: c.blurb || '', entryPoints: String(c.entryPoints), rewardPoints: String(c.rewardPoints), topReward: c.topReward || '', tasksText: c.tasks.map((t) => `${t.title} | ${t.detail} | ${t.points}`).join('\n'), rulesText: c.rules.join('\n'), startsAt: toLocal(c.startsAt), endsAt: c.endsAt ? toLocal(c.endsAt) : '', published: c.published, existing: true });
  const pendingClaims = claims.filter((c) => c.status === 'pending' || c.status === 'verified');

  return (
    <>
      {pendingClaims.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-amber-800">Brand ownership claims ({pendingClaims.length})</p>
          <ul className="mt-2 divide-y divide-amber-200/60">
            {pendingClaims.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                <span className="min-w-0 flex-1">
                  <strong>{c.brandName}</strong> · {c.contactName}{c.role ? ` (${c.role})` : ''} · {c.email}{c.phone ? ` · ${c.phone}` : ''}
                  {c.message && <span className="block text-xs text-obsidian/55">“{c.message}”</span>}
                </span>
                <button type="button" disabled={busy === c.id} onClick={() => setClaim(c, 'approved')} className="btn-brand rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider disabled:opacity-40">Approve</button>
                <button type="button" disabled={busy === c.id} onClick={() => setClaim(c, 'rejected')} className="rounded-lg border border-obsidian/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-obsidian/60 disabled:opacity-40">Reject</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-obsidian/50">{campaigns.filter((c) => c.live).length} live · {campaigns.length} total</p>
        <button type="button" onClick={() => setForm({ ...EMPTY_CAMPAIGN, brandSlug: brands[0]?.slug || '' })} className="btn-brand inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em]">
          <Plus size={13} /> New campaign
        </button>
      </div>
      {campaigns.length === 0 ? (
        <p className="text-sm text-obsidian/45">No campaigns yet.</p>
      ) : (
        <ul className="divide-y divide-obsidian/6 rounded-xl border border-obsidian/10 bg-white">
          {campaigns.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <span className="truncate">{c.title}</span>
                  {c.live ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">live</span> : !c.published ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">draft</span> : null}
                </p>
                <p className="text-xs text-obsidian/50">{brands.find((b) => b.slug === c.brandSlug)?.name || c.brandSlug} · /campaigns/{c.slug} · {c.tasks.length} tasks · {c.rewardPoints} pts{c.daysLeft != null ? ` · ${c.daysLeft}d left` : ''}</p>
              </div>
              <button type="button" onClick={() => edit(c)} className="grid h-8 w-8 place-items-center rounded text-obsidian/40 hover:bg-obsidian/[0.06] hover:text-obsidian"><Pencil size={14} /></button>
              <button type="button" onClick={() => remove(c)} className="grid h-8 w-8 place-items-center rounded text-obsidian/40 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}

      {form && (
        <Modal open size="lg" title={form.existing ? 'Edit campaign' : 'New campaign'} onClose={() => setForm(null)} footer={
          <>
            <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-obsidian/15 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/70">Cancel</button>
            <button type="submit" form="campaign-form" disabled={busy === 'save'} className="btn-brand rounded-lg px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] disabled:opacity-40">{busy === 'save' ? 'Saving…' : 'Save campaign'}</button>
          </>
        }>
          <form id="campaign-form" onSubmit={save} className="grid gap-3 sm:grid-cols-2">
            <AdminSelect label="Brand" value={form.brandSlug} onChange={(v) => set('brandSlug', v)} options={brands.map((b) => ({ value: b.slug, label: b.name }))} required />
            <AdminInput label="Slug" hint={form.existing ? 'fixed' : 'auto from title'} value={form.slug} disabled={form.existing} onChange={(e) => set('slug', slugify(e.target.value))} />
            <AdminInput label="Title" required value={form.title} onChange={(e) => set('title', e.target.value)} className="sm:col-span-2" />
            <AdminInput label="Tagline" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} className="sm:col-span-2" />
            <AdminTextArea label="Blurb" rows={2} value={form.blurb} onChange={(e) => set('blurb', e.target.value)} className="sm:col-span-2 min-h-[60px]" />
            <AdminInput label="Entry points" type="number" min={0} value={form.entryPoints} onChange={(e) => set('entryPoints', e.target.value)} />
            <AdminInput label="Reward points" type="number" min={0} value={form.rewardPoints} onChange={(e) => set('rewardPoints', e.target.value)} />
            <AdminInput label="Top reward" value={form.topReward} onChange={(e) => set('topReward', e.target.value)} placeholder="e.g. A magnum of Moët" className="sm:col-span-2" />
            <AdminTextArea label="Tasks" hint="one per line: Title | detail | points" rows={4} value={form.tasksText} onChange={(e) => set('tasksText', e.target.value)} className="sm:col-span-2 font-mono text-[13px]" />
            <AdminTextArea label="Rules" hint="one per line" rows={3} value={form.rulesText} onChange={(e) => set('rulesText', e.target.value)} className="sm:col-span-2" />
            <AdminInput label="Starts" type="datetime-local" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
            <AdminInput label="Ends" hint="blank = open-ended" type="datetime-local" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} />
            <label className="flex items-center gap-2 text-sm text-obsidian/70 sm:col-span-2">
              <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} className="rounded border-obsidian/30 text-ember focus:ring-ember" /> Published
            </label>
          </form>
        </Modal>
      )}
    </>
  );
}

/* ── Venues ─────────────────────────────────────────────────────── */

const EMPTY_VENUE = { id: '', slug: '', name: '', kind: 'lounge', areaId: '', address: '', tagline: '', about: '', hours: '', coverNgn: '', cardPerk: '', cardDiscountPct: '0', phone: '', instagram: '', website: '', status: 'active' };

function VenuesPane({ onChanged }: { onChanged?: () => void }) {
  const { confirm, notify } = useDialogs();
  const [venues, setVenues] = useState<VenueRow[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [form, setForm] = useState<typeof EMPTY_VENUE | null>(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/venues');
    const data = await res.json().catch(() => ({}));
    setVenues(data.venues || []);
    setAreas(data.areas || []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy('save');
    try {
      const area = areas.find((a) => a.id === form.areaId);
      const payload = { ...form, slug: form.slug || slugify(form.name), area: area?.name || '', coverNgn: form.coverNgn === '' ? null : Number(form.coverNgn), cardDiscountPct: Number(form.cardDiscountPct) || 0 };
      const res = await fetch('/api/admin/venues', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.id ? payload : { ...payload, id: undefined }),
      });
      if (!res.ok) {
        notify(await readError(res, 'Could not save the venue.'), 'error');
        return;
      }
      notify('Venue saved.');
      setForm(null);
      await load();
      onChanged?.();
    } finally {
      setBusy('');
    }
  }

  async function setStatus(v: VenueRow, status: VenueRow['status']) {
    setBusy(v.id);
    try {
      const res = await fetch('/api/admin/venues', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: v.id, status }) });
      if (!res.ok) notify(await readError(res, 'Could not update.'), 'error');
      await load();
    } finally {
      setBusy('');
    }
  }

  async function remove(v: VenueRow) {
    if (!(await confirm({ title: `Delete ${v.name}?`, message: 'Its page, followers and reviews go with it. Suspend instead if it might come back.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    const res = await fetch(`/api/admin/venues?id=${encodeURIComponent(v.id)}`, { method: 'DELETE' });
    if (!res.ok) notify(await readError(res, 'Could not delete.'), 'error');
    await load();
  }

  const set = <K extends keyof typeof EMPTY_VENUE>(k: K, v: string) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const edit = (v: VenueRow) => setForm({ id: v.id, slug: v.slug, name: v.name, kind: v.kind, areaId: v.areaId, address: v.address, tagline: v.tagline, about: v.about, hours: v.hours, coverNgn: v.coverNgn != null ? String(v.coverNgn) : '', cardPerk: v.cardPerk, cardDiscountPct: String(v.cardDiscountPct), phone: v.phone || '', instagram: v.instagram || '', website: v.website || '', status: v.status });
  const pending = venues.filter((v) => v.status === 'pending');
  const rest = venues.filter((v) => v.status !== 'pending');

  const row = (v: VenueRow) => (
    <li key={v.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="truncate">{v.name}</span>
          <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-obsidian/50">{v.kind}</span>
          {v.status !== 'active' && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${v.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>{v.status}</span>}
        </p>
        <p className="text-xs text-obsidian/50">{v.area} · {v.followerCount} followers · {v.reviewCount} reviews{v.source === 'partner_submission' ? ' · submitted by partner' : ''}</p>
      </div>
      {v.status === 'pending' && <button type="button" disabled={busy === v.id} onClick={() => setStatus(v, 'active')} className="btn-brand rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider disabled:opacity-40">Approve</button>}
      {v.status === 'active' && <button type="button" disabled={busy === v.id} onClick={() => setStatus(v, 'suspended')} className="rounded-lg border border-obsidian/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-obsidian/60 hover:border-ember hover:text-ember disabled:opacity-40">Suspend</button>}
      {v.status === 'suspended' && <button type="button" disabled={busy === v.id} onClick={() => setStatus(v, 'active')} className="rounded-lg border border-obsidian/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-obsidian/60 disabled:opacity-40">Reactivate</button>}
      <button type="button" onClick={() => edit(v)} className="grid h-8 w-8 place-items-center rounded text-obsidian/40 hover:bg-obsidian/[0.06] hover:text-obsidian"><Pencil size={14} /></button>
      <button type="button" onClick={() => remove(v)} className="grid h-8 w-8 place-items-center rounded text-obsidian/40 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
    </li>
  );

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-obsidian/50">{venues.filter((v) => v.status === 'active').length} active{pending.length ? ` · ${pending.length} awaiting approval` : ''}</p>
        <button type="button" onClick={() => setForm({ ...EMPTY_VENUE, areaId: areas[0]?.id || '' })} className="btn-brand inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em]">
          <Plus size={13} /> New venue
        </button>
      </div>
      {pending.length > 0 && <ul className="divide-y divide-amber-200/60 rounded-xl border border-amber-200 bg-amber-50/40">{pending.map(row)}</ul>}
      {rest.length === 0 ? <p className="text-sm text-obsidian/45">No venues in the database yet (the seeded catalog still shows on the site).</p> : <ul className="divide-y divide-obsidian/6 rounded-xl border border-obsidian/10 bg-white">{rest.map(row)}</ul>}

      {form && (
        <Modal open size="lg" title={form.id ? `Edit ${form.name}` : 'New venue'} onClose={() => setForm(null)} footer={
          <>
            <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-obsidian/15 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/70">Cancel</button>
            <button type="submit" form="venue-form" disabled={busy === 'save'} className="btn-brand rounded-lg px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] disabled:opacity-40">{busy === 'save' ? 'Saving…' : 'Save venue'}</button>
          </>
        }>
          <form id="venue-form" onSubmit={save} className="grid gap-3 sm:grid-cols-2">
            <AdminInput label="Name" required value={form.name} onChange={(e) => set('name', e.target.value)} />
            <AdminInput label="Slug" hint={form.id ? 'fixed' : 'auto from name'} value={form.slug} disabled={Boolean(form.id)} onChange={(e) => set('slug', slugify(e.target.value))} />
            <AdminSelect label="Kind" value={form.kind} onChange={(v) => set('kind', v)} options={VENUE_KINDS} />
            <AdminSelect label="Area" value={form.areaId} onChange={(v) => set('areaId', v)} options={areas.map((a) => ({ value: a.id, label: a.name }))} required />
            <AdminInput label="Address" value={form.address} onChange={(e) => set('address', e.target.value)} className="sm:col-span-2" />
            <AdminInput label="Tagline" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} className="sm:col-span-2" />
            <AdminTextArea label="About" rows={3} value={form.about} onChange={(e) => set('about', e.target.value)} className="sm:col-span-2" />
            <AdminInput label="Hours" value={form.hours} onChange={(e) => set('hours', e.target.value)} placeholder="Thu–Sun 9pm–4am" />
            <AdminInput label="Cover (₦)" hint="blank = none" type="number" min={0} value={form.coverNgn} onChange={(e) => set('coverNgn', e.target.value)} />
            <AdminInput label="Guest Card perk" value={form.cardPerk} onChange={(e) => set('cardPerk', e.target.value)} placeholder="e.g. Skip the queue" />
            <AdminInput label="Card discount %" type="number" min={0} max={50} value={form.cardDiscountPct} onChange={(e) => set('cardDiscountPct', e.target.value)} />
            <AdminInput label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            <AdminInput label="Instagram" value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@handle" />
            <AdminInput label="Website" value={form.website} onChange={(e) => set('website', e.target.value)} className="sm:col-span-2" />
            <AdminSelect label="Status" value={form.status} onChange={(v) => set('status', v)} options={['active', 'pending', 'suspended']} />
          </form>
        </Modal>
      )}
    </>
  );
}
