'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Copy } from 'lucide-react';
import { useUser } from '@/components/auth/AuthProvider';
import { formatNgn } from '@/lib/drinks/catalog';
import { KIND_LABELS, type AttributionStatus, type ReferralPartner } from '@/lib/referrals/repo';

type Earnings = {
  partner: ReferralPartner;
  orders: number;
  approvedNgn: number;
  paidNgn: number;
  referredRevenueNgn: number;
  recent: {
    id: string;
    orderId: string;
    orderTotalNgn: number;
    commissionNgn: number;
    status: AttributionStatus;
    createdAt: string;
  }[];
};

const STATUS_COPY: Record<AttributionStatus, string> = {
  pending: 'awaiting payment',
  approved: 'owed to you',
  paid: 'paid out',
  void: 'cancelled',
};

export default function ReferPortal() {
  const { user, loading: authLoading } = useUser();
  const [data, setData] = useState<Earnings | null>(null);
  const [noPartner, setNoPartner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/referrals/me');
        if (res.status === 401) {
          setLoading(false);
          return;
        }
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Unable to load your standing.');
        if (!body.partner) setNoPartner(true);
        else setData(body);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load your standing.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <p className="text-sm text-obsidian/45">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="bg-white border border-obsidian/10 p-6">
        <h2 className="font-semibold text-obsidian mb-2">Sign in to see your referrals</h2>
        <p className="text-sm text-obsidian/55 mb-4 leading-relaxed">
          Use the same email you applied with and we will connect your account automatically.
        </p>
        <Link href="/signin" className="btn-brand text-[11px] px-5 py-2.5 inline-block">
          Sign in
        </Link>
      </div>
    );
  }

  if (error) return <p className="text-sm text-ember">{error}</p>;

  if (noPartner || !data) {
    return (
      <div className="bg-white border border-obsidian/10 p-6">
        <h2 className="font-semibold text-obsidian mb-2">You are not a partner yet</h2>
        <p className="text-sm text-obsidian/55 mb-4 leading-relaxed">
          We could not find a referral partner under {user.email}. Apply and you will get a code
          straight away.
        </p>
        <Link href="/refer-and-earn" className="btn-brand text-[11px] px-5 py-2.5 inline-block">
          Apply to refer
        </Link>
      </div>
    );
  }

  const { partner } = data;
  const link = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${partner.code}` : '';

  return (
    <div className="space-y-8">
      <div className="bg-white border border-obsidian/10 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-obsidian/40 mb-1">Your code</p>
            <p className="font-wordmark-sm text-xl text-obsidian">{partner.code}</p>
            <p className="text-[11px] text-obsidian/45 mt-1">
              {KIND_LABELS[partner.kind]} · {partner.commissionPct}% commission
            </p>
          </div>
          <span
            className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 ${
              partner.status === 'active'
                ? 'badge-brand'
                : partner.status === 'pending'
                  ? 'bg-obsidian/10 text-obsidian/50'
                  : 'bg-ember/10 text-ember'
            }`}
          >
            {partner.status}
          </span>
        </div>

        {partner.status === 'pending' && (
          <p className="text-xs text-obsidian/55 leading-relaxed mb-4">
            Your account is under review. You can share your link now — orders are recorded against
            your code, and commission is confirmed once you are approved.
          </p>
        )}

        <div className="flex items-center gap-2">
          <code className="flex-1 text-[12px] bg-paper border border-obsidian/10 px-3 py-2 overflow-x-auto whitespace-nowrap">
            {link}
          </code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="btn-brand text-[11px] px-3 py-2 inline-flex items-center gap-1.5 shrink-0"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-obsidian/10 border border-obsidian/10">
        {[
          ['Referred orders', String(data.orders)],
          ['They spent', formatNgn(data.referredRevenueNgn)],
          ['Owed to you', formatNgn(data.approvedNgn)],
          ['Paid out', formatNgn(data.paidNgn)],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-4">
            <dt className="text-[10px] uppercase tracking-wider text-obsidian/40">{label}</dt>
            <dd className="text-lg font-bold text-obsidian mt-1 tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40 mb-3">
          Recent referrals
        </h2>
        {data.recent.length === 0 ? (
          <p className="text-sm text-obsidian/45">
            Nothing yet. Share your link and orders will show up here.
          </p>
        ) : (
          <ul className="border-t border-obsidian/10">
            {data.recent.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-baseline justify-between gap-3 py-3 border-b border-obsidian/10"
              >
                <div className="min-w-0">
                  <p className="text-sm text-obsidian">
                    Order {r.orderId.slice(0, 8)}
                    <span className="text-obsidian/40"> · {STATUS_COPY[r.status]}</span>
                  </p>
                  <p className="text-[11px] text-obsidian/40">
                    {new Date(r.createdAt).toLocaleDateString()}
                    {r.orderTotalNgn > 0 && <> · order {formatNgn(r.orderTotalNgn)}</>}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums shrink-0 ${
                    r.status === 'void' ? 'text-obsidian/30 line-through' : 'text-obsidian'
                  }`}
                >
                  {r.status === 'pending' ? '—' : formatNgn(r.commissionNgn)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
