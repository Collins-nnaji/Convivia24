'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  BLOCK_KINDS,
  BLOCK_KIND_LABELS,
  BLOCK_THEMES,
  BLOCK_THEME_LABELS,
  DEFAULT_CONTENT,
  THEME_CLASSES,
  isLive,
  type BlockKind,
  type BlockTheme,
  type StorefrontBlock,
} from '@/lib/storefront/blocks';
import { useDialogs } from './ui/DialogProvider';
import { AdminInput, AdminSelect, AdminTextArea } from './ui/Fields';
import Modal from './ui/Modal';
import { readError, formatWhen } from './types';

/**
 * Everything editorial on the storefront: hero banners, the announcement strip, highlight tiles
 * and "Get inspired" cards. Each slot shows the built-in defaults until something is published.
 */

const SLOT_HELP: Record<BlockKind, string> = {
  hero: 'Full-width banners at the top of the home page. Several rotate as a carousel. Wide images (about 2400×900) work best.',
  announcement: 'The thin strip above the header on every page — delivery promises, promo codes, cut-off times. Several rotate.',
  highlight: 'The “Our highlights” mosaic. The first two tiles are large, the rest small. Square-ish images work best.',
  editorial: 'The “Get inspired” cards — guides, quizzes, campaigns, anything worth reading.',
};

type Form = {
  id: string;
  kind: BlockKind;
  title: string;
  subtitle: string;
  ctaLabel: string;
  href: string;
  imageUrl: string;
  theme: BlockTheme;
  published: boolean;
  startsAt: string;
  endsAt: string;
};

function toLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

const emptyForm = (kind: BlockKind): Form => ({
  id: '',
  kind,
  title: '',
  subtitle: '',
  ctaLabel: kind === 'hero' ? 'Shop now' : '',
  href: '/shop',
  imageUrl: '',
  theme: kind === 'announcement' ? 'palm' : 'ember',
  published: true,
  startsAt: '',
  endsAt: '',
});

export default function StorefrontDesk() {
  const { confirm, notify } = useDialogs();
  const [kind, setKind] = useState<BlockKind>('hero');
  const [blocks, setBlocks] = useState<StorefrontBlock[]>([]);
  const [blobOk, setBlobOk] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setLoadError('');
    const res = await fetch('/api/admin/storefront', { cache: 'no-store' });
    if (!res.ok) {
      setLoadError(await readError(res, 'Could not load storefront content.'));
      return;
    }
    const data = await res.json();
    setBlocks(data.blocks || []);
    setBlobOk(Boolean(data.blobConfigured));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function post(body: Record<string, unknown>, fallback: string): Promise<boolean> {
    const res = await fetch('/api/admin/storefront', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      notify(await readError(res, fallback), 'error');
      return false;
    }
    return true;
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy('save');
    try {
      const ok = await post(
        {
          action: form.id ? 'update' : 'create',
          ...form,
          id: form.id || undefined,
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        },
        'Could not save.'
      );
      if (!ok) return;
      notify(form.id ? 'Saved — live on the storefront within a minute.' : 'Added to the storefront.');
      setForm(null);
      await load();
    } finally {
      setBusy('');
    }
  }

  async function upload(file: File) {
    setBusy('upload');
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await fetch('/api/admin/storefront', { method: 'POST', body: data });
      if (!res.ok) {
        notify(await readError(res, 'Upload failed.'), 'error');
        return;
      }
      const { url } = await res.json();
      setForm((f) => (f ? { ...f, imageUrl: url } : f));
    } finally {
      setBusy('');
    }
  }

  async function act(block: StorefrontBlock, body: Record<string, unknown>, fallback: string) {
    setBusy(block.id);
    try {
      if (await post({ id: block.id, ...body }, fallback)) await load();
    } finally {
      setBusy('');
    }
  }

  async function remove(block: StorefrontBlock) {
    const ok = await confirm({
      title: `Delete “${block.title}”?`,
      message: 'It comes off the storefront straight away.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (ok) await act(block, { action: 'delete' }, 'Could not delete.');
  }

  const rows = blocks.filter((b) => b.kind === kind);
  const liveCount = rows.filter((b) => isLive(b)).length;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto border-b border-obsidian/10">
        {BLOCK_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-xs font-bold ${kind === k ? 'border-ember text-ember' : 'border-transparent text-obsidian/50 hover:text-obsidian'}`}
          >
            {BLOCK_KIND_LABELS[k]}
            <span className="ml-1.5 text-obsidian/35">{blocks.filter((b) => b.kind === k).length}</span>
          </button>
        ))}
      </div>

      {loadError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-obsidian/55">{SLOT_HELP[kind]}</p>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-obsidian/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-obsidian/60 hover:border-ember hover:text-ember"
          >
            <ExternalLink size={13} /> View site
          </a>
          <button
            type="button"
            onClick={() => setForm(emptyForm(kind))}
            className="btn-brand inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      {liveCount === 0 && (
        <div className="rounded-xl border border-dashed border-obsidian/15 bg-white p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-obsidian/45">
            Nothing live here — the storefront shows these defaults
          </p>
          <ul className="space-y-1.5 text-sm text-obsidian/70">
            {DEFAULT_CONTENT[kind].map((d) => (
              <li key={d.id} className="flex items-center gap-2">
                <span className={`h-3 w-3 shrink-0 rounded-full ${THEME_CLASSES[d.theme].bg}`} />
                <span className="font-medium">{d.title}</span>
                {d.href && <span className="font-mono text-[11px] text-obsidian/40">{d.href}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rows.length > 0 && (
        <ul className="divide-y divide-obsidian/6 rounded-2xl bg-white ring-1 ring-obsidian/[0.06]">
          {rows.map((b, i) => {
            const live = isLive(b);
            const scheduled = b.published && !live && b.startsAt && new Date(b.startsAt) > new Date();
            return (
              <li key={b.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div
                  className={`relative h-12 w-20 shrink-0 overflow-hidden rounded-md ${THEME_CLASSES[b.theme].bg}`}
                  style={b.imageUrl ? { backgroundImage: `url(${b.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className="truncate">{b.title}</span>
                    {live ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">live</span>
                    ) : scheduled ? (
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">scheduled</span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        {b.published ? 'ended' : 'hidden'}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-obsidian/50">
                    {b.href || 'no link'}
                    {b.startsAt && ` · from ${formatWhen(b.startsAt)}`}
                    {b.endsAt && ` · until ${formatWhen(b.endsAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" aria-label="Move up" disabled={i === 0 || busy === b.id} onClick={() => act(b, { action: 'move', direction: -1 }, 'Could not reorder.')} className="grid h-8 w-8 place-items-center rounded text-obsidian/40 hover:bg-obsidian/[0.06] hover:text-obsidian disabled:opacity-25">
                    <ArrowUp size={14} />
                  </button>
                  <button type="button" aria-label="Move down" disabled={i === rows.length - 1 || busy === b.id} onClick={() => act(b, { action: 'move', direction: 1 }, 'Could not reorder.')} className="grid h-8 w-8 place-items-center rounded text-obsidian/40 hover:bg-obsidian/[0.06] hover:text-obsidian disabled:opacity-25">
                    <ArrowDown size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={busy === b.id}
                  onClick={() => act(b, { action: 'publish', published: !b.published }, 'Could not update.')}
                  className="rounded-full border border-obsidian/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-obsidian/60 hover:border-ember hover:text-ember disabled:opacity-40"
                >
                  {b.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  aria-label="Edit"
                  onClick={() =>
                    setForm({
                      id: b.id,
                      kind: b.kind,
                      title: b.title,
                      subtitle: b.subtitle || '',
                      ctaLabel: b.ctaLabel || '',
                      href: b.href || '',
                      imageUrl: b.imageUrl || '',
                      theme: b.theme,
                      published: b.published,
                      startsAt: toLocal(b.startsAt),
                      endsAt: toLocal(b.endsAt),
                    })
                  }
                  className="grid h-8 w-8 place-items-center rounded text-obsidian/40 hover:bg-obsidian/[0.06] hover:text-obsidian"
                >
                  <Pencil size={14} />
                </button>
                <button type="button" aria-label="Delete" onClick={() => remove(b)} className="grid h-8 w-8 place-items-center rounded text-obsidian/40 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {form && (
        <Modal
          open
          size="lg"
          title={`${form.id ? 'Edit' : 'New'} — ${BLOCK_KIND_LABELS[form.kind]}`}
          onClose={() => setForm(null)}
          footer={
            <>
              <button type="button" onClick={() => setForm(null)} className="rounded-full border border-obsidian/15 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-obsidian/70">
                Cancel
              </button>
              <button type="submit" form="storefront-form" disabled={busy === 'save' || busy === 'upload'} className="btn-brand rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] disabled:opacity-40">
                {busy === 'save' ? 'Saving…' : 'Save'}
              </button>
            </>
          }
        >
          <form id="storefront-form" onSubmit={save} className="space-y-4">
            <Preview form={form} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <AdminInput
                  label={form.kind === 'announcement' ? 'Message' : 'Headline'}
                  required
                  maxLength={140}
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                />
              </div>
              {form.kind !== 'announcement' && (
                <div className="sm:col-span-2">
                  <AdminTextArea label="Sub-line" rows={2} maxLength={300} value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
                </div>
              )}
              <AdminInput label="Link" hint="/shop?type=whisky or https://…" value={form.href} onChange={(e) => set('href', e.target.value)} />
              <AdminInput label="Button text" hint="optional" maxLength={40} value={form.ctaLabel} onChange={(e) => set('ctaLabel', e.target.value)} />
              <AdminSelect
                label="Colour"
                value={form.theme}
                onChange={(v) => set('theme', v as BlockTheme)}
                options={BLOCK_THEMES.map((t) => ({ value: t, label: BLOCK_THEME_LABELS[t] }))}
              />
              {form.kind !== 'announcement' && (
                <div>
                  <AdminInput label="Image URL" hint="optional" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} placeholder="https://…" />
                  {blobOk && (
                    <label className="mt-1.5 inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-ember hover:underline">
                      <ImagePlus size={13} /> {busy === 'upload' ? 'Uploading…' : 'Upload image'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) upload(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
              )}
              <AdminInput label="Show from" hint="optional" type="datetime-local" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
              <AdminInput label="Show until" hint="optional" type="datetime-local" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} />
              <label className="flex items-center gap-2 text-sm text-obsidian/70 sm:col-span-2">
                <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} className="rounded border-obsidian/30 text-ember focus:ring-ember" />
                Published
              </label>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/** A small, honest rendering of how the block will look on the site. */
function Preview({ form }: { form: Form }) {
  const t = THEME_CLASSES[form.theme];
  if (form.kind === 'announcement') {
    return (
      <div className={`rounded-md px-4 py-2 text-center text-xs font-semibold ${t.bg} ${t.text}`}>
        {form.title || 'Your message'} {form.ctaLabel && <span className="underline">{form.ctaLabel}</span>}
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden rounded-lg ${form.imageUrl ? 'bg-obsidian' : t.bg}`} style={{ aspectRatio: form.kind === 'hero' ? '16 / 6' : '16 / 9' }}>
      {form.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={form.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
      )}
      <div className="relative flex h-full flex-col justify-end p-4">
        <p className={`text-lg font-semibold leading-tight ${form.imageUrl ? 'text-white' : t.text}`}>{form.title || 'Headline'}</p>
        {form.subtitle && <p className={`mt-1 text-xs ${form.imageUrl ? 'text-white/80' : t.sub}`}>{form.subtitle}</p>}
        {form.ctaLabel && <span className={`mt-2 w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase ${t.button}`}>{form.ctaLabel}</span>}
      </div>
    </div>
  );
}
