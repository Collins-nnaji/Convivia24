/** Only local app paths are allowed as authentication destinations. */
export function safeReturnPath(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return fallback;
  try {
    const origin = 'https://convivia24.invalid';
    const url = new URL(value, origin);
    return url.origin === origin ? url.pathname + url.search + url.hash : fallback;
  } catch { return fallback; }
}
