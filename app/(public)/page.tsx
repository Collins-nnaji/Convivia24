import type { Metadata } from 'next';
import HeroCarousel from '@/components/storefront/HeroCarousel';
import HandpickedGrid from '@/components/storefront/HandpickedGrid';
import InspirationPanel from '@/components/storefront/InspirationPanel';
import ProductRail from '@/components/storefront/ProductRail';
import TonightEvents from '@/components/storefront/TonightEvents';
import {
  BrandStrip,
  EditorialGrid,
  HighlightsMosaic,
  PartyPlannerBand,
  ReviewsWall,
  TrustStrip,
} from '@/components/storefront/HomeSections';
import { getHomeData } from '@/lib/storefront/home';
import { eventsEnabled } from '@/lib/features';
import { absoluteUrl } from '@/lib/seo';

// Merchandising is edited live in the desk; the data layer caches in Redis, so render per request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl('/') },
};

/**
 * Storefront home. Every section is driven by the desk: hero/highlights/editorial from
 * Storefront, Handpicked from each bottle's Featured flag, Best sellers from real orders.
 */
export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <h1 className="sr-only">Convivia24 — drinks delivered across Nigeria</h1>
      <HeroCarousel slides={data.content.hero} products={data.products} />
      <HandpickedGrid products={data.handpicked} />
      <InspirationPanel products={data.products} />
      <HighlightsMosaic blocks={data.content.highlight} products={data.products} />
      <BrandStrip brands={data.brands} />
      <ProductRail
        title="Best sellers"
        intro="What Nigeria has been ordering this season."
        href="/shop?sort=best-selling"
        products={data.bestSellers}
      />
      <PartyPlannerBand />
      {eventsEnabled && <TonightEvents />}
      <EditorialGrid blocks={data.content.editorial} products={data.products} />
      <ReviewsWall data={data.reviews} />
      <TrustStrip />
    </>
  );
}
