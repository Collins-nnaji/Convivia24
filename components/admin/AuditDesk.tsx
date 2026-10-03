'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDesk } from './useDesk';
import { DeskEmpty, DeskHeader, DeskPanel, DeskStats, deskButton, deskField } from './ui/DeskContent';

type Entry = { id: string; actorId: string | null; email: string | null; name: string | null; category: string; action: string; subject: string | null; status: number | null; durationMs: number | null; detail: Record<string, unknown>; createdAt: string };
type User = { userId: string; email: string; name: string | null; sessions: number | null; lastSeenAt: string | null; lastPath: string | null; expiresAt: string | null; signedInAt: string | null };
type AuditData = { entries: Entry[]; nextCursor: string | null; users: User[]; source: 'neon' | 'presence'; total: number; warning: string | null; generatedAt: string };
const blank = { search: '', category: '', outcome: '', from: '', to: '' };
const when = (value: string | null) => value ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'medium' }) : 'Not observed';

export default function AuditDesk() {
  const [draft, setDraft] = useState(blank);
  const [filters, setFilters] = useState(blank);
  const [cursors, setCursors] = useState<string[]>([]);
  const [usersOffset, setUsersOffset] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const params = new URLSearchParams({ search: filters.search, category: filters.category, outcome: filters.outcome, usersOffset: String(usersOffset) });
  if (filters.from) params.set('from', `${filters.from}T00:00:00Z`);
  if (filters.to) params.set('to', new Date(new Date(`${filters.to}T00:00:00Z`).getTime() + 86400000).toISOString());
  if (cursors.length) params.set('before', cursors[cursors.length - 1]);
  const desk = useDesk<AuditData>(`/api/admin/audit?${params}`);
  const { reload } = desk;
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void reload(); }, 30000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, reload]);

  function apply(next: typeof blank) { setFilters(next); setDraft(next); setCursors([]); setUsersOffset(0); }
  const data = desk.data;
  return <div className="space-y-6">
    <DeskHeader {...desk} title="Platform audit" description="Review recorded actions, page visits, admin changes and drink history. See signed-in users and when they last used the platform." />
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><Link href="/admin/audit" className="text-ember underline">Open audit page</Link><label className="flex items-center gap-2"><input type="checkbox" checked={autoRefresh} onChange={event => setAutoRefresh(event.target.checked)} />Refresh every 30 seconds</label></div>
    <DeskPanel title="Find activity" description="Search an email, user ID, action or record. Date filters use UTC; recorded times display in your local timezone.">
      <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" onSubmit={event => { event.preventDefault(); apply(draft); }}>
        <label className="text-sm">User or action<input className={deskField} value={draft.search} onChange={event => setDraft({ ...draft, search: event.target.value })} placeholder="Email, drink, order or action" /></label>
        <label className="text-sm">Category<select className={deskField} value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })}><option value="">All activity</option><option value="auth">Authentication</option><option value="navigation">Page visits</option><option value="api">Platform requests</option><option value="admin">Admin changes</option><option value="drinks">Drinks & prices</option><option value="supplier">Supplier activity</option></select></label>
        <label className="text-sm">Result<select className={deskField} value={draft.outcome} onChange={event => setDraft({ ...draft, outcome: event.target.value })}><option value="">All results</option><option value="success">Successful / recorded</option><option value="rejected">Rejected requests</option><option value="failed">Server errors</option></select></label>
        <label className="text-sm">From<input className={deskField} type="date" value={draft.from} onChange={event => setDraft({ ...draft, from: event.target.value })} /></label>
        <label className="text-sm">Through<input className={deskField} type="date" min={draft.from || undefined} value={draft.to} onChange={event => setDraft({ ...draft, to: event.target.value })} /></label>
        <div className="flex items-end gap-2"><button className="btn-brand rounded-lg px-4 py-2" disabled={desk.loading}>Apply filters</button><button type="button" className={deskButton} onClick={() => apply(blank)}>Clear</button></div>
      </form>
    </DeskPanel>
    {data && <>
      <DeskStats items={[{ label: data.source === 'neon' ? 'Signed-in users matching search' : 'Recently seen users matching search', value: data.total }, { label: 'Sessions on this users page', value: data.users.reduce((total, user) => total + (user.sessions ?? 0), 0) }, { label: 'Activity on this page', value: data.entries.length }, { label: 'Rejected / failed on this page', value: data.entries.filter(entry => (entry.status ?? 0) >= 400).length }]} />
      <DeskPanel title={data.source === 'neon' ? 'Signed-in users' : 'Recently seen users'} description="Signed-in means an unexpired Neon session. Active now means activity was observed within the last two minutes; a signed-in user may have closed their browser.">
        {data.warning && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{data.warning}</p>}
        {!data.users.length ? <DeskEmpty>No matching users.</DeskEmpty> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-obsidian/55"><th className="p-2">User</th><th className="p-2">Activity</th><th className="p-2">Sessions</th><th className="p-2">Last seen / page</th><th className="p-2">Session expires</th></tr></thead><tbody>{data.users.map(user => <tr key={user.userId} className="border-b border-obsidian/8 align-top"><td className="p-2"><button className="text-left font-semibold text-ember underline" onClick={() => apply({ ...filters, search: user.email })}>{user.email}</button><p>{user.name}</p><p className="text-xs text-obsidian/50">{user.userId}</p></td><td className="p-2">{user.lastSeenAt && new Date(data.generatedAt).getTime() - new Date(user.lastSeenAt).getTime() < 120000 ? <span className="font-semibold text-emerald-700">Active now</span> : 'Away / not observed'}</td><td className="p-2">{user.sessions ?? 'Unknown'}</td><td className="p-2"><p>{when(user.lastSeenAt)}</p><p className="text-xs text-obsidian/55">{user.lastPath ?? 'Page not observed'}</p></td><td className="p-2 whitespace-nowrap">{when(user.expiresAt)}</td></tr>)}</tbody></table></div>}
        <div className="flex items-center gap-3"><button className={deskButton} disabled={desk.loading || usersOffset === 0} onClick={() => setUsersOffset(Math.max(0, usersOffset - 50))}>Previous users</button><span className="text-xs">Page {Math.floor(usersOffset / 50) + 1}</span><button className={deskButton} disabled={desk.loading || usersOffset + data.users.length >= data.total} onClick={() => setUsersOffset(usersOffset + 50)}>Next users</button></div>
      </DeskPanel>
      <DeskPanel title="Activity log" description="Server requests show their HTTP result. Recorded business changes include their details. Page visits are browser observations. New tracking starts when deployed; earlier records come from the existing admin, supplier and drink ledgers.">
        {!data.entries.length ? <DeskEmpty>No activity matches these filters.</DeskEmpty> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-obsidian/55"><th className="p-2">When</th><th className="p-2">Who</th><th className="p-2">Action / record</th><th className="p-2">Result</th><th className="p-2">Details</th></tr></thead><tbody>{data.entries.map(entry => <tr key={entry.id} className="border-b border-obsidian/8 align-top"><td className="p-2 whitespace-nowrap text-xs">{when(entry.createdAt)}</td><td className="p-2 break-all"><p className="font-semibold">{entry.email || entry.actorId || (entry.detail?.actorKind === 'system' ? 'System' : 'Unattributed / guest')}</p>{entry.name && <p>{entry.name}</p>}</td><td className="p-2"><p className="font-semibold">{entry.action}</p><p className="break-all text-xs text-obsidian/55">{entry.subject}</p><span className="text-xs capitalize text-obsidian/45">{entry.category}</span></td><td className="p-2 whitespace-nowrap"><span className={(entry.status ?? 0) >= 400 ? 'text-ember' : 'text-emerald-700'}>{entry.status == null ? 'Recorded' : `HTTP ${entry.status}`}</span>{entry.durationMs != null && <p className="text-xs text-obsidian/45">{entry.durationMs} ms</p>}</td><td className="p-2">{Object.keys(entry.detail || {}).length ? <details><summary className="cursor-pointer text-ember">View details</summary><pre className="mt-2 max-w-sm whitespace-pre-wrap break-words rounded-lg bg-paper p-3 text-xs">{JSON.stringify(entry.detail, null, 2)}</pre></details> : '—'}</td></tr>)}</tbody></table></div>}
        <div className="flex items-center gap-3"><button className={deskButton} disabled={desk.loading || !cursors.length} onClick={() => setCursors(cursors.slice(0, -1))}>Newer records</button><span className="text-xs">Page {cursors.length + 1}</span><button className={deskButton} disabled={desk.loading || !data.nextCursor} onClick={() => data.nextCursor && setCursors([...cursors, data.nextCursor])}>Older records</button></div>
      </DeskPanel>
      <p className="text-xs text-obsidian/50">Last refreshed {when(data.generatedAt)}. Passwords, session tokens and request bodies are excluded from new activity records.</p>
    </>}
  </div>;
}
