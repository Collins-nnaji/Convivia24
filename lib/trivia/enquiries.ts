import sql from '@/lib/db';

export const ENQUIRY_GOALS = [
  'trivia-round',
  'sampling',
  'event-pouring',
  'bundle',
  'listing',
  'other',
] as const;
export type EnquiryGoal = (typeof ENQUIRY_GOALS)[number];

export const GOAL_LABELS: Record<EnquiryGoal, string> = {
  'trivia-round': 'Sponsor a trivia round',
  sampling: 'Sampling / tastings',
  'event-pouring': 'Pouring at our events',
  bundle: 'Feature in a party package',
  listing: 'Get listed in the shop',
  other: 'Something else',
};

export const BUDGET_BANDS = ['under-500k', '500k-2m', '2m-5m', '5m-plus', 'unsure'] as const;
export type BudgetBand = (typeof BUDGET_BANDS)[number];

export const BUDGET_LABELS: Record<BudgetBand, string> = {
  'under-500k': 'Under ₦500k',
  '500k-2m': '₦500k – ₦2m',
  '2m-5m': '₦2m – ₦5m',
  '5m-plus': '₦5m+',
  unsure: 'Not sure yet',
};

export type BrandEnquiry = {
  id: string;
  brand: string;
  contactName: string;
  email: string;
  phone: string | null;
  goal: EnquiryGoal;
  budgetBand: BudgetBand | null;
  message: string | null;
  status: 'new' | 'contacted' | 'won' | 'closed';
  createdAt: string;
};

export type BrandEnquiryInput = {
  brand: string;
  contactName: string;
  email: string;
  phone?: string | null;
  goal?: string;
  budgetBand?: string | null;
  message?: string | null;
};

function mapEnquiry(r: Record<string, unknown>): BrandEnquiry {
  return {
    id: String(r.id),
    brand: String(r.brand),
    contactName: String(r.contact_name),
    email: String(r.email),
    phone: (r.phone as string) || null,
    goal: (r.goal as EnquiryGoal) || 'trivia-round',
    budgetBand: (r.budget_band as BudgetBand) || null,
    message: (r.message as string) || null,
    status: (r.status as BrandEnquiry['status']) || 'new',
    createdAt: String(r.created_at),
  };
}

export function validateBrandEnquiry(input: BrandEnquiryInput): string | null {
  if (!input.brand || input.brand.trim().length < 2) return 'Which brand is this for?';
  if (input.brand.trim().length > 120) return 'That brand name is too long.';
  if (!input.contactName || input.contactName.trim().length < 2) return 'Your name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input.email || '').trim())) {
    return 'A valid work email is required.';
  }
  if (input.phone && input.phone.trim() && !/^[+\d][\d\s-]{6,19}$/.test(input.phone.trim())) {
    return 'That phone number does not look right.';
  }
  if (input.goal && !(ENQUIRY_GOALS as readonly string[]).includes(input.goal)) {
    return 'Pick what you are after.';
  }
  if (
    input.budgetBand &&
    input.budgetBand !== '' &&
    !(BUDGET_BANDS as readonly string[]).includes(input.budgetBand)
  ) {
    return 'Pick a budget range.';
  }
  if (input.message && input.message.length > 2000) return 'That message is too long.';
  return null;
}

export async function createBrandEnquiry(input: BrandEnquiryInput): Promise<BrandEnquiry> {
  const goal = (ENQUIRY_GOALS as readonly string[]).includes(input.goal || '')
    ? input.goal
    : 'trivia-round';
  const band =
    input.budgetBand && (BUDGET_BANDS as readonly string[]).includes(input.budgetBand)
      ? input.budgetBand
      : null;

  const rows = await sql`
    INSERT INTO brand_enquiries (brand, contact_name, email, phone, goal, budget_band, message)
    VALUES (
      ${input.brand.trim()}, ${input.contactName.trim()}, ${input.email.trim().toLowerCase()},
      ${input.phone?.trim() || null}, ${goal}, ${band},
      ${input.message?.trim().slice(0, 2000) || null}
    )
    RETURNING *
  `;
  return mapEnquiry(rows[0]);
}

export async function listBrandEnquiries(): Promise<BrandEnquiry[]> {
  const rows = await sql`
    SELECT * FROM brand_enquiries
    ORDER BY (status = 'new') DESC, created_at DESC
    LIMIT 200
  `;
  return rows.map(mapEnquiry);
}

export async function setBrandEnquiryStatus(
  id: string,
  status: BrandEnquiry['status']
): Promise<BrandEnquiry | null> {
  const rows = await sql`
    UPDATE brand_enquiries SET status = ${status}, updated_at = NOW()
    WHERE id = ${id} RETURNING *
  `;
  return rows[0] ? mapEnquiry(rows[0]) : null;
}
