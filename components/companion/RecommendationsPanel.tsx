'use client';

import { useEffect, useState } from 'react';
import { Film, Music, PlayCircle } from 'lucide-react';
import Collapsible from '@/components/calendar/Collapsible';
import type { MovieRecommendation } from '@/lib/recommend/tmdb';
import type { TrackRecommendation } from '@/lib/recommend/spotify';

interface Recommendations {
  moviesConfigured: boolean;
  tracksConfigured: boolean;
  movies: MovieRecommendation[];
  tracks: TrackRecommendation[];
  moodContext: 'low' | null;
}

/** Movies/tracks picked from what the companion has learned about your taste so far. */
export default function RecommendationsPanel() {
  const [recs, setRecs] = useState<Recommendations | null>(null);

  useEffect(() => {
    fetch('/api/recommendations')
      .then((res) => (res.ok ? res.json() : null))
      .then(setRecs)
      .catch(() => setRecs(null));
  }, []);

  if (!recs || (recs.movies.length === 0 && recs.tracks.length === 0)) return null;

  return (
    <Collapsible title="Picked for your taste" icon={<Film size={13} className="text-gold-dark" />} defaultOpen>
      <div className="space-y-5">
        {recs.moodContext === 'low' && (
          <p className="text-xs text-obsidian/50 italic -mt-1">Today&rsquo;s been a bit rough, so these lean easy and calming.</p>
        )}
        {recs.movies.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-obsidian/40 mb-2.5">
              <Film size={12} /> Movies for you
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recs.movies.map((m) => (
                <div key={m.id} className="shrink-0 w-32">
                  {m.posterUrl ? (
                    <img src={m.posterUrl} alt={m.title} className="w-32 h-48 object-cover rounded-lg border border-obsidian/10" />
                  ) : (
                    <div className="w-32 h-48 rounded-lg border border-obsidian/10 bg-obsidian/5" />
                  )}
                  <p className="text-xs font-medium text-obsidian mt-1.5 leading-snug line-clamp-2">{m.title}</p>
                  {m.trailerUrl && (
                    <a
                      href={m.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-gold-dark hover:underline mt-0.5"
                    >
                      <PlayCircle size={12} /> Trailer
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {recs.tracks.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-obsidian/40 mb-2.5">
              <Music size={12} /> Tracks for you
            </p>
            <div className="space-y-2">
              {recs.tracks.map((t) => (
                <a
                  key={t.id}
                  href={t.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-obsidian/[0.03] transition-colors"
                >
                  {t.albumArtUrl ? (
                    <img src={t.albumArtUrl} alt={t.title} className="w-10 h-10 rounded-md object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-obsidian/5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-obsidian truncate">{t.title}</p>
                    <p className="text-[11px] text-obsidian/45 truncate">{t.artist}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Collapsible>
  );
}
