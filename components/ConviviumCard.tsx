'use client';

import { motion } from 'framer-motion';

/**
 * Premium member access card — credit-card proportions (ISO/IEC 7810 ID-1,
 * ~1.586:1). Metallic obsidian body with a holographic gold sheen, embossed
 * member line, tier, and contactless chip.
 */
export default function ConviviumCard({
  tier = 'FOUNDING MEMBER',
  name = 'YOUR NAME',
}: {
  tier?: string;
  name?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      whileHover={{ rotateY: 0, rotateX: 0, scale: 1.02 }}
      className="group relative w-full max-w-[360px] mx-auto [transform-style:preserve-3d]"
      style={{ aspectRatio: '1.586 / 1' }}
    >
      <div
        className="relative w-full h-full rounded-[20px] overflow-hidden transition-transform duration-500"
        style={{
          boxShadow:
            '0 30px 60px -18px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,168,76,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
          transform: 'perspective(900px) rotateY(-6deg) rotateX(3deg)',
        }}
      >
        {/* Base metal gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(150deg, #14110b 0%, #221a0e 30%, #0c0c0c 62%, #1c1810 100%)',
          }}
        />

        {/* Holographic gold sweep — animates across on hover */}
        <div
          className="absolute inset-0 opacity-60 transition-transform duration-[1200ms] ease-out -translate-x-1/3 group-hover:translate-x-1/3"
          style={{
            background:
              'linear-gradient(115deg, transparent 30%, rgba(226,201,126,0.18) 45%, rgba(201,168,76,0.35) 50%, rgba(226,201,126,0.18) 55%, transparent 70%)',
          }}
        />

        {/* Soft top-left highlight */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(ellipse 130% 90% at 15% 5%, rgba(226,201,126,0.16) 0%, transparent 55%)',
          }}
        />

        {/* Guilloché-style fine lines */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'repeating-radial-gradient(circle at 80% 120%, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 9px)',
          }}
        />

        {/* Top gold edge */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.35) 20%, rgba(226,201,126,0.9) 50%, rgba(201,168,76,0.35) 80%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-7">
          {/* Top: tier + brand mark */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gold/70 mb-1">The Convivium</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cream/85">{tier}</p>
            </div>
            <img
              src="/convivia24.png"
              alt=""
              className="h-5 w-auto opacity-90"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>

          {/* Middle: chip + contactless */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-9 rounded-md bg-gradient-to-br from-amber-200/30 to-amber-800/40 border border-amber-400/25 flex items-center justify-center shadow-inner">
              <div className="grid grid-cols-3 gap-[2px] w-8 h-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-[1px] bg-amber-300/30" />
                ))}
              </div>
            </div>
            <div className="flex items-end gap-[3px] h-5">
              {[8, 12, 16, 20].map((h) => (
                <div key={h} className="w-[3px] rounded-full bg-cream/30" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>

          {/* Bottom: name + card no + validity */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 tracking-[0.3em] text-cream/85 font-mono text-[13px] sm:text-[14px]">
              <span>••••</span>
              <span className="text-cream/35">••••</span>
              <span>••••</span>
              <span className="text-gold/90 tracking-widest">2424</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-cream/40 mb-0.5">Member</p>
                <p className="text-cream/95 text-[13px] font-semibold tracking-[0.15em]">{name}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-cream/40 mb-0.5">Member Since</p>
                <p className="text-cream/80 text-[11px] font-medium tracking-wider">2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reflected glow beneath */}
      <div className="absolute -z-10 -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-10 rounded-[50%] bg-gold/20 blur-2xl opacity-70" />
    </motion.div>
  );
}
