import sql from '@/lib/db';
import { DEFAULT_MARKUP, type MarkupPolicy } from '@/lib/pricing/checkout-fees';

export type StoredMarkup = MarkupPolicy & { updatedAt: string | null };

function clampPct(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_MARKUP.markupPct;
  return Math.round(Math.min(500, Math.max(0, n)) * 10) / 10;
}

function clampFlat(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(Math.min(50_000_000, Math.max(0, n)));
}

export async function getPricingPolicy(): Promise<StoredMarkup> {
  const [row] = await sql`
    SELECT markup_pct, markup_flat_ngn, updated_at
    FROM pricing_policy
    WHERE id = 'default'
  `;
  if (!row) return { ...DEFAULT_MARKUP, updatedAt: null };
  return {
    markupPct: clampPct(row.markup_pct),
    markupFlatNgn: clampFlat(row.markup_flat_ngn),
    updatedAt: row.updated_at ? String(row.updated_at) : null,
  };
}

export async function savePricingPolicy(input: MarkupPolicy): Promise<StoredMarkup> {
  const markupPct = clampPct(input.markupPct);
  const markupFlatNgn = clampFlat(input.markupFlatNgn);
  const [row] = await sql`
    INSERT INTO pricing_policy (id, markup_pct, markup_flat_ngn, updated_at)
    VALUES ('default', ${markupPct}, ${markupFlatNgn}, NOW())
    ON CONFLICT (id) DO UPDATE
      SET markup_pct = EXCLUDED.markup_pct,
          markup_flat_ngn = EXCLUDED.markup_flat_ngn,
          updated_at = NOW()
    RETURNING markup_pct, markup_flat_ngn, updated_at
  `;
  return {
    markupPct: clampPct(row?.markup_pct),
    markupFlatNgn: clampFlat(row?.markup_flat_ngn),
    updatedAt: row?.updated_at ? String(row.updated_at) : null,
  };
}
