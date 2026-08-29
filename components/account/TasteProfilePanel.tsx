'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronRight, Gift, MessageSquare, Package, Sparkles, Star } from 'lucide-react';
import MatchRing from '@/components/account/MatchRing';
import TasteProfileEditor from '@/components/trivia/TasteProfileEditor';
import DrinkPlaceholder from '@/components/shop/DrinkPlaceholder';
import { useTriviaHub } from '@/components/trivia/use-hub';
import {
  hasTasteProfile,
  overallMatch,
  preferenceBreakdown,
  tastePersonality,
  tasteLabel,
  type TasteProfile,
} from '@/lib/trivia/taste';
import { categoryAffinity, recommendDrinks } from '@/lib/drinks/recommend';
import { TRIVIA_ROUNDS } from '@/lib/trivia/catalog';
import { formatNgn } from '@/lib/drinks/catalog';

type Hub = ReturnType<typeof useTriviaHub>;
type Tab = 'overview' | 'preferences' | 'activity';

type ActivityItem = {
  id: string;
  kind: 'review' | 'order' | 'challenge' | 'redemption';
  title: string;
  detail: string;
  at: string;
};

const ACTIVITY_ICONS = {
  review: MessageSquare,
  order: Package,
  challenge: Sparkles,
  redemption: Gift,
} as const;

export default function TasteProfilePanel({
  hub,
  editing,
  onEditing,
}: {
  hub: Hub;
  editing: boolean;
  onEditing: (v: boolean) => void;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetch('/api/account/activity')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setActivity(data.activity || []))
      .catch(() => {});
  }, []);

  const profile = hub.profile;
  const built = hasTasteProfile(profile);
  const match = useMemo(
    () => overallMatch(profile, TRIVIA_ROUNDS.map((r) => r.taste)),
    [profile]
  );
  const personality = useMemo(() => tastePersonality(profile), [profile]);
  const breakdown = useMemo(() => preferenceBreakdown(profile), [profile]);
  const categories = useMemo(() => categoryAffinity(profile), [profile]);
  const recommendations = useMemo(() => recommendDrinks(profile, 4), [profile]);

  function save(next: TasteProfile) {
    void hub.saveProfile(next);
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {editing && (
          <TasteProfileEditor initial={profile} onSave={save} onClose={() => onEditing(false)} />
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-logo font-black uppercase tracking-tight text-2xl sm:text-3xl">
            <span className="brand-text">Taste profile</span>
          </h1>
          <p className="text-obsidian/50 mt-2 text-sm">
            Discover your taste personality and get better recommendations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onEditing(true)}
          className="px-5 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] hover:border-ember hover:text-ember transition-colors"
        >
          {built ? 'Edit profile' : 'Build profile'}
        </button>
      </div>

      {!built ? (
        <div className="bg-white border border-obsidian/8 p-8 text-center">
          <Sparkles size={30} className="mx-auto text-ember/40 mb-4" />
          <p className="font-bold">No taste profile yet</p>
          <p className="text-sm text-obsidian/55 mt-2 max-w-md mx-auto leading-relaxed">
            Four quick questions — what you drink, how you like it, when you pour, and what you spend. Every
            match percentage on the site comes from your answers.
          </p>
          <button
            type="button"
            onClick={() => onEditing(true)}
            className="mt-5 px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
          >
            Build my profile
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white border border-obsidian/8">
            <div className="flex overflow-x-auto scrollbar-hide border-b border-obsidian/8">
              {(
                [
                  ['overview', 'Taste overview'],
                  ['preferences', 'Preferences'],
                  ['activity', 'Recent activity'],
                ] as [Tab, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`relative px-5 py-4 text-sm whitespace-nowrap transition-colors ${
                    tab === id ? 'text-obsidian font-semibold' : 'text-obsidian/45 hover:text-obsidian/70'
                  }`}
                >
                  {label}
                  {tab === id && (
                    <motion.span layoutId="taste-tab" className="absolute inset-x-4 bottom-0 h-0.5 bg-ember" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-5 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  {tab === 'overview' && (
                    <div className="space-y-7">
                      <div className="flex items-start gap-5 flex-wrap">
                        <MatchRing value={match} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-obsidian/35">
                            Your taste personality
                          </p>
                          <p className="font-logo font-black uppercase tracking-tight text-xl mt-1">
                            {personality?.name}
                          </p>
                          <p className="text-sm text-obsidian/55 mt-2 leading-relaxed max-w-md">
                            {personality?.blurb}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {personality?.traits.map((trait) => (
                              <span
                                key={trait}
                                className="px-2.5 py-1 bg-obsidian/[0.04] text-obsidian/60 text-[11px] font-medium rounded-full"
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/45 mb-3">
                          Your top categories
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          {categories.map((c) => (
                            <Link
                              key={c.category}
                              href={`/shop?category=${c.category}`}
                              className="bg-paper border border-obsidian/8 p-3 text-center hover:border-ember/35 transition-colors"
                            >
                              <p className="text-[12px] font-semibold truncate">{c.label}</p>
                              <p className="text-sm font-bold text-ember tabular-nums mt-1">{c.match}%</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === 'preferences' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/45 mb-3">
                          Preference breakdown
                        </h3>
                        <ul className="space-y-4">
                          {breakdown.map((row) => (
                            <li key={row.label}>
                              <div className="flex items-baseline justify-between gap-4 mb-1.5">
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold">{row.label}</span>
                                  <span className="block text-[12px] text-obsidian/45 mt-0.5">{row.value}</span>
                                </span>
                                <span className="text-[12px] font-semibold tabular-nums text-obsidian/50 shrink-0">
                                  {row.strength}%
                                </span>
                              </div>
                              <div className="h-1.5 bg-obsidian/8 overflow-hidden">
                                <motion.div
                                  className="h-full bg-ember"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${row.strength}%` }}
                                  transition={{ duration: 0.7, ease: 'easeOut' }}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                        <p className="text-[12px] text-obsidian/40 mt-4 leading-relaxed">
                          Strength reads how decided an answer is — one pick out of the allowed maximum is the
                          clearest signal you can give us.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6 pt-5 border-t border-obsidian/8">
                        <ChipList title="Your flavours" values={profile.flavours} />
                        <ChipList title="Preferred occasions" values={profile.occasions} />
                      </div>
                    </div>
                  )}

                  {tab === 'activity' && (
                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/45 mb-3">
                        Recent activity impacting your taste
                      </h3>
                      {activity.length === 0 ? (
                        <p className="text-sm text-obsidian/45 py-6 text-center">
                          Nothing recorded yet. Rate a bottle, play a round, or place an order and it lands
                          here.
                        </p>
                      ) : (
                        <ul className="divide-y divide-obsidian/6">
                          {activity.map((item) => {
                            const Icon = ACTIVITY_ICONS[item.kind] ?? Calendar;
                            return (
                              <li key={item.id} className="py-3.5 flex items-center gap-3">
                                <span className="w-9 h-9 rounded-full bg-ember/6 flex items-center justify-center shrink-0">
                                  <Icon size={15} className="text-ember" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-semibold truncate">{item.title}</span>
                                  <span className="block text-[12px] text-obsidian/45 mt-0.5">
                                    {item.detail}
                                  </span>
                                </span>
                                <span className="text-[11px] text-obsidian/35 shrink-0">
                                  {timeAgo(item.at)}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {recommendations.length > 0 && (
            <section className="bg-white border border-obsidian/8">
              <div className="px-5 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
                    Recommended for you
                  </h2>
                  <p className="text-[12px] text-obsidian/40 mt-1">Matched against your taste profile</p>
                </div>
                <Link
                  href="/shop"
                  className="text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember inline-flex items-center gap-1 transition-colors"
                >
                  View all <ChevronRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5">
                {recommendations.map(({ product, match: score }) => (
                  <Link
                    key={product.slug}
                    href={`/shop/${product.slug}`}
                    className="group border border-obsidian/8 hover:border-ember/35 transition-colors"
                  >
                    <span className="relative block aspect-[3/4] bg-white overflow-hidden">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="180px"
                          className="object-contain p-3"
                        />
                      ) : (
                        <DrinkPlaceholder
                          category={product.category}
                          name={product.name}
                          className="absolute inset-0 w-full h-full"
                          watermark={false}
                        />
                      )}
                    </span>
                    <span className="block p-3">
                      <span className="block text-[13px] font-semibold leading-snug line-clamp-2">
                        {product.name}
                      </span>
                      <span className="block text-sm font-bold mt-1">{formatNgn(product.priceNgn)}</span>
                      <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-ember tabular-nums">
                        <Star size={10} className="fill-ember" /> {score}% match
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ChipList({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/45 mb-2.5">{title}</h3>
      {values.length === 0 ? (
        <p className="text-[12px] text-obsidian/40">Nothing picked.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span key={v} className="px-2.5 py-1 bg-ember/6 text-ember text-[11px] font-medium rounded-full">
              {tasteLabel(v)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
