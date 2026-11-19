import { withAudit } from '@/lib/audit/route';
import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { BRANDS, getBrand } from '@/lib/brands/catalog';
import { claimsForCurrentUser, resolveManagedBrand } from '@/lib/brands/portal-access';
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
 * Access is the approved ownership claim — a brand sees its page's numbers only after
 * Convivia24 has verified who they are. Admins can open any brand (?brand=slug).
 */
async function handleGET(req: NextRequest) {
  try {
    const gate = await resolveManagedBrand(req.nextUrl.searchParams.get('brand'));
    if (gate.ok === false) {
      const claims = gate.status === 403 ? await claimsForCurrentUser() : [];
      return NextResponse.json({ error: gate.error, claims }, { status: gate.status });
    }

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
      admin: gate.admin,
      brands: gate.admin ? BRANDS.map((b) => ({ slug: b.slug, name: b.name })) : undefined,
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
async function handlePOST(req: NextRequest) {
  try {
    const rl = await rateLimit(`brand-portal:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const gate = await resolveManagedBrand(body.brand ? String(body.brand) : null);
    if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

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

export const GET = withAudit('/api/brands/portal', handleGET);
export const POST = withAudit('/api/brands/portal', handlePOST);
