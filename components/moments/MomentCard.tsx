'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Trash2 } from 'lucide-react';
import MomentPhoto from '@/components/moments/MomentPhoto';
import { initials } from '@/components/meetup/PersonChip';
import { getVenue } from '@/lib/dining/venues';
import { REACTIONS, removeMoment, toggleReaction, type Moment } from '@/lib/moments/store';

/** "20 minutes ago" reads better than a timestamp on something this recent. */
function ago(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function MomentCard({ moment, onDelete }: { moment: Moment; onDelete?: () => void }) {
  const venue = moment.venueSlug ? getVenue(moment.venueSlug) : undefined;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35 }}
      className="bg-cream border border-obsidian/10"
    >
      {moment.photoId && (
        <MomentPhoto photoId={moment.photoId} ratio={moment.photoRatio} alt={moment.caption} />
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {moment.people.length > 0 && (
              <span className="flex -space-x-1.5 shrink-0">
                {moment.people.slice(0, 3).map((name) => (
                  <span
                    key={name}
                    title={name}
                    className="grid place-items-center w-6 h-6 rounded-full bg-obsidian text-cream text-[8px] font-black ring-2 ring-cream"
                  >
                    {initials(name)}
                  </span>
                ))}
              </span>
            )}
            <span className="text-[11px] text-obsidian/45 truncate">
              {moment.people.length > 0 ? `${moment.people.join(', ')} · ` : ''}
              {ago(moment.at)}
            </span>
          </div>

          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete this moment?')) {
                  removeMoment(moment.id);
                  onDelete();
                }
              }}
              aria-label="Delete this moment"
              className="p-1.5 -m-1 text-obsidian/20 active:text-red-600 active:scale-90 transition-all shrink-0"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {moment.caption && (
          <p className="text-obsidian/80 text-[15px] leading-relaxed mb-4">{moment.caption}</p>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1.5">
            {REACTIONS.map((emoji) => {
              const on = Boolean(moment.reactions[emoji]);
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => toggleReaction(moment.id, emoji)}
                  aria-pressed={on}
                  aria-label={`React ${emoji}`}
                  className={`w-9 h-9 grid place-items-center text-base border active:scale-90 transition-all ${
                    on ? 'bg-gold/20 border-gold' : 'border-transparent grayscale opacity-45 active:opacity-100'
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>

          {venue && (
            <Link
              href={`/places/${venue.slug}`}
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-obsidian/35 active:text-gold-dark transition-colors"
            >
              <MapPin size={11} /> {venue.name}
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}
