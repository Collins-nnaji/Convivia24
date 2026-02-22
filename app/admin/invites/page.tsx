'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, Plus, Link as LinkIcon } from 'lucide-react';

interface Invite {
  id: string;
  token: string;
  email: string | null;
  created_by: string | null;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
  created_at: string;
}

export default function AdminInvitesPage() {
  const [email, setEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('7');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newLink, setNewLink] = useState('');
  const [copied, setCopied] = useState(false);

  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  async function loadInvites() {
    try {
      const res = await fetch('/api/admin/invites', { credentials: 'include' });
      const data = await res.json();
      if (data.invites) setInvites(data.invites);
    } catch {
      // ignore
    } finally {
      setLoadingInvites(false);
    }
  }

  useEffect(() => { loadInvites(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    setNewLink('');
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() || undefined, expiresInDays: Number(expiresInDays) }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setCreateError(data.error || 'Failed to create invite.');
        return;
      }
      setNewLink(data.inviteUrl);
      setEmail('');
      loadInvites();
    } catch {
      setCreateError('Network error.');
    } finally {
      setCreating(false);
    }
  }

  function copyLink(link: string) {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
          Access Control
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">
          Invite Links
        </h1>
        <p className="text-zinc-600 text-sm mt-1">
          Create invite links to give someone access to sign up. Each link is single-use.
        </p>
      </div>

      {/* Create form */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 mb-4 flex items-center gap-2">
          <Plus size={14} className="text-red-600" /> New Invite
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 border border-zinc-300 text-sm px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-red-600 rounded"
          />
          <select
            value={expiresInDays}
            onChange={e => setExpiresInDays(e.target.value)}
            className="border border-zinc-300 text-sm px-3 py-2 text-zinc-900 focus:outline-none focus:border-red-600 rounded"
          >
            <option value="1">Expires in 1 day</option>
            <option value="3">Expires in 3 days</option>
            <option value="7">Expires in 7 days</option>
            <option value="14">Expires in 14 days</option>
            <option value="30">Expires in 30 days</option>
          </select>
          <button
            type="submit"
            disabled={creating}
            className="bg-red-700 hover:bg-red-800 text-white text-sm font-black uppercase tracking-[0.15em] px-5 py-2 transition-colors disabled:opacity-60 rounded"
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>
        {createError && <p className="text-red-500 text-xs mt-2">{createError}</p>}

        {newLink && (
          <div className="mt-4 flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded px-4 py-3">
            <LinkIcon size={13} className="text-red-600 shrink-0" />
            <span className="text-xs text-zinc-700 truncate flex-1">{newLink}</span>
            <button
              onClick={() => copyLink(newLink)}
              className="shrink-0 flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.1em] text-red-700 hover:text-red-600 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {/* Invite list */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900">Recent Invites</h2>
        </div>
        {loadingInvites ? (
          <p className="text-zinc-500 text-sm text-center py-8">Loading…</p>
        ) : invites.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-8">No invites yet.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {invites.map((inv) => {
              const expired = new Date(inv.expires_at) < new Date();
              const used = !!inv.used_at;
              const status = used ? 'used' : expired ? 'expired' : 'active';
              const statusColors: Record<string, string> = {
                active: 'bg-green-100 text-green-700',
                used: 'bg-zinc-200 text-zinc-600',
                expired: 'bg-red-100 text-red-600',
              };
              return (
                <div key={inv.id} className="flex items-start justify-between px-6 py-4 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-800 font-medium truncate">
                      {inv.email ?? <span className="text-zinc-400 italic">any email</span>}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Created {formatDate(inv.created_at)} · Expires {formatDate(inv.expires_at)}
                      {used && inv.used_by && ` · Used by ${inv.used_by}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded ${statusColors[status]}`}>
                      {status}
                    </span>
                    {status === 'active' && (
                      <button
                        onClick={() => copyLink(`${window.location.origin}/auth/sign-up?invite=${inv.token}`)}
                        title="Copy invite link"
                        className="text-zinc-400 hover:text-red-600 transition-colors"
                      >
                        <Copy size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
