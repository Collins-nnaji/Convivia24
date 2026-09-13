'use client';

import { useState } from 'react';
import { Copy, KeyRound, Link2, ShieldOff } from 'lucide-react';
import type { Supplier } from '@/lib/suppliers/repo';
import { useDialogs } from './ui/DialogProvider';
import Modal from './ui/Modal';
import { readError, formatWhen } from './types';

/**
 * Where the desk hands a supplier the keys to their own URL. The key is shown once, in a modal,
 * and never again — rotating it is the only way to recover.
 */
export default function SupplierPortalPanel({ supplier, onChanged }: { supplier: Supplier; onChanged: () => Promise<unknown> }) {
  const { confirm, notify } = useDialogs();
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<string | null>(null);
  const portalPath = `/supplier/${supplier.slug}`;
  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}${portalPath}` : portalPath;

  async function act(body: Record<string, unknown>, fallback: string) {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: supplier.id, ...body }),
      });
      if (!res.ok) {
        notify(await readError(res, fallback), 'error');
        return null;
      }
      const data = await res.json();
      await onChanged();
      return data;
    } finally {
      setBusy(false);
    }
  }

  async function issueKey() {
    if (supplier.hasAccessKey) {
      const ok = await confirm({
        title: 'Issue a new key?',
        message: 'The current key stops working immediately and every open session on it is signed out.',
        confirmLabel: 'Rotate key',
        tone: 'danger',
      });
      if (!ok) return;
    }
    const data = await act({ action: 'issue-key' }, 'Could not issue a key.');
    if (data?.key) setIssued(data.key);
  }

  async function revokeKey() {
    const ok = await confirm({
      title: 'Revoke access?',
      message: `${supplier.name} will be signed out and cannot open their portal until you issue a new key.`,
      confirmLabel: 'Revoke',
      tone: 'danger',
    });
    if (!ok) return;
    await act({ action: 'revoke-key' }, 'Could not revoke the key.');
  }

  function copy(text: string, what: string) {
    navigator.clipboard?.writeText(text).then(() => notify(`${what} copied.`), () => notify('Could not copy.', 'error'));
  }

  return (
    <div className="rounded-2xl border border-obsidian/10 bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">Supplier portal</h3>
          <p className="text-xs text-obsidian/45">Their own URL to manage stock, prices and the orders routed to them.</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-obsidian/60">
          <input
            type="checkbox"
            checked={supplier.portalEnabled}
            disabled={busy}
            onChange={(e) => act({ action: 'portal', enabled: e.target.checked }, 'Could not update the portal.')}
            className="rounded border-obsidian/30 text-ember focus:ring-ember"
          />
          Enabled
        </label>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-paper px-3 py-2">
        <Link2 size={14} className="text-obsidian/40" />
        <code className="min-w-0 flex-1 truncate text-xs">{portalUrl}</code>
        <button type="button" onClick={() => copy(portalUrl, 'Link')} className="grid h-7 w-7 place-items-center rounded text-obsidian/45 hover:bg-obsidian/[0.06] hover:text-obsidian" title="Copy link">
          <Copy size={13} />
        </button>
        <a href={portalPath} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-wider text-ember">
          Open
        </a>
      </div>

      <dl className="mb-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-obsidian/60">
        <dt className="text-obsidian/40">Access key</dt>
        <dd>{supplier.hasAccessKey ? `Issued ${supplier.accessKeyIssuedAt ? formatWhen(supplier.accessKeyIssuedAt) : ''}` : 'Not issued'}</dd>
        <dt className="text-obsidian/40">Last seen</dt>
        <dd>{supplier.lastSeenAt ? formatWhen(supplier.lastSeenAt) : 'Never'}</dd>
        <dt className="text-obsidian/40">Email login</dt>
        <dd>{supplier.email ? `${supplier.email} can also sign in with a Convivia24 account` : 'No email on file'}</dd>
      </dl>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={issueKey} disabled={busy} className="inline-flex items-center gap-1.5 btn-brand px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-50">
          <KeyRound size={13} /> {supplier.hasAccessKey ? 'Rotate key' : 'Issue access key'}
        </button>
        {supplier.hasAccessKey && (
          <button type="button" onClick={revokeKey} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-ember/40 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-ember disabled:opacity-50">
            <ShieldOff size={13} /> Revoke
          </button>
        )}
      </div>

      <Modal
        open={issued !== null}
        title={`Access key for ${supplier.name}`}
        description="Send this to the supplier now — it is not stored and cannot be shown again. If it is lost, rotate it."
        onClose={() => setIssued(null)}
        size="sm"
        footer={
          <button type="button" onClick={() => setIssued(null)} className="rounded-lg bg-obsidian px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white">
            Done
          </button>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-paper px-3 py-3">
            <code className="flex-1 font-mono text-base tracking-wider">{issued}</code>
            <button type="button" onClick={() => issued && copy(issued, 'Key')} className="grid h-8 w-8 place-items-center rounded text-obsidian/50 hover:bg-obsidian/[0.06]" title="Copy key">
              <Copy size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => issued && copy(`Your Convivia24 supplier portal: ${portalUrl}\nAccess key: ${issued}`, 'Message')}
            className="text-[11px] font-bold text-ember"
          >
            Copy link + key as a message
          </button>
        </div>
      </Modal>
    </div>
  );
}
