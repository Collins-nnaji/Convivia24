'use client';

import { useState } from 'react';

type Client = { id: string; name: string };

export default function LeadActions({
  leadId, status, clients, assignedClient
}: { leadId: string; status: string; clients: Client[]; assignedClient?: string }) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [selectedClient, setSelectedClient] = useState(assignedClient || '');
  const [saving, setSaving] = useState(false);

  async function update(patch: Record<string, string>) {
    setSaving(true);
    await fetch(`/api/admin/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setSaving(false);
  }

  async function handleStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    setCurrentStatus(e.target.value);
    await update({ status: e.target.value });
  }

  async function handleAssign(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedClient(e.target.value);
    await update({ assigned_client: e.target.value });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select value={currentStatus} onChange={handleStatus} disabled={saving}
        className="bg-zinc-800 border border-zinc-700 text-white text-[11px] font-black uppercase px-2 py-1.5 focus:outline-none focus:border-red-700 disabled:opacity-50">
        {['new','contacted','converted','rejected'].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select value={selectedClient} onChange={handleAssign} disabled={saving}
        className="bg-zinc-800 border border-zinc-700 text-zinc-400 text-[11px] px-2 py-1.5 focus:outline-none focus:border-red-700 disabled:opacity-50">
        <option value="">Assign to client…</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {saving && <span className="text-[10px] text-zinc-600">Saving…</span>}
    </div>
  );
}
