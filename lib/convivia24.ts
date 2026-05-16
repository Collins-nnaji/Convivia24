import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface Convivia24Event {
  id: string;
  user_id: string;
  slug: string | null;
  title: string;
  event_type: string;
  host_name: string;
  event_date: string | null;
  event_time: string | null;
  city: string | null;
  venue: string | null;
  address: string | null;
  capacity: number;
  dress_code: string | null;
  invite_direction: string;
  invite_live: boolean;
  cover_url: string | null;
  rsvp_deadline: string | null;
  days_out: number | null;
  created_at: string;
  updated_at: string;
}

export interface Convivia24Guest {
  id: string;
  event_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  party_size: number;
  table_id: string | null;
  rsvp_state: string;
  dietary: string | null;
  relation: string | null;
  song_request: string | null;
  message: string | null;
  pass_token: string;
  arrived_at: string | null;
  invite_sent_at: string | null;
  invite_opened_at: string | null;
  created_at: string;
}

export interface Convivia24SeatingTable {
  id: string;
  event_id: string;
  name: string;
  shape: string;
  seats: number;
  x_pos: number;
  y_pos: number;
  sort_order: number;
}

export interface Convivia24Photo {
  id: string;
  event_id: string;
  uploader_name: string | null;
  url: string;
  caption: string | null;
  created_at: string;
}

export interface Convivia24Gift {
  id: string;
  event_id: string;
  title: string;
  kind: string;
  amount_target: number | null;
  amount_pledged: number;
  image_label: string | null;
  claimed: boolean;
  sort_order: number;
}

// ── Slug ──────────────────────────────────────────────────────────────────────

export function generateSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return `${base}-${id.slice(0, 6)}`;
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function getEventsForUser(userId: string): Promise<Convivia24Event[]> {
  const rows = await sql`
    SELECT * FROM convivia24_events WHERE user_id = ${userId} ORDER BY created_at DESC
  `;
  return rows as unknown as Convivia24Event[];
}

export async function getEventById(id: string): Promise<Convivia24Event | null> {
  const rows = await sql`SELECT * FROM convivia24_events WHERE id = ${id} LIMIT 1`;
  return (rows[0] as unknown as Convivia24Event) ?? null;
}

export async function getEventBySlug(slug: string): Promise<Convivia24Event | null> {
  const rows = await sql`SELECT * FROM convivia24_events WHERE slug = ${slug} LIMIT 1`;
  return (rows[0] as unknown as Convivia24Event) ?? null;
}

export async function createEvent(userId: string, data: Partial<Convivia24Event>): Promise<Convivia24Event> {
  const title = data.title ?? 'My Event';
  const rows = await sql`
    INSERT INTO convivia24_events (
      user_id, title, event_type, host_name, event_date, event_time,
      city, venue, address, capacity, dress_code, invite_direction,
      invite_live, cover_url, rsvp_deadline
    ) VALUES (
      ${userId},
      ${title},
      ${data.event_type ?? 'wedding'},
      ${data.host_name ?? ''},
      ${data.event_date ?? null},
      ${data.event_time ?? null},
      ${data.city ?? null},
      ${data.venue ?? null},
      ${data.address ?? null},
      ${data.capacity ?? 150},
      ${data.dress_code ?? null},
      ${data.invite_direction ?? 'editorial'},
      ${data.invite_live ?? false},
      ${data.cover_url ?? null},
      ${data.rsvp_deadline ?? null}
    )
    RETURNING *
  `;
  const event = rows[0] as unknown as Convivia24Event;

  const slug = generateSlug(title, event.id);
  const updated = await sql`
    UPDATE convivia24_events SET slug = ${slug} WHERE id = ${event.id} RETURNING *
  `;
  return (updated[0] as unknown as Convivia24Event) ?? event;
}

export async function updateEvent(
  id: string,
  userId: string,
  data: Partial<Convivia24Event>,
): Promise<Convivia24Event | null> {
  const rows = await sql`
    UPDATE convivia24_events SET
      title            = COALESCE(${data.title ?? null}, title),
      event_type       = COALESCE(${data.event_type ?? null}, event_type),
      host_name        = COALESCE(${data.host_name ?? null}, host_name),
      event_date       = COALESCE(${data.event_date ?? null}::date, event_date),
      event_time       = COALESCE(${data.event_time ?? null}, event_time),
      city             = COALESCE(${data.city ?? null}, city),
      venue            = COALESCE(${data.venue ?? null}, venue),
      address          = COALESCE(${data.address ?? null}, address),
      capacity         = COALESCE(${data.capacity ?? null}, capacity),
      dress_code       = COALESCE(${data.dress_code ?? null}, dress_code),
      invite_direction = COALESCE(${data.invite_direction ?? null}, invite_direction),
      invite_live      = COALESCE(${data.invite_live ?? null}, invite_live),
      cover_url        = COALESCE(${data.cover_url ?? null}, cover_url),
      rsvp_deadline    = COALESCE(${data.rsvp_deadline ?? null}::date, rsvp_deadline),
      updated_at       = NOW()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  return (rows[0] as unknown as Convivia24Event) ?? null;
}

export async function deleteEvent(id: string, userId: string): Promise<void> {
  await sql`DELETE FROM convivia24_events WHERE id = ${id} AND user_id = ${userId}`;
}

// ── Guests ────────────────────────────────────────────────────────────────────

export async function getGuestsForEvent(eventId: string): Promise<Convivia24Guest[]> {
  const rows = await sql`
    SELECT * FROM convivia24_guests WHERE event_id = ${eventId} ORDER BY name ASC
  `;
  return rows as unknown as Convivia24Guest[];
}

export async function getGuestByToken(token: string): Promise<Convivia24Guest | null> {
  const rows = await sql`SELECT * FROM convivia24_guests WHERE pass_token = ${token} LIMIT 1`;
  return (rows[0] as unknown as Convivia24Guest) ?? null;
}

export async function createGuest(eventId: string, data: Partial<Convivia24Guest>): Promise<Convivia24Guest> {
  const rows = await sql`
    INSERT INTO convivia24_guests (
      event_id, name, email, phone, party_size,
      table_id, rsvp_state, dietary, relation, song_request, message
    ) VALUES (
      ${eventId},
      ${data.name ?? 'Guest'},
      ${data.email ?? null},
      ${data.phone ?? null},
      ${data.party_size ?? 1},
      ${data.table_id ?? null},
      ${data.rsvp_state ?? 'pending'},
      ${data.dietary ?? null},
      ${data.relation ?? null},
      ${data.song_request ?? null},
      ${data.message ?? null}
    )
    RETURNING *
  `;
  return rows[0] as unknown as Convivia24Guest;
}

export async function updateGuest(id: string, data: Partial<Convivia24Guest>): Promise<Convivia24Guest | null> {
  const rows = await sql`
    UPDATE convivia24_guests SET
      name         = COALESCE(${data.name ?? null}, name),
      email        = COALESCE(${data.email ?? null}, email),
      phone        = COALESCE(${data.phone ?? null}, phone),
      party_size   = COALESCE(${data.party_size ?? null}, party_size),
      table_id     = COALESCE(${data.table_id ?? null}::uuid, table_id),
      rsvp_state   = COALESCE(${data.rsvp_state ?? null}, rsvp_state),
      dietary      = COALESCE(${data.dietary ?? null}, dietary),
      relation     = COALESCE(${data.relation ?? null}, relation),
      song_request = COALESCE(${data.song_request ?? null}, song_request),
      message      = COALESCE(${data.message ?? null}, message),
      updated_at   = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as unknown as Convivia24Guest) ?? null;
}

export async function rsvpGuest(
  token: string,
  state: string,
  data?: Partial<Convivia24Guest>,
): Promise<Convivia24Guest | null> {
  const rows = await sql`
    UPDATE convivia24_guests SET
      rsvp_state   = ${state},
      dietary      = COALESCE(${data?.dietary ?? null}, dietary),
      song_request = COALESCE(${data?.song_request ?? null}, song_request),
      message      = COALESCE(${data?.message ?? null}, message),
      party_size   = COALESCE(${data?.party_size ?? null}, party_size),
      updated_at   = NOW()
    WHERE pass_token = ${token}
    RETURNING *
  `;
  return (rows[0] as unknown as Convivia24Guest) ?? null;
}

export async function checkInGuest(token: string): Promise<Convivia24Guest | null> {
  const rows = await sql`
    UPDATE convivia24_guests
    SET arrived_at = NOW(), updated_at = NOW()
    WHERE pass_token = ${token}
    RETURNING *
  `;
  return (rows[0] as unknown as Convivia24Guest) ?? null;
}

export async function deleteGuest(id: string): Promise<void> {
  await sql`DELETE FROM convivia24_guests WHERE id = ${id}`;
}

export async function getGuestStats(
  eventId: string,
): Promise<{ in: number; maybe: number; out: number; pending: number; total: number; arrived: number }> {
  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE rsvp_state = 'in')      AS "in",
      COUNT(*) FILTER (WHERE rsvp_state = 'maybe')   AS maybe,
      COUNT(*) FILTER (WHERE rsvp_state = 'out')     AS "out",
      COUNT(*) FILTER (WHERE rsvp_state = 'pending') AS pending,
      COUNT(*)                                        AS total,
      COUNT(*) FILTER (WHERE arrived_at IS NOT NULL) AS arrived
    FROM convivia24_guests
    WHERE event_id = ${eventId}
  `;
  const r = rows[0] ?? {};
  return {
    in: Number(r['in'] ?? 0),
    maybe: Number(r['maybe'] ?? 0),
    out: Number(r['out'] ?? 0),
    pending: Number(r['pending'] ?? 0),
    total: Number(r['total'] ?? 0),
    arrived: Number(r['arrived'] ?? 0),
  };
}

// ── Seating tables ────────────────────────────────────────────────────────────

export async function getTablesForEvent(eventId: string): Promise<Convivia24SeatingTable[]> {
  const rows = await sql`
    SELECT * FROM convivia24_seating_tables WHERE event_id = ${eventId} ORDER BY sort_order ASC
  `;
  return rows as unknown as Convivia24SeatingTable[];
}

export async function createTable(
  eventId: string,
  data: Partial<Convivia24SeatingTable>,
): Promise<Convivia24SeatingTable> {
  const rows = await sql`
    INSERT INTO convivia24_seating_tables (event_id, name, shape, seats, x_pos, y_pos, sort_order)
    VALUES (
      ${eventId},
      ${data.name ?? 'Table'},
      ${data.shape ?? 'round'},
      ${data.seats ?? 8},
      ${data.x_pos ?? 50},
      ${data.y_pos ?? 50},
      ${data.sort_order ?? 0}
    )
    RETURNING *
  `;
  return rows[0] as unknown as Convivia24SeatingTable;
}

export async function updateTable(
  id: string,
  data: Partial<Convivia24SeatingTable>,
): Promise<Convivia24SeatingTable | null> {
  const rows = await sql`
    UPDATE convivia24_seating_tables SET
      name       = COALESCE(${data.name ?? null}, name),
      shape      = COALESCE(${data.shape ?? null}, shape),
      seats      = COALESCE(${data.seats ?? null}, seats),
      x_pos      = COALESCE(${data.x_pos ?? null}, x_pos),
      y_pos      = COALESCE(${data.y_pos ?? null}, y_pos),
      sort_order = COALESCE(${data.sort_order ?? null}, sort_order)
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as unknown as Convivia24SeatingTable) ?? null;
}

export async function deleteTable(id: string): Promise<void> {
  await sql`DELETE FROM convivia24_seating_tables WHERE id = ${id}`;
}

// ── Photos ────────────────────────────────────────────────────────────────────

export async function getPhotosForEvent(eventId: string): Promise<Convivia24Photo[]> {
  const rows = await sql`
    SELECT * FROM convivia24_photos WHERE event_id = ${eventId} ORDER BY created_at DESC
  `;
  return rows as unknown as Convivia24Photo[];
}

export async function addPhoto(
  eventId: string,
  url: string,
  uploaderName?: string,
  caption?: string,
): Promise<Convivia24Photo> {
  const rows = await sql`
    INSERT INTO convivia24_photos (event_id, url, uploader_name, caption)
    VALUES (${eventId}, ${url}, ${uploaderName ?? null}, ${caption ?? null})
    RETURNING *
  `;
  return rows[0] as unknown as Convivia24Photo;
}

// ── Gifts ─────────────────────────────────────────────────────────────────────

export async function getGiftsForEvent(eventId: string): Promise<Convivia24Gift[]> {
  const rows = await sql`
    SELECT * FROM convivia24_gifts WHERE event_id = ${eventId} ORDER BY sort_order ASC
  `;
  return rows as unknown as Convivia24Gift[];
}

export async function createGift(eventId: string, data: Partial<Convivia24Gift>): Promise<Convivia24Gift> {
  const rows = await sql`
    INSERT INTO convivia24_gifts (event_id, title, kind, amount_target, image_label, sort_order)
    VALUES (
      ${eventId},
      ${data.title ?? 'Gift'},
      ${data.kind ?? 'item'},
      ${data.amount_target ?? null},
      ${data.image_label ?? null},
      ${data.sort_order ?? 0}
    )
    RETURNING *
  `;
  return rows[0] as unknown as Convivia24Gift;
}

export async function pledgeGift(id: string, amount: number): Promise<Convivia24Gift | null> {
  const rows = await sql`
    UPDATE convivia24_gifts
    SET amount_pledged = amount_pledged + ${amount},
        claimed = (amount_pledged + ${amount} >= COALESCE(amount_target, 0) AND amount_target IS NOT NULL)
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as unknown as Convivia24Gift) ?? null;
}
