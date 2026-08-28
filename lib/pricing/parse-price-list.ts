/**
 * Turns a supplier price list — pasted text, or text pulled off a scanned photo — into price
 * updates matched against our own SKUs.
 *
 * Pure and DB-free: the caller supplies the catalogue to match against. Everything here is a
 * *proposal*; nothing is written until an admin confirms the rows they want.
 */

export type ParsedLine = {
  /** The product text exactly as it appeared on the list. */
  rawName: string;
  priceNgn: number;
  /** 1-based line number in the source, so the review table can point at the original. */
  line: number;
};

export type MatchTarget = {
  slug: string;
  name: string;
  brand?: string | null;
  currentPriceNgn: number | null;
};

export type PriceProposal = ParsedLine & {
  slug: string | null;
  matchedName: string | null;
  currentPriceNgn: number | null;
  /** 0–1. Below MIN_CONFIDENCE we report the line as unmatched rather than guessing. */
  confidence: number;
  changePct: number | null;
  status: 'new-price' | 'unchanged' | 'unmatched';
};

/** Below this we would be guessing, and a wrong guess silently reprices the wrong bottle. */
export const MIN_CONFIDENCE = 0.55;

/** Anything beyond this swing is almost certainly an OCR slip, not a real price change. */
export const SUSPICIOUS_CHANGE_PCT = 60;

/**
 * Pull the price off the end of a line. Price lists put it last, so we anchor there rather than
 * grabbing the first number — "12 Year Old Whisky 68,000" must not read as ₦12.
 */
function extractPrice(text: string): { priceNgn: number; rest: string } | null {
  const trimmed = text.replace(/[.…\-_\s]+$/, '').trim();
  // Optional currency mark, then one grouped number at end of line. Spaces are deliberately NOT
  // allowed inside the number — "Chivas Regal 12   50000" must read as 50,000, not 1,250,000.
  const m = trimmed.match(/(?:₦|N|NGN)?\s?([\d][\d.,]*)\s*$/i);
  if (!m) return null;

  const digits = m[1].replace(/[^\d.,]/g, '');
  // Treat . and , as thousands separators unless the tail is clearly decimal kobo (exactly 2 digits).
  let normalised = digits;
  const decimal = digits.match(/[.,](\d{2})$/);
  if (decimal && digits.replace(/[.,]/g, '').length > 4) {
    normalised = digits.slice(0, decimal.index);
  }
  const priceNgn = Number(normalised.replace(/[^\d]/g, ''));
  if (!Number.isFinite(priceNgn) || priceNgn <= 0) return null;

  const rest = trimmed.slice(0, m.index).replace(/[.…\-–—:|_\s]+$/, '').trim();
  return { priceNgn, rest };
}

/** Leading list noise: "1.", "12)", "- ", "• ", and a leading case quantity like "2 x". */
function stripLeadingNoise(text: string): string {
  return text
    .replace(/^\s*[-•*•]\s*/, '')
    .replace(/^\s*\d{1,3}\s*[.)]\s+/, '')
    .replace(/^\s*\d{1,3}\s*[x×]\s+/i, '')
    .trim();
}

const HEADER_WORDS =
  /^(price\s*list|product|item|description|unit|qty|quantity|total|amount|price|s\/?n|no\.?)\b/i;

export function parsePriceList(raw: string): ParsedLine[] {
  const out: ParsedLine[] = [];
  const lines = String(raw || '').split(/\r?\n/);

  lines.forEach((original, i) => {
    const text = stripLeadingNoise(original);
    if (!text || text.length < 3) return;
    if (HEADER_WORDS.test(text)) return;

    const hit = extractPrice(text);
    if (!hit) return;

    const rawName = hit.rest.trim();
    // A name of one or two characters is table noise, not a product.
    if (rawName.length < 3) return;
    // Sub-₦100 lines on a Nigerian drinks list are page numbers or column indices, not prices.
    if (hit.priceNgn < 100) return;

    out.push({ rawName, priceNgn: hit.priceNgn, line: i + 1 });
  });

  return out;
}

/** Lowercase, drop punctuation, and collapse whitespace — so "Moët & Chandon" ≈ "moet chandon". */
export function normaliseName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set(['the', 'and', 'of', 'cl', 'ml', 'l', 'bottle', 'bottles', 'pack', 'case']);

/** Bottle sizes carried on supplier lists but not in our names: 70cl, 75cl, 1l, 750ml. */
const SIZE_TOKEN = /^\d+(?:cl|ml|l|ltr|litre|liter)$/;

/**
 * Unique, meaningful tokens.
 *
 * Deduped so a repeated brand ("Hennessy Hennessy VS") cannot inflate a score, sizes dropped, and
 * runs of single letters glued back together so "V.S" and "X.O" survive punctuation stripping as
 * "vs" and "xo" rather than becoming meaningless one-letter tokens.
 */
function tokens(name: string): string[] {
  const raw = normaliseName(name)
    .split(' ')
    .filter((t) => t && !STOP_WORDS.has(t) && !SIZE_TOKEN.test(t));

  const merged: string[] = [];
  for (const token of raw) {
    const prev = merged[merged.length - 1];
    if (token.length === 1 && prev && prev.length <= 3 && /^[a-z]+$/.test(prev)) {
      merged[merged.length - 1] = prev + token;
    } else {
      merged.push(token);
    }
  }
  return [...new Set(merged)];
}

/**
 * Token overlap weighted toward the candidate: a list entry carries extra words (size, case count)
 * that our catalogue name does not, and that should not be punished.
 */
export function similarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.length || !tb.length) return 0;

  const setA = new Set(ta);
  const matched = tb.filter((t) => setA.has(t)).length;
  const coverage = matched / tb.length;

  const setB = new Set(tb);
  const reverse = ta.filter((t) => setB.has(t)).length / ta.length;

  // Both directions matter, but covering the catalogue name matters more.
  return Number((coverage * 0.65 + reverse * 0.35).toFixed(4));
}

function bestMatch(rawName: string, targets: MatchTarget[]): { target: MatchTarget; score: number } | null {
  let best: { target: MatchTarget; score: number } | null = null;
  for (const target of targets) {
    const haystack = target.brand ? `${target.brand} ${target.name}` : target.name;
    const score = Math.max(similarity(rawName, target.name), similarity(rawName, haystack));
    if (!best || score > best.score) best = { target, score };
  }
  return best;
}

/** Match parsed lines to SKUs and describe the change each one would make. */
export function proposeUpdates(lines: ParsedLine[], targets: MatchTarget[]): PriceProposal[] {
  return lines.map((line) => {
    const best = bestMatch(line.rawName, targets);

    if (!best || best.score < MIN_CONFIDENCE) {
      return {
        ...line,
        slug: null,
        matchedName: null,
        currentPriceNgn: null,
        confidence: best ? best.score : 0,
        changePct: null,
        status: 'unmatched' as const,
      };
    }

    const current = best.target.currentPriceNgn;
    const changePct =
      current && current > 0
        ? Number((((line.priceNgn - current) / current) * 100).toFixed(1))
        : null;

    return {
      ...line,
      slug: best.target.slug,
      matchedName: best.target.name,
      currentPriceNgn: current,
      confidence: best.score,
      changePct,
      status: current === line.priceNgn ? ('unchanged' as const) : ('new-price' as const),
    };
  });
}

/** Flags a row the admin should look at twice before applying. */
export function isSuspicious(proposal: PriceProposal): boolean {
  if (proposal.status !== 'new-price') return false;
  if (proposal.changePct == null) return false;
  return Math.abs(proposal.changePct) > SUSPICIOUS_CHANGE_PCT;
}

export type PriceListSummary = {
  parsed: number;
  matched: number;
  unmatched: number;
  changed: number;
  unchanged: number;
  suspicious: number;
};

export function summarise(proposals: PriceProposal[]): PriceListSummary {
  return {
    parsed: proposals.length,
    matched: proposals.filter((p) => p.slug).length,
    unmatched: proposals.filter((p) => !p.slug).length,
    changed: proposals.filter((p) => p.status === 'new-price').length,
    unchanged: proposals.filter((p) => p.status === 'unchanged').length,
    suspicious: proposals.filter(isSuspicious).length,
  };
}
