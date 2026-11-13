import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type Action = { label: string; href: string; primary?: boolean };

/**
 * Empty, signed-out and "nothing here yet" states — one look everywhere: a cream panel,
 * an icon roundel, a serif line and pill actions.
 */
export default function StateCard({
  icon: Icon,
  title,
  body,
  actions = [],
  tone = 'saffron',
  className = '',
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  actions?: Action[];
  tone?: 'saffron' | 'lilac' | 'blush';
  className?: string;
}) {
  const ring = { saffron: 'bg-saffron', lilac: 'bg-lilac', blush: 'bg-blush' }[tone];
  return (
    <div className={`rounded-3xl bg-shell px-6 py-12 text-center sm:px-10 sm:py-14 ${className}`}>
      <span className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${ring}`}>
        <Icon className="h-9 w-9 text-obsidian" strokeWidth={1.4} />
      </span>
      <p className="mt-5 font-serif text-2xl font-light text-obsidian sm:text-[1.75rem]">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-obsidian/60">{body}</p>}
      {actions.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={
                a.primary === false
                  ? 'rounded-full border border-obsidian/20 bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-obsidian hover:border-obsidian'
                  : 'rounded-full bg-obsidian px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-ember'
              }
            >
              {a.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
