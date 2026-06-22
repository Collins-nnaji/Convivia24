'use client';

import { useEffect, useState } from 'react';
import { CalendarPlus2 } from 'lucide-react';
import type { SupporterProfile } from '@/lib/support/repo';
import { supportTagLabel } from '@/lib/support/tags';
import BookSessionForm from '@/components/support/BookSessionForm';

export default function SupporterDirectory({ onBooked }: { onBooked?: () => void }) {
  const [supporters, setSupporters] = useState<SupporterProfile[] | null>(null);
  const [booking, setBooking] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/support/supporters')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSupporters(d?.supporters ?? []))
      .catch(() => setSupporters([]));
  }, []);

  if (!supporters) return null;

  if (supporters.length === 0) {
    return <p className="text-sm text-obsidian/45">No one's listed as a supporter yet — be the first to offer a listening ear below.</p>;
  }

  return (
    <div className="space-y-3">
      {supporters.map((s) => (
        <div key={s.user_id} className="p-4 rounded-xl border border-obsidian/10 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display italic text-lg text-obsidian">{s.display_name}</p>
              {s.bio && <p className="text-sm text-obsidian/60 mt-1">{s.bio}</p>}
              {s.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {s.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-gold/10 text-gold-dark text-[10px] font-bold uppercase tracking-wide">
                      {supportTagLabel(t) ?? t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {sentTo.has(s.user_id) ? (
              <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.12em] text-gold-dark">Requested</span>
            ) : (
              <button
                onClick={() => setBooking(booking === s.user_id ? null : s.user_id)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 border border-obsidian/15 hover:border-gold text-obsidian/70 text-[10px] font-black uppercase tracking-[0.12em] transition-colors"
              >
                <CalendarPlus2 size={13} /> Book
              </button>
            )}
          </div>
          {booking === s.user_id && (
            <BookSessionForm
              supporter={s}
              onCancel={() => setBooking(null)}
              onBooked={() => { setBooking(null); setSentTo((set) => new Set(set).add(s.user_id)); onBooked?.(); }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
