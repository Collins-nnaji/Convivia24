import sql from '@/lib/db';
import { getBrand, type Brand } from '@/lib/brands/catalog';

/**
 * Brand campaigns — a run of tasks a house sponsors, with a leaderboard.
 *
 * Points on the leaderboard are recomputed from the tasks a participant has
 * actually ticked off, never stored independently, so a row cannot claim
 * points for work that was not done.
 */

export type CampaignTask = {
  id: string;
  title: string;
  detail: string;
  points: number;
};

export type Campaign = {
  id: string;
  slug: string;
  brandSlug: string;
  title: string;
  tagline: string | null;
  blurb: string | null;
  entryPoints: number;
  rewardPoints: number;
  topReward: string | null;
  tasks: CampaignTask[];
  rules: string[];
  startsAt: string;
  endsAt: string | null;
  published: boolean;
  /** Derived, not stored. */
  live: boolean;
  daysLeft: number | null;
};

export type LeaderboardRow = {
  rank: number;
  ownerId: string;
  displayName: string;
  points: number;
  completed: number;
};

function parseTasks(value: unknown): CampaignTask[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((t) => {
      const row = (t || {}) as Record<string, unknown>;
      return {
        id: String(row.id ?? ''),
        title: String(row.title ?? ''),
        detail: String(row.detail ?? ''),
        points: Math.max(0, Math.floor(Number(row.points) || 0)),
      };
    })
    .filter((t) => t.id && t.title);
}

function mapRow(r: Record<string, unknown>): Campaign {
  const endsAt = r.ends_at ? new Date(r.ends_at as string) : null;
  const startsAt = new Date(r.starts_at as string);
  const now = new Date();
  const published = r.published === true;

  return {
    id: String(r.id),
    slug: String(r.slug),
    brandSlug: String(r.brand_slug),
    title: String(r.title),
    tagline: (r.tagline as string) || null,
    blurb: (r.blurb as string) || null,
    entryPoints: Number(r.entry_points ?? 0),
    rewardPoints: Number(r.reward_points ?? 0),
    topReward: (r.top_reward as string) || null,
    tasks: parseTasks(r.tasks),
    rules: Array.isArray(r.rules) ? (r.rules as unknown[]).map(String) : [],
    startsAt: startsAt.toISOString(),
    endsAt: endsAt ? endsAt.toISOString() : null,
    published,
    live: published && startsAt <= now && (!endsAt || endsAt >= now),
    daysLeft: endsAt ? Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / 86_400_000)) : null,
  };
}

export async function listCampaigns(opts: { brandSlug?: string; publishedOnly?: boolean } = {}): Promise<
  Campaign[]
> {
  const rows = opts.brandSlug
    ? opts.publishedOnly
      ? await sql`SELECT * FROM brand_campaigns WHERE brand_slug = ${opts.brandSlug} AND published = true
                  ORDER BY starts_at DESC LIMIT 60`
      : await sql`SELECT * FROM brand_campaigns WHERE brand_slug = ${opts.brandSlug}
                  ORDER BY starts_at DESC LIMIT 60`
    : opts.publishedOnly
      ? await sql`SELECT * FROM brand_campaigns WHERE published = true ORDER BY starts_at DESC LIMIT 60`
      : await sql`SELECT * FROM brand_campaigns ORDER BY starts_at DESC LIMIT 60`;
  return rows.map(mapRow);
}

export async function getCampaign(slug: string): Promise<Campaign | null> {
  const rows = await sql`SELECT * FROM brand_campaigns WHERE slug = ${slug} LIMIT 1`;
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function participantCount(campaignId: string): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS n FROM campaign_participants WHERE campaign_id = ${campaignId}
  `;
  return Number(rows[0]?.n ?? 0);
}

export async function leaderboard(campaignId: string, limit = 10): Promise<LeaderboardRow[]> {
  const rows = await sql`
    SELECT owner_id, display_name, points, completed_tasks
    FROM campaign_participants
    WHERE campaign_id = ${campaignId}
    ORDER BY points DESC, joined_at ASC
    LIMIT ${limit}
  `;
  return rows.map((r, i) => ({
    rank: i + 1,
    ownerId: String(r.owner_id),
    displayName: String(r.display_name),
    points: Number(r.points ?? 0),
    completed: Array.isArray(r.completed_tasks) ? r.completed_tasks.length : 0,
  }));
}

export type Participation = {
  joined: boolean;
  completedTasks: string[];
  points: number;
  rank: number | null;
};

export const NOT_JOINED: Participation = {
  joined: false,
  completedTasks: [],
  points: 0,
  rank: null,
};

export async function participationFor(campaignId: string, ownerId: string): Promise<Participation> {
  const rows = await sql`
    SELECT completed_tasks, points FROM campaign_participants
    WHERE campaign_id = ${campaignId} AND owner_id = ${ownerId} LIMIT 1
  `;
  if (!rows[0]) return NOT_JOINED;

  const completedTasks = Array.isArray(rows[0].completed_tasks)
    ? (rows[0].completed_tasks as unknown[]).map(String)
    : [];
  const points = Number(rows[0].points ?? 0);

  // Rank is a live count of who is ahead, not a stored column.
  const ahead = await sql`
    SELECT COUNT(*)::int AS n FROM campaign_participants
    WHERE campaign_id = ${campaignId} AND points > ${points}
  `;

  return { joined: true, completedTasks, points, rank: Number(ahead[0]?.n ?? 0) + 1 };
}

export class CampaignClosedError extends Error {
  constructor(message = 'This campaign is not running right now.') {
    super(message);
    this.name = 'CampaignClosedError';
  }
}

export async function joinCampaign(
  campaign: Campaign,
  ownerId: string,
  displayName: string
): Promise<Participation> {
  if (!campaign.live) throw new CampaignClosedError();
  await sql`
    INSERT INTO campaign_participants (campaign_id, owner_id, display_name)
    VALUES (${campaign.id}, ${ownerId}, ${displayName.trim().slice(0, 60) || 'Guest'})
    ON CONFLICT (campaign_id, owner_id) DO NOTHING
  `;
  return participationFor(campaign.id, ownerId);
}

/**
 * Tick a task off. Points are recalculated from the full completed set against
 * the campaign's own task list, so an unknown or repeated task id adds nothing.
 */
export async function completeTask(
  campaign: Campaign,
  ownerId: string,
  taskId: string
): Promise<Participation> {
  if (!campaign.live) throw new CampaignClosedError();
  const task = campaign.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error('Unknown task.');

  const current = await participationFor(campaign.id, ownerId);
  if (!current.joined) throw new Error('Join the campaign before completing tasks.');

  const completed = [...new Set([...current.completedTasks, taskId])];
  const points = campaign.tasks
    .filter((t) => completed.includes(t.id))
    .reduce((n, t) => n + t.points, 0);

  await sql`
    UPDATE campaign_participants
    SET completed_tasks = ${JSON.stringify(completed)}::jsonb, points = ${points}, updated_at = NOW()
    WHERE campaign_id = ${campaign.id} AND owner_id = ${ownerId}
  `;
  return participationFor(campaign.id, ownerId);
}

export function campaignBrand(campaign: Campaign): Brand | undefined {
  return getBrand(campaign.brandSlug);
}

/* ── Authoring ───────────────────────────────────────────────────────── */

export type CampaignInput = {
  slug: string;
  brandSlug: string;
  title: string;
  tagline?: string | null;
  blurb?: string | null;
  entryPoints?: number;
  rewardPoints?: number;
  topReward?: string | null;
  tasks?: CampaignTask[];
  rules?: string[];
  startsAt?: string;
  endsAt?: string | null;
  published?: boolean;
  createdBy?: string | null;
};

export function validateCampaign(input: CampaignInput): string | null {
  if (!getBrand(input.brandSlug)) return 'Unknown brand.';
  if (!/^[a-z0-9-]{3,80}$/.test(input.slug)) return 'Slug must be lowercase letters, numbers and dashes.';
  if (!input.title?.trim()) return 'A title is required.';
  const tasks = input.tasks ?? [];
  if (tasks.some((t) => !t.id || !t.title)) return 'Every task needs an id and a title.';
  if (new Set(tasks.map((t) => t.id)).size !== tasks.length) return 'Task ids must be unique.';
  if (input.endsAt && input.startsAt && input.endsAt < input.startsAt) {
    return 'A campaign cannot end before it starts.';
  }
  return null;
}

/** Create or update a campaign. Convivia24 authors these; brands who have had a claim approved may too. */
export async function upsertCampaign(input: CampaignInput): Promise<Campaign> {
  const error = validateCampaign(input);
  if (error) throw new Error(error);

  const rows = await sql`
    INSERT INTO brand_campaigns (
      slug, brand_slug, title, tagline, blurb, entry_points, reward_points,
      top_reward, tasks, rules, starts_at, ends_at, published, created_by
    )
    VALUES (
      ${input.slug}, ${input.brandSlug}, ${input.title.trim()}, ${input.tagline || null},
      ${input.blurb || null}, ${Math.max(0, Math.floor(input.entryPoints ?? 0))},
      ${Math.max(0, Math.floor(input.rewardPoints ?? 0))}, ${input.topReward || null},
      ${JSON.stringify(input.tasks ?? [])}::jsonb, ${JSON.stringify(input.rules ?? [])}::jsonb,
      ${input.startsAt ?? new Date().toISOString()}, ${input.endsAt ?? null},
      ${input.published === true}, ${input.createdBy || null}
    )
    ON CONFLICT (slug) DO UPDATE SET
      brand_slug = EXCLUDED.brand_slug,
      title = EXCLUDED.title,
      tagline = EXCLUDED.tagline,
      blurb = EXCLUDED.blurb,
      entry_points = EXCLUDED.entry_points,
      reward_points = EXCLUDED.reward_points,
      top_reward = EXCLUDED.top_reward,
      tasks = EXCLUDED.tasks,
      rules = EXCLUDED.rules,
      starts_at = EXCLUDED.starts_at,
      ends_at = EXCLUDED.ends_at,
      published = EXCLUDED.published,
      updated_at = NOW()
    RETURNING *
  `;
  return mapRow(rows[0]);
}

export async function deleteCampaign(slug: string): Promise<boolean> {
  const rows = await sql`DELETE FROM brand_campaigns WHERE slug = ${slug} RETURNING id`;
  return rows.length > 0;
}

/* ── Brand portal reporting ──────────────────────────────────────────── */

export type BrandCampaignStats = {
  campaigns: number;
  liveCampaigns: number;
  participants: number;
  /** Points participants have actually banked across this brand's campaigns. */
  pointsIssued: number;
  tasksCompleted: number;
};

export const EMPTY_BRAND_STATS: BrandCampaignStats = {
  campaigns: 0,
  liveCampaigns: 0,
  participants: 0,
  pointsIssued: 0,
  tasksCompleted: 0,
};

export async function brandCampaignStats(brandSlug: string): Promise<BrandCampaignStats> {
  const rows = await sql`
    SELECT
      COUNT(DISTINCT c.id)::int                                        AS campaigns,
      COUNT(DISTINCT p.id)::int                                        AS participants,
      COALESCE(SUM(p.points), 0)::int                                  AS points_issued,
      COALESCE(SUM(jsonb_array_length(p.completed_tasks)), 0)::int     AS tasks_completed
    FROM brand_campaigns c
    LEFT JOIN campaign_participants p ON p.campaign_id = c.id
    WHERE c.brand_slug = ${brandSlug}
  `;
  const live = await sql`
    SELECT COUNT(*)::int AS n FROM brand_campaigns
    WHERE brand_slug = ${brandSlug} AND published = true
      AND starts_at <= NOW() AND (ends_at IS NULL OR ends_at >= NOW())
  `;

  const r = rows[0] ?? {};
  return {
    campaigns: Number(r.campaigns ?? 0),
    liveCampaigns: Number(live[0]?.n ?? 0),
    participants: Number(r.participants ?? 0),
    pointsIssued: Number(r.points_issued ?? 0),
    tasksCompleted: Number(r.tasks_completed ?? 0),
  };
}

export type CampaignSummary = Campaign & { participants: number; completionPct: number };

/** Campaigns with their participation, for the portal table. */
export async function brandCampaignSummaries(brandSlug: string): Promise<CampaignSummary[]> {
  const campaigns = await listCampaigns({ brandSlug });
  if (campaigns.length === 0) return [];

  const rows = await sql`
    SELECT campaign_id, COUNT(*)::int AS participants,
           COALESCE(SUM(jsonb_array_length(completed_tasks)), 0)::int AS tasks_done
    FROM campaign_participants
    WHERE campaign_id = ANY(${campaigns.map((c) => c.id)}::uuid[])
    GROUP BY campaign_id
  `;
  const byId = new Map(rows.map((r) => [String(r.campaign_id), r]));

  return campaigns.map((campaign) => {
    const row = byId.get(campaign.id);
    const participants = Number(row?.participants ?? 0);
    const tasksDone = Number(row?.tasks_done ?? 0);
    // Completion is tasks ticked off against every task every participant could
    // have done — 100% means the whole cohort finished the whole list.
    const possible = participants * campaign.tasks.length;
    return {
      ...campaign,
      participants,
      completionPct: possible > 0 ? Math.round((tasksDone / possible) * 100) : 0,
    };
  });
}

export type JoinPoint = { date: string; participants: number };

/** Daily joins across a brand's campaigns, for the portal chart. */
export async function brandJoinsByDay(brandSlug: string, days = 30): Promise<JoinPoint[]> {
  const rows = await sql`
    SELECT to_char(date_trunc('day', p.joined_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS n
    FROM campaign_participants p
    JOIN brand_campaigns c ON c.id = p.campaign_id
    WHERE c.brand_slug = ${brandSlug}
      AND p.joined_at >= NOW() - (${days} || ' days')::interval
    GROUP BY 1
    ORDER BY 1 ASC
  `;
  const counts = new Map(rows.map((r) => [String(r.day), Number(r.n ?? 0)]));

  // Fill the gaps so the chart has a point per day rather than a jagged series.
  const out: JoinPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, participants: counts.get(key) ?? 0 });
  }
  return out;
}
