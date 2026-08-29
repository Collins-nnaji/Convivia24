'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  BarChart3,
  ChevronRight,
  Headset,
  LayoutDashboard,
  Megaphone,
  Package,
  Plus,
  Star,
  Target,
  Users,
} from 'lucide-react';
import { useUser } from '@/components/auth/AuthProvider';
import CampaignComposer from '@/components/brands/CampaignComposer';
import type { CampaignSummary, BrandCampaignStats, JoinPoint } from '@/lib/brands/campaigns';

export type PortalData = {
  brand: { slug: string; name: string; origin: string; founded: string };
  manager: string;
  stats: BrandCampaignStats;
  campaigns: CampaignSummary[];
  joins: JoinPoint[];
  followers: number;
  products: number;
};

type Section = 'overview' | 'campaigns' | 'participants';

const SECTIONS: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'participants', label: 'Participants', icon: Users },
];

export default function BrandPortal() {
  const { user, loading: authLoading } = useUser();
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>('overview');
  const [composing, setComposing] = useState(false);

  function load() {
    setLoading(true);
    fetch('/api/brands/portal')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Could not load your portal.');
        setPortal(data);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  if (authLoading || loading) return <Shell>Loading your portal…</Shell>;

  if (!user) {
    return (
      <Shell>
        <p className="text-sm text-obsidian/60 mb-4">Sign in to open the brand portal.</p>
        <Link
          href="/signin?next=%2Fbrands%2Fportal"
          className="inline-block px-5 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
        >
          Sign in
        </Link>
      </Shell>
    );
  }

  if (error || !portal) {
    return (
      <Shell>
        <p className="text-sm text-obsidian/60 mb-2 max-w-md leading-relaxed">{error}</p>
        <p className="text-[12px] text-obsidian/45 mb-5 max-w-md leading-relaxed">
          Brand pages are written and run by Convivia24. Claim yours from its page and we&apos;ll verify you
          before opening the portal.
        </p>
        <Link
          href="/brands"
          className="inline-block px-5 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
        >
          Find your brand
        </Link>
      </Shell>
    );
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      {composing && (
        <CampaignComposer
          brandName={portal.brand.name}
          onClose={() => setComposing(false)}
          onSaved={() => {
            setComposing(false);
            load();
          }}
        />
      )}

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12 grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-10 items-start">
        <aside className="lg:sticky lg:top-24">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/35 mb-3 px-3">
            Brand portal
          </p>
          <nav className="bg-white border border-obsidian/8">
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
                    }`}
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

          <div className="mt-4 brand-gradient text-white p-5">
            <Headset size={18} className="text-white/70" />
            <p className="font-bold mt-2.5">Need help?</p>
            <p className="text-[12px] text-white/60 mt-1.5 leading-relaxed">
              Your Convivia24 contact can set up campaigns with you.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block px-4 py-2.5 bg-white text-obsidian text-[10px] font-black uppercase tracking-[0.12em]"
            >
              Contact support
            </Link>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-logo font-black uppercase tracking-tight text-2xl sm:text-3xl">
                <span className="brand-text">Welcome back, {portal.brand.name}</span>
              </h1>
              <p className="text-obsidian/50 mt-2 text-sm">
                Here&apos;s what&apos;s happening with your brand on Convivia24.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setComposing(true)}
              className="px-5 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.12em] inline-flex items-center gap-2"
            >
              <Plus size={14} /> New campaign
            </button>
          </div>

          {section === 'overview' && <PortalOverview portal={portal} onCompose={() => setComposing(true)} />}
          {section === 'campaigns' && (
            <CampaignsTable campaigns={portal.campaigns} onCompose={() => setComposing(true)} />
          )}
          {section === 'participants' && <Participants portal={portal} />}
        </div>
      </div>
    </section>
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
      <section className="bg-obsidian text-white p-6 sm:p-8">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 text-[10px] font-black uppercase tracking-[0.12em]">
          <BadgeCheck size={12} /> Verified brand
        </span>
        <h2 className="font-logo font-black uppercase tracking-tight text-3xl mt-4">{portal.brand.name}</h2>
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
            className="bg-white border border-obsidian/8 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] text-obsidian/40">{label}</p>
              <span className="w-9 h-9 rounded-full bg-ember/6 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-ember" />
              </span>
            </div>
            <p className="font-logo font-black text-3xl tabular-nums mt-2 leading-none">
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
          <section className="bg-white border border-obsidian/8">
            <div className="px-5 py-4 border-b border-obsidian/8">
              <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
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
                  className="mt-4 w-full py-3 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5 hover:border-ember hover:text-ember transition-colors"
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

          <section className="bg-ember/[0.04] border border-ember/15 p-5 text-center">
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
              className="mt-4 w-full py-3 btn-brand text-[10px] font-black uppercase tracking-[0.12em]"
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
    <section className="bg-white border border-obsidian/8">
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
    <section className="bg-white border border-obsidian/8">
      <div className="px-5 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
          Your campaigns
        </h2>
        {compact ? (
          <span className="text-[11px] text-obsidian/35 tabular-nums">{campaigns.length} shown</span>
        ) : (
          <button
            type="button"
            onClick={onCompose}
            className="text-[11px] font-black uppercase tracking-[0.1em] text-ember inline-flex items-center gap-1"
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
            className="mt-4 px-5 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.12em]"
          >
            Create your first
          </button>
        </div>
      ) : (
        <>
          {/* The row is wider than a narrow column can hold, so it scrolls
              rather than crushing the campaign titles. */}
          <div className="overflow-x-auto">
          <div className="hidden sm:grid grid-cols-[minmax(220px,2fr)_88px_80px_132px_112px] gap-3 px-5 py-3 border-b border-obsidian/8 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/35 min-w-[660px]">
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
                    className={`inline-block w-fit px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] mt-2 sm:mt-0 ${status.className}`}
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
          <li key={stat.label} className="bg-white border border-obsidian/8 p-5">
            <p className="text-[11px] text-obsidian/40">{stat.label}</p>
            <p className="font-logo font-black text-2xl tabular-nums mt-1.5">
              {stat.value.toLocaleString()}
            </p>
          </li>
        ))}
      </ul>

      <JoinsChart joins={portal.joins} />

      <section className="bg-white border border-obsidian/8 p-5 sm:p-6">
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
        <h1 className="font-logo font-black uppercase tracking-tight text-3xl brand-text mb-4">
          Brand portal
        </h1>
        {children}
      </div>
    </section>
  );
}
