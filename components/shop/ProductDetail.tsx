'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronRight,
  Droplet,
  Heart,
  MapPin,
  Minus,
  Percent,
  Plus,
  QrCode,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Wine,
} from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import ProductGallery from '@/components/shop/ProductGallery';
import ProductReviews from '@/components/shop/ProductReviews';
import ProductAssurances from '@/components/shop/ProductAssurances';
import RelatedProducts from '@/components/shop/RelatedProducts';
import TastingNotesCard from '@/components/shop/TastingNotesCard';
import Stars from '@/components/shop/Stars';
import DrinkInfoButton from '@/components/shop/DrinkInfoButton';
import { useWishlist } from '@/lib/shop/wishlist';
import { productFacts, tastingProfile } from '@/lib/drinks/tasting';
import {
  CATEGORY_LABELS,
  formatNgn,
  relatedDrinks,
  sizeOptionsFor,
  type DrinkProduct,
} from '@/lib/drinks/catalog';
import { BRAND_INFO, TASTE_NOTES } from '@/lib/drinks/brand-guide';

type Tab = 'about' | 'tasting' | 'delivery';

const TABS: [Tab, string][] = [
  ['about', 'About'],
  ['tasting', 'Tasting notes'],
  ['delivery', 'Delivery & returns'],
];

export default function ProductDetail({ product }: { product: DrinkProduct }) {
  const router = useRouter();
  const { addProduct } = useCart();
  const { saved, toggle } = useWishlist(product.slug);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<Tab>('about');
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [shared, setShared] = useState(false);

  const sizes = useMemo(() => sizeOptionsFor(product), [product]);
  const related = useMemo(() => relatedDrinks(product, 3), [product]);
  const facts = productFacts(product.slug);
  const brand = product.brand ? BRAND_INFO[product.brand] : undefined;

  const onSummary = useCallback(
    (summary: { average: number; count: number }) =>
      setRating({ average: summary.average, count: summary.count }),
    []
  );

  function scrollToReviews() {
    document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleAdd() {
    addProduct(product.slug, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  function buyNow() {
    addProduct(product.slug, qty);
    router.push('/cart');
  }

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      /* the shopper dismissed the sheet, or the clipboard is blocked */
    }
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 sm:py-10">
        <Breadcrumb product={product} />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 mt-6">
          <ProductGallery product={product} />

          <div>
            <span className="inline-block px-3 py-1 bg-ember/6 text-ember text-[10px] font-black uppercase tracking-[0.16em]">
              {CATEGORY_LABELS[product.category]}
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold text-obsidian mt-3 flex items-center gap-2 flex-wrap">
              {product.name}
              <DrinkInfoButton slug={product.slug} brand={product.brand} size="md" />
            </h1>

            <div className="mt-2 h-5">
              {rating.count > 0 ? (
                <button type="button" onClick={scrollToReviews} className="inline-flex items-center gap-2 text-sm">
                  <span className="font-semibold tabular-nums">{rating.average.toFixed(1)}</span>
                  <Stars value={rating.average} size={14} />
                  <span className="text-obsidian/45">
                    ({rating.count} review{rating.count === 1 ? '' : 's'})
                  </span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm text-obsidian/35">
                  <Stars value={0} size={14} /> No reviews yet
                </span>
              )}
            </div>

            <p className="text-2xl sm:text-3xl font-bold brand-text mt-4">{formatNgn(product.priceNgn)}</p>
            <p className="text-obsidian/60 leading-relaxed mt-3">{product.tagline}</p>

            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 pt-5 border-t border-obsidian/8">
              <Spec icon={Wine} label={product.volume} />
              {product.abv > 0 && <Spec icon={Percent} label={`${product.abv}% ABV`} />}
              {product.origin && <Spec icon={MapPin} label={product.origin} />}
              {product.servesHint && <Spec icon={Droplet} label={product.servesHint} />}
            </ul>

            <SizeSelector product={product} sizes={sizes} />

            <div className="mt-6 grid sm:grid-cols-[auto_1fr] gap-3 items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-2">
                  Quantity
                </p>
                <div className="flex items-center border border-obsidian/15 bg-white w-fit">
                  <button
                    type="button"
                    aria-label="Decrease"
                    className="p-3 text-obsidian/50 hover:text-obsidian"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold tabular-nums">{qty}</span>
                  <button
                    type="button"
                    aria-label="Increase"
                    className="p-3 text-obsidian/50 hover:text-obsidian"
                    onClick={() => setQty((q) => Math.min(24, q + 1))}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 sm:pt-6">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {added ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="inline-flex items-center gap-2"
                      >
                        <Check size={15} /> Added
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="inline-flex items-center gap-2"
                      >
                        <ShoppingCart size={15} /> Add to cart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <button
                  type="button"
                  onClick={buyNow}
                  className="py-3.5 bg-white border border-ember/40 text-ember text-[11px] font-black uppercase tracking-[0.14em] hover:bg-ember/5 transition-colors"
                >
                  Buy now
                </button>
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-x-5 gap-y-4 mt-7 p-5 bg-white border border-obsidian/8">
              <Promise icon={ShieldCheck} label="Secure payment" detail="Encrypted checkout" />
              <Promise icon={Truck} label="Nationwide delivery" detail="Across Nigeria" />
              <Promise icon={Wine} label="Authentic products" detail="No parallel imports" />
              <Promise icon={QrCode} label="Scan to verify" detail="Every order, checkable" />
            </ul>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                type="button"
                onClick={toggle}
                aria-pressed={saved}
                className={`py-3 border text-[11px] font-black uppercase tracking-[0.12em] inline-flex items-center justify-center gap-2 transition-colors ${
                  saved
                    ? 'border-ember text-ember bg-ember/5'
                    : 'border-obsidian/15 text-obsidian/70 hover:border-ember hover:text-ember'
                }`}
              >
                <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Saved' : 'Add to wishlist'}
              </button>
              <button
                type="button"
                onClick={share}
                className="py-3 border border-obsidian/15 text-obsidian/70 text-[11px] font-black uppercase tracking-[0.12em] inline-flex items-center justify-center gap-2 hover:border-ember hover:text-ember transition-colors"
              >
                <Share2 size={14} /> {shared ? 'Link copied' : 'Share product'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
          <div className="min-w-0">
            <div className="bg-white border border-obsidian/8">
              <div className="flex overflow-x-auto scrollbar-hide border-b border-obsidian/8">
                {TABS.map(([id, label]) => (
                  <span key={id} className="contents">
                    <button
                      type="button"
                      onClick={() => setTab(id)}
                      className={`relative px-5 py-4 text-sm whitespace-nowrap transition-colors ${
                        tab === id ? 'text-obsidian font-semibold' : 'text-obsidian/45 hover:text-obsidian/70'
                      }`}
                    >
                      {label}
                      {tab === id && (
                        <motion.span layoutId="pdp-tab" className="absolute inset-x-4 bottom-0 h-0.5 bg-ember" />
                      )}
                    </button>
                    {/* Reviews keep their own block below, so this jumps to it
                        rather than duplicating the panel. */}
                    {id === 'tasting' && (
                      <button
                        type="button"
                        onClick={scrollToReviews}
                        className="px-5 py-4 text-sm whitespace-nowrap text-obsidian/45 hover:text-obsidian/70 transition-colors"
                      >
                        {rating.count > 0 ? `Reviews (${rating.count})` : 'Reviews'}
                      </button>
                    )}
                  </span>
                ))}
              </div>

              <div className="p-5 sm:p-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    {tab === 'about' && (
                      <div>
                        <p className="text-obsidian/70 leading-relaxed">{product.description}</p>
                        {brand?.history && (
                          <p className="text-obsidian/60 leading-relaxed mt-4">{brand.history}</p>
                        )}
                        {product.includes && product.includes.length > 0 && (
                          <ul className="mt-5 space-y-1.5">
                            {product.includes.map((item) => (
                              <li key={item} className="text-sm text-obsidian/70 flex gap-2">
                                <span className="text-ember">▸</span> {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        {(facts.length > 0 || brand?.founded) && (
                          <ul className="flex flex-wrap gap-2.5 mt-6">
                            {facts.map((fact) => (
                              <li
                                key={fact}
                                className="px-3.5 py-2 bg-paper border border-obsidian/8 text-[12px] text-obsidian/65"
                              >
                                {fact}
                              </li>
                            ))}
                            {brand?.founded && (
                              <li className="px-3.5 py-2 bg-paper border border-obsidian/8 text-[12px] text-obsidian/65">
                                Heritage since {brand.founded}
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    )}

                    {tab === 'tasting' && <TastingPanel product={product} />}

                    {tab === 'delivery' && <DeliveryPanel />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div id="product-reviews" className="mt-6 scroll-mt-24">
              <ProductReviews slug={product.slug} onSummary={onSummary} />
            </div>
          </div>

          <div className="space-y-6">
            <TastingNotesCard slug={product.slug} />
            <RelatedProducts products={related} />
          </div>
        </div>

        <ProductAssurances className="mt-10 sm:mt-14 p-6 sm:p-8 bg-white border border-obsidian/8" />
      </div>
    </section>
  );
}

function Breadcrumb({ product }: { product: DrinkProduct }) {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: CATEGORY_LABELS[product.category], href: `/shop?category=${product.category}` },
  ];
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-[12px] text-obsidian/40 flex-wrap">
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <Link href={crumb.href} className="hover:text-ember transition-colors">
              {crumb.label}
            </Link>
            <ChevronRight size={12} className="text-obsidian/25" />
          </li>
        ))}
        <li className="text-obsidian/70">{product.name}</li>
      </ol>
    </nav>
  );
}

function Spec({ icon: Icon, label }: { icon: typeof Wine; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-obsidian/60">
      <Icon size={14} className="text-ember/70 shrink-0" />
      {label}
    </li>
  );
}

function Promise({ icon: Icon, label, detail }: { icon: typeof Wine; label: string; detail: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon size={16} className="text-ember shrink-0 mt-0.5" />
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-tight">{label}</span>
        <span className="block text-[11px] text-obsidian/45 mt-0.5">{detail}</span>
      </span>
    </li>
  );
}

/**
 * Sizes come from real sibling SKUs. Most bottles are stocked in one volume, so
 * the control usually shows that single size rather than inventing a 50cl.
 */
function SizeSelector({
  product,
  sizes,
}: {
  product: DrinkProduct;
  sizes: { slug: string; volume: string; priceNgn: number }[];
}) {
  return (
    <div className="mt-6">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-2">Select size</p>
      <div className="flex flex-wrap gap-2.5">
        {sizes.map((size) =>
          size.slug === product.slug ? (
            <span key={size.slug} aria-current="true" className="px-5 py-2.5 bg-ember/8 border border-ember/25 text-ember text-sm font-medium">
              {size.volume}
            </span>
          ) : (
            <Link
              key={size.slug}
              href={`/shop/${size.slug}`}
              className="px-5 py-2.5 bg-white border border-obsidian/12 text-sm text-obsidian/65 hover:border-ember hover:text-ember transition-colors"
            >
              {size.volume}
            </Link>
          )
        )}
      </div>
    </div>
  );
}

/**
 * The prose take on how the bottle drinks. The structured colour/nose/palate
 * card sits in the sidebar, so this panel carries what that grid cannot — the
 * house note, the category style, and how to serve it.
 */
function TastingPanel({ product }: { product: DrinkProduct }) {
  const note = TASTE_NOTES[product.slug];
  const brand = product.brand ? BRAND_INFO[product.brand] : undefined;
  const profile = tastingProfile(product.slug);

  if (!note && !brand?.style && !profile) {
    return (
      <p className="text-sm text-obsidian/50">
        We have not written this bottle up yet. The reviews below are the best read on how it drinks.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {note && <p className="text-obsidian/70 leading-relaxed">{note}</p>}

      {/* Only shown when the sidebar card is not already carrying the grid. */}
      {!profile && <TastingNotesCard slug={product.slug} className="bg-transparent border-0" />}

      {brand?.style && (
        <div>
          <h3 className="text-obsidian font-semibold mb-1.5">The category</h3>
          <p>{brand.style}</p>
        </div>
      )}

      <div>
        <h3 className="text-obsidian font-semibold mb-1.5">Serving</h3>
        <p className="text-sm text-obsidian/65 leading-relaxed">{servingHint(product)}</p>
      </div>

      <p className="text-[12px] text-obsidian/40 leading-relaxed">
        Notes are the house profile — what the bottle should smell and taste like served properly. Your own
        take belongs in the reviews.
      </p>
    </div>
  );
}

/** Serving guidance by category — temperature and glass, not a cocktail recipe. */
function servingHint(product: DrinkProduct): string {
  switch (product.category) {
    case 'champagne':
      return 'Serve at 8–10°C in a flute or a white-wine glass. Ice-cold mutes the aromatics; warm flattens the mousse.';
    case 'cognac':
      return 'Neat at room temperature in a tulip glass, or long over a large cube with a mixer. Do not drown it.';
    case 'whisky':
      return 'Neat or with a few drops of water to open it up. Over ice or in a highball if the table is long.';
    case 'wines':
      return 'Whites and sparkling at 8–10°C, reds a touch below room temperature. Open reds early.';
    case 'mixers':
      return 'Serve chilled straight from the fridge — a warm mixer flattens whatever it is cut with.';
    default:
      return 'Serve chilled or over ice. Keep the mixer cold and the glass colder.';
  }
}

function DeliveryPanel() {
  return (
    <div className="space-y-5 text-sm text-obsidian/65 leading-relaxed">
      <div>
        <h3 className="text-obsidian font-semibold mb-1.5">Delivery</h3>
        <p>
          We deliver nationwide across Nigeria. Delivery estimates given at checkout are indicative — give us
          a reachable phone number and an accurate address or venue so the driver can find you. Failed
          attempts may incur a redelivery fee.
        </p>
      </div>
      <div>
        <h3 className="text-obsidian font-semibold mb-1.5">Age check on the door</h3>
        <p>
          Alcohol is sold to adults 18 and over. We may request ID at delivery and can refuse service where
          the law requires it.
        </p>
      </div>
      <div>
        <h3 className="text-obsidian font-semibold mb-1.5">Authenticity</h3>
        <p>
          Every order ships with a Convivia24 authenticity stamp — scan the code on your bottle or receipt to
          confirm it came from us.
        </p>
      </div>
      <p className="text-[12px] text-obsidian/40">
        Full terms, including cancellations and returns, are in our{' '}
        <Link href="/terms-of-use" className="text-ember underline underline-offset-2">
          terms &amp; conditions
        </Link>
        .
      </p>
    </div>
  );
}
