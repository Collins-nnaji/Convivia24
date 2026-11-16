'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import { currentPeriod, shiftPeriod } from '@/lib/finance/profit-share';
import { useDesk } from './useDesk';
import { useDialogs } from './ui/DialogProvider';
import { DeskEmpty, deskField } from './ui/DeskContent';

type Payout = {
  id: string;
  kind: 'profit_share' | 'supplier' | 'other';
  payeeKey: string;
  payeeName: string;
  period: string | null;
  amountNgn: number;
  status: 'pending' | 'paid' | 'void';
  reference: string | null;
  note: string | null;
  createdAt: string;
  paidAt: string | null;
  paidBy: string | null;
};

type FinanceData = {
  period: { key: string; label: string; allTime: boolean; closed: boolean; current: boolean };
  retainPct: number;
  pnl: {
    netRevenueNgn: number;
    cogsNgn: number;
    grossProfitNgn: number;
    feesNgn: number;
    deliveryNgn: number;
    commissionsNgn: number;
    loyaltyNgn: number;
    expensesNgn: number;
    netProfitNgn: number;
    unsourcedOrders: number;
    orderCount: number;
  };
  share: {
    netProfitNgn: number;
    retainedNgn: number;
    distributableNgn: number;
    partnerPct: number;
    shares: { key: string; name: string; amountNgn: number; payoutId: string | null; status: string | null }[];
  };
  expenses: {
    id: string;
    spentOn: string;
    category: string;
    description: string;
    amountNgn: number;
    paidTo: string | null;
    reference: string | null;
    createdBy: string;
    voided: boolean;
    voidReason: string | null;
  }[];
  expensesByCategory: { category: string; totalNgn: number }[];
  payouts: Payout[];
  suppliers: { id: string; name: string; active: boolean; orders: number; owedNgn: number; paidNgn: number; queuedNgn: number; dueNgn: number }[];
  commissions: { count: number; owedNgn: number };
  categories: string[];
};

export type FinanceView = 'share' | 'expenses' | 'payouts';

const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
const KIND_LABEL: Record<Payout['kind'], string> = { profit_share: 'Profit share', supplier: 'Supplier', other: 'Other' };
const STATUS_TONE: Record<Payout['status'], string> = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  paid: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  void: 'bg-obsidian/5 text-obsidian/60 ring-obsidian/15',
};

/* ── Shared building blocks ─────────────────────────────────── */

function Stat({ label: l, value, tone, hint }: { label: string; value: string; tone?: string; hint?: string }) {
  return (
    <div className="bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-obsidian/60">{l}</p>
      <p className={`mt-0.5 text-xl font-bold tabular-nums ${tone ?? 'text-obsidian'}`}>{value}</p>
      {hint && <p className="text-[11px] text-obsidian/55">{hint}</p>}
    </div>
  );
}

function Stats({ children }: { children: ReactNode }) {
  return <div className="grid gap-px overflow-hidden rounded-lg border border-obsidian/15 bg-obsidian/15 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-obsidian/15">
      <header className="flex items-center justify-between gap-3 py-2">
        <h3 className="text-sm font-bold text-obsidian">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

const th = 'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-obsidian/60';
const td = 'px-3 py-2.5 align-middle';
const smallBtn = 'rounded-md border border-obsidian/20 bg-white px-2.5 py-1.5 text-xs font-semibold text-obsidian/80 hover:border-obsidian disabled:opacity-40';

/** Month arrows, a calendar month picker and an "All time" switch. `period` is YYYY-MM or 'all'. */
function PeriodPicker({ period, onChange }: { period: string; onChange: (p: string) => void }) {
  const now = currentPeriod();
  const all = period === 'all';
  const month = all ? now : period;
  const seg = (on: boolean) => `h-9 px-3 text-sm font-semibold ${on ? 'bg-obsidian text-white' : 'bg-white text-obsidian/75 hover:bg-obsidian/[0.05]'}`;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex overflow-hidden rounded-md border border-obsidian/20">
        <button type="button" onClick={() => onChange(now)} className={seg(period === now)}>This month</button>
        <button type="button" onClick={() => onChange(shiftPeriod(now, -1))} className={`${seg(period === shiftPeriod(now, -1))} border-l border-obsidian/15`}>Last month</button>
        <button type="button" onClick={() => onChange('all')} className={`${seg(all)} border-l border-obsidian/15`}>All time</button>
      </div>
      <div className={`inline-flex items-center overflow-hidden rounded-md border bg-white ${all ? 'border-obsidian/15 opacity-60' : 'border-obsidian/20'}`}>
        <button type="button" aria-label="Previous month" onClick={() => onChange(shiftPeriod(month, -1))} className="grid h-9 w-9 place-items-center hover:bg-obsidian/[0.05]">
          <ChevronLeft size={16} />
        </button>
        <input
          type="month"
          aria-label="Pick a month"
          value={all ? '' : month}
          max={now}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="h-9 w-[10.5rem] border-0 px-2 text-center text-sm font-semibold tabular-nums focus:ring-0"
        />
        <button
          type="button"
          aria-label="Next month"
          disabled={!all && month >= now}
          onClick={() => onChange(all ? now : shiftPeriod(month, 1))}
          className="grid h-9 w-9 place-items-center hover:bg-obsidian/[0.05] disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/** Pay / cancel controls for one pending payout: the reference is typed inline. */
function PayoutActions({ payout, busy, onPay, onVoid }: { payout: Payout; busy: boolean; onPay: (ref: string) => void; onVoid: (reason: string) => void }) {
  const [ref, setRef] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  if (payout.status !== 'pending') {
    return <span className="text-xs text-obsidian/60">{payout.reference ? `Ref ${payout.reference}` : payout.note || '—'}</span>;
  }
  if (cancelling) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why cancel?" className={`${deskField} h-8 w-40 py-1 text-xs`} />
        <button type="button" disabled={busy || !reason.trim()} onClick={() => onVoid(reason)} className={`${smallBtn} border-red-300 text-red-700`}>
          Cancel payout
        </button>
        <button type="button" onClick={() => setCancelling(false)} className={smallBtn}>
          Back
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Transfer reference" className={`${deskField} h-8 w-40 py-1 text-xs`} />
      <button type="button" disabled={busy || !ref.trim()} onClick={() => onPay(ref)} className="btn-brand h-8 rounded-md px-3 text-xs font-bold disabled:opacity-30">
        Mark paid
      </button>
      <button type="button" onClick={() => setCancelling(true)} className={smallBtn} aria-label="Cancel payout">
        ✕
      </button>
    </div>
  );
}

/* ── Desk ───────────────────────────────────────────────────── */

export default function FinanceDesk({ view }: { view: FinanceView }) {
  const [period, setPeriod] = useState(currentPeriod());
  const desk = useDesk<FinanceData>(`/api/admin/finance?period=${period}`);
  const { confirm } = useDialogs();
  const data = desk.data;

  const pay = (p: Payout, reference: string) => desk.save({ action: 'mark-paid', id: p.id, reference }, `${formatNgn(p.amountNgn)} to ${p.payeeName} marked paid.`);
  const voidPayout = (p: Payout, reason: string) => desk.save({ action: 'void-payout', id: p.id, reason }, 'Payout cancelled.');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodPicker period={period} onChange={setPeriod} />
        <button type="button" className={smallBtn} disabled={desk.loading || desk.busy} onClick={() => void desk.reload()}>
          {desk.loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      {desk.error && (
        <p role="alert" className="rounded-md border border-ember/30 bg-ember/5 px-3 py-2 text-sm text-ember">
          {desk.error}
        </p>
      )}
      {desk.message && (
        <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {desk.message}
        </p>
      )}
      {!data ? (
        desk.loading ? <p className="text-sm text-obsidian/60">Loading the books…</p> : null
      ) : view === 'share' ? (
        <ShareView data={data} busy={desk.busy} onClose={() => desk.save({ action: 'close-month', period }, 'Profit share lines refreshed for this month.')} onPay={pay} onVoid={voidPayout} />
      ) : view === 'expenses' ? (
        <ExpensesView
          data={data}
          busy={desk.busy}
          onAdd={(body) => desk.save({ action: 'add-expense', ...body }, 'Expense recorded.')}
          onVoid={async (id, reason) => {
            if (await confirm({ title: 'Void this expense?', message: 'It stays in the history but stops counting against profit.', confirmLabel: 'Void expense' })) {
              await desk.save({ action: 'void-expense', id, reason }, 'Expense voided.');
            }
          }}
        />
      ) : (
        <PayoutsView
          data={data}
          busy={desk.busy}
          onCreate={(body) => desk.save({ action: 'create-payout', ...body }, body.paid ? 'Payment recorded.' : 'Payout queued.')}
          onPay={pay}
          onVoid={voidPayout}
        />
      )}
    </div>
  );
}

/* ── Profit share ───────────────────────────────────────────── */

function ShareView({
  data,
  busy,
  onClose,
  onPay,
  onVoid,
}: {
  data: FinanceData;
  busy: boolean;
  onClose: () => void;
  onPay: (p: Payout, ref: string) => void;
  onVoid: (p: Payout, reason: string) => void;
}) {
  const { pnl, share, period } = data;
  const byId = new Map(data.payouts.map((p) => [p.id, p]));
  const loss = pnl.netProfitNgn <= 0;
  const waterfall: [string, number, string?][] = [
    ['Net revenue (after refunds)', pnl.netRevenueNgn],
    ['Supplier cost of goods', -pnl.cogsNgn],
    ['Payment fees', -pnl.feesNgn],
    ['Delivery (riders & couriers)', -pnl.deliveryNgn],
    ['Referral commissions', -pnl.commissionsNgn],
    ['Loyalty points earned', -pnl.loyaltyNgn],
    ['Operating expenses', -pnl.expensesNgn],
  ];

  return (
    <div className="space-y-4">
      <Stats>
        <Stat label="Net profit" value={formatNgn(pnl.netProfitNgn)} tone={loss ? 'text-red-600' : 'text-emerald-700'} hint={`${pnl.orderCount} paid orders`} />
        <Stat label={`Kept in business (${data.retainPct}%)`} value={formatNgn(share.retainedNgn)} hint="Buffer — always retained" />
        <Stat label="Shared with partners" value={formatNgn(share.distributableNgn)} hint={`${share.shares.length} partners × ${share.partnerPct}%`} />
        <Stat label="Each partner" value={formatNgn(share.shares[0]?.amountNgn ?? 0)} hint={period.allTime ? 'Across all months' : period.closed ? 'Month closed' : 'Month to date — still moving'} />
      </Stats>

      {pnl.unsourcedOrders > 0 && (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {pnl.unsourcedOrders} order{pnl.unsourcedOrders === 1 ? ' has' : 's have'} no supplier cost yet, so profit uses an estimate. Record the costs in{' '}
          <a href="/admin#fulfil" className="font-semibold underline">Orders › Fulfil</a> (step 2 on each order) before paying out.
        </p>
      )}

      <div className="grid gap-x-6 gap-y-4 xl:grid-cols-[1fr_1.3fr]">
        <Card title={`How ${period.label} profit is worked out`}>
          <table className="w-full text-sm">
            <tbody>
              {waterfall.map(([l, v]) => (
                <tr key={l} className="border-t border-obsidian/8 first:border-0">
                  <td className={td}>{l}</td>
                  <td className={`${td} text-right tabular-nums ${v < 0 ? 'text-obsidian/75' : 'font-semibold'}`}>{v < 0 ? `− ${formatNgn(-v)}` : formatNgn(v)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-obsidian/20 bg-obsidian/[0.03]">
                <td className={`${td} font-bold`}>Net profit</td>
                <td className={`${td} text-right font-bold tabular-nums ${loss ? 'text-red-600' : 'text-emerald-700'}`}>{formatNgn(pnl.netProfitNgn)}</td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card
          title="Partner shares"
          action={
            period.allTime ? (
              <span className="text-[11px] font-semibold text-obsidian/60">Payouts are created month by month</span>
            ) : period.closed ? (
              <button type="button" disabled={busy} onClick={onClose} className={smallBtn} title="Re-run the split against the latest books">
                Recalculate unpaid shares
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-obsidian/60">Payouts open when the month ends</span>
            )
          }
        >
          {share.shares.length === 0 ? (
            <DeskEmpty>No partners — add admin emails to CONVIVIA_ADMIN_EMAILS.</DeskEmpty>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-obsidian/[0.02]">
                <tr>
                  <th className={th}>Partner</th>
                  <th className={`${th} text-right`}>Share</th>
                  <th className={`${th} text-right`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {share.shares.map((s) => {
                  const payout = s.payoutId ? byId.get(s.payoutId) : undefined;
                  return (
                    <tr key={s.key} className="border-t border-obsidian/8">
                      <td className={td}>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-obsidian/60">{s.key}</p>
                      </td>
                      <td className={`${td} text-right font-semibold tabular-nums`}>
                        {formatNgn(payout?.amountNgn ?? s.amountNgn)}
                        <span className="block text-[11px] font-normal text-obsidian/60">{share.partnerPct}%</span>
                      </td>
                      <td className={`${td} text-right`}>
                        {payout ? (
                          payout.status === 'pending' ? (
                            <PayoutActions payout={payout} busy={busy} onPay={(ref) => onPay(payout, ref)} onVoid={(reason) => onVoid(payout, reason)} />
                          ) : (
                            <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${STATUS_TONE[payout.status]}`}>
                              {payout.status === 'paid' ? `Paid · ${payout.reference}` : 'Cancelled'}
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-obsidian/60">{loss ? 'No profit to share' : period.allTime ? 'All-time estimate' : period.closed ? 'Recalculate to create' : 'Preview'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <p className="border-t border-obsidian/8 px-4 py-2.5 text-xs text-obsidian/60">
            Each closed month creates one pending payout per partner automatically. Unpaid lines follow late refunds and expenses; paid lines are locked.
          </p>
        </Card>
      </div>
    </div>
  );
}

/* ── Expenses ───────────────────────────────────────────────── */

function ExpensesView({
  data,
  busy,
  onAdd,
  onVoid,
}: {
  data: FinanceData;
  busy: boolean;
  onAdd: (body: Record<string, string>) => Promise<boolean>;
  onVoid: (id: string, reason: string) => void;
}) {
  const [open, setOpen] = useState(data.expenses.length === 0);
  const [voiding, setVoiding] = useState<{ id: string; reason: string } | null>(null);
  const live = data.expenses.filter((e) => !e.voided);
  const total = live.reduce((n, e) => n + e.amountNgn, 0);
  const today = new Date(Date.now() + 3_600_000).toISOString().slice(0, 10);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (await onAdd(body)) form.reset();
  }

  return (
    <div className="space-y-4">
      <Stats>
        <Stat label={data.period.allTime ? 'Spent · all time' : `Spent in ${data.period.label}`} value={formatNgn(total)} hint={`${live.length} expense${live.length === 1 ? '' : 's'}`} />
        {data.expensesByCategory.slice(0, 3).map((c) => (
          <Stat key={c.category} label={label(c.category)} value={formatNgn(c.totalNgn)} hint={total > 0 ? `${Math.round((c.totalNgn / total) * 100)}% of spend` : undefined} />
        ))}
      </Stats>

      <Card
        title="Record an expense"
        action={
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="grid h-7 w-7 place-items-center rounded-md border border-obsidian/20 hover:border-obsidian" aria-label={open ? 'Hide form' : 'Show form'}>
            {open ? <Minus size={14} /> : <Plus size={14} />}
          </button>
        }
      >
        {open && (
          <form onSubmit={submit} className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
            <label className="text-xs font-semibold text-obsidian/70 lg:col-span-1">
              Date
              <input name="spentOn" type="date" required defaultValue={today} max={today} className={`${deskField} mt-1`} />
            </label>
            <label className="text-xs font-semibold text-obsidian/70 lg:col-span-1">
              Category
              <select name="category" required defaultValue="" className={`${deskField} mt-1`}>
                <option value="" disabled>Choose…</option>
                {data.categories.map((c) => (
                  <option key={c} value={c}>{label(c)}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-obsidian/70 sm:col-span-2 lg:col-span-2">
              What was it for
              <input name="description" required maxLength={300} placeholder="e.g. Instagram ads, November" className={`${deskField} mt-1`} />
            </label>
            <label className="text-xs font-semibold text-obsidian/70 lg:col-span-1">
              Amount (₦)
              <input name="amountNgn" type="number" min={1} required inputMode="numeric" className={`${deskField} mt-1 tabular-nums`} />
            </label>
            <label className="text-xs font-semibold text-obsidian/70 lg:col-span-1">
              Paid to
              <input name="paidTo" maxLength={200} placeholder="Optional" className={`${deskField} mt-1`} />
            </label>
            <label className="text-xs font-semibold text-obsidian/70 sm:col-span-2 lg:col-span-2">
              Receipt / transfer reference
              <input name="reference" maxLength={120} placeholder="Optional" className={`${deskField} mt-1`} />
            </label>
            <div className="flex items-end sm:col-span-2 lg:col-span-4">
              <button type="submit" disabled={busy} className="btn-brand h-10 rounded-md px-4 text-sm font-bold disabled:opacity-40">
                {busy ? 'Saving…' : 'Add expense'}
              </button>
              <p className="ml-3 text-xs text-obsidian/60">Expenses reduce net profit before the partner split.</p>
            </div>
          </form>
        )}
      </Card>

      <Card title={`Expenses · ${data.period.label}`}>
        {data.expenses.length === 0 ? (
          <p className="px-4 py-4 text-sm text-obsidian/60">Nothing recorded for this month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-obsidian/[0.02]">
                <tr>
                  <th className={th}>Date</th>
                  <th className={th}>Category</th>
                  <th className={th}>Description</th>
                  <th className={th}>Paid to</th>
                  <th className={`${th} text-right`}>Amount</th>
                  <th className={`${th} text-right`} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {data.expenses.map((e) => (
                  <tr key={e.id} className={`border-t border-obsidian/8 ${e.voided ? 'text-obsidian/60 line-through' : ''}`}>
                    <td className={`${td} tabular-nums`}>{e.spentOn}</td>
                    <td className={td}>
                      <span className="rounded bg-obsidian/[0.06] px-1.5 py-0.5 text-xs font-semibold">{label(e.category)}</span>
                    </td>
                    <td className={td}>
                      {e.description}
                      {e.reference && <span className="block text-xs text-obsidian/55">Ref {e.reference}</span>}
                      {e.voided && <span className="block text-xs no-underline">Voided: {e.voidReason}</span>}
                    </td>
                    <td className={td}>{e.paidTo || '—'}</td>
                    <td className={`${td} text-right font-semibold tabular-nums`}>{formatNgn(e.amountNgn)}</td>
                    <td className={`${td} text-right`}>
                      {!e.voided &&
                        (voiding?.id === e.id ? (
                          <span className="inline-flex gap-1.5">
                            <input value={voiding.reason} onChange={(ev) => setVoiding({ id: e.id, reason: ev.target.value })} placeholder="Reason" className={`${deskField} h-8 w-32 py-1 text-xs`} />
                            <button type="button" disabled={busy || !voiding.reason.trim()} onClick={() => onVoid(e.id, voiding.reason)} className={`${smallBtn} border-red-300 text-red-700`}>
                              Void
                            </button>
                          </span>
                        ) : (
                          <button type="button" onClick={() => setVoiding({ id: e.id, reason: '' })} className={smallBtn}>
                            Void
                          </button>
                        ))}
                    </td>
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

/* ── Payouts ────────────────────────────────────────────────── */

function PayoutsView({
  data,
  busy,
  onCreate,
  onPay,
  onVoid,
}: {
  data: FinanceData;
  busy: boolean;
  onCreate: (body: Record<string, unknown>) => Promise<boolean>;
  onPay: (p: Payout, ref: string) => void;
  onVoid: (p: Payout, reason: string) => void;
}) {
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [form, setForm] = useState<{ kind: 'supplier' | 'other'; payeeKey: string; payeeName: string; amount: string; reference: string; note: string } | null>(null);
  const pending = data.payouts.filter((p) => p.status === 'pending');
  const rows = filter === 'pending' ? pending : data.payouts;
  const pendingTotal = pending.reduce((n, p) => n + p.amountNgn, 0);
  const supplierDue = data.suppliers.reduce((n, s) => n + s.dueNgn, 0);

  async function submit(paid: boolean) {
    if (!form) return;
    const ok = await onCreate({
      kind: form.kind,
      payeeKey: form.payeeKey,
      payeeName: form.payeeName,
      amountNgn: form.amount,
      reference: form.reference,
      note: form.note,
      paid,
    });
    if (ok) setForm(null);
  }

  return (
    <div className="space-y-4">
      <Stats>
        <Stat label="Waiting to be paid" value={formatNgn(pendingTotal)} tone={pendingTotal > 0 ? 'text-amber-700' : undefined} hint={`${pending.length} payout${pending.length === 1 ? '' : 's'}`} />
        <Stat label="Owed to suppliers" value={formatNgn(supplierDue)} hint="Costed orders not yet settled" />
        <Stat label="Referral commissions owed" value={formatNgn(data.commissions.owedNgn)} hint={`${data.commissions.count} approved — pay in Customers › Referrals`} />
        <Stat label={`Paid out · ${data.period.label}`} value={formatNgn(data.payouts.filter((p) => p.status === 'paid').reduce((n, p) => n + p.amountNgn, 0))} />
      </Stats>

      <Card title="Supplier balances">
        {data.suppliers.length === 0 ? (
          <p className="px-4 py-4 text-sm text-obsidian/60">No suppliers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-obsidian/[0.02]">
                <tr>
                  <th className={th}>Supplier</th>
                  <th className={`${th} text-right`}>Costed orders</th>
                  <th className={`${th} text-right`}>Total cost</th>
                  <th className={`${th} text-right`}>Paid</th>
                  <th className={`${th} text-right`}>Queued</th>
                  <th className={`${th} text-right`}>Due now</th>
                  <th className={`${th} text-right`} aria-label="Pay" />
                </tr>
              </thead>
              <tbody>
                {data.suppliers.map((s) => (
                  <tr key={s.id} className="border-t border-obsidian/8">
                    <td className={`${td} font-semibold`}>
                      {s.name}
                      {!s.active && <span className="ml-1.5 text-xs font-normal text-obsidian/55">paused</span>}
                    </td>
                    <td className={`${td} text-right tabular-nums`}>{s.orders}</td>
                    <td className={`${td} text-right tabular-nums`}>{formatNgn(s.owedNgn)}</td>
                    <td className={`${td} text-right tabular-nums`}>{formatNgn(s.paidNgn)}</td>
                    <td className={`${td} text-right tabular-nums`}>{formatNgn(s.queuedNgn)}</td>
                    <td className={`${td} text-right font-bold tabular-nums ${s.dueNgn > 0 ? 'text-amber-700' : 'text-obsidian/60'}`}>{formatNgn(s.dueNgn)}</td>
                    <td className={`${td} text-right`}>
                      <button
                        type="button"
                        disabled={s.dueNgn <= 0}
                        onClick={() => setForm({ kind: 'supplier', payeeKey: s.id, payeeName: s.name, amount: String(s.dueNgn), reference: '', note: `Settlement for ${s.orders} costed orders` })}
                        className={smallBtn}
                      >
                        Pay balance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-obsidian/8 px-4 py-2.5 text-xs text-obsidian/60">
          A supplier&apos;s balance grows automatically whenever an order&apos;s supplier cost is recorded on an order in Orders › Fulfil.
        </p>
      </Card>

      <Card
        title="New payout"
        action={
          <button
            type="button"
            onClick={() => setForm(form ? null : { kind: 'other', payeeKey: '', payeeName: '', amount: '', reference: '', note: '' })}
            aria-expanded={Boolean(form)}
            aria-label={form ? 'Hide form' : 'Show form'}
            className="grid h-7 w-7 place-items-center rounded-md border border-obsidian/20 hover:border-obsidian"
          >
            {form ? <Minus size={14} /> : <Plus size={14} />}
          </button>
        }
      >
        {form && (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
            <label className="text-xs font-semibold text-obsidian/70">
              Type
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as 'supplier' | 'other', payeeKey: '', payeeName: '' })}
                className={`${deskField} mt-1`}
              >
                <option value="supplier">Supplier</option>
                <option value="other">Other (user, contractor…)</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-obsidian/70 lg:col-span-2">
              Pay to
              {form.kind === 'supplier' ? (
                <select
                  value={form.payeeKey}
                  onChange={(e) => setForm({ ...form, payeeKey: e.target.value, payeeName: data.suppliers.find((s) => s.id === e.target.value)?.name || '' })}
                  className={`${deskField} mt-1`}
                >
                  <option value="">Choose a supplier…</option>
                  {data.suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <input value={form.payeeName} onChange={(e) => setForm({ ...form, payeeName: e.target.value })} placeholder="Name or email" className={`${deskField} mt-1`} />
              )}
            </label>
            <label className="text-xs font-semibold text-obsidian/70">
              Amount (₦)
              <input type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={`${deskField} mt-1 tabular-nums`} />
            </label>
            <label className="text-xs font-semibold text-obsidian/70 lg:col-span-2">
              Transfer reference <span className="font-normal text-obsidian/55">(if already paid)</span>
              <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className={`${deskField} mt-1`} />
            </label>
            <label className="text-xs font-semibold text-obsidian/70 sm:col-span-2 lg:col-span-4">
              Note
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={300} className={`${deskField} mt-1`} />
            </label>
            <div className="flex items-end gap-2 sm:col-span-2">
              <button type="button" disabled={busy || !form.amount} onClick={() => void submit(false)} className={`${smallBtn} h-10 px-3`}>
                Queue for later
              </button>
              <button type="button" disabled={busy || !form.amount || !form.reference.trim()} onClick={() => void submit(true)} className="btn-brand h-10 rounded-md px-4 text-sm font-bold disabled:opacity-30">
                Record as paid
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card
        title="Payout log"
        action={
          <div className="inline-flex overflow-hidden rounded-md border border-obsidian/20 text-xs font-semibold">
            {(['pending', 'all'] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={`px-2.5 py-1 ${filter === f ? 'bg-obsidian text-white' : 'bg-white text-obsidian/70'}`}>
                {f === 'pending' ? `Pending (${pending.length})` : 'All'}
              </button>
            ))}
          </div>
        }
      >
        {rows.length === 0 ? (
          <p className="px-4 py-4 text-sm text-obsidian/60">{filter === 'pending' ? 'Nothing waiting to be paid.' : 'No payouts yet.'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-obsidian/[0.02]">
                <tr>
                  <th className={th}>Payee</th>
                  <th className={th}>Type</th>
                  <th className={th}>For</th>
                  <th className={`${th} text-right`}>Amount</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Action / reference</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t border-obsidian/8">
                    <td className={td}>
                      <p className="font-semibold">{p.payeeName}</p>
                      {p.kind === 'profit_share' && <p className="text-xs text-obsidian/55">{p.payeeKey}</p>}
                    </td>
                    <td className={td}>{KIND_LABEL[p.kind]}</td>
                    <td className={`${td} text-xs text-obsidian/70`}>{p.period ? `${p.period} · ` : ''}{p.note || '—'}</td>
                    <td className={`${td} text-right font-semibold tabular-nums`}>{formatNgn(p.amountNgn)}</td>
                    <td className={td}>
                      <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${STATUS_TONE[p.status]}`}>{label(p.status === 'void' ? 'cancelled' : p.status)}</span>
                      {p.paidAt && <span className="block text-[11px] text-obsidian/55">{new Date(p.paidAt).toLocaleDateString('en-NG')}</span>}
                    </td>
                    <td className={`${td} text-right`}>
                      <PayoutActions payout={p} busy={busy} onPay={(ref) => onPay(p, ref)} onVoid={(reason) => onVoid(p, reason)} />
                    </td>
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
