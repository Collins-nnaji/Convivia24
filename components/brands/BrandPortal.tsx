'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Headset,
  LayoutDashboard,
  Megaphone,
  Package,
  Plus,
  Search,
  Star,
  Target,
  Users,
} from 'lucide-react';
import { useUser } from '@/components/auth/AuthProvider';
import CampaignComposer from '@/components/brands/CampaignComposer';
import BrandClaimDialog from '@/components/brands/BrandClaimDialog';
import BrandEvents from '@/components/brands/BrandEvents';
import type { CampaignSummary, BrandCampaignStats, JoinPoint } from '@/lib/brands/campaigns';

export type PortalData = {
  brand: { slug: string; name: string; origin: string; founded: string };
  manager: string;
  stats: BrandCampaignStats;
  campaigns: CampaignSummary[];
  joins: JoinPoint[];
  followers: number;
  products: number;
  admin?: boolean;
  brands?: { slug: string; name: string }[];
};

type Section = 'overview' | 'campaigns' | 'events' | 'participants';

const SECTIONS: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'participants', label: 'Participants', icon: Users },
];

export type DirectoryBrand = { slug: string; name: string; origin: string };
type Claim = { brandSlug: string; brandName: string; status: string; createdAt: string };

/**
 * /brands/portal — the brand portal. Signed-out visitors see what it is; signed-in
 * accounts without an approved claim pick their brand and claim it here; approved
 * owners (and Convivia24 admins, for any brand) manage the page, campaigns and events.
 */
export default function BrandPortal({ directory }: { directory: DirectoryBrand[] }) {
  const { user, loading: authLoading } = useUser();
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>('overview');
  const [composing, setComposing] = useState(false);
  const [brandParam, setBrandParam] = useState<string | null>(null);

  function load(brand: string | null = brandParam) {
    setLoading(true);
    fetch(`/api/brands/portal${brand ? `?brand=${encodeURIComponent(brand)}` : ''}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setClaims(data.claims || []);
          throw new Error(data.error || 'Could not load your portal.');
        }
        setPortal(data);
        setError('');
      })
      .catch((err) => {
        setPortal(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const brand = params.get('brand');
    const want = params.get('section');
    if (want && SECTIONS.some((s) => s.id === want)) setSection(want as Section);
    setBrandParam(brand);
    load(brand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  function switchBrand(slug: string) {
    setBrandParam(slug);
    window.history.replaceState(null, '', `/brands/portal?brand=${encodeURIComponent(slug)}`);
    load(slug);
  }

  if (authLoading || (loading && !portal)) return <Shell>Loading your portal…</Shell>;

  if (!user) return <SignedOut />;

  if (error || !portal) return <ClaimYourBrand directory={directory} claims={claims} email={user.email} />;

  return (
    <section className="bg-paper min-h-[70vh]">
      {composing && (
        <CampaignComposer
          brandName={portal.brand.name}
          brandSlug={portal.admin ? portal.brand.slug : undefined}
          onClose={() => setComposing(false)}
          onSaved={() => {
            setComposing(false);
            load();
          }}
        />
      )}

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12 grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-10 items-start">
        <aside className="lg:sticky lg:top-24">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-obsidian/35 mb-3 px-3">
            Brand portal
          </p>
          {portal.admin && portal.brands && (
            <label className="mb-3 block rounded-2xl border border-ember/20 bg-ember/[0.04] p-3">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-ember">Admin · managing</span>
              <select
                value={portal.brand.slug}
                onChange={(e) => switchBrand(e.target.value)}
                className="w-full rounded-xl border border-obsidian/12 bg-white px-2 py-2 text-sm focus:border-ember focus:ring-0"
              >
                {portal.brands.map((b) => (
                  <option key={b.slug} value={b.slug}>{b.name}</option>
                ))}
              </select>
            </label>
          )}
          <nav className="bg-white border border-obsidian/8 rounded-2xl">
            <ul className="divide-y divide-obsidian/6">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setSection(id)}
                    className={`relative w-full px-4 py-3 flex items-center gap-3 text-sm transition-colors ${
                      section === id
                        ? 'text-ember font-semibold bg-ember/[0.04]'
                        : 'text-obsidian/60 hover:text-ember'
                    } rounded-full`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {label}
                    {section === id && (
                      <motion.span layoutId="portal-nav" className="absolute inset-y-0 right-0 w-0.5 bg-ember" />
                    )}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  href={`/brands/${portal.brand.slug}`}
                  className="w-full px-4 py-3 flex items-center gap-3 text-sm text-obsidian/60 hover:text-ember transition-colors"
                >
                  <Package size={16} className="shrink-0" />
                  Public page
                  <ChevronRight size={13} className="ml-auto text-obsidian/20" />
                </Link>
              </li>
            </ul>
          </nav>

          <div className="mt-4 rounded-2xl brand-gradient text-white p-5">
            <Headset size={18} className="text-white/70" />
            <p className="font-bold mt-2.5">Need help?</p>
            <p className="text-[12px] text-white/60 mt-1.5 leading-relaxed">
              Your Convivia24 contact can set up campaigns and events with you.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block px-4 py-2.5 bg-white text-obsidian text-[10px] font-bold uppercase tracking-[0.12em] rounded-full"
            >
              Contact support
            </Link>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-serif font-light tracking-tight text-2xl sm:text-3xl">
                <span className="brand-text">{portal.admin ? portal.brand.name : `Welcome back, ${portal.brand.name}`}</span>
              </h1>
              <p className="text-obsidian/50 mt-2 text-sm">
                {portal.admin
                  ? 'Admin view — you can manage any brand from here.'
                  : 'Here\u2019s what\u2019s happening with your brand on Convivia24.'}
              </p>
            </div>
            {section !== 'events' && (
              <button
                type="button"
                onClick={() => setComposing(true)}
                className="px-5 py-3 btn-brand text-[11px] font-bold uppercase tracking-[0.12em] inline-flex items-center gap-2 rounded-full"
              >
                <Plus size={14} /> New campaign
              </button>
            )}
          </div>

          {section === 'overview' && <PortalOverview portal={portal} onCompose={() => setComposing(true)} />}
          {section === 'campaigns' && (
            <CampaignsTable campaigns={portal.campaigns} onCompose={() => setComposing(true)} />
          )}
          {section === 'events' && (
            <BrandEvents key={portal.brand.slug} brandSlug={portal.brand.slug} brandName={portal.brand.name} admin={Boolean(portal.admin)} />
          )}
          {section === 'participants' && <Participants portal={portal} />}
        </div>
      </div>
    </section>
  );
}

const PORTAL_FEATURES: [string, string][] = [
  ['Your brand page', 'Take over the story, house history and bottles on your Convivia24 page.'],
  ['Campaigns', 'Run challenges that reward drinkers with points, with live participant numbers.'],
  ['Events', 'Post tastings, launches and brand nights straight onto the events page.'],
  ['Audience', 'Followers, joins and completion — real counts, never guessed.'],
];

function SignedOut() {
  return (
    <Shell>
      <p className="max-w-xl text-sm leading-relaxed text-obsidian/60">
        For spirit houses and importers. Claim your brand, then manage its page, campaigns and events from one place.
      </p>
      <ul className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-2">
        {PORTAL_FEATURES.map(([t, b]) => (
          <li key={t} className="rounded-2xl border border-obsidian/8 bg-white p-5">
            <p className="font-semibold">{t}</p>
            <p className="mt-1 text-sm text-obsidian/55">{b}</p>
          </li>
        ))}
      </ul>
      <Link
        href="/signin?next=%2Fbrands%2Fportal"
        className="mt-6 inline-block px-5 py-3 btn-brand text-[11px] font-bold uppercase tracking-[0.14em] rounded-full"
      >
        Sign in to claim or manage your brand
      </Link>
    </Shell>
  );
}

const CLAIM_STATUS: Record<string, string> = {
  pending: 'Under review',
  verified: 'Verified — awaiting approval',
  approved: 'Approved',
  rejected: 'Not approved',
};

function ClaimYourBrand({ directory, claims, email }: { directory: DirectoryBrand[]; claims: Claim[]; email: string }) {
  const [q, setQ] = useState('');
  const [claiming, setClaiming] = useState<DirectoryBrand | null>(null);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return directory.filter((b) => !needle || `${b.name} ${b.origin}`.toLowerCase().includes(needle));
  }, [directory, q]);

  return (
    <Shell>
      {claiming && <BrandClaimDialog brand={claiming} onClose={() => setClaiming(null)} />}
      <p className="max-w-xl text-sm leading-relaxed text-obsidian/60">
        Signed in as <strong>{email}</strong>. Pick your brand and claim it — we verify every claim with the house, then
        this portal opens with your page, campaigns and events.
      </p>

      {claims.length > 0 && (
        <section className="mt-6 max-w-xl rounded-2xl border border-obsidian/8 bg-white">
          <h2 className="border-b border-obsidian/8 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-obsidian/50">Your claims</h2>
          <ul className="divide-y divide-obsidian/6">
            {claims.map((c) => (
              <li key={`${c.brandSlug}-${c.createdAt}`} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span className="font-semibold">{c.brandName}</span>
                <span className="text-obsidian/55">{CLAIM_STATUS[c.status] ?? c.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <label className="relative mt-6 block max-w-xl">
        <span className="sr-only">Find your brand</span>
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian/35" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find your brand"
          className="w-full rounded-full border border-obsidian/12 bg-white py-2.5 pl-10 pr-4 text-base focus:border-ember focus:ring-0 sm:text-sm"
        />
      </label>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => (
          <li key={b.slug}>
            <button
              type="button"
              onClick={() => setClaiming(b)}
              className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-obsidian/8 bg-white px-4 py-3 text-left transition-colors hover:border-ember/40"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">{b.name}</span>
                <span className="block truncate text-[12px] text-obsidian/45">{b.origin}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ember">
                <BadgeCheck size={13} /> Claim
              </span>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-sm text-obsidian/45">
            Not listed? <Link href="/contact" className="font-semibold text-ember">Tell us about your brand</Link>.
          </li>
        )}
      </ul>
    </Shell>
  );
}

export function PortalOverview({ portal, onCompose }: { portal: PortalData; onCompose: () => void }) {
  const top = useMemo(
    () => [...portal.campaigns].sort((a, b) => b.participants - a.participants)[0],
    [portal.campaigns]
  );

  const STATS = [
    { icon: Megaphone, label: 'Campaigns', value: portal.stats.campaigns },
    { icon: Users, label: 'Participants', value: portal.stats.participants },
    { icon: Star, label: 'Points issued', value: portal.stats.pointsIssued },
    { icon: Target, label: 'Tasks completed', value: portal.stats.tasksCompleted },
  ];

  return (
    <div className="space-y-6">
      <section className="bg-obsidian text-white p-6 sm:p-8 rounded-2xl">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 text-[10px] font-bold uppercase tracking-[0.12em] rounded-full">
          <BadgeCheck size={12} /> Verified brand
        </span>
        <h2 className="font-serif font-light tracking-tight text-3xl mt-4">{portal.brand.name}</h2>
        <p className="text-sm text-white/55 mt-2">{portal.brand.origin}</p>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 mt-5 text-sm">
          <li className="text-white/60">
            Est. <span className="font-semibold text-white">{portal.brand.founded || '—'}</span>
          </li>
          <li className="text-white/60">
            Bottles listed <span className="font-semibold text-white tabular-nums">{portal.products}</span>
          </li>
          <li className="text-white/60">
            Followers <span className="font-semibold text-white tabular-nums">{portal.followers}</span>
          </li>
          <li className="text-white/60">
            Managed by <span className="font-semibold text-white">{portal.manager}</span>
          </li>
        </ul>
      </section>

      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STATS.map(({ icon: Icon, label, value }, i) => (
          <motion.li
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="bg-white border border-obsidian/8 p-5 rounded-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] text-obsidian/40">{label}</p>
              <span className="w-9 h-9 rounded-full bg-ember/6 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-ember" />
              </span>
            </div>
            <p className="font-serif font-light text-3xl tabular-nums mt-2 leading-none">
              {value.toLocaleString()}
            </p>
          </motion.li>
        ))}
      </ul>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="space-y-6">
          <JoinsChart joins={portal.joins} />
          <CampaignsTable campaigns={portal.campaigns.slice(0, 4)} onCompose={onCompose} compact />
        </div>

        <div className="space-y-6">
          <section className="bg-white border border-obsidian/8 rounded-2xl">
            <div className="px-5 py-4 border-b border-obsidian/8">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-obsidian/50">
                Top campaign
              </h2>
            </div>
            {top ? (
              <div className="p-5">
                <p className="font-bold text-sm leading-snug">{top.title}</p>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-obsidian/45">Participants</dt>
                    <dd className="font-semibold tabular-nums">{top.participants.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-obsidian/45">Completion</dt>
                    <dd className="font-semibold tabular-nums">{top.completionPct}%</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-obsidian/45">Points on offer</dt>
                    <dd className="font-semibold tabular-nums">{top.rewardPoints.toLocaleString()}</dd>
                  </div>
                </dl>
                <Link
                  href={`/campaigns/${top.slug}`}
                  className="mt-4 w-full py-3 border border-obsidian/15 text-[10px] font-bold uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5 hover:border-ember hover:text-ember transition-colors rounded-full"
                >
                  View campaign <ChevronRight size={13} />
                </Link>
              </div>
            ) : (
              <p className="px-5 py-8 text-sm text-obsidian/45 leading-relaxed">
                No campaigns yet. Your first one will show its numbers here.
              </p>
            )}
          </section>

          <section className="bg-ember/[0.04] border border-ember/15 p-5 text-center rounded-2xl">
            <span className="w-11 h-11 rounded-full bg-ember/10 flex items-center justify-center mx-auto">
              <Megaphone size={18} className="text-ember" />
            </span>
            <p className="font-bold mt-3">Ready to launch?</p>
            <p className="text-[12px] text-obsidian/50 mt-1.5 leading-relaxed">
              Create a challenge, reward your audience, and grow your brand.
            </p>
            <button
              type="button"
              onClick={onCompose}
              className="mt-4 w-full py-3 btn-brand text-[10px] font-bold uppercase tracking-[0.12em] rounded-full"
            >
              Create new campaign
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

/**
 * Daily joins over the last 30 days, drawn as an inline sparkline. Every point
 * is a real count — a day nobody joined is plotted at zero, not smoothed away.
 */
function JoinsChart({ joins }: { joins: JoinPoint[] }) {
  const max = Math.max(1, ...joins.map((j) => j.participants));
  const total = joins.reduce((n, j) => n + j.participants, 0);
  const w = 600;
  const h = 140;

  const points = joins.map((j, i) => {
    const x = joins.length > 1 ? (i / (joins.length - 1)) * w : w / 2;
    const y = h - (j.participants / max) * (h - 12) - 6;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <section className="bg-white border border-obsidian/8 rounded-2xl">
      <div className="px-5 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2">
          <BarChart3 size={16} className="text-ember" />
          <h2 className="font-bold">Participants joined</h2>
        </span>
        <span className="text-[12px] text-obsidian/40 tabular-nums">Last 30 days · {total} total</span>
      </div>

      <div className="p-5">
        {total === 0 ? (
          <p className="py-10 text-center text-sm text-obsidian/40">
            Nobody has joined a campaign yet. The chart fills in as people do.
          </p>
        ) : (
          <>
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[140px]" role="img" aria-label="Daily joins">
              <polyline
                points={`0,${h} ${points.join(' ')} ${w},${h}`}
                fill="currentColor"
                className="text-ember/8"
              />
              <motion.polyline
                points={points.join(' ')}
                fill="none"
                stroke="currentColor"
                className="text-ember"
                strokeWidth="2"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="flex justify-between text-[11px] text-obsidian/35 mt-2">
              <span>{joins[0]?.date}</span>
              <span>{joins[joins.length - 1]?.date}</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function statusOf(campaign: CampaignSummary): { label: string; className: string } {
  if (!campaign.published) return { label: 'Draft', className: 'bg-obsidian/[0.06] text-obsidian/50' };
  if (campaign.live) return { label: 'Live', className: 'bg-emerald-50 text-emerald-700' };
  if (new Date(campaign.startsAt) > new Date()) {
    return { label: 'Upcoming', className: 'bg-amber-50 text-amber-700' };
  }
  return { label: 'Completed', className: 'bg-obsidian/[0.06] text-obsidian/50' };
}

function CampaignsTable({
  campaigns,
  onCompose,
  compact = false,
}: {
  campaigns: CampaignSummary[];
  onCompose: () => void;
  compact?: boolean;
}) {
  return (
    <section className="bg-white border border-obsidian/8 rounded-2xl">
      <div className="px-5 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-obsidian/50">
          Your campaigns
        </h2>
        {compact ? (
          <span className="text-[11px] text-obsidian/35 tabular-nums">{campaigns.length} shown</span>
        ) : (
          <button
            type="button"
            onClick={onCompose}
            className="text-[11px] font-bold uppercase tracking-[0.1em] text-ember inline-flex items-center gap-1"
          >
            <Plus size={12} /> New
          </button>
        )}
      </div>

      {campaigns.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <Megaphone size={30} className="mx-auto text-obsidian/15 mb-3" />
          <p className="text-sm text-obsidian/50">No campaigns yet.</p>
          <button
            type="button"
            onClick={onCompose}
            className="mt-4 px-5 py-2.5 btn-brand text-[10px] font-bold uppercase tracking-[0.12em] rounded-full"
          >
            Create your first
          </button>
        </div>
      ) : (
        <>
          {/* The row is wider than a narrow column can hold, so it scrolls
              rather than crushing the campaign titles. */}
          <div className="overflow-x-auto">
          <div className="hidden sm:grid grid-cols-[minmax(220px,2fr)_88px_80px_132px_112px] gap-3 px-5 py-3 border-b border-obsidian/8 text-[10px] font-bold uppercase tracking-[0.14em] text-obsidian/35 min-w-[660px]">
            <span>Campaign</span>
            <span>Status</span>
            <span className="text-right">Participants</span>
            <span>Period</span>
            <span>Completion</span>
          </div>
          <ul className="divide-y divide-obsidian/6 sm:min-w-[660px]">
            {campaigns.map((campaign) => {
              const status = statusOf(campaign);
              return (
                <li
                  key={campaign.id}
                  className="p-4 sm:px-5 sm:grid sm:grid-cols-[minmax(220px,2fr)_88px_80px_132px_112px] gap-3 items-center"
                >
                  <Link href={`/campaigns/${campaign.slug}`} className="block min-w-0">
                    <p className="text-sm font-semibold leading-snug line-clamp-2 hover:text-ember transition-colors">
                      {campaign.title}
                    </p>
                    <p className="text-[11px] text-obsidian/40 mt-0.5">
                      {campaign.tasks.length} task{campaign.tasks.length === 1 ? '' : 's'} ·{' '}
                      {campaign.rewardPoints.toLocaleString()} pts
                    </p>
                  </Link>

                  <span
                    className={`inline-block w-fit px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] mt-2 sm:mt-0 ${status.className}`}
                  >
                    {status.label}
                  </span>

                  <span className="text-sm tabular-nums sm:text-right block mt-2 sm:mt-0">
                    {campaign.participants.toLocaleString()}
                  </span>

                  <span className="text-[11px] text-obsidian/45 block mt-2 sm:mt-0 whitespace-nowrap">
                    {new Date(campaign.startsAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                    })}
                    {campaign.endsAt && (
                      <>
                        {' – '}
                        {new Date(campaign.endsAt).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </>
                    )}
                  </span>

                  <span className="block mt-2 sm:mt-0">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 flex-1 bg-obsidian/8 overflow-hidden">
                        <motion.span
                          className="block h-full bg-ember"
                          initial={{ width: 0 }}
                          animate={{ width: `${campaign.completionPct}%` }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                        />
                      </span>
                      <span className="text-[11px] tabular-nums text-obsidian/50 shrink-0">
                        {campaign.completionPct}%
                      </span>
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          </div>
        </>
      )}
    </section>
  );
}

function Participants({ portal }: { portal: PortalData }) {
  const joined = portal.stats.participants;
  return (
    <div className="space-y-6">
      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total participants', value: joined },
          { label: 'Tasks completed', value: portal.stats.tasksCompleted },
          { label: 'Points issued', value: portal.stats.pointsIssued },
        ].map((stat) => (
          <li key={stat.label} className="bg-white border border-obsidian/8 p-5 rounded-2xl">
            <p className="text-[11px] text-obsidian/40">{stat.label}</p>
            <p className="font-serif font-light text-2xl tabular-nums mt-1.5">
              {stat.value.toLocaleString()}
            </p>
          </li>
        ))}
      </ul>

      <JoinsChart joins={portal.joins} />

      <section className="bg-white border border-obsidian/8 p-5 sm:p-6 rounded-2xl">
        <h2 className="font-bold">Who is playing</h2>
        <p className="text-sm text-obsidian/55 mt-2 leading-relaxed max-w-lg">
          Leaderboards on each campaign show display names and scores. Convivia24 does not share
          participants&apos; email addresses or personal details with brands.
        </p>
        {portal.campaigns.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {portal.campaigns.map((campaign) => (
              <li key={campaign.id}>
                <Link
                  href={`/campaigns/${campaign.slug}`}
                  className="inline-block px-4 py-2.5 border border-obsidian/12 text-[11px] font-medium hover:border-ember hover:text-ember transition-colors"
                >
                  {campaign.title} · {campaign.participants}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-paper min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <h1 className="font-serif font-light tracking-tight text-3xl brand-text mb-4">
          Brand portal
        </h1>
        {children}
      </div>
    </section>
  );
}
