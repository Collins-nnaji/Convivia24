// Canonical mood/energy taxonomy for the daily check-in — fixed options (not
// free text) so trends can be charted and recommendations can branch on them.

export interface CheckInOption {
  value: string;
  label: string;
  emoji: string;
}

export const MOOD_OPTIONS: CheckInOption[] = [
  { value: 'great', label: 'Great', emoji: '😄' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'rough', label: 'Rough', emoji: '😕' },
  { value: 'bad', label: 'Bad', emoji: '😣' },
];

export const ENERGY_OPTIONS: CheckInOption[] = [
  { value: 'high', label: 'High energy', emoji: '⚡' },
  { value: 'medium', label: 'Steady', emoji: '🌤️' },
  { value: 'low', label: 'Running low', emoji: '🔋' },
];

/** Low-to-high order, used for trend colouring (light = great, dark = bad). */
export const MOOD_ORDER = ['bad', 'rough', 'okay', 'good', 'great'];

export function moodLabel(value: string | null): string | null {
  return MOOD_OPTIONS.find((o) => o.value === value)?.label ?? null;
}

export function energyLabel(value: string | null): string | null {
  return ENERGY_OPTIONS.find((o) => o.value === value)?.label ?? null;
}
