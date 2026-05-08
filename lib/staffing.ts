/**
 * Convivia24 — hospitality staffing (Nigeria). Shared copy and domain constants.
 */

export const LAGOS_ZONES = ['VI', 'Lekki', 'Ikeja', 'Ikoyi', 'Surulere'] as const;
export type LagosZone = (typeof LAGOS_ZONES)[number];

/** Metro label for shift location; zones are primary for Lagos. */
export const PRIMARY_METRO = 'Lagos';

export const STAFF_ROLE_GROUPS = [
  {
    key: 'foh',
    label: 'Front of house',
    roles: ['Waiter', 'Bartender', 'Host', 'Barista'],
  },
  {
    key: 'boh',
    label: 'Back of house',
    roles: ['Kitchen assistant', 'Commis chef', 'Prep cook', 'Dishwasher'],
  },
  {
    key: 'housekeeping',
    label: 'Housekeeping',
    roles: ['Room attendant', 'Steward', 'Cleaning crew'],
  },
  {
    key: 'events',
    label: 'Events & banquets',
    roles: ['Usher', 'Banquet server', 'Setup crew', 'Protocol officer'],
  },
] as const;

export const ALL_STAFF_ROLES = STAFF_ROLE_GROUPS.flatMap((g) => [...g.roles]);

export const PAYOUT_PROVIDERS = ['OPay', 'PalmPay', 'Moniepoint'] as const;

/** Placeholder — replace with your ops WhatsApp business number (E.164, no + in path). */
export const STAFFING_WHATSAPP_PATH = '2348000000000';

export function staffingWhatsAppUrl(message: string) {
  const enc = encodeURIComponent(message);
  return `https://wa.me/${STAFFING_WHATSAPP_PATH}?text=${enc}`;
}
