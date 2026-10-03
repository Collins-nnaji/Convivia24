export const LAUNCH_CITIES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Enugu', 'Awka', 'Onitsha', 'Aba',
  'Owerri', 'Asaba', 'Benin City', 'Ibadan', 'Uyo', 'Calabar', 'Kano', 'Kaduna',
] as const;
export function launchCity(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return LAUNCH_CITIES.find((city) => city.toLowerCase() === value.trim().toLowerCase()) || null;
}
export function validTrackingUrl(value: unknown): string | null {
  if (!value) return null;
  try { const url = new URL(String(value)); return url.protocol === 'https:' ? url.toString() : null; } catch { return null; }
}
