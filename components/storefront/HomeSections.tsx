import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, CreditCard, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import Stars from '@/components/shop/Stars';
import { THEME_CLASSES, safeHref, type StorefrontBlock } from '@/lib/storefront/blocks';
import { bottlesForHref } from '@/lib/storefront/visuals';
import type { HomeBrand } from '@/lib/storefront/home';
import type { HomeReview } from '@/lib/storefront/repo';
import type { CatalogProduct } from '@/lib/shop/use-catalog';
import SectionHeading from './SectionHeading';

const WRAP = 'mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-5';

/** A tile's picture: the desk's image, else the bottles its link points at on a themed ground. */
function TileVisual({
  block,
  products,
  fallback,
  sizes,
  seed = 0,
}: {
  block: StorefrontBlock;
  products: CatalogProduct[];
  fallback: CatalogProduct[];
  sizes: string;
  /** Rotates the fallback so neighbouring tiles do not show the same three bottles. */
  seed?: number;
}) {
  if (block.imageUrl) {
    return <Image src={block.imageUrl} alt="" fill sizes={sizes} className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />;
  }
  const shift = fallback.length ? (seed * 3) % fallback.length : 0;
  const rotated = [...fallback.slice(shift), ...fallback.slice(0, shift)];
  const bottles = bottlesForHref(block.href, products, rotated, 3);
  return (
    <div className={`absolute inset-0 ${THEME_CLASSES[block.theme].bg}`}>
      <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:18px_18px]" />
      <div className="absolute inset-x-0 bottom-0 flex h-[82%] items-end justify-center gap-2 transition-transform duration-700 group-hover:scale-[1.04]">
        {bottles.map((p, i) => (
          <div key={p.slug} className={`relative overflow-hidden rounded-t-full bg-white shadow-xl ${i === 1 ? 'h-full w-[28%]' : 'h-[80%] w-[24%]'}`}>
            <Image src={p.image!} alt="" fill sizes="200px" className="object-contain p-2 pt-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** "Our highlights" — two large and several small tiles, alternating like an editorial spread. */
export function HighlightsMosaic({ blocks, products }: { blocks: StorefrontBlock[]; products: CatalogProduct[] }) {
  if (blocks.length === 0) return null;
  const fallback = products.filter((p) => p.image && p.featured);
  // Pattern per row of three columns: wide + narrow, then narrow + wide.
  const wide = (i: number) => i % 4 === 0 || i % 4 === 3;
  return (
    <section className={`${WRAP} py-14 sm:py-20`}>
      <SectionHeading title="Our highlights" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((b, i) => {
          const href = safeHref(b.href) || '/shop';
          return (
            <Link key={b.id} href={href} className={`group block ${wide(i) ? 'lg:col-span-2' : ''}`}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/11] lg:aspect-auto lg:h-[380px]">
                <TileVisual block={b} products={products} fallback={fallback} seed={i} sizes={wide(i) ? '(min-width:1024px) 66vw, 100vw' : '(min-width:1024px) 33vw, 100vw'} />
              </div>
              <h3 className="mt-4 font-serif text-xl font-light text-obsidian group-hover:underline group-hover:underline-offset-4 sm:text-2xl">{b.title}</h3>
              {b.subtitle && <p className="mt-1 text-sm text-obsidian/60">{b.subtitle}</p>}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const WORDMARK_STYLES = [
  'font-serif text-[1.65rem] italic tracking-tight text-obsidian',
  'font-logo text-lg font-normal uppercase tracking-[0.28em] text-obsidian',
  'font-sans text-xl font-black uppercase tracking-[0.04em] text-ember',
  'font-serif text-xl uppercase tracking-[0.18em] text-obsidian',
  'font-sans text-2xl font-light tracking-tight text-palm',
  'font-logo text-lg font-light uppercase tracking-[0.32em] text-obsidian/80',
];

/** Houses we stock, set as typographic wordmarks (we do not hold their logo files). */
export function BrandStrip({ brands }: { brands: HomeBrand[] }) {
  if (brands.length === 0) return null;
  return (
    <section className="border-y border-obsidian/[0.06] bg-white">
      <div className={`${WRAP} py-14 sm:py-16`}>
        <SectionHeading
          title="Shop by brand"
          intro="Cognac, Scotch, Champagne and tequila — the houses Nigeria asks for by name."
          href="/brands"
          linkLabel="All brands"
        />
        <ul className="grid grid-cols-2 items-center gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((b, i) => (
            <li key={b.slug} className="text-center">
              <Link href={`/brands/${b.slug}`} className="group inline-flex flex-col items-center">
                <span className={`${WORDMARK_STYLES[i % WORDMARK_STYLES.length]} transition-opacity group-hover:opacity-70`}>{b.name}</span>
                <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-obsidian/35">
                  {b.count} bottle{b.count === 1 ? '' : 's'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The service Convivia24 has that a bottle shop does not. */
export function PartyPlannerBand() {
  const steps = [
    ['Tell us the guest count', 'From an intimate dinner to a 300-guest owambe.'],
    ['Set your budget', 'We balance spirits, Champagne, mixers and ice to it.'],
    ['We deliver the night', 'One order, split payment with friends if you like.'],
  ];
  return (
    <section className={`${WRAP} py-6`}>
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(118deg,#0a0a0a_0%,#2a0e0c_45%,#8B2A22_100%)] px-6 py-12 text-white sm:px-12 lg:px-16 lg:py-16">
        <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-saffron/20 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-saffron">Party Planner</p>
            <h2 className="mt-3 font-serif text-[2rem] font-light leading-tight sm:text-5xl">Hosting? We&apos;ll build the bar.</h2>
            <p className="mt-4 max-w-md text-white/70">
              Weddings, birthdays, owambes, office parties — get a complete drinks plan in two minutes.
            </p>
            <Link href="/party-planner" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-[0.1em] text-obsidian hover:bg-cream">
              Plan my party <ArrowRight size={16} />
            </Link>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map(([t, d], i) => (
              <li key={t} className="rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/10 backdrop-blur">
                <span className="font-serif text-3xl text-saffron">{i + 1}</span>
                <p className="mt-2 font-semibold">{t}</p>
                <p className="mt-1 text-sm text-white/60">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** "Get inspired" — guides, quizzes and campaigns from the desk. */
export function EditorialGrid({ blocks, products }: { blocks: StorefrontBlock[]; products: CatalogProduct[] }) {
  if (blocks.length === 0) return null;
  const fallback = products.filter((p) => p.image);
  return (
    <section className={`${WRAP} py-14 sm:py-20`}>
      <SectionHeading title="Get inspired" />
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {blocks.map((b, i) => {
          const href = safeHref(b.href) || '/discover';
          return (
            <Link key={b.id} href={href} className="group grid grid-cols-[40%_1fr] items-start gap-4 sm:gap-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <TileVisual block={b} products={products} fallback={fallback} sizes="240px" seed={i} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-light leading-snug text-obsidian group-hover:underline group-hover:underline-offset-4 sm:text-[1.4rem]">{b.title}</h3>
                {b.subtitle && <p className="mt-2 text-[15px] leading-relaxed text-obsidian/65">{b.subtitle}</p>}
                {b.ctaLabel && (
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ember">
                    {b.ctaLabel} <ArrowRight size={14} />
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Real published reviews — never invented. Hidden until there are some worth showing. */
export function ReviewsWall({ data }: { data: { reviews: HomeReview[]; average: number; count: number } }) {
  if (data.reviews.length < 2) return null;
  return (
    <section className="bg-shell">
      <div className={`${WRAP} py-14 sm:py-20`}>
        <SectionHeading title="What people are saying" />
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-row items-center gap-4 lg:flex-col lg:items-start">
            <p className="font-serif text-6xl font-light text-obsidian">{data.average.toFixed(1)}</p>
            <div>
              <Stars value={data.average} size={20} />
              <p className="mt-1.5 text-sm text-obsidian/60">
                from {data.count.toLocaleString('en-NG')} review{data.count === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <ul className="-mx-3 flex snap-x gap-4 overflow-x-auto px-3 pb-2 scrollbar-hide lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
            {data.reviews.slice(0, 8).map((r) => (
              <li key={r.id} className="w-[78%] shrink-0 snap-start rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:w-[45%] lg:w-auto">
                <Stars value={r.rating} size={14} />
                <p className="mt-3 line-clamp-5 text-[15px] leading-relaxed text-obsidian/80">“{r.body}”</p>
                <div className="mt-4 flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-lilac text-[11px] font-bold text-obsidian">{initials(r.authorName)}</span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-sm font-semibold text-obsidian">
                      {r.authorName}
                      {r.verifiedBuyer && <BadgeCheck size={14} className="text-palm" aria-label="Verified buyer" />}
                    </p>
                    <Link href={`/shop/${r.slug}`} className="block truncate text-xs text-obsidian/50 hover:text-ember">
                      on {r.productName}
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Why buy here — the four questions Nigerian shoppers ask before paying for a bottle online. */
export function TrustStrip() {
  // Every claim must be one the shop operates (see ProductAssurances) — no thresholds or windows.
  const items = [
    { icon: ShieldCheck, title: 'Original bottles', body: 'Every order carries a scan-to-verify code you can check yourself.' },
    { icon: Truck, title: 'Delivery across Nigeria', body: 'Supported areas in Lagos, Abuja, Port Harcourt and more — with order tracking.' },
    { icon: CreditCard, title: 'Secure checkout', body: 'Encrypted payments through Flutterwave. Gift cards accepted.' },
    { icon: MessageCircle, title: 'Dedicated support', body: 'Questions about an order? Our team is here to help.' },
  ];
  return (
    <section className="border-t border-obsidian/[0.06] bg-white">
      <ul className={`${WRAP} grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4`}>
        {items.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-shell">
              <Icon size={22} className="text-ember" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-semibold text-obsidian">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-obsidian/60">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
