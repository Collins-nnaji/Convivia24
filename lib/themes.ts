export type ThemeMode = 'day' | 'night';

export interface EventTheme {
  mode: ThemeMode;
  accent: string;
}

export const INTENT_BADGES = [
  { id: 'cofounder', emoji: '⚡', label: 'Seeking Co-Founders' },
  { id: 'network', emoji: '☕', label: 'Casual Networking' },
  { id: 'vibe', emoji: '🥂', label: 'Just Vibing' },
  { id: 'collab', emoji: '🤝', label: 'Open to Collaborate' },
  { id: 'hire', emoji: '💼', label: 'Hiring / Job Hunting' },
] as const;

export type IntentBadgeId = (typeof INTENT_BADGES)[number]['id'];

export function intentLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  return INTENT_BADGES.find((b) => b.id === id)?.label ?? null;
}

export function intentEmoji(id: string | null | undefined): string | null {
  if (!id) return null;
  return INTENT_BADGES.find((b) => b.id === id)?.emoji ?? null;
}

export function resolveEventTheme(event: {
  theme_mode?: string | null;
  theme_accent?: string | null;
  category?: string | null;
  starts_at?: string | null;
}): EventTheme {
  let mode: ThemeMode = event.theme_mode === 'night' ? 'night' : 'day';
  if (!event.theme_mode && event.starts_at) {
    const hour = new Date(event.starts_at).getHours();
    if (hour >= 18 || hour < 6) mode = 'night';
    if (['nightlife', 'party', 'concert', 'festival'].includes(event.category ?? '')) mode = 'night';
  }
  return { mode, accent: event.theme_accent || '#c9a84c' };
}

export function themeClassName(mode: ThemeMode): string {
  return mode === 'night' ? 'event-theme-night' : 'event-theme-day';
}
