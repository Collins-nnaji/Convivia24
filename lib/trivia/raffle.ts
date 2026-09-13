import { randomInt } from 'crypto';
import sql from '@/lib/db';
import { sendEmail, adminNotifyEmail } from '@/lib/email/resend';
import { genericNoticeEmail } from '@/lib/email/templates';
import { TRIVIA_ROUNDS } from '@/lib/trivia/catalog';
import type { TriviaEntry } from './entries';

/**
 * The bottle draw. Everyone who passed a round is an entry; the desk runs one draw per brand
 * week, the winner is picked with a crypto-random index, and the pick is written down so it can
 * be audited and the emails resent.
 */

export type TriviaDraw = {
  id: string;
  roundSlug: string;
  brand: string;
  weekStart: string | null;
  weekEnd: string | null;
  prizeLabel: string;
  eligibleCount: number;
  drawnBy: string;
  drawnAt: string;
  winner: { entryId: string; name: string; email: string; phone: string | null; code: string; status: string };
  winnerNotifiedAt: string | null;
  othersNotifiedAt: string | null;
  othersNotifiedCount: number;
};

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function mapDraw(r: Record<string, unknown>): TriviaDraw {
  const weekStart = r.week_start ? String(r.week_start).slice(0, 10) : null;
  const round = TRIVIA_ROUNDS.find((x) => x.slug === String(r.round_slug));
  return {
    id: String(r.id),
    roundSlug: String(r.round_slug),
    brand: round?.brand || String(r.round_slug),
    weekStart,
    weekEnd: weekStart ? addDays(weekStart, 6) : null,
    prizeLabel: String(r.prize_label),
    eligibleCount: Number(r.eligible_count ?? 0),
    drawnBy: String(r.drawn_by || 'desk'),
    drawnAt: String(r.drawn_at),
    winner: {
      entryId: String(r.winner_entry_id),
      name: String(r.winner_name || ''),
      email: String(r.winner_email || ''),
      phone: (r.winner_phone as string) || null,
      code: String(r.winner_code || ''),
      status: String(r.winner_status || ''),
    },
    winnerNotifiedAt: r.winner_notified_at ? String(r.winner_notified_at) : null,
    othersNotifiedAt: r.others_notified_at ? String(r.others_notified_at) : null,
    othersNotifiedCount: Number(r.others_notified_count ?? 0),
  };
}

/**
 * Who can win: passers of the round who are still `entered` (not already a winner, voided, or
 * claimed), optionally narrowed to the entries made during one brand week.
 */
export async function eligibleEntries(roundSlug: string, weekStart?: string | null): Promise<TriviaEntry[]> {
  const rows = weekStart
    ? await sql`
        SELECT * FROM trivia_entries
        WHERE round_slug = ${roundSlug} AND status = 'entered'
          AND created_at >= ${weekStart}::date AND created_at < (${weekStart}::date + INTERVAL '7 days')
        ORDER BY created_at ASC
      `
    : await sql`SELECT * FROM trivia_entries WHERE round_slug = ${roundSlug} AND status = 'entered' ORDER BY created_at ASC`;
  return rows.map((r) => ({
    id: String(r.id),
    code: String(r.code),
    roundSlug: String(r.round_slug),
    brand: String(r.brand),
    name: String(r.name),
    email: String(r.email),
    phone: (r.phone as string) || null,
    score: Number(r.score ?? 0),
    total: Number(r.total ?? 0),
    status: String(r.status || 'entered'),
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

export async function listDraws(limit = 40): Promise<TriviaDraw[]> {
  const rows = await sql`
    SELECT d.*, e.name AS winner_name, e.email AS winner_email, e.phone AS winner_phone, e.code AS winner_code, e.status AS winner_status
    FROM trivia_draws d JOIN trivia_entries e ON e.id = d.winner_entry_id
    ORDER BY d.drawn_at DESC LIMIT ${limit}
  `;
  return rows.map(mapDraw);
}

export async function getDraw(id: string): Promise<TriviaDraw | null> {
  const rows = await sql`
    SELECT d.*, e.name AS winner_name, e.email AS winner_email, e.phone AS winner_phone, e.code AS winner_code, e.status AS winner_status
    FROM trivia_draws d JOIN trivia_entries e ON e.id = d.winner_entry_id
    WHERE d.id = ${id} LIMIT 1
  `;
  return rows[0] ? mapDraw(rows[0]) : null;
}

export class DrawError extends Error {}

/**
 * Picks and records a winner. One draw per week per round — a second call for the same week is
 * refused rather than quietly picking a second winner.
 */
export async function runDraw(input: { roundSlug: string; weekStart?: string | null; drawnBy?: string }): Promise<{ draw: TriviaDraw; pool: TriviaEntry[] }> {
  const round = TRIVIA_ROUNDS.find((r) => r.slug === input.roundSlug);
  if (!round) throw new DrawError('Unknown round.');

  if (input.weekStart) {
    const [dup] = await sql`SELECT id FROM trivia_draws WHERE round_slug = ${input.roundSlug} AND week_start = ${input.weekStart}::date LIMIT 1`;
    if (dup) throw new DrawError('This week has already been drawn. Void the winner first if it must be re-run.');
  }

  const pool = await eligibleEntries(input.roundSlug, input.weekStart);
  if (pool.length === 0) throw new DrawError('Nobody is eligible — no open entries for this round and week.');

  const winner = pool[randomInt(pool.length)];
  await sql`UPDATE trivia_entries SET status = 'won' WHERE id = ${winner.id} AND status = 'entered'`;
  const rows = await sql`
    INSERT INTO trivia_draws (round_slug, week_start, winner_entry_id, eligible_count, prize_label, drawn_by)
    VALUES (${input.roundSlug}, ${input.weekStart || null}::date, ${winner.id}, ${pool.length}, ${round.prizeLabel}, ${input.drawnBy || 'desk'})
    RETURNING id
  `;
  const draw = await getDraw(String(rows[0].id));
  if (!draw) throw new DrawError('Draw was not recorded.');
  return { draw, pool };
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://convivia24.com').replace(/\/$/, '');
}
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Tells the winner, and copies the desk so someone can arrange the handover. */
export async function notifyWinner(draw: TriviaDraw, opts: { message?: string | null } = {}): Promise<{ sent: boolean; error?: string }> {
  const { subject, html } = genericNoticeEmail({
    title: `You won the ${escapeHtml(draw.brand)} draw`,
    subject: `You won — ${draw.prizeLabel} from Convivia24`,
    greeting: `Hi ${escapeHtml(draw.winner.name.split(' ')[0] || 'there')},`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#3a3532;">
        Your name came out of the ${escapeHtml(draw.brand)} bottle draw. The prize is <strong>${escapeHtml(draw.prizeLabel)}</strong>.
      </p>
      ${opts.message ? `<p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#3a3532;">${escapeHtml(opts.message)}</p>` : ''}
      <p style="margin:0 0 6px;font-size:14px;color:#3a3532;">Your claim code:</p>
      <p style="margin:0 0 16px;padding:14px 18px;background:#f6f1ea;border-radius:12px;font-family:ui-monospace,Menlo,monospace;font-size:22px;letter-spacing:0.08em;font-weight:700;color:#0a0a0a;text-align:center;">${draw.winner.code}</p>
      <p style="margin:0;font-size:14px;line-height:1.55;color:#3a3532;">
        We will be in touch on this email${draw.winner.phone ? ' or your phone' : ''} to arrange delivery or pickup. Keep the code — you will need it at handover. Adults 18+ only.
      </p>
    `,
  });
  const result = await sendEmail({ to: draw.winner.email, subject, html });
  if (result.sent) {
    await sql`UPDATE trivia_draws SET winner_notified_at = NOW() WHERE id = ${draw.id}`.catch(() => {});
    const admins = adminNotifyEmail();
    if (admins) {
      const note = genericNoticeEmail({
        title: `Draw winner · ${draw.brand}`,
        subject: `Trivia draw: ${draw.winner.name} won ${draw.prizeLabel}`,
        bodyHtml: `<p style="font-size:15px;color:#3a3532;">${escapeHtml(draw.winner.name)} · ${escapeHtml(draw.winner.email)}${draw.winner.phone ? ` · ${escapeHtml(draw.winner.phone)}` : ''}<br/>Claim code <strong>${draw.winner.code}</strong> · picked from ${draw.eligibleCount} entries.</p>
          <p style="font-size:14px;"><a href="${appUrl()}/admin#trivia" style="color:#c2410c;font-weight:700;">Open the desk</a> and mark the bottle claimed once it is handed over.</p>`,
      });
      await sendEmail({ to: admins, subject: note.subject, html: note.html }).catch(() => {});
    }
  }
  return { sent: result.sent, error: result.error };
}

/** A short "not this time" to everyone else in the pool. Best-effort per address; counts what went out. */
export async function notifyRunnersUp(draw: TriviaDraw, pool: TriviaEntry[]): Promise<number> {
  const others = pool.filter((e) => e.id !== draw.winner.entryId);
  let sent = 0;
  for (const e of others) {
    const { subject, html } = genericNoticeEmail({
      title: `The ${escapeHtml(draw.brand)} draw has been made`,
      subject: `${draw.brand} draw — not this time`,
      greeting: `Hi ${escapeHtml(e.name.split(' ')[0] || 'there')},`,
      bodyHtml: `
        <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#3a3532;">
          The ${escapeHtml(draw.brand)} bottle draw has been made and it was not your name this time — thank you for playing.
        </p>
        <p style="margin:0;font-size:14px;line-height:1.55;color:#3a3532;">
          A new house plays every week. <a href="${appUrl()}/discover/trivia" style="color:#c2410c;font-weight:700;">Play the next round →</a>
        </p>
      `,
    });
    const r = await sendEmail({ to: e.email, subject, html }).catch(() => ({ sent: false }));
    if (r.sent) sent += 1;
  }
  await sql`UPDATE trivia_draws SET others_notified_at = NOW(), others_notified_count = ${sent} WHERE id = ${draw.id}`.catch(() => {});
  return sent;
}
