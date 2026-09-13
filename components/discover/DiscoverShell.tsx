'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTriviaHub } from '@/components/trivia/use-hub';
import { DISCOVER_SECTIONS, activeDiscoverSection } from './sections';
import { SectionIcon } from './SectionIcon';

const rail: Variants = { show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const card: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

/**
 * Discover is one screen: the three sections sit in a rail on the left and the chosen one fills
 * the right. Each section keeps its own URL so the browser back button and deep links still work;
 * the rail just highlights whichever route is open.
 */
export default function DiscoverShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/discover';
  const active = activeDiscoverSection(pathname);
  const hub = useTriviaHub();
  const points = hub.standing?.points ?? null;

  return (
    <section className="min-h-[70vh] bg-paper">
      <div className="mx-auto grid max-w-[1400px] gap-4 px-3 py-4 sm:px-5 sm:py-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* ── Rail ─────────────────────────────────────────── */}
        <motion.nav
          aria-label="Discover sections"
          variants={rail}
          initial="hidden"
          animate="show"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <motion.div variants={card} className="mb-3 hidden lg:block">
            {hub.loading ? (
              <span className="block h-11 w-full animate-pulse rounded-2xl bg-obsidian/5" />
            ) : hub.signedIn && points !== null ? (
              <Link href="/discover/rewards" className="flex items-center gap-2.5 rounded-2xl bg-obsidian px-4 py-3 text-white">
                <Star size={15} className="fill-ember text-ember" />
                <span className="font-logo text-[15px] font-black tabular-nums tracking-tight">{points.toLocaleString()} PTS</span>
                {hub.standing?.tierName && <span className="ml-auto text-[12px] font-semibold text-white/60">{hub.standing.tierName}</span>}
              </Link>
            ) : (
              <Link href="/signin?next=%2Fdiscover" className="block rounded-2xl border border-obsidian/12 bg-white px-4 py-3 text-center text-[13px] font-bold text-obsidian hover:border-ember hover:text-ember">
                Sign in to earn points
              </Link>
            )}
          </motion.div>

          <ul className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {DISCOVER_SECTIONS.map((s) => {
              const on = s.key === active;
              return (
                <motion.li key={s.key} variants={card} whileHover={{ x: 3 }} whileTap={{ scale: 0.99 }} className="shrink-0 lg:shrink">
                  <Link
                    href={s.href}
                    aria-current={on ? 'page' : undefined}
                    className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 transition-[border-color,box-shadow] lg:gap-4 lg:p-4 ${
                      on
                        ? 'border-ember bg-white shadow-[0_18px_40px_-28px_rgba(194,65,12,0.6)]'
                        : 'border-obsidian/10 bg-white hover:border-ember/40'
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="discover-rail-active"
                        className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-ember"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-colors lg:h-16 lg:w-16 ${
                        on ? 'bg-ember text-white' : 'bg-ember/[0.08] text-ember'
                      }`}
                    >
                      <SectionIcon section={s.key} size={30} className="lg:hidden" />
                      <SectionIcon section={s.key} size={38} className="hidden lg:block" />
                    </span>
                    <span className="min-w-0 pr-1">
                      <span className="block whitespace-nowrap font-wordmark text-lg leading-tight text-obsidian lg:whitespace-normal lg:text-2xl">{s.label}</span>
                      <span className="mt-1 hidden text-[13px] leading-snug text-obsidian/55 lg:block">{s.description}</span>
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </motion.nav>

        {/* ── Content ──────────────────────────────────────── */}
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active ?? 'home'}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden rounded-3xl border border-obsidian/10 bg-white"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
