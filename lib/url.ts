// Public base URL helper. Prefers NEXT_PUBLIC_APP_URL so absolute links
// (share, OG, email) resolve to your deployed domain in every environment.

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

/** Build an absolute URL for a path on the app, e.g. ticket share links. */
export function absoluteUrl(path: string): string {
  return `${appUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
