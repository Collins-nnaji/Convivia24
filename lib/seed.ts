// Sample-event seeding — single source of truth.
// Used by `npx tsx lib/db/migrate.ts` and the admin "Seed sample events" action.
// Idempotent: events are keyed by slug; tiers are only inserted for new events.

type SqlFn = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

interface SeedTier {
  name: string; description: string; price: number; quantity: number; max: number; perks: string[];
}
interface SeedEvent {
  slug: string; title: string; tagline: string; description: string; category: string;
  venue: string; address: string; city: string; country: string;
  daysOut: number; startHour: number; durationHours: number;
  cover: string; currency: string; capacity: number; age: string;
  lineup: string[]; tags: string[]; featured: boolean; tiers: SeedTier[];
}

const IMG = ['/The Spaces2.png', '/Convivium.png', '/conv1.png', '/Convivium2.png', '/Convivium3.png', '/dealrooms.png', '/Homepage.png', '/Homepage2.png', '/The Spaces.png', '/The Spaces3.png'];

export const SEED_EVENTS: SeedEvent[] = [
  {
    slug: 'lagos-after-dark', title: 'Lagos After Dark', tagline: "The city's loudest night",
    description: 'An all-night Afrobeats and Amapiano takeover on the Victoria Island waterfront. Three rooms, ten DJs, and a rooftop that does not close until the sun is up. Dress to be seen.',
    category: 'nightlife', venue: 'The Terrace, Victoria Island', address: '24 Ozumba Mbadiwe Ave', city: 'Lagos', country: 'Nigeria',
    daysOut: 9, startHour: 22, durationHours: 7, cover: IMG[0], currency: 'NGN', capacity: 600, age: '18+',
    lineup: ['DJ Spinall', 'Obi the DJ', 'TMXO'], tags: ['afrobeats', 'amapiano', 'rooftop'], featured: true,
    tiers: [
      { name: 'Early Bird', description: 'Limited release. The cheapest way in.', price: 8000, quantity: 200, max: 6, perks: ['Entry before 11pm'] },
      { name: 'General', description: 'Standard admission to the main event.', price: 12000, quantity: 300, max: 8, perks: ['All-night entry'] },
      { name: 'VIP Table', description: 'Reserved table, bottle service and priority entry.', price: 80000, quantity: 30, max: 4, perks: ['Reserved table', 'Bottle on arrival', 'Skip the line'] },
    ],
  },
  {
    slug: 'london-diaspora-mixer', title: 'London Diaspora Mixer', tagline: 'Mayfair meets the motherland',
    description: 'An evening of cocktails, connection and culture for the African diaspora in London. Curated guest list, live sax, and a cocktail programme worth the trip alone.',
    category: 'party', venue: 'The Arlington Rooms', address: 'Mayfair', city: 'London', country: 'United Kingdom',
    daysOut: 16, startHour: 19, durationHours: 6, cover: IMG[1], currency: 'GBP', capacity: 200, age: '21+',
    lineup: ['Live Sax Set', 'Guest DJ'], tags: ['cocktails', 'network', 'diaspora'], featured: true,
    tiers: [
      { name: 'Guest List', description: 'Entry, welcome cocktail and canapés.', price: 45, quantity: 160, max: 4, perks: ['Welcome cocktail', 'Canapés'] },
      { name: 'Patron', description: 'Priority entry and a reserved lounge seat.', price: 95, quantity: 40, max: 2, perks: ['Priority entry', 'Reserved lounge'] },
    ],
  },
  {
    slug: 'brooklyn-block-festival', title: 'Brooklyn Block Festival', tagline: 'One borough. Every sound.',
    description: 'A full-day street festival across three stages in Williamsburg — hip-hop, Afrobeats and house. Food trucks, an art market, and the best people-watching in New York.',
    category: 'festival', venue: 'Kent Avenue Lots', address: 'Williamsburg, Brooklyn', city: 'New York', country: 'United States',
    daysOut: 24, startHour: 12, durationHours: 11, cover: IMG[2], currency: 'USD', capacity: 5000, age: 'All ages',
    lineup: ['Headliner TBA', 'DJ Moma', 'Local Legends Stage'], tags: ['festival', 'hiphop', 'outdoor'], featured: true,
    tiers: [
      { name: 'GA Day Pass', description: 'Full-day access to all stages.', price: 45, quantity: 4000, max: 8, perks: ['All stages', 'Food market access'] },
      { name: 'VIP', description: 'Raised deck, fast entry, VIP bars.', price: 140, quantity: 600, max: 6, perks: ['VIP deck', 'Fast lane', 'VIP bar'] },
    ],
  },
  {
    slug: 'accra-december-warmup', title: 'Accra December Warm-Up', tagline: 'Detty December starts here',
    description: 'The unofficial opening night of Detty December. Highlife to Afrobeats on an open-air beachfront, bonfires after midnight, and a sunrise swim for the brave.',
    category: 'party', venue: 'Sandbox Beach Club', address: 'La, Accra', city: 'Accra', country: 'Ghana',
    daysOut: 33, startHour: 20, durationHours: 9, cover: IMG[3], currency: 'GHS', capacity: 1200, age: '18+',
    lineup: ['King Promise (DJ set)', 'Resident DJs'], tags: ['beach', 'dettydecember', 'afrobeats'], featured: true,
    tiers: [
      { name: 'Early Bird', description: 'First release.', price: 150, quantity: 500, max: 6, perks: ['Beach access'] },
      { name: 'General', description: 'Standard entry.', price: 250, quantity: 500, max: 8, perks: ['Beach access'] },
      { name: 'Cabana', description: 'Private cabana for six.', price: 2500, quantity: 30, max: 1, perks: ['Private cabana', 'Bottle package', 'Host service'] },
    ],
  },
  {
    slug: 'nairobi-rooftop-jazz', title: 'Nairobi Rooftop Jazz', tagline: 'Strings over the skyline',
    description: 'An intimate evening of live jazz and neo-soul above Westlands. Limited seats, candlelit tables, and a wine list curated for the occasion.',
    category: 'concert', venue: 'Sankara Rooftop', address: 'Westlands', city: 'Nairobi', country: 'Kenya',
    daysOut: 12, startHour: 19, durationHours: 4, cover: IMG[4], currency: 'KES', capacity: 150, age: '21+',
    lineup: ['Nairobi Horns Project', 'Guest vocalist'], tags: ['jazz', 'live', 'rooftop'], featured: false,
    tiers: [
      { name: 'Standard Seat', description: 'Reserved seat with welcome glass.', price: 3500, quantity: 110, max: 6, perks: ['Reserved seat', 'Welcome glass'] },
      { name: 'Front Table', description: 'Table of two at the stage.', price: 12000, quantity: 20, max: 2, perks: ['Stage-side table', 'Wine pairing'] },
    ],
  },
  {
    slug: 'toronto-afrobeats-takeover', title: 'Toronto Afrobeats Takeover', tagline: 'The 6ix moves different',
    description: 'The biggest Afrobeats night in Canada returns. Two floors, surprise guest appearances, and a crowd that knows every word.',
    category: 'nightlife', venue: 'Rebel Nightclub', address: 'Polson Pier', city: 'Toronto', country: 'Canada',
    daysOut: 19, startHour: 22, durationHours: 5, cover: IMG[5], currency: 'CAD', capacity: 2500, age: '19+',
    lineup: ['DJ Charlie B', 'Special Guests'], tags: ['afrobeats', 'club', 'toronto'], featured: false,
    tiers: [
      { name: 'General', description: 'Main floor access.', price: 40, quantity: 2000, max: 8, perks: ['Main floor'] },
      { name: 'Booth', description: 'Booth for eight with bottle service.', price: 900, quantity: 25, max: 1, perks: ['Booth for 8', 'Bottle service'] },
    ],
  },
  {
    slug: 'dubai-yacht-sundowner', title: 'Dubai Yacht Sundowner', tagline: 'Golden hour on the Gulf',
    description: 'A four-hour sunset cruise along the Marina. Open deck DJ set, canapés, and the skyline turning gold behind you. Smart-casual; no flip flops.',
    category: 'party', venue: 'Dubai Marina Yacht Club', address: 'Dubai Marina', city: 'Dubai', country: 'United Arab Emirates',
    daysOut: 27, startHour: 16, durationHours: 4, cover: IMG[6], currency: 'AED', capacity: 120, age: '21+',
    lineup: ['Sunset DJ Set'], tags: ['yacht', 'sunset', 'luxury'], featured: false,
    tiers: [
      { name: 'Deck Pass', description: 'Cruise, canapés and two drinks.', price: 350, quantity: 100, max: 4, perks: ['Canapés', 'Two drinks'] },
      { name: 'Upper Deck', description: 'Premium deck with open bar.', price: 750, quantity: 20, max: 2, perks: ['Open bar', 'Premium deck'] },
    ],
  },
  {
    slug: 'atlanta-comedy-clash', title: 'Atlanta Comedy Clash', tagline: 'Two cities. One mic.',
    description: 'Lagos and Atlanta comedians go head to head for one night only. Two-drink minimum, no phones, front rows close enough to get picked on.',
    category: 'comedy', venue: 'The Eastern', address: 'Old Fourth Ward', city: 'Atlanta', country: 'United States',
    daysOut: 14, startHour: 20, durationHours: 3, cover: IMG[7], currency: 'USD', capacity: 800, age: '18+',
    lineup: ['Basketmouth', 'ATL headliner', 'Two support sets'], tags: ['comedy', 'standup', 'live'], featured: false,
    tiers: [
      { name: 'General', description: 'Reserved theatre seating.', price: 35, quantity: 650, max: 6, perks: ['Reserved seat'] },
      { name: 'Front Row', description: 'Brave souls only.', price: 80, quantity: 50, max: 4, perks: ['Front-row seat', 'Meet & greet'] },
    ],
  },
  {
    slug: 'joburg-art-night', title: 'Joburg Art Night', tagline: 'Maboneng after midnight',
    description: 'Galleries across Maboneng open late for one night — live painting, DJs in the courtyards, street food, and a closing rooftop party.',
    category: 'arts', venue: 'Maboneng Precinct', address: 'Fox Street', city: 'Johannesburg', country: 'South Africa',
    daysOut: 21, startHour: 18, durationHours: 8, cover: IMG[8], currency: 'ZAR', capacity: 3000, age: 'All ages',
    lineup: ['12 galleries', 'Live painting', 'Courtyard DJs'], tags: ['art', 'culture', 'streetfood'], featured: false,
    tiers: [
      { name: 'Wristband', description: 'Access to every venue on the route.', price: 150, quantity: 2500, max: 8, perks: ['All venues', 'Route map'] },
      { name: 'Collector', description: 'Guided tour plus rooftop afterparty.', price: 600, quantity: 100, max: 4, perks: ['Guided tour', 'Rooftop afterparty'] },
    ],
  },
  {
    slug: 'berlin-amapiano-warehouse', title: 'Berlin Amapiano Warehouse', tagline: 'Log drums in Kreuzberg',
    description: 'Amapiano meets Berlin warehouse culture. One long room, one heavy system, and log drums until 8am. Limited capacity; no cameras on the floor.',
    category: 'nightlife', venue: 'Ritter Halle', address: 'Kreuzberg', city: 'Berlin', country: 'Germany',
    daysOut: 30, startHour: 23, durationHours: 9, cover: IMG[9], currency: 'EUR', capacity: 900, age: '18+',
    lineup: ['Major League DJz (TBC)', 'Berlin residents'], tags: ['amapiano', 'warehouse', 'berlin'], featured: false,
    tiers: [
      { name: 'First Release', description: 'Cheapest way in. Limited.', price: 18, quantity: 300, max: 4, perks: [] },
      { name: 'Second Release', description: 'Standard entry.', price: 28, quantity: 500, max: 6, perks: [] },
    ],
  },
  {
    slug: 'sunday-jazz-brunch-lagos', title: 'Sunday Jazz Brunch', tagline: 'The slowest, best morning of your week',
    description: 'A live jazz quartet, a bottomless brunch menu and a terrace in the sun. The most civilised way to spend a Sunday in Lagos. Every seat reserved.',
    category: 'food', venue: 'The Terrace', address: 'Victoria Island', city: 'Lagos', country: 'Nigeria',
    daysOut: 5, startHour: 12, durationHours: 5, cover: IMG[4], currency: 'NGN', capacity: 150, age: 'All ages',
    lineup: ['The Convivia Quartet'], tags: ['jazz', 'brunch', 'live'], featured: false,
    tiers: [
      { name: 'Brunch Seat', description: 'A seat at brunch with bottomless soft drinks.', price: 18000, quantity: 100, max: 8, perks: ['Bottomless soft drinks'] },
      { name: 'Bottomless', description: 'Everything, plus bottomless mimosas for two hours.', price: 28000, quantity: 50, max: 8, perks: ['Bottomless mimosas', 'Priority seating'] },
    ],
  },
  {
    slug: 'founders-dinner-summit', title: "The Gathering — Founders' Dinner", tagline: 'One room. One night a year.',
    description: 'An annual dinner-summit. A keynote, a long table, and the people building the future of African business in one room. Dinner, wine pairing and after-party included.',
    category: 'conference', venue: 'Convivia24 Flagship', address: 'Victoria Island', city: 'Lagos', country: 'Nigeria',
    daysOut: 40, startHour: 18, durationHours: 5, cover: IMG[3], currency: 'NGN', capacity: 120, age: '21+',
    lineup: ['Keynote Address', 'Long Table Dinner', 'After Party'], tags: ['business', 'dinner', 'network'], featured: true,
    tiers: [
      { name: 'Seat at the Table', description: 'Dinner, keynote, wine pairing and after-party.', price: 150000, quantity: 105, max: 2, perks: ['Three-course dinner', 'Wine pairing', 'After party'] },
      { name: 'Host a Table', description: 'A table of eight. The best seats in the room.', price: 1100000, quantity: 15, max: 1, perks: ['Table for 8', 'Premium placement', 'Champagne on arrival'] },
    ],
  },
  {
    slug: 'manchester-old-school-rnb', title: 'Old School R&B Night', tagline: 'Slow jams and throwbacks',
    description: "Nothing released after 2009. Three hours of R&B, slow jams and the songs you forgot you knew every word to. Manchester's most requested night returns.",
    category: 'party', venue: 'Albert Hall', address: 'Peter Street', city: 'Manchester', country: 'United Kingdom',
    daysOut: 11, startHour: 21, durationHours: 5, cover: IMG[1], currency: 'GBP', capacity: 1500, age: '18+',
    lineup: ['DJ Day Day', 'Special guest vocalist'], tags: ['rnb', 'throwback', 'manchester'], featured: false,
    tiers: [
      { name: 'Standard', description: 'General admission.', price: 22, quantity: 1300, max: 8, perks: [] },
      { name: 'Balcony', description: 'Balcony view with table service.', price: 55, quantity: 200, max: 6, perks: ['Balcony', 'Table service'] },
    ],
  },
  {
    slug: 'abuja-amapiano-festival', title: 'Abuja Amapiano Festival', tagline: 'The capital turns up',
    description: 'A full-day open-air festival bringing the biggest Amapiano acts to Abuja. Food village, art market, and a main stage that runs from noon til midnight.',
    category: 'festival', venue: 'Jabi Lake Arena', address: 'Jabi', city: 'Abuja', country: 'Nigeria',
    daysOut: 45, startHour: 12, durationHours: 12, cover: IMG[2], currency: 'NGN', capacity: 3000, age: '16+',
    lineup: ['Kabza headline', 'Major League', 'Local openers'], tags: ['amapiano', 'festival', 'outdoor'], featured: false,
    tiers: [
      { name: 'Day Pass', description: 'Full-day festival access.', price: 15000, quantity: 2000, max: 10, perks: ['All stages', 'Food village access'] },
      { name: 'VIP Pass', description: 'Raised viewing deck, fast lane and VIP bar.', price: 60000, quantity: 400, max: 6, perks: ['VIP deck', 'Fast lane', 'VIP bar'] },
      { name: 'Cabana', description: 'Private cabana for up to six guests.', price: 350000, quantity: 40, max: 1, perks: ['Private cabana', 'Dedicated host', 'Bottle package'] },
    ],
  },
  {
    slug: 'paris-afro-house-soiree', title: 'Paris Afro-House Soirée', tagline: 'Le Marais, après minuit',
    description: 'Afro-house and amapiano in a vaulted cellar club in Le Marais. An intimate 300-cap room, serious sound, and a dance floor that does not stop.',
    category: 'nightlife', venue: 'Cellar du Marais', address: 'Le Marais', city: 'Paris', country: 'France',
    daysOut: 23, startHour: 23, durationHours: 6, cover: IMG[0], currency: 'EUR', capacity: 300, age: '18+',
    lineup: ['Parisian residents', 'Lagos guest DJ'], tags: ['afrohouse', 'paris', 'club'], featured: false,
    tiers: [
      { name: 'Entrée', description: 'Standard entry.', price: 25, quantity: 250, max: 6, perks: [] },
      { name: 'Table', description: 'Reserved table for four with a bottle.', price: 220, quantity: 12, max: 1, perks: ['Table for 4', 'Bottle included'] },
    ],
  },
];

/** Insert sample events + tiers. Returns how many new events were created. */
export async function seedEvents(sql: SqlFn): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  for (const e of SEED_EVENTS) {
    const startsAt = new Date(Date.now() + e.daysOut * 86400000);
    startsAt.setHours(e.startHour, 0, 0, 0);
    const endsAt = new Date(startsAt.getTime() + e.durationHours * 3600000);

    const rows = await sql`
      INSERT INTO events (slug, title, tagline, description, category, organizer_name, venue, address, city, country,
        starts_at, ends_at, cover_image, currency, capacity, age_restriction, lineup, tags, is_featured, status)
      VALUES (${e.slug}, ${e.title}, ${e.tagline}, ${e.description}, ${e.category}, ${'Convivia Live'},
        ${e.venue}, ${e.address}, ${e.city}, ${e.country},
        ${startsAt.toISOString()}, ${endsAt.toISOString()}, ${e.cover}, ${e.currency}, ${e.capacity},
        ${e.age}, ${e.lineup}, ${e.tags}, ${e.featured}, 'published')
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `;

    if (!rows.length) { skipped++; continue; }
    created++;

    let order = 0;
    for (const t of e.tiers) {
      await sql`
        INSERT INTO ticket_types (event_id, name, description, price, currency, quantity, max_per_order, perks, sort_order)
        VALUES (${rows[0].id}, ${t.name}, ${t.description}, ${t.price}, ${e.currency}, ${t.quantity}, ${t.max}, ${t.perks.length ? t.perks : null}, ${order++})
      `;
    }
  }

  return { created, skipped };
}
