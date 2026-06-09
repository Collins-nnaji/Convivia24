'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
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
    full: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' +
          d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function EventCard({ event, index = 0 }: { event: EventCardData; index?: number }) {
  const d = dateBits(event.starts_at);
  const price = event.min_price != null ? priceLabel(event.min_price, event.currency) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.07 }}
    >
      <Link
        href={`/events/${event.slug}`}
        className="group block bg-obsidian-100 border border-gold/10 hover:border-gold/30 transition-all duration-300 overflow-hidden"
      >
        <div className="relative overflow-hidden aspect-[16/10]">
          <img src={img(event)} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
          <div className="absolute top-3 left-3 bg-obsidian/90 backdrop-blur-sm border border-gold/20 px-2.5 py-1.5 text-center leading-none">
            <p className="font-display text-xl italic text-gold leading-none">{d.day}</p>
            <p className="text-[8px] font-black tracking-[0.2em] text-cream/60 mt-0.5">{d.mon}</p>
          </div>
          {event.is_featured && (
            <span className="absolute top-3 right-3 bg-gold text-obsidian text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1">Featured</span>
          )}
          <span className="absolute bottom-3 left-3 text-[9px] font-black uppercase tracking-[0.25em] text-gold/80">
            {CATEGORY_LABELS[event.category] ?? event.category}
          </span>
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl sm:text-2xl italic text-cream leading-tight mb-1 group-hover:text-gold transition-colors">{event.title}</h3>
          {event.tagline && <p className="text-cream/40 text-sm mb-3 line-clamp-1">{event.tagline}</p>}
          <div className="flex items-center gap-1.5 text-cream/45 text-xs mb-1">
            <Calendar size={12} className="text-gold/60 shrink-0" /> {d.full}
          </div>
          <div className="flex items-center gap-1.5 text-cream/45 text-xs mb-4">
            <MapPin size={12} className="text-gold/60 shrink-0" /> {event.venue ? `${event.venue}, ` : ''}{event.city}
          </div>
          <div className="flex items-center justify-between border-t border-gold/10 pt-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/40">
              {price ? <>From <span className="text-gold">{price}</span></> : 'Free'}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/70 group-hover:text-gold">Get Tickets &rarr;</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
