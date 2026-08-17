'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import ConviviumCard from '@/components/ConviviumCard';

/**
 * Marketing showcase of the Guest Card in the landing hero. Deliberately a
 * dummy card — no personal data, no claim form. The real card lives in the
 * cart and on /card once someone is signed in.
 */
export default function HeroGuestCard() {
  return (
    <div className="w-full max-w-[420px] mx-auto md:mx-0">
      <motion.div
        initial={{ opacity: 0, y: 16, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        whileHover={{ y: -4 }}
        aria-hidden
      >
        <ConviviumCard kind="loyalty" tier="RESIDENT" name="YOUR NAME" points={8400} />
      </motion.div>

      <p className="mt-4 text-sm text-obsidian/60 flex items-start gap-1.5">
        <Sparkles size={14} className="text-ember shrink-0 mt-0.5" />
        <span>
          The Guest Card — points on every order, RSVP and review, then shop discounts and perks at partner rooms.
        </span>
      </p>
      <Link
        href="/card"
        className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-wordmark-sm text-ember hover:gap-2.5 transition-all"
      >
        See the card <ArrowRight size={12} />
      </Link>
    </div>
  );
}
