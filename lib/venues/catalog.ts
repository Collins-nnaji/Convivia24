import { LAGOS_AREAS, haversineKm, type LagosArea } from '@/lib/geo/lagos';

export type VenueKind = 'club' | 'lounge' | 'rooftop' | 'beach' | 'live';

export type Venue = {
  slug: string;
  name: string;
  kind: VenueKind;
  areaId: LagosArea['id'];
  area: string;
  address: string;
  lat: number;
  lng: number;
  tagline: string;
  about: string;
  hours: string;
  coverNgn?: number;
  cardPerk: string;
  cardDiscountPct: number;
  partnerVenue?: boolean;
};

export const VENUE_KIND_LABELS: Record<VenueKind, string> = {
  club: 'Club',
  lounge: 'Lounge',
  rooftop: 'Rooftop',
  beach: 'Beach club',
  live: 'Live house',
};

export const VENUES: Venue[] = [
  {
    slug: 'lumen-lounge',
    name: 'Lumen Lounge',
    kind: 'rooftop',
    areaId: 'vi',
    area: 'Victoria Island',
    address: 'Adeola Odeku, Victoria Island',
    lat: 6.4294,
    lng: 3.4228,
    tagline: 'Skyline pours, low lights, long tables.',
    about:
      'A VI rooftop built for bottle service and late conversations. Cardholders skip the door queue on Thursdays and Sundays.',
    hours: 'Thu–Sun · 7pm–3am',
    coverNgn: 15000,
    cardPerk: 'Skip the line + 10% off table bottles',
    cardDiscountPct: 10,
    partnerVenue: true,
  },
  {
    slug: 'harbour-house',
    name: 'Harbour House',
    kind: 'club',
    areaId: 'vi',
    area: 'Victoria Island',
    address: 'Akin Adesola, Victoria Island',
    lat: 6.4312,
    lng: 3.4186,
    tagline: 'The room that still opens at 1am.',
    about:
      'A two-room club with a main floor and a quieter amber lounge. Partner venue — Convivia drops restock the back bar the same night.',
    hours: 'Fri–Sat · 10pm–5am',
    coverNgn: 20000,
    cardPerk: 'Guest list after 11pm for Resident+',
    cardDiscountPct: 8,
    partnerVenue: true,
  },
  {
    slug: 'terrace-14',
    name: 'Terrace 14',
    kind: 'lounge',
    areaId: 'lekki',
    area: 'Lekki Phase 1',
    address: 'Admiralty Way, Lekki Phase 1',
    lat: 6.4486,
    lng: 3.4652,
    tagline: 'Admiralty terrace. Soft music until it isn’t.',
    about:
      'Open-air lounge with booth seating and a tequila-forward back bar. Order a Party Pack to the terrace and the door already knows your name if you hold a card.',
    hours: 'Wed–Sun · 5pm–2am',
    coverNgn: 10000,
    cardPerk: 'One complimentary mixer flight',
    cardDiscountPct: 12,
    partnerVenue: true,
  },
  {
    slug: 'afterlight',
    name: 'Afterlight',
    kind: 'club',
    areaId: 'ikeja',
    area: 'Ikeja GRA',
    address: 'Isaac John, Ikeja GRA',
    lat: 6.5831,
    lng: 3.3518,
    tagline: 'GRA nights, mainland energy.',
    about:
      'Ikeja’s late room — DJs until dawn, a covered courtyard, and a spirits wall that turns over every weekend.',
    hours: 'Fri–Sat · 9pm–4am',
    coverNgn: 8000,
    cardPerk: '₦5,000 door credit',
    cardDiscountPct: 10,
    partnerVenue: true,
  },
  {
    slug: 'palm-court',
    name: 'Palm Court',
    kind: 'lounge',
    areaId: 'ikoyi',
    area: 'Ikoyi',
    address: 'Awolowo Road, Ikoyi',
    lat: 6.4528,
    lng: 3.4341,
    tagline: 'Dinner first. Cognac after.',
    about:
      'An Ikoyi courtyard lounge for long dinners that become nights. Cardholders get a reserved two-top on weeknights.',
    hours: 'Tue–Sun · 12pm–12am',
    cardPerk: 'Reserved two-top before 8pm',
    cardDiscountPct: 8,
    partnerVenue: true,
  },
  {
    slug: 'fifth-floor',
    name: 'The Fifth Floor',
    kind: 'rooftop',
    areaId: 'yaba',
    area: 'Yaba',
    address: 'Herbert Macaulay, Yaba',
    lat: 6.5082,
    lng: 3.3774,
    tagline: 'Sunset sets over the mainland.',
    about:
      'A Yaba rooftop for golden hour and canned-cocktail tables. Crowds land here before they move to VI.',
    hours: 'Thu–Sun · 4pm–1am',
    coverNgn: 5000,
    cardPerk: 'Free cover before 7pm',
    cardDiscountPct: 5,
  },
  {
    slug: 'saltwater',
    name: 'Saltwater',
    kind: 'beach',
    areaId: 'lekki',
    area: 'Lekki',
    address: 'Elegushi stretch, Lekki',
    lat: 6.4228,
    lng: 3.535,
    tagline: 'Sand, speakers, then the after.',
    about:
      'Beach-club days that run into afterparties. Order a Party Pack to the cabana — riders know the stretch.',
    hours: 'Sat–Sun · 12pm–10pm',
    coverNgn: 12000,
    cardPerk: 'Cabana upgrade when available',
    cardDiscountPct: 10,
    partnerVenue: true,
  },
  {
    slug: 'naija-house',
    name: 'Naija House',
    kind: 'live',
    areaId: 'surulere',
    area: 'Surulere',
    address: 'Adeniran Ogunsanya, Surulere',
    lat: 6.4994,
    lng: 3.3562,
    tagline: 'Live sets. No velvet rope energy.',
    about:
      'A Surulere live house — bands, DJs, and a bar that stays honest. Card perks land as drink credits, not queues.',
    hours: 'Thu–Sat · 7pm–2am',
    coverNgn: 4000,
    cardPerk: '₦3,000 bar credit',
    cardDiscountPct: 5,
  },
  {
    slug: 'copper-bar',
    name: 'Copper Bar',
    kind: 'lounge',
    areaId: 'maryland',
    area: 'Maryland',
    address: 'Mobolaji Bank Anthony, Maryland',
    lat: 6.5748,
    lng: 3.3689,
    tagline: 'Weeknight whisky. Soft booths.',
    about:
      'A Maryland lounge for midweek pours. Quiet enough to talk, stocked enough to stay.',
    hours: 'Mon–Sat · 4pm–1am',
    cardPerk: 'Whisky flight at member rate',
    cardDiscountPct: 10,
    partnerVenue: true,
  },
];

export function getVenue(slug: string): Venue | undefined {
  return VENUES.find((v) => v.slug === slug);
}

export function venuesByArea(areaId: string | 'all'): Venue[] {
  if (areaId === 'all') return VENUES;
  return VENUES.filter((v) => v.areaId === areaId);
}

export function nearestVenues(origin: { lat: number; lng: number }): (Venue & { km: number })[] {
  return VENUES.map((v) => ({ ...v, km: haversineKm(origin, v) })).sort((a, b) => a.km - b.km);
}

export function areaById(id: string): LagosArea | undefined {
  return LAGOS_AREAS.find((a) => a.id === id);
}
