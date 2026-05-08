import sql from '@/lib/db';

export type OutletApplicationRow = Record<string, unknown>;

export async function getOutletApplicationForUser(userId: string) {
  const rows = await sql`
    SELECT
      oa.*,
      c.name AS city_name,
      c.slug AS city_slug
    FROM outlet_applications oa
    JOIN cities c ON c.id = oa.city_id
    WHERE oa.user_id = ${userId}::uuid
    LIMIT 1
  `;
  return rows[0] || null;
}

export function serializeOutletApplication(row: Record<string, unknown> | null) {
  if (!row) return null;
  const ts = (v: unknown) =>
    v instanceof Date ? v.toISOString() : typeof v === 'string' ? v : v ?? null;
  return {
    id: String(row.id),
    city_id: String(row.city_id),
    city_name: row.city_name as string,
    city_slug: row.city_slug as string,
    business_name: row.business_name as string,
    business_type: (row.business_type as string) ?? null,
    street_address: row.street_address as string,
    phone: row.phone as string,
    cac_number: (row.cac_number as string) ?? null,
    contact_email: (row.contact_email as string) ?? null,
    status: row.status as string,
    submitted_at: ts(row.submitted_at),
    verification_notes: (row.verification_notes as string) ?? null,
    approved_at: ts(row.approved_at),
    rejected_at: ts(row.rejected_at),
    admin_notes: (row.admin_notes as string) ?? null,
    reviewed_by: (row.reviewed_by as string) ?? null,
    created_at: ts(row.created_at),
    updated_at: ts(row.updated_at),
  };
}

/**
 * Block posting shifts while an application is in the admin queue.
 * Draft / no row: allow (legacy hosts & incomplete onboarding). Approved: allow.
 */
export async function outletPostingBlocked(userId: string): Promise<{ blocked: boolean; status?: string }> {
  const rows = await sql`
    SELECT status FROM outlet_applications WHERE user_id = ${userId}::uuid LIMIT 1
  `;
  if (rows.length === 0) return { blocked: false };
  const status = String(rows[0].status);
  if (status === 'approved' || status === 'draft') return { blocked: false };
  return { blocked: true, status };
}

/**
 * Mirror outlet application "firm" fields onto `users.company` and legacy `outlet_profiles`
 * so reporting / admin / partner tooling see one canonical outlet record.
 */
export async function syncOutletFirmFromApplication(userId: string) {
  const rows = await sql`
    SELECT oa.business_name, oa.business_type, oa.street_address, oa.phone, c.name AS city_name
    FROM outlet_applications oa
    JOIN cities c ON c.id = oa.city_id
    WHERE oa.user_id = ${userId}::uuid
    LIMIT 1
  `;
  if (rows.length === 0) return;

  const r = rows[0] as Record<string, unknown>;
  const businessName = String(r.business_name ?? '').trim();
  const street = String(r.street_address ?? '').trim();
  const phone = String(r.phone ?? '').trim();
  const cityName = String(r.city_name ?? 'Lagos');
  const outletType = String(r.business_type ?? '').trim() || 'nightlife';

  await sql`
    UPDATE users SET company = ${businessName || null} WHERE id = ${userId}::uuid
  `;

  await sql`
    INSERT INTO outlet_profiles (
      user_id, outlet_name, outlet_type, city, address, phone, updated_at
    )
    VALUES (
      ${userId}::uuid,
      ${businessName || null},
      ${outletType},
      ${cityName},
      ${street || null},
      ${phone || null},
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      outlet_name = EXCLUDED.outlet_name,
      outlet_type = EXCLUDED.outlet_type,
      city = EXCLUDED.city,
      address = EXCLUDED.address,
      phone = EXCLUDED.phone,
      updated_at = NOW()
  `;
}
