'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useCart } from '@/components/cart/CartProvider';
import {
  formatNgn,
  MOOD_LABELS,
  TRACK_LABELS,
  type AbvTrack,
  type RitualKit,
} from '@/lib/rituals/catalog';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

export default function KitDetail({ kit }: { kit: RitualKit }) {
  const { addKit } = useCart();
  const router = useRouter();
  const [track, setTrack] = useState<AbvTrack>(kit.track);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addKit(kit.slug, track);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addKit(kit.slug, track);
    router.push('/checkout');
  }

  const trackOptions: AbvTrack[] =
    kit.track === 'zero' ? ['zero'] : kit.track === 'spirit' ? ['spirit', 'zero'] : ['mixed', 'spirit', 'zero'];

  return (
    <>
      <section className="relative min-h-[70vh] bg-obsidian flex items-end overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          <img src={kit.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/55 to-obsidian/25" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pb-16 pt-32 w-full">
          <Link
            href="/rituals"
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-cream/50 hover:text-cream mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> All rituals
          </Link>
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp}>
              <SectionLabel>
                {MOOD_LABELS[kit.mood]} · {TRACK_LABELS[kit.track]}
              </SectionLabel>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-7xl font-light italic text-cream leading-[0.92] mb-4 max-w-3xl"
            >
              {kit.name}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-cream/65 max-w-xl mb-6">
              {kit.tagline}
            </motion.p>
            <motion.p variants={fadeUp} className="font-display text-3xl italic text-gold">
              {formatNgn(kit.priceNgn)}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-14">
          <div className="lg:col-span-7 space-y-12">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-dark/60 mb-4">The story</p>
              <p className="font-display text-2xl sm:text-3xl italic text-obsidian leading-snug">{kit.story}</p>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-dark/60 mb-4">Serve the ritual</p>
              <ol className="space-y-3">
                {kit.serveSteps.map((step, i) => (
                  <li key={step} className="flex gap-4 text-sm text-obsidian/70 leading-relaxed">
                    <span className="font-display text-xl italic text-gold-dark shrink-0 w-6">{String(i + 1).padStart(2, '0')}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-dark/60 mb-4">In the kit</p>
              <ul className="divide-y divide-obsidian/10 border-y border-obsidian/10">
                {kit.items.map((item) => (
                  <li key={item.name} className="py-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <div>
                      <p className="text-obsidian font-medium">{item.name}</p>
                      <p className="text-xs text-obsidian/45">{item.role}</p>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-obsidian/40">
                      {item.abv === 'spirit' ? 'Spirit' : item.abv === 'zero' ? 'Zero-proof' : 'Mixer'}
                      {item.canSwapTo ? ` · swap: ${item.canSwapTo}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6 border border-obsidian/10 bg-white/60 p-6 sm:p-8">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-obsidian/50">
                <span>Serves {kit.serves}</span>
                <span>{kit.timeOfDay}</span>
                <span>Ships Lagos</span>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-3">
                  Your track
                </p>
                <div className="flex flex-wrap gap-2">
                  {trackOptions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTrack(t)}
                      className={`px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-colors ${
                        track === t ? 'bg-obsidian text-cream' : 'border border-obsidian/15 text-obsidian/50'
                      }`}
                    >
                      {TRACK_LABELS[t]}
                    </button>
                  ))}
                </div>
                {kit.zeroProofAlt && track === 'zero' && (
                  <p className="mt-3 text-xs text-obsidian/50 leading-relaxed">{kit.zeroProofAlt}</p>
                )}
              </div>

              <div className="space-y-2 text-sm text-obsidian/60">
                <p>
                  <span className="text-obsidian/40 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">Glassware</span>
                  {kit.glassware}
                </p>
                <p>
                  <span className="text-obsidian/40 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">Playlist</span>
                  {kit.playlistCue}
                </p>
                {kit.snackPairing && (
                  <p>
                    <span className="text-obsidian/40 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">Pairing</span>
                    {kit.snackPairing}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
              >
                Buy now <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-obsidian/20 text-obsidian text-[11px] font-black uppercase tracking-[0.2em] hover:border-obsidian/40 transition-colors"
              >
                {added ? 'Added to tonight' : 'Add to tonight'}
              </button>
              <Link
                href="/cart"
                className="block text-center text-[11px] font-black uppercase tracking-[0.2em] text-obsidian/45 hover:text-obsidian transition-colors"
              >
                View cart
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
