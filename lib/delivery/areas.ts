import { LAGOS_AREAS } from '@/lib/geo/lagos';
import { LAUNCH_CITIES } from './policy';

const CITY_AREAS: Record<(typeof LAUNCH_CITIES)[number], readonly string[]> = {
  Lagos: LAGOS_AREAS.map(area => area.name),
  Abuja: ['Wuse', 'Maitama', 'Garki', 'Asokoro', 'Gwarinpa', 'Jabi'],
  'Port Harcourt': ['GRA', 'D-Line', 'Trans Amadi', 'Rumuola', 'Woji'],
  Enugu: ['Independence Layout', 'New Haven', 'GRA', 'Trans-Ekulu', 'Achara Layout'],
  Awka: ['Government House Area', 'Aroma', 'Ifite', 'Okpuno', 'Amawbia'],
  Onitsha: ['GRA', 'Inland Town', 'Fegge', 'Omagba'],
  Aba: ['GRA', 'Ogbor Hill', 'Osisioma', 'Ariaria'],
  Owerri: ['New Owerri', 'Ikenegbu', 'Aladinma', 'World Bank Housing Estate'],
  Asaba: ['GRA', 'Okpanam', 'Cable Point', 'Summit Road'],
  'Benin City': ['GRA', 'Ugbowo', 'Ekewan', 'Sapele Road'],
  Ibadan: ['Bodija', 'Oluyole', 'Ring Road', 'Jericho', 'Akobo'],
  Uyo: ['Ewet Housing Estate', 'Osongama', 'Shelter Afrique', 'Uyo Town'],
  Calabar: ['State Housing', 'Marian', 'Federal Housing', 'Calabar South'],
  Kano: ['Nasarawa GRA', 'Bompai', 'Sabon Gari', 'Tarauni'],
  Kaduna: ['Malali', 'Barnawa', 'U/Dosa', 'Kabala Costain'],
};

// Planning areas are suggestions; checkout availability comes from enabled delivery zones.
export function deliveryAreas(city: string): readonly string[] {
  return CITY_AREAS[city as keyof typeof CITY_AREAS] || [];
}
