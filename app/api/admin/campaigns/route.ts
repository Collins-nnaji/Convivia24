import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import {
  deleteCampaign,
  listCampaigns,
  upsertCampaign,
  type CampaignInput,
  type CampaignTask,
} from '@/lib/brands/campaigns';
import { BRANDS } from '@/lib/brands/catalog';
import { listClaims, setClaimStatus } from '@/lib/brands/store';
import { apiErrorResponse } from '@/lib/db';
import { captureApiError } from '@/lib/sentry';

/** Campaigns and brand-ownership claims, for the Convivia24 desk. */
export async function GET() {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const brands = BRANDS.map((b) => ({ slug: b.slug, name: b.name }));
  try {
    const [campaigns, claims] = await Promise.all([
      listCampaigns(),
      listClaims().catch(() => []),
    ]);
    return NextResponse.json({ campaigns, claims, brands });
  } catch (err) {
    captureApiError(err, { route: 'admin/campaigns GET' });
    const { error } = apiErrorResponse(err, 'Could not load campaigns.');
    return NextResponse.json({ campaigns: [], claims: [], brands, error });
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

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await req.json().catch(() => ({}));
    const input: CampaignInput = {
      slug: String(body.slug || '').trim().toLowerCase(),
      brandSlug: String(body.brandSlug || '').trim(),
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
    };

    const campaign = await upsertCampaign(input);
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save the campaign.';
    // Validation failures are the caller's problem, not a server fault.
    if (err instanceof Error && !message.includes('relation')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    captureApiError(err, { route: 'admin/campaigns POST' });
    const { status, error } = apiErrorResponse(err, 'Could not save the campaign.');
    return NextResponse.json({ error }, { status });
  }
}

/** Approve or reject a brand-ownership claim. */
export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await req.json().catch(() => ({}));
    const status = String(body.status || '');
    if (!['pending', 'verified', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Unknown status.' }, { status: 400 });
    }
    const claim = await setClaimStatus(String(body.id || ''), status as 'approved');
    if (!claim) return NextResponse.json({ error: 'Claim not found.' }, { status: 404 });
    return NextResponse.json({ claim });
  } catch (err) {
    captureApiError(err, { route: 'admin/campaigns PATCH' });
    const { status, error } = apiErrorResponse(err, 'Could not update the claim.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const slug = String(new URL(req.url).searchParams.get('slug') || '');
    const removed = await deleteCampaign(slug);
    return NextResponse.json({ removed });
  } catch (err) {
    captureApiError(err, { route: 'admin/campaigns DELETE' });
    const { status, error } = apiErrorResponse(err, 'Could not delete the campaign.');
    return NextResponse.json({ error }, { status });
  }
}
