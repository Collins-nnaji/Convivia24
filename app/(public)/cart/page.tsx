'use client';

import Link from 'next/link';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useCart } from '@/components/cart/CartProvider';
import { formatNgn, TRACK_LABELS, type AbvTrack } from '@/lib/rituals/catalog';

export default function CartPage() {
  const { lines, subtotalNgn, setQty, setPreferTrack, remove } = useCart();

  return (
    <>
      <section className="bg-obsidian -mt-16 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionLabel>Tonight</SectionLabel>
          <h1 className="font-display text-5xl sm:text-6xl italic text-cream">Your cart</h1>
          <p className="mt-3 text-cream/50 text-sm">Lagos delivery · Expert-curated spirit &amp; zero-proof kits</p>
        </div>
      </section>

      <section className="bg-cream py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          {lines.length === 0 ? (
            <div className="max-w-md">
              <p className="font-display text-3xl italic text-obsidian mb-4">Nothing for tonight yet.</p>
              <Link
                href="/rituals"
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-obsidian hover:text-gold-dark"
              >
                Browse rituals <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-12">
              <ul className="lg:col-span-8 space-y-8">
                {lines.map((line) => (
                  <li key={line.slug} className="border-b border-obsidian/10 pb-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <Link
                          href={`/rituals/${line.slug}`}
                          className="font-display text-2xl italic text-obsidian hover:text-gold-dark"
                        >
                          {line.name}
                        </Link>
                        <p className="text-sm text-obsidian/45 mt-1">{formatNgn(line.priceNgn)} each</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(['spirit', 'zero', 'mixed'] as AbvTrack[]).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setPreferTrack(line.slug, t)}
                              className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] ${
                                line.preferTrack === t
                                  ? 'bg-obsidian text-cream'
                                  : 'border border-obsidian/15 text-obsidian/40'
                              }`}
                            >
                              {TRACK_LABELS[t]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-obsidian/15">
                          <button
                            type="button"
                            aria-label="Decrease"
                            className="p-2 text-obsidian/60 hover:text-obsidian"
                            onClick={() => setQty(line.slug, line.qty - 1)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm">{line.qty}</span>
                          <button
                            type="button"
                            aria-label="Increase"
                            className="p-2 text-obsidian/60 hover:text-obsidian"
                            onClick={() => setQty(line.slug, line.qty + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-display text-xl italic w-24 text-right">
                          {formatNgn(line.priceNgn * line.qty)}
                        </p>
                        <button
                          type="button"
                          aria-label="Remove"
                          onClick={() => remove(line.slug)}
                          className="p-2 text-obsidian/30 hover:text-obsidian"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <aside className="lg:col-span-4">
                <div className="border border-obsidian/10 bg-white/50 p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-obsidian/50">Subtotal</span>
                    <span className="font-display text-2xl italic">{formatNgn(subtotalNgn)}</span>
                  </div>
                  <p className="text-xs text-obsidian/40 leading-relaxed">
                    Delivery within Lagos. Age 18+ required for spirit tracks. You&apos;ll confirm address at checkout.
                  </p>
                  <Link
                    href="/checkout"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
                  >
                    Checkout <ArrowRight size={14} />
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
