import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { getBrand } from '@/lib/brands/catalog';
import { followerCount } from '@/lib/brands/store';
import {
  brandCampaignStats,
  brandCampaignSummaries,
  brandJoinsByDay,
  EMPTY_BRAND_STATS,
  upsertCampaign,
  type CampaignInput,
  type CampaignTask,
} from '@/lib/brands/campaigns';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/**
 * The brand's own portal.
 *
 * Access is the approved ownership claim and nothing else — a brand sees its
 * page's numbers only after Convivia24 has verified who they are.
 */
async function resolveManagedBrand(): Promise<
  { ok: true; brandSlug: string; ownerId: string; contactName: string } | { ok: false; status: number; error: string }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, status: 401, error: 'Sign in to open the brand portal.' };

  const ownerId = `user:${user.id}`;
  const rows = await sql`
    SELECT brand_slug, contact_name FROM brand_claims
    WHERE status = 'approved' AND (owner_id = ${ownerId} OR LOWER(email) = ${user.email.trim().toLowerCase()})
    ORDER BY updated_at DESC
    LIMIT 1
  `;
  if (!rows[0]) {
    return {
      ok: false,
      status: 403,
      error: 'No approved brand claim on this account. Claim your brand page first.',
    };
  }
  return {
    ok: true,
    brandSlug: String(rows[0].brand_slug),
    ownerId,
    contactName: String(rows[0].contact_name || user.name || user.email),
  };
}

export async function GET() {
  try {
    const gate = await resolveManagedBrand();
    if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const brand = getBrand(gate.brandSlug);
    if (!brand) return NextResponse.json({ error: 'Brand not found.' }, { status: 404 });

    const [stats, campaigns, joins, followers] = await Promise.all([
      brandCampaignStats(brand.slug).catch(() => EMPTY_BRAND_STATS),
      brandCampaignSummaries(brand.slug).catch(() => []),
      brandJoinsByDay(brand.slug, 30).catch(() => []),
      followerCount(brand.slug).catch(() => 0),
    ]);

    return NextResponse.json({
      brand: { slug: brand.slug, name: brand.name, origin: brand.info.origin, founded: brand.info.founded },
      manager: gate.contactName,
      stats,
      campaigns,
      joins,
      followers,
      products: brand.products.length,
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'The portal is unavailable right now.' }, { status: 503 });
    }
    captureApiError(err, { route: 'brands/portal GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load your portal.');
    return NextResponse.json({ error }, { status });
  }
}

function parseTasks(value: unknown): CampaignTask[] {
  if (!Array.isArray(value)) return [];
  return value.map((t) => {
    const row = (t || {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? '').trim(),
      title: String(row.title ?? '').trim(),
      detail: String(row.detail ?? '').trim(),
      points: Math.max(0, Math.floor(Number(row.points) || 0)),
    };
  });
}

/** Create or update one of the brand's own campaigns. */
export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`brand-portal:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const gate = await resolveManagedBrand();
    if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const body = await req.json().catch(() => ({}));
    const input: CampaignInput = {
      slug: String(body.slug || '').trim().toLowerCase(),
      // A brand may only ever author campaigns for the brand it manages.
      brandSlug: gate.brandSlug,
      title: String(body.title || ''),
      tagline: String(body.tagline || '').trim() || null,
      blurb: String(body.blurb || '').trim() || null,
      entryPoints: Number(body.entryPoints) || 0,
      rewardPoints: Number(body.rewardPoints) || 0,
      topReward: String(body.topReward || '').trim() || null,
      tasks: parseTasks(body.tasks),
      rules: Array.isArray(body.rules) ? body.rules.map(String) : [],
      startsAt: body.startsAt ? String(body.startsAt) : undefined,
      endsAt: body.endsAt ? String(body.endsAt) : null,
      published: body.published === true,
      createdBy: gate.ownerId,
    };

    const campaign = await upsertCampaign(input);
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save the campaign.';
    if (err instanceof Error && !message.includes('relation')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    captureApiError(err, { route: 'brands/portal POST' });
    const { status, error } = apiErrorResponse(err, 'Could not save the campaign.');
    return NextResponse.json({ error }, { status });
  }
}
