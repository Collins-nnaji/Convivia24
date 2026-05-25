'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock } from 'lucide-react';
import type { InsightPost } from '@/lib/insights/types';
import { CATEGORY_META } from '@/lib/insights/types';

const easeOut = [0.16, 1, 0.3, 1] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function InsightCard({
  post,
  variant = 'default',
  index = 0,
}: {
  post: InsightPost;
  variant?: 'hero' | 'wide' | 'default' | 'compact';
  index?: number;
}) {
  const meta = CATEGORY_META[post.category];

  const layout = {
    hero: 'col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-2 min-h-[420px] sm:min-h-[480px]',
    wide: 'col-span-1 sm:col-span-2 min-h-[280px]',
    default: 'min-h-[320px]',
    compact: 'min-h-[260px]',
  }[variant];

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: easeOut }}
      className={layout}
    >
      <Link href={`/insights/${post.slug}`} className="group block h-full">
        <div
          className={`relative h-full overflow-hidden rounded-3xl border border-neutral-200/80
                      bg-gradient-to-br ${post.accent} p-6 sm:p-8 flex flex-col justify-between
                      shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]
                      transition-[transform,box-shadow] duration-500
                      group-hover:shadow-[0_28px_60px_-16px_rgba(201,168,76,0.25)]
                      group-hover:-translate-y-1`}
        >
          <div className="absolute inset-0 opacity-[0.07] landing-grain pointer-events-none" />
          <div
            className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-2xl
                       group-hover:scale-125 transition-transform duration-700"
          />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-[9px] font-black uppercase tracking-[0.25em] text-white/90">
                Issue {post.issue}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] text-white/70`}>
                {meta.label}
              </span>
            </div>
            <motion.span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white
                         group-hover:bg-gold group-hover:text-neutral-900 transition-colors duration-300"
              whileHover={{ rotate: 45 }}
            >
              <ArrowUpRight size={18} />
            </motion.span>
          </div>

          <div className="relative z-10 mt-auto pt-10">
            <h2
              className={`font-display font-bold text-white leading-[1.05] tracking-tight
                          ${variant === 'hero' ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-2xl sm:text-3xl'}`}
            >
              {post.title}
            </h2>
            <p
              className={`mt-3 text-white/65 leading-relaxed
                          ${variant === 'hero' ? 'text-base sm:text-lg max-w-xl' : 'text-sm line-clamp-2'}`}
            >
              {post.dek}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/50">
              <span>{formatDate(post.publishedAt)}</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {post.readMinutes} min
              </span>
              <span>{post.author.name}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
