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
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      <header className="max-w-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ember">Refer &amp; earn</p>
        <h1 className="mt-2 font-wordmark text-3xl text-obsidian sm:text-4xl">Share the drinks. Earn on the order.</h1>
        <p className="mt-3 text-sm leading-relaxed text-obsidian/55">Create your referral link, share it, and track the orders credited to you.</p>
      </header>
      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="border border-obsidian/8 bg-white p-4">
            <Icon size={18} className="text-ember" />
            <h2 className="mt-3 text-sm font-bold text-obsidian">{title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-obsidian/50">{body}</p>
          </div>
        ))}
      </div>
      <div className="mt-7 max-w-2xl"><ReferApplyForm /></div>
    </div>
  );
}
