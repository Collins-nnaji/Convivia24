'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface PlaceResult {
  name: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  placeId?: string;
}

interface Props {
  value: string;
  onChange: (value: string, place?: PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initGooglePlaces?: () => void;
  }
}

const GKEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;

function loadGoogleScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.places) { resolve(); return; }
    if (document.getElementById('google-places-script')) {
      // Script tag exists but not ready yet — wait for it
      window.initGooglePlaces = resolve;
      return;
    }
    window.initGooglePlaces = resolve;
    const script = document.createElement('script');
    script.id = 'google-places-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function extractCity(components: any[]): string {
  const levels = ['locality', 'administrative_area_level_1', 'country'];
  for (const level of levels) {
    const comp = components.find((c: any) => c.types.includes(level));
    if (comp) return comp.long_name;
  }
  return '';
}

/* ── With Google Places ── */
function PlacesInput({ value, onChange, placeholder, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!GKEY) return;
    loadGoogleScript(GKEY)
      .then(() => { setReady(true); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current) return;
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      fields: ['name', 'formatted_address', 'address_components', 'geometry', 'place_id'],
    });
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (!place?.geometry) return;
      const city = extractCity(place.address_components || []);
      const result: PlaceResult = {
        name: place.name || '',
        address: place.formatted_address || '',
        city,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id,
      };
      const displayValue = place.name
        ? `${place.name}, ${city || place.formatted_address}`
        : place.formatted_address;
      onChange(displayValue, result);
    });
  }, [ready, onChange]);

  if (loading) {
    return (
      <div className={`relative flex items-center ${className ?? ''}`}>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-b border-cream/20 pb-3 text-base focus:outline-none focus:border-gold placeholder:text-cream/10 transition-colors pr-8"
        />
        <Loader2 size={14} className="absolute right-0 bottom-4 text-cream/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <MapPin size={14} className="absolute left-0 bottom-4 text-gold/50 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-cream/20 pb-3 text-base focus:outline-none focus:border-gold placeholder:text-cream/10 transition-colors pl-5"
      />
    </div>
  );
}

/* ── Suggestion list for when Places is unavailable ── */
const COMMON_VENUES: Record<string, string[]> = {
  Lagos:  ['Zinc Bar, Victoria Island', 'Hard Rock Cafe, VI', 'Quilox, Victoria Island', 'The Wheatbaker, Ikoyi', 'Tarkwa Bay Beach', 'Freedom Park, Lagos Island', 'Landmark Beach, VI', 'Bar Beach, VI'],
  Abuja:  ['Transcorp Hilton, Abuja', 'Wuse 2 Restaurant Row', 'Maitama Suites', 'Jabi Lake Mall', 'NAF Conference Centre'],
  London: ['Sketch, Mayfair', 'Shoreditch House', 'The Shard, London Bridge', 'Boxpark Shoreditch', 'Pergola Paddington'],
};

export function PlacesAutocomplete({ value, onChange, placeholder, className }: Props) {
  if (GKEY) {
    return <PlacesInput value={value} onChange={onChange} placeholder={placeholder} className={className} />;
  }
  return <PlainInputWithSuggestions value={value} onChange={onChange} placeholder={placeholder} className={className} />;
}

const ALL_VENUES = Object.values(COMMON_VENUES).flat();

/* Inline suggestions powered by local list when no Google key */
function PlainInputWithSuggestions({ value, onChange, placeholder }: Props) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const getSuggestions = useCallback((q: string) => {
    if (!q || q.length < 2) return [];
    return ALL_VENUES.filter(v => v.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
  }, []);

  useEffect(() => {
    setSuggestions(focused ? getSuggestions(value) : []);
  }, [value, focused, getSuggestions]);

  // Close on outside click
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
    <div ref={containerRef} className="relative">
      <MapPin size={14} className="absolute left-0 bottom-4 text-cream/30 pointer-events-none z-10" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-cream/20 pb-3 text-base focus:outline-none focus:border-gold placeholder:text-cream/10 transition-colors pl-5"
      />
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#111] border border-cream/10 rounded-2xl shadow-2xl overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={e => { e.preventDefault(); onChange(s); setFocused(false); }}
              className="w-full text-left px-4 py-3 text-sm text-cream/70 hover:bg-gold/10 hover:text-gold flex items-center gap-2 transition-colors border-b border-cream/5 last:border-0"
            >
              <MapPin size={12} className="text-gold/40 shrink-0" />
              {s}
            </button>
          ))}
          <p className="px-4 py-2 text-[9px] text-cream/20 uppercase tracking-widest font-black">
            Add NEXT_PUBLIC_GOOGLE_PLACES_KEY for full search
          </p>
        </div>
      )}
    </div>
  );
}
