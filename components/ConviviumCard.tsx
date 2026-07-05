'use client';

import { motion } from 'framer-motion';

/**
 * Premium member access card — credit/debit card proportions and styling.
 * Aspect ratio ~1.586:1 (ISO/IEC 7810 ID-1).
 */
export default function ConviviumCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative w-full max-w-[340px] mx-auto"
      style={{ aspectRatio: '1.586 / 1' }}
    >
      {/* Card container — rounded corners, shadow, slight tilt for depth */}
      <div
        className="relative w-full h-full rounded-[18px] overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.15)',
          transform: 'perspective(800px) rotateY(-4deg) rotateX(2deg)',
        }}
      >
        {/* Base gradient — dark obsidian to charcoal with gold tint */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(145deg, #0f0f0f 0%, #1a1510 35%, #0d0d0d 70%, #141210 100%)',
          }}
        />

        {/* Subtle radial highlight (top-left) */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse 120% 80% at 20% 10%, rgba(201,168,76,0.12) 0%, transparent 55%)',
          }}
        />

        {/* Fine line pattern (embossed feel) */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 3px)',
          }}
        />

        {/* Gold accent line (top edge) */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.3) 20%, rgba(201,168,76,0.8) 50%, rgba(201,168,76,0.3) 80%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-7">
          {/* Top row: chip + logo */}
          <div className="flex items-start justify-between">
            {/* Contactless chip */}
            <div className="w-11 h-9 rounded-md bg-gradient-to-br from-amber-200/20 to-amber-900/30 border border-amber-500/20 flex items-center justify-center">
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-amber-400/40"
                    style={{ height: `${12 + i * 4}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Contactless (wave bars) */}
            <div className="flex items-end gap-[3px] h-6">
              {[8, 12, 16, 20].map((h) => (
                <div key={h} className="w-[3px] rounded-full bg-cream/25" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>

          {/* Middle: card number */}
          <div className="flex items-center gap-2 tracking-[0.35em] text-cream/90 font-mono text-[15px] sm:text-[16px] font-medium">
            <span className="tracking-widest">••••</span>
            <span className="text-cream/40">····</span>
            <span className="tracking-widest">••••</span>
            <span className="text-cream/40">····</span>
            <span className="tracking-widest text-gold/90">2424</span>
          </div>

          {/* Bottom row: brand + member + validity */}
          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-gold/70 mb-0.5">
                  The Convivium
                </p>
                <p className="text-cream/95 text-sm font-semibold tracking-wide">MEMBER ACCESS</p>
              </div>
              <img
                src="/convivia24.png"
                alt=""
                className="h-5 w-auto opacity-90"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-cream/40 font-medium tracking-wider">
              <span>LAGOS · ABUJA · LONDON</span>
              <span>VALID</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
