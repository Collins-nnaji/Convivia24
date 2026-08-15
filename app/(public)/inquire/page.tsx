'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

export default function InquirePage() {
  return (
    <>
      <section className="relative min-h-[55vh] bg-obsidian flex items-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(150deg, #14110b 0%, #221a0e 35%, #0a0a0a 70%, #1c1810 100%)',
            }}
          />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-20 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="max-w-xl"
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>Get in touch</SectionLabel>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-6xl italic text-cream leading-tight mb-5"
            >
              How can we help?
            </motion.h1>
            <motion.p variants={fadeUp} className="text-cream/60 leading-relaxed mb-10">
              Convivia is a house of drinks experts. Shop a ritual for tonight, or apply for The Convivium
              membership waitlist.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link
                href="/rituals"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em]"
              >
                Shop rituals <ArrowRight size={14} />
              </Link>
              <Link
                href="/convivium#apply-founding"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-cream/25 text-cream hover:border-gold/50 text-[11px] font-black uppercase tracking-[0.15em]"
              >
                Convivium waitlist
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
