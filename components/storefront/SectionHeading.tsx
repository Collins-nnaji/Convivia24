import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/** Centred editorial heading used by every home section. */
export default function SectionHeading({
  title,
  intro,
  href,
  linkLabel = 'View all',
  align = 'center',
}: {
  title: string;
  intro?: string;
  href?: string;
  linkLabel?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={`mb-8 sm:mb-10 ${align === 'center' ? 'text-center' : 'flex items-end justify-between gap-4'}`}>
      <div className={align === 'center' ? 'mx-auto max-w-3xl' : ''}>
        <h2 className="font-serif text-[1.9rem] font-light leading-tight tracking-tight text-obsidian sm:text-[2.5rem]">{title}</h2>
        {intro && <p className="mt-3 text-[15px] leading-relaxed text-obsidian/65 sm:text-base">{intro}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className={`inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-obsidian underline decoration-obsidian/30 underline-offset-4 hover:decoration-obsidian ${
            align === 'center' ? 'mt-3' : ''
          }`}
        >
          {linkLabel} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
