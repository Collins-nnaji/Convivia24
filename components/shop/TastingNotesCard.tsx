import { Droplet, Palette, Sparkles, Wind } from 'lucide-react';
import { tastingProfile } from '@/lib/drinks/tasting';
import { TASTE_NOTES } from '@/lib/drinks/brand-guide';

const ROWS = [
  { key: 'colour', label: 'Colour', icon: Palette },
  { key: 'nose', label: 'Nose', icon: Wind },
  { key: 'palate', label: 'Palate', icon: Droplet },
  { key: 'finish', label: 'Finish', icon: Sparkles },
] as const;

/**
 * The four-row breakdown when we hold a written profile for the bottle, the
 * single house note when we only have prose, and nothing at all when we have
 * neither — rather than filling the card with guesses.
 */
export default function TastingNotesCard({ slug, className = '' }: { slug: string; className?: string }) {
  const profile = tastingProfile(slug);
  const prose = TASTE_NOTES[slug];
  if (!profile && !prose) return null;

  return (
    <div className={`bg-paper border border-obsidian/8 ${className}`}>
      <div className="px-5 py-3.5 border-b border-obsidian/8">
        <h3 className="text-sm font-bold">Tasting notes</h3>
      </div>

      {profile ? (
        <ul className="divide-y divide-obsidian/6">
          {ROWS.map(({ key, label, icon: Icon }) => (
            <li key={key} className="px-5 py-3 flex items-start gap-3">
              <Icon size={14} className="text-ember shrink-0 mt-0.5" />
              <span className="text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 w-14 shrink-0 mt-0.5">
                {label}
              </span>
              <span className="text-sm text-obsidian/65 leading-snug">{profile[key]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-4 text-sm text-obsidian/60 leading-relaxed">{prose}</p>
      )}
    </div>
  );
}
