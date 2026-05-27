'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, CalendarCheck, Users, ArrowRight } from 'lucide-react';
import { useAdmin } from './layout';

type Stats = {
  inquiries: { new: number; total: number };
  reservations: { pending: number; today: number };
  members: { active: number; total: number };
  waitlist: number;
};

export default function AdminDashboard() {
  const { secret } = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!secret) return;
    Promise.all([
      fetch('/api/inquiries', { headers: { 'x-admin-secret': secret } }).then(r => r.ok ? r.json() : null),
      fetch('/api/reservations', { headers: { 'x-admin-secret': secret } }).then(r => r.ok ? r.json() : null),
      fetch('/api/members', { headers: { 'x-admin-secret': secret } }).then(r => r.ok ? r.json() : null),
      fetch('/api/waitlist', { headers: { 'x-admin-secret': secret } }).then(r => r.ok ? r.json() : null),
    ]).then(([inq, res, mem, wl]) => {
      const today = new Date().toISOString().slice(0, 10);
      setStats({
        inquiries: {
          new: inq?.inquiries?.filter((i: { status: string }) => i.status === 'new').length ?? 0,
          total: inq?.inquiries?.length ?? 0,
        },
        reservations: {
          pending: res?.reservations?.filter((r: { status: string }) => r.status === 'pending').length ?? 0,
          today: res?.reservations?.filter((r: { reservation_date: string }) => r.reservation_date === today).length ?? 0,
        },
        members: {
          active: mem?.members?.filter((m: { status: string }) => m.status === 'active').length ?? 0,
          total: mem?.members?.length ?? 0,
        },
        waitlist: wl?.waitlist?.length ?? 0,
      });
    }).finally(() => setLoading(false));
  }, [secret]);

  const cards = [
    { href: '/admin/inquiries', icon: Mail, label: 'Inquiries', value: stats?.inquiries.new ?? '—', sub: `${stats?.inquiries.total ?? 0} total`, badge: (stats?.inquiries.new ?? 0) > 0 ? 'New' : null },
    { href: '/admin/reservations', icon: CalendarCheck, label: 'Reservations', value: stats?.reservations.pending ?? '—', sub: `${stats?.reservations.today ?? 0} today`, badge: null },
    { href: '/admin/members', icon: Users, label: 'Members', value: stats?.members.active ?? '—', sub: `${stats?.waitlist ?? 0} on waitlist`, badge: null },
  ];

  return (
    <div>
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a84c]/50 mb-1">Welcome back</p>
        <h1 className="text-3xl font-light italic text-[#f5f0e8]">Dashboard</h1>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-[#c9a84c]/10 p-6 animate-pulse">
              <div className="h-3 w-20 bg-[#c9a84c]/10 rounded mb-4" />
              <div className="h-8 w-12 bg-[#c9a84c]/10 rounded mb-2" />
              <div className="h-3 w-16 bg-[#c9a84c]/5 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {cards.map(({ href, icon: Icon, label, value, sub, badge }) => (
            <Link key={href} href={href} className="border border-[#c9a84c]/10 hover:border-[#c9a84c]/30 p-6 group transition-colors block">
              <div className="flex items-start justify-between mb-4">
                <Icon size={16} className="text-[#c9a84c]/50 group-hover:text-[#c9a84c] transition-colors" />
                {badge && <span className="text-[9px] font-black uppercase tracking-widest text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-0.5">{badge}</span>}
              </div>
              <p className="text-3xl font-light text-[#f5f0e8] mb-1">{value}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#f5f0e8]/30">{label}</p>
              <p className="text-xs text-[#f5f0e8]/20 mt-1">{sub}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { href: '/admin/inquiries', label: 'View all inquiries', desc: 'Review and respond to messages' },
          { href: '/admin/reservations', label: "Today's reservations", desc: 'Manage bookings and confirmations' },
          { href: '/admin/menu', label: 'Update the menu', desc: 'Edit dishes, drinks and prices' },
          { href: '/admin/events', label: 'Manage events', desc: 'Add or edit programming and events' },
          { href: '/admin/members', label: 'Convivium members', desc: 'Manage membership and waitlist' },
          { href: '/admin/media', label: 'Media library', desc: 'Upload images to Azure Blob Storage' },
        ].map(({ href, label, desc }) => (
          <Link key={href} href={href} className="flex items-center justify-between gap-4 border border-[#c9a84c]/10 hover:border-[#c9a84c]/25 p-5 group transition-colors">
            <div>
              <p className="text-sm text-[#f5f0e8]/80 group-hover:text-[#f5f0e8] transition-colors">{label}</p>
              <p className="text-xs text-[#f5f0e8]/30 mt-0.5">{desc}</p>
            </div>
            <ArrowRight size={14} className="text-[#c9a84c]/30 group-hover:text-[#c9a84c] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
