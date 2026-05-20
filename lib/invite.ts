/** Invite template ids stored in convivia24_events.invite_direction */
export type InviteTemplateId =
  | 'editorial'
  | 'bold'
  | 'mono'
  | 'garden'
  | 'minimal'
  | 'festive'
  | 'classic';

export interface InviteCustomization {
  /** Overrides default "Wedding · Lagos" eyebrow */
  tagline?: string;
  /** Short line above the CTA, e.g. "We would be honoured by your presence." */
  welcomeNote?: string;
  /** Button label on the invite card */
  ctaLabel?: string;
  showDressCode?: boolean;
  showVenue?: boolean;
  showDate?: boolean;
}

export const DEFAULT_INVITE_CUSTOMIZATION: InviteCustomization = {
  tagline: '',
  welcomeNote: '',
  ctaLabel: 'Reply →',
  showDressCode: true,
  showVenue: true,
  showDate: true,
};

export const INVITE_TEMPLATE_META: {
  id: InviteTemplateId;
  label: string;
  description: string;
}[] = [
  { id: 'editorial', label: 'Editorial', description: 'Warm ivory, serif type' },
  { id: 'bold', label: 'Bold', description: 'Dark, high contrast' },
  { id: 'mono', label: 'Mono', description: 'Typewriter minimal' },
  { id: 'garden', label: 'Garden', description: 'Soft botanical' },
  { id: 'minimal', label: 'Minimal', description: 'Clean whitespace' },
  { id: 'festive', label: 'Festive', description: 'Celebration energy' },
  { id: 'classic', label: 'Classic', description: 'Formal centred' },
];

export function normalizeInviteTemplate(value: string | null | undefined): InviteTemplateId {
  const valid = INVITE_TEMPLATE_META.map(t => t.id);
  if (value && valid.includes(value as InviteTemplateId)) return value as InviteTemplateId;
  return 'editorial';
}

export function parseInviteCustomization(raw: unknown): InviteCustomization {
  if (!raw) return { ...DEFAULT_INVITE_CUSTOMIZATION };
  let obj: Record<string, unknown>;
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return { ...DEFAULT_INVITE_CUSTOMIZATION };
    }
  } else if (typeof raw === 'object') {
    obj = raw as Record<string, unknown>;
  } else {
    return { ...DEFAULT_INVITE_CUSTOMIZATION };
  }
  return {
    tagline: typeof obj.tagline === 'string' ? obj.tagline : '',
    welcomeNote: typeof obj.welcomeNote === 'string' ? obj.welcomeNote : '',
    ctaLabel: typeof obj.ctaLabel === 'string' && obj.ctaLabel.trim() ? obj.ctaLabel.trim() : 'Reply →',
    showDressCode: obj.showDressCode !== false,
    showVenue: obj.showVenue !== false,
    showDate: obj.showDate !== false,
  };
}

export interface InviteEventFields {
  id?: string;
  host_name: string;
  event_type: string;
  event_date: string | null;
  event_time: string | null;
  city: string | null;
  venue: string | null;
  dress_code: string | null;
}
