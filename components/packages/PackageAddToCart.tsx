'use client';

import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';

export default function PackageAddToCart({
  slug,
  label = 'Add package to cart',
  showQty = true,
}: {
  slug: string;
  label?: string;
  showQty?: boolean;
}) {
  const { addProduct } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addProduct(slug, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="flex items-center gap-2">
      {showQty && (
        <div className="flex items-center border border-obsidian/15 shrink-0">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="p-2 text-obsidian/50 hover:text-obsidian"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus size={12} />
          </button>
          <span className="w-7 text-center text-xs font-semibold tabular-nums">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="p-2 text-obsidian/50 hover:text-obsidian"
            onClick={() => setQty((q) => Math.min(24, q + 1))}
          >
            <Plus size={12} />
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={handleAdd}
        className="btn-brand flex-1 justify-center text-[11px] py-2.5 inline-flex items-center gap-1.5"
      >
        {added ? (
          <>
            <Check size={13} /> Added
          </>
        ) : (
          label
        )}
      </button>
    </div>
  );
}
