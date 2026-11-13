import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetail from '@/components/shop/ProductDetail';
import { publishedProduct } from '@/lib/inventory';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await publishedProduct(slug);
  if (!product) {
    return { title: 'Drink not found' };
  }
  const description =
    product.description ||
    product.tagline ||
    `Order ${product.name} for parties, clubs, and lounges on Convivia24. Delivery in supported areas across Nigeria. 18+.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: absoluteUrl(`/shop/${product.slug}`) },
    openGraph: {
      title: `${product.name} | Convivia24`,
      description,
      url: absoluteUrl(`/shop/${product.slug}`),
    },
  };
}

export default async function ShopProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await publishedProduct(slug);
  if (!product) notFound();

  // Product rich result: price, stock and rating in search results.
  const live = product as typeof product & { available?: number; rating?: number; ratingCount?: number };
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.tagline,
    ...(product.image && /^https?:/.test(product.image) ? { image: product.image } : product.image ? { image: absoluteUrl(product.image) } : {}),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    sku: product.slug,
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/shop/${product.slug}`),
      priceCurrency: 'NGN',
      price: product.priceNgn,
      availability:
        typeof live.available === 'number' && live.available <= 0
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      areaServed: { '@type': 'Country', name: 'Nigeria' },
    },
    ...(live.ratingCount && live.rating
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: live.rating.toFixed(1), reviewCount: live.ratingCount } }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped cannot break out of the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProductDetail product={product} />
    </>
  );
}
