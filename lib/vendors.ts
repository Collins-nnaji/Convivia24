// Pure, client-safe vendor taxonomy + types. No server/DB imports — safe to
// import in both client components and API routes.

export const VENDOR_CATEGORIES = [
  'catering', 'photography', 'videography', 'decor', 'entertainment',
  'venue', 'sound_av', 'lighting', 'security', 'bar', 'transport',
  'mc_host', 'beauty', 'printing', 'planning', 'other',
] as const;

export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const VENDOR_CATEGORY_LABELS: Record<string, string> = {
  catering: 'Catering & Food',
  photography: 'Photography',
  videography: 'Videography',
  decor: 'Décor & Styling',
  entertainment: 'Entertainment (DJ / Band)',
  venue: 'Venues & Spaces',
  sound_av: 'Sound & AV',
  lighting: 'Lighting & Stage',
  security: 'Security',
  bar: 'Bar & Drinks',
  transport: 'Transport & Logistics',
  mc_host: 'MC / Host',
  beauty: 'Makeup & Beauty',
  printing: 'Printing & Branding',
  planning: 'Event Planning',
  other: 'Other Services',
};

export const VENDOR_STATUSES = ['pending', 'approved', 'rejected', 'archived'] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

export interface VendorRow {
  id: string;
  business_name: string;
  category: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  instagram: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  services: string[] | null;
  price_from: string | null;
  currency: string;
  logo_url: string | null;
  status: VendorStatus;
  is_featured: boolean;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function vendorCategoryLabel(category: string | null | undefined): string {
  if (!category) return VENDOR_CATEGORY_LABELS.other;
  return VENDOR_CATEGORY_LABELS[category] ?? category;
}
