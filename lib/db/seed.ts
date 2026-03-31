// Run: npx tsx lib/db/seed.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

// Load .env manually
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

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🌱 Seeding Convivia24 Database...\n');

  // 1. Clear existing data
  await sql`TRUNCATE TABLE attendees, connections, circle_members, circles, hangouts, venues, inquiries, waitlist, users CASCADE`;
  
  // ─────────────────────────────────────
  // 2. VENUES
  // ─────────────────────────────────────
  console.log('🏛  Inserting Venues...');
  
  const venueData = [
    { name: 'The Floor', type: 'Arrival Lounge', tagline: 'Where the handshake begins.', description: 'Open-plan arrival lounge with full-service bar, warm lighting, and low furniture. The designated space where your first app-matched introduction becomes a real conversation.', image_url: '/The Spaces.png', capacity: 'Open', city: 'Lagos' },
    { name: 'The Table', type: 'Curated Dining', tagline: 'Six to twenty-four, no strangers.', description: 'Communal dining built for depth, not width. Reservations are booked exclusively through the app for curated groups of 6 to 24. Rotating menus. No small talk.', image_url: '/Convivium3.png', capacity: '6-24', city: 'Lagos' },
    { name: 'Chambers', type: 'Quiet Suite', tagline: 'Silence before the storm.', description: 'Zero-distraction private suites with command-centre desks. Book by the hour via the app. Blackout blinds, filtered air, and nothing to break your focus.', image_url: '/The Spaces2.png', capacity: '1-2', city: 'Lagos' },
    { name: 'Deal Rooms', type: 'Boardroom', tagline: 'Where conversations become commitments.', description: 'Private, high-fidelity meeting rooms named after African cities. Full AV. Excellent coffee. No interruptions.', image_url: '/dealrooms.png', capacity: '4-12', city: 'Lagos' },
    { name: 'The Floor', type: 'Arrival Lounge', tagline: 'First impressions, elevated.', description: 'The Abuja Floor mirrors Lagos - a curated arrival space where digital connections land in real life over great drinks.', image_url: '/The Spaces3.png', capacity: 'Open', city: 'Abuja' },
    { name: 'The Table', type: 'Curated Dining', tagline: 'Every seat is intentional.', description: 'Curated dining experiences for founders, operators, and executives building across West Africa.', image_url: '/Convivium3.png', capacity: '6-24', city: 'Abuja' },
  ];

  for (const v of venueData) {
    await sql`INSERT INTO venues (name, type, tagline, description, image_url, capacity, city) VALUES (${v.name}, ${v.type}, ${v.tagline}, ${v.description}, ${v.image_url}, ${v.capacity}, ${v.city})`;
  }

  // ─────────────────────────────────────
  // 3. USERS
  // ─────────────────────────────────────
  console.log('👤 Inserting Users...');
  
  const usersResult = [];
  const userData = [
    { name: 'Collins Nnaji', email: 'collins@convivia24.com', avatar_url: 'https://i.pravatar.cc/150?u=collins', bio: 'Building the infrastructure for African business over dinner.', location: 'Lagos', tier: 'black', rating: 4.9, hangouts_count: 12 },
    { name: 'Amara Okafor', email: 'amara@example.com', avatar_url: 'https://i.pravatar.cc/150?u=amara', bio: 'Venture partner. Backing founders who build for the continent.', location: 'Lagos', tier: 'black', rating: 4.8, hangouts_count: 8 },
    { name: 'Tunde Adeyemi', email: 'tunde@example.com', avatar_url: 'https://i.pravatar.cc/150?u=tunde', bio: 'Creative director blending Afro-futurism with brand strategy.', location: 'Abuja', tier: 'standard', rating: 4.7, hangouts_count: 5 },
    { name: 'Nkechi Eze', email: 'nkechi@example.com', avatar_url: 'https://i.pravatar.cc/150?u=nkechi', bio: 'Fintech operator. Making payments invisible across West Africa.', location: 'Lagos', tier: 'standard', rating: 4.6, hangouts_count: 3 },
    { name: 'David Mensah', email: 'david@example.com', avatar_url: 'https://i.pravatar.cc/150?u=david', bio: 'Diaspora returnee. Scaling agri-tech from London to Accra to Lagos.', location: 'London', tier: 'black', rating: 4.9, hangouts_count: 18 },
  ];

  for (const u of userData) {
    const rows = await sql`INSERT INTO users (name, email, avatar_url, bio, location, tier, rating, hangouts_count) VALUES (${u.name}, ${u.email}, ${u.avatar_url}, ${u.bio}, ${u.location}, ${u.tier}, ${u.rating}, ${u.hangouts_count}) RETURNING id`;
    usersResult.push(rows[0].id);
  }

  const [collins, amara, tunde, nkechi, david] = usersResult;

  // ─────────────────────────────────────
  // 4. HANGOUTS
  // ─────────────────────────────────────
  console.log('🎯 Inserting Hangouts...');
  const tonight = new Date();
  tonight.setHours(tonight.getHours() + 4);
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);
  
  const weekend = new Date();
  weekend.setDate(weekend.getDate() + (6 - weekend.getDay()));
  weekend.setHours(13, 0, 0, 0);

  const hangoutData = [
    { host_id: amara, title: 'Founders After Dark', vibe: 'Whisky, ideas, and honest conversations about what is actually working.', type: 'curated', status: 'confirmed', event_time: tonight.toISOString(), location: 'The Table, Victoria Island', max_guests: 6, current_guests: 4 },
    { host_id: david, title: 'Sunday Roast and Roadmaps', vibe: 'Long lunch for operators serious about scaling across borders.', type: 'open', status: 'pending', event_time: weekend.toISOString(), location: 'The Floor, Ikoyi', max_guests: 12, current_guests: 3 },
    { host_id: collins, title: 'Creative x Capital Mixer', vibe: 'Where art directors meet angel investors. No pitches, just presence.', type: 'curated', status: 'pending', event_time: tomorrow.toISOString(), location: 'The Floor, Victoria Island', max_guests: 24, current_guests: 7 },
    { host_id: tunde, title: 'Morning Fuel: Abuja Edition', vibe: 'Coffee and clarity. Bringing Abuja founders together before the day starts.', type: 'open', status: 'confirmed', event_time: tomorrow.toISOString(), location: 'The Floor, Abuja', max_guests: 8, current_guests: 2 },
    { host_id: nkechi, title: 'Fintech Roundtable', vibe: 'Payments, lending, infrastructure - the builders sit together.', type: 'curated', status: 'pending', event_time: weekend.toISOString(), location: 'Deal Rooms, Victoria Island', max_guests: 10, current_guests: 5 },
  ];

  const hangoutIds = [];
  for (const h of hangoutData) {
    const rows = await sql`INSERT INTO hangouts (host_id, title, vibe, type, status, event_time, location, max_guests, current_guests) VALUES (${h.host_id}, ${h.title}, ${h.vibe}, ${h.type}, ${h.status}, ${h.event_time}, ${h.location}, ${h.max_guests}, ${h.current_guests}) RETURNING id`;
    hangoutIds.push(rows[0].id);
  }

  // ─────────────────────────────────────
  // 5. ATTENDEES
  // ─────────────────────────────────────
  console.log('🙋 Inserting Attendees...');
  const attendeeData = [
    [hangoutIds[0], amara], [hangoutIds[0], collins], [hangoutIds[0], nkechi], [hangoutIds[0], david],
    [hangoutIds[1], david], [hangoutIds[1], tunde], [hangoutIds[1], nkechi],
    [hangoutIds[2], collins], [hangoutIds[2], amara], [hangoutIds[2], tunde],
    [hangoutIds[3], tunde], [hangoutIds[3], nkechi],
    [hangoutIds[4], nkechi], [hangoutIds[4], collins], [hangoutIds[4], amara], [hangoutIds[4], david],
  ];
  for (const [hid, uid] of attendeeData) {
    await sql`INSERT INTO attendees (hangout_id, user_id, status) VALUES (${hid}, ${uid}, 'attending')`;
  }

  // ─────────────────────────────────────
  // 6. CIRCLES
  // ─────────────────────────────────────
  console.log('⭕ Inserting Circles...');
  const circleData = [
    { name: 'Founders Friday', description: 'Weekly gathering for builders scaling businesses across Africa.', created_by: collins },
    { name: 'The Palate', description: 'Foodies, chefs, and hospitality operators exploring Lagos dining.', created_by: david },
    { name: 'Deal Flow', description: 'Investors and founders exchanging leads and doing due diligence together.', created_by: amara },
  ];
  const circleIds = [];
  for (const c of circleData) {
    const rows = await sql`INSERT INTO circles (name, description, created_by) VALUES (${c.name}, ${c.description}, ${c.created_by}) RETURNING id`;
    circleIds.push(rows[0].id);
  }

  // ─────────────────────────────────────
  // 7. CIRCLE MEMBERS
  // ─────────────────────────────────────
  console.log('👥 Inserting Circle Members...');
  const memberData = [
    [circleIds[0], collins], [circleIds[0], amara], [circleIds[0], david],
    [circleIds[1], david], [circleIds[1], nkechi], [circleIds[1], collins],
    [circleIds[2], amara], [circleIds[2], collins], [circleIds[2], tunde],
  ];
  for (const [cid, uid] of memberData) {
    await sql`INSERT INTO circle_members (circle_id, user_id) VALUES (${cid}, ${uid})`;
  }

  // ─────────────────────────────────────
  // 8. CONNECTIONS
  // ─────────────────────────────────────
  console.log('🤝 Inserting Connections...');
  const connectionData = [
    [collins, amara, 5], [collins, david, 5], [collins, nkechi, 4],
    [amara, collins, 5], [david, collins, 5], [tunde, collins, 4],
  ];
  for (const [u1, u2, rating] of connectionData) {
    await sql`INSERT INTO connections (user_id_1, user_id_2, rating) VALUES (${u1}, ${u2}, ${rating})`;
  }

  console.log('\n✅ Seeding Complete!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
