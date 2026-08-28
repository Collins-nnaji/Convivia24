'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import { KIND_LABELS, type AttributionStatus, type ReferralPartner } from '@/lib/referrals/repo';
import {
  BUDGET_LABELS,
  GOAL_LABELS,
  type BrandEnquiry,
} from '@/lib/trivia/enquiries';

type Attribution = {
  id: string;
  orderId: string;
  partnerName: string;
  partnerCode: string;
  orderTotalNgn: number;
  commissionNgn: number;
  commissionPct: number;
  status: AttributionStatus;
  createdAt: string;
  paidAt: string | null;
};

const ENQUIRY_STATUSES = ['new', 'contacted', 'won', 'closed'] as const;

export default function ReferralsDesk() {
  const [partners, setPartners] = useState<ReferralPartner[]>([]);
  const [attributions, setAttributions] = useState<Attribution[]>([]);
  const [enquiries, setEnquiries] = useState<BrandEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [refRes, brandRes] = await Promise.all([
        fetch('/api/admin/referrals'),
        fetch('/api/admin/brand-enquiries'),
      ]);
      const refData = await refRes.json();
      const brandData = await brandRes.json();
      if (!refRes.ok) throw new Error(refData.error || 'Unable to load referrals.');
      if (!brandRes.ok) throw new Error(brandData.error || 'Unable to load brand enquiries.');
      setPartners(refData.partners || []);
      setAttributions(refData.attributions || []);
      setEnquiries(brandData.enquiries || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function patchPartner(partnerId: string, patch: Record<string, unknown>) {
    setBusy(partnerId);
    try {
      const res = await fetch('/api/admin/referrals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to update partner.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update partner.');
    } finally {
      setBusy('');
    }
  }

  async function payCommission(a: Attribution, asGiftCard: boolean) {
    const label = asGiftCard ? 'issue a gift card for' : 'mark paid';
    if (!confirm(`${label} ${formatNgn(a.commissionNgn)} to ${a.partnerName}?`)) return;
    setBusy(a.id);
    try {
      const res = await fetch('/api/admin/referrals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pay',
          attributionId: a.id,
          asGiftCard,
          amountNgn: a.commissionNgn,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to pay that commission.');
      if (data.giftCardCode) alert(`Gift card issued: ${data.giftCardCode}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to pay that commission.');
    } finally {
      setBusy('');
    }
  }

  async function setEnquiryStatus(id: string, status: string) {
    setBusy(id);
    try {
      const res = await fetch('/api/admin/brand-enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to update that enquiry.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update that enquiry.');
    } finally {
      setBusy('');
    }
  }

  const owed = attributions.filter((a) => a.status === 'approved');
  const owedNgn = owed.reduce((n, a) => n + a.commissionNgn, 0);

  return (
    <div className="space-y-10">
      {error && <p className="text-sm text-ember">{error}</p>}

      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] text-obsidian/55">
          {partners.length} partners · {attributions.length} referred orders ·{' '}
          <span className={owedNgn > 0 ? 'text-ember font-semibold' : ''}>
            {formatNgn(owedNgn)} owed
          </span>
        </p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 text-[11px] text-obsidian/50 hover:text-obsidian"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* ── Partners ─────────────────────────────────── */}
      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40 mb-3">
          Partners
        </h2>
        {loading ? (
          <p className="text-sm text-obsidian/45">Loading…</p>
        ) : partners.length === 0 ? (
          <p className="text-sm text-obsidian/45">
            No applications yet. The form is at <code>/refer</code>.
          </p>
        ) : (
          <ul className="space-y-3">
            {partners.map((p) => (
              <li key={p.id} className="bg-white border border-obsidian/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-obsidian">
                      {p.code} · {p.company || p.name}
                    </p>
                    <p className="text-[11px] text-obsidian/45">
                      {KIND_LABELS[p.kind]} · {p.name} · {p.email}
                      {p.phone ? ` · ${p.phone}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <label className="inline-flex items-center gap-1 text-[11px] text-obsidian/50">
                      <input
                        type="number"
                        min={0}
                        max={25}
                        step={0.5}
                        defaultValue={p.commissionPct}
                        onBlur={(e) => {
                          const next = Number(e.target.value);
                          if (next !== p.commissionPct) patchPartner(p.id, { commissionPct: next });
                        }}
                        className="w-16 border border-obsidian/15 px-2 py-1 text-sm tabular-nums"
                      />
                      %
                    </label>
                    <select
                      value={p.status}
                      disabled={busy === p.id}
                      onChange={(e) => patchPartner(p.id, { status: e.target.value })}
                      className="border border-obsidian/15 px-2 py-1 text-[12px] bg-white"
                    >
                      <option value="pending">pending</option>
                      <option value="active">active</option>
                      <option value="suspended">suspended</option>
                    </select>
                  </div>
                </div>
                {p.status === 'pending' && (
                  <p className="text-[11px] text-ember mt-2">
                    Orders are recorded against this code, but set them active to confirm commission.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Commissions ──────────────────────────────── */}
      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40 mb-3">
          Referred orders
        </h2>
        {attributions.length === 0 ? (
          <p className="text-sm text-obsidian/45">Nothing referred yet.</p>
        ) : (
          <div className="overflow-x-auto border border-obsidian/10">
            <table className="w-full text-[12px] bg-white">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-obsidian/40 border-b border-obsidian/10">
                  <th className="p-2">Order</th>
                  <th className="p-2">Partner</th>
                  <th className="p-2 text-right">Order total</th>
                  <th className="p-2 text-right">Commission</th>
                  <th className="p-2">Status</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {attributions.map((a) => (
                  <tr key={a.id} className="border-b border-obsidian/5">
                    <td className="p-2 text-obsidian/70">{a.orderId.slice(0, 8)}</td>
                    <td className="p-2">
                      {a.partnerName}
                      <span className="text-obsidian/35"> · {a.partnerCode}</span>
                    </td>
                    <td className="p-2 text-right tabular-nums text-obsidian/60">
                      {a.orderTotalNgn > 0 ? formatNgn(a.orderTotalNgn) : '—'}
                    </td>
                    <td className="p-2 text-right tabular-nums font-semibold">
                      {a.status === 'pending' ? '—' : formatNgn(a.commissionNgn)}
                      <span className="text-obsidian/30 font-normal"> ({a.commissionPct}%)</span>
                    </td>
                    <td className="p-2">
                      <span
                        className={
                          a.status === 'approved'
                            ? 'text-ember font-semibold'
                            : a.status === 'void'
                              ? 'text-obsidian/30'
                              : 'text-obsidian/55'
                        }
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="p-2 text-right whitespace-nowrap">
                      {a.status === 'approved' && (
                        <>
                          <button
                            type="button"
                            disabled={busy === a.id}
                            onClick={() => payCommission(a, false)}
                            className="text-[11px] text-ember hover:underline mr-3"
                          >
                            Mark paid
                          </button>
                          <button
                            type="button"
                            disabled={busy === a.id}
                            onClick={() => payCommission(a, true)}
                            className="text-[11px] text-obsidian/50 hover:text-obsidian"
                          >
                            Gift card
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Brand enquiries ──────────────────────────── */}
      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40 mb-3">
          Brand enquiries ({enquiries.filter((e) => e.status === 'new').length} new)
        </h2>
        {enquiries.length === 0 ? (
          <p className="text-sm text-obsidian/45">
            None yet. The form is at the bottom of <code>/trivia</code>.
          </p>
        ) : (
          <ul className="space-y-3">
            {enquiries.map((e) => (
              <li key={e.id} className="bg-white border border-obsidian/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-obsidian">
                      {e.brand}
                      <span className="text-obsidian/40 font-normal"> · {GOAL_LABELS[e.goal]}</span>
                    </p>
                    <p className="text-[11px] text-obsidian/45">
                      {e.contactName} · {e.email}
                      {e.phone ? ` · ${e.phone}` : ''}
                      {e.budgetBand ? ` · ${BUDGET_LABELS[e.budgetBand]}` : ''}
                    </p>
                    {e.message && (
                      <p className="text-[12px] text-obsidian/60 mt-2 leading-relaxed">{e.message}</p>
                    )}
                  </div>
                  <select
                    value={e.status}
                    disabled={busy === e.id}
                    onChange={(ev) => setEnquiryStatus(e.id, ev.target.value)}
                    className="border border-obsidian/15 px-2 py-1 text-[12px] bg-white shrink-0"
                  >
                    {ENQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
