// Run: npx tsx lib/db/seed.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

const envPath = join(process.cwd(), '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* no .env file */ }

function hoursFromNow(h: number) {
  const d = new Date();
  d.setTime(d.getTime() + h * 60 * 60 * 1000);
  return d.toISOString();
}

function daysFromNow(days: number, hour = 20, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log('🌱 Seeding Convivia24 Database...\n');

  await sql`TRUNCATE TABLE attendees, connections, hangouts, venues, inquiries, waitlist, users CASCADE`;

  // ─── VENUES ────────────────────────────────────────────────────────────────
  console.log('🏛  Inserting Venues...');
  const venueData = [
    { name: 'The Table at Noir', type: 'Curated Dining', category: 'dining', tagline: 'Six to twenty-four, no strangers.', description: 'Private dining reserved exclusively for Convivia24 curated groups. Rotating tasting menus, intentional seating.', image_url: '/Convivium3.png', capacity: '6-24', partner_name: 'Noir Lagos', address: 'Victoria Island, Lagos', minimum_spend: 25000, availability: 'Mon–Wed, 7pm–11pm', rating: 4.9, city: 'Lagos' },
    { name: 'The Floor at Wheatbaker', type: 'Arrival Lounge', category: 'lounge', tagline: 'Where the handshake begins.', description: 'A reserved VIP corner inside one of Ikoyi\'s most iconic hotels.', image_url: '/The Spaces.png', capacity: 'Open', partner_name: 'The Wheatbaker Hotel', address: '4 Lawrence Rd, Ikoyi, Lagos', minimum_spend: 15000, availability: 'Daily, 5pm–12am', rating: 4.8, city: 'Lagos' },
    { name: 'Deal Room — Continental', type: 'Boardroom', category: 'boardroom', tagline: 'Where conversations become commitments.', description: 'High-fidelity private meeting suite on the executive floor.', image_url: '/dealrooms.png', capacity: '4-12', partner_name: 'Lagos Continental Hotel', address: 'Plot 52A, Kofo Abayomi St, V.I.', minimum_spend: 50000, availability: 'Weekdays, 9am–6pm', rating: 4.7, city: 'Lagos' },
    { name: 'The Floor Abuja', type: 'Arrival Lounge', category: 'lounge', tagline: 'Abuja\'s gathering point.', description: 'Premium lounge space in the capital.', image_url: '/The Spaces2.png', capacity: 'Open', partner_name: 'Transcorp Hilton', address: 'Plot 1096, Aguiyi Ironsi St, Maitama', minimum_spend: 12000, availability: 'Daily, 5pm–12am', rating: 4.6, city: 'Abuja' },
    { name: 'Shoreditch Social Club', type: 'Lounge Bar', category: 'lounge', tagline: 'Where African creatives meet in London.', description: 'A curated space for the diaspora and their network.', image_url: '/The Spaces3.png', capacity: 'Open', partner_name: 'Box Park Shoreditch', address: '2 Bethnal Green Rd, London E1 6GY', minimum_spend: 0, availability: 'Thu–Sun, 6pm–1am', rating: 4.7, city: 'London' },
  ];

  for (const v of venueData) {
    await sql`INSERT INTO venues (name, type, category, tagline, description, image_url, capacity, partner_name, address, minimum_spend, availability, rating, city)
      VALUES (${v.name}, ${v.type}, ${v.category}, ${v.tagline}, ${v.description}, ${v.image_url}, ${v.capacity}, ${v.partner_name}, ${v.address}, ${v.minimum_spend}, ${v.availability}, ${v.rating}, ${v.city})`;
  }

  // ─── USERS ─────────────────────────────────────────────────────────────────
  console.log('👤 Inserting Users...');
  const userData = [
    // Lagos crew
    { name: 'Collins Nnaji',    email: 'collins@convivia24.com',  avatar_url: 'https://i.pravatar.cc/150?u=collins24', bio: 'Building the social infrastructure for Africa, one night out at a time.', location: 'Lagos',  tier: 'black',    verified: true,  open_to_meet: true,  rating: 4.9, hangouts_count: 14 },
    { name: 'Amara Okafor',     email: 'amara@example.com',       avatar_url: 'https://i.pravatar.cc/150?u=amara24',   bio: 'VC partner. If you\'re building something real, let\'s talk over dinner.',   location: 'Lagos',  tier: 'black',    verified: true,  open_to_meet: true,  rating: 4.8, hangouts_count: 11 },
    { name: 'Nkechi Eze',       email: 'nkechi@example.com',      avatar_url: 'https://i.pravatar.cc/150?u=nkechi24',  bio: 'Fintech operator. Making payments invisible across West Africa.',          location: 'Lagos',  tier: 'standard', verified: true,  open_to_meet: true,  rating: 4.6, hangouts_count: 6  },
    { name: 'Emeka Obi',        email: 'emeka@example.com',       avatar_url: 'https://i.pravatar.cc/150?u=emeka24',   bio: 'Club promoter & creative. If there\'s a vibe, I found it.',               location: 'Lagos',  tier: 'standard', verified: false, open_to_meet: true,  rating: 4.5, hangouts_count: 9  },
    { name: 'Zainab Bello',     email: 'zainab@example.com',      avatar_url: 'https://i.pravatar.cc/150?u=zainab24',  bio: 'Fashion designer. Always at the best spots before they blow up.',         location: 'Lagos',  tier: 'standard', verified: false, open_to_meet: false, rating: 4.4, hangouts_count: 4  },
    { name: 'Femi Adebayo',     email: 'femi@example.com',        avatar_url: 'https://i.pravatar.cc/150?u=femi24',    bio: 'Football lad. Looking for a 5-a-side crew every Sunday.',                 location: 'Lagos',  tier: 'standard', verified: false, open_to_meet: true,  rating: 4.3, hangouts_count: 7  },
    // Abuja crew
    { name: 'Tunde Adeyemi',    email: 'tunde@example.com',       avatar_url: 'https://i.pravatar.cc/150?u=tunde24',   bio: 'Creative director. Afro-futurism is the brand strategy.',                 location: 'Abuja',  tier: 'standard', verified: true,  open_to_meet: true,  rating: 4.7, hangouts_count: 5  },
    { name: 'Halima Yusuf',     email: 'halima@example.com',      avatar_url: 'https://i.pravatar.cc/150?u=halima24',  bio: 'Civil servant by day, DJ by night. Abuja\'s best kept secret.',           location: 'Abuja',  tier: 'standard', verified: false, open_to_meet: true,  rating: 4.5, hangouts_count: 3  },
    { name: 'Ibrahim Musa',     email: 'ibrahim@example.com',     avatar_url: 'https://i.pravatar.cc/150?u=ibrahim24', bio: 'Policy analyst. The best conversations happen over shawarma.',            location: 'Abuja',  tier: 'standard', verified: false, open_to_meet: false, rating: 4.2, hangouts_count: 2  },
    // London crew
    { name: 'David Mensah',     email: 'david@example.com',       avatar_url: 'https://i.pravatar.cc/150?u=david24',   bio: 'Diaspora returnee. Scaling agri-tech from London to Accra to Lagos.',     location: 'London', tier: 'black',    verified: true,  open_to_meet: true,  rating: 4.9, hangouts_count: 18 },
    { name: 'Adaeze Igwe',      email: 'adaeze@example.com',      avatar_url: 'https://i.pravatar.cc/150?u=adaeze24',  bio: 'Barrister. Big 4 alumni. Knows every Nigerian restaurant in London.',      location: 'London', tier: 'black',    verified: true,  open_to_meet: true,  rating: 4.7, hangouts_count: 8  },
    { name: 'Kofi Mensah',      email: 'kofi@example.com',        avatar_url: 'https://i.pravatar.cc/150?u=kofi24',    bio: 'Music producer. If the playlist isn\'t right, I\'ll fix it.',            location: 'London', tier: 'standard', verified: false, open_to_meet: true,  rating: 4.5, hangouts_count: 5  },
    { name: 'Sade Williams',    email: 'sade@example.com',        avatar_url: 'https://i.pravatar.cc/150?u=sade24',    bio: 'NHS doctor + Afrobeats dancer. Work hard, play harder.',                  location: 'London', tier: 'standard', verified: false, open_to_meet: true,  rating: 4.4, hangouts_count: 6  },
  ];

  const userIds: string[] = [];
  for (const u of userData) {
    const rows = await sql`
      INSERT INTO users (name, email, avatar_url, bio, location, tier, verified, open_to_meet, rating, hangouts_count)
      VALUES (${u.name}, ${u.email}, ${u.avatar_url}, ${u.bio}, ${u.location}, ${u.tier}, ${u.verified}, ${u.open_to_meet}, ${u.rating}, ${u.hangouts_count})
      RETURNING id`;
    userIds.push(rows[0].id as string);
  }

  const [collins, amara, nkechi, emeka, zainab, femi, tunde, halima, ibrahim, david, adaeze, kofi, sade] = userIds;

  // ─── HANGOUTS ──────────────────────────────────────────────────────────────
  console.log('🎯 Inserting Hangouts...');

  const hangoutData = [
    // ── LAGOS — TONIGHT ──
    {
      host_id: emeka, city: 'Lagos', category: 'nightlife',
      title: 'Afrobeats Night at Quilox',
      vibe: 'Biggest club in Lagos tonight. Looking for 4 people to roll with — proper vibe only.',
      type: 'open', status: 'confirmed',
      event_time: hoursFromNow(3),
      location: 'Quilox Club, Victoria Island, Lagos',
      max_guests: 8, current_guests: 3,
      ticket_price: 10000,
    },
    {
      host_id: amara, city: 'Lagos', category: 'dining',
      title: 'Founders After Dark',
      vibe: 'Whisky, jollof, and honest conversations about what is actually working. No pitches.',
      type: 'curated', status: 'confirmed',
      event_time: hoursFromNow(4),
      location: 'The Table at Noir, Victoria Island, Lagos',
      max_guests: 6, current_guests: 4,
      ticket_price: null,
    },
    {
      host_id: zainab, city: 'Lagos', category: 'social',
      title: 'Rooftop Sundowner — VI',
      vibe: 'Golden hour drinks on the best rooftop in Lagos. Fashion, music, good people.',
      type: 'open', status: 'confirmed',
      event_time: hoursFromNow(2),
      location: 'Sky Bar, Eko Hotel, Victoria Island, Lagos',
      max_guests: 15, current_guests: 6,
      ticket_price: 5000,
    },

    // ── LAGOS — TOMORROW ──
    {
      host_id: collins, city: 'Lagos', category: 'social',
      title: 'Creative × Capital Mixer',
      vibe: 'Where art directors meet angel investors. No pitches, just presence and good conversation.',
      type: 'curated', status: 'pending',
      event_time: daysFromNow(1, 19, 0),
      location: 'The Floor, Wheatbaker Hotel, Ikoyi, Lagos',
      max_guests: 24, current_guests: 7,
      ticket_price: null,
    },
    {
      host_id: femi, city: 'Lagos', category: 'sports',
      title: 'Sunday 5-a-side — Lekki',
      vibe: 'Casual football, any level welcome. Ballers, joggers, all good. Just show up.',
      type: 'open', status: 'confirmed',
      event_time: daysFromNow(1, 9, 0),
      location: 'Astroturf, Admiralty Way, Lekki Phase 1, Lagos',
      max_guests: 10, current_guests: 4,
      ticket_price: 2000,
    },
    {
      host_id: nkechi, city: 'Lagos', category: 'dining',
      title: 'Sunday Brunch at Nok',
      vibe: 'Pan-African brunch, bottomless drinks, great company. Lagos Sundays done right.',
      type: 'open', status: 'pending',
      event_time: daysFromNow(1, 12, 30),
      location: 'Nok by Alara, Victoria Island, Lagos',
      max_guests: 10, current_guests: 3,
      ticket_price: 15000,
    },

    // ── LAGOS — THIS WEEK ──
    {
      host_id: amara, city: 'Lagos', category: 'gigs',
      title: 'Burna Boy at Eko Convention',
      vibe: 'Concert run. Looking for 5 people who actually know the lyrics. No tourists.',
      type: 'open', status: 'confirmed',
      event_time: daysFromNow(3, 20, 0),
      location: 'Eko Convention Centre, Victoria Island, Lagos',
      max_guests: 8, current_guests: 5,
      ticket_price: 35000,
      ticket_url: 'https://nairabox.com',
    },
    {
      host_id: emeka, city: 'Lagos', category: 'nightlife',
      title: 'Section 808 — Bar Night',
      vibe: 'Low-key bar night for people who can hold a conversation. Section 808 is intimate, no tourists.',
      type: 'curated', status: 'pending',
      event_time: daysFromNow(2, 21, 0),
      location: 'Section 808, Lekki Phase 1, Lagos',
      max_guests: 6, current_guests: 2,
      ticket_price: null,
    },
    {
      host_id: femi, city: 'Lagos', category: 'fitness',
      title: 'Early Morning Run — Ikoyi',
      vibe: '5km along the Ikoyi Link Bridge. All paces welcome. Healthy breakfast after.',
      type: 'open', status: 'confirmed',
      event_time: daysFromNow(4, 6, 30),
      location: 'Ikoyi Link Bridge, Lagos',
      max_guests: 20, current_guests: 8,
      ticket_price: null,
    },
    {
      host_id: collins, city: 'Lagos', category: 'arts',
      title: 'Nike Art Gallery Opening Night',
      vibe: 'New exhibition opening at Nike Gallery. Contemporary African art, champagne, conversation.',
      type: 'open', status: 'confirmed',
      event_time: daysFromNow(5, 18, 0),
      location: 'Nike Art Gallery, Lekki, Lagos',
      max_guests: 20, current_guests: 9,
      ticket_price: null,
    },
    {
      host_id: nkechi, city: 'Lagos', category: 'outdoors',
      title: 'Lekki Conservation Centre Hike',
      vibe: 'Canopy walk + nature trail at Lekki Conservation. Peaceful, earthy, beautiful.',
      type: 'open', status: 'confirmed',
      event_time: daysFromNow(6, 8, 0),
      location: 'Lekki Conservation Centre, Lekki, Lagos',
      max_guests: 12, current_guests: 5,
      ticket_price: 3000,
    },

    // ── ABUJA — TONIGHT ──
    {
      host_id: tunde, city: 'Abuja', category: 'social',
      title: 'Abuja Founders Linkup',
      vibe: 'Casual drinks for anyone building something in Abuja. No agenda, just good energy.',
      type: 'open', status: 'confirmed',
      event_time: hoursFromNow(5),
      location: 'Transcorp Hilton Lounge, Maitama, Abuja',
      max_guests: 12, current_guests: 4,
      ticket_price: null,
    },
    {
      host_id: halima, city: 'Abuja', category: 'nightlife',
      title: 'Club Havana Tonight',
      vibe: 'Havana is the move tonight. Looking for 5 people who dance properly. Afrobeats + Amapiano.',
      type: 'open', status: 'confirmed',
      event_time: hoursFromNow(4),
      location: 'Club Havana, Wuse 2, Abuja',
      max_guests: 8, current_guests: 3,
      ticket_price: 5000,
    },

    // ── ABUJA — THIS WEEK ──
    {
      host_id: ibrahim, city: 'Abuja', category: 'dining',
      title: 'Shawarma + Debate Night',
      vibe: 'Best shawarma in Wuse 2, then we argue about politics, tech, and life. Who\'s in?',
      type: 'open', status: 'pending',
      event_time: daysFromNow(2, 20, 0),
      location: 'Lebanese Corner, Wuse 2, Abuja',
      max_guests: 6, current_guests: 2,
      ticket_price: null,
    },
    {
      host_id: tunde, city: 'Abuja', category: 'arts',
      title: 'Abuja Art Week Meetup',
      vibe: 'Gallery walk across 3 spaces in Maitama. Art lovers, collectors, curious people welcome.',
      type: 'open', status: 'confirmed',
      event_time: daysFromNow(3, 17, 0),
      location: 'Thought Pyramid Art Centre, Maitama, Abuja',
      max_guests: 15, current_guests: 6,
      ticket_price: null,
    },
    {
      host_id: halima, city: 'Abuja', category: 'fitness',
      title: 'Millenium Park Morning Walk',
      vibe: 'Easy 4km walk around Millenium Park. Best way to start a weekday in Abuja.',
      type: 'open', status: 'confirmed',
      event_time: daysFromNow(1, 7, 0),
      location: 'Millennium Park, Abuja',
      max_guests: 25, current_guests: 7,
      ticket_price: null,
    },

    // ── LONDON — TONIGHT ──
    {
      host_id: david, city: 'London', category: 'nightlife',
      title: 'Afrobeats at XOYO',
      vibe: 'XOYO has the best Afrobeats night in London. Getting a table — who wants in?',
      type: 'curated', status: 'confirmed',
      event_time: hoursFromNow(4),
      location: 'XOYO, 32-37 Cowper St, Shoreditch, London',
      max_guests: 8, current_guests: 5,
      ticket_price: 15000,
      ticket_url: 'https://ra.co',
    },
    {
      host_id: adaeze, city: 'London', category: 'dining',
      title: 'West African Dining — Chuku\'s',
      vibe: 'The best Nigerian tapas in London. Puff puff, pepper soup, great wine. Let\'s go.',
      type: 'open', status: 'confirmed',
      event_time: hoursFromNow(3),
      location: 'Chuku\'s Nigerian Tapas, Tottenham, London',
      max_guests: 8, current_guests: 4,
      ticket_price: null,
    },

    // ── LONDON — THIS WEEK ──
    {
      host_id: kofi, city: 'London', category: 'gigs',
      title: 'Wizkid at the O2 — Group Run',
      vibe: 'Already have tickets. Looking for a group to go together. Pre-drinks in Shoreditch first.',
      type: 'open', status: 'confirmed',
      event_time: daysFromNow(2, 19, 0),
      location: 'The O2 Arena, Greenwich, London',
      max_guests: 10, current_guests: 6,
      ticket_price: 20000,
    },
    {
      host_id: sade, city: 'London', category: 'fitness',
      title: 'Victoria Park Run + Brunch',
      vibe: '5k run in Victoria Park then brunch at the cafe. Sundays done right in East London.',
      type: 'open', status: 'confirmed',
      event_time: daysFromNow(1, 9, 0),
      location: 'Victoria Park, Hackney, London',
      max_guests: 12, current_guests: 5,
      ticket_price: null,
    },
    {
      host_id: david, city: 'London', category: 'social',
      title: 'Diaspora Drinks — Brixton',
      vibe: 'Drinks for Africans in London doing big things. No formality, just good people.',
      type: 'open', status: 'confirmed',
      event_time: daysFromNow(3, 19, 30),
      location: 'Electric Brixton, Brixton, London',
      max_guests: 20, current_guests: 11,
      ticket_price: null,
    },
    {
      host_id: adaeze, city: 'London', category: 'outdoors',
      title: 'Hampstead Heath Sunday Walk',
      vibe: 'Long walk on Hampstead Heath. Great views, fresh air, interesting conversation.',
      type: 'open', status: 'confirmed',
      event_time: daysFromNow(4, 11, 0),
      location: 'Hampstead Heath, North London',
      max_guests: 15, current_guests: 4,
      ticket_price: null,
    },
    {
      host_id: kofi, city: 'London', category: 'arts',
      title: 'Tate Modern — Afro Art Exhibition',
      vibe: 'New contemporary African exhibition at Tate Modern. Free entry, café after.',
      type: 'open', status: 'confirmed',
      event_time: daysFromNow(5, 14, 0),
      location: 'Tate Modern, Bankside, London',
      max_guests: 10, current_guests: 3,
      ticket_price: null,
    },
  ];

  const hangoutIds: string[] = [];
  for (const h of hangoutData) {
    const rows = await sql`
      INSERT INTO hangouts (host_id, title, vibe, category, type, status, event_time, location, city, max_guests, current_guests, ticket_price, ticket_url)
      VALUES (
        ${h.host_id}, ${h.title}, ${h.vibe}, ${h.category}, ${h.type}, ${h.status},
        ${h.event_time}, ${h.location}, ${h.city}, ${h.max_guests}, ${h.current_guests},
        ${(h as any).ticket_price ?? null}, ${(h as any).ticket_url ?? null}
      )
      RETURNING id`;
    hangoutIds.push(rows[0].id as string);
  }

  // ─── ATTENDEES ─────────────────────────────────────────────────────────────
  console.log('🙋 Inserting Attendees...');

  // [hangout_index, ...user_ids]
  const attendeeGroups: [number, string[]][] = [
    // Lagos tonight
    [0,  [emeka, nkechi, zainab]],
    [1,  [amara, collins, nkechi, david]],
    [2,  [zainab, emeka, nkechi, femi, amara, collins]],
    // Lagos tomorrow
    [3,  [collins, amara, tunde, nkechi, david, emeka, zainab]],
    [4,  [femi, emeka, nkechi, collins]],
    [5,  [nkechi, amara, zainab]],
    // Lagos this week
    [6,  [amara, david, nkechi, emeka, collins]],
    [7,  [emeka, nkechi]],
    [8,  [femi, nkechi, collins, amara, zainab, emeka, tunde, david]],
    [9,  [collins, amara, zainab, nkechi, emeka, david, femi, tunde, halima]],
    [10, [nkechi, femi, amara, collins, emeka]],
    // Abuja tonight
    [11, [tunde, halima, ibrahim, emeka]],
    [12, [halima, tunde, ibrahim]],
    // Abuja this week
    [13, [ibrahim, tunde]],
    [14, [tunde, halima, ibrahim, nkechi, emeka, femi]],
    [15, [halima, tunde, ibrahim, nkechi, amara, femi, collins]],
    // London tonight
    [16, [david, adaeze, kofi, sade, emeka]],
    [17, [adaeze, david, kofi, sade]],
    // London this week
    [18, [kofi, david, adaeze, sade, nkechi, emeka]],
    [19, [sade, adaeze, kofi, david, nkechi]],
    [20, [david, adaeze, kofi, sade, emeka, nkechi, femi, zainab, amara, tunde, collins]],
    [21, [adaeze, kofi, david, sade]],
    [22, [kofi, sade, adaeze]],
  ];

  for (const [idx, users] of attendeeGroups) {
    const hid = hangoutIds[idx];
    if (!hid) continue;
    const seen = new Set<string>();
    for (const uid of users) {
      if (!uid || seen.has(uid)) continue;
      seen.add(uid);
      try {
        await sql`INSERT INTO attendees (hangout_id, user_id, status) VALUES (${hid}, ${uid}, 'attending')`;
      } catch { /* skip duplicate */ }
    }
  }

  // ─── CONNECTIONS ───────────────────────────────────────────────────────────
  console.log('🤝 Inserting Connections...');
  const connectionData: [string, string, number][] = [
    [collins, amara, 5], [collins, david, 5], [collins, nkechi, 4],
    [amara, collins, 5], [david, collins, 5], [david, adaeze, 5],
    [emeka, zainab, 4], [emeka, nkechi, 4], [tunde, halima, 5],
    [kofi, sade, 4],    [adaeze, kofi, 4],
  ];
  for (const [u1, u2, rating] of connectionData) {
    if (!u1 || !u2) continue;
    try {
      await sql`INSERT INTO connections (user_id_1, user_id_2, rating) VALUES (${u1}, ${u2}, ${rating})`;
    } catch { /* skip */ }
  }

  console.log('\n✅ Seeding Complete!');
  console.log(`   ${userIds.length} users`);
  console.log(`   ${hangoutIds.length} hangouts (Lagos, Abuja, London)`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
