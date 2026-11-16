'use client';

import { useState, type ReactNode } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { PERIODS, type PeriodKey } from '@/lib/accounting/statements';
import type { AnalyticsReport } from '@/lib/analytics/types';
import { formatNgn } from '@/lib/drinks/catalog';
import AnalyticsChart from './AnalyticsChart';
import { useDesk } from './useDesk';
import { deskField } from './ui/DeskContent';
import type { AdminSummary } from './types';

/**
 * The desk's one landing page: today's numbers, what needs someone, and how the business is doing
 * over the chosen period — one screen, read top to bottom, no sub-pages.
 */

const n = (v: number) => new Intl.NumberFormat('en-NG').format(v);
const words = (v: string) => v.replace(/[_:-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function Panel({ title, action, children, className = '' }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 overflow-hidden rounded-lg border border-obsidian/15 bg-white ${className}`}>
      <header className="flex min-h-[2.5rem] items-center justify-between gap-3 border-b border-obsidian/10 px-3 py-1.5">
        <h3 className="text-[13px] font-bold text-obsidian">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: string }) {
  return (
    <div className="min-w-0 bg-white px-3 py-2.5">
      <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-obsidian/60">{label}</p>
      <p className={`mt-0.5 truncate text-xl font-bold tabular-nums ${tone ?? 'text-obsidian'}`}>{value}</p>
      {sub && <p className="truncate text-[11px] text-obsidian/60">{sub}</p>}
    </div>
  );
}

/** "+12% vs last 30 days" — green up, red down; refunds read the other way round. */
function Delta({ now, prev, label, invert = false }: { now: number; prev: number | null | undefined; label?: string; invert?: boolean }) {
  if (prev == null) return null;
  if (prev === 0 && now === 0) return <span className="text-obsidian/50">no change{label ? ` vs ${label}` : ''}</span>;
  const pct = prev === 0 ? null : Math.round(((now - prev) / Math.abs(prev)) * 100);
  const up = now > prev;
  const good = invert ? !up : up;
  const text = pct == null ? 'new' : `${up ? '+' : ''}${pct}%`;
  return (
    <span className={`font-semibold ${now === prev ? 'text-obsidian/50' : good ? 'text-emerald-700' : 'text-red-600'}`}>
      {now === prev ? 'no change' : `${up ? '▲' : '▼'} ${text}`}
      <span className="font-normal text-obsidian/50">{label ? ` vs ${label.toLowerCase()}` : ''}</span>
    </span>
  );
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-obsidian/8 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-3 px-3 py-1.5">
          <dt className="text-obsidian/70">{k}</dt>
          <dd className="font-semibold tabular-nums text-obsidian">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function DashboardDesk({ summary, onGo }: { summary: AdminSummary; onGo: (tab: string) => void }) {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');
  const desk = useDesk<AnalyticsReport>(`/api/admin/analytics?period=${period}`);
  const r = desk.loading ? null : desk.data;

  const attention: { label: string; value: string | number; hint: string; tab: string; hot: boolean }[] = [
    { label: 'Orders to fulfil', value: summary.ordersToFulfil, hint: 'Paid, not yet delivered', tab: 'fulfil', hot: summary.ordersToFulfil > 0 },
    { label: 'Awaiting supplier cost', value: summary.ordersUnsourced, hint: 'Margin not recorded', tab: 'fulfil', hot: summary.ordersUnsourced > 0 },
    { label: 'Low stock', value: summary.lowStock, hint: 'At or under threshold', tab: 'drinks', hot: summary.lowStock > 0 },
    { label: 'Bottle requests', value: summary.bottleRequestsPending, hint: `${summary.supplierChanges24h} supplier changes in 24h`, tab: 'suppliers', hot: summary.bottleRequestsPending > 0 },
    { label: 'Brand enquiries', value: summary.brandEnquiriesNew, hint: `${summary.partnersPending} partner applications`, tab: 'referrals', hot: summary.brandEnquiriesNew + summary.partnersPending > 0 },
    { label: 'Commissions owed', value: formatNgn(summary.commissionsOwedNgn), hint: 'Approved, unpaid', tab: 'referrals', hot: summary.commissionsOwedNgn > 0 },
    { label: 'Prizes to hand over', value: summary.prizesUnclaimed, hint: 'Trivia winners', tab: 'trivia', hot: summary.prizesUnclaimed > 0 },
    { label: 'Content to review', value: summary.contentPending, hint: 'Events & venue submissions', tab: 'content', hot: summary.contentPending > 0 },
  ].sort((a, b) => Number(b.hot) - Number(a.hot));

  const statusTotal = r ? r.commerce.byStatus.reduce((s, x) => s + x.count, 0) : 0;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-obsidian/70">
          Reporting period
          <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodKey)} className={`${deskField} h-8 w-auto py-1 text-sm`}>
            {PERIODS.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </label>
        {r && (
          <span className="text-xs text-obsidian/60">
            {r.range.label} · {new Date(r.range.from).toLocaleDateString('en-GB')} to {new Date(r.range.to).toLocaleDateString('en-GB')}
          </span>
        )}
        <span className="flex-1" />
        <button type="button" onClick={() => void desk.reload()} disabled={desk.loading} className="h-8 rounded-md border border-obsidian/20 bg-white px-3 text-xs font-semibold text-obsidian/80 hover:border-obsidian disabled:opacity-40">
          {desk.loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      {desk.error && <p role="alert" className="rounded-md border border-ember/30 bg-ember/5 px-3 py-2 text-sm text-ember">{desk.error}</p>}

      {/* KPI strip: today on the left, the period after it */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-obsidian/15 bg-obsidian/15 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Today" value={formatNgn(summary.todayRevenueNgn)} sub={`${summary.todayOrders} order${summary.todayOrders === 1 ? '' : 's'}`} tone="text-ember" />
        <Kpi
          label="Net revenue"
          value={r ? formatNgn(r.commerce.revenueNgn) : '—'}
          sub={r?.previous ? <Delta now={r.commerce.revenueNgn} prev={r.previous.revenueNgn} label={r.previous.label} /> : 'After refunds, incl. delivery'}
        />
        <Kpi
          label="Net profit"
          value={r?.profit ? formatNgn(r.profit.netProfitNgn) : '—'}
          tone={r?.profit ? (r.profit.netProfitNgn < 0 ? 'text-red-600' : 'text-emerald-700') : undefined}
          sub={
            r?.profit ? (
              r.profit.prevNetProfitNgn != null ? (
                <Delta now={r.profit.netProfitNgn} prev={r.profit.prevNetProfitNgn} label={r.previous?.label} />
              ) : (
                `${r.profit.netMarginPct}% margin`
              )
            ) : (
              'After all costs'
            )
          }
        />
        <Kpi label="Orders" value={r ? n(r.commerce.orders) : '—'} sub={r?.previous ? <Delta now={r.commerce.orders} prev={r.previous.orders} /> : 'Collected'} />
        <Kpi label="Average order" value={r ? formatNgn(r.commerce.aovNgn) : '—'} sub={r?.previous ? <Delta now={r.commerce.aovNgn} prev={r.previous.aovNgn} /> : undefined} />
        <Kpi
          label="Refunded"
          value={r ? formatNgn(r.commerce.refundedNgn) : '—'}
          tone={r && r.commerce.refundedNgn > 0 ? 'text-red-600' : undefined}
          sub={r?.previous ? <Delta now={r.commerce.refundedNgn} prev={r.previous.refundedNgn} invert /> : undefined}
        />
      </div>

      {/* Trend + what needs someone */}
      <div className="grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel
          title="Sales trend"
          action={
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-obsidian/60">
              Chart measure
              <select value={metric} onChange={(e) => setMetric(e.target.value as 'revenue' | 'orders')} className={`${deskField} h-7 w-auto py-0.5 text-xs`}>
                <option value="revenue">Net revenue (NGN)</option>
                <option value="orders">Collected orders</option>
              </select>
            </label>
          }
        >
          <div className="p-3">
            {r ? (
              <AnalyticsChart
                title={metric === 'revenue' ? 'Net revenue' : 'Collected orders'}
                points={r.commerce.trend.map((p) => ({ label: p.day, value: metric === 'revenue' ? p.revenueNgn : p.orders }))}
                format={metric === 'revenue' ? formatNgn : n}
              />
            ) : (
              <div className="h-[220px] animate-pulse rounded-md bg-obsidian/[0.04]" />
            )}
          </div>
        </Panel>

        <Panel title="Needs attention">
          <ul className="divide-y divide-obsidian/8">
            {attention.map((a) => (
              <li key={a.label}>
                <button type="button" onClick={() => onGo(a.tab)} className="group flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-obsidian/[0.03]">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${a.hot ? 'bg-ember' : 'bg-obsidian/20'}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold ${a.hot ? 'text-obsidian' : 'text-obsidian/60'}`}>{a.label}</span>
                    <span className="block truncate text-[11px] text-obsidian/55">{a.hint}</span>
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${a.hot ? 'text-ember' : 'text-obsidian/50'}`}>{a.value}</span>
                  <ArrowRight size={14} className="shrink-0 text-obsidian/30 group-hover:text-ember" />
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Detail grid */}
      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">
        <Panel title="Top products">
          {r && r.commerce.topSkus.length > 0 ? (
            <table className="w-full text-sm">
              <caption className="sr-only">Top products</caption>
              <thead className="text-[11px] font-semibold uppercase tracking-wider text-obsidian/55">
                <tr>
                  <th className="px-3 py-1.5 text-left">Product</th>
                  <th className="px-2 py-1.5 text-right">Units</th>
                  <th className="px-3 py-1.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {r.commerce.topSkus.slice(0, 8).map((s) => (
                  <tr key={s.sku} className="border-t border-obsidian/8">
                    <td className="max-w-[160px] truncate px-3 py-1.5">{s.name}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{n(s.qty)}</td>
                    <td className="px-3 py-1.5 text-right font-semibold tabular-nums">{formatNgn(s.revenueNgn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-3 py-3 text-sm text-obsidian/60">{r ? 'No sales in this period.' : 'Loading…'}</p>
          )}
        </Panel>

        <Panel title="Orders by status">
          {r && statusTotal > 0 ? (
            <table className="w-full text-sm">
              <caption className="sr-only">Orders by status</caption>
              <tbody>
                {r.commerce.byStatus.map((s) => (
                  <tr key={s.status} className="border-t border-obsidian/8 first:border-0">
                    <td className="w-32 px-3 py-1.5 text-obsidian/75">{words(s.status)}</td>
                    <td className="px-2 py-1.5">
                      <span className="block h-2 rounded-full bg-obsidian/[0.06]">
                        <span className="block h-2 rounded-full bg-ember" style={{ width: `${Math.max(3, (s.count / statusTotal) * 100)}%` }} />
                      </span>
                    </td>
                    <td className="w-12 px-3 py-1.5 text-right font-semibold tabular-nums">{n(s.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-3 py-3 text-sm text-obsidian/60">{r ? 'No orders in this period.' : 'Loading…'}</p>
          )}
        </Panel>

        <Panel title="Stock & loyalty">
          {r ? (
            <Rows
              rows={[
                ['Products listed', n(r.inventory.activeSkus)],
                ['Units on hand', n(r.inventory.onHandUnits)],
                ['Low stock', <span key="l" className={r.inventory.lowStock > 0 ? 'text-amber-700' : ''}>{n(r.inventory.lowStock)}</span>],
                ['Loyalty members', `${n(r.loyalty.members)} · ${n(r.loyalty.pointsAwardedInPeriod)} pts earned`],
                ['Points outstanding', n(r.loyalty.pointsOutstanding)],
                ['Points liability', formatNgn(r.loyalty.pointsLiabilityNgn)],
              ]}
            />
          ) : (
            <p className="px-3 py-3 text-sm text-obsidian/60">Loading…</p>
          )}
        </Panel>

        <Panel title="Engagement & traffic">
          {r ? (
            <Rows
              rows={[
                ['Trivia entries', `${n(r.engagement.triviaEntries)} · ${n(r.engagement.triviaWins)} wins`],
                ['Product reviews', n(r.engagement.productReviews)],
                ['Restock alerts', n(r.engagement.restockAlerts)],
                ['Brand enquiries', n(r.engagement.brandEnquiries)],
                ['API requests', r.api.configured && !r.api.error ? `${n(r.api.totalHits)} · ${n(r.api.totalBlocked)} blocked` : 'Not recorded'],
              ]}
            />
          ) : (
            <p className="px-3 py-3 text-sm text-obsidian/60">Loading…</p>
          )}
        </Panel>
      </div>

      {/* The exact figures behind the chart */}
      {r && r.commerce.trend.length > 0 && (
        <Panel title="Daily figures">
          <div className="max-h-56 overflow-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Daily commerce values</caption>
              <thead className="sticky top-0 bg-white text-[11px] font-semibold uppercase tracking-wider text-obsidian/55">
                <tr>
                  <th className="px-3 py-1.5 text-left">Day</th>
                  <th className="px-3 py-1.5 text-right">Orders</th>
                  <th className="px-3 py-1.5 text-right">Net revenue</th>
                </tr>
              </thead>
              <tbody>
                {[...r.commerce.trend].reverse().map((d) => (
                  <tr key={d.day} className="border-t border-obsidian/8">
                    <td className="px-3 py-1 tabular-nums">{d.day}</td>
                    <td className="px-3 py-1 text-right tabular-nums">{n(d.orders)}</td>
                    <td className="px-3 py-1 text-right tabular-nums">{formatNgn(d.revenueNgn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {r && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-obsidian/60">
          Integrations:
          {Object.entries(r.systems).map(([k, on]) => (
            <span key={k} className="inline-flex items-center gap-1">
              {on ? <Check size={12} className="text-emerald-700" /> : <X size={12} className="text-obsidian/40" />}
              {words(k)}
            </span>
          ))}
          <span>· Image upload {summary.blobConfigured ? 'ready' : 'off'} · AI copy {summary.aiConfigured ? 'ready' : 'off'}</span>
        </p>
      )}
    </div>
  );
}
