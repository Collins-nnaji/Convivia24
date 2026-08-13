'use client';

import type { Attendee } from '@/lib/split/compute';

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** A togglable person, used for "who is this for?" everywhere in the app. */
export default function PersonChip({
  person,
  selected,
  onClick,
  size = 'md',
}: {
  person: Attendee;
  selected: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick, 'aria-pressed': selected } : {})}
      className={`inline-flex items-center gap-2 border transition-colors whitespace-nowrap ${
        size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3.5 py-2 text-xs'
      } ${
        selected
          ? 'bg-obsidian border-obsidian text-cream'
          : 'bg-transparent border-obsidian/20 text-obsidian/50 hover:border-obsidian/50 hover:text-obsidian'
      }`}
    >
      <span
        className={`grid place-items-center rounded-full font-black tracking-tight ${
          size === 'sm' ? 'w-4 h-4 text-[7px]' : 'w-5 h-5 text-[8px]'
        } ${selected ? 'bg-gold text-obsidian' : 'bg-obsidian/10 text-obsidian/60'}`}
      >
        {initials(person.name)}
      </span>
      <span className="font-medium">{person.name}</span>
    </Tag>
  );
}
