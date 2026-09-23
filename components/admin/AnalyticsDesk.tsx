'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Activity, BarChart3, Server, Sparkles, Users, Wine } from 'lucide-react';
import { PERIODS, type PeriodKey } from '@/lib/accounting/statements';
import type { AnalyticsReport } from '@/lib/analytics/types';
import { formatNgn } from '@/lib/drinks/catalog';
import { readError } from './types';
import { adminInputClass } from './ui/Fields';

type Pane = 'overview' | 'api' | 'commerce' | 'engagement';

const PANES: { key: Pane; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'commerce', label: 'Commerce' },
  { key: 'api', label: 'API usage' },
  { key: 'engagement', label: 'Engagement' },
];

function titleCase(value: string): string {
  return value.replace(/[_:-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function SparkBars({
  values,
  maxHint,
}: {
  values: number[];
  maxHint?: number;
}) {
  const max = Math.max(maxHint ?? 0, ...values, 1);
  return (
    <div className="flex h-16 items-end gap-0.5" aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className="min-w-[3px] flex-1 rounded-t bg-ember/70"
          style={{ height: `${Math.max(4, Math.round((v / max) * 100))}%` }}
        />
      ))}
    </div>
  );
}

export default function AnalyticsDesk() {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [pane, setPane] = useState<Pane>('overview');
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (key: PeriodKey) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/analytics?period=${key}`);
      if (!res.ok) throw new Error(await readError(res, 'Unable to load analytics.'));
      setReport(await res.json());
    } catch (err) {
      setReport(null);
      setError(err instanceof Error ? err.message : 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [load, period]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/45">
              Period
            </span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodKey)}
              className={`${adminInputClass} w-40 py-2`}
            >
              {PERIODS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <div role="tablist" aria-label="Analytics views" className="flex flex-wrap gap-1 rounded-xl bg-obsidian/[0.04] p-1">
            {PANES.map((p) => (
              <button
                key={p.key}
                type="button"
                role="tab"
                aria-selected={pane === p.key}
                onClick={() => setPane(p.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  pane === p.key ? 'bg-white text-obsidian shadow-sm' : 'text-obsidian/50 hover:text-obsidian'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {report && (
          <p className="text-xs text-obsidian/40">{report.range.label}</p>
        )}
      </div>

      {loading && <p className="text-sm text-obsidian/45">Loading analytics…</p>}
      {error && <p className="text-sm text-ember">{error}</p>}

      {!loading && report && pane === 'overview' && <OverviewPane report={report} />}
      {!loading && report && pane === 'commerce' && <CommercePane report={report} />}
      {!loading && report && pane === 'api' && <ApiPane report={report} />}
      {!loading && report && pane === 'engagement' && <EngagementPane report={report} />}
    </div>
  );
}

function OverviewPane({ report }: { report: AnalyticsReport }) {
  const hitTrend = report.api.days.map((d) => d.hits);
  const revTrend = report.commerce.trend.map((d) => d.revenueNgn);

  return (
    <div className="space-y-6">
      <section className="grid gap-px overflow-hidden rounded-2xl border border-obsidian/10 bg-obsidian/10 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<BarChart3 size={16} />} label="Net revenue" value={formatNgn(report.commerce.revenueNgn)} />
        <Stat icon={<Activity size={16} />} label="Orders" value={report.commerce.orders} />
        <Stat icon={<Server size={16} />} label="API hits" value={report.api.totalHits} hint={report.api.configured ? undefined : 'Redis off — counters idle'} />
        <Stat icon={<Users size={16} />} label="Loyalty members" value={report.loyalty.members} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Revenue trend" hint="Collected orders by Lagos day">
          {revTrend.length === 0 ? (
            <Empty>No orders in this window.</Empty>
          ) : (
            <SparkBars values={revTrend} />
          )}
        </Card>
        <Card title="API traffic" hint={report.api.configured ? 'Rate-limited route hits' : 'Enable Upstash Redis to record hits'}>
          {hitTrend.every((v) => v === 0) ? (
            <Empty>{report.api.configured ? 'No hits recorded yet — traffic starts counting after deploy.' : 'Redis is not configured.'}</Empty>
          ) : (
            <SparkBars values={hitTrend} />
          )}
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40">Systems</h2>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <SysPill on={report.systems.redis} label="Redis / API counters" />
          <SysPill on={report.systems.ai} label="Azure OpenAI" />
          <SysPill on={report.systems.blob} label="Azure Blob" />
          <SysPill on={report.systems.flutterwave} label="Flutterwave" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Avg order value" value={formatNgn(report.commerce.aovNgn)} />
        <MiniStat label="Points liability" value={formatNgn(report.loyalty.pointsLiabilityNgn)} />
        <MiniStat label="Low stock SKUs" value={report.inventory.lowStock} />
      </section>
    </div>
  );
}

function CommercePane({ report }: { report: AnalyticsReport }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-px overflow-hidden rounded-2xl border border-obsidian/10 bg-obsidian/10 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Orders" value={report.commerce.orders} />
        <Stat label="Net revenue" value={formatNgn(report.commerce.revenueNgn)} />
        <Stat label="Avg order" value={formatNgn(report.commerce.aovNgn)} />
        <Stat label="Refunded" value={formatNgn(report.commerce.refundedNgn)} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="By status">
          {report.commerce.byStatus.length === 0 ? (
            <Empty>No orders.</Empty>
          ) : (
            <ul className="divide-y divide-obsidian/[0.06]">
              {report.commerce.byStatus.map((row) => (
                <li key={row.status} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-obsidian/70">{titleCase(row.status)}</span>
                  <span className="font-bold tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Top SKUs" hint="By units sold">
          {report.commerce.topSkus.length === 0 ? (
            <Empty>No line items yet.</Empty>
          ) : (
            <ul className="divide-y divide-obsidian/[0.06]">
              {report.commerce.topSkus.map((row) => (
                <li key={row.sku} className="flex items-start justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-obsidian">{row.name}</span>
                    <span className="text-[11px] text-obsidian/40">{row.sku}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-bold tabular-nums">{row.qty}</span>
                    <span className="text-[11px] text-obsidian/45">{formatNgn(row.revenueNgn)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Daily orders" hint="Lagos calendar">
        {report.commerce.trend.length === 0 ? (
          <Empty>No trend data.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40">
                  <th className="pb-2 font-black">Day</th>
                  <th className="pb-2 font-black">Orders</th>
                  <th className="pb-2 font-black">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian/[0.06]">
                {report.commerce.trend.map((row) => (
                  <tr key={row.day}>
                    <td className="py-1.5 tabular-nums text-obsidian/70">{row.day}</td>
                    <td className="py-1.5 tabular-nums font-semibold">{row.orders}</td>
                    <td className="py-1.5 tabular-nums">{formatNgn(row.revenueNgn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function ApiPane({ report }: { report: AnalyticsReport }) {
  const cocktail = report.api.routes.find((r) => r.route.includes('cocktail') || r.route.includes('party-ai') || r.route.includes('destress') || r.route.includes('plan-day'));
  return (
    <div className="space-y-6">
      <section className="grid gap-px overflow-hidden rounded-2xl border border-obsidian/10 bg-obsidian/10 sm:grid-cols-3">
        <Stat icon={<Server size={16} />} label="Total hits" value={report.api.totalHits} />
        <Stat label="Rate-limited" value={report.api.totalBlocked} hint="Requests rejected by the window" />
        <Stat icon={<Sparkles size={16} />} label="AI cocktail route" value={cocktail?.hits ?? 0} />
      </section>

      {!report.api.configured && (
        <p className="rounded-xl border border-ember/20 bg-ember/[0.04] px-4 py-3 text-sm text-obsidian/70">
          Upstash Redis is not configured. API counters stay empty until <code className="text-xs">UPSTASH_REDIS_REST_URL</code> and token are set.
        </p>
      )}

      <Card title="Routes" hint="Aggregated from rate-limit keys">
        {report.api.routes.length === 0 ? (
          <Empty>No route traffic recorded in this window.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40">
                  <th className="pb-2 font-black">Route</th>
                  <th className="pb-2 font-black">Hits</th>
                  <th className="pb-2 font-black">Blocked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian/[0.06]">
                {report.api.routes.map((row) => (
                  <tr key={row.route}>
                    <td className="py-1.5 font-mono text-xs text-obsidian/80">{row.route}</td>
                    <td className="py-1.5 tabular-nums font-semibold">{row.hits}</td>
                    <td className="py-1.5 tabular-nums text-obsidian/55">{row.blocked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Daily API hits">
        {report.api.days.every((d) => d.hits === 0) ? (
          <Empty>No daily hits yet.</Empty>
        ) : (
          <div className="space-y-3">
            <SparkBars values={report.api.days.map((d) => d.hits)} />
            <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {report.api.days
                .filter((d) => d.hits > 0)
                .slice(-12)
                .map((d) => (
                  <li key={d.day} className="flex justify-between gap-2 rounded-lg bg-obsidian/[0.03] px-2.5 py-1.5 text-xs">
                    <span className="tabular-nums text-obsidian/55">{d.day}</span>
                    <span className="font-bold tabular-nums">{d.hits}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}

function EngagementPane({ report }: { report: AnalyticsReport }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-px overflow-hidden rounded-2xl border border-obsidian/10 bg-obsidian/10 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Trivia entries" value={report.engagement.triviaEntries} />
        <Stat label="Trivia wins" value={report.engagement.triviaWins} />
        <Stat label="Brand enquiries" value={report.engagement.brandEnquiries} />
        <Stat label="Restock alerts" value={report.engagement.restockAlerts} />
        <Stat label="Product reviews" value={report.engagement.productReviews} />
        <Stat label="Points awarded" value={report.loyalty.pointsAwardedInPeriod} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card title="Loyalty" icon={<Users size={14} />}>
          <dl className="space-y-2 text-sm">
            <Row label="Members" value={report.loyalty.members} />
            <Row label="Points outstanding" value={report.loyalty.pointsOutstanding.toLocaleString()} />
            <Row label="Liability" value={formatNgn(report.loyalty.pointsLiabilityNgn)} />
          </dl>
        </Card>
        <Card title="Inventory" icon={<Wine size={14} />}>
          <dl className="space-y-2 text-sm">
            <Row label="Active SKUs" value={report.inventory.activeSkus} />
            <Row label="On-hand units" value={report.inventory.onHandUnits.toLocaleString()} />
            <Row label="Low stock" value={report.inventory.lowStock} />
          </dl>
        </Card>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="bg-white px-4 py-4">
      <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/45">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-obsidian">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-obsidian/40">{hint}</p>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-obsidian/10 bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/45">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

function Card({
  title,
  hint,
  icon,
  children,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-obsidian/10 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/45">
            {icon}
            {title}
          </h3>
          {hint && <p className="mt-0.5 text-[11px] text-obsidian/40">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-obsidian/40">{children}</p>;
}

function SysPill({ on, label }: { on: boolean; label: string }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
        on ? 'border-emerald-500/25 bg-emerald-500/[0.06] text-obsidian' : 'border-obsidian/10 bg-white text-obsidian/45'
      }`}
    >
      <span className={`mr-2 inline-block h-2 w-2 rounded-full ${on ? 'bg-emerald-500' : 'bg-obsidian/25'}`} />
      {label}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-obsidian/55">{label}</dt>
      <dd className="font-bold tabular-nums text-obsidian">{value}</dd>
    </div>
  );
}
