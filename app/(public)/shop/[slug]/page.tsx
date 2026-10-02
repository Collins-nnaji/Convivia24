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
    `Order ${product.name} for parties, clubs, and lounges on Convivia24. Delivery in Lagos, Abuja, and Port Harcourt. 18+.`;
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
  return <ProductDetail product={product} />;
}
