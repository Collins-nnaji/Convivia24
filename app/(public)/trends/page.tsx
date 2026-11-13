import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import BarChart from '@/components/trends/BarChart';
import { absoluteUrl } from '@/lib/seo';
import { CATEGORIES, CATEGORY_LABELS, DRINKS, formatNgn } from '@/lib/drinks/catalog';
import {
  BEER_MARKETS,
  BEER_PER_CAPITA,
  CATEGORY_SIGNALS,
  HEADLINES,
  NIGERIA_INSIGHTS,
  REGIONAL_CONSUMPTION,
  REPORT_EDITION,
  SOURCES,
  SPIRIT_BRANDS,
  TAKEAWAYS,
  type Momentum,
} from '@/lib/trends/report';

export const metadata: Metadata = {
  title: 'Beverage Trend Report',
  description:
    'How the world drinks: consumption by region, the biggest beer markets, best-selling spirit brands, category momentum and what it means for Nigeria. Adults 18+.',
  alternates: { canonical: absoluteUrl('/trends') },
  openGraph: {
    title: 'Beverage Trend Report | Convivia24',
    description: 'Consumption, brands and category momentum around the world, with a Nigeria lens.',
    url: absoluteUrl('/trends'),
  },
};

const MOMENTUM: Record<Momentum, { label: string; Icon: typeof ArrowUpRight; tone: string }> = {
  up: { label: 'Growing', Icon: ArrowUpRight, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  flat: { label: 'Flat / mixed', Icon: ArrowRight, tone: 'text-obsidian/70 bg-obsidian/[0.04] border-obsidian/15' },
  down: { label: 'Declining', Icon: ArrowDownRight, tone: 'text-ember bg-ember/[0.06] border-ember/25' },
};

/** Our own shelf, computed from the live catalogue rather than quoted. */
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
    <div className="mb-6 sm:mb-8 max-w-3xl">
      <p className="text-[9px] font-wordmark-sm text-ember mb-2">{kicker}</p>
      <h2 className="font-wordmark text-2xl sm:text-3xl text-obsidian leading-tight">{title}</h2>
      {intro && <p className="mt-3 text-[15px] text-obsidian/60 leading-relaxed">{intro}</p>}
    </div>
  );
}

export default function TrendsPage() {
  const shelf = shelfMix();
  const shelfMax = Math.max(...shelf.rows.map((r) => r.count));

  return (
    <article className="bg-paper">
      {/* Masthead */}
      <header className="bg-obsidian text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-12 sm:pt-16 sm:pb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">
            Convivia24 Insights · {REPORT_EDITION} edition
          </p>
          <h1 className="font-wordmark text-4xl sm:text-6xl leading-[1.05] mt-4 max-w-3xl">
            Beverage Trend Report
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/65 leading-relaxed max-w-2xl">
            How the world drinks now: where consumption is concentrated, which brands move the most volume,
            which categories are gaining or losing, and what that means for nights out in Nigeria.
          </p>
          <nav aria-label="Report sections" className="mt-8 flex flex-wrap gap-2">
            {[
              ['#global', 'Global picture'],
              ['#beer', 'Beer'],
              ['#brands', 'Brands'],
              ['#momentum', 'Category momentum'],
              ['#nigeria', 'Nigeria lens'],
              ['#takeaways', 'Takeaways'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-[10px] font-black uppercase tracking-[0.14em] border border-white/15 px-3 py-2 text-white/70 hover:text-white hover:border-white/40"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Headline numbers */}
      <section aria-label="Headline numbers" className="border-b border-obsidian/8 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-obsidian/8">
          {HEADLINES.map((h) => (
            <div key={h.label} className="py-6 sm:py-8 lg:px-6 first:lg:pl-0">
              <p className="font-wordmark text-4xl text-obsidian tabular-nums">
                {h.value}
                {h.unit && <span className="text-lg text-obsidian/45 ml-1">{h.unit}</span>}
              </p>
              <p className="mt-2 text-[13px] font-bold text-obsidian">{h.label}</p>
              <p className="mt-1 text-[13px] text-obsidian/55 leading-relaxed">{h.context}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-obsidian/35">{h.source}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 space-y-16 sm:space-y-20">
        {/* Global */}
        <section id="global" className="scroll-mt-24">
          <SectionHead
            kicker="01 · Global picture"
            title="Europe drinks almost twice the world average"
            intro="Consumption tracks culture, religion and income more than population. Europe and the Americas sit well above the global line. Africa averages below it, but its drinkers consume more per person than the regional figure suggests, because a large share of adults do not drink at all."
          />
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 sm:gap-6 items-start">
            <BarChart
              title="Alcohol consumption by world region"
              subtitle="Litres of pure alcohol per person aged 15+, per year"
              unit="Litres per adult"
              data={REGIONAL_CONSUMPTION}
              source="WHO, 2019 estimates (published 2024)"
            />
            <div className="bg-white border border-obsidian/8 p-5 sm:p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-obsidian/45 mb-4">What the data says</h3>
              <ul className="space-y-4 text-[14px] text-obsidian/75 leading-relaxed">
                <li>
                  <strong className="text-obsidian">The world is drinking slightly less.</strong> Per-capita intake has eased
                  since 2010, led by Europe, while parts of Asia and Africa rise with incomes.
                </li>
                <li>
                  <strong className="text-obsidian">A 46× gap between regions.</strong> Europe consumes 9.2 L per adult. The
                  Eastern Mediterranean consumes 0.2 L. Regional averages hide very different drinking cultures.
                </li>
                <li>
                  <strong className="text-obsidian">Share of drinkers matters.</strong> In many African markets fewer than
                  half of adults drink, so those who do consume well above the regional average.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Beer */}
        <section id="beer" className="scroll-mt-24">
          <SectionHead
            kicker="02 · Beer"
            title="Volume lives in China; passion lives in Czechia"
            intro="Beer is still the world’s most-consumed alcoholic drink by volume. Total volume follows population, but per-head figures show where beer is part of everyday culture."
          />
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            <BarChart
              title="Largest beer markets"
              subtitle="Total consumption, billions of litres per year"
              unit="Billion litres"
              data={BEER_MARKETS}
              highlight={['China', 'United States']}
              source="Kirin Holdings / BarthHaas, rounded"
            />
            <BarChart
              title="Most beer per person"
              subtitle="Litres per person per year"
              unit="Litres per person"
              data={BEER_PER_CAPITA}
              highlight={['Czechia']}
              source="Kirin Holdings, rounded"
            />
          </div>
          <p className="mt-5 text-[14px] text-obsidian/65 leading-relaxed max-w-3xl">
            The average Czech drinks more than <strong className="text-obsidian">five times as much beer</strong> as the
            average person in China, yet China’s total is over 20 times Czechia’s. In Africa, South Africa and Nigeria are the two
            largest beer markets. Both are price-sensitive and moving fast towards value lagers and returnable glass.
          </p>
        </section>

        {/* Brands */}
        <section id="brands" className="scroll-mt-24">
          <SectionHead
            kicker="03 · Brands"
            title="The world’s best-selling spirits aren’t the ones you’d guess"
            intro="Ranked by volume, the leaders are local favourites with enormous home markets: Korean soju and Indian whisky. The best-known global names come after them."
          />
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 sm:gap-6 items-start">
            <BarChart
              title="Best-selling spirit brands by volume"
              subtitle="Millions of 9-litre cases per year"
              unit="Million cases"
              data={SPIRIT_BRANDS}
              highlight={['Jinro (soju, Korea)', 'Smirnoff (vodka)', 'Johnnie Walker (Scotch)', 'Hennessy (cognac)']}
              source="Drinks International Millionaires’ Club, rounded"
            />
            <div className="bg-white border border-obsidian/8 p-5 sm:p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-obsidian/45 mb-4">Volume vs value</h3>
              <ul className="space-y-4 text-[14px] text-obsidian/75 leading-relaxed">
                <li>
                  <strong className="text-obsidian">Smirnoff</strong> is the top international spirit by volume, sold in
                  more than 130 countries.
                </li>
                <li>
                  <strong className="text-obsidian">Johnnie Walker</strong> is the world’s biggest Scotch, and its Black and
                  Double Black labels are bottle-service staples in West Africa.
                </li>
                <li>
                  <strong className="text-obsidian">Hennessy</strong> sells a fraction of Jinro’s cases but far more value per
                  bottle. Nigeria is one of its most visible African markets.
                </li>
              </ul>
              <Link href="/brands" className="mt-5 inline-block text-[11px] font-wordmark-sm text-ember hover:text-ember-dark">
                The houses we stock →
              </Link>
            </div>
          </div>
        </section>

        {/* Momentum */}
        <section id="momentum" className="scroll-mt-24">
          <SectionHead
            kicker="04 · Category momentum"
            title="Convenience and moderation rise; celebration categories cool"
            intro="Where each category is heading over the next few years, based on recent volume trends and industry forecasts."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {CATEGORY_SIGNALS.map((s) => {
              const m = MOMENTUM[s.momentum];
              return (
                <div key={s.category} className="bg-white border border-obsidian/8 p-5 flex flex-col">
                  <span className={`self-start inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${m.tone}`}>
                    <m.Icon className="w-3.5 h-3.5" aria-hidden />
                    {m.label}
                  </span>
                  <h3 className="mt-3 text-[15px] font-bold text-obsidian">{s.category}</h3>
                  <p className="text-[13px] font-semibold text-obsidian/70 mt-0.5">{s.headline}</p>
                  <p className="mt-2 text-[13px] text-obsidian/55 leading-relaxed">{s.detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Nigeria */}
        <section id="nigeria" className="scroll-mt-24">
          <SectionHead
            kicker="05 · Nigeria lens"
            title="Squeezed at the bar, still spending on the night"
            intro="Africa’s most populous country is two markets at once: everyday drinkers under heavy price pressure, and a nightlife scene where premium bottles still drive the occasion."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {NIGERIA_INSIGHTS.map((n, i) => (
              <div key={n.title} className="bg-white border border-obsidian/8 p-5">
                <p className="text-[10px] font-black tabular-nums text-ember">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-2 text-[15px] font-bold text-obsidian">{n.title}</h3>
                <p className="mt-2 text-[13px] text-obsidian/60 leading-relaxed">{n.body}</p>
              </div>
            ))}
          </div>

          {/* Our shelf — computed from the live catalogue */}
          <div className="mt-6 bg-white border border-obsidian/8 p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-obsidian">On the Convivia24 shelf</h3>
                <p className="text-[13px] text-obsidian/55 mt-1">
                  {shelf.total} bottles in our catalogue by category, with the median price in each
                </p>
              </div>
              <Link href="/shop" className="text-[11px] font-wordmark-sm text-ember hover:text-ember-dark">
                Shop the shelf →
              </Link>
            </div>
            <table className="w-full text-sm">
              <caption className="sr-only">Catalogue mix by category</caption>
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-obsidian/45">
                  <th className="font-black pb-2 w-[34%]">Category</th>
                  <th className="font-black pb-2">Bottles</th>
                  <th className="font-black pb-2 text-right">Median price</th>
                </tr>
              </thead>
              <tbody>
                {shelf.rows.map((r) => (
                  <tr key={r.cat} className="border-t border-obsidian/6">
                    <td className="py-2.5 text-obsidian/80">
                      <Link href={`/shop?category=${r.cat}`} className="hover:text-ember">{r.label}</Link>
                    </td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-2">
                        <span className="h-3 rounded-r-[4px] bg-ember" style={{ width: `${(r.count / shelfMax) * 60}%` }} />
                        <span className="text-[12px] tabular-nums font-semibold text-obsidian/80">{r.count}</span>
                      </span>
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-obsidian">{formatNgn(r.median)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Takeaways */}
        <section id="takeaways" className="scroll-mt-24">
          <SectionHead kicker="06 · Takeaways" title="What to do with this" />
          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            {TAKEAWAYS.map((t) => (
              <div key={t.audience} className="bg-obsidian text-white p-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">{t.audience}</h3>
                <ul className="mt-4 space-y-3">
                  {t.points.map((p) => (
                    <li key={p} className="text-[14px] text-white/80 leading-relaxed pl-4 relative">
                      <span className="absolute left-0 top-[0.6em] w-1.5 h-1.5 bg-ember" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/party-planner" className="btn-brand px-5 py-3 text-[11px] font-black uppercase tracking-[0.15em]">
              Plan your drinks
            </Link>
            <Link
              href="/contact"
              className="px-5 py-3 border border-obsidian/15 text-obsidian/70 hover:text-obsidian text-[11px] font-black uppercase tracking-[0.15em]"
            >
              Brand or venue enquiry
            </Link>
          </div>
        </section>

        {/* Methodology */}
        <section aria-labelledby="method" className="border-t border-obsidian/10 pt-8">
          <h2 id="method" className="text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/45">Methodology & sources</h2>
          <p className="mt-3 text-[13px] text-obsidian/55 leading-relaxed max-w-3xl">
            Figures are rounded, indicative values from the most recent public reports available when this edition was written,
            and different sources cover different years. Treat them as directional rather than exact. The shelf table is generated
            from the Convivia24 catalogue. Please drink responsibly. Convivia24 serves adults 18+ only.
          </p>
          <ul className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {SOURCES.map((s) => (
              <li key={s.name} className="text-[12px] text-obsidian/60 leading-relaxed">
                <span className="text-obsidian/80">{s.name}</span> — {s.covers}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
