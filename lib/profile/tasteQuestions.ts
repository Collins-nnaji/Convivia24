// A small, rotating set of taste questions — surfaced occasionally inside the
// companion chat (not at onboarding) so recommendations improve over time.
// Multiple-choice, like onboarding, so the recommendation engine has a
// deterministic genre to query rather than guessing from free text.

export interface TasteOption {
  value: string;
  label: string;
  /** TMDB genre id, when this option describes a movie taste. */
  tmdbGenre?: number;
  /** Spotify search genre keyword, when this option describes a music taste. */
  spotifyGenre?: string;
}

export interface TasteQuestion {
  id: string;
  memoryKey: string;
  title: string;
  options: TasteOption[];
}

export const TASTE_QUESTIONS: TasteQuestion[] = [
  {
    id: 'movie_genre',
    memoryKey: 'favorite_movie_genre',
    title: 'What kind of movies pull you in?',
    options: [
      { value: 'thriller', label: 'Thrillers & suspense', tmdbGenre: 53 },
      { value: 'comedy', label: 'Comedies', tmdbGenre: 35 },
      { value: 'drama', label: 'Dramas', tmdbGenre: 18 },
      { value: 'scifi', label: 'Sci-fi & fantasy', tmdbGenre: 878 },
      { value: 'romance', label: 'Romance', tmdbGenre: 10749 },
      { value: 'action', label: 'Action & adventure', tmdbGenre: 28 },
      { value: 'horror', label: 'Horror', tmdbGenre: 27 },
      { value: 'documentary', label: 'Documentaries', tmdbGenre: 99 },
    ],
  },
  {
    id: 'music_genre',
    memoryKey: 'favorite_music_genre',
    title: "What's usually playing when you put music on?",
    options: [
      { value: 'pop', label: 'Pop', spotifyGenre: 'pop' },
      { value: 'hiphop', label: 'Hip-hop & R&B', spotifyGenre: 'hip-hop' },
      { value: 'rock', label: 'Rock', spotifyGenre: 'rock' },
      { value: 'electronic', label: 'Electronic & dance', spotifyGenre: 'electronic' },
      { value: 'afrobeats', label: 'Afrobeats', spotifyGenre: 'afrobeat' },
      { value: 'jazz', label: 'Jazz', spotifyGenre: 'jazz' },
      { value: 'classical', label: 'Classical & instrumental', spotifyGenre: 'classical' },
      { value: 'indie', label: 'Indie & alternative', spotifyGenre: 'indie' },
    ],
  },
  {
    id: 'music_mood',
    memoryKey: 'music_mood_preference',
    title: 'What do you usually want music to do for you?',
    options: [
      { value: 'focus', label: 'Help me focus', spotifyGenre: 'study' },
      { value: 'hype', label: 'Hype me up', spotifyGenre: 'work-out' },
      { value: 'unwind', label: 'Help me unwind', spotifyGenre: 'chill' },
      { value: 'feel', label: 'Make me feel something', spotifyGenre: 'singer-songwriter' },
    ],
  },
];

/** A readable label for a single answer — mirrored into companion memory. */
export function describeTasteAnswer(q: TasteQuestion, value: string): string {
  return q.options.find((o) => o.value === value)?.label ?? value;
}
