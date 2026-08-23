'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, MapPin, X } from 'lucide-react';
import { getDrinkBySlug } from '@/lib/drinks/catalog';
import type { ProductInfoPayload } from '@/lib/drinks/product-info';

type Props = {
  slug: string;
  brand?: string;
  className?: string;
  size?: 'sm' | 'md';
};

export default function DrinkInfoButton({ slug, brand, className = '', size = 'sm' }: Props) {
  const product = getDrinkBySlug(slug);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<ProductInfoPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    fetch(`/api/shop/product-info?slug=${encodeURIComponent(slug)}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || 'No guide yet');
        setInfo(data as ProductInfoPayload);
      })
      .catch((e) => {
        setInfo(null);
        setError(e instanceof Error ? e.message : 'Could not load guide');
      })
      .finally(() => setLoading(false));

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.body.classList.add('drink-info-modal-open');
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('drink-info-modal-open');
      document.body.style.overflow = '';
    };
  }, [open, slug]);

  const iconSize = size === 'md' ? 18 : 14;
  const btnClass =
    size === 'md'
      ? 'inline-flex items-center justify-center w-9 h-9 rounded-full border border-obsidian/15 bg-white text-obsidian/50 hover:text-ember hover:border-ember/40 transition-colors shadow-sm'
      : 'inline-flex items-center justify-center w-7 h-7 rounded-full border border-obsidian/10 bg-white/95 text-obsidian/40 hover:text-ember hover:border-ember/30 transition-colors shadow-sm';

  const displayName = info?.name || product?.name || slug;
  const brandName = info?.brand || brand || product?.brand;

  const modal =
    open &&
    createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6"
        role="presentation"
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-obsidian/75 backdrop-blur-[2px]" aria-hidden />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`drink-info-${slug}`}
          className="relative z-[10000] w-full sm:max-w-md max-h-[85dvh] overflow-hidden flex flex-col border border-obsidian/15 shadow-2xl sm:rounded-sm"
          style={{ backgroundColor: '#ffffff' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-obsidian/10 shrink-0" style={{ backgroundColor: '#ffffff' }}>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-ember mb-1">Bottle guide</p>
              <h2 id={`drink-info-${slug}`} className="font-semibold text-obsidian leading-snug">
                {displayName}
              </h2>
              {brandName && <p className="text-xs text-obsidian/45 mt-0.5">{brandName}</p>}
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="shrink-0 p-2 rounded-full bg-paper text-obsidian/50 hover:text-obsidian"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto px-5 py-4 space-y-5 flex-1" style={{ backgroundColor: '#ffffff' }}>
            {loading && <p className="text-sm text-obsidian/50">Loading…</p>}
            {!loading && error && <p className="text-sm text-obsidian/55">{error}</p>}
            {!loading && info?.tasteNote && (
              <section>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/35 mb-2">
                  Tastes like
                </p>
                <p className="text-sm text-obsidian/75 leading-relaxed">{info.tasteNote}</p>
              </section>
            )}
            {!loading && info?.brandGuide && (
              <section>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/35 mb-2">
                  About {info.brandGuide.name}
                </p>
                {(info.brandGuide.origin || info.brandGuide.founded) && (
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-obsidian/45 mb-2">
                    <MapPin size={12} />
                    {[info.brandGuide.origin, info.brandGuide.founded && `est. ${info.brandGuide.founded}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
                {info.brandGuide.history && (
                  <p className="text-sm text-obsidian/75 leading-relaxed mb-2">{info.brandGuide.history}</p>
                )}
                {info.brandGuide.style && (
                  <p className="text-[12px] text-obsidian/55">
                    <span className="font-semibold text-obsidian/65">Style — </span>
                    {info.brandGuide.style}
                  </p>
                )}
              </section>
            )}
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <button
        type="button"
        aria-label="Bottle details — taste and brand story"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={`${btnClass} ${className}`}
      >
        <Info size={iconSize} />
      </button>
      {modal}
    </>
  );
}
