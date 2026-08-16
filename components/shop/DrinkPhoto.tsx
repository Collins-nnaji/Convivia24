import DrinkPlaceholder from '@/components/shop/DrinkPlaceholder';
import type { DrinkProduct } from '@/lib/drinks/catalog';

type Props = {
  product: Pick<DrinkProduct, 'name' | 'category' | 'image' | 'packImages'>;
  className?: string;
  watermark?: boolean;
};

export default function DrinkPhoto({ product, className = '', watermark = true }: Props) {
  const pack = product.packImages?.filter(Boolean) ?? [];

  if (pack.length >= 2) {
    const count = Math.min(4, pack.length);
    return (
      <div className={`relative bg-[#f4efe8] ${className}`}>
        <div
          className={`absolute inset-1 grid gap-1 ${
            count === 3 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-2 grid-rows-2'
          }`}
        >
          {pack.slice(0, count).map((src, i) => (
            <div
              key={`${src}-${i}`}
              className={`relative overflow-hidden bg-white ${count === 3 && i === 0 ? 'row-span-2' : ''}`}
            >
              <img src={src} alt="" className="absolute inset-0 h-full w-full object-contain p-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (product.image) {
    return (
      <div className={`relative bg-white ${className}`}>
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-contain object-center p-3 sm:p-4"
        />
      </div>
    );
  }

  return (
    <DrinkPlaceholder
      category={product.category}
      name={product.name}
      className={className}
      watermark={watermark}
    />
  );
}
