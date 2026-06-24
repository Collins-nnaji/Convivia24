// TMDB client — powers movie recommendations from a taste genre, with a
// trailer link per movie. Degrades to "not configured" until TMDB_API_KEY is set.

export function tmdbConfigured(): boolean {
  return !!process.env.TMDB_API_KEY;
}

export interface MovieRecommendation {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  trailerUrl: string | null;
}

interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
}

interface TmdbVideo {
  site: string;
  type: string;
  key: string;
}

async function tmdbGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error('TMDB is not configured.');
  const qs = new URLSearchParams({ api_key: key, ...params });
  const res = await fetch(`https://api.themoviedb.org/3${path}?${qs.toString()}`);
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return res.json();
}

async function trailerUrl(movieId: number): Promise<string | null> {
  try {
    const data = await tmdbGet<{ results: TmdbVideo[] }>(`/movie/${movieId}/videos`, {});
    const trailer = data.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer');
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  } catch {
    return null;
  }
}

/** Top popular movies for a genre, each with a trailer link when one exists. */
export async function discoverMoviesByGenre(genreId: number, count = 4): Promise<MovieRecommendation[]> {
  const data = await tmdbGet<{ results: TmdbMovie[] }>('/discover/movie', {
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    include_adult: 'false',
  });

  const top = data.results.slice(0, count);
  const trailers = await Promise.all(top.map((m) => trailerUrl(m.id)));

  return top.map((m, i) => ({
    id: m.id,
    title: m.title,
    overview: m.overview,
    posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : null,
    trailerUrl: trailers[i],
  }));
}
