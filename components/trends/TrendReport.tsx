import Link from 'next/link';
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import BarChart from '@/components/trends/BarChart';
import { CATEGORIES, CATEGORY_LABELS, DRINKS, formatNgn } from '@/lib/drinks/catalog';
import type { Momentum } from '@/lib/trends/report';
import { neighbours, volumeLabel, type Point, type TrendVolume } from '@/lib/trends/volumes';

const MOMENTUM: Record<Momentum, { label: string; Icon: typeof ArrowUpRight; tone: string }> = {
  up: { label: 'Growing', Icon: ArrowUpRight, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  flat: { label: 'Flat / mixed', Icon: ArrowRight, tone: 'text-obsidian/70 bg-obsidian/[0.04] border-obsidian/15' },
  down: { label: 'Declining', Icon: ArrowDownRight, tone: 'text-ember bg-ember/[0.06] border-ember/25' },
};

const SECTIONS = [
  ['#global', 'Global picture'],
  ['#beer', 'Beer'],
  ['#brands', 'Brands'],
  ['#momentum', 'Category momentum'],
  ['#nigeria', 'Nigeria lens'],
  ['#takeaways', 'Takeaways'],
];

/** Our own shelf, computed from the catalogue rather than quoted. */
function shelfMix() {
  const rows = CATEGORIES.map((cat) => {
    const items = DRINKS.filter((d) => d.category === cat);
    const prices = items.map((d) => d.priceNgn).sort((a, b) => a - b);
    const median = prices.length ? prices[Math.floor((prices.length - 1) / 2)] : 0;
    return { cat, label: CATEGORY_LABELS[cat], count: items.length, median };
  }).filter((r) => r.count > 0);
  return { rows, total: rows.reduce((n, r) => n + r.count, 0) };
}

function SectionHead({ kicker, title, intro }: { kicker: string; title: string; intro?: string }) {
  return (
    <div className="mb-6 max-w-3xl sm:mb-8">
      <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.16em] text-ember">{kicker}</p>
      <h2 className="font-serif text-[1.9rem] font-light leading-tight tracking-tight text-obsidian sm:text-[2.5rem]">{title}</h2>
      {intro && <p className="mt-3 text-[15px] leading-relaxed text-obsidian/60">{intro}</p>}
    </div>
  );
}

function Points({ title, points, children }: { title: string; points: Point[]; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-obsidian/[0.06] sm:p-6">
      <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-obsidian/45">{title}</h3>
      <ul className="space-y-4 text-[14px] leading-relaxed text-obsidian/75">
        {points.map((p) => (
          <li key={p.lead}>
            <strong className="text-obsidian">{p.lead}</strong> {p.body}
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}

/** One volume of the Convivia24 Insights trend report. */
export default function TrendReport({ volume }: { volume: TrendVolume }) {
  const shelf = shelfMix();
  const shelfMax = Math.max(...shelf.rows.map((r) => r.count));
  const { older, newer } = neighbours(volume);

  return (
    <article className="bg-paper">
      {/* Masthead */}
      <header className="mx-auto max-w-[1600px] px-3 pt-4 sm:px-4 sm:pt-6 lg:px-5">
        <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(118deg,#050505_0%,#141212_55%,#2a1210_100%)] px-6 pb-12 pt-8 text-white sm:px-12 sm:pb-16 sm:pt-12 lg:px-16">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:22px_22px]" />
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-saffron/15 blur-3xl" />
          {/* Oversized volume numeral, like a magazine spine. */}
          <span aria-hidden className="pointer-events-none absolute -bottom-16 right-6 hidden font-serif text-[18rem] font-light leading-none text-white/[0.05] lg:block">
            {String(volume.number).padStart(2, '0')}
          </span>
          <div className="relative">
            <Link href="/trends" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/55 hover:text-white">
              <ArrowLeft size={14} /> All volumes
            </Link>
            <p className="mt-6 flex flex-wrap items-center gap-3 text-[12px] font-bold uppercase tracking-[0.18em] text-saffron">
              <span className="rounded-full bg-saffron px-3 py-1 text-obsidian">{volumeLabel(volume)}</span>
              Convivia24 Insights · {volume.edition}
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-[2.4rem] font-light leading-[1.05] tracking-tight sm:text-6xl">
              {volume.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">{volume.dek}</p>
            <nav aria-label="Report sections" className="mt-8 flex flex-wrap gap-2">
              {SECTIONS.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-full border border-white/20 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/75 hover:border-white/50 hover:text-white"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Headline numbers */}
      <section aria-label="Headline numbers" className="mx-auto mt-5 max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 divide-y divide-obsidian/8 rounded-2xl bg-white px-5 ring-1 ring-obsidian/[0.06] sm:grid-cols-2 sm:divide-y-0 sm:px-6 lg:grid-cols-4 lg:divide-x">
          {volume.headlines.map((h) => (
            <div key={h.label} className="py-6 first:lg:pl-0 sm:py-8 lg:px-6">
              <p className="font-serif text-4xl font-light tabular-nums text-obsidian">
                {h.value}
                {h.unit && <span className="ml-1 text-lg text-obsidian/45">{h.unit}</span>}
              </p>
              <p className="mt-2 text-[13px] font-bold text-obsidian">{h.label}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-obsidian/55">{h.context}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-obsidian/35">{h.source}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:space-y-20 sm:px-6 sm:py-16">
        <section id="global" className="scroll-mt-24">
          <SectionHead kicker="01 · Global picture" title={volume.global.title} intro={volume.global.intro} />
          <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1.4fr_1fr]">
            <BarChart {...volume.global.chart} />
            <Points title={volume.global.pointsTitle} points={volume.global.points} />
          </div>
        </section>

        <section id="beer" className="scroll-mt-24">
          <SectionHead kicker="02 · Beer" title={volume.beer.title} intro={volume.beer.intro} />
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {volume.beer.charts.map((c) => (
              <BarChart key={c.title} {...c} />
            ))}
          </div>
          <p className="mt-5 max-w-3xl text-[14px] leading-relaxed text-obsidian/65">{volume.beer.footnote}</p>
        </section>

        <section id="brands" className="scroll-mt-24">
          <SectionHead kicker="03 · Brands" title={volume.brands.title} intro={volume.brands.intro} />
          <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1.4fr_1fr]">
            <BarChart {...volume.brands.chart} />
            <Points title={volume.brands.pointsTitle} points={volume.brands.points}>
              <Link href="/brands" className="mt-5 inline-block text-sm font-semibold text-obsidian underline decoration-obsidian/30 underline-offset-4 hover:decoration-obsidian">
                The houses we stock →
              </Link>
            </Points>
          </div>
        </section>

        <section id="momentum" className="scroll-mt-24">
          <SectionHead kicker="04 · Category momentum" title={volume.momentum.title} intro={volume.momentum.intro} />
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {volume.momentum.signals.map((s) => {
              const m = MOMENTUM[s.momentum];
              return (
                <div key={s.category} className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-obsidian/[0.06]">
                  <span className={`inline-flex items-center gap-1 self-start rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${m.tone}`}>
                    <m.Icon className="h-3.5 w-3.5" aria-hidden />
                    {m.label}
                  </span>
                  <h3 className="mt-3 text-[15px] font-bold text-obsidian">{s.category}</h3>
                  <p className="mt-0.5 text-[13px] font-semibold text-obsidian/70">{s.headline}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-obsidian/55">{s.detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="nigeria" className="scroll-mt-24">
          <SectionHead kicker="05 · Nigeria lens" title={volume.nigeria.title} intro={volume.nigeria.intro} />
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {volume.nigeria.insights.map((n, i) => (
              <div key={n.title} className="rounded-2xl bg-white p-5 ring-1 ring-obsidian/[0.06]">
                <p className="font-serif text-2xl font-light tabular-nums text-ember">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-2 text-[15px] font-bold text-obsidian">{n.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-obsidian/60">{n.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-obsidian/[0.06] sm:p-6">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl font-light text-obsidian sm:text-2xl">On the Convivia24 shelf</h3>
                <p className="mt-1 text-[13px] text-obsidian/55">
                  {shelf.total} bottles in our catalogue by category, with the median price in each
                </p>
              </div>
              <Link href="/shop" className="text-sm font-semibold text-obsidian underline decoration-obsidian/30 underline-offset-4 hover:decoration-obsidian">
                Shop the shelf →
              </Link>
            </div>
            <table className="w-full text-sm">
              <caption className="sr-only">Catalogue mix by category</caption>
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-obsidian/45">
                  <th className="w-[34%] pb-2 font-bold">Category</th>
                  <th className="pb-2 font-bold">Bottles</th>
                  <th className="pb-2 text-right font-bold">Median price</th>
                </tr>
              </thead>
              <tbody>
                {shelf.rows.map((r) => (
                  <tr key={r.cat} className="border-t border-obsidian/6">
                    <td className="py-2.5 text-obsidian/80">
                      <Link href={r.cat === 'party-packs' ? '/shop?section=packages' : `/shop?type=${r.cat}`} className="hover:text-ember">
                        {r.label}
                      </Link>
                    </td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-2">
                        <span className="h-3 rounded-full bg-ember" style={{ width: `${(r.count / shelfMax) * 60}%` }} />
                        <span className="text-[12px] font-semibold tabular-nums text-obsidian/80">{r.count}</span>
                      </span>
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-obsidian">{formatNgn(r.median)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="takeaways" className="scroll-mt-24">
          <SectionHead kicker="06 · Takeaways" title="What to do with this" />
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {volume.takeaways.map((t) => (
              <div key={t.audience} className="rounded-2xl bg-[linear-gradient(140deg,#0a0a0a_0%,#1c1514_60%,#35100e_100%)] p-6 text-white">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-saffron">{t.audience}</h3>
                <ul className="mt-4 space-y-3">
                  {t.points.map((p) => (
                    <li key={p} className="relative pl-4 text-[14px] leading-relaxed text-white/80">
                      <span className="absolute left-0 top-[0.6em] h-1.5 w-1.5 rounded-full bg-saffron" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/party-planner" className="rounded-full bg-obsidian px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-ember">
              Plan your drinks
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-obsidian/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-obsidian/75 hover:border-obsidian hover:text-obsidian"
            >
              Brand or venue enquiry
            </Link>
          </div>
        </section>

        {(older || newer) && (
          <nav aria-label="Other volumes" className="grid gap-3 sm:grid-cols-2">
            {older ? (
              <Link href={`/trends/${older.slug}`} className="group rounded-2xl bg-white p-5 ring-1 ring-obsidian/[0.06] hover:ring-obsidian/20">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-obsidian/45">← Previous · {volumeLabel(older)}</span>
                <span className="mt-1 block font-serif text-xl font-light text-obsidian group-hover:underline">{older.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link href={`/trends/${newer.slug}`} className="group rounded-2xl bg-white p-5 text-right ring-1 ring-obsidian/[0.06] hover:ring-obsidian/20">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-obsidian/45">Next · {volumeLabel(newer)} →</span>
                <span className="mt-1 block font-serif text-xl font-light text-obsidian group-hover:underline">{newer.title}</span>
              </Link>
            )}
          </nav>
        )}

        <section aria-labelledby="method" className="border-t border-obsidian/10 pt-8">
          <h2 id="method" className="text-[11px] font-bold uppercase tracking-[0.18em] text-obsidian/45">
            Methodology & sources
          </h2>
          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-obsidian/55">
            Figures are rounded, indicative values from the most recent public reports available when this volume was written,
            and different sources cover different years. Treat them as directional rather than exact. The shelf table is generated
            from the Convivia24 catalogue. Please drink responsibly. Convivia24 serves adults 18+ only.
          </p>
          <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {volume.sources.map((s) => (
              <li key={s.name} className="text-[12px] leading-relaxed text-obsidian/60">
                <span className="text-obsidian/80">{s.name}</span> — {s.covers}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
