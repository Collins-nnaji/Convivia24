// Spotify client — powers track recommendations from a taste genre.
// Uses the Client Credentials flow (app-only, no user login needed) and the
// public /search endpoint — the /recommendations endpoint was restricted to
// Extended Quota Mode apps for anything created after Nov 2024, so it's
// avoided here in favour of a genre search, which stays open to all apps.
// Degrades to "not configured" until SPOTIFY_CLIENT_ID/SECRET are set.

export function spotifyConfigured(): boolean {
  return !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}

export interface TrackRecommendation {
  id: string;
  title: string;
  artist: string;
  albumArtUrl: string | null;
  spotifyUrl: string;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error('Spotify is not configured.');

  const basic = Buffer.from(`${id}:${secret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`Spotify auth error ${res.status}`);

  const data = await res.json();
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.value;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  external_urls: { spotify: string };
}

/** Top tracks matching a genre keyword. */
export async function searchTracksByGenre(genre: string, count = 5): Promise<TrackRecommendation[]> {
  const token = await getToken();
  const qs = new URLSearchParams({
    type: 'track',
    q: `genre:"${genre}"`,
    limit: String(count),
  });
  const res = await fetch(`https://api.spotify.com/v1/search?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Spotify search error ${res.status}`);

  const data = await res.json();
  const tracks: SpotifyTrack[] = data?.tracks?.items ?? [];

  return tracks.map((t) => ({
    id: t.id,
    title: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    albumArtUrl: t.album.images[0]?.url ?? null,
    spotifyUrl: t.external_urls.spotify,
  }));
}
