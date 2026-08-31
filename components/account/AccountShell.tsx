'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bookmark,
  ChevronRight,
  CreditCard,
  Gift,
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  Sparkles,
  Target,
  User,
} from 'lucide-react';
import { useUser } from '@/components/auth/AuthProvider';
import AccountOverview from '@/components/account/AccountOverview';
import TasteProfilePanel from '@/components/account/TasteProfilePanel';
import SavedBottles from '@/components/account/SavedBottles';
import { useTriviaHub } from '@/components/trivia/use-hub';

type Section = 'overview' | 'taste' | 'saved';

/** In-page sections, and the places the account links out to. */
const SECTIONS: { id: Section; label: string; icon: typeof User }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'taste', label: 'Taste profile', icon: Sparkles },
  { id: 'saved', label: 'Saved bottles', icon: Heart },
];

const LINKS: { href: string; label: string; icon: typeof User }[] = [
  { href: '/orders', label: 'Orders', icon: Package },
  { href: '/discover#challenges', label: 'Challenges', icon: Target },
  { href: '/discover?tab=rewards-shop', label: 'Rewards shop', icon: Gift },
  { href: '/guest-card', label: 'Guest Card', icon: CreditCard },
];

export default function AccountShell() {
  const { user, loading, signOut } = useUser();
  const router = useRouter();
  const params = useSearchParams();
  const hub = useTriviaHub();
  const [editing, setEditing] = useState(false);

  const sectionParam = params.get('section');
  const section: Section =
    sectionParam === 'taste' || sectionParam === 'saved' ? sectionParam : 'overview';

  function selectSection(next: Section) {
    router.replace(next === 'overview' ? '/my-account' : `/my-account?section=${next}`, { scroll: false });
  }

  if (!loading && !user) {
    return (
      <section className="bg-paper min-h-[70vh]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
          <h1 className="font-logo font-black uppercase tracking-tight text-3xl brand-text">My account</h1>
          <p className="text-obsidian/55 mt-4 max-w-md leading-relaxed">
            Sign in to see your points, taste profile, orders and saved bottles.
          </p>
          <Link
            href="/signin?next=%2Fmy-account"
            className="mt-6 inline-block px-6 py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
          >
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12 grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-10 items-start">
        <aside className="lg:sticky lg:top-24">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/35 mb-3 px-3">
            My account
          </p>

          <nav className="bg-white border border-obsidian/8">
            <ul className="divide-y divide-obsidian/6">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => selectSection(id)}
                    className={`relative w-full px-4 py-3 flex items-center gap-3 text-sm transition-colors ${
                      section === id
                        ? 'text-ember font-semibold bg-ember/[0.04]'
                        : 'text-obsidian/60 hover:text-ember'
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {label}
                    {section === id && (
                      <motion.span layoutId="account-nav" className="absolute inset-y-0 right-0 w-0.5 bg-ember" />
                    )}
                  </button>
                </li>
              ))}
              {LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="w-full px-4 py-3 flex items-center gap-3 text-sm text-obsidian/60 hover:text-ember transition-colors"
                  >
                    <Icon size={16} className="shrink-0" />
                    {label}
                    <ChevronRight size={13} className="ml-auto text-obsidian/20" />
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="w-full px-4 py-3 flex items-center gap-3 text-sm text-obsidian/60 hover:text-ember transition-colors"
                >
                  <LogOut size={16} className="shrink-0" /> Log out
                </button>
              </li>
            </ul>
          </nav>

          <div className="mt-4 brand-gradient text-white p-5">
            <p className="font-logo font-black uppercase tracking-tight text-lg">Refer &amp; earn</p>
            <p className="text-[12px] text-white/60 mt-1.5 leading-relaxed">
              Invite friends to Convivia24 and earn together.
            </p>
            <Link
              href="/refer-and-earn"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-obsidian text-[10px] font-black uppercase tracking-[0.12em]"
            >
              <Bookmark size={12} /> Invite friends
            </Link>
          </div>
        </aside>

        <div className="min-w-0">
          {section === 'overview' && <AccountOverview hub={hub} onEditTaste={() => setEditing(true)} onOpenTaste={() => selectSection('taste')} />}
          {section === 'taste' && (
            <TasteProfilePanel hub={hub} editing={editing} onEditing={setEditing} />
          )}
          {section === 'saved' && <SavedBottles />}
        </div>
      </div>
    </section>
  );
}
