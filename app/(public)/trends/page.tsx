import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LATEST_VOLUME, VOLUMES, volumeLabel } from '@/lib/trends/volumes';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Beverage Trend Report',
  description:
    'Convivia24 Insights: how the world drinks — consumption by region, the biggest beer markets, best-selling spirit brands, category momentum and what it means for Nigeria. Published in volumes. Adults 18+.',
  alternates: { canonical: absoluteUrl('/trends') },
  openGraph: {
    title: 'Beverage Trend Report | Convivia24',
    description: 'Consumption, brands and category momentum around the world, with a Nigeria lens — published in volumes.',
    url: absoluteUrl('/trends'),
  },
};

const pad = (n: number) => String(n).padStart(2, '0');

/** The report archive: the latest volume up front, every volume below. */
export default function TrendsArchivePage() {
  const latest = LATEST_VOLUME;
  return (
    <div className="bg-paper pb-16">
      <section className="mx-auto max-w-[1600px] px-3 pt-4 sm:px-4 sm:pt-6 lg:px-5">
        <Link
          href={`/trends/${latest.slug}`}
          className="group relative block overflow-hidden rounded-3xl bg-[linear-gradient(118deg,#050505_0%,#141212_55%,#2a1210_100%)] px-6 py-10 text-white sm:px-12 sm:py-14 lg:px-16"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:22px_22px]" />
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-saffron/15 blur-3xl" />
          <span aria-hidden className="pointer-events-none absolute -bottom-20 right-4 font-serif text-[14rem] font-light leading-none text-white/[0.06] sm:text-[20rem]">
            {pad(latest.number)}
          </span>
          <div className="relative max-w-3xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-saffron">Convivia24 Insights · Beverage Trend Report</p>
            <p className="mt-6 inline-flex items-center gap-3">
              <span className="rounded-full bg-saffron px-3 py-1 text-[12px] font-bold uppercase tracking-[0.14em] text-obsidian">
                Latest · {volumeLabel(latest)}
              </span>
              <span className="text-sm text-white/55">{latest.edition}</span>
            </p>
            <h1 className="mt-4 font-serif text-[2.4rem] font-light leading-[1.05] tracking-tight sm:text-6xl">{latest.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">{latest.dek}</p>
            <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-[0.1em] text-obsidian transition group-hover:bg-cream">
              Read {volumeLabel(latest)} <ArrowRight size={16} />
            </span>
          </div>
        </Link>

        {/* Headline numbers from the latest volume, as a teaser. */}
        <div className="mx-auto mt-5 grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {latest.headlines.map((h) => (
            <div key={h.label} className="rounded-2xl bg-white p-5 ring-1 ring-obsidian/[0.06]">
              <p className="font-serif text-3xl font-light tabular-nums text-obsidian">
                {h.value}
                {h.unit && <span className="ml-1 text-base text-obsidian/45">{h.unit}</span>}
              </p>
              <p className="mt-1.5 text-[13px] font-semibold text-obsidian/75">{h.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-serif text-[1.9rem] font-light tracking-tight text-obsidian sm:text-[2.5rem]">All volumes</h2>
          <p className="text-sm text-obsidian/50">
            {VOLUMES.length} volume{VOLUMES.length === 1 ? '' : 's'} published
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VOLUMES.map((v) => (
            <li key={v.slug}>
              <Link href={`/trends/${v.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-obsidian/[0.06] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(10,10,10,0.35)]">
                <div className="relative flex h-40 items-end overflow-hidden bg-[linear-gradient(118deg,#0a0a0a_0%,#2a0e0c_55%,#8B2A22_100%)] p-5">
                  <span aria-hidden className="absolute -right-2 -top-6 font-serif text-[9rem] font-light leading-none text-white/10">{pad(v.number)}</span>
                  <span className="relative rounded-full bg-saffron px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-obsidian">
                    {volumeLabel(v)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-obsidian/45">{v.edition}</p>
                  <h3 className="mt-1.5 font-serif text-2xl font-light leading-snug text-obsidian group-hover:underline group-hover:underline-offset-4">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-obsidian/60">{v.cover}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-ember">
                    Read the report <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
