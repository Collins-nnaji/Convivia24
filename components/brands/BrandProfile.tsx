'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  ChevronRight,
  Heart,
  Plus,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import BrandClaimDialog from '@/components/brands/BrandClaimDialog';
import DrinkPlaceholder from '@/components/shop/DrinkPlaceholder';
import Stars from '@/components/shop/Stars';
import { BRAND_PILLARS, brandStats, type Brand } from '@/lib/brands/catalog';
import type { Campaign } from '@/lib/brands/campaigns';
import { formatNgn } from '@/lib/drinks/catalog';

const PILLAR_ICONS = [ShieldCheck, Sparkles, Truck, QrCode];

export default function BrandProfile({ brand, campaigns }: { brand: Brand; campaigns: Campaign[] }) {
  const pathname = usePathname();
  const { addProduct } = useCart();
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/brands/follow?brand=${encodeURIComponent(brand.slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setFollowers(Number(data.followers) || 0);
        setFollowing(Boolean(data.following));
        setSignedIn(Boolean(data.signedIn));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [brand.slug]);

  async function toggleFollow() {
    setBusy(true);
    try {
      const res = await fetch('/api/brands/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: brand.slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setFollowing(Boolean(data.following));
        setFollowers(Number(data.followers) || 0);
      }
    } catch {
      /* the button just does not move */
    } finally {
      setBusy(false);
    }
  }

  const hero = brand.products.find((p) => p.image);
  const stats = brandStats(brand, followers);
  const liveCampaigns = campaigns.filter((c) => c.live);

  return (
    <section className="bg-paper min-h-[70vh]">
      <AnimatePresence>
        {claiming && <BrandClaimDialog brand={brand} onClose={() => setClaiming(false)} />}
      </AnimatePresence>

      {/* Hero */}
      <div className="relative overflow-hidden brand-gradient text-white">
        <motion.div
          aria-hidden
          className="absolute -right-20 -top-24 w-[460px] h-[460px] rounded-full bg-ember/25 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12px] text-white/45 flex-wrap">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <ChevronRight size={12} />
              <li>
                <Link href="/brands" className="hover:text-white transition-colors">
                  Brands
                </Link>
              </li>
              <ChevronRight size={12} />
              <li className="text-white/80">{brand.name}</li>
            </ol>
          </nav>
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pb-10 pt-8 sm:pb-14 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">
              {brand.info.origin}
              {brand.info.founded && <> · est. {brand.info.founded}</>}
            </p>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="font-logo font-black tracking-tight uppercase text-4xl sm:text-6xl leading-[0.92] mt-3"
            >
              {brand.name}
            </motion.h1>
            <p className="text-sm sm:text-base text-white/65 mt-4 max-w-lg leading-relaxed">
              {brand.info.history}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#brand-shop"
                className="px-6 py-3.5 bg-white text-obsidian text-[11px] font-black uppercase tracking-[0.14em]"
              >
                Explore products
              </a>
              {signedIn ? (
                <button
                  type="button"
                  onClick={toggleFollow}
                  disabled={busy}
                  aria-pressed={following}
                  className={`px-6 py-3.5 border text-[11px] font-black uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors disabled:opacity-60 ${
                    following ? 'border-white bg-white/15' : 'border-white/35 hover:border-white'
                  }`}
                >
                  <Heart size={14} fill={following ? 'currentColor' : 'none'} />
                  {following ? 'Following' : 'Follow brand'}
                </button>
              ) : (
                <Link
                  href={`/signin?next=${encodeURIComponent(pathname || '/brands')}`}
                  className="px-6 py-3.5 border border-white/35 hover:border-white text-[11px] font-black uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors"
                >
                  <Heart size={14} /> Follow brand
                </Link>
              )}
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="relative aspect-square max-w-[280px] mx-auto">
              {hero?.image ? (
                <motion.div
                  className="absolute inset-[8%]"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Image
                    src={hero.image}
                    alt={hero.name}
                    fill
                    priority
                    sizes="280px"
                    className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.5)]"
                  />
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 -mt-6 relative z-10">
        <ul className="grid grid-cols-2 sm:grid-cols-4 bg-white border border-obsidian/8 divide-x divide-y sm:divide-y-0 divide-obsidian/6 shadow-[0_18px_50px_-40px_rgba(10,10,10,0.6)]">
          {stats.map((stat) => (
            <li key={stat.label} className="p-5 text-center">
              <p className="font-logo font-black text-2xl tabular-nums leading-none">{stat.value}</p>
              <p className="text-[11px] text-obsidian/40 mt-1.5">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14 space-y-10 sm:space-y-14">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
          <section id="brand-shop" className="bg-white border border-obsidian/8 scroll-mt-24">
            <div className="px-5 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold">Shop {brand.name}</h2>
              <Link
                href={`/shop?q=${encodeURIComponent(brand.name)}`}
                className="text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember inline-flex items-center gap-1 transition-colors"
              >
                View all products <ChevronRight size={13} />
              </Link>
            </div>

            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-5">
              {brand.products.slice(0, 6).map((product, i) => (
                <motion.li
                  key={product.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 5) * 0.05, duration: 0.3 }}
                  className="border border-obsidian/8 hover:border-ember/35 transition-colors flex flex-col"
                >
                  <Link href={`/shop/${product.slug}`} className="relative block aspect-[3/4] bg-white overflow-hidden">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill sizes="220px" className="object-contain p-3" />
                    ) : (
                      <DrinkPlaceholder
                        category={product.category}
                        name={product.name}
                        className="absolute inset-0 w-full h-full"
                        watermark={false}
                      />
                    )}
                  </Link>
                  <div className="p-3 flex-1 flex flex-col">
                    <Link href={`/shop/${product.slug}`} className="block">
                      <p className="text-[13px] font-semibold leading-snug line-clamp-2 hover:text-ember transition-colors">
                        {product.name}
                      </p>
                    </Link>
                    <p className="text-[11px] text-obsidian/40 mt-0.5">{product.volume}</p>
                    <Stars value={0} size={11} className="mt-1.5" />
                    <p className="font-bold mt-1.5">{formatNgn(product.priceNgn)}</p>
                    <button
                      type="button"
                      onClick={() => addProduct(product.slug, 1)}
                      className="mt-3 w-full py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5"
                    >
                      <Plus size={12} /> Add to cart
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          </section>

          <div className="space-y-6">
            <BrandChallenges brand={brand} campaigns={liveCampaigns} />
            <ClaimPanel brand={brand} onClaim={() => setClaiming(true)} />
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
          <section className="bg-obsidian text-white p-6 sm:p-8">
            <h2 className="font-logo font-black uppercase tracking-tight text-2xl">Our story</h2>
            <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-xl">{brand.info.history}</p>
            {brand.info.style && (
              <p className="text-sm text-white/50 mt-3 leading-relaxed max-w-xl">{brand.info.style}</p>
            )}
            <Link
              href={`/shop?q=${encodeURIComponent(brand.name)}`}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 border border-white/30 hover:border-white text-[11px] font-black uppercase tracking-[0.12em] transition-colors"
            >
              Shop the range <ChevronRight size={13} />
            </Link>
          </section>

          <section className="bg-white border border-obsidian/8 p-5 sm:p-6 text-center">
            <span className="w-11 h-11 rounded-full bg-ember/8 flex items-center justify-center mx-auto">
              <Star size={19} className="text-ember" />
            </span>
            <h2 className="font-bold mt-3">Earn on this house</h2>
            <p className="text-[12px] text-obsidian/50 mt-2 leading-relaxed">
              Play the brand round, rate what you drink, and turn the points into rewards.
            </p>
            <Link
              href="/trivia?tab=challenges"
              className="mt-4 inline-block w-full py-3 btn-brand text-[10px] font-black uppercase tracking-[0.12em]"
            >
              See all challenges
            </Link>
          </section>
        </div>

        <section>
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-8 bg-white border border-obsidian/8">
            {BRAND_PILLARS.map((pillar, i) => {
              const Icon = PILLAR_ICONS[i] ?? ShieldCheck;
              return (
                <li key={pillar.title} className="text-center">
                  <Icon size={20} className="mx-auto text-ember mb-2.5" />
                  <p className="text-[13px] font-semibold leading-tight">{pillar.title}</p>
                  <p className="text-[11px] text-obsidian/45 mt-1.5 leading-relaxed">{pillar.detail}</p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </section>
  );
}

function BrandChallenges({ brand, campaigns }: { brand: Brand; campaigns: Campaign[] }) {
  const hasAny = brand.rounds.length > 0 || campaigns.length > 0;

  return (
    <section className="bg-obsidian text-white">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
          Brand challenges
        </h2>
        <Link
          href="/trivia?tab=challenges"
          className="text-[11px] font-black uppercase tracking-[0.1em] text-white/45 hover:text-white transition-colors"
        >
          View all
        </Link>
      </div>

      {!hasAny ? (
        <p className="px-5 py-8 text-[13px] text-white/50 leading-relaxed">
          No campaign running on {brand.name} right now. Rounds and campaigns are scheduled by Convivia24 —
          check the challenges hub for what is live this week.
        </p>
      ) : (
        <ul className="divide-y divide-white/10">
          {campaigns.map((campaign) => (
            <li key={campaign.id}>
              <Link href={`/campaigns/${campaign.slug}`} className="block px-5 py-4 hover:bg-white/5 transition-colors">
                <p className="text-sm font-semibold leading-snug">{campaign.title}</p>
                <p className="text-[12px] text-white/50 mt-1 leading-relaxed line-clamp-2">
                  {campaign.tagline || campaign.blurb}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-ember">
                  <Star size={11} className="fill-ember" /> {campaign.rewardPoints.toLocaleString()} pts
                  {campaign.daysLeft != null && (
                    <span className="text-white/35 font-medium">· ends in {campaign.daysLeft}d</span>
                  )}
                </p>
              </Link>
            </li>
          ))}

          {brand.rounds.map((round) => (
            <li key={round.slug}>
              <Link href="/trivia" className="block px-5 py-4 hover:bg-white/5 transition-colors">
                <p className="text-sm font-semibold leading-snug">{round.brand} trivia round</p>
                <p className="text-[12px] text-white/50 mt-1 leading-relaxed line-clamp-2">{round.blurb}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-ember">
                  <Star size={11} className="fill-ember" /> 250 pts
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="p-4 border-t border-white/10">
        <Link
          href="/trivia"
          className="w-full py-3 bg-white text-obsidian text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center justify-center"
        >
          Join challenges
        </Link>
      </div>
    </section>
  );
}

function ClaimPanel({ brand, onClaim }: { brand: Brand; onClaim: () => void }) {
  return (
    <section className="bg-white border border-obsidian/8 p-5 sm:p-6">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-obsidian/[0.04] text-obsidian/50 text-[10px] font-black uppercase tracking-[0.12em]">
        <BadgeCheck size={12} /> Managed by Convivia24
      </span>
      <h2 className="font-bold mt-3">Is this your brand?</h2>
      <p className="text-[12px] text-obsidian/50 mt-2 leading-relaxed">
        We write and run this page ourselves. If you work for {brand.name}, claim it to take over the story,
        the imagery, and the campaigns that run here.
      </p>
      <button
        type="button"
        onClick={onClaim}
        className="mt-4 w-full py-3 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] hover:border-ember hover:text-ember transition-colors"
      >
        Claim this brand
      </button>
      <p className="text-[11px] text-obsidian/35 mt-3 leading-relaxed">
        We verify every claim with the house before handing over a page. Already approved?{' '}
        <Link href="/brands/portal" className="text-ember hover:underline">
          Open your portal
        </Link>
        .
      </p>
    </section>
  );
}
