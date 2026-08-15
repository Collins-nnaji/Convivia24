import { notFound } from 'next/navigation';
import ProductDetail from '@/components/shop/ProductDetail';
import { DRINKS, getDrinkBySlug } from '@/lib/drinks/catalog';

export function generateStaticParams() {
  return DRINKS.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const product = getDrinkBySlug(slug);
    return {
      title: product ? `${product.name} | Convivia24` : 'Drink | Convivia24',
      description: product?.tagline,
    };
  });
}

export default async function ShopProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getDrinkBySlug(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
