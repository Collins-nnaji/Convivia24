'use client';
import { useState } from 'react';
import { useDesk } from './useDesk';
import { DeskHeader, DeskPanel, DeskEmpty, DeskStats, deskField } from './ui/DeskContent';
type Ticket = { id: string; email: string; order_id: string | null; category: string; message: string; staff_reply: string | null; status: string };
type Data = { tickets: Ticket[]; deletions: { user_id: string; deletion_requested_at: string }[] };
const statuses = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved' };
export default function SupportDesk() {
  const desk = useDesk<Data>('/api/admin/support');
  const [filter, setFilter] = useState('active'); const [search, setSearch] = useState('');
  const tickets = desk.data?.tickets || [];
  const filtered = tickets.filter(t => (filter === 'all' || (filter === 'active' ? t.status !== 'resolved' : t.status === filter)) && `${t.email} ${t.order_id || ''} ${t.message}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="space-y-6"><DeskHeader {...desk} title="Customer support" description="Review customer messages, save replies to their account, and track requests through resolution." />
    {desk.data && <><DeskStats items={[{ label: 'Open requests', value: tickets.filter(t => t.status === 'open').length }, { label: 'In progress', value: tickets.filter(t => t.status === 'in_progress').length }, { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length }, { label: 'Deletion requests', value: desk.data.deletions.length }]} />
    <DeskPanel title="Customer requests"><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Search email, order or message<input className={deskField} value={search} onChange={e => setSearch(e.target.value)} /></label><label className="text-sm">Request status<select className={deskField} value={filter} onChange={e => setFilter(e.target.value)}><option value="active">Needs attention</option><option value="all">All requests</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
    {!filtered.length && <DeskEmpty>{tickets.length ? 'No requests match this filter.' : 'No support requests yet. Customer messages will appear here when submitted.'}</DeskEmpty>}
    {filtered.map(ticket => <form key={ticket.id} className="space-y-3 border-t pt-4" onSubmit={async event => {
      event.preventDefault(); const form = new FormData(event.currentTarget);
      await desk.save({ id: ticket.id, reply: form.get('reply'), status: form.get('status') }, 'Reply and request status saved.');
    }}><p className="font-semibold break-words">{ticket.email} · {ticket.category}</p>{ticket.order_id && <a href="/admin#orders" className="text-sm text-ember break-all">Order: {ticket.order_id}</a>}<p className="whitespace-pre-wrap text-sm">{ticket.message}</p><label className="block text-sm">Reply to customer<textarea name="reply" defaultValue={ticket.staff_reply || ''} maxLength={3000} className={deskField} rows={4} /></label><p className="text-xs text-obsidian/60">Replies are saved to the customer’s account. This does not send an email.</p><div className="flex flex-wrap gap-3"><label className="text-sm">Status<select name="status" defaultValue={ticket.status} className={deskField}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="btn-brand rounded-lg px-4 py-2 self-end disabled:opacity-40" disabled={desk.busy || desk.loading}>Save reply</button></div></form>)}</DeskPanel>
    <DeskPanel title="Account deletion requests" description="Review identity and retained order records before arranging account deletion. This queue does not delete accounts automatically.">{!desk.data.deletions.length && <DeskEmpty>No account deletion requests.</DeskEmpty>}{desk.data.deletions.map(row => <p key={row.user_id} className="border-t pt-3 text-sm break-all">{row.user_id} · Requested {new Date(row.deletion_requested_at).toLocaleString()}</p>)}</DeskPanel></>}
  </div>;
}
