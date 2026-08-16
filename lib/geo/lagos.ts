export type LagosArea = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export const LAGOS_AREAS: LagosArea[] = [
  { id: 'vi', name: 'Victoria Island', lat: 6.4281, lng: 3.4219 },
  { id: 'ikoyi', name: 'Ikoyi', lat: 6.4541, lng: 3.4358 },
  { id: 'lekki', name: 'Lekki', lat: 6.4474, lng: 3.4723 },
  { id: 'ikeja', name: 'Ikeja', lat: 6.6018, lng: 3.3515 },
  { id: 'yaba', name: 'Yaba', lat: 6.5095, lng: 3.3711 },
  { id: 'surulere', name: 'Surulere', lat: 6.4969, lng: 3.3606 },
  { id: 'maryland', name: 'Maryland', lat: 6.5763, lng: 3.3674 },
];

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
