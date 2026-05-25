export type InsightCategory = 'activation' | 'data' | 'field' | 'brand' | 'culture';

export type InsightBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'stat'; value: string; label: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; title: string; body: string };

export type InsightPost = {
  slug: string;
  title: string;
  dek: string;
  category: InsightCategory;
  tags: string[];
  publishedAt: string;
  readMinutes: number;
  featured: boolean;
  issue: string;
  author: { name: string; role: string };
  /** Tailwind gradient classes for card + hero */
  accent: string;
  accentMuted: string;
  blocks: InsightBlock[];
};

export const CATEGORY_META: Record<
  InsightCategory,
  { label: string; description: string; color: string }
> = {
  activation: { label: 'Activation', description: 'Campaign design & go-live', color: 'text-amber-700' },
  data: { label: 'Data', description: 'ROI, scans & dashboards', color: 'text-emerald-700' },
  field: { label: 'Field', description: 'Agents, venues & ops', color: 'text-red-800' },
  brand: { label: 'Brand', description: 'Safety, UGC & compliance', color: 'text-violet-700' },
  culture: { label: 'Culture', description: 'Teams, markets & craft', color: 'text-sky-800' },
};
