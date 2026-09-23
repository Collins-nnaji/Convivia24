'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import { PERIODS, type AccountingReport, type PeriodKey } from '@/lib/accounting/statements';
import { readError } from './types';
import { adminInputClass } from './ui/Fields';

function money(amount: number): string {
  const n = amount === 0 ? 0 : amount;
  if (n < 0) return `(${formatNgn(Math.abs(n))})`;
  return formatNgn(n);
}

function change(current: number, previous: number | null | undefined): { text: string; up: boolean } | null {
  if (previous == null) return null;
  if (previous === 0) return current === 0 ? { text: 'Flat', up: true } : { text: 'New', up: current > 0 };
  const pct = Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
  return { text: `${pct > 0 ? '+' : ''}${pct}%`, up: pct >= 0 };
}

function titleCase(value: string): string {
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

type Book = 'pnl' | 'balance' | 'payouts' | 'activity';

const BOOKS: { key: Book; label: string }[] = [
  { key: 'pnl', label: 'Profit & loss' },
  { key: 'balance', label: 'Balance sheet' },
  { key: 'payouts', label: 'Payouts' },
  { key: 'activity', label: 'Activity' },
];

export default function AccountingDesk() {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [book, setBook] = useState<Book>('pnl');
  const [report, setReport] = useState<AccountingReport | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (key: PeriodKey) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/accounting?period=${key}`);
      if (!res.ok) throw new Error(await readError(res, 'Unable to load the accounts.'));
      setReport(await res.json());
    } catch (err) {
      setReport(null);
      setError(err instanceof Error ? err.message : 'Unable to load the accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [load, period]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/45">Period</span>
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
          <div role="tablist" aria-label="Books" className="flex flex-wrap gap-1 rounded-xl bg-obsidian/[0.04] p-1">
            {BOOKS.map((item) => {
              const on = book === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setBook(item.key)}
                  className={`rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] ${
                    on ? 'bg-white text-obsidian shadow-sm' : 'text-obsidian/45 hover:text-obsidian'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-obsidian/50 ring-1 ring-obsidian/10 hover:text-obsidian"
        >
          Print
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-ember">{error}</p>}
      {loading && !report && <p className="text-sm text-obsidian/40">Opening the books…</p>}

      {report && (
        <div className={loading ? 'opacity-60' : ''}>
          <Headlines report={report} />
          <div className="mt-5" role="tabpanel">
            {book === 'pnl' && <ProfitStatement report={report} />}
            {book === 'balance' && <Balance report={report} />}
            {book === 'payouts' && <Payouts report={report} />}
            {book === 'activity' && <Activity report={report} />}
          </div>
        </div>
      )}
    </div>
  );
}

function Headlines({ report }: { report: AccountingReport }) {
  const { pnl, previous, comparisonLabel } = report;
  const cards: { label: string; value: number; prior: number | null; hint: string; neutral?: boolean }[] = [
    {
      label: 'Net revenue',
      value: pnl.netRevenueNgn,
      prior: previous?.netRevenueNgn ?? null,
      hint: `${pnl.orderCount} order${pnl.orderCount === 1 ? '' : 's'} · ${formatNgn(pnl.avgOrderNgn)} average`,
    },
    {
      label: 'Gross profit',
      value: pnl.grossProfitNgn,
      prior: previous?.grossProfitNgn ?? null,
      hint: `${pnl.grossMarginPct}% of net revenue`,
    },
    {
      label: 'Net profit',
      value: pnl.netProfitNgn,
      prior: previous?.netProfitNgn ?? null,
      hint: 'After fees, commissions, loyalty and rewards',
    },
    {
      label: 'Paid out',
      value: pnl.commissionsPaidNgn,
      prior: previous?.commissionsPaidNgn ?? null,
      hint: `${formatNgn(pnl.commissionsAccruedNgn)} earned in the period`,
      neutral: true,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const delta = change(card.value, card.prior);
        return (
          <div key={card.label} className="rounded-2xl bg-white p-4 ring-1 ring-obsidian/8">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold tabular-nums ${card.value < 0 ? 'text-ember' : 'text-obsidian'}`}>
              {money(card.value)}
            </p>
            <p className="mt-1 text-xs text-obsidian/45">{card.hint}</p>
            {delta && comparisonLabel && (
              <p className={`mt-2 text-[11px] font-semibold tabular-nums ${card.neutral ? 'text-obsidian/55' : delta.up ? 'text-emerald-700' : 'text-ember'}`}>
                {delta.text} <span className="font-normal text-obsidian/40">vs {comparisonLabel}</span>
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}

function ProfitStatement({ report }: { report: AccountingReport }) {
  const pnl = report.pnl;
  const rewardFulfillment = Math.max(0, pnl.rewardCostNgn - pnl.loyaltyReleasedNgn);
  const operating =
    pnl.commissionsAccruedNgn +
    pnl.flutterwaveNgn +
    pnl.accessNgn +
    pnl.loyaltyAccruedNgn +
    rewardFulfillment;

  return (
    <Ledger
      title={`Profit and loss · ${report.period.label}`}
      note={
        <>
          {pnl.sourcedOrders} of {pnl.orderCount} orders have a supplier cost
          {pnl.unsourcedOrders > 0 && <span className="text-ember"> · {pnl.unsourcedOrders} still open</span>}
        </>
      }
    >
      <Fold title="Revenue" total={pnl.netRevenueNgn} defaultOpen>
        <Line label="Gross sales" amount={pnl.grossSalesNgn} />
        <Line label="Loyalty discounts" amount={-pnl.loyaltyDiscountNgn} hide={pnl.loyaltyDiscountNgn === 0} />
        <Line label="Gift cards redeemed" amount={-pnl.giftCardDiscountNgn} hide={pnl.giftCardDiscountNgn === 0} />
        <Line label="Other adjustments" amount={pnl.otherAdjustmentsNgn} hide={pnl.otherAdjustmentsNgn === 0} />
        <Line label="Amount charged" amount={pnl.chargedNgn} strong />
        <Line
          label="of which, Flutterwave"
          amount={pnl.chargedNgn - pnl.bankChargedNgn}
          hide={pnl.bankChargedNgn === 0}
        />
        <Line
          label="of which, Access Bank transfer"
          amount={pnl.bankChargedNgn}
          hide={pnl.bankChargedNgn === 0}
          hint={pnl.bankOrderCount === 1 ? '1 order, credited in full' : `${pnl.bankOrderCount} orders, credited in full`}
        />
        <Line label="Refunds" amount={-pnl.refundedNgn} hide={pnl.refundedNgn === 0} />
      </Fold>
      <Fold title="Cost of goods" total={-pnl.cogsNgn}>
        <Line label="Supplier cost, recorded" amount={-pnl.supplierCostNgn} />
        <Line
          label="Supplier cost, estimated"
          amount={-pnl.estimatedCostNgn}
          hide={pnl.estimatedCostNgn === 0}
          hint="Routed quote, used where no cost has been entered"
        />
      </Fold>
      <Fold title="Operating costs" total={-operating}>
        <Line label="Referral commissions earned" amount={-pnl.commissionsAccruedNgn} />
        <Line
          label="Flutterwave (2% + VAT)"
          amount={-pnl.flutterwaveNgn}
          hide={pnl.flutterwaveNgn === 0}
          hint="Checkout collections only. Access Bank transfers are not included."
        />
        <Line label="Access Bank (payout, account fee, alerts)" amount={-pnl.accessNgn} hide={pnl.accessNgn === 0} />
        <Line
          label="Loyalty points earned"
          amount={-pnl.loyaltyAccruedNgn}
          hide={pnl.loyaltyAccruedNgn === 0}
          hint={
            pnl.loyaltyPointsAwarded > 0
              ? `${pnl.loyaltyPointsAwarded.toLocaleString()} pts booked at ₦2.50 each`
              : undefined
          }
        />
        <Line
          label="Rewards fulfilled above points"
          amount={-rewardFulfillment}
          hide={rewardFulfillment === 0}
          hint={
            pnl.loyaltyReleasedNgn > 0
              ? `${formatNgn(pnl.loyaltyReleasedNgn)} of liability released on redeem`
              : undefined
          }
        />
      </Fold>
      <div className="flex items-center justify-between bg-obsidian px-4 py-4 text-white">
        <span>
          <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-white/50">Net profit</span>
          <span className="mt-0.5 block text-[11px] text-white/55">
            Gross margin {pnl.grossMarginPct}% · net margin {pnl.netMarginPct}%
          </span>
        </span>
        <span className="text-xl font-bold tabular-nums">{money(pnl.netProfitNgn)}</span>
      </div>
      <About>
        Net profit is after Flutterwave’s fee on checkout collections, Access Bank’s cost of paying suppliers,
        commissions earned, loyalty points accrued and any reward fulfilment above those points. A transfer into the
        Access Bank account is credited in full. {formatNgn(pnl.commissionsPaidNgn)} of the commissions were paid in
        the period. Cash here is what customers paid, minus refunds and commissions marked paid — supplier invoices and
        the bank balance are not in this ledger.
      </About>
    </Ledger>
  );
}

function moved(point: AccountingReport['trend'][number]): boolean {
  return (
    point.orderCount !== 0 ||
    point.netRevenueNgn !== 0 ||
    point.commissionsAccruedNgn !== 0 ||
    point.commissionsPaidNgn !== 0
  );
}

function Trend({ report, activeOnly }: { report: AccountingReport; activeOnly: boolean }) {
  const rows = activeOnly ? report.trend.filter(moved) : report.trend;
  const max = Math.max(...rows.map((p) => Math.abs(p.netProfitNgn)), 1);
  const empty = rows.length === 0 || rows.every((p) => !moved(p));
  if (empty) {
    return (
      <p className="px-4 py-6 text-sm text-obsidian/45">
        {activeOnly ? 'No period in this window had a transaction.' : 'Nothing recognized in this window.'}
      </p>
    );
  }

  return (
    <div className="max-h-[28rem] overflow-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="sticky top-0 bg-paper text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40">
          <tr>
            <th className="px-4 py-3 text-left font-black">Period</th>
            <th className="px-3 py-3 text-right font-black">Orders</th>
            <th className="px-3 py-3 text-right font-black">Net revenue</th>
            <th className="px-3 py-3 text-right font-black">Cost</th>
            <th className="px-3 py-3 text-right font-black">Paid out</th>
            <th className="px-3 py-3 text-right font-black">Net profit</th>
            <th className="px-4 py-3 text-left font-black"> </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((point) => (
            <tr key={point.key} className="border-t border-obsidian/6">
              <td className="px-4 py-2.5 font-medium text-obsidian">{point.label}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-obsidian/70">{point.orderCount}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{money(point.netRevenueNgn)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-obsidian/70">{money(point.cogsNgn)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-obsidian/70">{money(point.commissionsPaidNgn)}</td>
              <td className={`px-3 py-2.5 text-right font-semibold tabular-nums ${point.netProfitNgn < 0 ? 'text-ember' : 'text-obsidian'}`}>
                {money(point.netProfitNgn)}
              </td>
              <td className="w-36 px-4 py-2.5">
                <div className="h-1.5 overflow-hidden rounded-full bg-obsidian/[0.06]">
                  <div
                    className={`h-full rounded-full ${point.netProfitNgn < 0 ? 'bg-ember' : 'bg-obsidian'}`}
                    style={{ width: point.netProfitNgn === 0 ? '0%' : `${Math.max(6, (Math.abs(point.netProfitNgn) / max) * 100)}%` }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Balance({ report }: { report: AccountingReport }) {
  const b = report.balance;
  const assets: { label: string; amount: number; hint?: string; keep?: boolean }[] = [
    { label: 'Collected from customers', amount: b.cashCollectedNgn, hint: 'Net of refunds, all time', keep: true },
    { label: 'Commissions already paid', amount: -b.commissionsPaidLifetimeNgn },
    { label: 'Cash retained', amount: b.cashRetainedNgn, keep: true },
    {
      label: 'Stock on hand, at cost',
      amount: b.inventoryNgn,
      hint: b.uncostedUnits > 0 ? `${b.uncostedUnits} tracked units have no cost, so they are left out` : `${b.costedUnits} units costed`,
      keep: true,
    },
    {
      label: 'Awaiting payment',
      amount: b.receivablesNgn,
      hint: b.receivableOrders > 0 ? `${b.receivableOrders} order${b.receivableOrders === 1 ? '' : 's'}` : undefined,
    },
  ].filter((row) => row.keep || row.amount !== 0);
  const liabilities: { label: string; amount: number; hint?: string }[] = [
    { label: 'Commissions still to pay', amount: b.commissionsPayableNgn },
    { label: 'Gift cards still live', amount: b.giftCardsNgn, hint: b.giftCardCount > 0 ? `${b.giftCardCount} cards` : undefined },
    {
      label: 'Loyalty points outstanding',
      amount: b.loyaltyPointsLiabilityNgn,
      hint:
        b.loyaltyPointsOutstanding > 0
          ? `${b.loyaltyPointsOutstanding.toLocaleString()} pts · ${b.loyaltyMemberCount} member${b.loyaltyMemberCount === 1 ? '' : 's'} · ₦2.50 each`
          : undefined,
    },
    {
      label: 'Rewards not yet handed over',
      amount: b.rewardsOutstandingNgn,
      hint: b.rewardsOutstandingCount > 0 ? `${b.rewardsOutstandingCount} issued` : undefined,
    },
  ].filter((row) => row.amount !== 0);

  return (
    <Ledger title="Balance sheet · as of now" note="This position does not change with the period.">
      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-obsidian/8">
        <Fold title="Assets" total={b.assetsNgn} defaultOpen>
          {assets.map((row) => (
            <Line key={row.label} label={row.label} amount={row.amount} hint={row.hint} />
          ))}
        </Fold>
        <Fold title="Liabilities" total={b.liabilitiesNgn} defaultOpen>
          {liabilities.length === 0 ? (
            <p className="px-4 py-3 text-sm text-obsidian/45">Nothing outstanding.</p>
          ) : (
            liabilities.map((row) => <Line key={row.label} label={row.label} amount={row.amount} hint={row.hint} />)
          )}
        </Fold>
      </div>
      <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-white/10 bg-obsidian text-white">
        <div className="px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">Equity</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{money(b.equityNgn)}</p>
        </div>
        <div className="px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">Lifetime net profit</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{money(b.lifetimeNetProfitNgn)}</p>
        </div>
      </div>
      <About>
        Equity is assets minus liabilities. Lifetime net profit is collections minus recorded supplier cost, commissions
        earned, rewards fulfilled and loyalty points still owed. Supplier cost all time is{' '}
        {formatNgn(b.supplierCostLifetimeNgn)}, and it is not taken off cash, because the desk does not record when a
        supplier was paid.
      </About>
    </Ledger>
  );
}

function Payouts({ report }: { report: AccountingReport }) {
  return (
    <Ledger title="Referral payouts" note="Paid and referred sales follow the period. Still owed is everything approved and unpaid.">
      {report.payouts.length === 0 ? (
        <p className="px-4 py-6 text-sm text-obsidian/45">No partner was paid or is owed in this view.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-paper text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40">
              <tr>
                <th className="px-4 py-3 text-left font-black">Partner</th>
                <th className="px-3 py-3 text-right font-black">Referred sales</th>
                <th className="px-3 py-3 text-right font-black">Paid in period</th>
                <th className="px-4 py-3 text-right font-black">Still owed</th>
              </tr>
            </thead>
            <tbody>
              {report.payouts.map((row) => (
                <tr key={row.id} className="border-t border-obsidian/6">
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-obsidian">{row.name}</span>
                    <span className="ml-2 text-[11px] uppercase tracking-wider text-obsidian/35">{row.kind}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{money(row.referredNgn)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{money(row.paidNgn)}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold tabular-nums ${row.owedNgn > 0 ? 'text-ember' : 'text-obsidian'}`}>
                    {money(row.owedNgn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Ledger>
  );
}

function Activity({ report }: { report: AccountingReport }) {
  const [view, setView] = useState<'trend' | 'providers' | 'suppliers'>('trend');
  const [activeOnly, setActiveOnly] = useState(false);
  const grain = report.trendGrain === 'day' ? 'By day' : report.trendGrain === 'week' ? 'By week' : 'By month';
  const activeLabel =
    report.trendGrain === 'day' ? 'Days with transactions' : report.trendGrain === 'week' ? 'Weeks with transactions' : 'Months with transactions';

  return (
    <Ledger
      title="Activity"
      note={report.trendCapped ? 'The chart is the latest stretch. Profit and loss covers the full period.' : undefined}
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={view}
            onChange={(e) => setView(e.target.value as typeof view)}
            aria-label="Activity view"
            className={`${adminInputClass} w-44 py-2`}
          >
            <option value="trend">{grain}</option>
            <option value="providers">By provider</option>
            <option value="suppliers">By supplier</option>
          </select>
          {view === 'trend' && (
            <button
              type="button"
              aria-pressed={activeOnly}
              onClick={() => setActiveOnly((on) => !on)}
              className={`rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] ring-1 ${
                activeOnly ? 'bg-obsidian text-white ring-obsidian' : 'text-obsidian/55 ring-obsidian/10 hover:text-obsidian'
              }`}
            >
              {activeLabel}
            </button>
          )}
        </div>
      }
    >
      {view === 'trend' && <Trend report={report} activeOnly={activeOnly} />}
      {view === 'providers' && (
        <MixTable
          rows={report.providers.map((row) => ({
            name: titleCase(row.name),
            orders: row.orders,
            primary: row.netNgn,
            secondary: null,
          }))}
          primaryLabel="Net"
          empty="No recognized orders in this period."
        />
      )}
      {view === 'suppliers' && (
        <MixTable
          rows={report.suppliers.map((row) => ({
            name: row.name,
            orders: row.orders,
            primary: row.netNgn - (row.costNgn ?? 0),
            secondary: row.netNgn,
          }))}
          primaryLabel="Profit"
          secondaryLabel="Revenue"
          empty="No recognized orders in this period."
        />
      )}
      {(report.wholesaleNgn > 0 || report.giftCardsIssuedNgn > 0) && (
        <About>
          {report.giftCardsIssuedNgn > 0 && (
            <span>
              Gift cards issued in the period: {formatNgn(report.giftCardsIssuedNgn)} across {report.giftCardsIssuedCount}.
              Redemptions already reduce revenue. Live cards sit on the balance sheet.{' '}
            </span>
          )}
          {report.wholesaleNgn > 0 && (
            <span>
              Partner wholesale recorded: {formatNgn(report.wholesaleNgn)} across {report.wholesaleOrders} orders. Those
              orders have no payment status, so they stay out of profit and cash.
            </span>
          )}
        </About>
      )}
    </Ledger>
  );
}

function MixTable({
  rows,
  primaryLabel,
  secondaryLabel,
  empty,
}: {
  rows: { name: string; orders: number; primary: number; secondary: number | null }[];
  primaryLabel: string;
  secondaryLabel?: string;
  empty: string;
}) {
  if (rows.length === 0) return <p className="px-4 py-6 text-sm text-obsidian/45">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-paper text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40">
          <tr>
            <th className="px-4 py-3 text-left font-black"> </th>
            <th className="px-3 py-3 text-right font-black">Orders</th>
            {secondaryLabel && <th className="px-3 py-3 text-right font-black">{secondaryLabel}</th>}
            <th className="px-4 py-3 text-right font-black">{primaryLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-obsidian/6">
              <td className="px-4 py-2.5 font-medium">{row.name}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-obsidian/60">{row.orders}</td>
              {secondaryLabel && <td className="px-3 py-2.5 text-right tabular-nums text-obsidian/70">{money(row.secondary ?? 0)}</td>}
              <td className={`px-4 py-2.5 text-right font-semibold tabular-nums ${row.primary < 0 ? 'text-ember' : ''}`}>
                {money(row.primary)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Ledger({
  title,
  note,
  toolbar,
  children,
}: {
  title: string;
  note?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-obsidian/10 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-obsidian/8 px-4 py-3">
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/45">{title}</h2>
          {note && <p className="mt-1 text-[11px] text-obsidian/45">{note}</p>}
        </div>
        {toolbar}
      </div>
      {children}
    </section>
  );
}

function Fold({
  title,
  total,
  defaultOpen = false,
  children,
}: {
  title: string;
  total: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-obsidian/8">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper/60"
      >
        <ChevronDown size={16} className={`shrink-0 text-obsidian/35 transition-transform ${open ? 'rotate-180' : ''}`} />
        <span className="flex-1 text-sm font-semibold text-obsidian">{title}</span>
        <span className={`text-sm font-semibold tabular-nums ${total < 0 ? 'text-ember' : 'text-obsidian'}`}>{money(total)}</span>
      </button>
      {open && <div className="border-t border-obsidian/6 bg-paper/40">{children}</div>}
    </div>
  );
}

function Line({
  label,
  amount,
  strong,
  hide,
  hint,
}: {
  label: string;
  amount: number;
  strong?: boolean;
  hide?: boolean;
  hint?: string;
}) {
  if (hide) return null;
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2 pl-11">
      <span className={strong ? 'text-sm font-semibold text-obsidian' : 'text-sm text-obsidian/70'}>
        {label}
        {hint && <span className="mt-0.5 block text-[11px] font-normal text-obsidian/40">{hint}</span>}
      </span>
      <span className={`shrink-0 text-sm tabular-nums ${strong ? 'font-semibold' : ''} ${amount < 0 ? 'text-ember' : 'text-obsidian'}`}>
        {money(amount)}
      </span>
    </div>
  );
}

function About({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-obsidian/8">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-obsidian/40 hover:text-obsidian"
      >
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        How this is built
      </button>
      {open && <p className="px-4 pb-4 text-[12px] leading-relaxed text-obsidian/55">{children}</p>}
    </div>
  );
}
