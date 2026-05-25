'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Copy, Check } from 'lucide-react';
import type { InsightBlock, InsightPost } from '@/lib/insights/types';
import { CATEGORY_META } from '@/lib/insights/types';
import { InsightsNav } from './InsightsNav';
import { InsightCard } from './InsightCard';

const easeOut = [0.16, 1, 0.3, 1] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function BlockRenderer({
  block,
  index,
  h2Index,
}: {
  block: InsightBlock;
  index: number;
  h2Index?: number;
}) {
  switch (block.type) {
    case 'p':
      return (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, delay: index * 0.02, ease: easeOut }}
          className="text-neutral-600 text-lg leading-[1.75] mb-6"
        >
          {block.text}
        </motion.p>
      );
    case 'h2':
      return (
        <motion.h2
          id={h2Index !== undefined ? `section-${h2Index}` : undefined}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 mt-14 mb-6 tracking-tight scroll-mt-28"
        >
          {block.text}
        </motion.h2>
      );
    case 'quote':
      return (
        <motion.blockquote
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="my-12 pl-6 sm:pl-8 border-l-4 border-gold py-2"
        >
          <p className="font-display text-2xl sm:text-3xl italic text-neutral-800 leading-snug">
            &ldquo;{block.text}&rdquo;
          </p>
          {block.attribution && (
            <cite className="mt-4 block text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 not-italic">
              — {block.attribution}
            </cite>
          )}
        </motion.blockquote>
      );
    case 'stat':
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="my-12 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 sm:p-10 text-center"
        >
          <p className="font-display text-5xl sm:text-6xl font-bold text-gold">{block.value}</p>
          <p className="mt-2 text-[11px] font-black uppercase tracking-[0.3em] text-white/50">
            {block.label}
          </p>
        </motion.div>
      );
    case 'list':
      return (
        <motion.ul
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="my-8 space-y-3"
        >
          {block.items.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: easeOut }}
              className="flex gap-3 text-neutral-600 text-base sm:text-lg leading-relaxed"
            >
              <span className="text-gold font-black shrink-0 mt-1">→</span>
              {item}
            </motion.li>
          ))}
        </motion.ul>
      );
    case 'callout':
      return (
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="my-12 rounded-2xl border border-gold/30 bg-gold/10 p-6 sm:p-8"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-2">
            {block.title}
          </p>
          <p className="text-neutral-700 leading-relaxed">{block.body}</p>
        </motion.aside>
      );
    default:
      return null;
  }
}

export function InsightArticleView({
  post,
  related,
}: {
  post: InsightPost;
  related: InsightPost[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const scaleX = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 120, damping: 28 });

  const meta = CATEGORY_META[post.category];
  const headings = post.blocks.filter(b => b.type === 'h2');

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      /* ignore */
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f8f6f2] text-neutral-900">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gold origin-left z-[60]"
        style={{ scaleX }}
      />

      <InsightsNav backHref="/insights" />

      {/* Article hero */}
      <header
        className={`relative pt-14 min-h-[min(70vh,640px)] flex flex-col justify-end
                    bg-gradient-to-br ${post.accent} overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-[0.12] landing-grain" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20 pt-28 w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="flex flex-wrap items-center gap-3 mb-8"
          >
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={12} />
              All signals
            </Link>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
              Issue {post.issue}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/90">
              {meta.label}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: easeOut }}
            className="font-display text-[clamp(2rem,5.5vw,3.75rem)] font-bold text-white leading-[1.05] tracking-tight"
          >
            {post.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16, ease: easeOut }}
            className="mt-6 text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl"
          >
            {post.dek}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/50"
          >
            <span>{formatDate(post.publishedAt)}</span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {post.readMinutes} min read
            </span>
            <span>
              {post.author.name} · {post.author.role}
            </span>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              {copied ? <Check size={12} className="text-gold" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </motion.div>
        </div>
      </header>

      {/* Body + sidebar */}
      <div className="max-w-6xl mx-auto px-5 sm:px-10 py-16 sm:py-20">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_220px] gap-12 lg:gap-16">
          <article className="min-w-0 max-w-3xl lg:max-w-none mx-auto lg:mx-0 w-full">
            <div className="flex flex-wrap gap-2 mb-12">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-white border border-neutral-200 text-[9px] font-black uppercase tracking-widest text-neutral-500"
                >
                  {tag}
                </span>
              ))}
            </div>

            {post.blocks.map((block, i) => {
              const h2Index =
                block.type === 'h2'
                  ? post.blocks.slice(0, i).filter(b => b.type === 'h2').length
                  : undefined;
              return <BlockRenderer key={i} block={block} index={i} h2Index={h2Index} />;
            })}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-16 pt-10 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-1">
                  Written by
                </p>
                <p className="font-bold text-neutral-900">{post.author.name}</p>
                <p className="text-sm text-neutral-500">{post.author.role}</p>
              </div>
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-neutral-900 text-white
                           text-[11px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors"
              >
                Talk to our team <ArrowRight size={14} />
              </Link>
            </motion.div>
          </article>

          {headings.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-neutral-400 mb-4">
                  On this page
                </p>
                <ul className="space-y-3 border-l border-neutral-200 pl-4">
                  {headings.map((h, i) =>
                    h.type === 'h2' ? (
                      <li key={i}>
                        <a
                          href={`#section-${i}`}
                          className="text-sm text-neutral-500 hover:text-gold-dark transition-colors line-clamp-2"
                          onClick={e => {
                            e.preventDefault();
                            document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          {h.text}
                        </a>
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="px-5 sm:px-10 py-16 sm:py-20 bg-white border-t border-neutral-100">
          <div className="max-w-6xl mx-auto">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gold-dark mb-3">
              More signals
            </p>
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-10">Keep reading</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p, i) => (
                <InsightCard key={p.slug} post={p} variant="compact" index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
