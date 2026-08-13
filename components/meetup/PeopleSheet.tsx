'use client';

import { useState, type FormEvent } from 'react';
import { Check, Plus, UserPlus, X } from 'lucide-react';
import Sheet from '@/components/ui/Sheet';
import { initials } from '@/components/meetup/PersonChip';
import { formatNaira } from '@/lib/dining/venues';
import type { Attendee } from '@/lib/split/compute';

/**
 * Managing the table: names, budgets, who is you, and the people this device
 * has eaten with before (two taps instead of typing a name again).
 */
export default function PeopleSheet({
  open,
  onClose,
  attendees,
  youId,
  contacts,
  onAdd,
  onUpdate,
  onRemove,
  onSetYou,
}: {
  open: boolean;
  onClose: () => void;
  attendees: Attendee[];
  youId?: string;
  contacts: Array<{ name: string; budget?: number }>;
  onAdd: (name: string, budget?: number) => void;
  onUpdate: (id: string, patch: Partial<Attendee>) => void;
  onRemove: (id: string) => void;
  onSetYou: (id: string) => void;
}) {
  const [name, setName] = useState('');

  const atTable = new Set(attendees.map((a) => a.name.trim().toLowerCase()));
  const suggestions = contacts.filter((c) => !atTable.has(c.name.toLowerCase())).slice(0, 8);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName('');
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="The table"
      subtitle="Set a budget and anyone going past it gets flagged."
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full px-6 py-4 bg-obsidian active:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-transform"
        >
          Done
        </button>
      }
    >
      <ul className="space-y-3 mb-7">
        {attendees.map((a) => {
          const isYou = a.id === youId;
          return (
            <li key={a.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSetYou(a.id)}
                aria-label={isYou ? `${a.name} is you` : `Mark ${a.name} as you`}
                aria-pressed={isYou}
                className={`relative grid place-items-center w-9 h-9 rounded-full text-[10px] font-black shrink-0 transition-colors ${
                  isYou ? 'bg-gold text-obsidian' : 'bg-obsidian text-cream'
                }`}
              >
                {initials(a.name)}
                {isYou && (
                  <span className="absolute -bottom-1 -right-1 grid place-items-center w-4 h-4 rounded-full bg-obsidian">
                    <Check size={9} className="text-gold" strokeWidth={3.5} />
                  </span>
                )}
              </button>

              <input
                value={a.name}
                onChange={(e) => onUpdate(a.id, { name: e.target.value })}
                aria-label="Name"
                className="flex-1 min-w-0 bg-transparent border-b border-obsidian/15 focus:border-gold text-obsidian py-2 px-0 outline-none focus:ring-0 transition-colors"
              />
              <input
                value={a.budget ?? ''}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^0-9]/g, ''));
                  onUpdate(a.id, { budget: n > 0 ? n : undefined });
                }}
                inputMode="numeric"
                placeholder="₦ budget"
                aria-label={`Budget for ${a.name}`}
                className="w-24 bg-transparent border-b border-obsidian/15 focus:border-gold text-obsidian py-2 px-0 tabular-nums outline-none focus:ring-0 transition-colors"
              />
              <button
                type="button"
                onClick={() => onRemove(a.id)}
                disabled={attendees.length <= 1}
                aria-label={`Remove ${a.name}`}
                className="p-2 text-obsidian/25 active:text-red-600 disabled:opacity-20 active:scale-90 transition-all"
              >
                <X size={16} />
              </button>
            </li>
          );
        })}
      </ul>

      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-2">
        Tap a circle to mark who you are
      </p>

      <form onSubmit={submit} className="flex gap-2 mt-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add someone…"
          aria-label="Add someone"
          className="flex-1 bg-cream border border-obsidian/15 focus:border-gold text-obsidian placeholder:text-obsidian/25 px-4 py-3 outline-none focus:ring-0 transition-colors"
        />
        <button
          type="submit"
          aria-label="Add"
          className="px-5 bg-gold active:bg-gold-light text-obsidian active:scale-95 transition-transform"
        >
          <Plus size={18} />
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-6">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-3">
            <UserPlus size={11} className="inline mr-1.5 -mt-0.5" />
            People you have eaten with
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => onAdd(c.name, c.budget)}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-obsidian/20 text-obsidian/60 text-xs active:bg-obsidian active:text-cream active:scale-95 transition-all"
              >
                <Plus size={11} /> {c.name}
                {c.budget && <span className="text-obsidian/30 tabular-nums">{formatNaira(c.budget)}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  );
}
