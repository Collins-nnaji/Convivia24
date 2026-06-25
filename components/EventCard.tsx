'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/categories';
import { priceLabel } from '@/lib/money';

export interface EventCardData {
  slug: string;
  title: string;
  tagline?: string | null;
  category: string;
  city: string;
  venue?: string | null;
  starts_at: string;
  cover_image?: string | null;
  currency: string;
  min_price?: string | number | null;
  is_featured?: boolean;
}

const FALLBACKS = ['/The Spaces2.png', '/Convivium.png', '/conv1.png', '/Convivium2.png', '/Convivium3.png', '/dealrooms.png'];

function img(e: EventCardData): string {
  if (e.cover_image) return e.cover_image;
  return FALLBACKS[(e.slug.charCodeAt(0) || 0) % FALLBACKS.length];
}

function dateBits(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString('en-GB', { day: '2-digit' }),
    mon: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    full: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
      + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function EventCard({ event, index = 0 }: { event: EventCardData; index?: number }) {
  const d = dateBits(event.starts_at);
  const price = event.min_price != null ? priceLabel(event.min_price, event.currency) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/events/${event.slug}`}
        className="group block overflow-hidden rounded-2xl border border-ink/8 bg-surface-elevated shadow-soft hover:shadow-lift hover:border-copper/25 transition-all duration-300"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={img(event)}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-ink/10 to-transparent" />
          <div className="absolute top-3 left-3 flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-surface-elevated/95 backdrop-blur-sm shadow-soft">
            <span className="font-display text-2xl font-medium leading-none text-copper-deep">{d.day}</span>
            <span className="text-[8px] font-bold tracking-[0.18em] text-ink-muted mt-0.5">{d.mon}</span>
          </div>
          {event.is_featured && (
            <span className="absolute top-3 right-3 rounded-full bg-copper px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white">
              Featured
            </span>
          )}
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/50 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-pearl">
            {CATEGORY_LABELS[event.category] ?? event.category}
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <h3 className="font-display text-lg sm:text-2xl italic text-ink leading-snug group-hover:text-copper-deep transition-colors line-clamp-2">
            {event.title}
          </h3>
          {event.tagline && <p className="text-ink-muted text-sm mt-1 line-clamp-1">{event.tagline}</p>}
          <div className="mt-4 space-y-1.5 text-xs text-ink-muted">
            <p className="flex items-center gap-2"><Calendar size={13} className="text-copper shrink-0" />{d.full}</p>
            <p className="flex items-center gap-2"><MapPin size={13} className="text-copper shrink-0" />{event.venue ? `${event.venue}, ` : ''}{event.city}</p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-4">
            <span className="text-sm font-semibold text-ink">
              {price ? <>From <span className="text-copper">{price}</span></> : 'Free entry'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-copper group-hover:gap-2 transition-all">
              Tickets <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
