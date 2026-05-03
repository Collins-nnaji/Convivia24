'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';

interface PlaceResult {
  name: string;
  address: string;
  city: string;
}

interface Props {
  value: string;
  onChange: (value: string, place?: PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

const COMMON_VENUES: Record<string, string[]> = {
  Lagos: [
    'Zinc Bar, Victoria Island',
    'Hard Rock Cafe, Victoria Island',
    'Quilox, Victoria Island',
    'The Wheatbaker, Ikoyi',
    'Tarkwa Bay Beach, Lagos',
    'Freedom Park, Lagos Island',
    'Landmark Beach, Victoria Island',
    'Bar Beach, Victoria Island',
    'Eko Hotel, Victoria Island',
    'Bungalow Beach Bar, Lagos',
  ],
  Abuja: [
    'Transcorp Hilton, Abuja',
    'Wuse 2 Restaurant Row, Abuja',
    'Maitama Suites, Abuja',
    'Jabi Lake Mall, Abuja',
    'NAF Conference Centre, Abuja',
    'Sheraton Hotel, Abuja',
  ],
  London: [
    'Sketch, Mayfair, London',
    'Shoreditch House, London',
    'The Shard, London Bridge',
    'Boxpark Shoreditch, London',
    'Pergola Paddington, London',
    'Village Underground, Shoreditch',
    'Ronnie Scott\'s Jazz Club, Soho',
  ],
};

const ALL_VENUES = Object.entries(COMMON_VENUES).flatMap(([city, venues]) =>
  venues.map(v => ({ label: v, city }))
);

export function PlacesAutocomplete({ value, onChange, placeholder, className }: Props) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<{ label: string; city: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const getSuggestions = useCallback((q: string) => {
    if (!q || q.length < 2) return [];
    return ALL_VENUES.filter(v => v.label.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  }, []);

  useEffect(() => {
    setSuggestions(focused ? getSuggestions(value) : []);
  }, [value, focused, getSuggestions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50 pointer-events-none z-10" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        className="w-full bg-white border border-black/[0.09] rounded-xl px-4 pl-8 py-2.5 text-base text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-ink/25 transition-all"
      />
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white border border-black/[0.08] rounded-2xl shadow-xl overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.label}
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                onChange(s.label, { name: s.label, address: s.label, city: s.city });
                setFocused(false);
              }}
              className="w-full text-left px-4 py-3 text-sm text-ink/70 hover:bg-gold/8 hover:text-gold-dark flex items-center gap-2.5 transition-colors border-b border-black/[0.04] last:border-0"
            >
              <MapPin size={12} className="text-gold/50 shrink-0" />
              <span className="flex-1 truncate">{s.label}</span>
              <span className="text-[9px] text-ink/25 font-black uppercase tracking-widest shrink-0">{s.city}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
