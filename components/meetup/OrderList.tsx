'use client';

import { useState } from 'react';
import { Minus, Plus, Users, X } from 'lucide-react';
import { initials } from '@/components/meetup/PersonChip';
import { formatNaira, getMenuItem, type Venue } from '@/lib/dining/venues';
import type { Attendee, OrderLine } from '@/lib/split/compute';

/**
 * The order as it stands. Each line shows who is carrying it — tap the people
 * to change who a plate belongs to, which is where most of the arguing usually
 * happens.
 */
export default function OrderList({
  venue,
  attendees,
  lines,
  onQty,
  onPayers,
  onRemove,
}: {
  venue: Venue;
  attendees: Attendee[];
  lines: OrderLine[];
  onQty: (lineId: string, qty: number) => void;
  onPayers: (lineId: string, payerIds: string[]) => void;
  onRemove: (lineId: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);

  if (lines.length === 0) {
    return (
      <div className="border border-dashed border-obsidian/20 p-8 text-center">
        <p className="font-display text-xl italic text-obsidian/70 mb-1">Nothing ordered yet.</p>
        <p className="text-obsidian/40 text-xs">
          Pick who it&apos;s for, then tap anything on the menu.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-obsidian/10 border-y border-obsidian/10">
      {lines.map((line) => {
        const item = getMenuItem(venue, line.itemId);
        if (!item) return null;
        const carriers = attendees.filter((a) => line.payerIds.includes(a.id));
        const lineTotal = item.price * line.qty;
        const open = editing === line.id;

        return (
          <li key={line.id} className="py-3.5">
            <div className="flex items-start gap-3">
              {/* qty stepper */}
              <div className="flex items-center border border-obsidian/15 shrink-0">
                <button
                  type="button"
                  onClick={() => onQty(line.id, line.qty - 1)}
                  aria-label={`One fewer ${item.name}`}
                  className="p-1.5 text-obsidian/40 hover:text-obsidian hover:bg-obsidian/5 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-xs font-bold tabular-nums text-obsidian">{line.qty}</span>
                <button
                  type="button"
                  onClick={() => onQty(line.id, line.qty + 1)}
                  aria-label={`One more ${item.name}`}
                  className="p-1.5 text-obsidian/40 hover:text-obsidian hover:bg-obsidian/5 transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg italic text-obsidian leading-snug truncate">{item.name}</span>
                  <span className="text-obsidian/60 text-sm tabular-nums shrink-0">{formatNaira(lineTotal)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setEditing(open ? null : line.id)}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-obsidian/45 hover:text-gold-dark transition-colors"
                >
                  {carriers.length > 1 && <Users size={11} />}
                  <span className="flex -space-x-1">
                    {carriers.map((c) => (
                      <span
                        key={c.id}
                        title={c.name}
                        className="grid place-items-center w-4 h-4 rounded-full bg-obsidian text-cream text-[7px] font-black ring-1 ring-cream"
                      >
                        {initials(c.name)}
                      </span>
                    ))}
                  </span>
                  <span>
                    {carriers.length === 1
                      ? carriers[0].name
                      : `Split ${carriers.length} ways · ${formatNaira(lineTotal / carriers.length)} each`}
                  </span>
                </button>

                {open && (
                  <div className="mt-3 p-3 bg-cream border border-obsidian/10">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-2">
                      Who is having this?
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {attendees.map((a) => {
                        const on = line.payerIds.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              const next = on
                                ? line.payerIds.filter((id) => id !== a.id)
                                : [...line.payerIds, a.id];
                              if (next.length > 0) onPayers(line.id, next);
                            }}
                            aria-pressed={on}
                            className={`px-2.5 py-1 text-[10px] font-medium border transition-colors ${
                              on
                                ? 'bg-obsidian border-obsidian text-cream'
                                : 'border-obsidian/20 text-obsidian/50 hover:border-obsidian/50'
                            }`}
                          >
                            {a.name}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => onPayers(line.id, attendees.map((a) => a.id))}
                        className="px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] border border-gold text-gold-dark hover:bg-gold hover:text-obsidian transition-colors"
                      >
                        Whole table
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onRemove(line.id)}
                aria-label={`Remove ${item.name}`}
                className="p-1.5 text-obsidian/25 hover:text-red-600 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
