/**
 * Meetups travel as links.
 *
 * There is no server holding a meetup, so the meetup *is* the link: the whole
 * plan is packed into the URL fragment, which never leaves the device it was
 * copied on until someone pastes it. Attendees are referenced by index rather
 * than id, which keeps a full table of four with a dozen lines under ~500
 * characters — short enough for WhatsApp.
 */

import type { Meetup } from '@/lib/meetup/store';

/** Compact wire form. Short keys, positional tuples — this is not for humans. */
interface Packed {
  t: string;
  v: string;
  d: string;
  h: string;
  n?: string;
  p?: number;
  /** [name, budget?] */
  a: Array<[string, number?]>;
  /** [itemId, qty, payerIndexes] */
  l: Array<[string, number, number[]]>;
}

const VERSION = '1';

/* ── base64url over UTF-8 ────────────────────────────────────────────── */

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    input.length + ((4 - (input.length % 4)) % 4),
    '=',
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/* ── encode / decode ─────────────────────────────────────────────────── */

export function encodeMeetup(meetup: Meetup): string {
  const index = new Map(meetup.attendees.map((a, i) => [a.id, i]));
  const packed: Packed = {
    t: meetup.title,
    v: meetup.venueSlug,
    d: meetup.date,
    h: meetup.time,
    a: meetup.attendees.map((a) => (a.budget ? [a.name, a.budget] : [a.name])),
    l: meetup.lines.map((l) => [
      l.itemId,
      l.qty,
      l.payerIds.map((id) => index.get(id)).filter((i): i is number => i != null),
    ]),
  };
  if (meetup.note) packed.n = meetup.note;
  if (meetup.tipPct) packed.p = meetup.tipPct;

  return `${VERSION}.${toBase64Url(JSON.stringify(packed))}`;
}

/** Everything a shared meetup carries, minus the ids the importer will mint. */
export interface DecodedMeetup {
  title: string;
  venueSlug: string;
  date: string;
  time: string;
  note: string;
  tipPct: number;
  attendees: Array<{ name: string; budget?: number }>;
  lines: Array<{ itemId: string; qty: number; payerIndexes: number[] }>;
}

export function decodeMeetup(code: string): DecodedMeetup | null {
  try {
    const [version, payload] = code.split('.');
    if (version !== VERSION || !payload) return null;

    const p = JSON.parse(fromBase64Url(payload)) as Packed;
    if (!p || typeof p.v !== 'string' || !Array.isArray(p.a)) return null;

    const attendees = p.a
      .filter((entry) => Array.isArray(entry) && typeof entry[0] === 'string')
      .map(([name, budget]) => ({ name, budget: typeof budget === 'number' ? budget : undefined }));
    if (attendees.length === 0) return null;

    return {
      title: typeof p.t === 'string' ? p.t : 'Shared meetup',
      venueSlug: p.v,
      date: typeof p.d === 'string' ? p.d : '',
      time: typeof p.h === 'string' ? p.h : '',
      note: typeof p.n === 'string' ? p.n : '',
      tipPct: typeof p.p === 'number' ? p.p : 0,
      attendees,
      lines: (Array.isArray(p.l) ? p.l : [])
        .filter((l) => Array.isArray(l) && typeof l[0] === 'string')
        .map(([itemId, qty, payerIndexes]) => ({
          itemId,
          qty: typeof qty === 'number' && qty > 0 ? qty : 1,
          payerIndexes: (Array.isArray(payerIndexes) ? payerIndexes : []).filter(
            (i) => Number.isInteger(i) && i >= 0 && i < attendees.length,
          ),
        })),
    };
  } catch {
    return null;
  }
}

export function shareUrl(meetup: Meetup, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/meetups/join#${encodeMeetup(meetup)}`;
}

/**
 * Hand the link to the OS share sheet where there is one, and fall back to the
 * clipboard everywhere else. Resolves to what actually happened so the caller
 * can say so.
 */
export async function shareMeetup(meetup: Meetup): Promise<'shared' | 'copied' | 'failed'> {
  const url = shareUrl(meetup);
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;

  if (nav?.share) {
    try {
      await nav.share({ title: meetup.title, text: `${meetup.title} — the plan and the split`, url });
      return 'shared';
    } catch (err) {
      // A cancelled share sheet is not a failure; fall through to copying.
      if (err instanceof DOMException && err.name === 'AbortError') return 'shared';
    }
  }

  try {
    await nav?.clipboard?.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
