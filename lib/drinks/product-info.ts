import sql from '@/lib/db';
import { getDrinkBySlug } from '@/lib/drinks/catalog';
import { BRAND_INFO, TASTE_NOTES, type BrandInfo } from '@/lib/drinks/brand-guide';

export type ProductInfoPayload = {
  slug: string;
  name: string;
  brand: string | null;
  tasteNote: string | null;
  brandGuide: (BrandInfo & { name: string }) | null;
};

export async function upsertBrand(brand: string, info: BrandInfo): Promise<void> {
  if (!brand.trim()) return;
  await sql`
    INSERT INTO drink_brands (name, origin, founded, history, style, updated_at)
    VALUES (
      ${brand.trim()},
      ${info.origin || null},
      ${info.founded || null},
      ${info.history || null},
      ${info.style || null},
      NOW()
    )
    ON CONFLICT (name) DO UPDATE SET
      origin = COALESCE(EXCLUDED.origin, drink_brands.origin),
      founded = COALESCE(EXCLUDED.founded, drink_brands.founded),
      history = COALESCE(EXCLUDED.history, drink_brands.history),
      style = COALESCE(EXCLUDED.style, drink_brands.style),
      updated_at = NOW()
  `;
}

export async function getBrandFromDb(name: string): Promise<BrandInfo | null> {
  const rows = await sql`
    SELECT origin, founded, history, style FROM drink_brands WHERE name = ${name} LIMIT 1
  `;
  const r = rows[0];
  if (!r) return null;
  if (!r.origin && !r.history && !r.style) return null;
  return {
    origin: String(r.origin || ''),
    founded: String(r.founded || ''),
    history: String(r.history || ''),
    style: String(r.style || ''),
  };
}

/** Resolve taste + brand story — DB first, static catalog fallback. */
export async function getProductInfo(slug: string): Promise<ProductInfoPayload | null> {
  const catalog = getDrinkBySlug(slug);
  let name = catalog?.name || slug;
  let brandName = catalog?.brand || null;
  let tasteNote: string | null = null;

  try {
    const rows = await sql`
      SELECT name, brand, taste_note FROM inventory WHERE slug = ${slug} LIMIT 1
    `;
    if (rows[0]) {
      name = String(rows[0].name || name);
      brandName = (rows[0].brand as string) || brandName;
      tasteNote = (rows[0].taste_note as string) || null;
    }
  } catch {
    /* DB optional */
  }

  if (!tasteNote) tasteNote = TASTE_NOTES[slug] || null;

  let brandGuide: (BrandInfo & { name: string }) | null = null;
  if (brandName) {
    const fromDb = await getBrandFromDb(brandName).catch(() => null);
    const staticInfo = BRAND_INFO[brandName];
    const merged = fromDb || staticInfo;
    if (merged && (merged.history || merged.style)) {
      brandGuide = { name: brandName, ...merged };
    }
  }

  if (!tasteNote && !brandGuide) return null;

  return { slug, name, brand: brandName, tasteNote, brandGuide };
}

export type ProductCopyInput = {
  name: string;
  brand?: string;
  category?: string;
  abv?: number;
  volume?: string;
  tagline?: string;
};

export type GeneratedProductCopy = {
  tagline: string;
  description: string;
  tasteNote: string;
  brandOrigin: string;
  brandFounded: string;
  brandHistory: string;
  brandStyle: string;
};
