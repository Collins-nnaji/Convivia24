// Combines learned taste answers with the TMDB/Spotify clients into a single
// recommendation payload for the companion UI.

import { getTaste } from '@/lib/profile/taste';
import { TASTE_QUESTIONS } from '@/lib/profile/tasteQuestions';
import { getRecentCheckIns } from '@/lib/checkin/repo';
import { tmdbConfigured, discoverMoviesByGenre, type MovieRecommendation } from '@/lib/recommend/tmdb';
import { spotifyConfigured, searchTracksByGenre, type TrackRecommendation } from '@/lib/recommend/spotify';

export interface Recommendations {
  moviesConfigured: boolean;
  tracksConfigured: boolean;
  movies: MovieRecommendation[];
  tracks: TrackRecommendation[];
  /** Set when a recent low mood/energy check-in nudged the picks toward something easier. */
  moodContext: 'low' | null;
}

const LOW_MOODS = new Set(['rough', 'bad']);

function findOption(questionId: string, value: string) {
  const question = TASTE_QUESTIONS.find((q) => q.id === questionId);
  return question?.options.find((o) => o.value === value);
}

export async function getRecommendations(userId: string): Promise<Recommendations> {
  const [taste, recentCheckIns] = await Promise.all([getTaste(userId), getRecentCheckIns(userId, 3)]);
  const moviesConfigured = tmdbConfigured();
  const tracksConfigured = spotifyConfigured();

  const latest = recentCheckIns[recentCheckIns.length - 1];
  const lowMood = !!latest && (LOW_MOODS.has(latest.mood ?? '') || latest.energy === 'low');
  const moodContext: Recommendations['moodContext'] = lowMood ? 'low' : null;

  let movies: MovieRecommendation[] = [];
  let tracks: TrackRecommendation[] = [];

  // A rough recent day nudges movies toward something easier (comedy) over the usual taste.
  const movieGenre = lowMood
    ? 35
    : taste.movie_genre ? findOption('movie_genre', taste.movie_genre)?.tmdbGenre : undefined;
  if (moviesConfigured && movieGenre) {
    movies = await discoverMoviesByGenre(movieGenre).catch(() => []);
  }

  // Prefer the explicit music genre; fall back to the mood-based genre keyword;
  // a rough recent day overrides toward something calming regardless of taste.
  const musicGenre = lowMood
    ? 'chill'
    : taste.music_genre
      ? findOption('music_genre', taste.music_genre)?.spotifyGenre
      : taste.music_mood
        ? findOption('music_mood', taste.music_mood)?.spotifyGenre
        : undefined;
  if (tracksConfigured && musicGenre) {
    tracks = await searchTracksByGenre(musicGenre).catch(() => []);
  }

  return { moviesConfigured, tracksConfigured, movies, tracks, moodContext };
}
