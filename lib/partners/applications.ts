import sql from '@/lib/db';

export type PartnerApplicationKind = 'outlet' | 'brand';

export type OutletApplicationPayload = {
  area: string;
  venueKind: string;
  seats: number | null;
  interests: string[];
};

export type BrandApplicationPayload = {
  website: string | null;
  categories: string[];
  regions: string;
  skuEstimate: string | null;
};

export type PartnerApplicationInput = {
  kind: PartnerApplicationKind;
  contactName: string;
  email: string;
  phone: string | null;
  companyName: string;
  notes: string | null;
  payload: OutletApplicationPayload | BrandApplicationPayload;
};

let tableReady: Promise<void> | null = null;

function ensureTable() {
  if (!tableReady) {
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS partner_applications (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kind            TEXT NOT NULL CHECK (kind IN ('outlet', 'brand')),
        contact_name    TEXT NOT NULL,
        email           TEXT NOT NULL,
        phone           TEXT,
        company_name    TEXT NOT NULL,
        payload         JSONB NOT NULL DEFAULT '{}',
        notes           TEXT,
        status          TEXT NOT NULL DEFAULT 'new'
                          CHECK (status IN ('new', 'reviewed', 'approved', 'declined')),
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.then(() => undefined);
  }
  return tableReady;
}

export function validatePartnerApplication(input: PartnerApplicationInput): string | null {
  if (!input.contactName.trim()) return 'Contact name is required.';
  if (!input.email.trim() || !input.email.includes('@')) return 'A valid email is required.';
  if (!input.companyName.trim()) return input.kind === 'outlet' ? 'Venue name is required.' : 'Brand name is required.';

  if (input.kind === 'outlet') {
    const p = input.payload as OutletApplicationPayload;
    if (!p.area?.trim()) return 'Area is required.';
    if (!p.venueKind?.trim()) return 'Venue type is required.';
  } else {
    const p = input.payload as BrandApplicationPayload;
    if (!p.regions?.trim()) return 'Tell us which markets you want to reach.';
    if (!p.categories?.length) return 'Pick at least one product category.';
  }
  return null;
}

export async function createPartnerApplication(input: PartnerApplicationInput) {
  await ensureTable();
  const rows = await sql`
    INSERT INTO partner_applications (
      kind, contact_name, email, phone, company_name, payload, notes
    ) VALUES (
      ${input.kind},
      ${input.contactName.trim()},
      ${input.email.trim().toLowerCase()},
      ${input.phone?.trim() || null},
      ${input.companyName.trim()},
      ${JSON.stringify(input.payload)}::jsonb,
      ${input.notes?.trim() || null}
    )
    RETURNING id, kind, contact_name, email, phone, company_name, payload, notes, created_at
  `;
  return rows[0];
}
