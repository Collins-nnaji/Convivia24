'use client';

import { useMemo, useState } from 'react';
import { Flame, Leaf, Plus, Search, Users } from 'lucide-react';
import { formatNaira, type MenuItem, type Venue } from '@/lib/dining/venues';

/**
 * The venue's menu, in the same place as the split. Tapping an item adds it to
 * the order for whoever is currently selected at the top of the page.
 */
export default function MenuPicker({
  venue,
  onAdd,
  disabled,
  countFor,
}: {
  venue: Venue;
  onAdd: (item: MenuItem) => void;
  /** True while nobody is selected — adding would have no owner. */
  disabled: boolean;
  /** How many of this item are already on the order, for the badge. */
  countFor: (itemId: string) => number;
}) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | 'food' | 'drink'>('all');

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return venue.sections
      .filter((s) => kind === 'all' || s.kind === kind)
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (i) => !q || `${i.name} ${i.note ?? ''}`.toLowerCase().includes(q),
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [venue, query, kind]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian/25" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the menu…"
            aria-label="Search the menu"
            className="w-full bg-cream border border-obsidian/15 focus:border-gold text-obsidian placeholder:text-obsidian/25 text-sm pl-11 pr-4 py-3 outline-none focus:ring-0 transition-colors"
          />
        </div>
        <div className="flex gap-px bg-obsidian/10 border border-obsidian/15">
          {(['all', 'food', 'drink'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] transition-colors ${
                kind === k ? 'bg-obsidian text-cream' : 'bg-cream text-obsidian/45 hover:text-obsidian'
              }`}
            >
              {k === 'all' ? 'Everything' : k}
            </button>
          ))}
        </div>
      </div>

      {sections.length === 0 && (
        <p className="text-obsidian/40 text-sm py-8 text-center border border-obsidian/10">
          Nothing on this menu matches &ldquo;{query}&rdquo;.
        </p>
      )}

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.name}>
            <div className="flex items-center gap-3 border-b border-obsidian/15 pb-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark">{section.name}</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-obsidian/25">
                {section.kind === 'drink' ? 'Drink' : 'Food'}
              </span>
            </div>

            <ul className="divide-y divide-obsidian/[0.07]">
              {section.items.map((item) => {
                const count = countFor(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onAdd(item)}
                      disabled={disabled}
                      className="group w-full flex items-center gap-4 py-3.5 text-left disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2 flex-wrap">
                          <span className="font-display text-lg italic text-obsidian leading-snug">{item.name}</span>
                          {item.signature && <Flame size={11} className="text-gold-dark shrink-0" aria-label="Signature" />}
                          {item.veg && <Leaf size={11} className="text-emerald-600/70 shrink-0" aria-label="Vegetarian" />}
                          {item.shareable && <Users size={11} className="text-obsidian/25 shrink-0" aria-label="For the table" />}
                          {count > 0 && (
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gold-dark bg-gold/15 px-1.5 py-0.5">
                              {count} on the order
                            </span>
                          )}
                        </span>
                        {item.note && <span className="block text-obsidian/35 text-xs mt-0.5">{item.note}</span>}
                      </span>

                      <span className="text-obsidian/60 text-sm tabular-nums shrink-0">{formatNaira(item.price)}</span>
                      <span
                        className={`grid place-items-center w-8 h-8 shrink-0 border transition-colors ${
                          disabled
                            ? 'border-obsidian/10 text-obsidian/20'
                            : 'border-obsidian/15 text-obsidian/40 group-hover:bg-gold group-hover:border-gold group-hover:text-obsidian'
                        }`}
                      >
                        <Plus size={14} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
