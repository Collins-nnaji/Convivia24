'use client';

import { useEffect, useState } from 'react';
import { Megaphone, Send, Clock, Paperclip } from 'lucide-react';
import { useAdmin } from '../layout';

interface EventRow { id: string; title: string; slug: string }
interface Broadcast {
  id: string;
  subject: string;
  body: string;
  channel: string;
  sent_at: string | null;
  scheduled_for: string | null;
  recipient_count: number;
  attachment_url?: string | null;
}

export default function BroadcastPage() {
  const { secret } = useAdmin();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [attachment, setAttachment] = useState<{ url: string; blob_name: string } | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/events?all=1', { headers: { 'x-admin-secret': secret } })
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []));
  }, [secret]);

  function loadBroadcasts(slug: string) {
    setSelected(slug);
    fetch(`/api/events/${slug}/broadcasts`, { headers: { 'x-admin-secret': secret } })
      .then((r) => r.json())
      .then((d) => setBroadcasts(d.broadcasts ?? []));
  }

  async function uploadAttachment(file: File) {
    if (!selected) return;
    setUploadingAttachment(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('purpose', 'broadcast-attachment');
      const res = await fetch(`/api/events/${selected}/media`, {
        method: 'POST',
        headers: { 'x-admin-secret': secret },
        body: fd,
      });
      const data = await res.json();
      if (res.ok) setAttachment({ url: data.url, blob_name: data.blob_name });
    } finally {
      setUploadingAttachment(false);
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSending(true);
    try {
      await fetch(`/api/events/${selected}/broadcasts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({
          subject,
          body,
          scheduled_for: scheduledFor || null,
          attachment_url: attachment?.url,
          attachment_blob_name: attachment?.blob_name,
        }),
      });
      setSubject('');
      setBody('');
      setScheduledFor('');
      setAttachment(null);
      loadBroadcasts(selected);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-light italic text-obsidian mb-2">Broadcast hub</h1>
      <p className="text-obsidian/40 text-sm mb-8">Text or email your entire guest list — parking pins, door times, last-call cues.</p>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-2">
          {events.map((e) => (
            <button key={e.id} type="button" onClick={() => loadBroadcasts(e.slug)} className={`w-full text-left glass-card p-4 ${selected === e.slug ? 'ring-2 ring-gold' : ''}`}>
              <p className="font-display italic text-lg">{e.title}</p>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {selected ? (
            <>
              <form onSubmit={send} className="glass-card p-6 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold-dark flex items-center gap-2">
                  <Megaphone size={14} /> New broadcast
                </p>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Subject — e.g. 3 hours until doors" className="w-full border-b border-obsidian/20 py-2 text-sm outline-none bg-transparent" />
                <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={4} placeholder="Message body…" className="w-full border border-obsidian/15 p-3 text-sm outline-none bg-white/50 resize-none" />
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-obsidian/40 flex items-center gap-1 mb-1">
                    <Paperclip size={10} /> Attachment (optional — parking map, flyer)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gold-dark cursor-pointer">
                      {uploadingAttachment ? 'Uploading…' : 'Upload image'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAttachment(f); }} />
                    </label>
                    {attachment && <span className="text-xs text-obsidian/50 truncate max-w-[200px]">Attached ✓</span>}
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-obsidian/40 flex items-center gap-1 mb-1">
                      <Clock size={10} /> Schedule (optional)
                    </label>
                    <input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} className="text-sm border border-obsidian/15 px-2 py-1.5" />
                  </div>
                  <button type="submit" disabled={sending} className="inline-flex items-center gap-2 bg-gold text-obsidian text-[11px] font-black uppercase tracking-[0.15em] px-5 py-2.5 disabled:opacity-50">
                    <Send size={14} /> {sending ? 'Sending…' : scheduledFor ? 'Schedule' : 'Send now'}
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {broadcasts.map((b) => (
                  <div key={b.id} className="glass-card p-4">
                    <p className="font-semibold text-sm">{b.subject}</p>
                    <p className="text-sm text-obsidian/60 mt-1">{b.body}</p>
                    {b.attachment_url && (
                      <a href={b.attachment_url} target="_blank" rel="noreferrer" className="text-xs text-gold-dark mt-2 inline-block">View attachment →</a>
                    )}
                    <p className="text-[10px] text-obsidian/40 mt-2 uppercase tracking-wider">
                      {b.recipient_count} recipients · {b.sent_at ? `Sent ${new Date(b.sent_at).toLocaleString()}` : b.scheduled_for ? `Scheduled ${new Date(b.scheduled_for).toLocaleString()}` : 'Draft'}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-obsidian/40 text-sm">Select an event to broadcast.</p>
          )}
        </div>
      </div>
    </div>
  );
}
