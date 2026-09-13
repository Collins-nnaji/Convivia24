import { BadgePercent, Link2, Wallet } from 'lucide-react';
import ReferApplyForm from '@/components/referrals/ReferApplyForm';
import { DEFAULT_COMMISSION_PCT } from '@/lib/referrals/codes';

const STEPS = [
  { icon: Link2, title: 'Share your link', body: 'Get a personal code and share it with clients, friends, or your audience.' },
  { icon: BadgePercent, title: 'They place an order', body: 'Orders made within 30 days of opening your link are credited to you.' },
  { icon: Wallet, title: 'You get paid', body: `Earn from ${DEFAULT_COMMISSION_PCT}% of the amount paid once the order clears.` },
];

export default function ReferEarnTab() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
      <header className="max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember">Refer &amp; earn</p>
        <h1 className="mt-1 font-wordmark text-2xl text-obsidian sm:text-4xl">Share the drinks. Earn on the order.</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-obsidian/60">Create your referral link, share it, and track the orders credited to you.</p>
      </header>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-obsidian/10 bg-white p-4">
            <Icon size={18} className="text-ember" />
            <h2 className="mt-3 text-[15px] font-bold text-obsidian">{title}</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-obsidian/55">{body}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 max-w-2xl"><ReferApplyForm /></div>
    </div>
  );
}
