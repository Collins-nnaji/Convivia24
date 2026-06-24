// Controlled topic vocabulary for supporter profiles — fixed tags (not free
// text) so the directory stays simple to scan and filter.

export interface SupportTag {
  value: string;
  label: string;
}

export const SUPPORT_TAGS: SupportTag[] = [
  { value: 'stress', label: 'Stress' },
  { value: 'loneliness', label: 'Loneliness' },
  { value: 'grief', label: 'Grief' },
  { value: 'work_burnout', label: 'Work burnout' },
  { value: 'general_listening', label: 'General listening ear' },
];

export function supportTagLabel(value: string): string | null {
  return SUPPORT_TAGS.find((t) => t.value === value)?.label ?? null;
}

export function isValidSupportTag(value: string): boolean {
  return SUPPORT_TAGS.some((t) => t.value === value);
}
