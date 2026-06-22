// Combines learned taste answers with the TMDB/Spotify clients into a single
// recommendation payload for the companion UI.

import { getTaste } from '@/lib/profile/taste';
import { TASTE_QUESTIONS } from '@/lib/profile/tasteQuestions';
import { tmdbConfigured, discoverMoviesByGenre, type MovieRecommendation } from '@/lib/recommend/tmdb';
import { spotifyConfigured, searchTracksByGenre, type TrackRecommendation } from '@/lib/recommend/spotify';

export interface Recommendations {
  moviesConfigured: boolean;
  tracksConfigured: boolean;
  movies: MovieRecommendation[];
  tracks: TrackRecommendation[];
}

function findOption(questionId: string, value: string) {
  const question = TASTE_QUESTIONS.find((q) => q.id === questionId);
  return question?.options.find((o) => o.value === value);
}

export async function getRecommendations(userId: string): Promise<Recommendations> {
  const taste = await getTaste(userId);
  const moviesConfigured = tmdbConfigured();
  const tracksConfigured = spotifyConfigured();

  let movies: MovieRecommendation[] = [];
  let tracks: TrackRecommendation[] = [];

  const movieGenre = taste.movie_genre ? findOption('movie_genre', taste.movie_genre)?.tmdbGenre : undefined;
  if (moviesConfigured && movieGenre) {
    movies = await discoverMoviesByGenre(movieGenre).catch(() => []);
  }

  // Prefer the explicit music genre; fall back to the mood-based genre keyword.
  const musicGenre = taste.music_genre
    ? findOption('music_genre', taste.music_genre)?.spotifyGenre
    : taste.music_mood
      ? findOption('music_mood', taste.music_mood)?.spotifyGenre
      : undefined;
  if (tracksConfigured && musicGenre) {
    tracks = await searchTracksByGenre(musicGenre).catch(() => []);
  }

  return { moviesConfigured, tracksConfigured, movies, tracks };
}
