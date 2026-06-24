'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserCheck, Check, X, ExternalLink } from 'lucide-react';
import { useAdmin } from '../layout';

interface Application {
  id: string;
  event_id: string;
  applicant_name: string;
  applicant_email: string;
  linkedin_url: string | null;
  instagram_url: string | null;
  application_text: string | null;
  status: string;
  created_at: string;
}

interface EventRow { id: string; title: string; slug: string; guestlist_mode?: string }

export default function GuestlistPage() {
  const { secret } = useAdmin();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events?all=1', { headers: { 'x-admin-secret': secret } })
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .finally(() => setLoading(false));
  }, [secret]);

  function loadApps(slug: string) {
    setSelected(slug);
    fetch(`/api/events/${slug}/guestlist?status=pending`, { headers: { 'x-admin-secret': secret } })
      .then((r) => r.json())
      .then((d) => setApps(d.applications ?? []));
  }

  async function review(appId: string, status: 'approved' | 'rejected') {
    await fetch(`/api/events/${selected}/guestlist/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ status }),
    });
    if (selected) loadApps(selected);
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-light italic text-obsidian mb-2">Guestlist approvals</h1>
      <p className="text-obsidian/40 text-sm mb-8">Review applications before guests can purchase tickets.</p>

      {loading ? (
        <p className="text-obsidian/30 text-sm">Loading…</p>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-2">
            {events.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => loadApps(e.slug)}
                className={`w-full text-left glass-card p-4 transition-all ${selected === e.slug ? 'ring-2 ring-gold' : ''}`}
              >
                <p className="font-display italic text-lg leading-tight">{e.title}</p>
                {e.guestlist_mode === 'approval' && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-gold-dark mt-1 inline-block">Approval required</span>
                )}
              </button>
            ))}
          </div>

          <div>
            {!selected ? (
              <p className="text-obsidian/40 text-sm">Select an event to review applications.</p>
            ) : apps.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <UserCheck className="mx-auto mb-3 text-gold-dark opacity-50" size={28} />
                <p className="text-obsidian/50 text-sm">No pending applications.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {apps.map((a) => (
                  <div key={a.id} className="glass-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-xl italic">{a.applicant_name}</p>
                        <p className="text-sm text-obsidian/55">{a.applicant_email}</p>
                        {a.application_text && <p className="text-sm mt-3 text-obsidian/70">{a.application_text}</p>}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs">
                          {a.linkedin_url && <a href={a.linkedin_url} target="_blank" rel="noreferrer" className="text-gold-dark inline-flex items-center gap-1">LinkedIn <ExternalLink size={10} /></a>}
                          {a.instagram_url && <a href={a.instagram_url} target="_blank" rel="noreferrer" className="text-gold-dark inline-flex items-center gap-1">Instagram <ExternalLink size={10} /></a>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => review(a.id, 'approved')} className="inline-flex items-center gap-1 px-4 py-2 bg-gold text-obsidian text-[10px] font-black uppercase tracking-wider">
                          <Check size={14} /> Approve
                        </button>
                        <button type="button" onClick={() => review(a.id, 'rejected')} className="inline-flex items-center gap-1 px-4 py-2 border border-obsidian/20 text-[10px] font-black uppercase tracking-wider">
                          <X size={14} /> Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <p className="mt-8 text-xs text-obsidian/40">
        Enable approval-only guestlists per event in the <Link href="/admin/events" className="text-gold-dark underline">event editor</Link>.
      </p>
    </div>
  );
}
